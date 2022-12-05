import axios from "axios"

export async function resetSystem() {
  return await axios.post('/api/system/reset')
}

export async function fetchAllStateCases(sortParam) {
  const response = await axios.get('/api/agencies/cphd.ca.gov', { params: { sort: sortParam } })
  return response.data
}

export async function fetchStateCaseDictionary() {
  const response = await axios.get('/api/agencies/cphd.ca.gov/dictionary')
  return response.data
}

export async function addStateCaseElement(element) {
  const response = await axios.put(`/api/agencies/cphd.ca.gov/dictionary/${element.name}`, element)
  return response.data
}

export async function deleteStateCaseElement(name) {
  const response = await axios.delete(`/api/agencies/cphd.ca.gov/dictionary/${name}`)
  return response.data
}

export async function addRandomStateCases(numOfDays, numPerDay) {
  const response = await axios.post(`/api/agencies/cphd.ca.gov/random?numOfDays=${numOfDays}&numPerDay=${numPerDay}`)
  return response.data
}

export async function deduplicateStateCases() {
  const response = await axios.post('/api/agencies/cphd.ca.gov/deduplicate')
  return response.data
}

export async function publishStateCases() {
  const response = await axios.post('/api/agencies/cphd.ca.gov/publish')
  return response.data
}

export async function fetchAllCDCCases(sortParam) {
  const response = await axios.get(`/api/agencies/cdc.gov?sort=${sortParam}`)
  return response.data
}

export async function fetchCDCCaseDictionary() {
  const response = await axios.get('/api/agencies/cdc.gov/dictionary')
  return response.data
}

export async function fetchCDCCaseSubscriber() {
  const response = await axios.get('/api/agencies/cdc.gov/subscribers/cases.cphd.ca.gov')
  return response.data
}

export async function readCDCCaseFeed() {
  const response = await axios.post('/api/agencies/cdc.gov/subscribers/cases.cphd.ca.gov/read')
  return response.data
}

export async function setCDCCaseSubscriber(automaticValue) {
  const response = await axios.post('/api/agencies/cdc.gov/subscribers/cases.cphd.ca.gov', { automatic: automaticValue })
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
