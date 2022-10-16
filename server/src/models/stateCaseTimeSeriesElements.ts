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
      type: 'string',
      tags: ['id'],
      memberOfSchemas: ['cdc', 'state'],
    },
    {
      name: 'createdAt',
      type: 'date',
      tags: [],
    },
    {
      name: 'updatedAt',
      type: 'date',
      tags: ['updatedAt'],
      memberOfSchemas: ['cdc', 'state'],
    },
    {
      name: 'personFirstName',
      type: 'string',
      tags: ['pii'],
      memberOfSchemas: ['state'],
    },
    {
      name: 'personLastName',
      type: 'string',
      tags: ['pii'],
      memberOfSchemas: ['state'],
    },
    {
      name: 'personDateOfBirth',
      type: 'date',
      tags: [],
      memberOfSchemas: ['cdc', 'state'],
    },
    {
      name: 'personRace',
      type: 'code',
      tags: [],
      memberOfSchemas: ['cdc', 'state'],
    },
    {
      name: 'personEthnicity',
      type: 'code',
      tags: [],
      memberOfSchemas: ['cdc', 'state'],
    },
    {
      name: 'personSexAtBirth',
      type: 'code',
      tags: [],
      memberOfSchemas: ['cdc', 'state'],
    },
    {
      name: 'personAddress',
      type: 'string',
      tags: ['pii'],
      memberOfSchemas: ['state'],
    },
    {
      name: 'personCity',
      type: 'string',
      tags: ['pii'],
      memberOfSchemas: ['state'],
    },
    {
      name: 'personState',
      type: 'string',
      tags: [],
      memberOfSchemas: ['cdc', 'state'],
    },
    {
      name: 'personPostalCode',
      type: 'string',
      tags: [],
      memberOfSchemas: ['cdc', 'state'],
    },
    {
      name: 'personPhone',
      type: 'string',
      tags: ['pii'],
      memberOfSchemas: ['state'],
    },
    {
      name: 'personEmail',
      type: 'string',
      tags: ['pii'],
      memberOfSchemas: ['state'],
    },
    {
      name: 'onsetOfSymptoms',
      type: 'date',
      tags: ['eventAt'],
      memberOfSchemas: ['cdc', 'state'],
    },
    {
      name: 'hospitalized',
      type: 'code',
      tags: [],
      memberOfSchemas: ['cdc', 'state'],
    },
    {
      name: 'subjectDied',
      type: 'code',
      tags: [],
      memberOfSchemas: ['cdc', 'state'],
    }
  ]
}

