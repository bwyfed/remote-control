const { app } = require("electron");
const handleIPC = require("./ipc");
const {
  create: createMainWindow,
  show: showMainWindow,
  close: closeMainWindow,
} = require("./windows/main");
// const { create: createControlWindow } = require("./windows/control");
// 禁止多开
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    showMainWindow();
  });
  app.on("ready", () => {
    createMainWindow();
    // createControlWindow();
    handleIPC();
    // 处理robot.js的逻辑
    require("./robot.js")();
  });
  app.on("before-quit", () => {
    closeMainWindow();
  });
  app.on("activate", () => {
    showMainWindow();
  });
}
