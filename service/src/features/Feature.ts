import { Router } from 'express'

export enum InitEvent { BEFORE_DB, AFTER_DB, AFTER_ROUTES }

export interface Feature {
  name: string

  // Get the router for this feature
  getRoutes: () => [string, Router]

  // Get the Sequalize tables for this feature
  getModelPaths: () => string[]

  // Called an init event. First AFTER_DB, then AFTER_ROUTES
  init: (after: InitEvent) => Promise<void>

  // Called during a system reset
  reset: () => Promise<void>
}
