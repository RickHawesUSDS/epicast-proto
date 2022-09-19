import React from "react";
import Meta from "../components/Meta";
import DemoFeaturesSection from "../components/DemoFeaturesSection";

function DemoPage(props) {
  return (
    <>
      <Meta title="Demo" />
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

export default DemoPage;
