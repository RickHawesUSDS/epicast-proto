import React from "react";
import Meta from "./../components/Meta";
import DemoSection from "../components/DemoSection";

function DemoPage(props) {
  return (
    <>
      <Meta title="Demo" />
      <DemoSection
        bgColor="default"
        size="medium"
        bgImage=""
        bgImageOpacity={1}
        title="Demo"
        subtitle=""
      />
    </>
  );
}

export default DemoPage;
