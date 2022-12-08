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
  return { ...yaml, validFrom: parseISO(validFrom) }
}

export interface FeedNamespace {
  readonly namespace: string
  readonly description?: string
  readonly sourceUrl?: string
  // More to be defined later
}


