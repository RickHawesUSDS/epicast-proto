import { Router } from 'express'
import { Feature } from '../../server/Feature'
import agenciesRouter from './agencyRoutes'
import { MongoTimeSeries, MongoTimeSeriesEvent } from './MongoTimeSeries'
import { MutableTimeSeries } from '@/epicast/TimeSeries'
import { FeedSubscriber } from './FeedSubscriber'
import { initialCASummary, initialAZSummary, initialCDCSummary, initialStateDictionary, initialCommonCaseDictionary } from './agencyModels'
import { AppState } from '@/server/AppState'
import { insertFakeCases } from './insertFakeCases'
import { publishFeed } from '@/epicast/publishFeed'

export interface AgencyModel {
  name: string
  timeSeries: MutableTimeSeries<MongoTimeSeriesEvent>
  subcribers: FeedSubscriber[]
}

export class AgenciesFeature implements Feature {
  name = 'agencies'

  private readonly caTimeSeries = new MongoTimeSeries(initialCASummary, initialStateDictionary)
  private readonly azTimeSeries = new MongoTimeSeries(initialAZSummary, initialStateDictionary)
  private readonly cdcTimeSeries = new MongoTimeSeries(initialCDCSummary, initialCommonCaseDictionary)

  agencies: {
    [key: string]: {
      name: string
      timeSeries: MongoTimeSeries
      subscribers: FeedSubscriber[]
    }
  } = {
      [initialCDCSummary.reporterId]: {
        name: initialCDCSummary.reporterId,
        timeSeries: this.cdcTimeSeries,
        subscribers: []
      },
      [initialCASummary.reporterId]: {
        name: initialCASummary.reporterId,
        timeSeries: this.caTimeSeries,
        subscribers: []
      },
      [initialAZSummary.reporterId]: {
        name: initialAZSummary.reporterId,
        timeSeries: this.azTimeSeries,
        subscribers: []
      }
    }

  getRoutes (): [string, Router] {
    return [this.name, agenciesRouter]
  }

  async init (state: AppState): Promise<void> {
    const storage = state.feedsFeature.feedStorage
    const caSubscriber = new FeedSubscriber(initialCASummary, storage, this.cdcTimeSeries)
    const azSubscriber = new FeedSubscriber(initialAZSummary, storage, this.cdcTimeSeries)

    for (const agencyName in this.agencies) {
      const agency = this.agencies[agencyName]
      await agency.timeSeries.initialize(state.db)

      // Setup subscribers for the CDC
      if (agencyName === initialCDCSummary.reporterId) {
        agency.subscribers = [caSubscriber, azSubscriber]
      }
    }

    if (process.env.NODE_ENV === 'dev') {
      // Initialize AZ
      await insertFakeCases(this.azTimeSeries, 1, 5)
      await publishFeed(storage, this.azTimeSeries, { excludePII: true })
      azSubscriber.startAutomatic()
    }
  }

  async reset (): Promise<void> {
    for (const agencyName in this.agencies) {
      const agencyTimeSeries = this.agencies[agencyName].timeSeries
      await agencyTimeSeries.reset()
    }
  }
}
