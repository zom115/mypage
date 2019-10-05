'use strict'
document.getElementsByTagName`audio`[0].volume = .1
const canvas = document.getElementById`canvas`
const context = canvas.getContext`2d`
const imageChangeList = [0, 12, 18, 20, 28, 31, 40, 41]
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
  }, push: {start: imageChangeList[7], length: 1, condition: imageChangeList[7]
}}
const imagePathList = [
  'images/Misaki/Misaki_Idle_1.png', // 0
  'images/Misaki/Misaki_Idle_1_Blink_1.png',
  'images/Misaki/Misaki_Idle_1_Blink_2.png',
  'images/Misaki/Misaki_Idle_2.png',
  'images/Misaki/Misaki_Idle_2_Blink_1.png',
  'images/Misaki/Misaki_Idle_2_Blink_2.png',
  'images/Misaki/Misaki_Idle_3.png',
  'images/Misaki/Misaki_Idle_3_Blink_1.png',
  'images/Misaki/Misaki_Idle_3_Blink_2.png',
  'images/Misaki/Misaki_Idle_4.png',
  'images/Misaki/Misaki_Idle_4_Blink_1.png',
  'images/Misaki/Misaki_Idle_4_Blink_2.png',
  'images/Misaki/Misaki_Walk_1.png', // 12
  'images/Misaki/Misaki_Walk_2.png',
  'images/Misaki/Misaki_Walk_3.png',
  'images/Misaki/Misaki_Walk_4.png',
  'images/Misaki/Misaki_Walk_5.png',
  'images/Misaki/Misaki_Walk_6.png',
  'images/Misaki/Misaki_Turn_3.png', // 18
  'images/Misaki/Misaki_Turn_2.png',
  'images/Misaki/Misaki_Run_1.png', // 20
  'images/Misaki/Misaki_Run_2.png',
  'images/Misaki/Misaki_Run_3.png',
  'images/Misaki/Misaki_Run_4.png',
  'images/Misaki/Misaki_Run_5.png',
  'images/Misaki/Misaki_Run_6.png',
  'images/Misaki/Misaki_Run_7.png',
  'images/Misaki/Misaki_Run_8.png',
  'images/Misaki/Misaki_Crouch_1.png', // 28
  'images/Misaki/Misaki_Crouch_2.png',
  'images/Misaki/Misaki_Crouch_3.png',
  'images/Misaki/Misaki_Jump_up_1.png', // 31
  'images/Misaki/Misaki_Jump_up_2.png',
  'images/Misaki/Misaki_Jump_up_3.png',
  'images/Misaki/Misaki_Jump_MidAir_1.png',
  'images/Misaki/Misaki_Jump_MidAir_2.png',
  'images/Misaki/Misaki_Jump_MidAir_3.png',
  'images/Misaki/Misaki_Jump_Fall_1.png',
  'images/Misaki/Misaki_Jump_Fall_2.png',
  'images/Misaki/Misaki_Jump_Fall_3.png',
  'images/Misaki/Misaki_Slide_1.png',
  'images/Misaki/Misaki_Push_1.png'
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
const voiceStat = {jump: 0, doubleJump: 1, breath: 2, win: 3}
const voicePathList = [
  'audio/Misaki/V2001.wav',
  'audio/Misaki/V2002.wav',
  'audio/Misaki/V2005.wav',
  'audio/Misaki/V2024.wav'
]
let voiceLoadedList = []
let voiceLoadedMap = []
voicePathList.forEach(path => {
  const voicePreload = new Audio()
  voicePreload.src = path
  voicePreload.volume = .1
  voicePreload.addEventListener('canplaythrough', () => {
    voiceLoadedList.push(path)
    voiceLoadedMap[path] = voicePreload
  })
})
const musicStat = {music: 0}
const musicPathList = [
  'audio/music/nc109026.wav'
]
let musicLoadedList = []
let musicLoadedMap = []
musicPathList.forEach(path => {
  const musicPreload = new Audio()
  musicPreload.src = path
  musicPreload.volume = .02
  musicPreload.loop = true
  musicPreload.addEventListener('canplaythrough', () => {
    musicLoadedList.push(path)
    musicLoadedMap[path] = musicPreload
  })
})
const timerId = setInterval(() => { // loading monitoring
  if (
    imageLoadedList.length === imagePathList.length &&
    voiceLoadedList.length === voicePathList.length &&
    musicLoadedList.length === musicPathList.length
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
  voiceLoadedMap[voicePathList[value]].currentTime = startTime
  voiceLoadedMap[voicePathList[value]].play()
}
const size = 16
let stage = {width: size * 240, height: size * 80}
let player = {
  x: stage.width * 1 / 8, y: stage.height * 7 / 8,
  dx: 0, dy: 0, action: 'idle', direction: 'right', wallFlag: false, state: 'aerial'
}
let hitbox = {
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
setGround(1, 0, stage.width / size - 1, 1)
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
setGround(58, 18, 3, 3)
setGround(52, 26, 3, 3)
setGround(14, 18, 1, 2)
setGround(15, 22, 1, 7)
setGround(37, 14, 2, 9)
setGround(37, 11, 8, 1)
setGround(50, 47, 1, 9)
setGround(55, 40, 1, 10)
setGround(56, 40, 7, 1)
setGround(63, 30, 1, 11)
for (let i = 0; i < 40; i++) setGround(150 + i * 2, 78, 1, 1)
for (let i = 0; i < 40; i++) setGround(64 + i * 2, 50, 1, 1)
let interval = 150
for (let i = 12 ; 0 < i; i--) {
  setGround(interval, 50, 1, 25)
  interval += i
}
for (let i = 3; i < 10; i++) setGround(100 + i * 5, 69 - i, 1, 10)
setGround(11, 48, 39, 1)
setGround(16, 49, 1, 23)
setGround(23, 56, 1, 20)
setGround(29, 49, 1, 8)
setGround(29, 57, 6, 6)
setGround(41, 53, 1, 14)
setGround(50, 65, 10, 1)
setGround(50, 76, 6, 1)
setGround(55, 56, 1, 5)
setGround(60, 53, 1, 10)
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
  space: 'space',
  up: 'w', right: 'd', down: 's', left: 'a', jump: 'k', dash: 'j',
  map: 'm', debug: 'g', hitbox: 'h'
}
let key = {
  shiftFlag: false, shift: 0,
  spaceFlag: false, space: 0,
  aFlag: false, a: 0,
  bFlag: false, b: 0,
  cFlag: false, c: 0,
  dFlag: false, d: 0,
  eFlag: false, e: 0,
  fFlag: false, f: 0,
  gFlag: false, g: 0,
  hFlag: false, h: 0,
  iFlag: false, i: 0,
  jFlag: false, j: 0,
  kFlag: false, k: 0,
  lFlag: false, l: 0,
  mFlag: false, m: 0,
  nFlag: false, n: 0,
  oFlag: false, o: 0,
  pFlag: false, p: 0,
  qFlag: false, q: 0,
  rFlag: false, r: 0,
  sFlag: false, s: 0,
  tFlag: false, t: 0,
  uFlag: false, u: 0,
  vFlag: false, v: 0,
  wFlag: false, w: 0,
  xFlag: false, x: 0,
  yFlag: false, y: 0,
  zFlag: false, z: 0
}
document.addEventListener('keydown', e => {
  if (e.keyCode === 16) key.shiftFlag = true
  if (key.shiftFlag) key.shift = (key.shift+1)|0
  if (e.keyCode === 32) {
    key.spaceFlag = true
    if (e.preventDefault) e.preventDefault()
    else {
      e.keyCode = 0
      return false
    }
  }
  if (e.keyCode === 65) key.aFlag = true
  if (e.keyCode === 66) key.bFlag = true
  if (e.keyCode === 67) key.cFlag = true
  if (e.keyCode === 68) key.dFlag = true
  if (e.keyCode === 69) key.eFlag = true
  if (e.keyCode === 70) key.fFlag = true
  if (e.keyCode === 71) key.gFlag = true
  if (e.keyCode === 72) key.hFlag = true
  if (e.keyCode === 73) key.iFlag = true
  if (e.keyCode === 74) key.jFlag = true
  if (e.keyCode === 75) key.kFlag = true
  if (e.keyCode === 76) key.lFlag = true
  if (e.keyCode === 77) key.mFlag = true
  if (e.keyCode === 78) key.nFlag = true
  if (e.keyCode === 79) key.oFlag = true
  if (e.keyCode === 80) key.pFlag = true
  if (e.keyCode === 81) key.qFlag = true
  if (e.keyCode === 82) key.rFlag = true
  if (e.keyCode === 83) key.sFlag = true
  if (e.keyCode === 84) key.tFlag = true
  if (e.keyCode === 85) key.uFlag = true
  if (e.keyCode === 86) key.vFlag = true
  if (e.keyCode === 87) key.wFlag = true
  if (e.keyCode === 88) key.xFlag = true
  if (e.keyCode === 89) key.yFlag = true
  if (e.keyCode === 90) key.zFlag = true
}, false)
document.addEventListener('keyup', e => {
  if (e.keyCode === 16) key.shiftFlag = false, key.shift = 0
  if (e.keyCode === 32) key.spaceFlag = false, key.space = 0
  if (e.keyCode === 65) key.aFlag = false, key.a = 0
  if (e.keyCode === 66) key.bFlag = false, key.b = 0
  if (e.keyCode === 67) key.cFlag = false, key.c = 0
  if (e.keyCode === 68) key.dFlag = false, key.d = 0
  if (e.keyCode === 69) key.eFlag = false, key.e = 0
  if (e.keyCode === 70) key.fFlag = false, key.f = 0
  if (e.keyCode === 71) key.gFlag = false, key.g = 0
  if (e.keyCode === 72) key.hFlag = false, key.h = 0
  if (e.keyCode === 73) key.iFlag = false, key.i = 0
  if (e.keyCode === 74) key.jFlag = false, key.j = 0
  if (e.keyCode === 75) key.kFlag = false, key.k = 0
  if (e.keyCode === 76) key.lFlag = false, key.l = 0
  if (e.keyCode === 77) key.mFlag = false, key.m = 0
  if (e.keyCode === 78) key.nFlag = false, key.n = 0
  if (e.keyCode === 79) key.oFlag = false, key.o = 0
  if (e.keyCode === 80) key.pFlag = false, key.p = 0
  if (e.keyCode === 81) key.qFlag = false, key.q = 0
  if (e.keyCode === 82) key.rFlag = false, key.r = 0
  if (e.keyCode === 83) key.sFlag = false, key.s = 0
  if (e.keyCode === 84) key.tFlag = false, key.t = 0
  if (e.keyCode === 85) key.uFlag = false, key.u = 0
  if (e.keyCode === 86) key.vFlag = false, key.v = 0
  if (e.keyCode === 87) key.wFlag = false, key.w = 0
  if (e.keyCode === 88) key.xFlag = false, key.x = 0
  if (e.keyCode === 89) key.yFlag = false, key.y = 0
  if (e.keyCode === 90) key.zFlag = false, key.z = 0
}, false)
const inputProcess = () => {
  if (key.shiftFlag) key.shift = (key.shift+1)|0
  if (key.spaceFlag) key.space = (key.space+1)|0
  if (key.aFlag) key.a = (key.a+1)|0
  if (key.bFlag) key.b = (key.b+1)|0
  if (key.cFlag) key.c = (key.c+1)|0
  if (key.dFlag) key.d = (key.d+1)|0
  if (key.eFlag) key.e = (key.e+1)|0
  if (key.fFlag) key.f = (key.f+1)|0
  if (key.gFlag) key.g = (key.g+1)|0
  if (key.hFlag) key.h = (key.h+1)|0
  if (key.iFlag) key.i = (key.i+1)|0
  if (key.jFlag) key.j = (key.j+1)|0
  if (key.kFlag) key.k = (key.k+1)|0
  if (key.lFlag) key.l = (key.l+1)|0
  if (key.mFlag) key.m = (key.m+1)|0
  if (key.nFlag) key.n = (key.n+1)|0
  if (key.oFlag) key.o = (key.o+1)|0
  if (key.pFlag) key.p = (key.p+1)|0
  if (key.qFlag) key.q = (key.q+1)|0
  if (key.rFlag) key.r = (key.r+1)|0
  if (key.sFlag) key.s = (key.s+1)|0
  if (key.tFlag) key.t = (key.t+1)|0
  if (key.uFlag) key.u = (key.u+1)|0
  if (key.vFlag) key.v = (key.v+1)|0
  if (key.wFlag) key.w = (key.w+1)|0
  if (key.xFlag) key.x = (key.x+1)|0
  if (key.yFlag) key.y = (key.y+1)|0
  if (key.zFlag) key.z = (key.z+1)|0
}
let keyHistory = {pressed: {}, released: {}}
Object.values(action).forEach(act => {
  keyHistory.pressed[act] = -1
  keyHistory.released[act] = 0
})
let mode = {wallkick: false, DECO: false, debug: false, hitbox: false, map: false}
const inputDOM = document.getElementsByTagName`input`
document.getElementById`voiceInput`.addEventListener('input', e => {
  voicePathList.forEach(path => voiceLoadedMap[path].volume = e.target.value)
  document.getElementById`voiceOutput`.value = e.target.value
})
document.getElementById`musicInput`.addEventListener('input', e => {
  musicPathList.forEach(path => musicLoadedMap[path].volume = e.target.value)
  document.getElementById`musicOutput`.value = e.target.value
})
const wallkick = document.getElementsByTagName`form`[0]
const changeWallkick = () => {
  let buffer
  wallkick.wallkick.forEach(e => {
    if (e.checked === true) {
      buffer = e.value
      e.checked = false
    }
  })
  wallkick.wallkick.forEach(e => {
    if (buffer !== e.value) e.checked = true
  })
  mode.wallkick = JSON.parse(wallkick.wallkick.value)
}
wallkick.addEventListener('change', e => mode.wallkick = JSON.parse(e.target.value), false)
inputDOM.DECO.addEventListener('change', () => mode.DECO = !mode.DECO, false)
inputDOM.debug.addEventListener('change', () => mode.debug = !mode.debug, false)
inputDOM.hitbox.addEventListener('change', () => mode.hitbox = !mode.hitbox, false)
inputDOM.map.addEventListener('change', () => mode.map = !mode.map, false)
const input = () => {
  inputProcess()
  // warp
  // if (size * 53 < player.x) {
  //   player.x = 50
  //   audioLoadedMap[audioPathList[audioStat.win]].currentTime = 0
  //   audioLoadedMap[audioPathList[audioStat.win]].play()
  // }
  // walk
  const speed = (key[action.dash]) ? dashSpeed : walkSpeed
  if (player.action !== 'jump') {
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
      time - keyHistory.pressed[action.left] < cooltime.stepLimit &&
      0 < keyHistory.released[action.left] - keyHistory.pressed[action.left] &&
      keyHistory.released[action.left] - keyHistory.pressed[action.left] < cooltime.stepLimit
    ) {
      player.dx -= 4
      stepFlag = true
    }
    if (
      key[action.right] &&
      time - keyHistory.pressed[action.right] < cooltime.stepLimit &&
      0 < keyHistory.released[action.right] - keyHistory.pressed[action.right] &&
      keyHistory.released[action.right] - keyHistory.pressed[action.right] < cooltime.stepLimit
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
  if (key[action.jump] || key[action.space]) {
    if (jump.flag) {
      if (!jump.double && jump.time === 0 && !player.wallFlag) {
        player.dy = -jumpConstant
        jump.double = true
        playAudio(voiceStat.doubleJump)
        if (5 < imageStat.idle.breathInterval) imageStat.idle.breathInterval -= 1
        jump.time = 0
      }
    } else if (jump.cooltime === 0) {
      player.dy = -jumpConstant
      player.action = 'jump'
      jump.flag = true
      if (player.state === 'aerial' && !player.wallFlag) {
        jump.double = true
        playAudio(voiceStat.doubleJump)
      } else {
        if (player.dx < -3.5 || 3.5 < player.dx) player.dx *= .7
        playAudio(voiceStat.jump)
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
  // wall kick
  if (player.wallFlag && 0 < player.dy) {
    if (key[action.dash]) player.dy *= .5
    let flag = false
    if (mode.wallkick) {
      if (key[action.jump] === 1 && key[action.dash] && player.direction === 'right') {
        player.dx -= 4
        player.direction = 'left'
        flag = true
      } else if (key[action.jump] === 1 && key[action.dash] && player.direction === 'left') {
        player.dx += 4
        player.direction = 'right'
        flag = true
      }
    } else {
      if (key[action.left] && key[action.dash] && player.direction === 'right') {
        player.dx -= 4
        player.direction = 'left'
        flag = true
      } else if (key[action.right] && key[action.dash] && player.direction === 'left') {
        player.dx += 4
        player.direction = 'right'
        flag = true
      }
    }
    if (flag) {
      player.dy = -jumpConstant
      player.wallFlag = false
      jump.flag = true
      player.action = 'jump'
    }
  }
  if (key[action.up] === 1) {
    changeWallkick()
  }
  if (key.e === 1) {
    mode.DECO = !mode.DECO
    inputDOM.DECO.checked = !inputDOM.DECO.checked
  }
  if (key[action.debug] === 1) {
    mode.debug = !mode.debug
    inputDOM.debug.checked = !inputDOM.debug.checked
  }
  if (key[action.hitbox] === 1) {
    mode.hitbox = !mode.hitbox
    inputDOM.hitbox.checked = !inputDOM.hitbox.checked
  }
  if (key[action.map] === 1) {
    mode.map = !mode.map
    inputDOM.map.checked = !inputDOM.map.checked
  }
}
const modelUpdate = () => {
  if (-.01 < player.dx && player.dx < .01) player.dx = 0
  player.y += player.dy
  player.dy += gravityConstant
  if (size * 2.5 < player.dy) player.dy = size * 2.5 // terminal speed
  Object.values(action).forEach(act => {
    if (key[act]) {
      if (keyHistory.pressed[act] < keyHistory.released[act]) {
        keyHistory.pressed[act] = time
      }
    }
    else {
      if (keyHistory.released[act] < keyHistory.pressed[act]) {
        keyHistory.released[act] = time
      }
    }
  })
}
const collisionDetect = () => {
  let check = {x: false, y: false}
  if (player.action === 'slide') {
    hitbox.x = player.x - size * 1.5
    hitbox.y = player.y - size
    hitbox.w = size * 3
    hitbox.h = size
  } else {
    hitbox.x = player.x - size / 2
    hitbox.y = player.y - size * 3
    hitbox.w = size
    hitbox.h = size * 3
  }
  if (player.wallFlag) player.wallFlag = false
  field.forEach(obj => {
    if (
      hitbox.x <= obj.x + obj.w && obj.x <= hitbox.x + hitbox.w &&
      hitbox.y <= obj.y + obj.h && obj.y <= hitbox.y + hitbox.h
    ) {
      if (
        hitbox.y + hitbox.h * .2 < obj.y + obj.h && obj.y < hitbox.y + hitbox.h * .8
      ) {
        check.x = true
        // left
        if (hitbox.x <= obj.x + obj.w && obj.x <= hitbox.x + hitbox.w * .2) {
          player.wallFlag = true
          if (0 < player.dx) player.x += player.dx
          player.direction = 'left'
        }
        // right
        if (hitbox.x + hitbox.w * .8 <= obj.x + obj.w && obj.x <= hitbox.x + hitbox.w) {
          player.wallFlag = true
          if (player.dx < 0) player.x += player.dx
          player.direction = 'right'
        }
      }
      if (
        hitbox.x + hitbox.w * .2 <= obj.x + obj.w && obj.x <= hitbox.x + hitbox.w * .8
      ) {
        check.y = true
        // head
        if (
          hitbox.y + hitbox.h * .1 <= obj.y + obj.h && obj.y < hitbox.y + hitbox.h * .5 &&
          !player.wallFlag
        ) {
          player.y += hitbox.h * .1
          player.dy = 0
        // foot
        } else if (hitbox.y + hitbox.h * .5 < obj.y + obj.h && obj.y <= hitbox.y + hitbox.h) {
          if (!player.wallFlag) {
            player.y = obj.y
            player.dy = 0
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
      }
    }
  })
  if (0 < player.dy) {
    player.state = 'aerial'
    jump.flag = true
    jump.cooltime = 10
  }
  if (player.wallFlag) {
    if (0 <= player.dy) player.dx = 0
  }
  else {
    player.x += player.dx
    if (player.state === 'land') player.dx *= brakeConstant
  }
}
const viewUpdate = () => {
  if (player.action !== 'jump') {
    if (key[action.right] && player.dx < walkSpeed * brakeConstant) player.action = 'turn'
    if (key[action.left] && -walkSpeed * brakeConstant < player.dx) player.action = 'turn'
    if (player.wallFlag && player.state !== 'aerial') player.action = 'push'
    if (key[action.left] && key[action.right]) player.action = 'idle'
  }
  player.direction = ((key[action.left] && key[action.right]) || player.wallFlag) ? player.direction
  : (key[action.left]) ? 'left'
  : (key[action.right]) ? 'right'
  : (player.dx < 0) ? 'left'
  : (0 < player.dx) ? 'right'
  : player.direction
  if (player.action !== 'jump') {
    player.action = (player.action === 'turn') ? 'turn'
    : (player.action === 'push') ? 'push'
    : (-.2 < player.dx && player.dx < .2) ? 'idle'
    : (-1.4 < player.dx && player.dx < 1.4) ? 'walk'
    : (player.action === 'slide' && (player.dx < -3.5 || 3.5 < player.dx)) ? 'slide' : 'run'
  }
  if (player.action === 'idle') {
    const i = imageStat.idle
    i.time += 1
    // breath
    if (
      (i.start <= i.condition && i.condition < i.start + i.length / 4 &&
      i.time % ~~(i.breathInterval) === 0) ||
      (i.start + i.length / 4 <= i.condition && i.condition < i.start + i.length *.5 &&
      i.time % ~~(i.breathInterval*.5) === 0) ||
      (i.start + i.length * .5 <= i.condition && i.condition < i.start + i.length * 3 / 4 &&
      i.time % ~~(i.breathInterval*2) === 0) ||
      (i.start + i.length * 3 / 4 <= i.condition && i.condition < i.start + i.length &&
      i.time % ~~(i.breathInterval*.5) === 0)
    ) {
      i.condition += 3
      i.time = 0
    }
    if (i.length <= i.condition && i.condition <= i.length + 3) {
      i.condition -= i.length
      if (i.breathInterval < i.maxBreath) {
        i.breathInterval += 1
        if (i.breathInterval < 25) {
          const num = Math.random()
          const list = num < .9 ? {value: voiceStat.breath, startTime: .3}
          : num < .95 ? {value: voiceStat.jump, startTime: .3}
          : {value: voiceStat.doubleJump, startTime: .33}
          playAudio(list.value, list.startTime)
        }
      }
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
      if (!(player.wallFlag && key[action.left] && key[action.right])) player.action = 'walk'
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
  const imageOffset = {x: 64, y: 125}
  let i
  if (player.action === 'slide') i = imageStat.slide.condition
  if (player.action === 'push') i = imageStat.push.condition
  else if (player.action === 'jump' || player.state === 'aerial') {
    const ij = imageStat.jump
    i = (6 < player.dy) ? ij.start + 7
    : (4 < player.dy) ? ij.start + 6
    : (2 < player.dy) ? ij.start + 5
    : (0 < player.dy) ? ij.start + 4
    : (-1 < player.dy) ? ij.start + 3
    : (-2 < player.dy) ? ij.start + 2
    : (-4 < player.dy) ? ij.start + 1
    : (-6 < player.dy) ? ij.start
    : ij.start + 8
  } else if (player.action === 'idle') i = imageStat.idle.condition // is nessessary?
  else if (player.action === 'walk') i = imageStat.walk.condition
  else if (player.action === 'turn') i = imageStat.turn.condition
  else if (player.action === 'run') i = imageStat.run.condition
  else if (player.action === 'crouch') i = imageStat.crouch.condition
  const x = (player.x - imageOffset.x - stageOffset.x)|0
  drawImage(i, x, (player.y - imageOffset.y - stageOffset.y)|0)
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
    context.fillStyle = 'hsla(0, 0%, 0%, .25)'
    context.fillRect(
      mapOffset.x|0, mapOffset.y|0,
      multiple * stage.width / size|0, multiple * stage.height / size|0)
    context.fillStyle = 'hsla(10, 100%, 50%, .5)'
    const playerSize = {x: 1, y: 2}
    context.fillRect(
      mapOffset.x + multiple * player.x / size|0,
      mapOffset.y + multiple * (player.y / size - playerSize.y)|0,
      multiple * playerSize.x|0, multiple * playerSize.y|0
    )
    context.fillStyle = 'hsla(90, 100%, 50%, .5)'
    field.forEach(obj => context.fillRect(
      mapOffset.x + multiple * obj.x/size|0, mapOffset.y + multiple * obj.y/size|0,
      multiple * obj.w/size|0, multiple * obj.h/size|0)
    )
  }
  if (mode.map) displayMap()
}
let playFlag = false
const musicProcess = () => {
  if (!playFlag && Object.values(key).some(value => {return value === true})) {
    playFlag = true
    musicLoadedMap[musicPathList[0]].play()
  }
}
const main = () => {
  time += 1
  // internal process
  input()
  modelUpdate()
  collisionDetect()
  viewUpdate()
  context.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
  draw()
  musicProcess()
  window.requestAnimationFrame(main)
}