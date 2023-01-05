import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import { Toolbar } from "@material-ui/core";
import { Button } from "@material-ui/core";
// import IconButton from "@material-ui/core/IconButton";
// import SearchIcon from "@material-ui/icons/Search";
import Typography from "@material-ui/core/Typography";
// import Link from "@material-ui/core/Link";

import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";

const useStyles = makeStyles((theme) => ({
  toolbar: {
    borderBottom: `1px solid ${theme.palette.divider}`
  },
  toolbarTitle: {
    flex: 1
  },
  toolbarSecondary: {
    justifyContent: "space-between",
    overflowX: "auto"
  },
  toolbarLink: {
    padding: theme.spacing(1),
    flexShrink: 0
  }
}));

function getCSRFtoken() {
  for (let c of document.cookie.split(";")) {
    let cArray = c.split("=");
    if (cArray[0].replace(" ", "") === "csrftoken") return cArray[1];
  }
}

function MultipleMenuItem(props) {
  const classes = useStyles();
  const { title, menus } = props;

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <div key={title}>
      <Button
        aria-controls={title + "-menu"}
        aria-haspopup="true"
        onClick={handleClick}
        color="inherit"
        noWrap
        // variant="body2"
        className={classes.toolbarLink}
      >
        {title}
      </Button>
      <Menu
        id={title + "-menu"}
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {menus.map((menu) => (
          <MenuItem key={title + "-" + menu.title} onClick={handleClose}>
            {menu.title}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}

export default function Header(props) {
  const classes = useStyles();
  const { sections, title } = props;

  return (
    <React.Fragment>
      <Toolbar className={classes.toolbar}>
        {/* <Button size="small">Subscribe</Button> */}
        {/* <img src="./logo.jpg" /> */}
        <Typography
          component="h2"
          variant="h5"
          color="inherit"
          align="center"
          noWrap
          className={classes.toolbarTitle}
        >
          {title}
        </Typography>
        {/* <IconButton>
          <SearchIcon />
        </IconButton> */}
        <form name="logout" method="post" action="/signin/signout/">
          <input
            type="hidden"
            name="csrfmiddlewaretoken"
            value={getCSRFtoken()}
          />
          <Button type="submit" variant="outlined" size="small">
            ログアウト
          </Button>
        </form>
      </Toolbar>
      <Toolbar
        component="nav"
        variant="dense"
        className={classes.toolbarSecondary}
      >
        {sections.map((section) => (
          <MultipleMenuItem
            key={section.title}
            title={section.title}
            menus={section.menus}
          />
        ))}
      </Toolbar>
    </React.Fragment>
  );
}

Header.propTypes = {
  sections: PropTypes.array,
  title: PropTypes.string
};
