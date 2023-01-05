import React from "react";

import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import CardActions from "@material-ui/core/CardActions";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";

import LinearProgress from "@material-ui/core/LinearProgress";

import Button from "@material-ui/core/Button";

import { AutoModal } from "../AutoModal.js";

import { Link } from "react-router-dom";

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
      this.cnt++;
      callback({
        success: true,
        results: [[100, 100, 200, 200]],
        modal_open: true,
        modal_description:
          this.cnt === 100 ? "顔画像の登録に成功しました" : "test_description",
        end: this.cnt === 100,
        modal_title: "test",
        progress: this.cnt,
        isLoad: true
      });
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
          callback(res);
        });
    }
  }
}

class WebcamCapture extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      capture: true,
      face_width: 0,
      face_height: 0,
      message: "STARTボタンを押すと登録が始まります",
      modal_open: false,
      modal_description: "",
      modal_title: "",
      progress: 0
    };

    this.capture = this.capture.bind(this);
    this.imageView = this.imageView.bind(this);

    this.ajax = new Ajax(props);
    this.submit = this.submit.bind(this);
    this.router = this.router.bind(this);
    this.init = this.init.bind(this);
    this.start = this.start.bind(this);
    this.end = this.end.bind(this);
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

  componentDidMount() {
    this.init();

    const face_canvas = document.createElement("canvas");
    const face_context = face_canvas.getContext("2d");
    const video = document.createElement("video");
    if (navigator.mediaDevices) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((stream) => {
          video.srcObject = stream;
          video.play();
          video.onloadedmetadata = (e) => {
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
            //////////////////////////////////////////////////
          };
        })
        .catch(function (error) {
          console.error(error);
          return;
        });
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
  imageView(props) {
    const img = new Image();
    img.src = this.image;
    img.onload = () => {
      const face_canvas = document.getElementById("result");
      const face_context = face_canvas.getContext("2d");
      face_context.drawImage(
        img,
        0,
        0,
        this.state.face_width,
        this.state.face_height
      ); //
      if (props.success) {
        face_context.strokeStyle = "red"; // 矩形色
        face_context.lineWidth = 2; // 矩形線幅
        props.results.forEach((result, i) => {
          face_context.strokeRect(result[0], result[1], result[2], result[3]);
        });
      }
    };
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
        {/* <Loading isLoad={this.state.isLoad} progress={this.state.progress} /> */}
        <Container maxWidth={this.props.tablet ? false : "md"}>
          <Card>
            <CardHeader>
              <Typography variant="h3">Face Registration</Typography>
            </CardHeader>
            <CardContent>
              <Typography variant="h5">{this.state.message}</Typography>
              {this.state.capture && (
                <LinearProgress
                  variant="determinate"
                  value={this.state.progress}
                />
              )}
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  this.router({ end: false });
                }}
                disabled={this.state.capture}
              >
                Start
              </Button>
            </CardActions>
            <CardMedia>
              {" "}
              <canvas
                id={"result"}
                width={this.state.face_width}
                height={this.state.face_height}
              />
            </CardMedia>
          </Card>
        </Container>{" "}
        <AutoModal
          open={this.state.modal_open}
          handleClose={() => this.setState({ modal_open: false })}
          description={this.state.modal_description}
          title={this.state.modal_title}
          component={Link}
          to={this.state.link}
        />{" "}
      </>
    );
  }
  componentWillUnmount() {
    clearTimeout(this.settimeout);
    this.end();
  }
}

export default function App(props) {
  return (
    <WebcamCapture
      url={"/"}
      app={"biometrics"}
      view={"face-registajax"}
      content={"face-registration"}
      item={0}
      debug={props.debug}
    />
  );
}
