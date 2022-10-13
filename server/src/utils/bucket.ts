import { DeleteObjectCommand, GetObjectCommand, HeadBucketCommand, HeadObjectCommand, ListObjectsCommand, PutObjectCommand, S3Client, _Object } from '@aws-sdk/client-s3'
import { fromIni } from '@aws-sdk/credential-providers'
import { getLogger } from '@/utils/loggers'
import { Feed } from '@/utils/Feed'
import { ReadStream } from 'fs'
import { Readable } from 'stream'

const logger = getLogger('BUCKET')
export const REGION = 'us-west-1'
export const BUCKET_NAME = 'epicast-demoserver-feed1'
export const CREDS_PROFILE = 'epicast-demo'

export function getS3Client(): S3Client {
  return new S3Client({
    region: REGION,
    credentials: fromIni({ profile: CREDS_PROFILE })
  })
}

export class S3Feed implements Feed {
  readonly s3Client = getS3Client()

  private async handleError(description: string): Promise<never> {
    logger.error(description)
    return await Promise.reject(new Error(description))
  }

  async checkConnection(): Promise<void> {
    logger.debug('about to connect to s3')
    const headResponse = await this.s3Client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }))
    if (headResponse.$metadata.httpStatusCode === 200) {
      logger.info(`Connected to: ${BUCKET_NAME}`)
    } else {
      return await this.handleError(`Cannot connect to: ${BUCKET_NAME}`)
    }
  }

  async listObjects(prefix: string): Promise<_Object[]> {
    const listResponse = await this.s3Client.send(new ListObjectsCommand({
      Bucket: BUCKET_NAME,
      Prefix: prefix
    }))
    if (listResponse.$metadata.httpStatusCode === 200) {
      return listResponse.Contents ?? []
    } else {
      return await this.handleError(`List objects for: ${prefix}, ${listResponse.$metadata.httpStatusCode ?? 0}`)
    }
  }

  async putObject(name: string, body: string | ReadStream): Promise<void> {
    const putResponse = await this.s3Client.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: name,
      Body: body
    }))
    if (putResponse.$metadata.httpStatusCode !== 200) {
      return await this.handleError(`put error: ${name}, ${putResponse.$metadata.httpStatusCode ?? 0}`)
    }
  }

  async getObject(name: string): Promise<string> {
    const getResponse = await this.s3Client.send(new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: name
    }))
    if (getResponse.$metadata.httpStatusCode === 200) {
      const readableStream = getResponse.Body as Readable
      let result = ''
      for await (const chunk of readableStream) {
        result += chunk
      }
      return result
    } else {
      return await this.handleError(`get error: ${name}, ${getResponse.$metadata.httpStatusCode ?? 0}`)
    }
  }

  async doesObjectExist(name: string): Promise<boolean> {
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

  async deleteObject(name: string): Promise<void> {
    const deleteResponse = await this.s3Client.send(new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: name
    }))
    if (deleteResponse.$metadata.httpStatusCode !== 204) {
      return await this.handleError(`delete error: ${name}, ${deleteResponse.$metadata.httpStatusCode ?? 0}`)
    }
  }
}
