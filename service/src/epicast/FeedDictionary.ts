import { FeedElement } from './FeedElement'

export interface FeedDictionary {
  readonly epicastVersion: number
  readonly subjectId: string
  readonly reporterId: string
  readonly topicId: string
  readonly validFrom: Date
  readonly namespaces: FeedNamespace[]
  readonly elements: FeedElement[]
}

export interface FeedNamespace {
  readonly namespace: string
  readonly displayName?: string
  readonly description?: string
  readonly sourceUrl?: string
  // More to be defined later
}

export class MutableFeedDictionary implements FeedDictionary {
  epicastVersion: number
  subjectId: string
  reporterId: string
  topicId: string
  validFrom: Date
  namespaces: FeedNamespace[]
  elements: FeedElement[]

  constructor (initSchema: FeedDictionary) {
    this.epicastVersion = initSchema.epicastVersion
    this.subjectId = initSchema.subjectId
    this.reporterId = initSchema.reporterId
    this.topicId = initSchema.topicId
    this.validFrom = initSchema.validFrom
    this.namespaces = initSchema.namespaces
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
