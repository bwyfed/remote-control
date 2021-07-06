const { ipcMain } = require("electron");
const robot = require("robotjs");
const vkey = require("vkey");

function handleMouse(data) {
  // data：{clientX, clientY, screen: {width, height}, video: {width: height}}
  const { clientX, clientY, screen, video } = data; // 注意学习这里的解构方法，只能解构一级
  let x = (clientX * screen.width) / video.width;
  let y = (clientY * screen.height) / video.height;
  console.log(x, y);
  robot.moveMouse(x, y);
  robot.mouseClick();
}
function handleKey(data) {
  // data：{keyCode, meta, alt, ctrl, shift}
  const modifiers = []; // 修饰键
  if (data.meta) modifiers.push("meta");
  if (data.shift) modifiers.push("shift");
  if (data.alt) modifiers.push("alt");
  if (data.ctrl) modifiers.push("control"); // 注意不是ctrl
  // 通过vkey拿到对应的键值
  const key = vkey[data.keyCode].toLowerCase(); // 易错点
  console.log("key", key);
  if (key[0] !== "<") {
    // <shift>
    robot.keyTap(key, modifiers);
  }
}
module.exports = function () {
  ipcMain.on("robot", (e, type, data) => {
    console.log("ipcMain.on robot", type, data);
    if (type === "mouse") {
      handleMouse(data);
    } else if (type === "key") {
      handleKey(data);
    }
  });
};
