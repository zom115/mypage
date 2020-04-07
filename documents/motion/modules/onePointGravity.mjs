import {key, globalTimestamp} from '../../../modules/key.mjs'
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
const canvas = document.getElementById`onePointGravity`
canvas.width = 128
canvas.height = 128
canvas.style.display = 'inline-block'
const ctx = canvas.getContext`2d`
const PI = Math.PI

const gravity = .01
const body = {
  waist: {from: 'bottom', degree: 0, reach:  0, x: 64, y: 64, r: 5, dx: 0, dy: 0},
}
Object.values(body).forEach((v) => {
  if (v.from !== 'bottom') {
    v.x = body[v.from].x + v.reach * Math.cos(v.degree)
    v.y = body[v.from].y + v.reach * Math.sin(v.degree)
  }
})
const main = () => setInterval(() => {
  frameCounter(mainFrameList)
  // input
  const moveConstant = .02
  if (key.s.flag) body.waist.dx -= moveConstant
  if (key.f.flag) body.waist.dx += moveConstant
  if (key.e.flag) body.waist.dy -= moveConstant
  if (key.d.flag) {}
  // collision detect
  const frictionalForce = .01
  if (
    body.waist.x - body.waist.r + body.waist.dx <= 0 ||
    canvas.offsetWidth <= body.waist.x + body.waist.r + body.waist.dx
  ) {
    // collision response
    body.waist.dx = -body.waist.dx * (1 - frictionalForce)
  }
  if (canvas.offsetHeight <= body.waist.y + body.waist.r + body.waist.dy) {
    // collision response
    const elasticity = 0
    body.waist.dx *= 1 - frictionalForce
    body.waist.dy = -body.waist.dy * elasticity
  }
  // state update
  body.waist.y += body.waist.dy
  body.waist.x += body.waist.dx
  body.waist.dy += gravity
}, 0)
const draw = () => {
  window.requestAnimationFrame(draw)
  frameCounter(animFrameList)
  ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
  ctx.beginPath()
  Object.values(body).forEach(v => {
    if (v.from === 'bottom') return
    ctx.moveTo((v.x|0) +.5, (v.y|0) + .5)
    ctx.lineTo((body[v.from].x|0) + .5, (body[v.from].y|0) + .5)
  })
  ctx.closePath()
  ctx.stroke()
  Object.values(body).forEach((v) => {
    ctx.beginPath()
    ctx.arc(v.x, v.y, v.r, 0, PI * 2)
    ctx.fill()
  })
  ctx.fillText(`internal FPS: ${mainFrameList.length - 1}`, 10, 10)
  ctx.fillText(`screen FPS: ${animFrameList.length - 1}`, 10, 20)
}
{
  main()
  draw()
}