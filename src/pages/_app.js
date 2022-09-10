import React from "react";
import Navbar from "./../components/Navbar";
import IndexPage from "./index";
import AboutPage from "./about";
import FaqPage from "./faq";
import DemoPage from "./demo";
import StatePage from "./state"
import FeedPage from "./feed"
import CdcPage from "./cdc"
import { Switch, Route, Router } from "./../util/router";
import NotFoundPage from "./404";
import Footer from "./../components/Footer";
import { ThemeProvider } from "./../util/theme";

function App(props) {
  return (
    <ThemeProvider>
      <Router>
        <>
          <Navbar
            color="default"
            logo="transmitter.svg"
            logoInverted="transmitter.svg"
          />

          <Switch>
            <Route exact path="/" component={IndexPage} />

            <Route exact path="/about" component={AboutPage} />

            <Route exact path="/faq" component={FaqPage} />

            <Route exact path="/demo" component={DemoPage} />

            <Route exact path="/demo/state" component={StatePage} />

            <Route exact path="/demo/feed" component={FeedPage} />

            <Route exact path="/demo/cdc" component={CdcPage} />

            <Route component={NotFoundPage} />
          </Switch>

          <Footer
            bgColor="default"
            size="medium"
            bgImage=""
            bgImageOpacity={1}
            copyright={`© ${new Date().getFullYear()} Rick Hawes`}
            logo="transmitter.svg"
            logoInverted="transmitter.svg"
            sticky={true}
          />
        </>
      </Router>
    </ThemeProvider>
  );
}

export default App;
