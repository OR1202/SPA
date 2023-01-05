import React from "react";
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

import Portal from "./Portal/App";
import Fatigue from "./Fatigue/App";
import LandMarkCheck from "./LandMarkCheck/App";
import FaceRegistration from "./FaceRegistration/App";
import ConsentForm from "./ConsentForm/App";
import Note from "./Note/App";
// import Video from "./Video/App";

import { CssBaseline } from "@material-ui/core/";
import { Container } from "@material-ui/core/";
import Header from "./Portal/Header";
import Footer from "./Portal/Footer";

const DEBUG = true;
const TABLET = true;

const sections = [
  {
    title: "HOME",
    id: "home",
    url: "#",
    menus: [
      { title: "メッセージ受信一覧", url: "#" },
      { title: "アンケート回答", url: "#" },
      { title: "スケジュール登録", url: "#" },
      { title: "ブックマーク登録", url: "#" },
      { title: "メッセージ転送設定", url: "#" },
      { title: "キャビネット一覧", url: "#" },
      { title: "SEIKEI UniCareer", url: "#" },
      { title: "オフィスアワー検索", url: "#" }
    ]
  },
  {
    title: "授業関連",
    id: "lecture",
    url: "#",
    menus: [
      { title: "教務掲示一覧", url: "#" },
      { title: "出席確認", url: "#" },
      { title: "授業評価アンケート", url: "#" }
    ]
  },
  {
    title: "履修・成績関連",
    id: "score",
    url: "#",
    menus: [
      { title: "学生カルテ", url: "#" },
      { title: "My 時間割", url: "#" },
      { title: "履修登録", url: "#" },
      { title: "履修確認", url: "#" },
      { title: "成績紹介", url: "#" },
      { title: "資格確認", url: "#" }
    ]
  },
  {
    title: "シラバス",
    id: "syllabus",
    url: "#",
    menus: [
      { title: "シラバス検索", url: "#" },
      { title: "全文検索", url: "#" }
    ]
  },
  {
    title: "学生支援",
    id: "support",
    url: "#",
    menus: [
      { title: "住所変更登録", url: "#" },
      { title: "申請情報紹介", url: "#" },
      { title: "奨学金申請", url: "#" }
    ]
  },
  {
    title: "施設予約",
    id: "reservation",
    url: "#",
    menus: [{ title: "施設予約照会", url: "#" }]
  }
];

class Ajax {
  constructor(props) {
    this.props = props;
    this.state = {
      url: props.url,
      csrf: this.getCSRFtoken()
    };
    this.submit = this.submit.bind(this);
    this.cnt = 0;
  }
  getCSRFtoken() {
    for (let c of document.cookie.split(";")) {
      let cArray = c.split("=");
      if (cArray[0].replace(" ", "") === "csrftoken") return cArray[1];
    }
  }

  submit(data, view, callback) {
    if (DEBUG) {
      callback("test");
    } else {
      fetch(this.state.url + view, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": this.state.csrf
        },
        body: JSON.stringify(data)
      })
        .then((res) => res.json())
        .then((res) => {
          callback(res.user);
        });
    }
  }
}

function Layout(props) {
  return (
    <React.Fragment>
      <CssBaseline />
      <Container maxWidth="lg">
        <Header title="PORTAL" sections={sections} />
        <main>
          <Outlet />
        </main>
      </Container>
      <Footer title="" description="" />
    </React.Fragment>
  );
}

export default function App() {
  const [user, setUser] = useState("");
  // console.log(sessionStorage);

  useEffect(() => {
    const ajax = new Ajax({ url: "/" });
    ajax.submit({}, "signin/user/", setUser);
  }, [setUser]);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout user={user} />}>
          <Route index element={<Portal user={user} />} />
          <Route
            path="/fatigue"
            element={
              <Fatigue
                url={"/"}
                app={"exam"}
                view={"simple-writing-exam"}
                content={"fatigue"}
                user={user}
                debug={DEBUG}
                tablet={TABLET}
              />
            }
          />
          <Route
            path="/alphabet"
            element={
              <Fatigue
                url={"/"}
                app={"exam"}
                view={"simple-writing-exam"}
                content={"alphabet"}
                user={user}
                debug={DEBUG}
                tablet={TABLET}
              />
            }
          />
          <Route
            path="/number"
            element={
              <Fatigue
                url={"/"}
                app={"exam"}
                view={"simple-writing-exam"}
                content={"number"}
                user={user}
                debug={DEBUG}
                tablet={TABLET}
              />
            }
          />
          <Route
            path="/face-registration"
            element={
              <FaceRegistration user={user} debug={DEBUG} tablet={TABLET} />
            }
          />
          {/* <Route
            path="/check"
            element={<FaceCheck user={user} debug={DEBUG} />}
          />{" "} */}
          <Route
            path="/check"
            element={
              <LandMarkCheck user={user} debug={DEBUG} tablet={TABLET} />
            }
          />
          <Route
            path="/consent_form"
            element={<ConsentForm user={user} debug={DEBUG} tablet={TABLET} />}
          />
          <Route
            path="/consent_form"
            element={<Note user={user} debug={DEBUG} tablet={TABLET} />}
          />
          {/* <Route
            path="/consent_form"
            element={<Video user={user} debug={DEBUG} tablet={TABLET} />}
          /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
