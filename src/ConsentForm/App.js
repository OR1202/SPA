import React from "react";

import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";

import { Button } from "@material-ui/core";

import { Stage, Layer, Image } from "react-konva";

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
      console.log(data, view);
      this.cnt++;
      if (data.write_image)
        callback({
          success: true,
          message:
            this.cnt === 1
              ? "署名の登録に成功しました"
              : "あと" + (5 - this.cnt) + "回氏名を記述してください",
          modal_open: false,
          modal_description: this.cnt === 5 ? "署名の登録に成功しました" : "",
          end: this.cnt === 5,
          modal_title: "test",
          progress: (this.cnt / 5) * 100,
          isLoad: true
        });
    } else {
      console.log(data, view, callback);
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
          console.log(res);
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
      content: "consent_form",
      item: 0,
      modal_open: false,
      modal_description: "",
      modal_title: "",
      progress: 0,
      progress_buffer: 0,
      face_width: 0,
      face_height: 0,
      write_width: 600,
      write_height: 120
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
            this.image_list = [];
            this.start();
          };
        })
        .catch(function (error) {
          console.error(error);
          return;
        });
    }
  }

  handlePointerDown(e) {
    this.setState({
      isClear: e.evt.pointerType === "pen" && e.evt.button > 0,
      isDrawing: true
    });
    this.addStroke(e);
    this.lastPointerPosition = this.Image.getRelativePointerPosition();
  }

  handlePointerUp(e) {
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
    this.__submit(e);
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
    this.stroke_list = [];
    this.stroke = [];
    this.render();
  }

  handlePointerOut() {
    this.setState({ isDrawing: false });
  }
  handlePointerIn(e) {
    if (e.evt.pressure > 0) this.setState({ isDrawing: true });
  }

  /**
   * Get face and write information during sigunature
   */
  __submit(e) {
    if (e) {
      const data = JSON.parse(JSON.stringify(this.state));

      data.write_image = this.state.write_canvas.toDataURL();
      data.stroke = this.stroke;

      data.face_image = this.capture();

      if (e.target.innerHTML === "SUBMIT") {
        data.submit = true;
      }
      Object.assign(data, {
        param: {
          target: e.target,
          screenX: e.screenX,
          screenY: e.screenY,
          clientX: e.clientX,
          clientY: e.clientY,
          pageX: e.pageX,
          pageY: e.pageY,
          layerX: e.layerX,
          layerY: e.layerY
        }
      });
      this.ajax.submit(
        data,
        this.props.app + "/" + this.props.view + "/",
        (prop) => {
          console.log(prop);
        }
      );
    }
  }
  /**
   * Get face and write information at submition
   */
  submit() {
    const data = JSON.parse(JSON.stringify(this.state));

    if (this.state.write_canvas) {
      data.write_image = this.state.write_canvas.toDataURL();
      data.stroke_list = this.stroke_list;
    }

    if (this.state.face_context) data.face_image = this.capture();

    data.content = this.state.content;
    data.item = this.state.item;
    data.submit = true;

    this.ajax.submit(
      data,
      this.props.app + "/" + this.props.view + "/",
      this.router
    );
  }

  handleClickButton(e) {
    this.submit(e);
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
    if (props.success) {
      this.setState({
        // capture: false,
        modal_description: "ありがとうございます．",
        modal_open: true,
        item: props.item,
        progress: 100,
        progress_buffer: 100,
        link: "/"
      });
    } else {
      this.setState({
        // capture: false,
        modal_description: "再度署名をお願いいたします．",
        modal_open: true,
        item: props.item,
        progress: 0,
        progress_buffer: 0
      });
    }
    this.clear();
  }

  setItem(props) {}
  render() {
    return (
      <>
        <Container maxWidth="md">
          <Card>
            <CardHeader>
              <Typography variant="h3">実験参加の同意書</Typography>
            </CardHeader>
            <CardContent>
              <Typography>
                今回参加をお願いする実験では、被験者を正面から撮影した画像と、筆跡情報を採取したいと考えております。
              </Typography>
              <Typography>
                実験によって得られたデータについては、統計的に処理した結果のみを学会等で発表し，
                個別的なデータを個人が特定可能な形で公開することはありません。
                また、個人情報を含むすべてのデータは外部に漏洩することのないように匿名化して厳重に管理し、
                個人情報については再実験または事故が生じたときの連絡以外の目的には使用いたしません。{" "}
              </Typography>
              <Typography>
                研究へのご協力にご承諾いただける場合には、ご署名をお願いいたします。{" "}
              </Typography>
            </CardContent>
            <CardActions>
              <Grid container spacing={3} direction="column">
                <Grid item xs={12}>
                  <Button variant="contained" onClick={this.clear}>
                    Clear
                  </Button>
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
                    disabled={
                      this.stroke &&
                      this.stroke.length === 0 &&
                      this.stroke_list.length === 0
                    }
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
    this.end();
  }
}

// ========================================

export default function App(props) {
  return (
    <Item
      url={"/"}
      app={"biometrics"}
      view={"signature-face-registajax"}
      debug={props.debug}
      content={"consent-form"}
    />
  );
}
