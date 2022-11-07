import CaseTable from '../../components/CaseTable'
import { fetchAllCDCCases, fetchCDCCaseSchema } from '../../features/api/api'
import { cdcCases, cdcCasesSchema } from './cdcCasesKeys'

import { CircularProgress } from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import { useQuery } from '@tanstack/react-query'

const customWidths = {
  personFirstName: 140,
  personLastName: 140,
  personRace: 200,
  personEthnicity: 200,
  personPostalCode: 140,
  personAddress: 200,
  personPhone: 200,
  personEmail: 200
}

function makeColumns(schema) {
  return schema.elements.map((element) => {
    return {
      id: element.name,
      label: element.displayName,
      minWidth: customWidths[element.name] ?? 100,
      dateFormat: element.type === 'date',
    }
  })
}

export default function CDCCasesTable() {
  const getCDCSchemaQuery = useQuery(
    [cdcCasesSchema],
    fetchCDCCaseSchema,
    {
    }
  )

  const getCDCCasesQuery = useQuery(
    [cdcCases],
    async () => { return await fetchAllCDCCases('desc') },
    {
      refetchInterval: 5000 //ms
    }
  )

  let content = ''

  if (getCDCCasesQuery.isError || getCDCSchemaQuery.isError) {
    if (getCDCCasesQuery.isError) {
      content = (
        <Alert severity='error'>
          Get state cases api error: {getCDCCasesQuery.error}
        </Alert>
      )
    }
    if (getCDCSchemaQuery.isError) {
      content = (
        <Alert severity='error'>
          Get state cases schema api error: {getCDCSchemaQuery.error}
        </Alert>
      )
    }
  } else if (getCDCCasesQuery.isLoading || getCDCSchemaQuery.isLoading) {
    content = (
      <CircularProgress />
    )
  } else if (getCDCCasesQuery.isFetched && getCDCSchemaQuery.isFetched) {
    const columns = makeColumns(getCDCSchemaQuery.data)
    if (columns.length === 0) {
      content = (
        <Alert severity='info'>
          No table published in feed
        </Alert>
      )
    } else {
      content = (
        <CaseTable fetchRows={() => getCDCCasesQuery.data} columns={columns} />
      )
    }
  }

  return (
    <div>
      {content}
    </div>
  )
}
