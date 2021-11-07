const key = {}
// TODO: Scroll Lock, App Key, etc.
const keyList = [
  'Alt', 'Control', 'Escape', 'Tab', 'Enter', 'Shift', 'Backspace', 'Delete',
  'Insert', 'Home', 'End', 'PageUp', 'PageDown', 'Pause', 'PrintScreen',
  'ArrowLeft', 'ArrowUp', 'ArrowDown', 'ArrowRight',
  'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
  ' ', '-', '^', '@', '[', ';', ':', ']', ',', '.', '/', '\\',
  '=', '~', '|', '`', '{', '+', '*', '}', '<', '>', '?', '_',
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
  '!', '"', '#', '$', '%', '&', '\'', '(', ')',
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
  'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
]
let globalTimestamp = 0
keyList.forEach(v => {
  key[v] = {}
  key[v].flag = false
  key[v].holdtime = 0
  key[v].isUsed = false
  key[v].key = v
  key[v].timestamp = 0
  key[v].isFirst = () => {
    if (key[v].flag === true && key[v].isUsed === false) {
      key[v].isUsed = true
      return true
    } return false
  }
})
document.addEventListener('keydown', e => {
  globalTimestamp = e.timeStamp
  if (!e.isTrusted) return
  key[e.key].flag = true
  if (!e.repeat) key[e.key].timestamp = e.timeStamp
  if (e.key === ' ') e.preventDefault ? e.preventDefault() : e.keyCode = 0
}, false)
document.addEventListener('keyup', e => {
  key[e.key].flag = false
  key[e.key].holdtime = 0
  key[e.key].isUsed = false
}, false)
setInterval(() => {
  document.dispatchEvent(new KeyboardEvent('keydown', {key: ' '}))
  Object.values(key).forEach(v => {
    if (v.flag) v.holdtime = globalTimestamp - v.timestamp
  })
}, 0)
export {key, globalTimestamp}