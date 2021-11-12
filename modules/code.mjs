const code = {}
const codeList = [
  'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
  'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0',
  'KeyA', 'KeyB', 'KeyC', 'KeyD', 'KeyE', 'KeyF', 'KeyG', 'KeyH', 'KeyI', 'KeyJ', 'KeyK', 'KeyL', 'KeyM',
  'KeyN', 'KeyO', 'KeyP', 'KeyQ', 'KeyR', 'KeyS', 'KeyT', 'KeyU', 'KeyV', 'KeyW', 'KeyX', 'KeyY', 'KeyZ',
  'BracketLeft', 'BracketRight', 'Comma', 'Periodh', 'Slash', 'IntlRo', 'Semicolon', 'Quote', 'Backslash',
  'ArrowLeft', 'ArrowUp', 'ArrowDown', 'ArrowRight',
  'ControlLeft', 'ControlRight', 'ShiftLeft', 'ShiftRight', 'AltLeft', 'AltRight',
  'Space', 'Escape', 'Tab', 'Enter', 'Backspace', 'Delete', 'Backquote',
  'ContextMenu', 'MetaLeft', 'MetaRight',
  'Insert', 'Home', 'End', 'PageUp', 'PageDown', 'Pause', 'PrintScreen',
]
let keydownTimeStamp = 0
codeList.forEach(v => {
  code[v] = {}
  code[v].flag = false
  code[v].holdtime = 0
  code[v].isUsed = false
  code[v].key = v
  code[v].timestamp = 0
  code[v].isFirst = () => {
    if (code[v].flag === true && code[v].isUsed === false) {
      code[v].isUsed = true
      return true
    } return false
  }
})
document.addEventListener('keydown', e => {
  keydownTimeStamp = e.timeStamp
  if (!e.isTrusted) return
  code[e.code].flag = true
  if (!e.repeat) code[e.code].timestamp = e.timeStamp
}, false)
document.addEventListener('keyup', e => {
  code[e.code].flag = false
  code[e.code].holdtime = 0
  code[e.code].isUsed = false
}, false)
setInterval(() => {
  document.dispatchEvent(new KeyboardEvent('keydown', {key: ' '}))
  Object.values(code).forEach(v => {
    if (v.flag) v.holdtime = keydownTimeStamp - v.timestamp
  })
}, 0)
export {code, keydownTimeStamp}