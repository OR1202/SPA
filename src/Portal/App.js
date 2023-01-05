import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import GitHubIcon from "@material-ui/icons/GitHub";
import FacebookIcon from "@material-ui/icons/Facebook";
import TwitterIcon from "@material-ui/icons/Twitter";
import FeaturedPost from "./FeaturedPost";
import Sidebar from "./Sidebar";

const useStyles = makeStyles((theme) => ({
  mainGrid: {
    marginTop: theme.spacing(3)
  }
}));

const featuredPosts = [
  {
    title: "Check",
    // date: "Nov 12",
    description: "チェック",
    // image: "https://source.unsplash.com/random",
    // imageText: "Image Text"
    url: "check"
  },
  {
    title: "Consent Form",
    // date: "Nov 12",
    description: "同意書",
    // image: "https://source.unsplash.com/random",
    // imageText: "Image Text"
    url: "consent_form"
  },
  {
    title: "Write",
    // date: "Nov 12",
    description: "筆記練習",
    // image: "https://source.unsplash.com/random",
    // imageText: "Image Text"
    url: "alphabet"
  },
  {
    title: "Face",
    // date: "Nov 12",
    description: "顔登録",
    // image: "https://source.unsplash.com/random",
    // imageText: "Image Text"
    url: "face-registration"
  },
  {
    title: "Write",
    // date: "Nov 12",
    description: "筆記登録",
    // image: "https://source.unsplash.com/random",
    // imageText: "Image Text"
    url: "number"
  },
  {
    title: "Exam",
    // date: "Nov 12",
    description: "テスト",
    // image: "https://source.unsplash.com/random",
    // imageText: "Image Text"
    url: "fatigue"
  }
];

const sidebar = {
  title: "ログイン",
  description: "ユーザー",
  archives: [
    { title: "メッセージ", url: "#" },
    { title: "アンケート一覧", url: "#" },
    { title: "スケジュール登録", url: "#" },
    { title: "Myツール", url: "#" },
    { title: "外部リンク", url: "#" }
  ],
  social: [
    { name: "GitHub", icon: GitHubIcon, url: "https://github.com/OR1202" },
    { name: "Twitter", icon: TwitterIcon, url: "https://twitter.com/s02889" },
    {
      name: "Facebook",
      icon: FacebookIcon,
      url: "https://www.facebook.com/KawamataTaisuke"
    }
  ]
};

export default function Portal(props) {
  const classes = useStyles();

  return (
    <Grid container spacing={4}>
      <Grid item xl={10} lg={10} sm={8}>
        <Grid container spacing={2}>
          {featuredPosts.map((post) => (
            <FeaturedPost key={post.title} post={post} />
          ))}
        </Grid>
      </Grid>
      <Grid item xl={2} lg={2} sm={4}>
        <Grid container className={classes.mainGrid}>
          <Sidebar
            title={sidebar.title}
            description={sidebar.description}
            archives={sidebar.archives}
            social={sidebar.social}
            user={props.user}
          />
        </Grid>
      </Grid>
    </Grid>
  );
}
