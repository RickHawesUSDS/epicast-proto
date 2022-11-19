import { DeleteObjectCommand, GetObjectCommand, HeadBucketCommand, HeadObjectCommand, ListObjectsCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { fromIni } from '@aws-sdk/credential-providers'
import { getLogger } from '@/utils/loggers'
import { FeedBucket, BucketObject } from '@/models/FeedBucket'
import { ReadStream } from 'fs'
import { Readable } from 'stream'
import { parseISO } from 'date-fns'
import path from 'path'
import { FileData, FileArray } from 'chonky'

const logger = getLogger('BUCKET')
export const REGION = 'us-west-1'
export const BUCKET_NAME = 'epicast-demoserver-feed1'
export const CREDS_PROFILE = 'epicast-demo'

function getS3Client (): S3Client {
  return new S3Client({
    region: REGION,
    credentials: fromIni({ profile: CREDS_PROFILE })
  })
}

export class S3Bucket implements FeedBucket {
  private readonly s3Client = getS3Client()

  name = BUCKET_NAME

  private async handleError (description: string): Promise<never> {
    logger.error(description)
    return await Promise.reject(new Error(description))
  }

  async checkConnection (): Promise<void> {
    logger.debug('about to connect to s3')
    const headResponse = await this.s3Client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }))
    if (headResponse.$metadata.httpStatusCode === 200) {
      logger.info(`Connected to: ${BUCKET_NAME}`)
    } else {
      return await this.handleError(`Cannot connect to: ${BUCKET_NAME}`)
    }
  }

  async listObjects (prefix: string): Promise<BucketObject[]> {
    const listResponse = await this.s3Client.send(new ListObjectsCommand({
      Bucket: BUCKET_NAME,
      Prefix: prefix
    }))
    if (listResponse.$metadata.httpStatusCode === 200) {
      return listResponse.Contents?.map(obj => {
        const lastModified = (obj.LastModified != null) ? parseISO(obj.LastModified.toISOString()) : new Date()
        return { key: obj.Key ?? '', lastModified }
      }) ?? []
    } else {
      return await this.handleError(`List objects for: ${prefix}, ${listResponse.$metadata.httpStatusCode ?? 0}`)
    }
  }

  async putObject (name: string, body: string | ReadStream): Promise<BucketObject> {
    logger.debug(`put object: ${name}`)
    const putResponse = await this.s3Client.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: name,
      Body: body
    }))
    if (putResponse.$metadata.httpStatusCode !== 200) {
      return await this.handleError(`put error: ${name}, ${putResponse.$metadata.httpStatusCode ?? 0}`)
    }
    return { key: name, versionId: putResponse.VersionId, lastModified: new Date() }
  }

  async getObject (name: string, versionId?: string): Promise<string> {
    const getResponse = await this.s3Client.send(new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: name,
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
        Bucket: BUCKET_NAME,
        Key: name
      }))
      return headResponse.$metadata.httpStatusCode === 200
    } catch (error) {
      return false
    }
  }

  async deleteObject (name: string): Promise<void> {
    logger.debug(`delete object: ${name}`)
    const deleteResponse = await this.s3Client.send(new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: name
    }))
    if (deleteResponse.$metadata.httpStatusCode !== 204) {
      return await this.handleError(`delete error: ${name}, ${deleteResponse.$metadata.httpStatusCode ?? 0}`)
    }
  }

  async getFileData (prefix: string): Promise<FileArray> {
    const chonkyFiles: FileArray = []
    const listResponse = await this.s3Client.send(new ListObjectsCommand({
      Bucket: BUCKET_NAME,
      Prefix: prefix === '/' ? '' : prefix,
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
