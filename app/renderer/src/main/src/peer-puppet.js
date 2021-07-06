// 傀儡端逻辑: 先createAnswer, 然后add stream
import { desktopCapturer } from "electron";
// 获取桌面流
async function getScreenStream() {
  // 第1步：拿到source
  const sources = await desktopCapturer.getSources({
    types: ["screen"],
  });
  // 第2步：捕获桌面流
  return new Promise((resolve, reject) => {
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
        // peer.emit("add-stream", stream);
        resolve(stream);
      },
      (err) => {
        // handle error
        console.error(err);
        reject(err);
      }
    );
  });
}
const pc = new window.RTCPeerConnection({});
pc.onicecandidate = function (e) {
  console.log("candidate", JSON.stringify(e.candidate));
};
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

window.addIceCandidate = addIceCandidate;
async function createAnswer(offer) {
  let screenStream = await getScreenStream(); // 添加桌面流
  pc.addStream(screenStream);
  await pc.setRemoteDescription(offer); // 设置控制端的描述
  await pc.setLocalDescription(await pc.createAnswer()); // 设置本地会话描述
  console.log("answer", JSON.stringify(pc.localDescription));
  return pc.localDescription;
}
window.createAnswer = createAnswer; // 挂载在全局上，便于控制台调用
