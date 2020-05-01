import {key, globalTimestamp} from '../../modules/key.mjs'
const canvas = document.getElementById`canvas`
canvas.width = 256
canvas.height = 256
canvas.style.display = 'inline-block'
const ctx = canvas.getContext`2d`
const PI = Math.PI
const SIZE = 16
let currentTimestamp = globalTimestamp
let internalDiffTime = 1
const mainFrameList = []
const animFrameList = []
const frameCounter = list => {
  list.push(globalTimestamp)
  let flag = true
  do {
    if (list[0] + 1e3 < globalTimestamp) list.shift()
    else flag = false
  } while (flag)
}

const gravityConstant = .0001
const rigidBody = [
  {x: SIZE * 7, y: SIZE * 10, r: SIZE / 4, f: {x: 0, y: 0},},
  {x: SIZE * 10, y: SIZE * 10, r: SIZE / 4, f: {x: 0, y: 0},},
]
// el: equilibrium length
const spring = [
  {from: 0, to: 1, el: SIZE * 3, k: .00001},
]

let gravityFlag = false
let fixFlag = false

const main = () => setInterval(() => {
  internalDiffTime = globalTimestamp - currentTimestamp
  currentTimestamp = globalTimestamp
  frameCounter(mainFrameList)
  // input
  if (key.s.flag) rigidBody[0].x -= 1
  if (key.f.flag) rigidBody[0].x += 1
  if (key.e.flag) rigidBody[0].y -= 1
  if (key.d.flag) rigidBody[0].y += 1
  if (key.g.isFirst()) gravityFlag = !gravityFlag
  if (key.x.isFirst()) fixFlag = !fixFlag
  spring.forEach(v => {
    const addForce = (from, to) => {
      const length = ((to.x - from.x) ** 2 + (to.y - from.y) ** 2) ** .5
      const diff = length - v.el
      const d = Math.atan2(to.y - from.y, to.x - from.x)
      from.f.x += diff * Math.cos(d) * v.k * internalDiffTime
      from.f.y += diff * Math.sin(d) * v.k * internalDiffTime
    }
    addForce(rigidBody[v.to], rigidBody[v.from])
    addForce(rigidBody[v.from], rigidBody[v.to])
  })
  // gravity
  if (gravityFlag) rigidBody.forEach(v => {
    v.f.y += gravityConstant * internalDiffTime
  })
  if (fixFlag) {
    rigidBody[1].f.x = 0
    rigidBody[1].f.y = 0
  }
  rigidBody.forEach(v => {
    v.x += v.f.x * internalDiffTime
    v.y += v.f.y * internalDiffTime
  })
}, 0)
const draw = () => {
  window.requestAnimationFrame(draw)
  frameCounter(animFrameList)
  ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
  ctx.beginPath()
  spring.forEach(v => {
    ctx.moveTo(rigidBody[v.from].x, rigidBody[v.from].y)
    ctx.lineTo(rigidBody[v.to].x, rigidBody[v.to].y)
  })
  ctx.closePath()
  ctx.stroke()
  ctx.beginPath()
  rigidBody.forEach(v => {
    ctx.arc(v.x, v.y, v.r, 0, PI * 2)
  })
  ctx.fill()
  const dispObject = {
    'internal FPS': mainFrameList.length - 1,
    'screen FPS'  : animFrameList.length - 1,
    'gravity'     : gravityFlag,
    'fix'         : fixFlag,
  }
  ctx.textAlign = 'right'
  Object.keys(dispObject).forEach((k, i) => {
    ctx.fillText(k, 90, 10 * (i + 1))
  })
  ctx.textAlign = 'left'
  Object.values(dispObject).forEach((v, i) => {
    ctx.fillText(v, 100, 10 * (i + 1))
  })
}
{
  main()
  draw()
}