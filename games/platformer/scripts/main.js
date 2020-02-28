{'use strict'
const canvas = document.getElementById`canvas`
const context = canvas.getContext`2d`
const size = 16
// y: terrainList.length,
// x: terrainList[0].length
let ownCondition = {
  x: canvas.offsetWidth * 1 / 8,
  y: canvas.offsetHeight * 7 / 8,
  dx: 0,
  dy: 0
}
const moveAcceleration = 1
let moveConstant = 1
const normalConstant = 1
const dashConstant = 10
const stopConstant = .1
const brakeConstant = .1
const gravityConstant = 1
const elasticModulus = 0
const jumpConstant = size
let jumpFlag = false
let jumpTime = 0
let jumpChargeTime = 0
const terrainList = [
  '111111111111111111111111111111111111111111111111111111',
  '100000000000000000000000000000000000000000000000000001',
  '100000000000000000000000000000000000000000000000000001',
  '100000000000000000000000000000000000000000000000000001',
  '100000000000000000000000000000000000000000000000000001',
  '100000000000000000000000000000000000000000000000000001',
  '100000000000000000000000000000000000000000000000000001',
  '100000000000000000000000000000000000000000000000000001',
  '100000000000000000000000000000000000000000000000000001',
  '100000000000000000000000000000000000000000000000000001',
  '100000000000000000000000000000000000000000000000000001',
  '100000000000000000000000000000000000000000000000000001',
  '100000000000000000000000000000000000000000000000000001',
  '100000000000000000000000000000000000000000000000000001',
  '100000000000000000000000000000000000000000000000000001',
  '100000000000000000000000000000000000000000000000000001',
  '100000000000000000000000000000000000000000000000000001',
  '100000000000000000000000000000000000000000000000000001',
  '100000000000000000000000000000000000000000000000000001',
  '100000000000000000000000000000000000000000000000000001',
  '100000000000000000000000000000000000000000000000000001',
  '100000000000000000000000000000000000000000000000000001',
  '100000000000000000000000000000000000000000000000000001',
  '100000000000000000000000000000000000000000000000000001',
  '100000000110000000000000000000000000000000000000000001',
  '100010000110000000000000000000000000000000000000000001',
  '100000000000000000000000000000000000000000000000000001',
  '100000000000000000000000000000000000000000000000000001',
  '100000000000000000000000000000000000000000000000000001',
  '111111111111111111111111111111111111111111111111111111'
]
let key = {a: false, d: false, j: false, k: false, s: false, w: false}
document.addEventListener('keydown', e => {
  if (e.keyCode === 65) key.a = true
  if (e.keyCode === 68) key.d = true
  if (e.keyCode === 74) key.j = true
  if (e.keyCode === 75) key.k = true
  if (e.keyCode === 83) key.s = true
  if (e.keyCode === 87) key.w = true
}, false)
document.addEventListener('keyup', e => {
  if (e.keyCode === 65) key.a = false
  if (e.keyCode === 68) key.d = false
  if (e.keyCode === 74) key.j = false
  if (e.keyCode === 75) key.k = false
  if (e.keyCode === 83) key.s = false
  if (e.keyCode === 87) key.w = false
}, false)
const input = () => {
  if (key.a) {
    if (-moveConstant < ownCondition.dx) ownCondition.dx -= moveAcceleration
  }
  if (key.d) {
    if (ownCondition.dx < moveConstant) ownCondition.dx += moveAcceleration
  }
  if (key.w) ownCondition.dy -= moveAcceleration // temporary
  if (key.s) ownCondition.dy += moveAcceleration // temporary
  // if (key.j) {
  //     jumpTime += 1
  //   if (!jumpFlag) {
  //     ownCondition.dy -= jumpConstant
  //     jumpFlag = true
  //   }
  // } else {
  //   if (jumpConstant < jumpTime) jumpTime = 0
  //   if (jumpTime !== 0) ownCondition.dy += jumpConstant - jumpTime
  //   jumpTime = 0
  // }
  // if (key.k) {
  //   moveConstant =  dashConstant
  //   if (-stopConstant < ownCondition.dx && ownCondition.dx < stopConstant) {
  //     ownCondition.dx = ownCondition.dx / 2
  //   }
  // } else moveConstant = normalConstant
  // if (key.s) {
  //   if (jumpChargeTime < jumpConstant && !jumpFlag) jumpChargeTime += 1
  // } else if (jumpChargeTime !== 0) {
  //   ownCondition.dy -= jumpChargeTime
  //   jumpChargeTime = 0
  //   jumpFlag = true
  // }
  // if (key.w) {
  //   if (!jumpFlag) {
  //     ownCondition.dy -= jumpConstant
  //     jumpFlag = true
  //   }
  // }
}
const collisionDetect = () => {
  // ownCondition.dy += gravityConstant
  terrainList.forEach((y, iY) => {
    for (let iX = 0; iX < terrainList[0].length; iX++) {
      if (y[iX] === '1') {
        const r = size
        const tileWidth = size
        { // floor
          const ax = iX * size - r
          const ay = iY * size - r
          const bx = iX * size + tileWidth + r
          const by = iY * size - r
          const abx = bx - ax
          let ny = abx
          let length = (ny ** 2) ** .5
          if (0 < length) length = 1 / length
          ny *= length
          const d = -(ay * ny)
          const t = -(ny * ownCondition.y + d) / (ny * ownCondition.dy)
          if (0 < t && t <= 1) {
            const cx = ownCondition.x + ownCondition.dx * t
            const cy = ownCondition.y + ownCondition.dy * t
            const acx = cx - ax
            const acy = cy - ay
            const bcx = cx - bx
            const bcy = cy - by
            const doc = acx * bcx + acy * bcy
            if (doc < 0) {
              // console.log('detect floor', iX, t)
              ownCondition.dy = -ownCondition.dy * elasticModulus
            }
          }
        }
        { // ceil
          const ax = iX * size - r
          const ay = iY * size + tileWidth + r
          const bx = iX * size + tileWidth + r
          const by = iY * size + tileWidth + r
          const abx = bx - ax
          let ny = abx
          let length = (ny ** 2) ** .5
          if (0 < length) length = 1 / length
          ny *= length
          const d = -(ay * ny)
          const t = -(ny * ownCondition.y + d) / (ny * ownCondition.dy)
          if (0 < t && t <= 1) {
            const cx = ownCondition.x + ownCondition.dx * t
            const cy = ownCondition.y + ownCondition.dy * t
            const acx = cx - ax
            const acy = cy - ay
            const bcx = cx - bx
            const bcy = cy - by
            const doc = acx * bcx + acy * bcy
            if (doc < 0) {
              // console.log('detect ceil', iX)
              ownCondition.dy = -ownCondition.dy
            }
          }
        }
        { // left wall
          const ax = iX * size - r
          const ay = iY * size - r
          const bx = iX * size - r
          const by = iY * size + tileWidth + r
          const abx = bx - ax
          const aby = by - ay
          let nx = -aby
          let ny = abx
          let length = (nx ** 2 + ny ** 2) ** .5
          if (0 < length) length = 1 / length
          nx *= length
          ny *= length
          const d = -(ax * nx + ay * ny)
          const t = -(nx * ownCondition.x + ny * ownCondition.y + d) / (
            nx * ownCondition.dx + ny * ownCondition.dy)
          if (0 < t && t <= 1) {
            const cx = ownCondition.x + ownCondition.dx * t
            const cy = ownCondition.y + ownCondition.dy * t
            const acx = cx - ax
            const acy = cy - ay
            const bcx = cx - bx
            const bcy = cy - by
            const doc = acx * bcx + acy * bcy
            if (doc < 0) {
              console.log('detect left', iX)
              ownCondition.dx = -ownCondition.dx
            }
          }
        }
        { // right wall
          const ax = iX * size + tileWidth + r
          const ay = iY * size - r
          const bx = iX * size + tileWidth + r
          const by = iY * size + tileWidth + r
          const abx = bx - ax
          const aby = by - ay
          let nx = -aby
          let ny = abx
          let length = (nx ** 2 + ny ** 2) ** .5
          if (0 < length) length = 1 / length
          nx *= length
          ny *= length
          const d = -(ax * nx + ay * ny)
          const t = -(nx * ownCondition.x + ny * ownCondition.y + d) / (
            nx * ownCondition.dx + ny * ownCondition.dy)
          if (0 < t && t <= 1) {
            const cx = ownCondition.x + ownCondition.dx * t
            const cy = ownCondition.y + ownCondition.dy * t
            const acx = cx - ax
            const acy = cy - ay
            const bcx = cx - bx
            const bcy = cy - by
            const doc = acx * bcx + acy * bcy
            if (doc < 0) {
              console.log('detect left', iX)
              ownCondition.dx = -ownCondition.dx
            }
          }
        }
      }
    }
  })
  ownCondition.x += ownCondition.dx
  ownCondition.y += ownCondition.dy
  ownCondition.dx = 0
  ownCondition.dy = 0
}
const draw = () => {
  context.fillStyle = 'hsl(0, 100%, 50%)'
  context.fillRect(ownCondition.x - size, ownCondition.y - size, size * 2, size * 2)
  context.beginPath()
  context.arc(ownCondition.x, ownCondition.y + jumpChargeTime, size, 0, Math.PI * 2, false)
  context.fillStyle = context.strokeStyle = 'hsl(30, 100%, 60%)'
  context.fill()
  context.fillStyle = 'hsl(180, 100%, 50%)'
  terrainList.forEach((y, iY) => {
    for (let iX = 0; iX < terrainList[0].length; iX++) {
      if (y[iX] === '1') context.fillRect(iX * size, iY * size, size, size)
    }
  })
}
const main = () => {
  // internal process
  input()
  collisionDetect()
  // draw process
  context.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
  draw()
  window.requestAnimationFrame(main)
}
main()
}