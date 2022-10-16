import { FeedSchema } from "./FeedSchema";




export const stateCaseTimeSeriesSchemaV1: FeedSchema = {
  epicastVersion: 1.0,
  organizationId: 'epicast',
  systemId: 'demoserver',
  feedId: 'feed1',
  validFrom: new Date(2022, 10, 1),
  elements: [
    {
      name: 'caseId',
      displayName: 'Case Id',
      type: 'string',
      tags: ['id'],
      memberOfSchemas: ['cdc', 'state'],
    },
    {
      name: 'caseDate',
      displayName: 'Case Date',
      type: 'date',
      tags: ['eventAt'],
      memberOfSchemas: ['cdc', 'state']
    },
    {
      name: 'createdAt',
      displayName: 'Created At',
      type: 'date',
      tags: [],
    },
    {
      name: 'updatedAt',
      displayName: 'Updated At',
      type: 'date',
      tags: ['updatedAt'],
      memberOfSchemas: ['cdc', 'state'],
    },
    {
      name: 'personFirstName',
      displayName: 'First Name',
      type: 'string',
      tags: ['pii'],
      memberOfSchemas: ['state'],
    },
    {
      name: 'personLastName',
      displayName: 'Last Name',
      type: 'string',
      tags: ['pii'],
      memberOfSchemas: ['state'],
    },
    {
      name: 'personDateOfBirth',
      displayName: 'Date of Birth',
      type: 'date',
      tags: [],
      memberOfSchemas: ['cdc', 'state'],
    },
    {
      name: 'personRace',
      displayName: 'Race',
      type: 'code',
      tags: [],
      memberOfSchemas: ['cdc', 'state'],
    },
    {
      name: 'personEthnicity',
      displayName: 'Ethnicity',
      type: 'code',
      tags: [],
      memberOfSchemas: ['cdc', 'state'],
      valueSet: 'PHVS_EthnicityGroup_CDC'
    },
    {
      name: 'personSexAtBirth',
      displayName: 'Sex at Birth',
      type: 'code',
      tags: [],
      memberOfSchemas: ['cdc', 'state'],
    },
    {
      name: 'personAddress',
      displayName: 'Address',
      type: 'string',
      tags: ['pii'],
      memberOfSchemas: ['state'],
    },
    {
      name: 'personCity',
      displayName: 'City',
      type: 'string',
      tags: ['pii'],
      memberOfSchemas: ['state'],
    },
    {
      name: 'personState',
      displayName: 'State',
      type: 'string',
      tags: [],
      memberOfSchemas: ['cdc', 'state'],
    },
    {
      name: 'personPostalCode',
      displayName: 'Postal Code',
      type: 'string',
      tags: [],
      memberOfSchemas: ['cdc', 'state'],
    },
    {
      name: 'personPhone',
      displayName: 'Telephone',
      type: 'string',
      tags: ['pii'],
      memberOfSchemas: ['state'],
    },
    {
      name: 'personEmail',
      displayName: 'Email',
      type: 'string',
      tags: ['pii'],
      memberOfSchemas: ['state'],
    },
    {
      name: 'onsetOfSymptoms',
      displayName: 'Onset of Symptoms',
      type: 'date',
      tags: [],
      memberOfSchemas: ['cdc', 'state'],
    },
    {
      name: 'hospitalized',
      displayName: 'Hospitalized',
      type: 'code',
      tags: [],
      memberOfSchemas: ['cdc', 'state'],
    },
    {
      name: 'subjectDied',
      displayName: 'Subject Died',
      type: 'code',
      tags: [],
      memberOfSchemas: ['cdc', 'state'],
    }
  ]
}

