export interface FeedElement {
  name: string
  type: FeedElementType
  tags: FeedElementTag[]
  memberOfSchemas?: FeedElementSchema[]
  displayName?: string
  description?: string
  codeSet?: string
  valueSet?: string
  validation?: string
}

export type FeedElementType = 'string' | 'number' | 'date' | 'code'
export type FeedElementTag = 'id' | 'updatedAt' | 'eventAt' | 'pii'
export type FeedElementSchema = 'cdc' | 'state'

export function filterElements (elements: FeedElement[], excludeTag: FeedElementTag): FeedElement[] {
  return elements.filter((elem) => !elem.tags.includes(excludeTag))
}
