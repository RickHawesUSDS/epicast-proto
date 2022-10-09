import React from 'react'
import Meta from './../components/Meta'
import HeroSection2 from './../components/HeroSection2'
import StateCasesTable from '../features/stateCases/StateCasesTable'
import { Button, ButtonGroup, Container } from '@material-ui/core'
import { useAddRandomStateCasesMutation, usePublishStateCasesMutation } from '../features/api/apiSlice'

function StatePage (props) {
  const [addRandomStateCase] = useAddRandomStateCasesMutation()
  const [publishStateCases] = usePublishStateCasesMutation()

  async function onAddCaseClick () {
    await addRandomStateCase({ numOfDays: 1, numPerDay: 1 })
  }

  async function onAddMultipleCasesClick () {
    await addRandomStateCase({ numOfDays: 3, numPerDay: 5000 })
  }

  async function onPublishCasesClick () {
    await publishStateCases()
  }

  return (
    <>
      <Meta title='State' />
      <HeroSection2
        bgColor='default'
        size='medium'
        bgImage=''
        bgImageOpacity={1}
        title='State'
        subtitle=''
      >
        <Container align='center'>
          This is simple state surveillance system. The table represents all the case of a particular disease.
        </Container>
        <StateCasesTable />
        <Container color='text.primary' align='right'>
          <ButtonGroup color='primary'>
            <Button onClick={() => onAddCaseClick()}>Add 1 Case</Button>
            <Button onClick={() => onAddMultipleCasesClick()}>Add 15000 Cases</Button>
            <Button onClick={() => onPublishCasesClick()}>Publish</Button>
          </ButtonGroup>
        </Container>
      </HeroSection2>
    </>
  )
}

export default StatePage
