import { DeleteObjectCommand, GetObjectCommand, HeadBucketCommand, HeadObjectCommand, ListObjectsCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { fromIni } from '@aws-sdk/credential-providers'
import { getLogger } from '@/utils/loggers'
import { FeedStorage, StorageObject } from '@/epicast/FeedStorage'
import { ReadStream } from 'fs'
import { Readable } from 'stream'
import { parseISO } from 'date-fns'
import { FileData, FileArray } from './FileArray'
import path from 'path/posix'

const logger = getLogger('STORAGE')
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

export class S3Storage implements FeedStorage {
  private readonly s3Client = getS3Client()
  readonly bucket = BUCKET_NAME
  readonly uri = `s3://${this.bucket}`

  private async handleError (description: string): Promise<never> {
    logger.error(description)
    return await Promise.reject(new Error(description))
  }

  async checkConnection (): Promise<void> {
    logger.debug('about to connect to s3')
    const headResponse = await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucket }))
    if (headResponse.$metadata.httpStatusCode === 200) {
      logger.info(`Connected to: ${this.bucket}`)
    } else {
      return await this.handleError(`Cannot connect to: ${this.bucket}`)
    }
  }

  async listObjects (prefix: string): Promise<StorageObject[]> {
    const listResponse = await this.s3Client.send(new ListObjectsCommand({
      Bucket: this.bucket,
      Prefix: prefix
    }))
    if (listResponse.$metadata.httpStatusCode === 200) {
      return listResponse.Contents?.map(obj => {
        const lastModified = (obj.LastModified != null) ? parseISO(obj.LastModified.toISOString()) : new Date()
        const key = obj.Key ?? ''
        return { key, lastModified }
      }) ?? []
    } else {
      return await this.handleError(`List objects for: ${prefix}, ${listResponse.$metadata.httpStatusCode ?? 0}`)
    }
  }

  async putObject (name: string, body: string | ReadStream): Promise<StorageObject> {
    logger.debug(`put object: ${name}`)
    const putResponse = await this.s3Client.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: name,
      Body: body
    }))
    if (putResponse.$metadata.httpStatusCode !== 200) {
      return await this.handleError(`put error: ${name}, ${putResponse.$metadata.httpStatusCode ?? 0}`)
    }
    return { key: name, versionId: putResponse.VersionId, lastModified: new Date() }
  }

  async getObject (key: string, versionId?: string): Promise<string> {
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
      return await this.handleError(`get error: ${key}, ${getResponse.$metadata.httpStatusCode ?? 0}`)
    }
  }

  async doesObjectExist (key: string): Promise<boolean> {
    try {
      const headResponse = await this.s3Client.send(new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key
      }))
      return headResponse.$metadata.httpStatusCode === 200
    } catch (error) {
      return false
    }
  }

  async deleteObject (key: string): Promise<void> {
    logger.debug(`delete object: ${key}`)
    const deleteResponse = await this.s3Client.send(new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key
    }))
    if (deleteResponse.$metadata.httpStatusCode !== 204) {
      return await this.handleError(`delete error: ${key}, ${deleteResponse.$metadata.httpStatusCode ?? 0}`)
    }
  }

  formUrl (name: string): string {
    return path.join(this.bucket, name)
  }

  async getFileData (prefix: string): Promise<FileArray> {
    const chonkyFiles: FileArray = []
    const fixedUpPrefix = prefix === '/' ? '' : prefix
    const listResponse = await this.s3Client.send(new ListObjectsCommand({
      Bucket: this.bucket,
      Prefix: fixedUpPrefix,
      Delimiter: '/'
    }))

    if (listResponse.$metadata.httpStatusCode !== 200) return chonkyFiles

    const s3Objects = listResponse.Contents
    const s3Prefixes = listResponse.CommonPrefixes

    if (s3Objects != null) {
      chonkyFiles.push(
        ...s3Objects.map(
          (object): FileData => ({
            id: object.Key ?? '',
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
            id: prefix.Prefix ?? '',
            name: path.basename(prefix.Prefix ?? ''),
            isDir: true
          })
        )
      )
    }
    return chonkyFiles
  }
}
