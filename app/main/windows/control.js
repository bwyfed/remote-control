const { BrowserWindow } = require("electron");
const path = require("path");

let win;
function create() {
  win = new BrowserWindow({
    width: 1000,
    height: 680,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  // 直接加载控制页面，不分开发环境还是生产环境了
  win.loadFile(
    path.resolve(__dirname, "../../renderer/pages/control/index.html")
  );
}

module.exports = { create };
