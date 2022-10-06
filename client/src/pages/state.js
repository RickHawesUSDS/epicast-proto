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
        subtitle="This is simple state surveillance system"
      >
        <StateCasesTable />
        <Container color="text.primary" align="right">
          <ButtonGroup>
            <Button variant="contained" color="primary">Add Cases</Button>
            <Button variant="contained" color="primary">Publish</Button>
          </ButtonGroup>
        </Container>
      </HeroSection2>
    </>
  );
}

export default StatePage;
