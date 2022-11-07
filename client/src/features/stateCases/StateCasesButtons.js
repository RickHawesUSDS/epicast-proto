import React from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, ButtonGroup, Checkbox, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, FormControl, FormGroup, FormLabel, FormControlLabel, makeStyles } from '@material-ui/core'

import { stateCases } from './stateCasesKeys'
import { addRandomStateCases, publishStateCases } from '../api/api'


export default function StateCasesButtons(props) {
  const queryClient = useQueryClient()
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  }

  const handleClose = () => {
    setOpen(false);
  }

  const addCasesMutation = useMutation({
    mutationFn: async (params) => { return await addRandomStateCases(params.numOfDays, params.numPerDay) },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [stateCases] }) }
  })

  const publishStateCasesMutation = useMutation({
    mutationFn: async () => { return await publishStateCases() }
  })

  function onChangeSchemaClick() {
    handleClickOpen()
  }

  const useButtonStyles = makeStyles((theme) => ({
    root: {
      '& > *': {
        margin: theme.spacing(1),
      },
      width: '100%'
    },
    formControl: {
      margin: theme.spacing(3),
    },
  }));

  const buttonClasses = useButtonStyles()

  return (
    <div className={buttonClasses.root} align='right'>
      <ButtonGroup color='primary'>
        <Button disabled={addCasesMutation.isLoading} onClick={() => addCasesMutation.mutate({ numOfDays: 1, numPerDay: 1 })}>Add 1 Case</Button>
        <Button disabled={addCasesMutation.isLoading} onClick={() => addCasesMutation.mutate({ numOfDays: 1, numPerDay: 15 })}>Add 15 Case</Button>
        <Button disabled={addCasesMutation.isLoading} onClick={() => addCasesMutation.mutate({ numOfDays: 30, numPerDay: 500 })}>Add 15000 Cases</Button>
      </ButtonGroup>
      <Button onClick={() => onChangeSchemaClick()} color='primary' variant='outlined'>Change Data Dictionary</Button>
      <Button disabled={publishStateCasesMutation.isLoading} onClick={() => publishStateCasesMutation.mutate()} color='primary' variant='outlined'>Publish</Button>
      <Dialog open={open} onClose={handleClose} maxWidth="" fullWidth="" aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Change Data Dictionary</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Update the data dictionary used for this case type using questions from a national and a local question bank.
          </DialogContentText>
          <FormControl component="fieldset" className={buttonClasses.formControl}>
            <FormLabel component="legend">Local Questions</FormLabel>
            <FormGroup>
              <FormControlLabel
                control={<Checkbox name="gilad" />}
                label="Local question"
              />
              <FormControlLabel
                control={<Checkbox  name="jason" />}
                label="Nice local question"
              />
              <FormControlLabel
                control={<Checkbox name="antoine" />}
                label="Another local question"
              />
            </FormGroup>
          </FormControl>
          <FormControl component="fieldset" className={buttonClasses.formControl}>
            <FormLabel component="legend">From CDC</FormLabel>
            <FormGroup>
              <FormControlLabel
                control={<Checkbox name="gilad" />}
                label="New national data element"
              />
              <FormControlLabel
                control={<Checkbox  name="jason" />}
                label="National data element 2"
              />
            </FormGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleClose} color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
