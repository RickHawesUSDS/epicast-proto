import axios from "axios"

export async function resetSystem() {
  return await axios.post('/api/system/reset')
}

export async function fetchAllStateCases(sortParam) {
  const response = await axios.get('/api/stateCases', { params: { sort: sortParam } })
  return response.data
}

export async function fetchStateCaseDictionary() {
  const response = await axios.get('/api/stateCases/dictionary')
  return response.data
}

export async function addStateCaseElement(element) {
  const response = await axios.put(`/api/stateCases/dictionary/${element.name}`, element)
  return response.data
}

export async function deleteStateCaseElement(name) {
  const response = await axios.delete(`/api/stateCases/dictionary/${name}`)
  return response.data
}

export async function addRandomStateCases(numOfDays, numPerDay) {
  const response = await axios.post(`/api/stateCases/random?numOfDays=${numOfDays}&numPerDay=${numPerDay}`)
  return response.data
}

export async function deduplicateStateCases() {
  const response = await axios.post('/api/stateCases/deduplicate')
  return response.data
}

export async function publishStateCases() {
  const response = await axios.post('/api/stateCases/publish')
  return response.data
}

export async function fetchAllCDCCases(sortParam) {
  const response = await axios.get(`/api/cdcCases?sort=${sortParam}`)
  return response.data
}

export async function fetchCDCCaseDictionary() {
  const response = await axios.get('/api/cdcCases/dictionary')
  return response.data
}

export async function fetchCDCCaseSubscriber() {
  const response = await axios.get('/api/cdcCases/subscriber')
  return response.data
}

export async function readCDCCaseFeed() {
  const response = await axios.post('/api/cdcCases/subscriber/once')
  return response.data
}

export async function setCDCCaseSubscriber(automaticValue) {
  const response = await axios.post('/api/cdcCases/subscriber', { automatic: automaticValue })
  return response.data
}

export async function listFeedMetadata(prefix) {
  const response = await axios.get(`/api/feed/metadata?prefix=${prefix}`)
  return response.data
}

export async function getFeedContent(key) {
  const response = await axios.get(`/api/feed/content?file=${key}`)
  return response.data
}
