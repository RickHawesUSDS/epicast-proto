import { Client } from "minio"
import { getLogger } from '@/utils/loggers'

const logger = getLogger('BUCKET')
export const BUCKET_NAME = 'state-case-feed1'

export function setupBucket(): void {
  const minioClient = new Client({
    endPoint: '127.0.0.1',
    port: 9000,
    useSSL: false,
    accessKey: 'minioadmin',
    secretKey: 'minioadmin'
  })

  minioClient.bucketExists(BUCKET_NAME, (error, doesExist) => {
    logger.debug(`Bucket exists: ${doesExist}`)
    if (error) {
      logger.error(`Bucket exists error: ${error}`)
      return
    }
    if (doesExist) return
    logger.debug("Create bucket")
    minioClient.makeBucket(BUCKET_NAME, '', (err) => {
      if (err) {
        logger.error(`Bucket create error: ${err}`)
        return
      }
      logger.debug("create bucket success")
    })
  })
}


