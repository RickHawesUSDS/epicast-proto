import React from 'react'
import Meta from './../components/Meta'
import HeroSection2 from './../components/HeroSection2'
import CDCCasesTable from '../features/cdcCases/CDCCasesTable'
import { Container, Button, makeStyles, Grid, Box } from '@material-ui/core'
import { useReadCDCCaseFeedMutation, useGetAllCDCCasesQuery, useGetCDCCaseSubscriberQuery } from '../features/api/apiSlice'

function CdcPage (props) {
  const { refetch } = useGetAllCDCCasesQuery('desc')
  const [readCDCCaseFeed] = useReadCDCCaseFeedMutation()
  const {
    data: subscriberQueryData,
    isSuccess: isSubscriberQuerySucccesful,
    isError: isSubscriberQueryFailed,
    error: subscriberQueryError
  } = useGetCDCCaseSubscriberQuery()

  async function onRefreshClick () {
    refetch()
  }

  async function onReadFeedClick () {
    await readCDCCaseFeed()
  }

  const useButtonStyles = makeStyles((theme) => ({
    root: {
      '& > *': {
        margin: theme.spacing(1)
      }
    }
  }))

  const buttonClasses = useButtonStyles()

  let subscriberStatus = ''
  if (isSubscriberQuerySucccesful && subscriberQueryData.reading) {
    subscriberStatus = 'reading...'
  } else if (isSubscriberQuerySucccesful && !subscriberQueryData.reading) {
    const automatic = subscriberQueryData.automatic ? 'auto-checking' : ''
    const lastChecked = subscriberQueryData.lastChecked !== undefined ? subscriberQueryData.lastChecked : 'na'
    const lastPublished = subscriberQueryData.lastPublished !== undefined ? subscriberQueryData.lastPublished : 'na'
    subscriberStatus = `Last Published: ${lastPublished}; Last Checked: ${lastChecked} ${automatic}`
  } else if (isSubscriberQueryFailed) {
    subscriberStatus = `Query Error: ${subscriberQueryError}`
  }

  return (
    <>
      <Meta title='Cdc' />
      <HeroSection2
        bgColor='default'
        size='medium'
        bgImage=''
        bgImageOpacity={1}
        title='CDC'
      >
        <Container align='center'>
          This is what CDC receives. The table is directly synchronized to the published data feed that state provides.
        </Container>
        <CDCCasesTable />
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Box pl={1} pt={1} color='text.secondary'>
              {subscriberStatus}
            </Box>
          </Grid>
          <Grid item xs={6}>
            <div className={buttonClasses.root} align='right'>
              <Button onClick={() => onRefreshClick()} color='primary' variant='outlined'>Refresh Table</Button>
              <Button onClick={() => onReadFeedClick()} color='primary' variant='outlined'>Read Feed</Button>
            </div>
          </Grid>
        </Grid>
      </HeroSection2>
    </>
  )
}

export default CdcPage
