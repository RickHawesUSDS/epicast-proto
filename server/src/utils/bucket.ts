import { HeadBucketCommand, S3Client } from "@aws-sdk/client-s3";
import { fromIni } from "@aws-sdk/credential-providers"
import { getLogger } from '@/utils/loggers'

const logger = getLogger('BUCKET')
export const REGION = 'us-west-1'
export const BUCKET_NAME = 'epicast-demoserver-feed1'
export const CREDS_PROFILE = 'epicast-demo'

export function getS3Client(): S3Client {
  return new S3Client({
    region: REGION,
    credentials: fromIni({profile: CREDS_PROFILE})
  })
}

export async function checkBucket(): Promise<void> {
  const s3Client = getS3Client()

  logger.debug('about to connect to s3')
  const headResponse = await s3Client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME}))
  if (headResponse.$metadata.httpStatusCode == 200) {
    logger.info(`Connected to: ${BUCKET_NAME}`)
  } else {
    logger.error(`Cannot connect to: ${BUCKET_NAME}`)
  }
}


