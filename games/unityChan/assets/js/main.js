!(_ = () => {'use strict'

const imagePathList = [
  '../../assets/img/Misaki/Misaki_Blink_1.png', // 0
  '../../assets/img/Misaki/Misaki_Blink_2.png',
  '../../assets/img/Misaki/Misaki_Blink_3.png',
  '../../assets/img/Misaki/Misaki_Walk_1.png', // 3
  '../../assets/img/Misaki/Misaki_Walk_2.png',
  '../../assets/img/Misaki/Misaki_Walk_3.png',
  '../../assets/img/Misaki/Misaki_Walk_4.png',
  '../../assets/img/Misaki/Misaki_Walk_5.png',
  '../../assets/img/Misaki/Misaki_Walk_6.png',
  '../../assets/img/Misaki/Misaki_Crouch_1.png', // 9
  '../../assets/img/Misaki/Misaki_Crouch_2.png',
  '../../assets/img/Misaki/Misaki_Crouch_3.png',
  '../../assets/img/Misaki/Misaki_Jump_up_1.png', // 12
  '../../assets/img/Misaki/Misaki_Jump_up_2.png',
  '../../assets/img/Misaki/Misaki_Jump_up_3.png',
  '../../assets/img/Misaki/Misaki_Jump_MidAir_1.png', // 15
  '../../assets/img/Misaki/Misaki_Jump_MidAir_2.png',
  '../../assets/img/Misaki/Misaki_Jump_MidAir_3.png',
  '../../assets/img/Misaki/Misaki_Jump_Fall_1.png', // 18
  '../../assets/img/Misaki/Misaki_Jump_Fall_2.png',
  '../../assets/img/Misaki/Misaki_Jump_Fall_3.png',
]
let loadedList = []
let loadedMap = []
imagePathList.forEach(path => {
  const imgPreload = new Image()
  imgPreload.src = path
  imgPreload.addEventListener('load', () => {
    loadedList.push(path)
    loadedMap[path] = imgPreload
  })
})
const timerId = setInterval(() => { // loading monitoring
  if (loadedList.length === imagePathList.length) { // untrustworthy length in assosiative
    clearInterval(timerId)
    main()
  }
}, 100)
const drawImage = (arg, x, y) => {
  const img = new Image()
  img.src = imagePathList[arg]
  context.drawImage(img, x, y)
}
const drawInvImage = (arg, x, y) => {
  const img = new Image()
  img.src = imagePathList[arg]
  context.save()
  context.scale(-1, 1)
  context.drawImage(img, -x - img.width, y)
  context.restore()
}
const canvas = document.getElementById`canvas`
const context = canvas.getContext`2d`
const size = 16
let ownCondition = {
  x: canvas.offsetWidth * 1 / 8, y: canvas.offsetHeight * 7 / 8,
  dx: 0, dy: 0, state: 'idle', direction: 'right'
}
let ground = [{
  x: 0, y: canvas.offsetHeight * 31 / 32, w: canvas.offsetWidth, h: size
}, {
  x: 0, y: 0, w: size, h: canvas.offsetHeight
}, {
  x: canvas.offsetWidth - size, y: 0, w: size, h: canvas.offsetHeight
}, {
  x: canvas.offsetWidth * 1/4, y: canvas.offsetHeight * 24 / 32, w: size * 6, h: size * 4
}, {
  x: canvas.offsetWidth * 2/4, y: canvas.offsetHeight * 21 / 32, w: size * 5, h: size * 4
}, {
  x: canvas.offsetWidth * 3/4, y: canvas.offsetHeight * 18 / 32, w: size * 4, h: size * 4
}]
const moveAcceleration = 1
let moveConstant = 3
const normalConstant = 3
const dashConstant = 6
const stopConstant = .1
const brakeConstant = .6
const gravityConstant = 1
const jumpConstant = size
let jumpFlag = false
let jumpTime = 0
let jumpChargeTime = 0
let timer = 0

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
  if (ownCondition.dx < 0) ownCondition.direction = 'left'
  else if (0 <= ownCondition.dx) ownCondition.direction = 'right'
  if (key.a || key.d) {
    if (key.a && -moveConstant < ownCondition.dx) ownCondition.dx -= moveAcceleration
    if (key.d && ownCondition.dx < moveConstant) ownCondition.dx += moveAcceleration
    if (ownCondition.state !== 'jump') ownCondition.state = 'walk'
  } else if (ownCondition.state !== 'jump') ownCondition.state = 'idle'
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
    if (ownCondition.state !== 'jump') ownCondition.state = 'crouch'
  } else if (jumpChargeTime !== 0) {
    ownCondition.dy -= jumpChargeTime
    ownCondition.state = 'jump'
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
      if (ownCondition.x < obj.x) {}
      if (ownCondition.y < obj.y + size) {
        ownCondition.y = obj.y - size
        jumpFlag = false
        ownCondition.dx = ownCondition.dx * brakeConstant
        ownCondition.dy = 0
        if (ownCondition.state !== 'crouch' && ownCondition.state !== 'walk') ownCondition.state = 'idle'
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
let eyeBlinkTime = 1
let eyeState = 0
const eyeBlink = () => {
  const interval = 30
  if (timer % 5 === 0) eyeBlinkTime -= 1
  if (eyeBlinkTime === 0) eyeBlinkTime = (Math.random() * interval)|0 + 3
  if (eyeBlinkTime === 3) eyeState = 1
  else if (eyeBlinkTime === 2) eyeState = 2
  else if (eyeBlinkTime === 1) eyeState = 1
  else eyeState = 0
}
let walkTime = 6
let walkState = 0
const walk = () => {
  if (walkTime === 0) walkTime = 6
  else if (timer % 8 === 0) walkTime -= 1
  if (walkTime === 6) walkState = 3
  else if (walkTime === 5) walkState = 4
  else if (walkTime === 4) walkState = 5
  else if (walkTime === 3) walkState = 6
  else if (walkTime === 2) walkState = 7
  else if (walkTime === 1) walkState = 8
}
let crouchTime = 0
let crouchState = 0
const crouch = () => {
  if (timer % 7 === 0) crouchTime += 1
  if (ownCondition.state !== 'crouch') crouchTime = 0
  if (crouchTime === 0) crouchState = 9
  // else if (crouchTime === 1) crouchState = 10
  // else if (1 < crouchTime) crouchState = 11
}
const draw = () => {
  const drawGround = () => {
    context.fillStyle = 'hsl(180, 100%, 50%)'
    ground.forEach(obj => context.fillRect(obj.x, obj.y, obj.w, obj.h))
  }
  drawGround()
  crouch()
  if (ownCondition.state === 'idle') {
    eyeBlink()
    if (ownCondition.direction === 'right') {
      drawImage(eyeState, (ownCondition.x - 24)|0, (ownCondition.y - 36)|0)
    } else drawInvImage(eyeState, (ownCondition.x - 24)|0, (ownCondition.y - 36)|0)
  } else if (ownCondition.state === 'walk') {
    walk()
    if (ownCondition.direction === 'right') {
      drawImage(walkState, (ownCondition.x - 24)|0, (ownCondition.y - 36)|0)
    } else drawInvImage(walkState, (ownCondition.x - 24)|0, (ownCondition.y - 36)|0)
  } else if (ownCondition.state === 'crouch') {
    if (ownCondition.direction === 'right'){
      drawImage(crouchState, (ownCondition.x - 24)|0, (ownCondition.y - 36)|0)
    } else drawInvImage(crouchState, (ownCondition.x - 24)|0, (ownCondition.y - 36)|0)
  } else if (ownCondition.state === 'jump') {
    const id = (ownCondition.dy < -12) ? 12
    : (ownCondition.dy < -9) ? 13
    : (ownCondition.dy < -6) ? 14
    : (ownCondition.dy < -3) ? 15
    : (0 < ownCondition.dy) ? 16
    : (3 < ownCondition.dy) ? 17
    : (6 < ownCondition.dy) ? 18
    : (9 < ownCondition.dy) ? 19 : 20
    if (ownCondition.direction === 'right'){
      drawImage(id, (ownCondition.x - 24)|0, (ownCondition.y - 36)|0)
    } else drawInvImage(id, (ownCondition.x - 24)|0, (ownCondition.y - 36)|0)
  }
  console.log(ownCondition.state,ownCondition.dy)
}
const main = () => {
  timer += 1
  // internal process
  input()
  collisionDetect()
  // createObject()
  // move()
  // collisionDetect()
  // draw process
  context.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
  draw()
  window.requestAnimationFrame(main)
}

})()