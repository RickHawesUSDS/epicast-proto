import { StateCaseTimeSeries } from '@/models/StateCaseTimeSeries'
import { Bucket } from '@/models/Bucket'
import { Sequelize } from 'sequelize-typescript'
import { CDCCaseTimeSeries } from '@/models/CDCCaseTimeSeries'
import { FeedSubscriber } from '@/models/FeedSubscriber'

// See for this idea: https://stackoverflow.com/questions/37377731/extend-express-request-object-using-typescript/58788706#58788706
declare global {
  declare namespace Express {
    interface Request {
      db: Sequelize
      stateCaseTimeSeries: StateCaseTimeSeries
      cdcCaseTimeSeries: CDCCaseTimeSeries
      feedSubscriber: FeedSubscriber
      bucket: Bucket
    }
  }
}
