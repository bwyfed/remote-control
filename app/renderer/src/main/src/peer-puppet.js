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
// 收到数据通道消息
pc.ondatachannel = (e) => {
  console.log("datachannel", e);
  e.channel.onmessage = (e) => {
    // 接收到控制端发送过来的指令
    console.log("onmessage", e, JSON.parse(e.data));
    let { type, data } = JSON.parse(e.data);
    // 傀儡端监听鼠标键盘事件
    console.log("robot", type, data);
    if (type === "mouse") {
      data.screen = {
        width: window.screen.width,
        height: window.screen.height,
      };
    }
    ipcRenderer.send("robot", type, data);
  };
};
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
ipcRenderer.on("offer", (e, offer) => {
  async function createAnswer(offer) {
    let screenStream = await getScreenStream(); // 添加桌面流
    pc.addStream(screenStream);
    await pc.setRemoteDescription(offer); // 设置控制端的描述
    await pc.setLocalDescription(await pc.createAnswer()); // 设置本地会话描述
    console.log("answer", JSON.stringify(pc.localDescription));
    return pc.localDescription;
  }
  createAnswer(offer).then((answer) => {
    ipcRenderer.send("forward", "answer", {
      type: answer.type,
      sdp: answer.sdp,
    });
  });
});
