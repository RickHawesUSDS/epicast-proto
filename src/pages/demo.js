import React from "react";
import Meta from "../components/Meta";
import DemoFeaturesSection from "../components/DemoFeaturesSection";
import HeroSection2 from "../components/HeroSection2";

function Demo2Page(props) {
  return (
    <>
      <Meta title="Demo2" />
      <HeroSection2
        bgColor="default"
        size="medium"
        bgImage=""
        bgImageOpacity={1}
        title="Demo"
        subtitle="This demonstration will take you through a scenarios"
      />
      <DemoFeaturesSection
        bgColor="default"
        size="medium"
        bgImage=""
        bgImageOpacity={1}
        image="epicast-flow.svg"
      />
    </>
  );
}

export default Demo2Page;
