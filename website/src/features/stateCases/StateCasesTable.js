import CaseTable from '../../components/CaseTable'
import { fetchAllStateCases, fetchStateCaseDictionary } from '../../features/api/api'
import { CircularProgress } from '@material-ui/core'
import { useQuery } from '@tanstack/react-query'
import { Alert } from '@material-ui/lab'
import { stateCases, stateCasesDictionary } from './stateCasesKeys'

const customWidths = {
  uscdiPersonFirstName: 140,
  uscdiPersonLastName: 140,
  uscdiPersonRace: 200,
  uscdiPersonEthnicity: 200,
  uscdiPersonPostalCode: 140,
  uscdiPersonAddress: 200,
  uscdiPersonPhone: 200,
  uscdiPersonEmail: 200,
}

function makeColumns(dictionary) {
  return dictionary.elements.map((element) => {
    return {
      id: element.name,
      label: element.descriptions[0].displayName,
      minWidth: customWidths[element.name] ?? 100,
      dateFormat: element.type === 'date',
    }
  })
}

export default function StateCasesTable() {
  const dictionaryQuery = useQuery([stateCasesDictionary], async () => { return await fetchStateCaseDictionary() }, {})
  const casesQuery = useQuery([stateCases], async () => { return await fetchAllStateCases('desc') }, {})

  let content = ''

  if (dictionaryQuery.isError || casesQuery.isError) {
    if (casesQuery.isError) {
      content = (
        <Alert severity='error'>
          Get state cases api error: {casesQuery.error}
        </Alert>
      )
    }
    if (dictionaryQuery.isError) {
      content = (
        <Alert severity='error'>
          Get state cases dictionary api error: {dictionaryQuery.error}
        </Alert>
      )
    }
  } else if (casesQuery.isLoading || dictionaryQuery.isLoading) {
    content = (
      <CircularProgress />
    )
  } else if (casesQuery.isFetched && dictionaryQuery.isFetched) {
    const columns = makeColumns(dictionaryQuery.data)
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
