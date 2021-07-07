// 傀儡端逻辑: 先createAnswer, 然后add stream
import { desktopCapturer, ipcRenderer } from "electron";
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
        console.log("add-stream", stream);
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
  // 告知其他人
  if (e.candidate) {
    ipcRenderer.send("forward", "puppet-candidate", e.candidate);
  }
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
ipcRenderer.on("offer", async (e, offer) => {
  const answer = await createAnswer(offer);
  ipcRenderer.send("forward", "answer", {
    type: answer.type,
    sdp: answer.sdp,
  });
});
async function createAnswer(offer) {
  let screenStream = await getScreenStream(); // 添加桌面流
  pc.addStream(screenStream);
  await pc.setRemoteDescription(offer); // 设置控制端的描述
  await pc.setLocalDescription(await pc.createAnswer()); // 设置本地会话描述
  console.log("answer", JSON.stringify(pc.localDescription));
  return pc.localDescription;
}
