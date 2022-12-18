import { SystemFeature } from '../features/system/SystemFeature'
import { FeedsFeature } from '../features/feeds/FeedsFeature'
import { AgenciesFeature } from '@/features/agencies/AgenciesFeature'
import { Db } from 'mongodb'
import { S3Client } from '@aws-sdk/client-s3'

// The application state is put into every request to share with the request
export interface AppState {
  db: Db
  s3Client: S3Client
  systemFeature: SystemFeature
  feedsFeature: FeedsFeature
  agenciesFeature: AgenciesFeature
}
