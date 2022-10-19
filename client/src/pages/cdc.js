import React from 'react'
import Meta from './../components/Meta'
import HeroSection2 from './../components/HeroSection2'
import CDCCasesTable from '../features/cdcCases/CDCCasesTable'
import { Container } from '@material-ui/core'

function CdcPage (props) {
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
      </HeroSection2>
    </>
  )
}

export default CdcPage
