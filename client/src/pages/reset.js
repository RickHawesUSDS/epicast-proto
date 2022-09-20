import React from "react";
import Meta from "./../components/Meta";
import HeroSection2 from "./../components/HeroSection2";
import { Container } from "@material-ui/core"
import { Button } from "@material-ui/core";
import { useHistory } from "react-router-dom";


function ResetPage(props) {
  const history = useHistory();

  async function onReset() {
    const resetUrl =  '/api/system/reset'
    await fetch(resetUrl, {method: 'POST'})
      .then((response) => {
        console.log('Success: ' + response.status)
      })
      .catch((error) => {
        console.error('Error:', error)
      })
    history.push('/demo')
  }

  return (
    <>
      <Meta title="Reset" />
      <HeroSection2
        bgColor="default"
        size="medium"
        bgImage=""
        bgImageOpacity={1}
        title="Reset"
        subtitle="Reset the demo by resetting the cases database and clearing the feed."
      />
      <Container align="center">
        <Button
          variant="contained"
          size="large"
          color="primary"
          onClick={() => {
            onReset()
          }}
        >
          Reset
        </Button>
      </Container>
    </>
  );
}

export default ResetPage;