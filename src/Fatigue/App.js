import React from "react";

import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";

import LinearProgress from "@material-ui/core/LinearProgress";

import { Button } from "@material-ui/core";

import { Stage, Layer, Image } from "react-konva";

import { AutoModal } from "../AutoModal.js";
import { Timer } from "../Timer.js";

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

class Item extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      question: "",
      replay: { type: "", choices: [] },
      content: props.content,
      item: 0,
      modal_open: false,
      modal_description: "",
      modal_title: "",
      progress: 0,
      progress_buffer: 0,
      face_width: 0,
      face_height: 0,
      write_width: 120,
      write_height: 120,
      canSubmit: false
    };
    this.ajax = new Ajax(props);

    this.submit = this.submit.bind(this);
    this.__submit = this.__submit.bind(this);
    this.handleClickButton = this.handleClickButton.bind(this);
    this.router = this.router.bind(this);

    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handlePointerOut = this.handlePointerOut.bind(this);
    this.handlePointerIn = this.handlePointerIn.bind(this);

    this.drawLine = this.drawLine.bind(this);
    this.addStroke = this.addStroke.bind(this);
    this.endDraw = this.endDraw.bind(this);
    this.clear = this.clear.bind(this);

    this.__start = this.__start.bind(this);
    this.__end = this.__end.bind(this);
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
    // console.log("end", this.props);
    const data = JSON.parse(JSON.stringify(this.state));
    data.content = this.props.content;
    data.item = this.state.item ? this.state.item : 0;
    this.ajax.submit(
      data,
      this.props.app + "/end/" + this.state.content + "/",
      () => {}
    );
  }
  __start() {
    const data = JSON.parse(JSON.stringify(this.state));
    data.content = this.props.content;
    data.item = this.state.item ? this.state.item : 0;
    this.ajax.submit(
      data,
      "biometrics/init/" + this.props.content + "/",
      () => {}
    );
  }
  __end() {
    // console.log("end", this.props);
    const data = JSON.parse(JSON.stringify(this.state));
    data.content = this.props.content;
    data.item = this.state.item ? this.state.item : 0;
    this.ajax.submit(
      data,
      "biometrics/end/" + this.props.content + "/",
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
            //////////////////////////////////////////////////
            const write_canvas = document.createElement("canvas");
            write_canvas.width = this.state.write_width;
            write_canvas.height = this.state.write_height;

            const write_context = write_canvas.getContext("2d");
            this.setState({ write_canvas, write_context });

            this.stroke = [];
            this.stroke_list = [];
            this.stroke_list_ = []; // This is strokes before submititation

            //////////////////////////////////////////////////
            this.start();
            this.__start();
            //////////////////////////////////////////////////
          };
        })
        .catch(function (error) {
          console.error(error);
          return;
        });
    }
  }

  handlePointerDown(e) {
    // console.log(e.evt);
    this.addStroke(e);
    this.lastPointerPosition = this.Image.getRelativePointerPosition();
    this.setState({
      isClear: e.evt.pointerType === "pen" && e.evt.button > 0,
      isDrawing: true,
      canSubmit: true
    });
  }

  handlePointerUp(e) {
    // console.log("Pointerup");
    this.setState({ isDrawing: false });
    this.endDraw(e);
  }

  handlePointerMove(e) {
    const { write_context, isDrawing, isClear } = this.state;

    if (isDrawing) {
      const pressure = this.Image.levels();
      write_context.strokeStyle = "#000000";
      write_context.lineJoin = "round";

      if (isClear) {
        write_context.globalCompositeOperation = "destination-out";
        write_context.lineWidth = 100 * pressure;
      } else {
        write_context.globalCompositeOperation = "source-over";
        write_context.lineWidth = 5;
      }
      this.drawLine();
      this.addStroke(e);
    }
  }
  addStroke(e) {
    const pos = this.Image.getRelativePointerPosition();
    this.stroke.push([pos.x, pos.y, e.evt.pressure, e.evt.tiltX, e.evt.tiltY]);
  }
  drawLine() {
    const { write_context } = this.state;
    write_context.beginPath();

    write_context.moveTo(
      this.lastPointerPosition.x,
      this.lastPointerPosition.y
    );

    const pos = this.Image.getRelativePointerPosition();
    write_context.lineTo(pos.x, pos.y);
    write_context.closePath();
    write_context.stroke();
    this.lastPointerPosition = pos;
    this.Image.getLayer().draw();
  }

  endDraw(e) {
    this.addStroke(e);
    this.stroke_list.push(this.stroke);
    this.stroke = [];
  }

  clear(e) {
    const { write_context } = this.state;
    if (write_context.globalCompositeOperation)
      write_context.globalCompositeOperation = "destination-out";
    write_context.fillRect(
      0,
      0,
      this.state.write_width,
      this.state.write_height
    );
    this.Image.getLayer().draw();
    this.stroke_list_ = this.stroke_list;
    this.stroke_list = [];
    this.stroke = [];
    this.setState({
      canSubmit: false
    });
  }

  handlePointerOut() {
    this.setState({ isDrawing: false });
  }
  handlePointerIn(e) {
    if (e.evt.pressure > 0) this.setState({ isDrawing: true });
  }
  /**
   * For examination
   */
  submit() {
    const data = JSON.parse(JSON.stringify(this.state));

    data.content = this.state.content;
    data.item = this.state.item;

    this.ajax.submit(
      data,
      this.props.app + "/" + this.props.view + "/" + this.state.content + "/",
      this.router
    );
  }
  /**
   * For biometrics
   */
  __submit() {
    const data = JSON.parse(JSON.stringify(this.state));

    // console.log(e);
    if (this.state.write_canvas) {
      data.write_image = this.state.write_canvas.toDataURL();
      data.stroke_list =
        this.stroke_list.length > 0 ? this.stroke_list : this.stroke_list_;
    }

    if (this.state.face_context) data.face_image = this.capture();

    data.content = this.state.content;
    data.item = this.state.item;
    data.submit = true;
    this.ajax.submit(data, "biometrics/signature-face-registajax/", (prop) => {
      // console.log(prop);
    });
  }

  handleClickButton(e) {
    this.submit();
    this.__submit();
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
    if (props.end) {
      this.setState({
        // capture: false,
        modal_description: props.modal_description,
        modal_open: true,
        message: props.message,
        item: props.item,
        progress: 100,
        progress_buffer: 100,
        link: "/"
      });
      this.end();
      this.__end();
    } else {
      this.setState({
        question: props.question,
        item: props.item,
        content: props.content,
        replay: props.replay,
        progress: props.progress,
        progress_buffer: props.progress_buffer
      });
    }
    this.clear();
  }

  setItem(props) {}
  render() {
    return (
      <>
        <Container maxWidth={this.props.tablet ? false : "xs"}>
          {this.props.tablet && (
            <span>
              <Grid>　</Grid>
              <Grid>　</Grid>
              <Grid>　</Grid>
              <Grid>　</Grid>
              <Grid>　</Grid>
              <Grid>　</Grid>
              <Grid>　</Grid>
              <Grid>　</Grid>
              <Grid>　</Grid>
              <Grid>　</Grid>
              <Grid>　</Grid>
              <Grid>　</Grid>
              <Grid>　</Grid>
              <Grid>　</Grid>
            </span>
          )}
          <Card>
            <CardHeader>
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <Typography>No.{this.state.item}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography>
                    <Timer
                      ref={(timer) => {
                        this.timer = timer;
                      }}
                    />
                  </Typography>
                </Grid>
              </Grid>
            </CardHeader>
            <LinearProgress
              variant="buffer"
              value={this.state.progress}
              valueBuffer={this.state.progress_buffer}
            />
            <CardContent>
              <Typography
                dangerouslySetInnerHTML={{
                  __html: this.state.question
                }}
              ></Typography>
            </CardContent>
            <CardActions>
              <Grid container spacing={3} direction="column">
                <Grid item xs={12}>
                  {this.state.content !== "fatigue" && (
                    <Button variant="contained" onClick={this.clear}>
                      Clear
                    </Button>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <Stage
                    width={this.state.write_width + 10}
                    height={this.state.write_height + 10}
                  >
                    <Layer>
                      <Image
                        image={this.state.write_canvas}
                        ref={(Image) => (this.Image = Image)}
                        stroke={"gray"}
                        width={this.props.write_width}
                        height={this.props.write_height}
                        onPointerDown={this.handlePointerDown}
                        onPointerUp={this.handlePointerUp}
                        onPointerMove={this.handlePointerMove}
                        onPointerOut={this.handlePointerOut}
                        onPointerIn={this.handlePointerIn}
                      />
                    </Layer>
                  </Stage>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={this.handleClickButton}
                    disabled={!this.state.canSubmit}
                  >
                    Submit
                  </Button>
                </Grid>
              </Grid>
            </CardActions>
          </Card>
        </Container>
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
    this.__end();
    this.end();
  }
}

// ========================================

export default function App(props) {
  return (
    <Item
      url={props.url}
      app={props.app}
      view={props.view}
      content={props.content}
      debug={props.debug}
      tablet={props.tablet}
    />
  );
}
