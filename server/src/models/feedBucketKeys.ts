import { Period } from '@/utils/Period';
import { formatISO } from 'date-fns'
import pathPosix from 'node:path/posix'

//
// Define where to put objects and how to name them in the bucket
//

export const LOG_FOLDER = 'logs'
export const LOG_EXTENSION = 'log'
export const formLogKey = (forDay?: Date): string => {
  const day = forDay ?? new Date()
  const dayText = formatISO(day, { format: 'basic', representation: 'date' })
  return `${LOG_FOLDER}/${dayText}.${LOG_EXTENSION}`
}

export const TIMESERIES_FOLDER = 'time_series'
export const TIMESERIES_EXT = 'csv'
export const formTimeSeriesKey = (forPeriod: Period): string => {
  const fileName = forPeriod.toString()
  return `${TIMESERIES_FOLDER}/${fileName}.${TIMESERIES_EXT}`
}
export const periodFromTimeSeriesKey = (key: string): Period => {
  const periodPart = pathPosix.parse(key).name
  return Period.parse(periodPart)
}

export const SCHEMA_FOLDER = 'schema';
export const SCHEMA_EXTENSION = 'yaml';
export const formSchemaKey = (organizationId: string, systemId: string, feedId: string, validFrom: Date) => {
    return `${SCHEMA_FOLDER}/${[organizationId, systemId, feedId, formatISO(validFrom)].join(FILE_NAME_SEPERATOR)}.${SCHEMA_EXTENSION}`;
}
export const splitSchemaKey = (key: string): string[] => {
    const fileName = pathPosix.parse(key).name
    return fileName.split(FILE_NAME_SEPERATOR, 4);
}

export const FILE_NAME_SEPERATOR = '-';
export const formFeedName = (organizationId: string, systemId: string, feedId: string) => {
    return [organizationId, systemId, feedId].join(FILE_NAME_SEPERATOR);
};
