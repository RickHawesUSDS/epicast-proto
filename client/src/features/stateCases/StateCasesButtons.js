import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, ButtonGroup, makeStyles } from '@material-ui/core'

import { stateCases } from './stateCasesKeys'
import { addRandomStateCases, publishStateCases  } from '../api/api'


export default function StateCasesButtons(props) {
  const queryClient = useQueryClient()

  const addCasesMutation = useMutation({
    mutationFn: async (params) => { return await addRandomStateCases(params.numOfDays, params.numPerDay) },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [stateCases] }) }
  })

  const publishStateCasesMutation = useMutation({
    mutationFn: async () => { return await publishStateCases() }
  })

  async function onChangeSchemaClick() {
    console.log('change schema click')
  }

  const useButtonStyles = makeStyles((theme) => ({
    root: {
      '& > *': {
        margin: theme.spacing(1),
      },
    },
  }));

  const buttonClasses = useButtonStyles()

  return (
    <div className={buttonClasses.root} align='right'>
      <ButtonGroup color='primary'>
        <Button disabled={addCasesMutation.isLoading} onClick={() => addCasesMutation.mutate({numOfDays: 1, numPerDay: 1})}>Add 1 Case</Button>
        <Button disabled={addCasesMutation.isLoading} onClick={() => addCasesMutation.mutate({numOfDays: 1, numPerDay: 15})}>Add 15 Case</Button>
        <Button disabled={addCasesMutation.isLoading} onClick={() => addCasesMutation.mutate({numOfDays: 30, numPerDay: 500})}>Add 15000 Cases</Button>
      </ButtonGroup>
      <Button onClick={() => onChangeSchemaClick()} color='primary' variant='outlined'>Change Data Dictionary</Button>
      <Button disabled={publishStateCasesMutation.isLoading} onClick={() => publishStateCasesMutation.mutate()} color='primary' variant='outlined'>Publish</Button>
    </div>
  )
}
