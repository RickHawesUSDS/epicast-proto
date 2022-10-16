import React from 'react'
import Meta from './../components/Meta'
import HeroSection2 from './../components/HeroSection2'
import StateCasesTable from '../features/stateCases/StateCasesTable'
import { Button, ButtonGroup, Container, makeStyles } from '@material-ui/core'
import { useAddRandomStateCasesMutation, usePublishStateCasesMutation } from '../features/api/apiSlice'
import { ArrowRight } from '@material-ui/icons'

function StatePage(props) {
  const [addRandomStateCase] = useAddRandomStateCasesMutation()
  const [publishStateCases] = usePublishStateCasesMutation()

  async function onAddCaseClick() {
    await addRandomStateCase({ numOfDays: 1, numPerDay: 1 })
  }

  async function onAdd15CasesClick() {
    await addRandomStateCase({ numOfDays: 5, numPerDay: 3 })
  }

  async function onAdd15KCasesClick() {
    await addRandomStateCase({ numOfDays: 50, numPerDay: 300 })
  }

  async function onPublishCasesClick() {
    await publishStateCases()
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
        <div className={buttonClasses.root} align='right'>
          <ButtonGroup color='primary'>
            <Button onClick={() => onAddCaseClick()}>Add 1 Case</Button>
            <Button onClick={() => onAdd15CasesClick()}>Add 15 Case</Button>
            <Button onClick={() => onAdd15KCasesClick()}>Add 15000 Cases</Button>
          </ButtonGroup>
          <Button onClick={() => onPublishCasesClick()} color='primary' variant='outlined' px="5px">Publish</Button>
        </div>
      </HeroSection2>
    </>
  )
}

export default StatePage
