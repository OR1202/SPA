import React, { Component } from "react";
// import "./App.css";
import "video-react/dist/video-react.css"; // import css
import { Player } from "video-react";

import { AutoModal } from "../AutoModal.js";

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
    if (this.props.debug) {
      console.log(data, view, callback);
      this.cnt++;

      const end = 100;

      let question = "";
      if (this.props.content === "fatigue") {
        question =
          Math.round(Math.random() * 10) + "+" + Math.round(Math.random() * 10);
      } else if (this.props.content === "number") {
        question = this.props.content;
      } else if (this.props.content === "alphabet") {
        question = "A";
      }
      const props = {
        content: "test",
        item: 1,
        question: question,
        modal_open: false,
        modal_description:
          this.cnt > end ? "実験は終了です．お疲れ様でした．" : "",
        end: this.cnt > end,
        modal_title: "test",
        progress: this.cnt / end
      };
      callback(props);
    } else {
      fetch(this.state.url + view, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": this.state.csrf // CSRFトークン
        },
        body: JSON.stringify(data)
      })
        .then((res) => res.json())
        .then((res) => {
          // console.log(res);
          callback(res);
        });
    }
  }
}

class VideoPlayer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      content: props.content,
      item: 0,
      modal_open: false,
      modal_description: "",
      modal_title: "",
      src: props.src,
      type: props.type,
      currentTime: null,
      volume: null,
      muted: null,
      isFullscreen: null,
      clientHeight: null,
      clientWidth: null
    };

    this.ajax = new Ajax(props);
    this.submit = this.submit.bind(this);
    this.router = this.router.bind(this);
    this.init = this.init.bind(this);
    this.start = this.start.bind(this);
    this.end = this.end.bind(this);
    this.pre_item = 0;

    // this.onStart = this.onStart.bind(this);
    // this.onPlay = this.onPlay.bind(this);
    // this.onPause = this.onPause.bind(this);
    // this.onEnded = this.onEnded.bind(this);
    // this.onProgress = this.onProgress.bind(this);

    // sessionStorage.setItem("list", ["a", "b"]);
    // console.log(sessionStorage.getItem("list")[1]);
  }
  start() {
    const data = JSON.parse(JSON.stringify(this.state));
    data.content = this.props.content;
    data.item = this.state.item ? this.state.item : 0;
    this.ajax.submit(
      data,
      this.props.app + "/init/" + this.props.content + "/",
      () => {}
    );
  }
  end() {
    const data = JSON.parse(JSON.stringify(this.state));
    data.content = this.props.content;
    data.item = this.state.item ? this.state.item : 0;
    this.ajax.submit(
      data,
      this.props.app + "/end/" + this.state.content + "/",
      () => {}
    );
  }

  init() {
    this.contentStartTime = new Date();
    this.itemStartTime = this.contentStartTime; // TODO: Require to initialize at item changing
    setInterval(() => {
      this.setState({
        content_time: Math.floor(
          (new Date() - this.contentStartTime) / 1000
        ).toLocaleString(),
        item_time: Math.floor(
          (new Date() - this.itemStartTime) / 1000
        ).toLocaleString()
      });
    }, 1000);
  }
  /**
   * 初期化
   * コンポーネントがマウントされた直後にコール
   */
  componentDidMount() {
    this.player.subscribeToStateChange(this.handleStateChange.bind(this));
    const face_canvas = document.createElement("canvas");
    const face_context = face_canvas.getContext("2d");
    const video = document.createElement("video");
    if (navigator.mediaDevices) {
      // navigator.mediaDevices.enumerateDevices().then((devices) => {
      //   console.log(devices);
      //   devices.forEach((device) => {
      //     if (device.kind === "videoinput") console.log(device);
      //   });
      // });

      navigator.mediaDevices
        .getUserMedia({
          video: true,
          audio: false
        })
        .then((stream) => {
          video.srcObject = stream;

          video.onloadedmetadata = (e) => {
            // this.submit();

            video.play();

            face_canvas.width = video.videoWidth;
            face_canvas.height = video.videoHeight;
            //////////////////////////////////////////////////
            this.setState({
              capture: false,
              video: video,
              face_canvas: face_canvas,
              face_context: face_context,
              face_width: video.videoWidth,
              face_height: video.videoHeight,
              content_time: 0,
              item_time: 0
            });
            this.start();
            // const test = document.getElementById("result");
            // test.srcObject = stream;
            // test.play();
            //////////////////////////////////////////////////
          };
        })
        .catch(function (error) {
          console.error(error);
          return;
        });
    }
  }
  /**
   * 状態
   * 状態が変化された時にコール
   * @param {state} state 状態
   */
  handleStateChange(state) {
    const { player } = this.player.getState();
    this.setState({
      player: state,
      currentTime: player.currentTime,
      volume: player.volume,
      isFullscreen: player.isFullscreen,
      clientHeight: document.body.clientHeight,
      clientWidth: document.body.clientWidth
    });
    sessionStorage.setItem("currentTime", player.currentTime);
    sessionStorage.setItem("volume", player.volume);
    sessionStorage.setItem("isFullscreen", player.isFullscreen);
    sessionStorage.setItem("clientHeight", document.body.clientHeight);
    sessionStorage.setItem("clientWidth", document.body.clientWidth);

    if (player.currentTime - this.pre_item > 1) {
      this.submit();
      this.pre_item = player.currentTime;
    }
  }

  submit() {
    const data = JSON.parse(JSON.stringify(this.state));
    data.content = this.props.content;
    data.item = this.props.item;

    if (this.state.face_context) {
      data.face_image = this.capture();
      this.image = data.face_image; // for visible to detection results
    }

    this.ajax.submit(
      data,
      this.props.app + "/" + this.props.view + "/",
      this.router
    );
    this.image = data.face_image;
  }
  capture() {
    this.state.face_context.drawImage(
      this.state.video,
      0,
      0,
      this.state.face_width,
      this.state.face_height
    );
    return this.state.face_canvas.toDataURL();
  }

  router(props) {
    this.imageView(props);
    this.setState({
      isLoad: true,
      progress: props.progress
    });
    if (props.end) {
      // end
      const item = this.state.item;
      this.setState({
        capture: false,
        modal_description: "正常に登録できました．",
        modal_open: true,
        message: props.message,
        item: item + 1,
        link: "/"
      });
      this.itemStartTime = 0;
      this.image = "";
      this.end();
    } else {
      // continue
      if (document.getElementById("result"))
        this.settimeout = setTimeout(() => {
          this.capture();
          this.submit();
        }, 100);
      this.setState({
        capture: true,
        message: props.message,
        modal_description: props.modal_description
      });
    }
  }

  render() {
    return (
      <>
        <Player
          ref={(player) => {
            this.player = player;
          }}
          src={this.state.src}
          type={this.state.type}
        ></Player>
        <AutoModal
          open={this.state.modal_open}
          handleClose={() => this.setState({ modal_open: false })}
          description={this.state.modal_description}
          title={this.state.modal_title}
          link={this.state.link}
        />
      </>
    );
  }
  componentWillUnmount() {
    sessionStorage.clear();
    this.end();
  }
}

export default function App(props) {
  return (
    <VideoPlayer
      url={props.url}
      app={props.app}
      view={props.view}
      content={props.content}
      debug={props.debug}
      src={"https://media.w3.org/2010/05/sintel/trailer_hd.mp4"}
      type={"video/mp4"}
    />
  );
}
