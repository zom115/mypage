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
const moveAcceleration = .05
let moveConstant = 1
const normalConstant = 1
const dashConstant = 10
const stopConstant = .1
const brakeConstant = .98
const gravityConstant = .5
const elasticModulus = 1
const jumpConstant = size
let jumpFlag = false
let jumpTime = 0
let jumpChargeTime = 0
const terrainList = [
  '000000000000000000000000000000000000000000000000000000',
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
  '100000000011100000000000000000000000000000000000000001',
  '100000000000000000000000000000000000000000000000000001',
  '100000000000000000000000000000000000000000000000000001',
  '100011100111100000000000000000000000000000000000000001',
  '100000000000000000000000000000000000000000000000000001',
  '100000000000000000000000000000000000000000000000000001',
  '100000000000000000000000000000000000000000000000000001',
  '100000000111111110000000000000000000000000000000000001',
  '100000000001100000000000000000000000000000000000000001',
  '100000000000000000000000000000000000000000000000000001',
  '100000000000000000000000000000000000000000000000000001',
  '111111111111111111111111111111111111111111111111111111',
  '000000000000000000000000000000000000000000000000000000',
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
  if (key.a && -moveConstant < ownCondition.dx) ownCondition.dx -= moveAcceleration
  if (key.d && ownCondition.dx < moveConstant) ownCondition.dx += moveAcceleration
  if (key.w && -moveConstant < ownCondition.dy) ownCondition.dy -= moveAcceleration // temporary
  if (key.s && ownCondition.dy < moveConstant) ownCondition.dy += moveAcceleration // temporary
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
let flag = false
const collisionDetect = () => {
  // ownCondition.dy += gravityConstant
  let count = 0
  do {
    count += 1
    flag = false
    terrainList.forEach((y, iY) => {
      for (let iX = 0; iX < terrainList[0].length; iX++) {
        if (y[iX] === '1') {
          let r = size
          const tileWidth = size
          if (0 < ownCondition.dy && terrainList[iY - 1][iX] !== '1') { // floor
            const ax = iX * size - r
            const ay = iY * size
            const bx = iX * size + tileWidth + r
            const by = iY * size
            const abx = bx - ax
            let ny = abx
            let length = (ny ** 2) ** .5
            if (0 < length) length = 1 / length
            ny *= length
            const d = -(ay * ny)
            const t = -(ny * ownCondition.y + d) / (ny * (ownCondition.dy + r))
            if (0 <= t && t <= 1) {
              const cx = ownCondition.x + ownCondition.dx * t
              const cy = ownCondition.y + ownCondition.dy * t
              const acx = cx - ax
              const acy = cy - ay
              const bcx = cx - bx
              const bcy = cy - by
              const doc = acx * bcx + acy * bcy
              // const diff = ownCondition.x < ax + r ? ownCondition.x - ax - r :
              // bx - r < ownCondition.x ? ownCondition.x - bx + r : 0
              if (
                doc <= 0
                //  && ax + r <= ownCondition.x && ownCondition.x <= bx - r
              ) {
                // console.log('detect floor', ownCondition.y, ownCondition.dy)
                // ownCondition.y = ay - r
                ownCondition.dy = -ownCondition.dy * elasticModulus
                //  - gravityConstant * (1 - t)
                // ownCondition.dx *= brakeConstant
                flag = true
              }
              // else if (
              //   ((ax < ownCondition.x && ownCondition.x < ax + r) ||
              //   (bx - r < ownCondition.x && ownCondition.x < bx)) &&
              //   ay - ownCondition.y - ownCondition.dy <
              //   r * Math.cos((diff / r) * (Math.PI / 2))
              // ) {
              //   console.log('detect floor corner', count, diff)
              //   // ownCondition.dy = -ownCondition.dy * elasticModulus
              //   // ownCondition.dx += diff * (1 / size)
              //   flag = true
              // }
            }
          }
          if (ownCondition.dy < 0 && terrainList[iY + 1][iX] !== '1') { // ceil
            const ax = iX * size - r
            const ay = iY * size + tileWidth
            const bx = iX * size + tileWidth + r
            const by = iY * size + tileWidth
            const abx = bx - ax
            let ny = abx
            let length = (ny ** 2) ** .5
            if (0 < length) length = 1 / length
            ny *= length
            const d = -(ay * ny)
            const t = -(ny * ownCondition.y + d) / (ny * (ownCondition.dy - r))
            if (0 <= t && t <= 1) {
              const cx = ownCondition.x + ownCondition.dx * t
              const cy = ownCondition.y + ownCondition.dy * t
              const acx = cx - ax
              const acy = cy - ay
              const bcx = cx - bx
              const bcy = cy - by
              const doc = acx * bcx + acy * bcy
              // const diff = ownCondition.x < ax + r ? ownCondition.x - ax - r :
              // bx - r < ownCondition.x ? ownCondition.x - bx + r : 0
              if (
                (doc < 0
                //   && ax + r <= ownCondition.x && ownCondition.x <= bx - r) ||
                // ((ax < ownCondition.x && ownCondition.x < ax + r) ||
                // (bx - r < ownCondition.x && ownCondition.x < bx)) &&
                // -(ay - ownCondition.y - ownCondition.dy) <
                // r * Math.cos((diff / r) * (Math.PI / 2)
                )
              ) {
                console.log('detect ceil')
                // ownCondition.dy = -ownCondition.dy * elasticModulus
                // ownCondition.y = ay + r
                ownCondition.dy = -ownCondition.dy * elasticModulus
                //  - gravityConstant * (1 - t)
                // ownCondition.dx *= brakeConstant
                flag = true
              }
            }
          }
          if (0 < ownCondition.dx && y[iX - 1] !== '1') { // right wall
            const ax = iX * size
            const ay = iY * size - r
            const bx = iX * size
            const by = iY * size + tileWidth + r
            const aby = by - ay
            let nx = -aby
            let length = (nx ** 2) ** .5
            if (0 < length) length = 1 / length
            nx *= length
            const d = -(ax * nx)
            const t = -(nx * ownCondition.x + d) / (nx * (ownCondition.dx + r))
            if (0 <= t && t <= 1) {
              const cx = ownCondition.x + ownCondition.dx * t
              const cy = ownCondition.y + ownCondition.dy * t
              const acx = cx - ax
              const acy = cy - ay
              const bcx = cx - bx
              const bcy = cy - by
              const doc = acx * bcx + acy * bcy
              // const diff = ownCondition.y < ay + r ? ownCondition.y - ay - r :
              // by - r < ownCondition.y ? ownCondition.y - by + r : 0
              if (
                (doc < 0
                //   && ay + r <= ownCondition.y && ownCondition.y <= by - r) ||
                // ((ay < ownCondition.y && ownCondition.y < ay + r) ||
                // (by - r < ownCondition.y && ownCondition.y < by)) &&
                //   ax - ownCondition.x - ownCondition.dx <
                //   r * Math.cos((diff / r) * (Math.PI / 2)
                  )
              ) {
                console.log('detect right wall')
                // ownCondition.dx = -ownCondition.dx * elasticModulus
                // ownCondition.x = ax - r
                ownCondition.dx = -ownCondition.dx * elasticModulus
                flag = true
              }
            }
          }
          if (ownCondition.dx < 0 && y[iX + 1] !== '1') { // left wall
            const ax = iX * size + tileWidth
            const ay = iY * size - r
            const bx = iX * size + tileWidth
            const by = iY * size + tileWidth + r
            const aby = by - ay
            let nx = -aby
            let length = (nx ** 2) ** .5
            if (0 < length) length = 1 / length
            nx *= length
            const d = -(ax * nx)
            const t = -(nx * ownCondition.x + d) / (nx * (ownCondition.dx - r))
            if (0 <= t && t <= 1) {
              const cx = ownCondition.x + ownCondition.dx * t
              const cy = ownCondition.y + ownCondition.dy * t
              const acx = cx - ax
              const acy = cy - ay
              const bcx = cx - bx
              const bcy = cy - by
              const doc = acx * bcx + acy * bcy
              // const diff = ownCondition.y < ay + r ? ownCondition.y - ay - r :
              // by - r < ownCondition.y ? ownCondition.y - by + r : 0
              if (
                (doc < 0
                //   && ay + r <= ownCondition.y && ownCondition.y <= by - r) ||
                // ((ay < ownCondition.y && ownCondition.y < ay + r) ||
                // (by - r < ownCondition.y && ownCondition.y < by)) &&
                // -(ax - ownCondition.x - ownCondition.dx) <
                // r * Math.cos((diff / r) * (Math.PI / 2)
                )
              ) {
                console.log('detect left wall')
                // ownCondition.dx = -ownCondition.dx * elasticModulus
                // ownCondition.x = ax + r
                ownCondition.dx = -ownCondition.dx * elasticModulus
                // ownCondition.dy *= brakeConstant
                flag = true
              }
            }
          }
        }
      }
    })
    ownCondition.x += ownCondition.dx
    ownCondition.y += ownCondition.dy
  } while (flag)
  console.log(count)
  flag = false
}
const draw = () => {
  context.fillStyle = 'hsl(0, 100%, 50%)'
  context.fillRect(ownCondition.x - size, ownCondition.y - size, size * 2, size * 2)
  context.fillStyle = context.strokeStyle = 'hsl(30, 100%, 60%)'
  context.beginPath()
  context.arc(ownCondition.x, ownCondition.y + jumpChargeTime, size, 0, Math.PI * 2, false)
  context.fill()
  context.fillStyle = context.strokeStyle = 'hsl(300, 100%, 60%)'
  context.beginPath()
  context.arc(ownCondition.x, ownCondition.y + jumpChargeTime, size / 8, 0, Math.PI * 2, false)
  context.fill()
  context.fillStyle = 'hsl(180, 100%, 50%)'
  terrainList.forEach((y, iY) => {
    for (let iX = 0; iX < terrainList[0].length; iX++) {
      if (y[iX] === '1') context.fillRect(iX * size, iY * size, size, size)
    }
  })
  context.fillStyle = 'hsl(0, 0%, 0%)'
  context.fillText(`x: ${ownCondition.x}`,size, size * 2)
  context.fillText(`y: ${ownCondition.y}`,size, size * 3)
  context.fillText(`dx: ${ownCondition.dx}`,size, size * 4)
  context.fillText(`dy: ${ownCondition.dy}`,size, size * 5)
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