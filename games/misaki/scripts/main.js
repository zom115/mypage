'use strict'
const audioControls = document.getElementsByTagName`audio`[0]
audioControls.volume = .1
const canvas = document.getElementById`canvas`
const context = canvas.getContext`2d`
const imageChangeList = [0, 12, 18, 20, 28, 31, 40]
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
  }, slide: {start: imageChangeList[6], length: 1, condition: imageChangeList[6]
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
  '../../images/Misaki/Misaki_S1.png'
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
  audioPreload.volume = .1
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
  context.save()
  if (player.direction === 'left') {
    context.scale(-1, 1)
    context.drawImage(img, -x - img.width, y)
  } else context.drawImage(img, x, y)
  context.restore()
}
const playAudio = (value, startTime = 0) => {
  audioLoadedMap[audioPathList[value]].currentTime = startTime
  audioLoadedMap[audioPathList[value]].play()
}
const size = 16
let stage = {width: size * 60, height: size * 45}
let player = {
  x: stage.width * 1 / 8, y: stage.height * 7 / 8,
  dx: 0, dy: 0, action: 'idle', direction: 'right', state: 'aerial'
}
const hitbox = {
  x: player.x - size / 2,
  y: player.y - size * 3,
  w: size,
  h: size * 3
}
let field = []
const setGround = (x, y, w, h) => {
  field.push({x: x * size, y: y * size, w: w * size, h: h * size})
}
// frame
setGround(0, stage.height / size - 1, stage.width / size, 1)
setGround(0, 0, 1, stage.height / size - 1)
setGround(stage.width / size - 1, 1, 1, stage.height / size - 2)
// object
setGround(7, 16, 9, 1)
setGround(5, 19, 4, 1)
setGround(8, 25, 6, 1)
setGround(3, 31, 9, 1)
setGround(4, 37, 6, 1)
setGround(5, 43, 4, 1)
setGround(20, 41, 5, 1)
setGround(33, 35, 1, 3)
setGround(32, 41, 3, 1)
setGround(37, 36, 1, 3)
setGround(37, 42, 1, 1)
setGround(40, 37, 1, 3)
setGround(40, 43, 1, 1)
setGround(43, 37, 1, 3)
setGround(43, 43, 1, 1)
setGround(47, 37, 1, 3)
setGround(47, 43, 1, 1)
setGround(24, 34, 5, 2)
setGround(41, 32, 2, 1)
setGround(44, 32, 1, 2)
setGround(47, 32, 2, 1)
setGround(50, 32, 1, 2)
setGround(54, 32, 2, 2)
setGround(18, 25, 12, 1)
setGround(30, 18, 5, 1)
setGround(51, 20, 3, 4)
setGround(52, 26, 3, 3)
setGround(14, 18, 1, 2)
setGround(15, 22, 1, 7)
setGround(37, 14, 2, 9)
setGround(37, 11, 8, 1)
const walkSpeed = .7 // dx := 1.4
const dashSpeed = 2.8 // dx := 3.5
const brakeConstant = .94
const gravityConstant = .272
const jumpConstant = 5
let time = 0
let jump = {flag: false, double: false, time: 0, cooltime: 0, chargeTime: 0}
let cooltime = {
  step: 0, stepLimit: 15,stepDeferment: 15,
  slide: 2, slideLimit: 45
}
let action = {
  up: 'w', right: 'd', down: 's', left: 'a', jump: 'k', dash: 'j',
  map: 'm', debug: 'g', hitbox: 'h'
}
let key = {
  a: false, b: false, d: false, g: false, h: false,
  j: false, k: false, m: false, s: false, w: false
}
document.addEventListener('keydown', e => {
  if (e.keyCode === 65) key.a = true
  if (e.keyCode === 66) key.b = true
  if (e.keyCode === 68) key.d = true
  if (e.keyCode === 71) key.g = true
  if (e.keyCode === 72) key.h = true
  if (e.keyCode === 74) key.j = true
  if (e.keyCode === 75) key.k = true
  if (e.keyCode === 77) key.m = true
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
  if (e.keyCode === 77) key.m = false
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
  audioPathList.forEach(path => audioLoadedMap[path].volume = volume.value)
})
let mode = {DECO: false, debug: false, hitbox: false, map: false}
const inputDOM = document.getElementsByTagName`input`
inputDOM.DECO.addEventListener('change', () => {mode.DECO = !mode.DECO}, false)
inputDOM.debug.addEventListener('change', () => {mode.debug = !mode.debug}, false)
inputDOM.hitbox.addEventListener('change', () => {mode.hitbox = !mode.hitbox}, false)
inputDOM.map.addEventListener('change', () => {mode.map = !mode.map}, false)
const input = () => {
  // warp
  // if (size * 53 < player.x) {
  //   player.x = 50
  //   audioLoadedMap[audioPathList[audioStat.win]].currentTime = 0
  //   audioLoadedMap[audioPathList[audioStat.win]].play()
  // }
  // walk
  const speed = (key[action.dash]) ? dashSpeed : walkSpeed
  if (player.action !== 'jump') {
    player.dx *= brakeConstant
    if (key[action.left] && -speed < player.dx) player.dx -= walkSpeed
    if (key[action.right] && player.dx < speed) player.dx += walkSpeed
  } else {
    // airal brake
    if (key[action.left] && -speed < player.dx) player.dx -= walkSpeed / 3
    if (key[action.right] && player.dx < speed) player.dx += walkSpeed / 3
  }
  // step
  if (cooltime.step === 0) {
    let stepFlag = false
    if (
      key[action.left] &&
      time - keyHistory['pressed'][action.left] < cooltime.stepLimit &&
      0 < keyHistory['released'][action.left] - keyHistory['pressed'][action.left] &&
      keyHistory['released'][action.left] - keyHistory['pressed'][action.left] < cooltime.stepLimit
    ) {
      player.dx -= 4
      stepFlag = true
    }
    if (
      key[action.right] &&
      time - keyHistory['pressed'][action.right] < cooltime.stepLimit &&
      0 < keyHistory['released'][action.right] - keyHistory['pressed'][action.right] &&
      keyHistory['released'][action.right] - keyHistory['pressed'][action.right] < cooltime.stepLimit
    ) {
      player.dx += 4
      stepFlag = true
    }
    if (stepFlag) {
      if (0 < player.dy) player.dy *= .7
      cooltime.step = cooltime.stepDeferment
    }
  } else if (player.action !== 'jump') cooltime.step -= 1
  // slide
  if (cooltime.slide === 0) {
    if (key[action.down] && player.state === 'land') {
      const slideConstant = 2
      const boostConstant = 6
      let flag = false
      if (slideConstant < player.dx) {
        player.dx += boostConstant
        flag = true
      } else if (player.dx < -slideConstant) {
        player.dx -= boostConstant
        flag = true
      }
      if (flag) {
        player.action = 'slide'
        cooltime.slide = cooltime.slideLimit
        if (10 < imageStat.idle.breathInterval) imageStat.idle.breathInterval -= 1
      }
    }
  } else {
    if (player.state === 'aerial' && 1 < cooltime.slide) cooltime.slide -= 2
    else cooltime.slide -= 1
  }
  // jump
  if (0 < jump.cooltime && player.state === 'land') jump.cooltime -= 1
  if (key[action.jump]) {
    if (jump.flag) {
      if (!jump.double && jump.time === 0) {
        player.dy = -jumpConstant
        jump.double = true
        playAudio(audioStat.doubleJump)
        if (5 < imageStat.idle.breathInterval) imageStat.idle.breathInterval -= 1
        jump.time = 0
      }
    } else if (jump.cooltime === 0) {
      player.dy = -jumpConstant
      player.action = 'jump'
      jump.flag = true
      if (player.state === 'aerial') {
        jump.double = true
        playAudio(audioStat.doubleJump)
      } else {
        if (player.dx < -3.5 || 3.5 < player.dx) player.dx *= .7
        playAudio(audioStat.jump)
      }
      if (10 < imageStat.idle.breathInterval) imageStat.idle.breathInterval -= 1
      player.state = 'aerial'
      jump.cooltime = 10
      jump.time = 0
    }
    jump.time += 1
  } else {
    if (mode.DECO) jump.time = 0
    else {
      if (5 < jump.time) {
        if (player.dy < 0) player.dy = 0
        jump.time = 0
      } else if (jump.time !== 0) jump.time += 1
    }
  }
  const detectChangeDirection = () => {
    if (player.action !== 'jump') {
      if (key[action.right] && player.dx < walkSpeed) player.action = 'turn'
      if (key[action.left] && -walkSpeed < player.dx) player.action = 'turn'
      if (key[action.left] && key[action.right]) player.action = 'idle'
    }
  }
  detectChangeDirection()
}
const stateUpdate = () => {
  player.direction = (key[action.left] && key[action.right]) ? player.direction
  : (key[action.left]) ? 'left'
  : (key[action.right]) ? 'right' : player.direction
  if (player.action !== 'jump') {
    player.action = (player.action === 'turn') ? 'turn'
    : (-.2 < player.dx && player.dx < .2) ? 'idle'
    : (-1.4 < player.dx && player.dx < 1.4) ? 'walk'
    : (player.action === 'slide' && (player.dx < -3.5 || 3.5 < player.dx)) ? 'slide' : 'run'
  }
  if (player.action === 'idle') {
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
  } else if (player.action === 'walk') {
    const i = imageStat.walk
    i.time += 1
    if (i.time % i.frame === 0) i.condition += 1
    if (i.condition === i.start + i.length) {
      i.condition -= i.length
      i.time = 0
      const b = imageStat.idle
      if (b.midBreath < b.breathInterval) b.breathInterval -= 1
      else if (b.breathInterval < b.midBreath)b.breathInterval += 1
    }
  } else if (player.action === 'turn') {
    const i = imageStat.turn
    i.time += 1
    if (i.time % i.frame === 0) i.condition += 1
    if (i.condition === i.start + i.length) {
      i.condition -= i.length
      i.time = 0
      player.action = 'walk'
    }
  } else if (player.action === 'run') {
    const i = imageStat.run
    if (time % i.frame === 0) i.condition += 1
    if (i.condition === i.start + i.length) {
      i.condition = i.start
      const b = imageStat.idle
      if (b.minBreath < b.breathInterval) b.breathInterval -= 1
      else if (b.breathInterval < b.minBreath) b.breathInterval += 1
    }
  } else if (player.action === 'crouch') {
    const i = imageStat.crouch
    if (time % i.frame === 0) i.time += 1
    if (player.action !== 'crouch') i.time = 0
    if (i.time === 0) i.condition = 9
  }
  player.x += player.dx
  if (-.01 < player.dx && player.dx < .01) player.dx = 0
  if (player.state === 'aerial') player.y += player.dy
  player.dy += gravityConstant
  if (size * 2.5 < player.dy) player.dy = size * 2.5 // terminal speed
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
  if (keyHistory['pressed'][action.up] === time) {
    mode.DECO = !mode.DECO
    inputDOM.DECO.checked = !inputDOM.DECO.checked
  }
  if (keyHistory['pressed'][action.debug] === time) {
    mode.debug = !mode.debug
    inputDOM.debug.checked = !inputDOM.debug.checked
  }
  if (keyHistory['pressed'][action.hitbox] === time) {
    mode.hitbox = !mode.hitbox
    inputDOM.hitbox.checked = !inputDOM.hitbox.checked
  }
  if (keyHistory['pressed'][action.map] === time) {
    mode.map = !mode.map
    inputDOM.map.checked = !inputDOM.map.checked
  }
}
const collisionDetect = () => {
  if (player.action === 'slide') {
    if (player.direction === 'left') hitbox.x = player.x - size * 2.5
    else hitbox.x = player.x - size / 2
    hitbox.y = player.y - size
    hitbox.w = size * 3
    hitbox.h = size
  } else {
    hitbox.x = player.x - size / 2
    hitbox.y = player.y - size * 3
    hitbox.w = size
    hitbox.h = size * 3
  }
  let aerialFlag = true
  field.forEach(obj => {
    if (
      hitbox.x <= obj.x + obj.w && obj.x <= hitbox.x + hitbox.w &&
      hitbox.y <= obj.y + obj.h && obj.y <= hitbox.y + hitbox.h
    ) {
      if (
        hitbox.x + hitbox.w * .2 <= obj.x + obj.w && obj.x <= hitbox.x + hitbox.w * .8
      ) {
        if (hitbox.y + hitbox.h * .1 <= obj.y + obj.h && obj.y < hitbox.y + hitbox.h * .5) {
          player.y += hitbox.h * .1
          player.dy = 0
          player.state = 'aerial'
        } else if (hitbox.y + hitbox.h * .5 < obj.y + obj.h && obj.y <= hitbox.y + hitbox.h) {
          player.y = obj.y
          player.dy = 0
          aerialFlag = false
          player.state = 'land'
          jump.flag = false
          jump.double = false
          if (
            player.action !== 'run' &&
            player.action !== 'crouch' &&
            player.action !== 'walk' &&
            player.action !== 'turn' &&
            player.action !== 'slide'
          ) player.action = 'idle'
        }
      }
      if (
        hitbox.y + hitbox.h * .2 <= obj.y + obj.h && obj.y <= hitbox.y + hitbox.h * .8
      ) {
        player.dx = -player.dx / 3
        if (hitbox.x <= obj.x + obj.w && obj.x < hitbox.x + hitbox.w * .2) {
          player.x += hitbox.w / 4
        } else if (hitbox.x + hitbox.w * .8 < obj.x + obj.w && obj.x <= hitbox.x + hitbox.w) {
          player.x -= hitbox.w / 4
        }
      }
    }
  })
  if (aerialFlag) player.state = 'aerial'
}
const draw = () => {
  const stageOffset = {x: 0, y: 0}
  const ratio = {x: canvas.offsetWidth / 3, y: canvas.offsetHeight / 3}
  stageOffset.x = player.x < ratio.x ? 0
  : stage.width - ratio.x < player.x ? stage.width - canvas.offsetWidth
  : ((player.x - ratio.x) / (stage.width - ratio.x * 2)) * (stage.width - canvas.offsetWidth)
  stageOffset.y = player.y < ratio.y ? 0
  : stage.height - ratio.y < player.y ? stage.height - canvas.offsetHeight
  : ((player.y - ratio.y) / (stage.height - ratio.y * 2)) * (stage.height - canvas.offsetHeight)
  const drawGround = () => {
    context.fillStyle = 'hsl(180, 100%, 50%)'
    field.forEach(obj => context.fillRect((obj.x - stageOffset.x)|0, (obj.y - stageOffset.y)|0, obj.w|0, obj.h|0))
  }
  drawGround()
  const imageOffset = {x: 24, y: 53}
  let i
  if (player.action === 'idle') i = imageStat.idle.condition // don't nessessary?
  else if (player.action === 'walk') i = imageStat.walk.condition
  else if (player.action === 'turn') i = imageStat.turn.condition
  else if (player.action === 'run') i = imageStat.run.condition
  else if (player.action === 'crouch') i = imageStat.crouch.condition
  else if (player.action === 'jump') {
    const ij = imageStat.jump
    i = (player.dy < -6) ? ij.start
    : (player.dy < -4) ? ij.start + 1
    : (player.dy < -2) ? ij.start + 2
    : (player.dy < -1) ? ij.start + 3
    : (6 < player.dy) ? ij.start + 7
    : (4 < player.dy) ? ij.start + 6
    : (2 < player.dy) ? ij.start + 5
    : (0 < player.dy) ? ij.start + 4
    : ij.start + 8
  } else if (player.action === 'slide') i = imageStat.slide.condition
  const x = (player.x - imageOffset.x - stageOffset.x)|0
  if (player.action === 'slide') drawImage(i, x - size, (player.y - imageOffset.y - stageOffset.y - size * 1.25)|0)
  else drawImage(i, x, (player.y - imageOffset.y - stageOffset.y)|0)
  const displayHitbox = () => {
    context.fillStyle = 'hsl(300, 100%, 50%)'
    context.fillRect(hitbox.x - stageOffset.x, hitbox.y+hitbox.h*.1 - stageOffset.y, hitbox.w, hitbox.h*.7)
    context.fillRect(hitbox.x+hitbox.w*.2 - stageOffset.x, hitbox.y+hitbox.h*.8 - stageOffset.y, hitbox.w*.6, hitbox.h*.2)
  }
    if (mode.hitbox) displayHitbox()
  const displayDebug = () => {
    context.fillStyle = 'hsl(120, 100%, 50%)'
    context.font = `${size}px sans-serif`
    context.fillText(`stamina: ${imageStat.idle.breathInterval}`, size * 2, size)
    context.fillText('cooltime', size * 10, size )
    context.fillText(`jump : ${jump.cooltime}`, size * 16, size)
    context.fillText(`step : ${cooltime.step}`, size * 16, size * 3)
    context.fillText(`slide: ${cooltime.slide}`, size * 16, size * 5)
  }
  if (mode.debug) displayDebug()
  const displayMap = () => {
    const multiple = 2
    const mapOffset = {x: canvas.offsetWidth - size - multiple * stage.width / size, y: size}
    context.strokeStyle = 'hsla(0, 100%, 100%, .5)'
    context.strokeRect(
      mapOffset.x|0, mapOffset.y|0,
      multiple * stage.width / size, multiple * stage.height / size)|0
    context.fillStyle = 'hsla(10, 100%, 50%, .5)'
    const playerSize = {x: 1, y: 2}
    context.fillRect(
      mapOffset.x + multiple * player.x / size|0,
      mapOffset.y + multiple * (player.y / size - playerSize.y)|0,
      multiple * playerSize.x, multiple * playerSize.y
    )
    context.fillStyle = 'hsla(90, 100%, 50%, .5)'
    field.forEach(obj => context.fillRect(
      mapOffset.x + multiple * obj.x/size|0, mapOffset.y + multiple * obj.y/size|0,
      multiple * obj.w/size|0, multiple * obj.h/size|0)
    )
  }
  if (mode.map) displayMap()
}
const main = () => {
  time += 1
  // internal process
  input()
  stateUpdate()
  collisionDetect()
  context.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
  draw()
  window.requestAnimationFrame(main)
}