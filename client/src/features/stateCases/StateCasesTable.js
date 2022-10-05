import CaseTable from "../../components/CaseTable";
import { useGetStateCasesQuery } from '../api/apiSlice'
import { CircularProgress } from "@material-ui/core";
import { Alert } from "@material-ui/lab"

const columns = [
  { id: 'caseId', label: 'Case Id', minWidth: 100},
  // { id: 'createdAt', label: 'Created At', minWidth: 100},
  { id: 'updatedAt', label: 'Updated At', minWitdh: 160, dateFormat: true},
  { id: 'personFirstName', label: 'First Name', minWidth: 120},
  { id: 'personFirstName', label: 'Last Name', minWidth: 120},
  { id: 'personDateOfBirth', label: 'Date of Birth', minWidth: 160, dateFormat: true},
  //{ id: 'personRace', label: 'Race', minWidth: 100},
  //{ id: 'personEthnicity', label: 'Ethnicity', minWidth: 100},
  //{ id: 'personSexAtBirth', label: 'Sex at Birth', minWidth: 100},
  //{ id: 'personSexualOrientation', label: 'Sexual Orientation', minWidth: 100},
  { id: 'personAddress', label: 'Address', minWidth: 170},
  { id: 'personCity', label: 'City', minWidth: 100},
  { id: 'personState', label: 'State', minWidth: 100},
  { id: 'personPostalCode', label: 'Postal Code', minWidth: 100},
  { id: 'personPhone', label: 'Telephone', minWidth: 100},
  { id: 'personEmail', label: 'Email', minWidth: 100},
  { id: 'onsetOfSymptoms', label: 'Onset of Symptoms', minWidth: 100},
  { id: 'hospitalized', label: 'Hospitalized', minWidth: 100},
  { id: 'subjectDied', label: 'Subject Died', minWidth: 100},
];

export default function StateCasesTable() {
  const {
    data: cases = [],
    isLoading,
    isSuccess,
    isError,
    error,
  } = useGetStateCasesQuery()

  let content

  if (isLoading) {
    content = (
      <CircularProgress />
    )
  } else if (isSuccess) {
    content = (
      <CaseTable fetchRows={ () => cases } columns={columns}/>
    )
  } else if (isError) {
    content = (
      <Alert severity="error">
        Get state cases api error: {error.status + ': ' + error.error}
      </Alert>
    )
  }

  return (
    <div>
      {content}
    </div>
  )
}
