import CaseTable from '../../components/CaseTable'
import { useGetAllCDCCasesQuery, useGetCDCCaseSchemaQuery } from '../api/apiSlice'
import { CircularProgress } from '@material-ui/core'
import { Alert } from '@material-ui/lab'

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

function makeColumns (schema) {
  return schema.elements.map((element) => {
    return {
      id: element.name,
      label: element.displayName,
      minWidth: customWidths[element.name] ?? 100,
      dateFormat: element.type === 'date',
    }
  })
}

export default function CDCCasesTable () {
  const {
    data: schema = undefined,
    isLoading: isSchemaLoading,
    isSuccess: isSchemaSucccesful,
    isError: isSchemaFailed,
    error: schemaError
  } = useGetCDCCaseSchemaQuery()

  const {
    data: cases = [],
    isLoading: isCasesLoading,
    isSuccess: isCasesSucccesful,
    isError: isCasesFailed,
    error: casesError
  } = useGetAllCDCCasesQuery({ sort: 'desc' }, { pollingInterval: 5000 })

  let content = ''

  if (isCasesFailed || isSchemaFailed) {
    if (isCasesFailed) {
      content = (
        <Alert severity='error'>
          Get state cases api error: {casesError.status + ': ' + casesError.error}
        </Alert>
      )
    }
    if (isSchemaFailed) {
      content = (
        <Alert severity='error'>
          Get state cases schema api error: {schemaError.status + ': ' + schemaError.error}
        </Alert>
      )
    }
  } else if (isCasesLoading || isSchemaLoading) {
    content = (
      <CircularProgress />
    )
  } else if (isCasesSucccesful && isSchemaSucccesful) {
    const columns = makeColumns(schema)
    if (columns.length === 0) {
      content = (
        <Alert severity='info'>
          No table published in feed
        </Alert>
      )
    } else {
      content = (
        <CaseTable fetchRows={() => cases} columns={columns} />
      )
    }
  }

  return (
    <div>
      {content}
    </div>
  )
}
