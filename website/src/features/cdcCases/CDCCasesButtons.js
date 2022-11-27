import { Button, makeStyles, Grid, Box, Switch, FormControlLabel } from '@material-ui/core'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchCDCCaseSubscriber, readCDCCaseFeed, setCDCCaseSubscriber } from '../api/api'
import { cdcCasesSubscriber, cdcCases, cdcCasesDictionary } from './cdcCasesKeys'

export default function CDCCasesButtons(props) {
  const queryClient = useQueryClient()
  const readCDCCaseFeedMutation = useMutation({
    mutationFn: async () => { return await readCDCCaseFeed() },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [cdcCases, cdcCasesDictionary] })
    }
  })
  const getCDCCaseSubcriberQuery = useQuery(
    [cdcCasesSubscriber],
    fetchCDCCaseSubscriber,
    { refetchInterval: 5000 }
  )
  const setSubscriberAutomaticMutation = useMutation({
    mutationFn: async (params) => { return await setCDCCaseSubscriber(params.automatic) },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [cdcCases, cdcCasesDictionary] })
    }
  })


  const useButtonStyles = makeStyles((theme) => ({
    root: {
      '& > *': {
        margin: theme.spacing(1)
      }
    }
  }))

  const buttonClasses = useButtonStyles()
  const subscriber = getCDCCaseSubcriberQuery.data

  let subscriberStatus = ''
  let automatic = false
  if (getCDCCaseSubcriberQuery.isFetched && subscriber.reading) {
    subscriberStatus = 'reading...'
  } else if (getCDCCaseSubcriberQuery.isFetched && !subscriber.reading) {
    automatic = subscriber.automatic
    const lastPublished = subscriber.lastPublished !== undefined ? subscriber.lastPublished : 'na'
    subscriberStatus = `Last Published: ${lastPublished}`
  } else if (getCDCCaseSubcriberQuery.isError) {
    subscriberStatus = `Query Error: ${getCDCCaseSubcriberQuery.error}`
  }

  const isLoading = readCDCCaseFeedMutation.isLoading
  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <Box pl={1} pt={1} color='text.secondary'>
          {subscriberStatus}
        </Box>
      </Grid>
      <Grid item xs={6}>
        <div className={buttonClasses.root} align='right'>
          <FormControlLabel
            control={
              <Switch
                checked={automatic}
                color="primary"
                name='automatic'
                onChange={(e) => setSubscriberAutomaticMutation.mutate({ automatic: e.target.checked })} />
            }
            label='Automatic Reading'
          />
          <Button disabled={isLoading || automatic} onClick={() => readCDCCaseFeedMutation.mutate()} color='primary' variant='outlined'>Read Feed</Button>
        </div>
      </Grid>
    </Grid>
  )
}
