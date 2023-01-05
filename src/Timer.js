import React from "react";

export class Timer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pass: 0
    };

    this.startTime = new Date();
  }
  componentDidMount() {
    setInterval(() => {
      this.setState({
        pass: Math.floor((new Date() - this.startTime) / 1000).toLocaleString()
      });
    }, 1000);
  }
  zfill(timeCode) {
    return timeCode >= 10 ? timeCode : "0" + timeCode;
  }
  timecode2hms(timeCode) {
    let hms = "";
    const h = (timeCode / 3600) | 0;
    const m = ((timeCode % 3600) / 60) | 0;
    const s = parseInt(timeCode, 10) % 60;

    if (h !== 0)
      hms = this.zfill(h) + "：" + this.zfill(m) + "：" + this.zfill(s);
    else if (m !== 0) hms = "00：" + this.zfill(m) + "：" + this.zfill(s);
    else hms = "00：00：" + this.zfill(s);
    return hms;
  }
  render() {
    return <span>{this.timecode2hms(this.state.pass)}</span>;
  }
}
