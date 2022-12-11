import { Router } from 'express'
import { Feature, InitEvent } from '../../server/Feature'
import agenciesRouter from './agencyRoutes'
import { MongoTimeSeries, MongoTimeSeriesEvent } from './MongoTimeSeries'
import { MutableTimeSeries } from '@/epicast/TimeSeries'
import { FeedSubscriber } from './FeedSubscriber'
import { initialCASummary, initialAZSummary, initialCDCSummary, initialStateDictionary, initialCommonCaseDictionary } from './agencyModels'
import { AppState } from '@/server/app'
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

  private readonly caSubscriber = new FeedSubscriber(this.caTimeSeries.summary, this.cdcTimeSeries)
  private readonly azSubscriber = new FeedSubscriber(this.azTimeSeries.summary, this.cdcTimeSeries)

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
        subscribers: [this.caSubscriber, this.azSubscriber]
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

  async init (during: InitEvent, state: AppState): Promise<void> {
    if (during === InitEvent.AFTER_DB) {
      for (const agencyName in this.agencies) {
        const agency = this.agencies[agencyName]
        for (const subscriber of agency.subscribers) {
          subscriber.setStorage(state.feedsFeature.storage)
        }
        if (state.db !== undefined) {
          await agency.timeSeries.initialize(state.db)
        }
      }
    }
    if (during === InitEvent.AFTER_ROUTES) {
      // Initialize AZ
      await insertFakeCases(this.azTimeSeries, 1, 5)
      await publishFeed(state.feedsFeature.storage, this.azTimeSeries, { excludePII: true })
      this.azSubscriber.startAutomatic()

      // Initialize CA
      this.caSubscriber.stopAutomatic()
    }
  }

  async reset (): Promise<void> {
    for (const agencyName in this.agencies) {
      const agencyTimeSeries = this.agencies[agencyName].timeSeries
      await agencyTimeSeries.reset()
    }
  }
}
