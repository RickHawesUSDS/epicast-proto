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
      type: 'string',
      tags: [],
      descriptions: [{
        isoCultureCode: 'en-us',
        section: 'event',
        displayName: 'Event Id'
      }]
    },
    {
      name: 'eventAt',
      namespace: 'event',
      type: 'date',
      tags: [],
      descriptions: [{
        isoCultureCode: 'en-us',
        section: 'event',
        displayName: 'Event Time'
      }]
    },
    {
      name: 'eventSubject',
      namespace: 'event',
      type: 'string',
      tags: [],
      descriptions: [{
        isoCultureCode: 'en-us',
        section: 'event',
        displayName: 'Event Subject'
      }]
    },
    {
      name: 'eventReporter',
      namespace: 'event',
      type: 'string',
      tags: [],
      descriptions: [{
        isoCultureCode: 'en-us',
        section: 'event',
        displayName: 'Event Reporter'
      }]
    },
    {
      name: 'eventTopic',
      namespace: 'event',
      type: 'string',
      tags: [],
      descriptions: [{
        isoCultureCode: 'en-us',
        section: 'event',
        displayName: 'Event Topic'
      }]
    },
    {
      name: 'eventUpdatedAt',
      namespace: 'event',
      type: 'date',
      tags: [],
      descriptions: [{
        isoCultureCode: 'en-us',
        section: 'event',
        displayName: 'Event Updated Time'
      }]
    },
    {
      name: 'cdcOnsetOfSymptoms',
      namespace: 'cdc',
      type: 'date',
      tags: [],
      descriptions: [{
        isoCultureCode: 'en-us',
        displayName: 'Onset of Symptoms'
      }]
    },
    {
      name: 'cdcHospitalized',
      namespace: 'cdc',
      type: 'code',
      codeSet: 'PHVS_YesNoUnknown_CDC',
      tags: [],
      descriptions: [{
        isoCultureCode: 'en-us',
        displayName: 'Hospitalized'
      }]
    },
    {
      name: 'cdcSubjectDied',
      namespace: 'cdc',
      type: 'code',
      codeSet: 'PHVS_YesNoUnknown_CDC',
      tags: [],
      descriptions: [{
        isoCultureCode: 'en-us',
        displayName: 'Subject Died'
      }]
    },
    // person elements
    {
      name: 'uscdiPatientFirstName',
      namespace: 'uscdi',
      type: 'string',
      tags: ['pii'],
      descriptions: [{
        isoCultureCode: 'en-us',
        section: 'patient',
        displayName: 'First Name'
      }]
    },
    {
      name: 'uscdiPatientLastName',
      namespace: 'uscdi',
      type: 'string',
      tags: ['pii'],
      descriptions: [{
        isoCultureCode: 'en-us',
        section: 'patient',
        displayName: 'Last Name'
      }]
    },
    {
      name: 'uscdiPatientDateOfBirth',
      namespace: 'uscdi',
      type: 'date',
      tags: [],
      descriptions: [{
        isoCultureCode: 'en-us',
        section: 'patient',
        displayName: 'Date of Birth'
      }]
    },
    {
      name: 'uscdiPatientRaceCatagory',
      namespace: 'uscdi',
      type: 'code',
      tags: [],
      codeSet: 'PHVS_RaceCategory_CDC',
      descriptions: [{
        isoCultureCode: 'en-us',
        section: 'patient',
        displayName: 'Race'
      }]
    },
    {
      name: 'uscdiPatientEthnicityGroup',
      namespace: 'uscdi',
      type: 'code',
      tags: [],
      codeSet: 'PHVS_EthnicityGroup_CDC',
      descriptions: [{
        isoCultureCode: 'en-us',
        section: 'patient',
        displayName: 'Ethnicity'
      }]
    },
    {
      name: 'uscdiPatientSexAtBirth',
      namespace: 'uscdi',
      type: 'code',
      tags: [],
      descriptions: [{
        isoCultureCode: 'en-us',
        section: 'patient',
        displayName: 'Sex at Birth'
      }]
    },
    {
      name: 'uscdiPatientAddress',
      namespace: 'uscdi',
      type: 'string',
      tags: ['pii'],
      descriptions: [{
        isoCultureCode: 'en-us',
        section: 'patient',
        displayName: 'Address'
      }]
    },
    {
      name: 'uscdiPatientCity',
      namespace: 'uscdi',
      type: 'string',
      tags: ['pii'],
      descriptions: [{
        isoCultureCode: 'en-us',
        section: 'patient',
        displayName: 'City'
      }]
    },
    {
      name: 'uscdiPatientState',
      namespace: 'uscdi',
      type: 'string',
      tags: [],
      descriptions: [{
        isoCultureCode: 'en-us',
        section: 'patient',
        displayName: 'State'
      }]
    },
    {
      name: 'uscdiPatientPostalCode',
      namespace: 'uscdi',
      type: 'string',
      tags: [],
      descriptions: [{
        isoCultureCode: 'en-us',
        section: 'patient',
        displayName: 'Postal Code'
      }]
    },
    {
      name: 'uscdiPatientPhone',
      namespace: 'uscdi',
      type: 'string',
      tags: ['pii'],
      descriptions: [{
        isoCultureCode: 'en-us',
        section: 'patient',
        displayName: 'Telephone'
      }]
    },
    {
      name: 'uscdiPatientEmail',
      namespace: 'uscdi',
      type: 'string',
      tags: ['pii'],
      descriptions: [{
        isoCultureCode: 'en-us',
        section: 'patient',
        displayName: 'Email'
      }]
    }
  ]
}

export const variableSchemaElementNames = [
  'us_caQuestion1', 'us_caQuestion2', 'us_caQuestion3',
  'us_azQuestion1', 'us_azQuestion2', 'us_azQuestion3',
  'cdcQuestion1', 'cdcQuestion2', 'cdcQuestion3'
]
