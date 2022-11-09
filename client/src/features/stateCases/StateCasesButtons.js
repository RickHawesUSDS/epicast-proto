import React from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, ButtonGroup, Checkbox, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, FormControl, FormGroup, FormLabel, FormControlLabel, makeStyles } from '@material-ui/core'

import { stateCases, stateCasesSchema } from './stateCasesKeys'
import { addRandomStateCases, addStateCaseElement, deleteStateCaseElement, fetchCDCCaseSchema, fetchStateCaseSchema, publishStateCases } from '../api/api'
import { variableStateCaseElements, localQuestion1, localQuestion2, localQuestion3, neighborQuestion1, neighborQuestion2, cdcQuestion1, cdcQuestion2 } from './variableStateCaseElements'
import { de } from 'date-fns/locale'


export default function StateCasesButtons(props) {
  const queryClient = useQueryClient()
  const [open, setOpen] = React.useState(false)
  const [checked, setChecked] = React.useState(new Set())

  const addCasesMutation = useMutation({
    mutationFn: async (params) => { return await addRandomStateCases(params.numOfDays, params.numPerDay) },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [stateCases] }) }
  })

  const publishStateCasesMutation = useMutation({
    mutationFn: async () => { return await publishStateCases() }
  })

  const updateStateSchemaMutation = useMutation({
    mutationFn: async () => {
      for (let element of variableStateCaseElements) {
        if (checked.has(element.name)) {
          await addStateCaseElement(element)
        } else {
          await deleteStateCaseElement(element.name)
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [stateCases, stateCasesSchema] })
    }
  })

  const handleClickOpen = async () => {
    const schema = await fetchStateCaseSchema()
    const newChecked = new Set()
    for (let element of variableStateCaseElements) {
      if (schema.elements.findIndex( e => e.name === element.name) !== -1) {
        newChecked.add(element.name)
      }
    }
    setChecked(newChecked)
    setOpen(true);
  }

  const handleClose = () => {
    setOpen(false);
  }

  const handleUpdate = async () => {
    await updateStateSchemaMutation.mutateAsync()
    setOpen(false);
  }

  const handleCheckboxChange = (event) => {
    const newChecked = new Set(checked)
    const name = event.target.name
    if (event.target.checked) {
      newChecked.add(name)
    } else {
      newChecked.delete(name)
    }
    setChecked(newChecked)
  }

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
  }))

  const buttonClasses = useButtonStyles()

  const createCheckboxes = (questions) => (
    questions.map((question) => (
      <FormControlLabel
        control={
          <Checkbox name={question.name} checked={checked.has(question.name)} onChange={handleCheckboxChange}/>
        }
        label={question.displayName}
      />
    ))
  )

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
              {createCheckboxes([localQuestion1, localQuestion2, localQuestion3])}
            </FormGroup>
          </FormControl>
          <FormControl component="fieldset" className={buttonClasses.formControl}>
            <FormLabel component="legend">From Neighbor State</FormLabel>
            <FormGroup>
              {createCheckboxes([neighborQuestion1, neighborQuestion2])}
            </FormGroup>
          </FormControl>
          <FormControl component="fieldset" className={buttonClasses.formControl}>
            <FormLabel component="legend">From CDC</FormLabel>
            <FormGroup>
              {createCheckboxes([cdcQuestion1, cdcQuestion2])}
            </FormGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button disable={updateStateSchemaMutation.isLoading} onClick={handleUpdate} color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
