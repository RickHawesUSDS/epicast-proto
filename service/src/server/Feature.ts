import { AppState } from './AppState'
import { Router } from 'express'

export interface Feature {
  name: string

  // Get the router for this feature
  getRoutes: () => [string, Router]

  // Called once during app initialization
  init: (state: AppState) => Promise<void>

  // Called during a system reset
  reset: (state: AppState) => Promise<void>
}
