const peer = require("./peer-control");
peer.on("add-stream", (stream) => {
  play(stream);
});
// 播放视频
function play(stream) {
  const video = document.getElementById("screen-video");
  video.srcObject = stream;
  video.onloadedmetadata = function () {
    video.play();
  };
}
