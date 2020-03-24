{'use strict'
const keyList = [
  'Alt', 'Control','Enter', 'Shift', ' ',
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
  'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
]
const key = {}
let globalTimestamp = 0
const timestampList = []
const second = 1e3
keyList.forEach(v => {
  key[v] = {}
  key[v].flag = false
  key[v].holdtime = 0
  key[v].timestamp = 0
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
},)
const horizonList = []
const horizonLimit = 2e3
let internalCount = 0
const interval = 200
setInterval(() => {
  if (Object.values(key).some(v => v.flag && v.timestamp === globalTimestamp)) {
    console.log('a')
  }
  internalCount++
  const contents = internalCount % interval === 0 ? 1 : 0
  horizonList.unshift([contents])
  if (horizonLimit < horizonList.length) horizonList.pop()
  {
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
  }
}, 0)
const canvas = document.getElementById`canvas`
const context = canvas.getContext`2d`
const draw = () => {
  context.fillStyle = 'hsl(0, 0%, 50%)'
  context.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
  context.fillStyle = 'hsl(0, 0%, 0%)'
  Object.entries(key).forEach(([k, v], i) => {
    context.fillText(`${k}: ${v.flag}, ${v.timestamp}, ${v.holdtime}`, 5, 10 + 10 * i)
  })
  context.fillText(`internal FPS: ${timestampList.length}`, canvas.offsetWidth * .85, 10)
  context.fillText(`${horizonList.length}`, canvas.offsetWidth * .85, 30)
  context.strokeStyle = 'hsl(0, 0%, 0%)'
  context.lineWidth = 1
  const multiple = .0001
  horizonList.forEach((v, i) => {
    if (v[0] === 1) {
      context.beginPath()
      context.moveTo(-1, canvas.offsetHeight * 4 / 9 + .5 - i * i * multiple)
      context.lineTo(
        canvas.offsetWidth + 1, canvas.offsetHeight * 4 / 9 + .5 - i * i * multiple)
      context.lineTo(
        canvas.offsetWidth + 1, canvas.offsetHeight * 5 / 9 - .5 + i * i * multiple)
      context.lineTo(-1, canvas.offsetHeight * 5 / 9 - .5 + i * i * multiple)
      context.closePath()
      context.stroke()
    }
  })
}
const main = () => {
  window.requestAnimationFrame(main)
  draw()
}
main()
}