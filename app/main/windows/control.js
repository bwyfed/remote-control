const path = require('path');
const { BrowserWindow } = require('electron');

// 生成控制窗口
let win;
function create() {
  win = new BrowserWindow({
    width: 1000,
    height: 680,
    webPreferences: {
      nodeIntegration: true
    }
  });
  win.loadFile(
    path.resolve(__dirname, '../../renderer/pages/control/index.html')
  );
}

module.exports = { create };
