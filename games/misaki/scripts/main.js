'use strict'
const imageChangeList = [0, 12, 18, 20, 28, 31, 33]
const imageStat = {
  idle: {start: imageChangeList[0], length: 12, condition: imageChangeList[0],
    time: 0, maxInterval: 30, frame: 5,
    blinkTime: 3, breathInterval: 45, minBreath: 15, midBreath: 45 ,maxBreath: 75
  }, walk: {start: imageChangeList[1], length: 6, condition: imageChangeList[1],
    time: 0, maxInterval: 0, frame: 10
  }, turn: {start: imageChangeList[2], length: 2, condition: imageChangeList[2],
    time: 0, maxInterval: 0, frame: 7
  }, run: {start: imageChangeList[3], length: 8, condition: imageChangeList[3],
    time: 1, maxInterval: 0, frame: 7
  }, crouch: {start: imageChangeList[4], length: 3, condition: imageChangeList[4],
    time: 1, maxInterval: 0, frame: 7
  }, jump: {start: imageChangeList[5], length: 9
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
let imageLoadedList = []
let imageLoadedMap = []
imagePathList.forEach(path => {
  const imgPreload = new Image()
  imgPreload.src = path
  imgPreload.addEventListener('load', () => {
    imageLoadedList.push(path)
    imageLoadedMap[path] = imgPreload
  })
})
const audioStat = {jump: 0, doubleJump: 1, breath: 2, win: 3}
const audioPathList = [
  'audio/Misaki/V2001.wav',
  'audio/Misaki/V2002.wav',
  'audio/Misaki/V2005.wav',
  'audio/Misaki/V2024.wav'
]
let audioLoadedList = []
let audioLoadedMap = []
audioPathList.forEach(path => {
  const audioPreload = new Audio()
  audioPreload.src = path
  audioPreload.volume = .5
  audioPreload.addEventListener('canplaythrough', () => {
    audioLoadedList.push(path)
    audioLoadedMap[path] = audioPreload
  })
})
const timerId = setInterval(() => { // loading monitoring
  if (
    imageLoadedList.length === imagePathList.length &&
    audioLoadedList.length === audioPathList.length
    ) { // untrustworthy length in assosiative
    clearInterval(timerId)
    main()
  }
}, 100)
const drawImage = (arg, x, y) => {
  const img = imageLoadedMap[imagePathList[arg]]
  context.drawImage(img, x, y)
}
const drawInvImage = (arg, x, y) => {
  const img = imageLoadedMap[imagePathList[arg]]
  context.save()
  context.scale(-1, 1)
  context.drawImage(img, -x - img.width, y)
  context.restore()
}
const playAudio = (value, startTime = 0) => {
  audioLoadedMap[audioPathList[value]].currentTime = startTime
  audioLoadedMap[audioPathList[value]].play()
}
const canvas = document.getElementById`canvas`
const context = canvas.getContext`2d`
const size = 16
let ownCondition = {
  x: canvas.offsetWidth * 1 / 8, y: canvas.offsetHeight * 7 / 8,
  dx: 0, dy: 0, action: 'idle', direction: 'right', state: 'aerial'
}
const hitbox = {
  x: ownCondition.x - size / 2,
  y: ownCondition.y - size * 3,
  w: size,
  h: size * 3
}
let ground = []
const setGround = (x, y, w, h) => {
  ground.push({x: x * size, y: y * size, w: w * size, h: h * size})
}
// frame
setGround(0, 29, 53, 1)
setGround(0, 0, 1, 27)
setGround(53, 1, 1, 29)
// object
setGround(4, 7, 12, 1)
setGround(8, 13, 6, 1)
setGround(3, 19, 9, 1)
setGround(4, 25, 5, 1)
setGround(24, 24, 5, 2)
setGround(36, 22, 2, 1)
setGround(39, 22, 1, 2)
setGround(42, 22, 2, 1)
setGround(45, 22, 1, 2)
setGround(49, 22, 2, 2)
setGround(18, 15, 12, 1)
setGround(46, 10, 3, 4)
setGround(47, 16, 3, 3)
setGround(14, 8, 1, 2)
setGround(15, 12, 1, 7)
setGround(37, 4, 2, 9)
setGround(37, 1, 8, 1)
const walkSpeed = .7
const brakeConstant = .94
const gravityConstant = .272
const jumpConstant = 5
let time = 0
let jump = {flag: false, double: false, time: 0, cooltime: 0, chargeTime: 0}
let cooltime = {
  step: 0, stepLimit: 15,stepDeferment: 15,
  slide: 2, slideLimit: 45
}
let action = {up: 'w', right: 'd', down: 's', left: 'a', jump: 'k', dash: 'j', debug: 'g', hitbox: 'h'}
let key = {a: false, b: false, d: false, g: false, h: false, j: false, k: false, s: false, w: false}
document.addEventListener('keydown', e => {
  if (e.keyCode === 65) key.a = true
  if (e.keyCode === 66) key.b = true
  if (e.keyCode === 68) key.d = true
  if (e.keyCode === 71) key.g = true
  if (e.keyCode === 72) key.h = true
  if (e.keyCode === 74) key.j = true
  if (e.keyCode === 75) key.k = true
  if (e.keyCode === 83) key.s = true
  if (e.keyCode === 87) key.w = true
}, false)
document.addEventListener('keyup', e => {
  if (e.keyCode === 65) key.a = false
  if (e.keyCode === 66) key.b = false
  if (e.keyCode === 68) key.d = false
  if (e.keyCode === 71) key.g = false
  if (e.keyCode === 72) key.h = false
  if (e.keyCode === 74) key.j = false
  if (e.keyCode === 75) key.k = false
  if (e.keyCode === 83) key.s = false
  if (e.keyCode === 87) key.w = false
}, false)
let keyHistory = {pressed: {}, released: {}}
Object.values(action).forEach(act => {
  keyHistory['pressed'][act] = -1
  keyHistory['released'][act] = 0
})
const volume = document.getElementsByTagName`input`[0]
volume.addEventListener('input', () => {
  audioPathList.forEach(path=> {
    audioLoadedMap[path].volume = volume.value
  })
})
let display = {debug: false, hitbox: false}
const input = () => {
  // warp
  if (size * 53 < ownCondition.x) {
    ownCondition.x = 50
    audioLoadedMap[audioPathList[audioStat.win]].currentTime = 0
    audioLoadedMap[audioPathList[audioStat.win]].play()
  }
  // walk
    const speed = (key[action.dash]) ? 2.8 : walkSpeed
  if (ownCondition.action !== 'jump') {
    ownCondition.dx *= brakeConstant
    if (key[action.left] && -speed < ownCondition.dx) ownCondition.dx -= walkSpeed
    if (key[action.right] && ownCondition.dx < speed) ownCondition.dx += walkSpeed
  } else {
    // airal brake
    if (key[action.left] && -speed < ownCondition.dx) ownCondition.dx -= walkSpeed / 3
    if (key[action.right] && ownCondition.dx < speed) ownCondition.dx += walkSpeed / 3
  }
  // step
  if (cooltime.step === 0) {
    if (
      key[action.left] &&
      time - keyHistory['pressed'][action.left] < cooltime.stepLimit &&
      0 < keyHistory['released'][action.left] - keyHistory['pressed'][action.left] &&
      keyHistory['released'][action.left] - keyHistory['pressed'][action.left] < cooltime.stepLimit
    ) {
      ownCondition.dx -= 4
      cooltime.step = cooltime.stepDeferment
    }
    if (
      key[action.right] &&
      time - keyHistory['pressed'][action.right] < cooltime.stepLimit &&
      0 < keyHistory['released'][action.right] - keyHistory['pressed'][action.right] &&
      keyHistory['released'][action.right] - keyHistory['pressed'][action.right] < cooltime.stepLimit
    ) {
      ownCondition.dx += 4
      cooltime.step = cooltime.stepDeferment
    }
  } else if (ownCondition.action !== 'jump') cooltime.step -= 1
  // slide
  if (cooltime.slide === 0) {
    if (key[action.down] && ownCondition.state === 'land') {
      const slideConstant = 2
      const boostConstant = 6
      let flag = false
      if (slideConstant < ownCondition.dx) {
        ownCondition.dx += boostConstant
        flag = true
      } else if (ownCondition.dx < -slideConstant) {
        ownCondition.dx -= boostConstant
        flag = true
      }
      if (flag) {
        cooltime.slide = cooltime.slideLimit
        if (10 < imageStat.idle.breathInterval) imageStat.idle.breathInterval -= 1
      }
    }
  } else {
    if (ownCondition.state === 'aerial' && 1 < cooltime.slide) cooltime.slide -= 2
    else cooltime.slide -= 1
  }
  // jump
  if (0 < jump.cooltime && ownCondition.state === 'land') jump.cooltime -= 1
  if (key[action.jump]) {
    if (jump.flag) {
      if (!jump.double && jump.time === 0) {
        ownCondition.dy = -jumpConstant
        jump.double = true
        playAudio(audioStat.doubleJump)
        if (5 < imageStat.idle.breathInterval) imageStat.idle.breathInterval -= 1
      }
    } else if (jump.cooltime === 0) {
      ownCondition.dy = -jumpConstant
      ownCondition.action = 'jump'
      jump.flag = true
      if (ownCondition.state === 'aerial') {
        jump.double = true
        playAudio(audioStat.doubleJump)
      } else {
        playAudio(audioStat.jump)
      }
      if (10 < imageStat.idle.breathInterval) imageStat.idle.breathInterval -= 1
      ownCondition.state = 'aerial'
      jump.cooltime = 10
    }
    jump.time += 1
  } else {
    if (jumpConstant < jump.time / 3) jump.time = 0
    if (jump.time !== 0) ownCondition.dy += jumpConstant - jump.time / 3
    jump.time = 0
  }
  const detectChangeDirection = () => {
    if (ownCondition.action !== 'jump') {
      if (key[action.right] && ownCondition.dx < walkSpeed) {
        ownCondition.action = 'turn'
      }
      if (key[action.left] && -walkSpeed < ownCondition.dx) {
        ownCondition.action = 'turn'
      }
      if (key[action.left] && key[action.right]) ownCondition.action = 'idle'
    }
  }
  detectChangeDirection()
}
const stateUpdate = () => {
  ownCondition.direction = (key[action.left] && key[action.right]) ? ownCondition.direction
  : (key[action.left]) ? 'left'
  : (key[action.right]) ? 'right' : ownCondition.direction
  if (ownCondition.action !== 'jump') {
    ownCondition.action = (ownCondition.action === 'turn') ? 'turn'
    : (-.2 < ownCondition.dx  && ownCondition.dx < .2) ? 'idle'
    : (-1.4 < ownCondition.dx  && ownCondition.dx < 1.4) ? 'walk' : 'run'
  }
  if (ownCondition.action === 'idle') {
    const i = imageStat.idle
    i.time += 1
    // breath
    if (i.time % i.breathInterval === 0) i.condition += 3
    if (i.length <= i.condition && i.condition <= i.length + 3) {
      i.condition -= i.length
      if (i.breathInterval < i.maxBreath) {
        i.breathInterval += 1
        if (i.breathInterval < 25) {
          const num = Math.random()
          const list = num < .9 ? {value: audioStat.breath, startTime: .3}
          : num < .95 ? {value: audioStat.jump, startTime: .3}
          : {value: audioStat.doubleJump, startTime: .33}
          playAudio(list.value, list.startTime)
        }
      }
      i.time = 0
    }
    // eye blink
    if (time % i.frame === 0) {
      i.blinkTime += 1
      if (i.blinkTime === 4) i.blinkTime = -(Math.random() * i.maxInterval)|0
      if (i.blinkTime === 0 || i.blinkTime === 1) i.condition += 1
      else if (i.blinkTime === 2 || i.blinkTime === 3)  i.condition -= 1
    }
  } else if (ownCondition.action === 'walk') {
    const i = imageStat.walk
    i.time += 1
    if (i.time % i.frame === 0) i.condition += 1
    if (i.condition === i.start + i.length) {
      i.condition -= i.length
      i.time = 0
      const b = imageStat.idle
      if (b.midBreath < b.breathInterval) b.breathInterval -= 1
    }
  } else if (ownCondition.action === 'turn') {
    const i = imageStat.turn
    i.time += 1
    if (i.time % i.frame === 0) i.condition += 1
    if (i.condition === i.start + i.length) {
      i.condition -= i.length
      i.time = 0
      ownCondition.action = 'walk'
    }
  } else if (ownCondition.action === 'run') {
    const i = imageStat.run
    if (time % i.frame === 0) i.condition += 1
    if (i.condition === i.start + i.length) {
      i.condition = i.start
      const b = imageStat.idle
      if (b.minBreath < b.breathInterval) b.breathInterval -= 1
    }
  } else if (ownCondition.action === 'crouch') {
    const i = imageStat.crouch
    if (time % i.frame === 0) i.time += 1
    if (ownCondition.action !== 'crouch') i.time = 0
    if (i.time === 0) i.condition = 9
  }
  ownCondition.x += ownCondition.dx
  if (-.01 < ownCondition.dx && ownCondition.dx < .01) ownCondition.dx = 0
  if (ownCondition.state === 'aerial') ownCondition.y += ownCondition.dy
  ownCondition.dy += gravityConstant
  if (size * 2.5 < ownCondition.dy) ownCondition.dy = size * 2.5 // terminal speed
  Object.values(action).forEach(act => {
    if (key[act]) {
      if (keyHistory['pressed'][act] < keyHistory['released'][act]) {
        keyHistory['pressed'][act] = time
      }
    }
    else {
      if (keyHistory['released'][act] < keyHistory['pressed'][act]) {
        keyHistory['released'][act] = time
      }
    }
  })
  if (keyHistory['pressed'][action.debug] === time) display.debug = !display.debug
  if (keyHistory['pressed'][action.hitbox] === time) display.hitbox = !display.hitbox
}
const collisionDetect = () => {
  hitbox.x = ownCondition.x - size / 2
  hitbox.y = ownCondition.y - size * 3
  hitbox.w = size
  hitbox.h = size * 3
  let aerialFlag = true
  ground.forEach(obj => {
    if (
      hitbox.x <= obj.x + obj.w && obj.x <= hitbox.x + hitbox.w &&
      hitbox.y <= obj.y + obj.h && obj.y <= hitbox.y + hitbox.h
    ) {
      if (
        hitbox.x + hitbox.w * .2 <= obj.x + obj.w && obj.x <= hitbox.x + hitbox.w * .8
      ) {
        if (hitbox.y + hitbox.h * .1 <= obj.y + obj.h && obj.y < hitbox.y + hitbox.h * .5) {
          ownCondition.y += hitbox.h * .1
          ownCondition.dy = 0
          ownCondition.state = 'aerial'
        } else if (hitbox.y + hitbox.h * .5 < obj.y + obj.h && obj.y <= hitbox.y + hitbox.h) {
          ownCondition.y = obj.y
          ownCondition.dy = 0
          aerialFlag = false
          ownCondition.state = 'land'
          jump.flag = false
          jump.double = false
          if (
            ownCondition.action !== 'run' &&
            ownCondition.action !== 'crouch' &&
            ownCondition.action !== 'walk' &&
            ownCondition.action !== 'turn'
          ) ownCondition.action = 'idle'
        }
      }
      if (
        hitbox.y + hitbox.h * .2 <= obj.y + obj.h && obj.y <= hitbox.y + hitbox.h * .8
      ) {
        ownCondition.dx = -ownCondition.dx / 3
        if (hitbox.x <= obj.x + obj.w && obj.x < hitbox.x + hitbox.w * .2) {
          ownCondition.x += hitbox.w / 4
        } else if (hitbox.x + hitbox.w * .8 < obj.x + obj.w && obj.x <= hitbox.x + hitbox.w) {
          ownCondition.x -= hitbox.w / 4
        }
      }
    }
  })
  if (aerialFlag) ownCondition.state = 'aerial'
}
const draw = () => {
  const drawGround = () => {
    context.fillStyle = 'hsl(180, 100%, 50%)'
    ground.forEach(obj => context.fillRect(obj.x, obj.y, obj.w, obj.h))
  }
  drawGround()
  const offset = {x: 24, y: 53}
  let i
  if (ownCondition.action === 'idle') i = imageStat.idle.condition // don't nessessary?
  else if (ownCondition.action === 'walk') i = imageStat.walk.condition
  else if (ownCondition.action === 'turn') i = imageStat.turn.condition
  else if (ownCondition.action === 'run') i = imageStat.run.condition
  else if (ownCondition.action === 'crouch') i = imageStat.crouch.condition
  else if (ownCondition.action === 'jump') {
    const ij = imageStat.jump
    i = (ownCondition.dy < -6) ? ij.start
    : (ownCondition.dy < -4) ? ij.start + 1
    : (ownCondition.dy < -2) ? ij.start + 2
    : (ownCondition.dy < -1) ? ij.start + 3
    : (6 < ownCondition.dy) ? ij.start + 7
    : (4 < ownCondition.dy) ? ij.start + 6
    : (2 < ownCondition.dy) ? ij.start + 5
    : (0 < ownCondition.dy) ? ij.start + 4
    : ij.start + 8
  }
  if (ownCondition.direction === 'right'){
    drawImage(i, (ownCondition.x - offset.x)|0, (ownCondition.y - offset.y)|0)
  } else drawInvImage(i, (ownCondition.x - offset.x)|0, (ownCondition.y - offset.y)|0)
}
const debugDisplay = () => {
  context.fillStyle = 'hsl(120, 100%, 50%)'
  context.font = `${size}px sans-serif`
  context.fillText(`stamina: ${imageStat.idle.breathInterval}`, size * 2, size)
  context.fillText('cooltime', size * 10, size )
  context.fillText(`jump : ${jump.cooltime}`, size * 16, size)
  context.fillText(`step : ${cooltime.step}`, size * 16, size * 3)
  context.fillText(`slide: ${cooltime.slide}`, size * 16, size * 5)
}
const displayHitbox = () => {
  context.fillStyle = 'hsl(300, 100%, 50%)'
  context.fillRect(hitbox.x, hitbox.y+hitbox.h*.1, hitbox.w, hitbox.h*.7)
  context.fillRect(hitbox.x+hitbox.w*.2, hitbox.y+hitbox.h*.8, hitbox.w*.6, hitbox.h*.2)
}
const main = () => {
  time += 1
  // internal process
  input()
  stateUpdate()
  collisionDetect()
  context.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
  draw()
  if (display.debug) debugDisplay()
  if (display.hitbox) displayHitbox()
  window.requestAnimationFrame(main)
}