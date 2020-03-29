const key = {}
const keyList = [
  'Alt', 'Control','Enter', 'Shift', ' ',
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
  'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
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