import CaseTable from '../../components/CaseTable'
import { fetchAllStateCases, fetchStateCaseSchema } from '../../features/api/api'
import { CircularProgress } from '@material-ui/core'
import { useQuery } from '@tanstack/react-query'
import { Alert } from '@material-ui/lab'
import { stateCases, stateCasesSchema } from './stateCasesKeys'

const customWidths = {
  personFirstName: 140,
  personLastName: 140,
  personRace: 200,
  personEthnicity: 200,
  personPostalCode: 140,
  personAddress: 200,
  personPhone: 200,
  personEmail: 200,
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

export default function StateCasesTable() {
  const schemaQuery = useQuery([stateCasesSchema], async () => { return await fetchStateCaseSchema() }, {})
  const casesQuery = useQuery([stateCases], async () => { return await fetchAllStateCases('desc') }, {})

  let content = ''

  if (schemaQuery.isError || casesQuery.isError) {
    if (casesQuery.isError) {
      content = (
        <Alert severity='error'>
          Get state cases api error: {casesQuery.error}
        </Alert>
      )
    }
    if (schemaQuery.isError) {
      content = (
        <Alert severity='error'>
          Get state cases schema api error: {schemaQuery.error}
        </Alert>
      )
    }
  } else if (casesQuery.isLoading || schemaQuery.isLoading) {
    content = (
      <CircularProgress />
    )
  } else if (casesQuery.isFetched && schemaQuery.isFetched) {
    const columns = makeColumns(schemaQuery.data)
    content = (
      <CaseTable fetchRows={() => casesQuery.data} columns={columns} />
    )
  }

  return (
    <div>
      {content}
    </div>
  )
}
