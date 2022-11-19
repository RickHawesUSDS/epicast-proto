import { compareDesc, parseISO, formatISO } from 'date-fns'
import { parse, stringify } from 'csv-string'

import { BucketObject, FeedBucket } from './FeedBucket'
import { formSnapshotKey, SNAPSHOT_FOLDER, versionFromSnapshotKey } from './feedBucketKeys'
import assert from 'assert'
import { getLogger } from '@/utils/loggers'

const logger = getLogger('SNAPSHOT')

export interface Snapshot {
  readonly name: string
  readonly version?: number
  readonly createdAt?: Date
  listObjects: (prefix: string) => BucketObject[]
  doesObjectExist: (key: string) => boolean
  getObject: (key: string) => Promise<string>
}

export interface SnapshotMutator {
  putObject: (key: string, value: string) => Promise<void>
  deleteObject: (key: string) => Promise<void>
}

export type MutableSnapshot = Snapshot & SnapshotMutator

export class SnapshotReader implements Snapshot {
  bucket: FeedBucket
  bucketObjects: BucketObject[] = []
  createdAt?: Date
  feedVersion?: number
  readCalled: boolean

  constructor (fromBucket: FeedBucket) {
    this.bucket = fromBucket
    this.readCalled = false
  }

  async read (): Promise<void> {
    // TODO: mutex is called for here
    if (this.readCalled) throw Error('Read must not be called twice')
    this.readCalled = true
    const snapshotObjects = await this.bucket.listObjects(SNAPSHOT_FOLDER)
    if (snapshotObjects.length === 0) return
    const lastSnapshotObject = snapshotObjects.sort((a, b) => compareDesc(a.lastModified, b.lastModified))[0]

    this.feedVersion = versionFromSnapshotKey(lastSnapshotObject.key)
    this.createdAt = lastSnapshotObject.lastModified
    const snapshotRaw = await this.bucket.getObject(lastSnapshotObject.key, lastSnapshotObject.versionId)
    const rows = parse(snapshotRaw)
    if (rows.length === 0) throw Error('empty snapshot')
    this.bucketObjects = rows.map((row) => {
      return { key: row[0], versionId: row[1], lastModified: parseISO(row[2]) }
    })
  }

  get name (): string {
    return this.bucket.name
  }

  get version (): number | undefined {
    if (!this.readCalled) throw Error('Read must be called before this method')
    return this.feedVersion
  }

  listObjects (prefix: string): BucketObject[] {
    if (!this.readCalled) throw Error('Read must be called before this method')
    // production code would work to make this search more efficient
    return this.bucketObjects
      .filter((object) => object.key.startsWith(prefix))
  }

  doesObjectExist (key: string): boolean {
    if (!this.readCalled) throw Error('Read must be called before this method')
    return this.bucketObjects.findIndex((object) => object.key === key) !== -1
  }

  async getObject (key: string): Promise<string> {
    if (!this.readCalled) throw Error('Read must be called before this method')
    const index = this.bucketObjects.findIndex((object) => object.key === key)
    if (index === -1) throw Error('Object does not exist')
    const versionId = this.bucketObjects[index].versionId
    if (versionId === undefined) throw Error('versioning is not enabled on bucket or some other error')
    return await this.bucket.getObject(key, versionId)
  }
}

// Dev Note: Caller must ensure only one writer at a time.
export class SnapshotWriter extends SnapshotReader implements MutableSnapshot {
  initializedCalled = false
  isModified = false

  async initialize (): Promise<void> {
    await super.read()
    if (this.feedVersion !== undefined) {
      this.feedVersion = this.feedVersion + 1
    } else {
      this.feedVersion = 1
    }
    this.initializedCalled = true
    this.isModified = false
  }

  async putObject (key: string, value: string): Promise<void> {
    if (!this.initializedCalled) throw Error('Initialized must be called')
    logger.info(`Put of object: ${key}`)
    const writtenObject = await this.bucket.putObject(key, value)
    const index = this.bucketObjects.findIndex((object) => object.key === key)
    if (index === -1) {
      this.bucketObjects.push(writtenObject)
    } else {
      this.bucketObjects[index] = writtenObject
    }
    this.isModified = true
  }

  async deleteObject (key: string): Promise<void> {
    if (!this.initializedCalled) throw Error('Initialized must be called')
    logger.info(`Delete of object: ${key}`)
    const index = this.bucketObjects.findIndex((object) => object.key === key)
    if (index !== -1) {
      await this.bucket.deleteObject(key)
      this.bucketObjects.splice(index)
      this.isModified = true
    }
  }

  async publish (): Promise<void> {
    if (!this.isModified) return
    const csv = this.bucketObjects.map(object => {
      assert(object.versionId !== undefined)
      const values = [object.key, object.versionId, formatISO(object.lastModified)]
      return stringify(values)
    })
    const raw = csv.join('')
    assert(this.feedVersion !== undefined)
    await this.bucket.putObject(formSnapshotKey(this.feedVersion), raw)
  }
}
