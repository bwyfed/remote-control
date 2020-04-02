// 傀儡端逻辑: createAnswer, add stream
import { desktopCapturer, ipcRenderer } from 'electron';
// 获取桌面流
async function getScreenStream() {
  const sources = await desktopCapturer.getSources({
    types: ['screen']
  });
  return new Promise((resolve, reject) => {
    navigator.webkitGetUserMedia(
      {
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: sources[0].id,
            maxWidth: window.screen.width,
            maxHeight: window.screen.height
          }
        }
      },
      stream => {
        resolve(stream);
        // peer.emit('add-stream', stream);
      },
      err => console.log(err)
    );
  });
}
const pc = new window.RTCPeerConnection({});
pc.onicecandidate = function(e) {
  console.log('candidate', JSON.stringify(e.candidate));
  if (e.candidate) {
    ipcRenderer.send('forward', 'puppet-candidate', e.candidate);
  }
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
ipcRenderer.on('offer', async (e, offer) => {
  let answer = await createAnswer(offer);
  ipcRenderer.send('forward', 'answer', { type: answer, sdp: answer.sdp });
});
async function createAnswer(offer) {
  let screenStream = await getScreenStream(); // 添加桌面流
  pc.addStream(screenStream);
  await pc.setRemoteDescription(offer); // 设置控制端的描述
  await pc.setLocalDescription(await pc.createAnswer()); // 设置本地描述
  console.log('answer', JSON.stringify(pc.localDescription));
  return pc.localDescription;
}
window.createAnswer = createAnswer; // 挂载在全局上，便于调用
