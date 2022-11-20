import { Router } from "express"
import { Feature, InitEvent } from "../Feature"
import feedRouter from "./feedRoutes"
import { resetStorage } from "./resetStorage"
import { S3Bucket } from "./S3Bucket"

export class FeedsFeature implements Feature {
  bucket = new S3Bucket()

  getRoutes(): [string, Router] {
    return ['feed', feedRouter]
  }

  getModelPaths(): string[] {
    return []
  }

  async init(after: InitEvent): Promise<void> {
    if (after === InitEvent.AFTER_DB) {
      resetStorage(this.bucket)
    }
  }

  async reset(): Promise<void> {
  }
}
