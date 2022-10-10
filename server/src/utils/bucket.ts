import { GetObjectCommand, HeadBucketCommand, ListObjectsCommand, PutObjectCommand, S3Client, _Object } from "@aws-sdk/client-s3";
import { fromIni } from "@aws-sdk/credential-providers"
import { getLogger } from '@/utils/loggers'
import { FeedInterface } from '@/utils/FeedInterface'

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

export class S3Feed implements FeedInterface {
  readonly s3Client = getS3Client()
  constructor() {
  }

  private handleError(description: string): Promise<never> {
      logger.error(description)
      return Promise.reject(new Error(description))
  }

  async checkConnection(): Promise<void> {
    logger.debug('about to connect to s3')
    const headResponse = await this.s3Client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }))
    if(headResponse.$metadata.httpStatusCode == 200) {
      logger.info(`Connected to: ${BUCKET_NAME}`)
    } else {
      return this.handleError(`Cannot connect to: ${BUCKET_NAME}`)
    }
  }

  async listObjects(prefix: string): Promise<_Object[]> {
    const listResponse = await this.s3Client.send(new ListObjectsCommand({
      Bucket: BUCKET_NAME,
      Prefix: prefix,
    }))
    if (listResponse.$metadata.httpStatusCode == 200) {
      return listResponse.Contents ?? []
    } else {
      return this.handleError(`List objects for: ${prefix}, ${listResponse.$metadata.httpStatusCode}`)
    }
  }

  async putObject(name: string, body: Blob): Promise<void> {
    const putResponse = await this.s3Client.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: name,
      Body: body
    }))
    if (putResponse.$metadata.httpStatusCode == 200) {
    } else {
      return this.handleError(`put error: ${name}, ${putResponse.$metadata.httpStatusCode}`)
    }
  }

  async getObject(name: string): Promise<Blob> {
    const getResponse = await this.s3Client.send(new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: name
    }))
    if (getResponse.$metadata.httpStatusCode == 200) {
      return getResponse?.Body as Blob ?? Promise.reject(Error("no body"))
    } else {
      return this.handleError(`get error: ${name}, ${getResponse.$metadata.httpStatusCode}`)
    }
  }

  async deleteObject(name: string): Promise<void> {
    const deleteResponse = await this.s3Client.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: name
    }))
    if (deleteResponse.$metadata.httpStatusCode == 200) {
    } else {
      return this.handleError(`delete error: ${name}, ${deleteResponse.$metadata.httpStatusCode}`)
    }
  }
}


