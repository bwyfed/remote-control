const { app } = require("electron");
const handleIPC = require("./ipc");
// const { create: createMainWindow } = require("./windows/main");
const { create: createControlWindow } = require("./windows/control");

app.on("ready", () => {
  // createMainWindow();
  createControlWindow();
  handleIPC();
  // 处理robot.js的逻辑
  require("./robot.js")();
});
