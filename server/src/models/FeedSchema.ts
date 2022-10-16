import { FeedElement } from "./FeedElement"

export interface FeedSchema {
  epicastVersion: number
  organizationId: string
  systemId: string
  feedId: string
  validFrom: Date
  elements: FeedElement[]
}


