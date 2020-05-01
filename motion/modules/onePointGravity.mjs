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

let gravity = .001
let elasticity = 1
let frictionalForce = .5
const moveConstant = .02
const body = {
  waist: {from: 'bottom', degree: 0, reach: 0, x: 64, y: 64, r: 5, dx: 0, dy: 0},
}
Object.values(body).forEach((v) => {
  if (v.from !== 'bottom') {
    v.x = body[v.from].x + v.reach * Math.cos(v.degree)
    v.y = body[v.from].y + v.reach * Math.sin(v.degree)
  }
})
const wallVertex = [
  [0, 0],
  [0, canvas.offsetHeight],
  [canvas.offsetWidth, canvas.offsetHeight],
  [canvas.offsetWidth, 0],
]
const main = () => setInterval(() => {
  frameCounter(mainFrameList)
  // input
  const deltaG = .001
  const deltaE = .1
  const deltaF = .1
  if (key.r.flag) {
    gravity = .001
    elasticity = 1
    frictionalForce = .5
    body.waist.x = canvas.offsetWidth / 2
    body.waist.y = canvas.offsetHeight / 2
    body.waist.dx = 0
    body.waist.dy = 0
  }
  if (key.t.isFirst()) gravity -= deltaG
  if (key.y.isFirst()) gravity += deltaG
  if (key.g.isFirst()) elasticity -= deltaE
  if (key.h.isFirst()) elasticity += deltaE
  if (key.b.isFirst()) frictionalForce -= deltaF
  if (key.n.isFirst()) frictionalForce += deltaF
  const moveAccelaration = key.j.flag ? moveConstant * 2 : moveConstant
  if (key.s.flag) body.waist.dx -= moveAccelaration
  if (key.f.flag) body.waist.dx += moveAccelaration
  if (key.e.flag) body.waist.dy -= moveAccelaration
  if (key.d.flag) body.waist.dy += moveAccelaration
  // collision detect
  wallVertex.forEach((vn, i) => {
    const vo = i === 0 ? wallVertex[wallVertex.length - 1] : wallVertex[i - 1]
    const normalDrag = Math.atan2(vn[1] - vo[1], vn[0] - vo[0]) - PI / 2
    const nX = Math.cos(normalDrag)
    const nY = Math.sin(normalDrag)
    const r = body.waist.r
    const a = {x: vo[0] + nX * r, y: vo[1] + nY * r}
    const b = {x: vn[0] + nX * r, y: vn[1] + nY * r}
    const c = {x: body.waist.x, y: body.waist.y}
    const d = {x: body.waist.x + body.waist.dx, y: body.waist.y + body.waist.dy}
    const cdx = d.x - c.x
    const cdy = d.y - c.y
    let length = (cdx ** 2 + cdy ** 2) ** .5
    if (0 < length) length = 1 / length
    const nx = -cdy * length
    const ny = cdx * length
    const abx = b.x - a.x
    const aby = b.y - a.y
    const de = -(c.x * nx + c.y * ny)
    const t = -(nx * a.x + ny * a.y + de) / (nx * abx + ny * aby)
    if (0 <= t && t <= 1) {
      const cx = a.x + abx * t
      const cy = a.y + aby * t
      const acx = cx - c.x
      const acy = cy - c.y
      const bcx = cx - d.x
      const bcy = cy - d.y
      const doc = acx * bcx + acy * bcy
      if (doc <= 0) {
        const totalForce = -(
          body.waist.dx * nX + body.waist.dy * nY) / (
          nX ** 2 + nY ** 2) * (.5 + elasticity / 2)
        body.waist.dx += 2 * totalForce * nX
        body.waist.dy += 2 * totalForce * nY
        body.waist.dx *= 1 - frictionalForce
        body.waist.dy *= 1 - frictionalForce
      }
    }
  })
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
  const dispObject = {
    'internal FPS'    : mainFrameList.length - 1,
    'screen FPS'      : animFrameList.length - 1,
    'gravity'         : gravity,
    'elasticity'      : elasticity,
    'frictional force': frictionalForce,
  }
  Object.entries(dispObject).forEach(([k, v], i) => {
    ctx.fillText(k, 10, 10 * (i + 1))
    ctx.fillText(v, 100, 10 * (i + 1))
  })
}
{
  main()
  draw()
}