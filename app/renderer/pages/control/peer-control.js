// 模拟控制端收到了视频流的过程。P2P控制端的逻辑。

const EventEmitter = require("events");
// 业务逻辑是基于peer去做交互的:发生了事件，用 peer.emit()去发送一个事件，app.js再做对应的交互。
const peer = new EventEmitter();

// 傀儡端监听鼠标键盘事件
// peer.on("robot", (type, data) => {
//   if (type === "mouse") {
//     data.screen = { width: window.screen.width, height: window.screen.height };
//   }
//   ipcRenderer.send("robot", type, data);
// });
const pc = new window.RTCPeerConnection({});
// onicecandidate iceEvent
// addIceCandidate
pc.onicecandidate = function (e) {
  console.log("candidate", JSON.stringify(e.candidate));
  ipcRenderer.send("forward", "control-candidate", e.candidate);
  // 告知其他人
};
ipcRenderer.on("candidate", (e, candidate) => {
  addIceCandidate(candidate);
});
let candidates = [];
async function addIceCandidate(candidate) {
  if (candidate) {
    candidates.push(candidate);
  }
  if (pc.remoteDescription && pc.remoteDescription.type) {
    for (let i = 0; i < candidates.length; i++) {
      await pc.addIceCandidate(new RTCIceCandidate(candidates[i]));
    }
    candidates = [];
  }
}
async function createOffer() {
  const offer = await pc.createOffer({
    offerToReceiveAudio: false,
    offerToReceiveVideo: true, // 这里只用到视频
  });
  await pc.setLocalDescription(offer);
  console.log("pc offer", JSON.stringify(offer));
  return pc.localDescription;
}
createOffer().then((offer) => {
  console.log("forward", "offer", offer);
  // 转发到傀儡端
  ipcRenderer.send("forward", "offer", { type: offer.type, sdp: offer.sdp });
});

ipcRenderer.on("answer", (e, answer) => {
  setRemote(answer);
});

// 发送到傀儡端
async function setRemote(answer) {
  await pc.setRemoteDescription(answer);
}
// 为了便于演示，直接挂载在全局
window.setRemote = setRemote;
pc.onaddstream = function (e) {
  console.log("add stream", e);
  peer.emit("add-stream", e.stream); // 抛给外层
};
module.exports = peer;
