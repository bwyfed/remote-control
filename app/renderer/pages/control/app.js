const peer = require('./peer-control');
const robot = require('robotjs');

console.log('robotjs');
console.log(robot);

peer.on('add-stream', stream => {
  play(stream);
});

function play(stream) {
  let video = document.getElementById('screen-video');
  video.srcObject = stream;
  video.onloadedmetadata = function() {
    video.play();
  };
}
