import { S3Client } from '@aws-sdk/client-s3'
import { fromIni } from '@aws-sdk/credential-providers'

export function getS3Client (): S3Client {
  if (process.env.S3_REGION === undefined) throw new Error('Missing S3_REGION .env variable')
  if (process.env.S3_CREDS_PROFILE === undefined) throw new Error('Missing S3_CREDS_PROFILE .env variable')
  return new S3Client({
    region: process.env.S3_REGION,
    credentials: fromIni({ profile: process.env.S3_CREDS_PROFILE })
  })
}
