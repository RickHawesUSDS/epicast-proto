import { compareDesc, parseISO, formatISO } from 'date-fns'
import { parse, stringify } from 'csv-string'
import { Mutex } from 'async-mutex'

import { StorageObject, FeedStorage } from './FeedStorage'
import { formSnapshotKey, SNAPSHOT_FOLDER, versionFromSnapshotKey } from './feedStorageKeys'
import assert from 'assert'
import { getLogger } from '@/utils/loggers'

const logger = getLogger('SNAPSHOT')

export interface Snapshot {
  readonly version?: number
  readonly createdAt?: Date
  listObjects: (prefix: string) => StorageObject[]
  doesObjectExist: (key: string) => boolean
  getObject: (key: string) => Promise<string>
}

export interface SnapshotMutator {
  putObject: (key: string, value: string) => Promise<void>
  deleteObject: (key: string) => Promise<void>
}

export type MutableSnapshot = Snapshot & SnapshotMutator

export class SnapshotReader implements Snapshot {
  storage: FeedStorage
  stoargeObjects: StorageObject[] = []
  createdAt?: Date
  feedVersion?: number
  readCalled: boolean

  constructor (fromStorage: FeedStorage) {
    this.storage = fromStorage
    this.readCalled = false
  }

  async read (): Promise<void> {
    const mutex = new Mutex()
    await mutex.runExclusive(async () => {
      if (this.readCalled) throw Error('Read must not be called twice')
      this.readCalled = true
      const snapshotObjects = await this.storage.listObjects(SNAPSHOT_FOLDER)
      if (snapshotObjects.length === 0) return
      const lastSnapshotObject = snapshotObjects.sort((a, b) => compareDesc(a.lastModified, b.lastModified))[0]

      this.feedVersion = versionFromSnapshotKey(lastSnapshotObject.key)
      this.createdAt = lastSnapshotObject.lastModified
      const snapshotRaw = await this.storage.getObject(lastSnapshotObject.key, lastSnapshotObject.versionId)
      const rows = parse(snapshotRaw)
      if (rows.length === 0) throw Error('empty snapshot')
      this.stoargeObjects = rows.map((row) => {
        return { key: row[0], versionId: row[1], lastModified: parseISO(row[2]) }
      })
    })
  }

  get version (): number | undefined {
    if (!this.readCalled) throw Error('Read must be called before this method')
    return this.feedVersion
  }

  listObjects (prefix: string): StorageObject[] {
    if (!this.readCalled) throw Error('Read must be called before this method')
    // production code would work to make this search more efficient
    return this.stoargeObjects
      .filter((object) => object.key.startsWith(prefix))
  }

  doesObjectExist (key: string): boolean {
    if (!this.readCalled) throw Error('Read must be called before this method')
    return this.stoargeObjects.findIndex((object) => object.key === key) !== -1
  }

  async getObject (key: string): Promise<string> {
    if (!this.readCalled) throw Error('Read must be called before this method')
    const index = this.stoargeObjects.findIndex((object) => object.key === key)
    if (index === -1) throw Error('Object does not exist')
    const versionId = this.stoargeObjects[index].versionId
    if (versionId === undefined) throw Error('versioning is not enabled on storage or some other error')
    return await this.storage.getObject(key, versionId)
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
    const writtenObject = await this.storage.putObject(key, value)
    const index = this.stoargeObjects.findIndex((object) => object.key === key)
    if (index === -1) {
      this.stoargeObjects.push(writtenObject)
    } else {
      this.stoargeObjects[index] = writtenObject
    }
    this.isModified = true
  }

  async deleteObject (key: string): Promise<void> {
    if (!this.initializedCalled) throw Error('Initialized must be called')
    logger.info(`Delete of object: ${key}`)
    const index = this.stoargeObjects.findIndex((object) => object.key === key)
    if (index !== -1) {
      await this.storage.deleteObject(key)
      this.stoargeObjects.splice(index)
      this.isModified = true
    }
  }

  async publish (): Promise<void> {
    if (!this.isModified) return
    const csv = this.stoargeObjects.map(object => {
      assert(object.versionId !== undefined)
      const values = [object.key, object.versionId, formatISO(object.lastModified)]
      return stringify(values)
    })
    const raw = csv.join('')
    assert(this.feedVersion !== undefined)
    await this.storage.putObject(formSnapshotKey(this.feedVersion), raw)
  }
}
