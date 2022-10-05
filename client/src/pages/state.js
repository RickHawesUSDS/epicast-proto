import React from "react";
import Meta from "./../components/Meta";
import HeroSection2 from "./../components/HeroSection2";
import StateCasesTable from "../features/stateCases/StateCasesTable"

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
      </HeroSection2>
    </>
  );
}

export default StatePage;
