const peer = require("./peer-control");
peer.on("add-stream", (stream) => {
  play(stream);
});

const video = document.getElementById("screen-video");
// 播放视频
function play(stream) {
  video.srcObject = stream;
  video.onloadedmetadata = function () {
    video.play();
  };
}

// 注意，在这里绑定window事件
window.onkeydown = function (e) {
  // 将keydown的结果发送给peer
  // data：{keyCode, meta, alt, ctrl, shift}
  const data = {
    keyCode: e.keyCode,
    shift: e.shiftKey,
    meta: e.metaKey,
    alt: e.altKey,
    ctrl: e.ctrlKey, // 视频里写的是 control: e.ctrlKey，注意处理
  };
  peer.emit("robot", "key", data);
};

window.onmouseup = function (e) {
  // data：{clientX, clientY, screen: {width, height}, video: {width: height}}
  // screen: 傀儡端的screen
  const data = {};
  data.clientX = e.clientX;
  data.clientY = e.clientY;
  data.video = {
    // 使用getBoundingClientRect()拿到真实的宽高
    width: video.getBoundingClientRect().width,
    height: video.getBoundingClientRect().height,
  };
  peer.emit("robot", "mouse", data);
};
