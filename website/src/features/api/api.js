import axios from "axios"

export async function resetSystem() {
  return await axios.post('/api/system/reset')
}

export async function fetchAllStateCases(sortParam, agency) {
  const response = await axios.get(`/api/agencies/${agency}`, { params: { sort: sortParam } })
  return response.data
}

export async function fetchStateCaseDictionary(agency) {
  const response = await axios.get(`/api/agencies/${agency}/dictionary`)
  return response.data
}

export async function addStateCaseElement(element, agency) {
  const response = await axios.put(`/api/agencies/${agency}/dictionary/${element.name}`, element)
  return response.data
}

export async function deleteStateCaseElement(name, agency) {
  const response = await axios.delete(`/api/agencies/${agency}/dictionary/${name}`)
  return response.data
}

export async function addRandomStateCases(numOfDays, numPerDay, agency) {
  const response = await axios.post(`/api/agencies/${agency}/random?numOfDays=${numOfDays}&numPerDay=${numPerDay}`)
  return response.data
}

export async function deduplicateStateCases(agency) {
  const response = await axios.post(`/api/agencies/${agency}/deduplicate`)
  return response.data
}

export async function publishStateCases(agency) {
  const response = await axios.post(`/api/agencies/${agency}/publish`)
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
