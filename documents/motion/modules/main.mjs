const canvas = document.getElementById`canvas`
canvas.width = 256
canvas.height = 256
const ctx = canvas.getContext`2d`
ctx.fillText('text', 10, 10)
const body = {
  waist:     {from:    'bottom', reach:  0, direction:              0, x: 50, y: 50},
  hipL:      {from:     'waist', reach:  3, direction:              0, x:  0, y:  0},
  hipR:      {from:     'waist', reach:  3, direction:        Math.PI, x:  0, y:  0},
  kneeL:     {from:      'hipL', reach:  8, direction:  .25 * Math.PI, x:  0, y:  0},
  kneeR:     {from:      'hipR', reach:  8, direction:   .5 * Math.PI, x:  0, y:  0},
  heelL:     {from:     'kneeL', reach:  8, direction:   .5 * Math.PI, x:  0, y:  0},
  heelR:     {from:     'kneeR', reach:  8, direction:   .5 * Math.PI, x:  0, y:  0},
  footL:     {from:     'heelL', reach:  2, direction:              0, x:  0, y:  0},
  footR:     {from:     'heelR', reach:  2, direction:        Math.PI, x:  0, y:  0},
  neck:      {from:     'waist', reach: 11, direction:  -.5 * Math.PI, x:  0, y:  0},
  shoulderL: {from:      'neck', reach:  3, direction:              0, x:  0, y:  0},
  shoulderR: {from:      'neck', reach:  3, direction:        Math.PI, x:  0, y:  0},
  elbowL:    {from: 'shoulderL', reach:  6, direction: -.25 * Math.PI, x:  0, y:  0},
  elbowR:    {from: 'shoulderR', reach:  6, direction:  .75 * Math.PI, x:  0, y:  0},
  handL:     {from:    'elbowL', reach:  6, direction:              0, x:  0, y:  0},
  handR:     {from:    'elbowR', reach:  6, direction:   .5 * Math.PI, x:  0, y:  0},
  head:      {from:      'neck', reach:  8, direction:  -.5 * Math.PI, x:  0, y:  0},
}
const range = {
  head: 6,
  handL: 2,
  handR: 2,
  footL: 2,
  footR: 2,
}
Object.values(body).forEach((v) => {
  if (v.from === 'bottom') return
  else {
    v.x = body[v.from].x + v.reach * Math.cos(v.direction)
    v.y = body[v.from].y + v.reach * Math.sin(v.direction)
  }
})
ctx.beginPath()
Object.values(body).forEach(v => {
  if (v.from === 'bottom') return
  ctx.moveTo((v.x|0) +.5, (v.y|0) + .5)
  ctx.lineTo((body[v.from].x|0) + .5, (body[v.from].y|0) + .5)
})
ctx.closePath()
ctx.stroke()
Object.entries(range).forEach(([k, v]) => {
  ctx.beginPath()
  ctx.arc(body[k].x, body[k].y, v, 0, Math.PI * 2)
  ctx.fill()
})