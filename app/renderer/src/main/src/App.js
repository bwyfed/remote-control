import React, { useState, useEffect } from 'react';
// import logo from './logo.svg';
import './App.css';
import { ipcRenderer } from 'electron';
// const { ipcRenderer } = window.require('electron');

function App() {
  // 定义 App 用到的属性
  const [remoteCode, setRemoteCode] = useState(''); // 远程机器的控制码
  const [localCode, setLocalCode] = useState(''); // 本身的控制码
  const [controlText, setControlText] = useState(''); // 当前工作状态的文案
  const login = async () => {
    let code = await ipcRenderer.invoke('login'); // 向主进程发起login请求，返回本地码
    setLocalCode(code);
  };

  useEffect(() => {
    // 挂载钩子里写的
    login();
    ipcRenderer.on('control-state-change', handleControlState); // 监听主进程的事件
    // 卸载钩子里写的
    return () => {
      ipcRenderer.removeListener('control-state-change', handleControlState);
    };
  }, []);

  const startControl = remoteCode => {
    ipcRenderer.send('control', remoteCode);
  };

  const handleControlState = (e, name, type) => {
    let text = '';
    if (type === 1) {
      // 控制人
      text = `正在远程控制 ${name}`;
    } else if (type === 2) {
      // 被控制
      text = `被 ${name} 控制中`;
    }
    setControlText(text);
  };

  return (
    <div className="App">
      {controlText === '' ? (
        <>
          <div>你的控制码 {localCode}</div>
          <input
            type="text"
            value={remoteCode}
            onChange={e => setRemoteCode(e.target.value)}
          />
          <button onClick={() => startControl(remoteCode)}>确认</button>
        </>
      ) : (
        <div>{controlText}</div>
      )}
    </div>
  );
}

export default App;
