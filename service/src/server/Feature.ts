import { AppState } from './app'
import { Router } from 'express'

export enum InitEvent { AFTER_DB, AFTER_ROUTES }

export interface Feature {
  name: string

  // Get the router for this feature
  getRoutes: () => [string, Router]

  // Called an init event. First BEFORE_DB, AFTER_DB, then AFTER_ROUTES
  init: (during: InitEvent, state: AppState) => Promise<void>

  // Called during a system reset
  reset: () => Promise<void>
}
