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

const rigidBody = [
  {x: SIZE * 1, y: SIZE * 10, r: SIZE / 4, g: false, f: {x: 0, y: 0},},
  {x: SIZE * 7, y: SIZE * 10, r: SIZE / 4, g: false, f: {x: 0, y: 0},},
]
// el: equilibrium length
const spring = [
  {from: 0, to: 1, el: SIZE * 5, k: .00001},
]
const main = () => setInterval(() => {
  internalDiffTime = globalTimestamp - currentTimestamp
  currentTimestamp = globalTimestamp
  frameCounter(mainFrameList)
  // input
  if (key.s.flag) rigidBody[0].x -= 1
  if (key.f.flag) rigidBody[0].x += 1
  // gravity
  rigidBody.forEach(v => {
    if (v.g) v.y += 1e-2
  })
  spring.forEach(v => {
    const addForce = (from, to) => {
      const l = to.x - from.x
      if (from.x < to.x) from.f.x += (l - v.el) * v.k / 2 * internalDiffTime
      else if (to.x < from.x) from.f.x += (l + v.el) * v.k / 2 * internalDiffTime
    }
    addForce(rigidBody[v.to], rigidBody[v.from])
    addForce(rigidBody[v.from], rigidBody[v.to])
  })
  rigidBody.forEach(v => {
    v.x += v.f.x * internalDiffTime
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
    'internal FPS'    : mainFrameList.length - 1,
    'screen FPS'      : animFrameList.length - 1,
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