import React from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, ButtonGroup, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField, makeStyles } from '@material-ui/core'

import { stateCases } from './stateCasesKeys'
import { addRandomStateCases, publishStateCases  } from '../api/api'


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
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Subscribe</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To subscribe to this website, please enter your email address here. We will send updates
            occasionally.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Email Address"
            type="email"
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleClose} color="primary">
            Subscribe
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
