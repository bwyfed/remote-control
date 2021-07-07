const { ipcMain } = require("electron");
const { send: sendMainWindow } = require("./windows/main");
const {
  create: createControlWindow,
  send: sendControlWindow,
} = require("./windows/control");
const signal = require("./signal");

module.exports = function () {
  ipcMain.handle("login", async () => {
    // 向服务端发送 login 事件，data为null，同时监听 logined 事件
    // 这里封装好的 invoke 巧妙的将两个异步事件串联在一起，使用await同步写法。
    let { code } = await signal.invoke("login", null, "logined");
    return code;
  });
  ipcMain.on("control", async (e, remote) => {
    // 这里是跟服务端的交互，成功后我们会唤起面板
    signal.send("control", { remote }); // 发送控制事件到服务端
  });
  // 控制别人的响应事件
  signal.on("controlled", (data) => {
    sendMainWindow("control-state-change", data.remote, 1);
    createControlWindow();
  });
  // 被别人控制的事件
  signal.on("be-controlled", (data) => {
    sendMainWindow("control-state-change", data.remote, 2);
  });
  // 以下是信令部分的逻辑
  // puppet、control共享的信道，就是转发
  ipcMain.on("forward", (e, event, data) => {
    signal.send("forward", { event, data });
  });

  // 收到offer，puppet响应
  signal.on("offer", (data) => {
    sendMainWindow("offer", data);
  });

  // 收到puppet证书，answer响应
  signal.on("answer", (data) => {
    sendControlWindow("answer", data);
  });
  // 以下是处理candidate
  // 收到control证书，puppet响应
  signal.on("puppet-candidate", (data) => {
    sendControlWindow("candidate", data);
  });

  // 收到puppet证书，control响应
  signal.on("control-candidate", (data) => {
    sendMainWindow("candidate", data);
  });
};
