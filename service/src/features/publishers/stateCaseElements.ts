import { FeedDictionary } from '@/epicast/FeedDictionary'

export const stateCaseTimeSeriesSchemaV1: FeedDictionary = {
  epicastVersion: 1.0,
  subjectId: 'epicast',
  reporterId: 'demoserver',
  topicId: 'feed1',
  validFrom: new Date(2022, 10, 1),
  namespaces: [
    {
      namespace: 'cdc',
      description: 'Elements from the state'
    },
    {
      namespace: 'uscdi',
      description: 'Element defined in the uscdi'
    },
    {
      namespace: 'us_ca',
      description: 'Main state elements'
    },
    {
      namespace: 'us_az',
      description: 'Neighbor state elements'
    },
    {
      namespace: 'event',
      description: 'Core EpiCast elements'
    }
  ],
  elements: [
    {
      name: 'eventId',
      namespace: 'event',
      displayName: 'Event Id',
      type: 'string',
      tags: []
    },
    {
      name: 'eventAt',
      namespace: 'event',
      displayName: 'Event Time',
      type: 'date',
      tags: []
    },
    {
      name: 'eventSubject',
      namespace: 'event',
      displayName: 'Subject',
      type: 'string',
      tags: []
    },
    {
      name: 'eventReporter',
      namespace: 'event',
      displayName: 'Reporter',
      type: 'string',
      tags: []
    },
    {
      name: 'eventTopic',
      namespace: 'event',
      displayName: 'Subject',
      type: 'string',
      tags: []
    },
    {
      name: 'eventUpdatedAt',
      namespace: 'event',
      displayName: 'Event Updated Time',
      type: 'date',
      tags: []
    },
    {
      name: 'cdcOnsetOfSymptoms',
      namespace: 'cdc',
      displayName: 'Onset of Symptoms',
      type: 'date',
      tags: []
    },
    {
      name: 'cdcHospitalized',
      namespace: 'cdc',
      displayName: 'Hospitalized',
      type: 'code',
      valueSet: 'PHVS_YesNoUnknown_CDC',
      tags: []
    },
    {
      name: 'cdcSubjectDied',
      namespace: 'cdc',
      displayName: 'Subject Died',
      type: 'code',
      valueSet: 'PHVS_YesNoUnknown_CDC',
      tags: []
    },
    // person elements
    {
      name: 'uscdiPatientFirstName',
      namespace: 'uscdi',
      displayName: 'First Name',
      type: 'string',
      tags: ['pii']
    },
    {
      name: 'uscdiPatientLastName',
      namespace: 'uscdi',
      displayName: 'Last Name',
      type: 'string',
      tags: ['pii']
    },
    {
      name: 'uscdiPatientDateOfBirth',
      namespace: 'uscdi',
      displayName: 'Date of Birth',
      type: 'date',
      tags: []
    },
    {
      name: 'uscdiPatientRaceCatagory',
      namespace: 'uscdi',
      displayName: 'Race',
      type: 'code',
      tags: [],
      valueSet: 'PHVS_RaceCategory_CDC'
    },
    {
      name: 'uscdiPatientEthnicityGroup',
      namespace: 'uscdi',
      displayName: 'Ethnicity',
      type: 'code',
      tags: [],
      valueSet: 'PHVS_EthnicityGroup_CDC'
    },
    {
      name: 'uscdiPatientSexAtBirth',
      namespace: 'uscdi',
      displayName: 'Sex at Birth',
      type: 'code',
      tags: []
    },
    {
      name: 'uscdiPatientAddress',
      namespace: 'uscdi',
      displayName: 'Address',
      type: 'string',
      tags: ['pii']
    },
    {
      name: 'uscdiPatientCity',
      namespace: 'uscdi',
      displayName: 'City',
      type: 'string',
      tags: ['pii']
    },
    {
      name: 'uscdiPatientState',
      namespace: 'uscdi',
      displayName: 'State',
      type: 'string',
      tags: []
    },
    {
      name: 'uscdiPatientPostalCode',
      namespace: 'uscdi',
      displayName: 'Postal Code',
      type: 'string',
      tags: []
    },
    {
      name: 'uscdiPatientPhone',
      namespace: 'uscdi',
      displayName: 'Telephone',
      type: 'string',
      tags: ['pii']
    },
    {
      name: 'uscdiPatientEmail',
      namespace: 'uscdi',
      displayName: 'Email',
      type: 'string',
      tags: ['pii']
    }
  ]
}

export const variableSchemaElementNames = [
  'us_caQuestion1', 'us_caQuestion2', 'us_caQuestion3',
  'us_azQuestion1', 'us_azQuestion2', 'us_azQuestion3',
  'cdcQuestion1', 'cdcQuestion2', 'cdcQuestion3'
]
