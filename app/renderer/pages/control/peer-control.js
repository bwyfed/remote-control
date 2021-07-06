// 模拟控制端收到了视频流的过程。P2P控制端的逻辑。

const EventEmitter = require("events");
// 业务逻辑是基于peer去做交互的:发生了事件，用 peer.emit()去发送一个事件，app.js再做对应的交互。
const peer = new EventEmitter();
// 以下应该是pear-puppet的代码。模拟桌面流捕捉的过程
const { desktopCapturer } = require("electron");
async function getScreenStream() {
  // 第1步：拿到source
  const sources = await desktopCapturer.getSources({
    types: ["screen"],
  });
  // 第2步：捕获桌面流
  navigator.webkitGetUserMedia(
    {
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: "desktop",
          chromeMediaSourceId: sources[0].id,
          maxWidth: window.screen.width,
          maxHeight: window.screen.height,
        },
      },
    },
    (stream) => {
      // 流捕获成功，给app.js发送事件add-stream
      peer.emit("add-stream", stream);
    },
    (err) => console.error(err)
  );
}
// 需要主动触发一下这个函数
getScreenStream();
module.exports = peer;
