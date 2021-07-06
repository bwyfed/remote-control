const { app } = require("electron");
const handleIPC = require("./ipc");
// const { create: createMainWindow } = require("./windows/main");
const { create: createControlWindow } = require("./windows/control");

app.on("ready", () => {
  // createMainWindow();
  createControlWindow();
  handleIPC();
});
