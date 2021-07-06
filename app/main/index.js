const { app } = require("electron");
const handleIPC = require("./ipc");
const { create: createMainWindow } = require("./windows/main");

app.on("ready", () => {
  createMainWindow();
  handleIPC();
});
