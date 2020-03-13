const EventEmitter = require('events');
const peer = new EventEmitter();
const { desktopCapturer } = require('electron');
// 以下应该是pear-puppet的代码。模拟桌面流捕捉的过程
async function getScreenStream() {
  const sources = await desktopCapturer.getSources({
    types: ['screen']
  });
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
      peer.emit('add-stream', stream);
    },
    err => console.log(err)
  );
}
getScreenStream();
module.exports = peer;
