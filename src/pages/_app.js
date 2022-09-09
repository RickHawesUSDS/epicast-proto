import React from "react";
import Navbar from "./../components/Navbar";
import IndexPage from "./index";
import AboutPage from "./about";
import FaqPage from "./faq";
import DemoPage from "./demo";
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
            logo="https://uploads.divjoy.com/logo.svg"
            logoInverted="https://uploads.divjoy.com/logo-white.svg"
          />

          <Switch>
            <Route exact path="/" component={IndexPage} />

            <Route exact path="/about" component={AboutPage} />

            <Route exact path="/faq" component={FaqPage} />

            <Route exact path="/demo" component={DemoPage} />

            <Route component={NotFoundPage} />
          </Switch>

          <Footer
            bgColor="default"
            size="medium"
            bgImage=""
            bgImageOpacity={1}
            copyright={`© ${new Date().getFullYear()} Company`}
            logo="https://uploads.divjoy.com/logo.svg"
            logoInverted="https://uploads.divjoy.com/logo-white.svg"
            sticky={true}
          />
        </>
      </Router>
    </ThemeProvider>
  );
}

export default App;
