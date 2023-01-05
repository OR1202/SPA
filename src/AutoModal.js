import React from "react";

import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
import Typography from "@material-ui/core/Typography";

import { Button } from "@material-ui/core";

import { makeStyles } from "@material-ui/core/styles";
import Modal from "@material-ui/core/Modal";
import Backdrop from "@material-ui/core/Backdrop";
import Fade from "@material-ui/core/Fade";

import { Link } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3)
  }
}));

export function AutoModal(props) {
  const classes = useStyles();
  return (
    <div>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        className={classes.modal}
        open={props.open}
        onClose={props.handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500
        }}
      >
        <Fade in={props.open}>
          {/* <div className={classes.paper}>
            <h2 id="transition-modal-title">{props.title}</h2>
            <p id="transition-modal-description">{props.description}</p>
          </div> */}
          <Card className={classes.paper}>
            <CardHeader id="transition-modal-title">
              <Typography variant="h3">{props.title}</Typography>
            </CardHeader>
            <CardContent id="transition-modal-description">
              <Typography>{props.description}</Typography>
            </CardContent>
            {props.handleClose && (
              <CardActions>
                {props.link ? (
                  <Button variant="contained" component={Link} to={props.link}>
                    Close
                  </Button>
                ) : (
                  <Button variant="contained" onClick={props.handleClose}>
                    Close
                  </Button>
                )}
              </CardActions>
            )}
          </Card>
        </Fade>
      </Modal>
    </div>
  );
}
