import React, { useState } from "react";
import AppBar from "@material-ui/core/AppBar";
import Container from "@material-ui/core/Container";
import Toolbar from "@material-ui/core/Toolbar";
import Hidden from "@material-ui/core/Hidden";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import Button from "@material-ui/core/Button";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Section from "./Section";
import { Link } from "./../util/router";
import { useDarkMode } from "./../util/theme";
import { Link as RouterLink } from "react-router-dom";
import { Route } from "react-router-dom";


const useStyles = makeStyles((theme) => ({
  logo: {
    height: 28,
    marginRight: theme.spacing(2),
  },
  drawerList: {
    width: 250,
  },
  spacer: {
    flexGrow: 1,
  },
}));


function SimpleBreadcrumbs() {
  return (
    <Route>
      {({ location }) => {
        const pathnames = location.pathname.split("/").filter(x => x);
        return (
          <Breadcrumbs aria-label="Breadcrumb">
            {
              pathnames.length == 0 ? (
                <Typography color="textPrimary" variant="h5">
                  EpiCast
                </Typography>
              ) : (
                <RouterLink to="/">
                  <Typography color="textPrimary" variant="h5" >
                    EpiCast
                  </Typography>
                </RouterLink>
              )
            }
            {pathnames.map((value, index) => {
              const last = index === pathnames.length - 1;
              const to = `/${pathnames.slice(0, index + 1).join("/")}`;

              return last ? (
                <Typography color="textPrimary" key={to} variant="h5">
                  {value}
                </Typography>
              ) : (
                <RouterLink to={to} key={to}>
                  <Typography color="textPrimary" key={to} variant="h5">
                    {value}
                  </Typography>
                </RouterLink>
              );
            })}
          </Breadcrumbs>
        );
      }}
    </Route>
  );
}

function Navbar(props) {
  const classes = useStyles();

  const darkMode = useDarkMode();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuState, setMenuState] = useState(null);

  // Use inverted logo if specified
  // and we are in dark mode
  const logo = props.logoInverted && darkMode.value ? props.logoInverted : props.logo;

  const handleOpenMenu = (event, id) => {
    // Store clicked element (to anchor the menu to)
    // and the menu id so we can tell which menu is open.
    setMenuState({ anchor: event.currentTarget, id });
  };

  const handleCloseMenu = () => {
    setMenuState(null);
  };

  return (
    <Section bgColor={props.color} size="auto">
      <AppBar position="static" color="transparent" elevation={0}>
        <Container disableGutters={true}>
          <Toolbar>
            <Link to="/">
              <img src={process.env.PUBLIC_URL + "/" + logo} alt="Logo" className={classes.logo} />
            </Link>
            <SimpleBreadcrumbs />
            <div className={classes.spacer} />
            <Hidden mdUp={true} implementation="css">
              <IconButton
                onClick={() => {
                  setDrawerOpen(true);
                }}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
            </Hidden>
            <Hidden smDown={true} implementation="css">
              <Button component={Link} to="/about" color="inherit">
                About
              </Button>
              <Button component={Link} to="/faq" color="inherit">
                FAQ
              </Button>
            </Hidden>
          </Toolbar>
        </Container>
      </AppBar>
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <List
          className={classes.drawerList}
          onClick={() => setDrawerOpen(false)}
        >
          <ListItem component={Link} to="/about" button={true}>
            <ListItemText>About</ListItemText>
          </ListItem>
          <ListItem component={Link} to="/faq" button={true}>
            <ListItemText>FAQ</ListItemText>
          </ListItem>
        </List>
      </Drawer>
    </Section>
  );
}

export default Navbar;
