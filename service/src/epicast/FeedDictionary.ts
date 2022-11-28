import { parseISO } from 'date-fns'
import { FeedElement } from './FeedElement'

export interface FeedDictionary {
  readonly topic: string
  readonly reporter: string
  readonly validFrom: Date
  readonly namespaces: FeedNamespace[]
  readonly elements: FeedElement[]
}

// Needed because of validFrom is a string in YAML
export interface FeedDictionaryYaml {
  readonly topic: string
  readonly reporter: string
  readonly validFrom: string
  readonly namespaces: FeedNamespace[]
  readonly elements: FeedElement[]
}

export function fromYaml(yaml: FeedDictionaryYaml): FeedDictionary {
  const validFrom = yaml.validFrom
  return { ...yaml, validFrom: parseISO(validFrom)}
}

export interface FeedNamespace {
  readonly namespace: string
  readonly description?: string
  readonly sourceUrl?: string
  // More to be defined later
}

export class MutableFeedDictionary implements FeedDictionary {
  topic: string
  reporter: string
  validFrom: Date
  namespaces: FeedNamespace[]
  elements: FeedElement[]

  constructor (initDictionary: FeedDictionary) {
    this.topic = initDictionary.topic
    this.reporter = initDictionary.topic
    this.validFrom = initDictionary.validFrom
    this.namespaces = initDictionary.namespaces
    this.elements = initDictionary.elements
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
