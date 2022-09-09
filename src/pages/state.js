import React from "react";
import Meta from "./../components/Meta";
import HeroSection from "./../components/HeroSection";

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
    </>
  );
}

export default StatePage;
