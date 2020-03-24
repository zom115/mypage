{'use strict'
const keyList = [
  'Alt', 'Control','Enter', 'Shift', ' ',
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
  'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
]
const key = {}
let globalTimestamp = 0
const timestampList = []
const frameList = []
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
const interval = 100
const listWidth = 50
const frameCounter = list => {
  const now = Date.now()
  list.push(now)
  let flag = true
  do {
    if (list[0] + second < now) list.shift()
    else flag = false
  } while (flag)
}
setInterval(() => {
  if (Object.values(key).some(v => v.flag && v.timestamp === globalTimestamp)) {
    console.log('a')
  }
  internalCount++
  const contents = new Array(listWidth).fill(0)
  if (internalCount % interval === 0) contents[Math.floor(Math.random() * listWidth)] = 1
  horizonList.unshift([contents])
  if (horizonLimit < horizonList.length) horizonList.pop()
  {
    document.dispatchEvent(new KeyboardEvent('keydown', {key: ' '}))
    Object.values(key).forEach(v => {
      if (v.flag) v.holdtime = globalTimestamp - v.timestamp
    })
    frameCounter(timestampList)
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
  context.fillText(`screen FPS: ${frameList.length}`, canvas.offsetWidth * .85, 20)
  context.fillText(`${horizonList.length}`, canvas.offsetWidth * .85, 30)
  context.strokeStyle = 'hsl(0, 0%, 0%)'
  context.lineWidth = 1
  const frontWall = 9
  const wallWidth = canvas.offsetWidth / frontWall
  const multiple = .0001
  const wallCalc = Math.floor(frontWall / 2)
  horizonList.forEach((v, i) => {
    v.forEach(vl => {
      vl.forEach((val, ind) => {
        if (val === 1) {
          context.beginPath()
          context.moveTo(
            // offset
            canvas.offsetWidth / 2 +
            canvas.offsetWidth / 2 *
            (i / horizonLimit) *
            (ind - Math.floor(listWidth / 2)) / wallCalc -
            wallWidth / 2 * (i / horizonLimit) -
            .5,
            canvas.offsetHeight * 4 / 9 + .5 - i * i * multiple)
          context.lineTo(
            canvas.offsetWidth / 2 +
            canvas.offsetWidth / 2 *
            (i / horizonLimit) *
            (ind - Math.floor(listWidth / 2)) / wallCalc +
            wallWidth / 2 * (i / horizonLimit) +
            .5,
            canvas.offsetHeight * 4 / 9 + .5 - i * i * multiple)
          context.lineTo(
            canvas.offsetWidth / 2 +
            canvas.offsetWidth / 2 *
            (i / horizonLimit) *
            (ind - Math.floor(listWidth / 2)) / wallCalc +
            wallWidth / 2 * (i / horizonLimit) +
            .5,
            canvas.offsetHeight * 5 / 9 - .5 + i * i * multiple)
          context.lineTo(
            canvas.offsetWidth / 2 +
            canvas.offsetWidth / 2 *
            (i / horizonLimit) *
            (ind - Math.floor(listWidth / 2)) / wallCalc -
            wallWidth / 2 * (i / horizonLimit) -
            .5,
            canvas.offsetHeight * 5 / 9 - .5 + i * i * multiple)
          context.closePath()
          context.stroke()
        }
      })
    })
  })
}
const main = () => {
  window.requestAnimationFrame(main)
  frameCounter(frameList)
  draw()
}
main()
}