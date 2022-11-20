import { StateCaseTimeSeries } from '@/features/senders/StateCaseTimeSeries'
import { FeedBucket } from '@/epicast/FeedBucket'
import { Sequelize } from 'sequelize-typescript'
import { CDCCaseTimeSeries } from '@/features/receivers/CDCCaseTimeSeries'
import { FeedSubscriber } from '@/features/receivers/FeedSubscriber'

// See for this idea: https://stackoverflow.com/questions/37377731/extend-express-request-object-using-typescript/58788706#58788706
declare global {
  declare namespace Express {
    interface Request {
      db: Sequelize
      stateCaseTimeSeries: StateCaseTimeSeries
      cdcCaseTimeSeries: CDCCaseTimeSeries
      feedSubscriber: FeedSubscriber
      bucket: FeedBucket
    }
  }
}
