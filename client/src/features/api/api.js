import axios from "axios"

export async function resetSystem() {
  return await axios.post('/api/system/reset')
}

export async function fetchAllStateCases(sortParam) {
  const response = await axios.get('/api/stateCases', { params: { sort: sortParam } })
  return response.data
}

export async function fetchStateCaseSchema() {
  const response = await axios.get('/api/stateCases/schema')
  return response.data
}

export async function addStateCaseElement(element) {
  const response = await axios.put(`/api/stateCases/schema/${element.name}`, element)
  return response.data
}

export async function deleteStateCaseElement(name) {
  const response = await axios.delete(`/api/stateCases/schema/${name}`)
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

export async function fetchCDCCaseSchema() {
  const response = await axios.get('/api/cdcCases/schema')
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
  const response = await axios.post('/api/cdcCases/subscriber', { automatic: automaticValue})
  return response.data
}

