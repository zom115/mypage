import {key} from '../../modules/key.mjs'
const canvas = document.getElementById`canvas`
const context = canvas.getContext`2d`
const timestampList = []
const frameList = []
const second = 1e3
const horizonList = []
const horizonLimit = 2e3
let internalCount = 0
const interval = 100
const listWidth = 25
let sign = 'plus'
let position = .5
let accel = 0
const brake = .995
let detectFlag = false
const frameCounter = list => {
  const now = Date.now()
  list.push(now)
  let flag = true
  do {
    if (list[0] + second < now) list.shift()
    else flag = false
  } while (flag)
}
const move = () => {
  sign = sign === 'plus' ? 'minus' : 'plus'
  accel = .02
}
canvas.addEventListener('mousedown', () => move())
setInterval(() => {
  frameCounter(timestampList)
  if (Object.values(key).some(v => v.isFirst())) move()
  position += sign === 'plus' ? accel : -accel
  accel *= brake
  if (position < 0) {
    position++
    horizonList.forEach((_v, i) => {
      horizonList[i][0].push(horizonList[i][0].splice(0, 1))
    })
  }
  if (1 < position) {
    position--
    horizonList.forEach((_v, i) => {
      horizonList[i][0].unshift(horizonList[i][0].splice(-1, 1))
    })
  }
  internalCount++
  const contents = new Array(listWidth).fill(0)
  if (internalCount % interval === 0) contents[Math.floor(Math.random() * listWidth)] = 1
  horizonList.unshift([contents])
  const index = horizonList[horizonList.length - 1][0].findIndex(v => v === 1)
  const detectNumber = Math.floor(listWidth / 2)
  if (detectNumber - 1 <= index && index <= detectNumber) {
    detectFlag = true
  }
  if (horizonLimit < horizonList.length) horizonList.pop()
}, 0)
const draw = () => {
  window.requestAnimationFrame(draw)
  frameCounter(frameList)
  context.save()
  context.fillStyle = 'hsl(0, 0%, 50%)'
  context.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
  context.fillStyle = 'hsl(0, 0%, 0%)'
  Object.entries(key).forEach(([k, v], i) => {
    context.fillText(`${k}: ${v.flag}, ${v.isUsed}, ${v.timestamp}, ${v.holdtime}`, 5, 10 + 10 * i)
  })
  context.fillText(`internal FPS: ${timestampList.length - 1}`, canvas.offsetWidth * .85, 10)
  context.fillText(`screen FPS: ${frameList.length - 1}`, canvas.offsetWidth * .85, 20)
  context.textAlign = 'center'
  context.fillText(sign, canvas.offsetWidth / 2, canvas.offsetHeight * .85)
  context.fillText(position, canvas.offsetWidth / 2, canvas.offsetHeight * .9)
  context.fillText(`detect: ${detectFlag}`, canvas.offsetWidth / 2, canvas.offsetHeight * .95)
  context.strokeStyle = 'hsl(0, 0%, 0%)'
  context.lineWidth = 1
  const frontWall = 9
  const wallWidth = canvas.offsetWidth / frontWall
  const multiple = .0001
  const wallCalc = Math.floor(frontWall / 2)
  context.fillStyle = 'hsl(0, 0%, 10%)'
  horizonList.forEach((v, i) => {
    v.forEach(vl => {
      vl.forEach((val, ind) => {
        if (val === 1) {
          context.beginPath()
          context.moveTo(
            canvas.offsetWidth / 2 +
            canvas.offsetWidth / 2 *
            (i / horizonLimit) *
            (ind - Math.floor(listWidth / 2) + position) / wallCalc -
            (wallWidth / 2) * (i / horizonLimit) -
            .5,
            canvas.offsetHeight * 4 / 9 + .5 - i * i * multiple)
          context.lineTo(
            canvas.offsetWidth / 2 +
            canvas.offsetWidth / 2 *
            (i / horizonLimit) *
            (ind - Math.floor(listWidth / 2) + position) / wallCalc +
            (wallWidth / 2) * (i / horizonLimit) +
            .5,
            canvas.offsetHeight * 4 / 9 + .5 - i * i * multiple)
          context.lineTo(
            canvas.offsetWidth / 2 +
            canvas.offsetWidth / 2 *
            (i / horizonLimit) *
            (ind - Math.floor(listWidth / 2) + position) / wallCalc +
            (wallWidth / 2) * (i / horizonLimit) +
            .5,
            canvas.offsetHeight * 5 / 9 - .5 + i * i * multiple)
          context.lineTo(
            canvas.offsetWidth / 2 +
            canvas.offsetWidth / 2 *
            (i / horizonLimit) *
            (ind - Math.floor(listWidth / 2) + position) / wallCalc -
            (wallWidth / 2) * (i / horizonLimit) -
            .5,
            canvas.offsetHeight * 5 / 9 - .5 + i * i * multiple)
          context.fill()
        }
      })
    })
  })
  context.fillStyle = 'hsl(0, 0%, 25%)'
  context.beginPath()
  context.arc(
    canvas.offsetWidth / 2, canvas.offsetHeight * .7, wallWidth / 2, 0, Math.PI * 2, false)
  context.fill()
  context.restore()
}
draw()