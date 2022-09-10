import React from "react";
import Meta from "./../components/Meta";
import HeroSection2 from "./../components/HeroSection2";

function FeedPage(props) {
  return (
    <>
      <Meta title="Feed" />
      <HeroSection2
        bgColor="default"
        size="medium"
        bgImage=""
        bgImageOpacity={1}
        title="Feed"
        subtitle="This landing page is perfect for showing off your awesome product and driving people to sign up for a paid plan."
      />
    </>
  );
}

export default FeedPage;
