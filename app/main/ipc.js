const { ipcMain } = require('electron');
const { send: sendMainWindow } = require('./windows/main');
const {
  create: createControlWindow,
  send: sendControlWindow
} = require('./windows/control');
const { create: createControlWindow } = require('./windows/control');
const signal = require('./signal');

module.exports = function() {
  ipcMain.handle('login', async () => {
    let { code } = await signal.invoke('login', null, 'logined');
    return code;
  });
  ipcMain.on('control', async (e, remote) => {
    signal.send('control', { remote });
  });
  signal.on('controlled', data => {
    sendMainWindow('control-state-change', data.remote, 1);
    createControlWindow();
  });
  signal.on('be-controlled', data => {
    sendMainWindow('control-state-change', data.remote, 2);
  });

  ipcMain.on('forward', (e, event, data) => {
    signal.send('forward', { event, data });
  });
  signal.on('offer', data => {
    sendMainWindow('offer', data);
  });
  signal.on('answer', data => {
    sendControlWindow('answer', data);
  });
  signal.on('puppet-candidate', data => {
    sendControlWindow('candidate', data);
  });
  signal.on('control-candidate', data => {
    sendMainWindow('candidate', data);
  });
};
