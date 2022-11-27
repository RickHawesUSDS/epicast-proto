function generateQuestion(name, namespace, section, displayName) {
  return {
    name: name,
    type: 'string',
    namespace: namespace,
    tags: [],
    descriptions: [{
      isoCultureCode: 'en-us',
      displayName: displayName,
      section: section,
      details: 'A good question'
    }]
  }
}

export const localQuestion1 = generateQuestion('us_caQuestion1', 'us_ca', 'patient', 'CA Question 1')
export const localQuestion2 = generateQuestion('us_caQuestion2', 'us_ca', 'patient', 'CA Question 2')
export const localQuestion3 = generateQuestion('us_caQuestion3', 'us_ca', 'patient', 'CA Question 3')
export const cdcQuestion1 = generateQuestion('cdcQuestion1', 'cdc', 'patient', 'CDC Question 1')
export const cdcQuestion2 = generateQuestion('cdcQuestion2', 'cdc', 'patient', 'CDC Question 2')
export const cdcQuestion3 = generateQuestion('cdcQuestion3', 'cdc', 'patient', 'CDC Question 3')
export const neighborQuestion1 = generateQuestion('us_azQuestion1', 'us_az', 'patient', 'AZ Question 1')
export const neighborQuestion2 = generateQuestion('us_azQuestion2', 'us_az', 'patient', 'AZ Question 2')
export const neighborQuestion3 = generateQuestion('us_azQuestion3', 'us_az', 'patient', 'AZ Question 3')

export const variableStateCaseElements = [
  localQuestion1,
  localQuestion2,
  localQuestion3,
  cdcQuestion1,
  cdcQuestion2,
  cdcQuestion3,
  neighborQuestion1,
  neighborQuestion2,
  neighborQuestion3
]
