const WebSocket = require("ws");
const EventEmitter = require("events");
const signal = new EventEmitter(); // 主要用来与IPC做通信

const ws = new WebSocket("ws://127.0.0.1:8010");
// const ws = new WebSocket('ws://111.231.59.178:8010'); // 填你自己的地址，这个是我的服务器，不一定可用

ws.on("open", function open() {
  console.log("connect success");
});
// 响应消息
ws.on("message", function incoming(message) {
  let data = {};
  try {
    data = JSON.parse(message);
    console.log("data", data, message);
  } catch (e) {
    console.error("parse error", e);
  }
  signal.emit(data.event, data.data);
});

function send(event, data) {
  console.log("sended", JSON.stringify({ event, data }));
  ws.send(JSON.stringify({ event, data }));
}

function invoke(event, data, answerEvent) {
  return new Promise((resolve, reject) => {
    send(event, data);
    // 为什么 signal 能监听服务端返回的事件呢？？
    signal.once(answerEvent, resolve);
    // 所有的invoke都要做一个setTimeout，超时处理
    setTimeout(() => {
      reject("timeout");
    }, 5000);
  });
}
signal.send = send;
signal.invoke = invoke;

module.exports = signal;
