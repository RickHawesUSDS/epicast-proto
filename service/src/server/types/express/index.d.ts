import { AppState } from '@/server/app'
import { CDCCaseTimeSeries } from '@/features/subscribers/CDCCaseTimeSeries'
import { FeedSubscriber } from '@/features/subscribers/FeedSubscriber'

// See for this idea: https://stackoverflow.com/questions/37377731/extend-express-request-object-using-typescript/58788706#58788706
declare global {
  declare namespace Express {
    interface Request {
      state: AppState
      cdcCaseTimeSeries: CDCCaseTimeSeries
      feedSubscriber: FeedSubscriber
    }
  }
}
