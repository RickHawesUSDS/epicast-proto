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

export function fromYaml (yaml: FeedDictionaryYaml): FeedDictionary {
  const validFrom = yaml.validFrom
  return { ...yaml, validFrom: parseISO(validFrom) }
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
    this.reporter = initDictionary.reporter
    this.validFrom = initDictionary.validFrom
    this.namespaces = initDictionary.namespaces
    this.elements = initDictionary.elements
  }

  addElement (element: FeedElement): boolean {
    const index = this.elements.findIndex(e => e.name === element.name)
    if (index !== -1) return false

    this.validFrom = new Date()
    this.elements.push(element)
    return true
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

  addNamespace (adding: FeedNamespace): boolean {
    const index = this.namespaces.findIndex(n => n.namespace === adding.namespace)
    if (index !== -1) return false

    this.validFrom = new Date()
    this.namespaces.push(adding)
    return true
  }

  deleteNamespace (namespace: string): boolean {
    const index = this.namespaces.findIndex(n => n.namespace === namespace)
    if (index === -1) return false

    this.validFrom = new Date()
    const copy = [...this.namespaces]
    copy.splice(index, 1)
    this.namespaces = copy
    return true
  }
}
