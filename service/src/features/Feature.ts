import { Router } from 'express'

export enum InitEvent { AFTER_DB, AFTER_ROUTES }

export interface Feature {
  // Get the router for this feature
  getRoutes: () => [string, Router]

  // Get the Sequalize tables for this feature
  getModelPaths: () => string[]

  // Called an init event. First AFTER_DB, then AFTER_ROUTES
  init: (after: InitEvent) => Promise<void>

  // Called during a system reset
  reset: () => Promise<void>
}
