import {key, globalTimestamp} from '../../../modules/key.mjs'
let currentTime = globalTimestamp
let globalDiffTime = globalTimestamp - currentTime
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
const canvas = document.getElementById`twoPointsGravity`
canvas.width = 128
canvas.height = 128
canvas.style.display = 'inline-block'
const ctx = canvas.getContext`2d`
const PI = Math.PI

let gravity = .001
let elasticity = 1
let frictionalForce = .5
const moveConstant = .002
const body = {
  waist: {from: 'bottom', degree: 0, reach:  0, x: 64, y: 64, r: 5, dx: 0, dy: 0, a: 0,},
  head:  {from:  'waist', degree: 0, reach: 20, x:  0, y:  0, r: 3, dx: 0, dy: 0, a: 0,},
}
const reset = () => {
  Object.values(body).forEach(v => {
    if (v.from !== 'bottom') {
      v.x = body[v.from].x + v.reach * Math.cos(v.degree)
      v.y = body[v.from].y + v.reach * Math.sin(v.degree)
      v.dx = 0
      v.dy = 0
      v.a = 0
    }
  })
}
reset()
const wallVertex = [
  [0, 0],
  [0, canvas.offsetHeight],
  [canvas.offsetWidth, canvas.offsetHeight],
  [canvas.offsetWidth, 0],
]
const main = () => setInterval(() => {
  globalDiffTime = globalTimestamp - currentTime
  currentTime = globalTimestamp
  frameCounter(mainFrameList)
  // input
  const deltaG = .001
  const deltaE = .1
  const deltaF = .1
  if (key.r.flag) {
    gravity = .001
    elasticity = 1
    frictionalForce = .5
    reset()
  }
  if (key.t.isFirst()) gravity -= deltaG
  if (key.y.isFirst()) gravity += deltaG
  if (key.g.isFirst()) elasticity -= deltaE
  if (key.h.isFirst()) elasticity += deltaE
  if (key.b.isFirst()) frictionalForce -= deltaF
  if (key.n.isFirst()) frictionalForce += deltaF
  const ratio = key.j.flag ? moveConstant * 2 : moveConstant
  if (key.q.flag) {
    body.head.a -= ratio * PI
  }
  if (key.w.flag) {
    body.head.a += ratio * PI
  }
  Object.values(body).forEach(v => {
    if (v.from === 'bottom') return
    else {
      const tilt = Math.atan2(v.y - body[v.from].y, v.x - body[v.from].x)
      v.dx = v.reach * (Math.cos(tilt + v.a) - Math.cos(tilt))
      v.dy = v.reach * (Math.sin(tilt + v.a) - Math.sin(tilt))
      if (PI < v.a) v.a -= PI * 2
      if (v.a < -PI) v.a += PI * 2
    }
    // if (v.reach ** 2 < (v.x + v.dx - body[v.from].x) ** 2 + (v.y + v.dy - body[v.from].y) ** 2) {
    // }
  })
  // collision detect
  wallVertex.forEach((vn, i) => {
    const vo = i === 0 ? wallVertex[wallVertex.length - 1] : wallVertex[i - 1]
    const normalDrag = Math.atan2(vn[1] - vo[1], vn[0] - vo[0]) - PI / 2
    const nX = Math.cos(normalDrag)
    const nY = Math.sin(normalDrag)
    Object.values(body).forEach(v => {
      const r = v.r
      const a = {x: vo[0] + nX * r, y: vo[1] + nY * r,}
      const b = {x: vn[0] + nX * r, y: vn[1] + nY * r,}
      const c = {x: v.x, y: v.y,}
      const d = {x: v.x + v.dx, y: v.y + v.dy,}
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
            v.dx * nX + v.dy * nY) / (
            nX ** 2 + nY ** 2) * (.5 + elasticity / 2)
          v.dx += 2 * totalForce * nX
          v.dy += 2 * totalForce * nY
          v.dx *= 1 - frictionalForce
          v.dy *= 1 - frictionalForce
        }
      }
    })
  })
  // state update
  Object.values(body).forEach(v => {
    if (v.from === 'bottom') {
      v.y += v.dy
      v.x += v.dx
    } else {
      v.x += v.dx
      v.y += v.dy
    }
    // v.dy += gravity
  })
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
    'angle'           : body.head.a,
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