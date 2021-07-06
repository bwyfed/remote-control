import { useState, useEffect } from "react";
// import logo from "./logo.svg";
import "./App.css";
import { ipcRenderer } from "electron";
import "./peer-puppet";
// const { ipcRenderer } = window.require('electron');

function App() {
  const [remoteCode, setRemoteCode] = useState(""); // 远程控制码
  const [localCode, setLocalCode] = useState(""); // 自己本身的控制码
  const [controlText, setControlText] = useState(""); // 控制状态的文案
  // 刚进来时，触发登录行为
  const login = async () => {
    // 登录状态是在主进程中维护。向主进程中发起登录消息。
    let code = await ipcRenderer.invoke("login");
    setLocalCode(code); // 设置回本地码
  };
  // react hook
  useEffect(() => {
    // 相当于 componentDidMount
    login();
    ipcRenderer.on("control-state-change", handleControlState); // 主进程传过来控制状态
    // return 相当于卸载钩子
    return () => {
      // 在返回的时候，给监听清理掉
      ipcRenderer.removeListener("control-state-change", handleControlState);
    };
  }, []);
  // 发起控制事件
  const startControl = (remoteCode) => {
    // 向主进程发起一个请求,控制remoteCode对应的用户
    ipcRenderer.send("control", remoteCode);
  };
  // 改变状态文案
  const handleControlState = (e, name, type) => {
    let text = "";
    if (type === 1) {
      // 控制别人
      text = `正在远程控制${name}`;
    } else if (type === 2) {
      // 被控制
      text = `正在被${name}控制`;
    }
    setControlText(text);
  };
  return (
    <div className="App">
      {controlText === "" ? (
        <>
          <div>你的控制码 {localCode}</div>
          <input
            type="text"
            value={remoteCode}
            onChange={(e) => setRemoteCode(e.target.value)}
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
