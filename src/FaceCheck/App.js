import React from "react";

import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import CardActions from "@material-ui/core/CardActions";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";

import Button from "@material-ui/core/Button";
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
          console.log(res);
          callback(res);
        });
    }
  }
}

class WebcamCapture extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      question: "画面を向いてください",
      content: "check",
      item: 0,
      modal_open: false,
      modal_description: "",
      modal_title: "",
      face_width: 0,
      face_height: 0
    };

    this.ajax = new Ajax(props);
    this.capture = this.capture.bind(this);
    this.router = this.router.bind(this);
    this.submit = this.submit.bind(this);
    this.imageView = this.imageView.bind(this);

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
      this.router
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
  componentDidMount() {
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
            // this.submit();

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
  submit() {
    const data = JSON.parse(JSON.stringify(this.state));

    data.face_image = this.capture();

    this.ajax.submit(
      data,
      this.props.app + "/" + this.props.view + "/",
      this.router
    );
  }
  imageView(props) {
    const img = new Image();
    img.src = this.capture();
    img.onload = () => {
      const face_canvas = document.getElementById("result");
      if (face_canvas) {
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
      }
    };
  }

  router(props) {
    this.imageView(props);

    if (document.getElementById("result"))
      // TODO: Improve
      this.settimeout = setTimeout(this.submit, 100);
  }

  render() {
    return (
      <Container maxWidth={this.props.tablet ? false : "md"}>
        <Card>
          <CardHeader>
            <Typography variant="h3">環境の確認</Typography>
          </CardHeader>
          <CardContent>
            <Typography variant="h5">{this.state.question}</Typography>
          </CardContent>
          <CardMedia>
            {" "}
            <canvas
              id={"result"}
              width={this.state.face_width}
              height={this.state.face_height}
            />
          </CardMedia>
          <CardActions>
            <Button
              variant="contained"
              color="primary"
              component={Link}
              to={"/"}
              onClick={() => {
                clearTimeout(this.settimeout);
              }}
            >
              End
            </Button>
          </CardActions>
        </Card>
      </Container>
    );
  }

  componentWillUnmount() {
    this.end();
    clearTimeout(this.settimeout);
  }
}

export default function App(props) {
  return (
    <WebcamCapture
      url={"/"}
      app={"biometrics"}
      view={"checkjson"}
      content={"check"}
      debug={props.debug}
      tablet={props.tablet}
    />
  );
}
