import React from "react";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import Replay from "@material-ui/icons/Replay"
import Looks1 from "@material-ui/icons/LooksOneRounded"
import Looks2 from "@material-ui/icons/LooksTwoRounded"
import Looks3 from "@material-ui/icons/Looks3Rounded"
import { makeStyles } from "@material-ui/core/styles";
import Section from "./Section";

const useStyles = makeStyles((theme) => ({
  // Increase <Container> padding so it's
  // at least half of <Grid> spacing to
  // avoid horizontal scroll on mobile.
  // See https://material-ui.com/components/grid/#negative-margin
  container: {
    padding: `0 ${theme.spacing(4)}px`,
  },
  imageWrapper: {
    margin: "0 auto",
    maxWidth: 570,
    width: "100%",
    "& > img": {
      width: "100%",
    },
  },
  row: {
    // Spacing between rows
    "&:not(:last-child)": {
      marginBottom: `${theme.spacing(2)}px`,
    },
  },
}));

function DemoFeaturesSection(props) {
  const classes = useStyles();

  const items = [
    {
      title: "Reset",
      description:
        "Reset the demo",
      icon: Replay,
      iconColor: "primary.main",
    },
    {
      title: "Enter and publish",
      description:
        "At the state, we can publish ",
      icon: Looks1,
      iconColor: "primary.main",
    },
    {
      title: "Look at the feed",
      description:
        "Look the Atom feed using standard tools",
      icon: Looks2,
      iconColor: "primary.main",
    },
    {
      title: "Look at the receiver",
      description:
        "At the receiver, look at the recieved table",
      icon: Looks3,
      iconColor: "primary.main",
    },
  ];

  return (
    <Section
      bgColor={props.bgColor}
      size={props.size}
      bgImage={props.bgImage}
      bgImageOpacity={props.bgImageOpacity}
    >
      <Container className={classes.container}>
        <Grid container={true} alignItems="center" spacing={8}>
          <Grid container={true} item={true} direction="column" xs={12} md={6}>
            <figure className={classes.imageWrapper}>
              <img src={props.image} alt="" />
            </figure>
          </Grid>
          <Grid item={true} xs={12} md={6}>
            {items.map((item, index) => (
              <Grid
                className={classes.row}
                item={true}
                container={true}
                direction="row"
                justifyContent="center"
                alignItems="center"
                spacing={5}
                key={index}
              >
                <Grid item={true} xs="auto">
                  <Box
                    color={item.iconColor}
                    display="flex"
                    justifyContent="center"
                    fontSize={70}
                    width={70}
                    height={70}
                  >
                    <IconButton
                      color="primary.main"
                    >
                      <item.icon fontSize="large" />
                    </IconButton>
                  </Box>
                </Grid>
                <Grid item={true} xs={true}>
                  <Typography variant="h5" gutterBottom={true}>
                    {item.title}
                  </Typography>
                  <Typography variant="subtitle1">
                    {item.description}
                  </Typography>
                </Grid>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Container>
    </Section>
  );
}

export default DemoFeaturesSection;
