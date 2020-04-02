const EventEmitter = require('events');
const peer = new EventEmitter();
// const { ipcRenderer } = require('electron');

// 暂时屏蔽掉robot相关的代码。
// peer.on('robot', (type, data) => {
//   if (type === 'mouse') {
//     data.screen = { width: window.screen.width, height: window.screen.height };
//   }
//   setTimeout(() => {
//     ipcRenderer.send('robot', type, data);
//   }, 2000);
// });
// 控制端 createOffer 的逻辑
const pc = new window.RTCPeerConnection({});
// onicecandidate iceEvent
// addIceCandidate
pc.onicecandidate = function(e) {
  console.log('candidate', JSON.stringify(e.candidate));
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

async function createOffer() {
  const offer = await pc.createOffer({
    offerToReceiveAudio: false,
    offerToReceiveVideo: true // 只需要用到视频
  });
  await pc.setLocalDescription(offer);
  console.log('pc offer', JSON.stringify(offer));
  return pc.localDescription;
}
createOffer();
// 设置傀儡端返回的SDP
async function setRemote(answer) {
  await pc.setRemoteDescription(answer);
}
window.setRemote = setRemote; // 便于在控制台将answer设置上
// 监听流的增加的事件
pc.onaddstream = function(e) {
  console.log('add stream', e);
  peer.emit('add-stream', e.stream);
};
module.exports = peer;
