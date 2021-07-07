const { BrowserWindow } = require("electron");
const isDev = require("electron-is-dev");

let win;
let willQuitApp = false; // 应用要退出时，窗口是否关闭
function create() {
  win = new BrowserWindow({
    width: 600,
    height: 300,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  // 处理主窗口的假关闭
  win.on("close", (e) => {
    if (willQuitApp) {
      win = null;
    } else {
      e.preventDefault(); // 禁止关闭
      win.hide();
    }
  });
  if (isDev) {
    win.loadURL("http://localhost:3000");
  } else {
    // 线上环境加载主页面，第三章再开发
    win.loadFile(
      path.resolve(__dirname, "../../renderer/pages/main/index.html")
    );
  }
}

function send(channel, ...args) {
  win.webContents.send(channel, ...args);
}
function show() {
  win.show();
}

function close() {
  willQuitApp = true;
  win.close();
}
module.exports = { create, send, show, close };
