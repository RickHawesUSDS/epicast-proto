import React from "react";
import Meta from "./../components/Meta";
import HeroSection2 from "./../components/HeroSection2";
import StateCasesTable from "../features/stateCases/StateCasesTable"
import { Button, ButtonGroup, Container } from "@material-ui/core";

function StatePage(props) {
  return (
    <>
      <Meta title="State" />
      <HeroSection2
        bgColor="default"
        size="medium"
        bgImage=""
        bgImageOpacity={1}
        title="State"
        subtitle=""
      >
        <Container align="center">
          This is simple state surveillance system. The table represents all the case of a particular disease.
        </Container>
        <StateCasesTable />
        <Container color="text.primary" align="right">
          <ButtonGroup color="primary">
            <Button>Add Cases</Button>
            <Button>Publish</Button>
          </ButtonGroup>
        </Container>
      </HeroSection2>
    </>
  );
}

export default StatePage;
