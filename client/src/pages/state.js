import React from 'react'
import Meta from './../components/Meta'
import HeroSection2 from './../components/HeroSection2'
import StateCasesTable from '../features/stateCases/StateCasesTable'
import { Button, ButtonGroup, Container } from '@material-ui/core'
import { useAddRandomStateCasesMutation } from '../features/api/apiSlice'

function StatePage (props) {
  const [addRandomStateCase] = useAddRandomStateCasesMutation()

  async function onAddCaseClick () {
    await addRandomStateCase({ numOfDays: 1, numPerDay: 1 })
  }

  async function onAddMultipleCasesClick () {
    await addRandomStateCase({ numOfDays: 3, numPerDay: 5 })
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
            <Button onClick={() => onAddCaseClick()}>Add Case</Button>
            <Button onClick={() => onAddMultipleCasesClick()}>Add Multiple Cases</Button>
            <Button>Publish</Button>
          </ButtonGroup>
        </Container>
      </HeroSection2>
    </>
  )
}

export default StatePage
