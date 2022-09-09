import React from "react";
import Meta from "./../components/Meta";
import HeroSection from "./../components/HeroSection";
import CaseTable from "./../components/CaseTable"

function StatePage(props) {
  return (
    <>
      <Meta title="State" />
      <HeroSection
        bgColor="default"
        size="medium"
        bgImage=""
        bgImageOpacity={1}
        title="State"
        subtitle="This is simple state surveillance system"
        buttonText="Back"
        buttonColor="primary"
        buttonPath="/demo"
      />
      <CaseTable />
    </>
  );
}

export default StatePage;
