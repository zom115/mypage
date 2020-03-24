{'use strict'
const keyList = [
  'Alt', 'Control','Enter', 'Shift', ' ',
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
  'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
]
let key = {}
keyList.forEach(v => {
  key[v] = {}
  key[v].flag = false
  key[v].holdtime = 0
  key[v].timestamp = 0
})
let globalTimestamp = 0
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
},)
let timestampList = []
const second = 1e3
setInterval(() => {
  document.dispatchEvent(new KeyboardEvent('keydown', {key: ' '}))
  Object.values(key).forEach(v => {
    if (v.flag) v.holdtime = globalTimestamp - v.timestamp
  })
  const now = Date.now()
  timestampList.push(now)
  let flag = true
  do {
    if (timestampList[0] + second < now) timestampList.shift()
    else flag = false
  } while (flag)
}, 0)
const canvas = document.getElementById`canvas`
const context = canvas.getContext`2d`
const draw = () => {
  context.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
  Object.entries(key).forEach(([k, v], i) => {
    context.fillText(`${k}: ${v.flag}, ${v.timestamp}, ${v.holdtime}`, 5, 10 + 10 * i)
  })
  context.fillText(`internal FPS: ${timestampList.length}`, canvas.offsetWidth * .85, 10)
}
const main = () => {
  window.requestAnimationFrame(main)
  draw()
}
main()
}