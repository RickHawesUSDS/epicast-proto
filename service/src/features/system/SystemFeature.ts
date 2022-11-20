import { Router } from "express"
import { Feature, InitEvent } from "../Feature"
import systemRoutes from './systemRoutes'

export class SystemFeature implements Feature {
  getRoutes(): [string, Router] {
    return ['system', systemRoutes]
  }

  getModelPaths(): string[] {
    return []
  }

  init(after: InitEvent): void {
  }

  reset(): void {
  }
}
