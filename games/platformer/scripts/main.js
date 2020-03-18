{'use strict'
let currentTime = Date.now()
let globalElapsedTime = 1
const canvas = document.getElementById`canvas`
const context = canvas.getContext`2d`
const size = 48
const ownCondition = {
  x: canvas.offsetWidth * 1 / 8,
  y: canvas.offsetHeight * 7 / 8,
  dx: 0,
  dy: 0,
  jumpFlag: false,
}
const moveAcceleration = 1
let moveConstant = 1
const brakeConstant = .75 / (1000 / 60)
let brake = .75
// gravitational acceleration = 9.80665 m / s ** 2
// m / s ** 2 === 1000 / 1000 ** 1000 mm / ms ** 2
// 1 dot === 40 mm, 1000 mm === 25 * 40 mm
const gravitationalAcceleration =
9.80665 * 1000 / 25 / 1000 ** 2
// 17 ???
let coefficient = 17
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
  '100020000000000000000000000000000000000000000000000001',
  '100210000000000000000000000000000000000000000000000001',
  '111000000000000000000000000000000000000000000000000001',
  '100111100000000000000000000000000000000000000000000001',
  '100000000000000000000000000000000000000000000000000001',
  '100000000000000000000000000000000000000000000000000001',
  '100000000000000000000000000000000111111111110000000001',
  '111000000000000000000000000000000000000000000000000001',
  '100000000000000000000000000000000111000000000000000001',
  '100000000000000000000000000000000000000000000000000001',
  '100000000000000000000000000000000000000000000000000001',
  '100000000000000000000000000000000000000000000000000001',
  '100000000000000000000000000000000000000000000000000001',
  '100000000000000000021111100000000000000000000000000001',
  '100000000000000000210000000000000000000000000000000001',
  '100000000000000002100000000000000000000000000000000001',
  '100000000000000021000000000000000000000000000000000001',
  '100000000000000210000000000000000000000000000000000001',
  '100000000000002103000000000000000000000000000000000001',
  '100000000000021000300000000000000000000000000000000001',
  '100000000000210000030000000000000000000000000000000001',
  '100000000002100000003000000000000000000000000000000001',
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
  { // temporary
    ownCondition.dx = 0
    ownCondition.dy = 0
  }
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
    ownCondition.dy -= moveAcceleration
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
const ownBox = {w: size / 8, h: size / 8}
const collisionDetect = () => {
  let count = 0
  let flag
  do {
    count++
    if (10 < count) {
      ownCondition.x = canvas.offsetWidth * 1 / 8
      ownCondition.y = canvas.offsetHeight * 7 / 8
    }
    flag = false
    terrainList.forEach((y, iY) => {
      for (let iX = 0; iX < terrainList[0].length; iX++) {
        const tileWidth = size
        if (y[iX] === '1') {
          if (0 < ownCondition.dy && terrainList[iY - 1][iX] === '0') { // floor
            const x = ownCondition.x
            const y = ownCondition.y
            const dx = ownCondition.dx
            const dy = ownCondition.dy
            const ax = iX * size - ownBox.w
            const ay = iY * size - ownBox.h
            const bx = iX * size + tileWidth + ownBox.w
            const by = iY * size - ownBox.h
            const abx = bx - ax
            const aby = by - ay
            let nx = -aby
            let ny = abx
            let length = (nx ** 2 + ny ** 2) ** .5
            if (0 < length) length = 1 / length
            nx *= length
            ny *= length
            const d = -(ax * nx + ay * ny)
            const t = -(nx * x + ny * y + d) / (nx * dx + ny * dy)
            if (0 <= t && t <= 1) {
              const cx = x + dx * t
              const cy = y + dy * t
              const acx = cx - ax
              const acy = cy - ay
              const bcx = cx - bx
              const bcy = cy - by
              const doc = acx * bcx + acy * bcy
              if (doc <= 0) {
                ownCondition.dy = -(ownCondition.dy + jumpConstant) * elasticModulus.y
                ownCondition.dx *= brake
                ownCondition.jumpFlag = false
                flag = true
              }
            }
          }
          if (ownCondition.dy < 0 && terrainList[iY + 1][iX] === '0') { // ceil
            const ax = iX * size - ownBox.w
            const ay = iY * size + tileWidth + ownBox.h
            const bx = iX * size + tileWidth + ownBox.w
            const by = iY * size + tileWidth + ownBox.h
            const abx = bx - ax
            let ny = abx
            let length = (ny ** 2) ** .5
            if (0 < length) length = 1 / length
            ny *= length
            const d = -(ay * ny)
            const t = -(ny * ownCondition.y + d) / (ny * (ownCondition.dy))
            if (0 <= t && t <= 1) {
              const cx = ownCondition.x + ownCondition.dx * t
              const cy = ownCondition.y + ownCondition.dy * t
              const acx = cx - ax
              const acy = cy - ay
              const bcx = cx - bx
              const bcy = cy - by
              const doc = acx * bcx + acy * bcy
              if (doc < 0) {
                console.log('detect ceil')
                ownCondition.dy = -ownCondition.dy * elasticModulus.y
                flag = true
              }
            }
          }
          if (0 < ownCondition.dx && y[iX - 1] === '0') { // right wall
            const ax = iX * size - ownBox.w
            const ay = iY * size - ownBox.h
            const bx = iX * size - ownBox.w
            const by = iY * size + tileWidth + ownBox.h
            const aby = by - ay
            let nx = -aby
            let length = (nx ** 2) ** .5
            if (0 < length) length = 1 / length
            nx *= length
            const d = -(ax * nx)
            const t = -(nx * ownCondition.x + d) / (nx * (ownCondition.dx))
            if (0 <= t && t <= 1) {
              const cx = ownCondition.x + ownCondition.dx * t
              const cy = ownCondition.y + ownCondition.dy * t
              const acx = cx - ax
              const acy = cy - ay
              const bcx = cx - bx
              const bcy = cy - by
              const doc = acx * bcx + acy * bcy
              if (doc < 0) {
                console.log('detect right wall')
                ownCondition.dx = -ownCondition.dx * elasticModulus.x
                flag = true
              }
            }
          }
          if (ownCondition.dx < 0 && y[iX + 1] === '0') { // left wall
            const ax = iX * size + tileWidth + ownBox.w
            const ay = iY * size - ownBox.h
            const bx = iX * size + tileWidth + ownBox.w
            const by = iY * size + tileWidth + ownBox.h
            const aby = by - ay
            let nx = -aby
            let length = (nx ** 2) ** .5
            if (0 < length) length = 1 / length
            nx *= length
            const d = -(ax * nx)
            const t = -(nx * ownCondition.x + d) / (nx * (ownCondition.dx))
            if (0 <= t && t <= 1) {
              const cx = ownCondition.x + ownCondition.dx * t
              const cy = ownCondition.y + ownCondition.dy * t
              const acx = cx - ax
              const acy = cy - ay
              const bcx = cx - bx
              const bcy = cy - by
              const doc = acx * bcx + acy * bcy
              if (doc < 0) {
                console.log('detect left wall 1', iX, iY)
                ownCondition.dx = -ownCondition.dx * elasticModulus.x
                // ownCondition.dy *= brakeConstantflag = true
              }
            }
          }
        } else if (y[iX] === '2') {
          if ( // floor & right wall = slope
            (0 < ownCondition.dy || 0 < ownCondition.dx) &&
            terrainList[iY - 1][iX] === '0' &&
            y[iX - 1] === '0'
          ) {
            const x = ownCondition.x
            const y = ownCondition.y
            const dx = ownCondition.dx
            const dy = ownCondition.dy
            const ax = iX * size - ownBox.w
            const ay = iY * size + tileWidth - ownBox.h
            const bx = iX * size + tileWidth - ownBox.w
            const by = iY * size - ownBox.h
            const abx = bx - ax
            const aby = by - ay
            let nx = -aby
            let ny = abx
            let length = (nx ** 2 + ny ** 2) ** .5
            if (0 < length) length = 1 / length
            nx *= length
            ny *= length
            const d = -(ax * nx + ay * ny)
            const t = -(nx * x + ny * y + d) / (nx * dx + ny * dy)
            if (0 <= t && t <= 1) {
              const cx = x + dx * t
              const cy = y + dy * t
              const acx = cx - ax
              const acy = cy - ay
              const bcx = cx - bx
              const bcy = cy - by
              const doc = acx * bcx + acy * bcy
              if (doc <= 0) {
                console.log('detect slope', iX, iY)
                ;[ownCondition.dx, ownCondition.dy] = [-ownCondition.dy, -ownCondition.dx]
                ownCondition.jumpFlag = false
                flag = true
              }
            }
          }
          if (ownCondition.dy < 0 && terrainList[iY + 1][iX] === '0') { // ceil
            const ax = iX * size - ownBox.w
            const ay = iY * size + tileWidth + ownBox.h
            const bx = iX * size + tileWidth + ownBox.w
            const by = iY * size + tileWidth + ownBox.h
            const abx = bx - ax
            let ny = abx
            let length = (ny ** 2) ** .5
            if (0 < length) length = 1 / length
            ny *= length
            const d = -(ay * ny)
            const t = -(ny * ownCondition.y + d) / (ny * (ownCondition.dy))
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
          if (ownCondition.dx < 0 && y[iX + 1] === '0') { // left wall
            const ax = iX * size + tileWidth + ownBox.w
            const ay = iY * size - ownBox.h
            const bx = iX * size + tileWidth + ownBox.w
            const by = iY * size + tileWidth + ownBox.h
            const aby = by - ay
            let nx = -aby
            let length = (nx ** 2) ** .5
            if (0 < length) length = 1 / length
            nx *= length
            const d = -(ax * nx)
            const t = -(nx * ownCondition.x + d) / (nx * (ownCondition.dx))
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
  } while(flag)
}
const draw = () => {
  context.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
  context.fillStyle = 'hsl(0, 100%, 50%)'
  context.beginPath()
  context.arc(ownCondition.x, ownCondition.y + jumpChargeTime, size / 32, 0, Math.PI * 2, false)
  context.fill()
  // context.strokeStyle = 'hsl(100, 100%, 50%)'
  // context.strokeRect(
  //   ownCondition.x - ownBox.w, ownCondition.y - ownBox.h,
  //   ownBox.w * 2, ownBox.h * 2)
  context.fillRect(
    ownCondition.x, ownCondition.y,
    ownCondition.dx * size + ownCondition.dy * 1,
    ownCondition.dy * size + ownCondition.dx * 1)
  context.beginPath()
  context.moveTo(ownCondition.x, ownCondition.y)
  context.lineTo(ownCondition.x + ownCondition.dx, ownCondition.y)
  context.lineTo(ownCondition.x + ownCondition.dx - ownCondition.dy, ownCondition.y)
  context.lineTo(ownCondition.x + ownCondition.dx - ownCondition.dy, ownCondition.y)
  context.fill()
  context.fillStyle = 'hsl(180, 100%, 50%)'
  terrainList.forEach((y, iY) => {
    for (let iX = 0; iX < terrainList[0].length; iX++) {
      if (y[iX] === '1') context.fillRect(iX * size, iY * size, size, size)
      else if (y[iX] === '2') {
        const relativeCooldinates = {x: iX * size,y: iY * size}
        context.beginPath()
        context.moveTo(relativeCooldinates.x, relativeCooldinates.y + size)
        context.lineTo(relativeCooldinates.x + size, relativeCooldinates.y + size)
        context.lineTo(relativeCooldinates.x + size, relativeCooldinates.y)
        context.fill()
      } else if (y[iX] === '3') {
        const relativeCooldinates = {x: iX * size,y: iY * size}
        context.beginPath()
        context.moveTo(relativeCooldinates.x, relativeCooldinates.y)
        context.lineTo(relativeCooldinates.x, relativeCooldinates.y + size)
        context.lineTo(relativeCooldinates.x + size, relativeCooldinates.y + size)
        context.fill()
      }
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
const main = () => {
  window.requestAnimationFrame(main)
  globalElapsedTime = Date.now() - currentTime
  currentTime = Date.now()
  // internal process
  input()
  collisionDetect()
  // draw process
  draw()
}
main()
}