import { FeedDictionary, MutableFeedDictionary } from "./FeedDictionary";

export function mergeDictionaries(reporter: string, dictionaries: FeedDictionary[]): FeedDictionary {
  if (dictionaries.length === 0) throw Error('expected to merge at least one dictionary')

  const result = new MutableFeedDictionary(dictionaries[0])
  for (const otherDictionary of dictionaries.slice(1)) {
    for (const element of otherDictionary.elements) {
      result.addElement(element)
    }
    for (const namespace of otherDictionary.namespaces) {
      result.addNamespace(namespace)
    }
  }
  result.reporter = reporter
  return result
}
