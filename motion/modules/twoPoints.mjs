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
const canvas = document.getElementById`twoPoints`
canvas.width = 128
canvas.height = 128
canvas.style.display = 'inline-block'
const ctx = canvas.getContext`2d`
const PI = Math.PI
const body = {
  waist: {from: 'bottom', degree: 0, reach:  0, x: 64, y: 64, r: 5},
  head:  {from:  'waist', degree: 0, reach: 20, x:  0, y:  0, r: 3},}
Object.values(body).forEach((v) => {
  if (v.from !== 'bottom') {
    v.x = body[v.from].x + v.reach * Math.cos(v.degree)
    v.y = body[v.from].y + v.reach * Math.sin(v.degree)
  }
})
const main = () => setInterval(() => {
  frameCounter(mainFrameList)
  const ratio = .01
  if (key.q.flag) {
    const degree = Math.atan2(body.head.y - body.waist.y, body.head.x - body.waist.x)
    body.head.x = body.waist.x + Math.cos(degree - ratio * PI) * body.head.reach
    body.head.y = body.waist.y + Math.sin(degree - ratio * PI) * body.head.reach
  }
  if (key.w.flag) {
    const degree = Math.atan2(body.head.y - body.waist.y, body.head.x - body.waist.x)
    body.head.x = body.waist.x + Math.cos(degree + ratio * PI) * body.head.reach
    body.head.y = body.waist.y + Math.sin(degree + ratio * PI) * body.head.reach
  }
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