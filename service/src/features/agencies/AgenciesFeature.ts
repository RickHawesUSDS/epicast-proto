import { Router } from 'express'
import { Feature, InitEvent } from '../../server/Feature'
import agenciesRouter from './agencyRoutes'
import { MongoTimeSeries, MongoTimeSeriesEvent } from './MongoTimeSeries'
import { MutableTimeSeries } from '@/epicast/TimeSeries'
import { FeedSubscriber } from './FeedSubscriber'
import { initialCASummary, initialAZSummary, initialCDCSummary, initialCaseDictionary } from './agencyModels'
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

  private readonly caTimeSeries = new MongoTimeSeries('ca_cases', initialCASummary, initialCaseDictionary)
  private readonly azTimeSeries = new MongoTimeSeries('az_cases', initialAZSummary, initialCaseDictionary)
  private readonly cdcTimeSeries = new MongoTimeSeries('cdc_cases', initialCDCSummary, initialCaseDictionary)

  private readonly caSubscriber = new FeedSubscriber(this.caTimeSeries.summary, this.cdcTimeSeries)
  private readonly azSubscriber = new FeedSubscriber(this.azTimeSeries.summary, this.cdcTimeSeries)

  agencies: {
    [key: string]: {
      name: string
      timeSeries: MongoTimeSeries
      subscribers: FeedSubscriber[]
    }
  } = {
      [initialCDCSummary.reporter]: {
        name: initialCDCSummary.reporter,
        timeSeries: this.cdcTimeSeries,
        subscribers: [this.caSubscriber, this.azSubscriber]
      },
      [initialCASummary.reporter]: {
        name: initialCASummary.reporter,
        timeSeries: this.caTimeSeries,
        subscribers: []
      },
      [initialAZSummary.reporter]: {
        name: initialAZSummary.reporter,
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
      insertFakeCases(this.azTimeSeries, 1, 5)
      publishFeed(state.feedsFeature.storage, this.azTimeSeries)
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
