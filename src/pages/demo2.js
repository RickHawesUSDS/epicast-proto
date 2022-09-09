import React from "react";
import Meta from "./../components/Meta";
import FeaturesSection from "./../components/FeaturesSection";

function Demo2Page(props) {
  return (
    <>
      <Meta title="Demo2" />
      <FeaturesSection
        bgColor="default"
        size="medium"
        bgImage=""
        bgImageOpacity={1}
        image="https://uploads.divjoy.com/undraw-chatting_2yvo.svg"
      />
    </>
  );
}

export default Demo2Page;
