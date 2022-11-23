export interface FeedElement {
  name: string
  namespace: string
  type: FeedElementType
  tags: FeedElementTag[]
  multiValued?: boolean
  displayName?: string
  description?: string
  codeSet?: string
  valueSet?: string
  validation?: string
}

export type FeedElementType = 'string' | 'number' | 'date' | 'code'
export type FeedElementTag = 'pii'

export function filterElements (elements: FeedElement[], excludeTag: FeedElementTag): FeedElement[] {
  return elements.filter((elem) => !elem.tags.includes(excludeTag))
}
