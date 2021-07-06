const { ipcMain } = require("electron");
const { send: sendMainWindow } = require("./windows/main");
const { create: createControlWindow } = require("./windows/control");

module.exports = function () {
  ipcMain.handle("login", async () => {
    // 先mock，返回一个local code(模拟一个6位数)
    let code = Math.floor(Math.random() * (999999 - 100000)) + 100000;
    return code;
  });
  ipcMain.on("control", async (e, remoteCode) => {
    // 这里跟服务器有交互，但是先mock直接返回
    sendMainWindow("control-state-change", remoteCode, 1); // 1: 正在控制
    createControlWindow(); // 创建控制窗口
  });
};
