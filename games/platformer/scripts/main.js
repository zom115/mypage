{'use strict'
const canvas = document.getElementById`canvas`
const context = canvas.getContext`2d`
const size = 16
// y: terrainList.length,
// x: terrainList[0].length
let ownCondition = {
  x: canvas.offsetWidth * 1 / 8, y: canvas.offsetHeight * 7 / 8,
  dx: 0, dy: 0
}
let ground = [{
  x: 0, y: canvas.offsetHeight * 31 / 32, w: canvas.offsetWidth, h: size
}, {
  x: 0, y: 0, w: size, h: canvas.offsetHeight
}, {
  x: canvas.offsetWidth - size, y: 0, w: size, h: canvas.offsetHeight
}]
const moveAcceleration = 1
let moveConstant = 5
const normalConstant = 5
const dashConstant = 10
const stopConstant = .1
const brakeConstant = .9
const gravityConstant = 1
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
  '100000000000000000000000000000000000000000000000000001',
  '100000000000000000000000000000000000000000000000000001',
  '100000000000000000000000000000000000000000000000000001',
  '100000000000000011100000000000000000000000000000000001',
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
  if (key.j) {
      jumpTime += 1
    if (!jumpFlag) {
      ownCondition.dy -= jumpConstant
      jumpFlag = true
    }
  } else {
    if (jumpConstant < jumpTime) jumpTime = 0
    if (jumpTime !== 0) ownCondition.dy += jumpConstant - jumpTime
    jumpTime = 0
  }
  if (key.k) {
    moveConstant =  dashConstant
    if (-stopConstant < ownCondition.dx && ownCondition.dx < stopConstant) {
      ownCondition.dx = ownCondition.dx / 2
    }
  } else moveConstant = normalConstant
  if (key.s) {
    if (jumpChargeTime < jumpConstant && !jumpFlag) jumpChargeTime += 1
  } else if (jumpChargeTime !== 0) {
    ownCondition.dy -= jumpChargeTime
    jumpChargeTime = 0
    jumpFlag = true
  }
  if (key.w) {
    if (!jumpFlag) {
      ownCondition.dy -= jumpConstant
      jumpFlag = true
    }
  }
}
const collisionDetect = () => {
  ownCondition.x += ownCondition.dx
  ownCondition.y += ownCondition.dy
  ownCondition.dy += gravityConstant
  if (size < ownCondition.dy) ownCondition.dy = size // terminal speed
  ground.forEach(obj => {
    if (
      obj.x - size < ownCondition.x && ownCondition.x < obj.x + obj.w + size &&
      obj.y - size < ownCondition.y && ownCondition.y < obj.y + obj.h + size
    ) {
      if (ownCondition.x < obj.x) console.log('hello')
      if (ownCondition.y < obj.y + size) {
        ownCondition.y = obj.y - size
        jumpFlag = false
        ownCondition.dx = ownCondition.dx * brakeConstant
        ownCondition.dy = 0
      } else if (obj.y + obj.h - size < ownCondition.y) {
        ownCondition.y = obj.y+ obj.h + size
        ownCondition.dy = -ownCondition.dy
      }
    }
    if (
      obj.x - size < ownCondition.x && ownCondition.x < obj.x + obj.w + size &&
      obj.y - size < ownCondition.y && ownCondition.y < obj.y + obj.h + size
    ) {
      ownCondition.x -= ownCondition.dx
      ownCondition.dx = -ownCondition.dx
    }
  })
}
const draw = () => {
  context.fillStyle = 'hsl(180, 100%, 50%)'
  terrainList.forEach((y, iY) => {
    for (let iX = 0; iX < terrainList[0].length; iX++) {
      if (y[iX] === '1') context.fillRect(iX * size, iY * size, size, size)
    }
  })
  context.beginPath()
  context.arc(ownCondition.x, ownCondition.y + jumpChargeTime, size, 0, Math.PI * 2, false)
  context.fillStyle = context.strokeStyle = 'hsl(30, 100%, 60%)'
  context.fill()
  const drawGround = () => {
    context.fillStyle = 'hsl(180, 100%, 50%)'
    ground.forEach(obj => context.fillRect(obj.x, obj.y, obj.w, obj.h))
  }
  drawGround()
  context.fillStyle = 'hsl(0, 100%, 50%)'
  context.fillRect(ownCondition.x, ownCondition.y, size, size)
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