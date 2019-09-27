!(_ = () => {'use strict'

const imgChangeList = [0, 12, 18, 20, 28, 31, 33]
const imgStat = {
  idle: {start: imgChangeList[0], length: 12, condition: imgChangeList[0], time: 0, maxInterval: 30, frame: 5,
    blinkTime: 3, breathInterval: 45, minBreath: 15, midBreath: 45 ,maxBreath: 75
  }, walk: {start: imgChangeList[1], length: 6, condition: imgChangeList[1],
    time: 0, maxInterval: 0, frame: 10
  }, turn: {start: imgChangeList[2], length: 2, condition: imgChangeList[2],
    time: 0, maxInterval: 0, frame: 7
  }, run: {start: imgChangeList[3], length: 8, condition: imgChangeList[3],
    time: 1, maxInterval: 0, frame: 7
  }, crouch: {start: imgChangeList[4], length: 3, condition: imgChangeList[4],
    time: 1, maxInterval: 0, frame: 7
  }, jump: {start: imgChangeList[5], length: 9
}}
const imagePathList = [
  '../../images/Misaki/Misaki_Idle_1.png', // 0
  '../../images/Misaki/Misaki_Idle_1_Blink_1.png',
  '../../images/Misaki/Misaki_Idle_1_Blink_2.png',
  '../../images/Misaki/Misaki_Idle_2.png',
  '../../images/Misaki/Misaki_Idle_2_Blink_1.png',
  '../../images/Misaki/Misaki_Idle_2_Blink_2.png',
  '../../images/Misaki/Misaki_Idle_3.png',
  '../../images/Misaki/Misaki_Idle_3_Blink_1.png',
  '../../images/Misaki/Misaki_Idle_3_Blink_2.png',
  '../../images/Misaki/Misaki_Idle_4.png',
  '../../images/Misaki/Misaki_Idle_4_Blink_1.png',
  '../../images/Misaki/Misaki_Idle_4_Blink_2.png',
  '../../images/Misaki/Misaki_Walk_1.png', // 12
  '../../images/Misaki/Misaki_Walk_2.png',
  '../../images/Misaki/Misaki_Walk_3.png',
  '../../images/Misaki/Misaki_Walk_4.png',
  '../../images/Misaki/Misaki_Walk_5.png',
  '../../images/Misaki/Misaki_Walk_6.png',
  '../../images/Misaki/Misaki_Turn_3.png', // 18
  '../../images/Misaki/Misaki_Turn_2.png',
  '../../images/Misaki/Misaki_Run_1.png', // 20
  '../../images/Misaki/Misaki_Run_2.png',
  '../../images/Misaki/Misaki_Run_3.png',
  '../../images/Misaki/Misaki_Run_4.png',
  '../../images/Misaki/Misaki_Run_5.png',
  '../../images/Misaki/Misaki_Run_6.png',
  '../../images/Misaki/Misaki_Run_7.png',
  '../../images/Misaki/Misaki_Run_8.png',
  '../../images/Misaki/Misaki_Crouch_1.png', // 28
  '../../images/Misaki/Misaki_Crouch_2.png',
  '../../images/Misaki/Misaki_Crouch_3.png',
  '../../images/Misaki/Misaki_Jump_up_1.png', // 31
  '../../images/Misaki/Misaki_Jump_up_2.png',
  '../../images/Misaki/Misaki_Jump_up_3.png',
  '../../images/Misaki/Misaki_Jump_MidAir_1.png',
  '../../images/Misaki/Misaki_Jump_MidAir_2.png',
  '../../images/Misaki/Misaki_Jump_MidAir_3.png',
  '../../images/Misaki/Misaki_Jump_Fall_1.png',
  '../../images/Misaki/Misaki_Jump_Fall_2.png',
  '../../images/Misaki/Misaki_Jump_Fall_3.png',
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
const walkSpeed = .7
const brakeConstant = .94
const gravityConstant = .272
const jumpConstant = 5
let jumpFlag = false
let jumpTime = 0
let jumpChargeTime = 0
let jumpCooltime = 0
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
  if (canvas.offsetWidth * .9 < ownCondition.x) ownCondition.x = 50
  if (ownCondition.state !== 'jump') {
    ownCondition.dx *= brakeConstant
    const speed = (key.k) ? 2.8 : walkSpeed
    if (key.a && -speed < ownCondition.dx) ownCondition.dx -= walkSpeed
    if (key.d && ownCondition.dx < speed) ownCondition.dx += walkSpeed
  }
  if (-.01 < ownCondition.dx && ownCondition.dx < .01) ownCondition.dx = 0
  if (0 < jumpCooltime) jumpCooltime -= 1
  if (key.j && !jumpCooltime) {
      jumpTime += 1
    if (!jumpFlag) {
      ownCondition.dy -= jumpConstant
      ownCondition.state = 'jump'
      jumpFlag = true
    }
  } else {
    if (jumpConstant < jumpTime) jumpTime = 0
    if (jumpTime !== 0) ownCondition.dy += jumpConstant - jumpTime
    jumpTime = 0
  }
  if (key.s) {
    if (jumpChargeTime < jumpConstant && !jumpFlag) jumpChargeTime += 1
    if (ownCondition.state !== 'jump') {
      ownCondition.state = 'crouch'
    }
  } else if (jumpChargeTime !== 0) {
    if (!jumpFlag) ownCondition.dy -= jumpChargeTime
    else ownCondition.dy = -jumpChargeTime
    ownCondition.state = 'jump'
    jumpChargeTime = 0
    jumpFlag = true
  }
  const detectChangeDirection = () => {
    if (ownCondition.state !== 'jump') {
      if (key.d && ownCondition.dx < walkSpeed) {
        ownCondition.state = 'turn'
      }
      if (key.a && -walkSpeed < ownCondition.dx) {
        ownCondition.state = 'turn'
      }
      if (key.a && key.d) ownCondition.state = 'idle'
    }
  }
  detectChangeDirection()
  ownCondition.x += ownCondition.dx
  ownCondition.y += ownCondition.dy
  ownCondition.dy += gravityConstant
  if (size * 2.5 < ownCondition.dy) ownCondition.dy = size * 2.5 // terminal speed
}
const collisionDetect = () => {
  ground.forEach(obj => {
    if (
      obj.x - size < ownCondition.x && ownCondition.x < obj.x + obj.w + size &&
      obj.y < ownCondition.y && ownCondition.y < obj.y + obj.h + size
    ) {
      if (ownCondition.x < obj.x) {}
      if (ownCondition.y < obj.y + size) {
        ownCondition.y = obj.y
        if (jumpFlag) {
          jumpFlag = false
          jumpCooltime = 10
        }
        ownCondition.dy = 0
        if (
          ownCondition.state !== 'crouch' && ownCondition.state !== 'walk'
          && ownCondition.state !== 'turn'
        ) ownCondition.state = 'idle'
      } else if (obj.y + obj.h < ownCondition.y) {
        ownCondition.y = obj.y+ obj.h + size
        ownCondition.dy = -ownCondition.dy
      }
    }
    if (
      obj.x - size < ownCondition.x && ownCondition.x < obj.x + obj.w + size &&
      obj.y < ownCondition.y && ownCondition.y < obj.y + obj.h + size
    ) {
      ownCondition.x -= ownCondition.dx
      ownCondition.dx = -ownCondition.dx
    }
  })
}
const stateUpdate = () => {
  ownCondition.direction = (key.a && key.d) ? ownCondition.direction
  : (key.a) ? 'left'
  : (key.d) ? 'right' : ownCondition.direction
  if (ownCondition.state !== 'jump') {
    ownCondition.state = (ownCondition.state === 'turn') ? 'turn'
    : (-.2 < ownCondition.dx  && ownCondition.dx < .2) ? 'idle'
    : (-1.4 < ownCondition.dx  && ownCondition.dx < 1.4) ? 'walk' : 'run'
  }
  if (ownCondition.state === 'idle') {
    const i = imgStat.idle
    i.time += 1
    // breath
    if (i.time % i.breathInterval === 0) i.condition += 3
    if (i.length <= i.condition && i.condition <= i.length + 3) {
      i.condition -= i.length
      if (i.breathInterval < i.maxBreath) i.breathInterval += 1
      i.time = 0
    }
    // eye blink
    if (timer % i.frame === 0) {
      i.blinkTime += 1
      if (i.blinkTime === 4) i.blinkTime = -(Math.random() * i.maxInterval)|0
      if (i.blinkTime === 0 || i.blinkTime === 1) i.condition += 1
      else if (i.blinkTime === 2 || i.blinkTime === 3)  i.condition -= 1
    }
  } else if (ownCondition.state === 'walk') {
    const i = imgStat.walk
    i.time += 1
    if (i.time % i.frame === 0) i.condition += 1
    if (i.condition === i.start + i.length) {
      i.condition -= i.length
      i.time = 0
      const b = imgStat.idle
      if (b.midBreath < b.breathInterval) b.breathInterval -= 1
    }
  } else if (ownCondition.state === 'turn') {
    const i = imgStat.turn
    i.time += 1
    if (i.time % i.frame === 0) i.condition += 1
    if (i.condition === i.start + i.length) {
      i.condition -= i.length
      i.time = 0
      ownCondition.state = 'walk'
    }
  } else if (ownCondition.state === 'run') {
    const i = imgStat.run
    if (timer % i.frame === 0) i.condition += 1
    if (i.condition === i.start + i.length) {
      i.condition = i.start
      const b = imgStat.idle
      if (b.minBreath < b.breathInterval) b.breathInterval -= 1
    }
  } else if (ownCondition.state === 'crouch') {
    const i = imgStat.crouch
    if (timer % i.frame === 0) i.time += 1
    if (ownCondition.state !== 'crouch') i.time = 0
    if (i.time === 0) i.condition = 9
  }
}
const draw = () => {
  const drawGround = () => {
    context.fillStyle = 'hsl(180, 100%, 50%)'
    ground.forEach(obj => context.fillRect(obj.x, obj.y, obj.w, obj.h))
  }
  drawGround()
  const offset = {x: 24, y: 53}
  let i
  if (ownCondition.state === 'idle') i = imgStat.idle.condition // don't nessessary?
  else if (ownCondition.state === 'walk') i = imgStat.walk.condition
  else if (ownCondition.state === 'turn') i = imgStat.turn.condition
  else if (ownCondition.state === 'run') i = imgStat.run.condition
  else if (ownCondition.state === 'crouch') i = imgStat.crouch.condition
  else if (ownCondition.state === 'jump') {
    const ij = imgStat.jump
    i = (ownCondition.dy < -12) ? ij.start
    : (ownCondition.dy < -9) ? ij.start + 1
    : (ownCondition.dy < -6) ? ij.start + 2
    : (ownCondition.dy < -3) ? ij.start + 3
    : (0 < ownCondition.dy) ? ij.start + 4
    : (3 < ownCondition.dy) ? ij.start + 5
    : (6 < ownCondition.dy) ? ij.start + 6
    : (9 < ownCondition.dy) ? ij.start + 7 : ij.start + 8
  }
  if (ownCondition.direction === 'right'){
    drawImage(i, (ownCondition.x - offset.x)|0, (ownCondition.y - offset.y)|0)
  } else drawInvImage(i, (ownCondition.x - offset.x)|0, (ownCondition.y - offset.y)|0)
  context.fillStyle = 'hsl(300, 100%, 50%)'
  // context.fillRect(ownCondition.x, ownCondition.y, 10, -1)
}
const main = () => {
  timer += 1
  // internal process
  input()
  collisionDetect()
  stateUpdate()
  context.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
  draw()
  window.requestAnimationFrame(main)
}

})()