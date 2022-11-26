import { DeleteObjectCommand, GetObjectCommand, HeadBucketCommand, HeadObjectCommand, ListObjectsCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { fromIni } from '@aws-sdk/credential-providers'
import { getLogger } from '@/utils/loggers'
import { FeedBucket, BucketObject } from '@/epicast/FeedBucket'
import { ReadStream } from 'fs'
import { Readable } from 'stream'
import { parseISO } from 'date-fns'
import { FileData, FileArray } from 'chonky'
import path from 'path/posix'

const logger = getLogger('BUCKET')
export const REGION = 'us-west-2'
export const BUCKET_NAME = 'epicast-demoserver'
export const CREDS_PROFILE = 'epicast-demo'
export const FEED_FOLDER = 'feed1'

function getS3Client (): S3Client {
  return new S3Client({
    region: REGION,
    credentials: fromIni({ profile: CREDS_PROFILE })
  })
}

export class S3Bucket implements FeedBucket {
  private readonly s3Client = getS3Client()
  readonly folder: string
  readonly bucket = BUCKET_NAME

  constructor (folder: string) {
    this.folder = folder
  }

  private async handleError (description: string): Promise<never> {
    logger.error(description)
    return await Promise.reject(new Error(description))
  }

  async checkConnection (): Promise<void> {
    logger.debug('about to connect to s3')
    const headResponse = await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucket }))
    if (headResponse.$metadata.httpStatusCode === 200) {
      logger.info(`Connected to: ${this.bucket} ${this.folder}`)
    } else {
      return await this.handleError(`Cannot connect to: ${this.bucket}`)
    }
  }

  async listObjects (prefix: string): Promise<BucketObject[]> {
    const listResponse = await this.s3Client.send(new ListObjectsCommand({
      Bucket: this.bucket,
      Prefix: path.join(this.folder, prefix)
    }))
    if (listResponse.$metadata.httpStatusCode === 200) {
      return listResponse.Contents?.map(obj => {
        const lastModified = (obj.LastModified != null) ? parseISO(obj.LastModified.toISOString()) : new Date()
        const key = this.relativeKeyFromKey(obj.Key)
        return { key, lastModified }
      }) ?? []
    } else {
      return await this.handleError(`List objects for: ${prefix}, ${listResponse.$metadata.httpStatusCode ?? 0}`)
    }
  }

  async putObject (name: string, body: string | ReadStream): Promise<BucketObject> {
    logger.debug(`put object: ${name}`)
    const putResponse = await this.s3Client.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: path.join(this.folder, name),
      Body: body
    }))
    if (putResponse.$metadata.httpStatusCode !== 200) {
      return await this.handleError(`put error: ${name}, ${putResponse.$metadata.httpStatusCode ?? 0}`)
    }
    return { key: name, versionId: putResponse.VersionId, lastModified: new Date() }
  }

  async getObject (name: string, versionId?: string): Promise<string> {
    const key = path.join(this.folder, name)
    const getResponse = await this.s3Client.send(new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
      VersionId: versionId
    }))
    if (getResponse.$metadata.httpStatusCode === 200) {
      const readableStream = getResponse.Body as Readable
      let result = ''
      for await (const chunk of readableStream) {
        result = result.concat(chunk.toString())
      }
      return result
    } else {
      return await this.handleError(`get error: ${name}, ${getResponse.$metadata.httpStatusCode ?? 0}`)
    }
  }

  async doesObjectExist (name: string): Promise<boolean> {
    try {
      const headResponse = await this.s3Client.send(new HeadObjectCommand({
        Bucket: this.bucket,
        Key: path.join(this.folder, name)
      }))
      return headResponse.$metadata.httpStatusCode === 200
    } catch (error) {
      return false
    }
  }

  async deleteObject (name: string): Promise<void> {
    logger.debug(`delete object: ${name}`)
    const deleteResponse = await this.s3Client.send(new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: path.join(this.folder, name)
    }))
    if (deleteResponse.$metadata.httpStatusCode !== 204) {
      return await this.handleError(`delete error: ${name}, ${deleteResponse.$metadata.httpStatusCode ?? 0}`)
    }
  }

  async getFileData (prefix: string): Promise<FileArray> {
    const chonkyFiles: FileArray = []
    const fullPrefix = path.join(this.folder, prefix)
    const listResponse = await this.s3Client.send(new ListObjectsCommand({
      Bucket: this.bucket,
      Prefix: fullPrefix,
      Delimiter: '/'
    }))

    if (listResponse.$metadata.httpStatusCode !== 200) return chonkyFiles

    const s3Objects = listResponse.Contents
    const s3Prefixes = listResponse.CommonPrefixes

    if (s3Objects != null) {
      chonkyFiles.push(
        ...s3Objects.map(
          (object): FileData => ({
            id: this.relativeKeyFromKey(object.Key),
            name: path.basename(object.Key ?? ''),
            modDate: object.LastModified,
            size: object.Size
          })
        )
      )
    }

    if (s3Prefixes != null) {
      chonkyFiles.push(
        ...s3Prefixes.map(
          (prefix): FileData => ({
            id: this.relativeKeyFromKey(prefix.Prefix),
            name: path.basename(prefix.Prefix ?? ''),
            isDir: true
          })
        )
      )
    }
    return chonkyFiles
  }

  private relativeKeyFromKey (key?: string): string {
    if (this.folder === '' || key === undefined) {
      return key ?? ''
    } else {
      return key.slice(this.folder.length + 1)
    }
  }
}
