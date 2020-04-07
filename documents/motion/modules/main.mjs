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
const canvas = document.getElementById`canvas`
canvas.width = 128
canvas.height = 128
const ctx = canvas.getContext`2d`
const PI = Math.PI
// const inseam = 17
const body = {
  waist: {from: 'bottom', degree: 0, reach:  0, x: 64, y: 64, r: 5},
  head:  {from:  'waist', degree: 0, reach: 20, x:  0, y:  0, r: 3},
  // kneeL:     {from:    'waist', reach:  9, degree:  .4 * PI, default: .25 * PI, x: 50, y: 50},
  // kneeR:     {from:    'waist', reach:  9, degree:  .6 * PI, default: .75 * PI, x: 50, y: 50},
  // heelL:     {from:     'kneeL', reach:  8, degree:  .5 * PI, default:  .5 * PI, x:  0, y:  0},
  // heelR:     {from:     'kneeR', reach:  8, degree:  .5 * PI, default:  .5 * PI, x:  0, y:  0},
  // hipL:      {from:     'waist', reach:  3, degree:        0, default:        0, x:  0, y:  0},
  // hipR:      {from:     'waist', reach:  3, degree:       PI, default:       PI, x:  0, y:  0},
  // footL:     {from:     'heelL', reach:  2, degree:        0, default:        0, x:  0, y:  0},
  // footR:     {from:     'heelR', reach:  2, degree:       PI, default:       PI, x:  0, y:  0},
  // neck:      {from:     'waist', reach: 11, degree: -.5 * PI, default: -.5 * PI, x:  0, y:  0},
  // shoulderL: {from:      'neck', reach:  3, degree:        0, default:        0, x:  0, y:  0},
  // shoulderR: {from:      'neck', reach:  3, degree:       PI, default:       PI, x:  0, y:  0},
  // elbowL:    {from: 'shoulderL', reach:  6, degree: .25 * PI, default: .25 * PI, x:  0, y:  0},
  // elbowR:    {from: 'shoulderR', reach:  6, degree: .75 * PI, default: .75 * PI, x:  0, y:  0},
  // handL:     {from:    'elbowL', reach:  6, degree:  .5 * PI, default:  .5 * PI, x:  0, y:  0},
  // handR:     {from:    'elbowR', reach:  6, degree:  .5 * PI, default:  .5 * PI, x:  0, y:  0},
  // head:      {from:      'neck', reach:  8, degree: -.5 * PI, default: -.5 * PI, x:  0, y:  0},
}
Object.values(body).forEach((v) => {
  if (v.from !== 'bottom') {
    v.x = body[v.from].x + v.reach * Math.cos(v.degree)
    v.y = body[v.from].y + v.reach * Math.sin(v.degree)
  }
})
// let isPivotLeft = false
// const diffHistory = {
//   pivotFlag: [],
//   heel: [],
// }
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
  // const stride = 10
  // const diff = Math.abs(body.kneeL.x - body.kneeR.x)
  // if (stride < diff) isPivotLeft = !isPivotLeft
  // let moveConstant = .2
  // if (key.j.flag) moveConstant *= 2
  // if ((key.s.flag && key.f.flag) || (!key.s.flag && !key.f.flag)) moveConstant = 0
  // else if (key.s.flag) moveConstant = -moveConstant
  // isPivotLeft ? body.kneeL.x += moveConstant : body.kneeR.x += moveConstant
  // body.neck.x+= moveConstant / 2
  // diffHistory.pivotFlag.push(isPivotLeft)
  // diffHistory.heel.push(moveConstant)
  // const gravity = .1
  // const length = 20
  // if (length < diffHistory.heel.length) {
  //   diffHistory.pivotFlag[0] ? body.heelL.x += diffHistory.heel[0] :
  //   body.heelR.x += diffHistory.heel[0]
  //   diffHistory.pivotFlag.shift()
  //   diffHistory.heel.shift()
  // }
  // Object.values(body).forEach((v) => {
  //   if (v.from === 'bottom') {
      // if (v.y <= canvas.offsetWidth - inseam) v.y += gravity
      // v.x = (body.kneeL.x + body.kneeR.x) / 2
    //   return
    // } else {
      // v.x = body[v.from].x + v.reach * Math.cos(v.degree)
  //     v.y = body[v.from].y + v.reach * Math.sin(v.degree)
  //   }
  // })
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