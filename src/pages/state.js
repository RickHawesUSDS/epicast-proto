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
        subtitle="This landing page is perfect for showing off your awesome product and driving people to sign up for a paid plan."
        buttonText="Back"
        buttonColor="primary"
        buttonPath="/demo"
      />
    </>
  );
}

export default StatePage;
