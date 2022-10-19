import React from 'react'
import Meta from './../components/Meta'
import HeroSection2 from './../components/HeroSection2'
import CDCCasesTable from '../features/cdcCases/CDCCasesTable'
import { Container, Button, makeStyles } from '@material-ui/core'
import { useGetAllCDCCasesQuery } from '../features/api/apiSlice'

function CdcPage (props) {
  const { refetch } = useGetAllCDCCasesQuery('desc')

  async function onRefreshClick() {
    refetch()
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
        <div className={buttonClasses.root} align='right'>
          <Button onClick={() => onRefreshClick()} color='primary' variant='outlined'>Refresh</Button>
        </div>
      </HeroSection2>
    </>
  )
}

export default CdcPage
