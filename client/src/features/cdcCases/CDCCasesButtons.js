import { Button, makeStyles, Grid, Box } from '@material-ui/core'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchCDCCaseSubscriber, readCDCCaseFeed } from '../api/api'
import { cdcCasesSubscriber, cdcCases } from './cdcCasesKeys'

export default function CDCCasesButtons(props) {
  const queryClient = useQueryClient()
  const readCDCCaseFeedMutation = useMutation({
    mutationFn: async () => { return await readCDCCaseFeed() },
    onSuccess: () => { queryClient.invalidateQueries = {queryKey: [cdcCases]}}
  })
  const getCDCCaseSubcriberQuery = useQuery([cdcCasesSubscriber], fetchCDCCaseSubscriber, { refetchInterval: 5000 })

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
  if (getCDCCaseSubcriberQuery.isFetched && subscriber.reading) {
    subscriberStatus = 'reading...'
  } else if (getCDCCaseSubcriberQuery.isFetched && !subscriber.reading) {
    const automatic = subscriber.automatic ? 'automatic subscription' : ''
    const lastPublished = subscriber.lastPublished !== undefined ? subscriber.lastPublished : 'na'
    subscriberStatus = `Last Published: ${lastPublished}; ${automatic}`
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
          <Button disabled={isLoading} onClick={() => readCDCCaseFeedMutation.mutate()} color='primary' variant='outlined'>Read Feed</Button>
        </div>
      </Grid>
    </Grid>
  )
}
