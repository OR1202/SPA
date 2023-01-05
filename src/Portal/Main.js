import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
// import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
// import Markdown from "./Markdown";

import Button from "@material-ui/core/Button";
// import Menu from "@material-ui/core/Menu";
// import MenuItem from "@material-ui/core/MenuItem";

const useStyles = makeStyles((theme) => ({
  markdown: {
    ...theme.typography.body2,
    padding: theme.spacing(3, 0)
  }
}));

export default function Main(props) {
  const classes = useStyles();
  const { posts, title } = props;

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Grid item xs={12} md={8}>
      <Button
        variant="h6"
        gutterBottom
        aria-controls="simple-menu"
        aria-haspopup="true"
        onClick={handleClick}
      >
        {title}
      </Button>
      <Divider />
    </Grid>
  );
}

Main.propTypes = {
  posts: PropTypes.array,
  title: PropTypes.string
};
