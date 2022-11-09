import { FeedElement } from './FeedElement'

export interface FeedSchema {
  readonly epicastVersion: number
  readonly subjectId: string
  readonly reporterId: string
  readonly feedId: string
  readonly validFrom: Date
  readonly elements: FeedElement[]
}

export class MutableFeedSchema implements FeedSchema {
  epicastVersion: number
  subjectId: string
  reporterId: string
  feedId: string
  validFrom: Date
  elements: FeedElement[]

  constructor (initSchema: FeedSchema) {
    this.epicastVersion = initSchema.epicastVersion
    this.subjectId = initSchema.subjectId
    this.reporterId = initSchema.reporterId
    this.feedId = initSchema.feedId
    this.validFrom = initSchema.validFrom
    this.elements = initSchema.elements
  }

  addElement (element: FeedElement): boolean {
    this.validFrom = new Date()
    const copy = [...this.elements]
    const index = this.elements.findIndex(e => e.name === element.name)
    if (index === -1) {
      copy.push(element)
    } else {
      copy[index] = element
    }
    this.elements = copy
    return index === -1
  }

  deleteElement (name: string): boolean {
    const index = this.elements.findIndex(e => e.name === name)
    if (index === -1) return false

    const copy = [...this.elements]
    copy.splice(index, 1)
    this.elements = copy
    this.validFrom = new Date()
    return true
  }
}
