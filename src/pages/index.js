import React from "react";
import Meta from "./../components/Meta";
import HeroSection from "./../components/HeroSection";

function IndexPage(props) {
  return (
    <>
      <Meta />
      <HeroSection
        bgColor="default"
        size="medium"
        bgImage=""
        bgImageOpacity={1}
        title="EpiCast Demonstration"
        subtitle="EpiCast is new way from states to transmit case data to the CDC"
        buttonText="Start Demo"
        buttonColor="primary"
        buttonPath="/demo"
      />
    </>
  );
}

export default IndexPage;
