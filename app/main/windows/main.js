const path = require('path');
const { BrowserWindow } = require('electron');
const isDev = require('electron-is-dev');
// 生成主窗口
let win;
function create() {
  win = new BrowserWindow({
    width: 600,
    height: 300,
    webPreferences: {
      nodeIntegration: true
    }
  });
  if (isDev) {
    win.loadURL('http://localhost:3000');
  } else {
    // 线上环境加载页面，第三章再开发
    win.loadFile(
      path.resolve(__dirname, '../../renderer/pages/main/index.html')
    );
  }
}

function send(channel, ...args) {
  win.webContents.send(channel, ...args);
}

module.exports = { create, send };
