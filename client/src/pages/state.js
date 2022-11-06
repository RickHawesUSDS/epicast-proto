import React from 'react'
import Meta from './../components/Meta'
import HeroSection2 from './../components/HeroSection2'
import StateCasesTable from '../features/stateCases/StateCasesTable'
import { Button, ButtonGroup, Container, makeStyles } from '@material-ui/core'
import { useAddRandomStateCasesMutation, usePublishStateCasesMutation } from '../features/api/apiSlice'

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
    await addRandomStateCase({ numOfDays: 5, numPerDay: 3000 })
  }

  async function onPublishCasesClick() {
    await publishStateCases()
  }

  async function onChangeSchemaClick() {
    console.log('change schema click')
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
          <Button onClick={() => onChangeSchemaClick()} color='primary' variant='outlined'>Change Data Dictionary</Button>
          <Button onClick={() => onPublishCasesClick()} color='primary' variant='outlined'>Publish</Button>
        </div>
      </HeroSection2>
    </>
  )
}

export default StatePage
