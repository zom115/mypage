{'use strict'
let currentTime = Date.now()
let globalElapsedTime = 1
const canvas = document.getElementById`canvas`
const context = canvas.getContext`2d`
const size = 16
const ownCondition = {
  x: canvas.offsetWidth * 1 / 8,
  y: canvas.offsetHeight * 7 / 8,
  dx: 0,
  dy: 0,
  jumpFlag: false,
}
const moveAcceleration = 2.1
let moveConstant = 3.5
const brakeConstant = .75 / (1000 / 60)
let brake = .75
// gravitational acceleration = 9.80665 m / s ** 2
// m / s ** 2 === 1000 / 1000 ** 1000 mm / ms ** 2
// 1 dot === 40 mm, 1000 mm === 25 * 40 mm
const gravitationalAcceleration = 9.80665 * 1000 / 25 / 1000 ** 2
let coefficient = 17
// 17 ???
console.log(9.80665 * 1000 / 25 / 1000 ** 2)
console.log(9.80665 * 1000 / 25 / 1000 ** 2 * 17)
const elasticModulus = {x: 0, y: 0,}
const jumpConstant = 3
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
  '100000000000000000000000000000000111111111110000000001',
  '111000000000000000000000000000000000000000000000000001',
  '100000000000000000000000000000000111000000000000000001',
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
  if (key.a) {
    if (-moveConstant < ownCondition.dx - moveAcceleration) {
      ownCondition.dx -= moveAcceleration
    } else ownCondition.dx = -moveConstant
  }
  if (key.d) {
    if (ownCondition.dx + moveAcceleration < moveConstant) {
      ownCondition.dx += moveAcceleration
    } else ownCondition.dx = moveConstant
  }
  if (key.w && -moveConstant < ownCondition.dy) {
    ownCondition.dy -= moveAcceleration * 10
  } // temporary
  if (key.s && ownCondition.dy < moveConstant) ownCondition.dy += moveAcceleration // temporary
  if (key.j) {
    if (!ownCondition.jumpFlag) {
      elasticModulus.y = 1
      ownCondition.jumpFlag = true
    }
  }
  // else {
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
  ownCondition.dy += gravitationalAcceleration * coefficient * globalElapsedTime
}
const collisionDetect = () => {
  let flag = false
  {
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
                ownCondition.dy = -(ownCondition.dy + jumpConstant) * elasticModulus.y
                //  - gravityConstant * (1 - t)
                ownCondition.dx *= brake
                ownCondition.jumpFlag = false
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
                ownCondition.dy = -ownCondition.dy * elasticModulus.y
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
                ownCondition.dx = -ownCondition.dx * elasticModulus.x
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
                ownCondition.dx = -ownCondition.dx * elasticModulus.x
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
    elasticModulus.x = 0
    elasticModulus.y = 0
    console.log(measure)
    if (!flag) measure += globalElapsedTime
    else measure = 0
  }
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
  const list = [
    `x: ${ownCondition.x}`,
    `y: ${ownCondition.y}`,
    `y(m): ${(((terrainList.length - 3) * size) - ownCondition.y) * .04}`,
    `coefficient: ${coefficient}`,
    `dx: ${ownCondition.dx}`,
    `dy: ${ownCondition.dy}`,
  ]
  list.forEach((v, i) => {
    context.fillText(v, size * 2, size * (3 + i))
  })
}
let measure = 0
const main = () => {
  window.requestAnimationFrame(main)
  globalElapsedTime = Date.now() - currentTime
  currentTime = Date.now()
  // internal process
  input()
  collisionDetect()
  // draw process
  context.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
  draw()
}
main()
}