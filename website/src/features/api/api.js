import axios from "axios"

export async function resetSystem() {
  return await axios.post('/api/system/reset')
}

export async function fetchAllStateCases(sortParam) {
  const response = await axios.get('/api/agencies/gov.ca.cphd', { params: { sort: sortParam } })
  return response.data
}

export async function fetchStateCaseDictionary() {
  const response = await axios.get('/api/agencies/gov.ca.cphd/dictionary')
  return response.data
}

export async function addStateCaseElement(element) {
  const response = await axios.put(`/api/agencies/gov.ca.cphd/dictionary/${element.name}`, element)
  return response.data
}

export async function deleteStateCaseElement(name) {
  const response = await axios.delete(`/api/agencies/gov.ca.cphd/dictionary/${name}`)
  return response.data
}

export async function addRandomStateCases(numOfDays, numPerDay) {
  const response = await axios.post(`/api/agencies/gov.ca.cphd/random?numOfDays=${numOfDays}&numPerDay=${numPerDay}`)
  return response.data
}

export async function deduplicateStateCases() {
  const response = await axios.post('/api/agencies/gov.ca.cphd/deduplicate')
  return response.data
}

export async function publishStateCases() {
  const response = await axios.post('/api/agencies/gov.ca.cphd/publish')
  return response.data
}

export async function fetchAllCDCCases(sortParam) {
  const response = await axios.get(`/api/agencies/gov.cdc?sort=${sortParam}`)
  return response.data
}

export async function fetchCDCCaseDictionary() {
  const response = await axios.get('/api/agencies/gov.cdc/dictionary')
  return response.data
}

export async function fetchCDCCaseSubscriber() {
  const response = await axios.get('/api/agencies/gov.cdc/subscriber')
  return response.data
}

export async function readCDCCaseFeed() {
  const response = await axios.post('/api/agencies/gov.cdc/subscriber/once')
  return response.data
}

export async function setCDCCaseSubscriber(automaticValue) {
  const response = await axios.post('/api/agencies/gov.cdc/subscriber', { automatic: automaticValue })
  return response.data
}

export async function listFeedMetadata(prefix) {
  const response = await axios.get(`/api/feeds/metadata?prefix=${prefix}`)
  return response.data
}

export async function getFeedContent(key) {
  const response = await axios.get(`/api/feeds/content?file=${key}`)
  return response.data
}
