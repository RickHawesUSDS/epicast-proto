import React from "react";
import Meta from "./../components/Meta";
import TeamBiosSection from "./../components/TeamBiosSection";

function DemoPage(props) {
  return (
    <>
      <Meta title="Demo" />
      <TeamBiosSection
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
