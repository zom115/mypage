'use strict'
document.getElementsByTagName`audio`[0].volume = .1
const canvas = document.getElementById`canvas`
const context = canvas.getContext`2d`
const evlt = (obj) => {return Function('return (' + obj + ')')()}
const setStorage = (key, value, firstFlag = false) => {
  const exists = localStorage.getItem(key)
  if (firstFlag && exists) return JSON.parse(exists)
  localStorage.setItem(key, value)
  return value
}
let settings = { // initial value
  volume: {
    master: setStorage('master', .5, true),
    voice: setStorage('voice', .1, true),
    music: setStorage('music', .02, true)
  },
  type: {
    DECO: setStorage('DECO', false, true),
    status: setStorage('status', false, true),
    hitbox: setStorage('hitbox', false, true),
    map: setStorage('map', false, true),
  }
}
Object.keys(settings.volume).forEach(v => {
  document.getElementById(`${v}Input`).value = settings.volume[v]
  document.getElementById(`${v}Output`).value = settings.volume[v] * 100|0
  document.getElementById(`${v}Input`).addEventListener('input', e => {
    document.getElementById(`${v}Output`).value = e.target.value * 100|0
    settings.volume[v] = setStorage(v, e.target.value, false)
    if (v === 'master' || v === 'voice') voicePathList.forEach(path => {
      voiceLoadedMap[path].volume = settings.volume.master * settings.volume.voice
    })
    if (v === 'master' || v === 'music') musicPathList.forEach(path => {
      musicLoadedMap[path].volume = settings.volume.master * settings.volume.music
    })
  })
})
const inputDOM = document.getElementsByTagName`input`
Object.keys(settings.type).forEach(v => {
  inputDOM[v].checked = settings.type[v]
  inputDOM[v].addEventListener('change', () => {
    settings.type[v] = setStorage(v, inputDOM[v].checked, false)
  }, false)
})
const imageChangeList = [0, 12, 18, 20, 28, 31, 40, 41, 42, 44]
const imageStat = {
  idle: {
    start: imageChangeList[0], length: 12, condition: imageChangeList[0],
    time: 0, maxInterval: 30, frame: 5,
    blinkTime: 3, breathInterval: 45, minBreath: 15, midBreath: 45 ,maxBreath: 75
  }, walk: {
    start: imageChangeList[1], length: 6, condition: imageChangeList[1],
    time: 0, maxInterval: 0, frame: 10
  }, turn: {
    start: imageChangeList[2], length: 2, condition: imageChangeList[2],
    time: 0, maxInterval: 0, frame: 7
  }, run: {
    start: imageChangeList[3], length: 8, condition: imageChangeList[3],
    time: 1, maxInterval: 0, frame: 7
  }, crouch: {
    start: imageChangeList[4], length: 3, condition: imageChangeList[4],
    time: 1, maxInterval: 0, frame: 7
  }, jump: {start: imageChangeList[5], length: 9},
  slide: {start: imageChangeList[6], length: 1, condition: imageChangeList[6]},
  push: {start: imageChangeList[7], length: 1, condition: imageChangeList[7]},
  punch: {
    start: imageChangeList[8], length: 2, condition: imageChangeList[8],
    time: 0, frame: 7, playAudio: imageChangeList[8] + 1
  }, kick: {
    start: imageChangeList[9], length: 6, condition: imageChangeList[9],
    time: 0, frame: 7, playAudio: imageChangeList[9] + 3
  }
}
const unityChanList = [50, 54, 60]
const unityChanStat = {
  idle: {start: unityChanList[0], length: 4},
  walk: {start: unityChanList[1], length: 6, frame: 10},
  damage: {start: unityChanList[2], length: 18, frame: 5}
}
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
  'images/Misaki/Misaki_Slide_1.png', // 40
  'images/Misaki/Misaki_Push_1.png', // 41
  'images/Misaki/Misaki_Punch_1.png', // 42
  'images/Misaki/Misaki_Punch_2.png',
  'images/Misaki/Misaki_Kick_1.png', // 44
  'images/Misaki/Misaki_Kick_2.png',
  'images/Misaki/Misaki_Kick_3.png',
  'images/Misaki/Misaki_Kick_4.png',
  'images/Misaki/Misaki_Kick_5.png',
  'images/Misaki/Misaki_Kick_6.png',
  'images/Unitychan/BasicActions/Unitychan_Idle_1.png', // 50
  'images/Unitychan/BasicActions/Unitychan_Idle_2.png',
  'images/Unitychan/BasicActions/Unitychan_Idle_3.png',
  'images/Unitychan/BasicActions/Unitychan_Idle_4.png',
  'images/Unitychan/BasicActions/Unitychan_Walk_1.png', // 54
  'images/Unitychan/BasicActions/Unitychan_Walk_2.png',
  'images/Unitychan/BasicActions/Unitychan_Walk_3.png',
  'images/Unitychan/BasicActions/Unitychan_Walk_4.png',
  'images/Unitychan/BasicActions/Unitychan_Walk_5.png',
  'images/Unitychan/BasicActions/Unitychan_Walk_6.png',
  'images/Unitychan/BasicActions/Unitychan_Damage_2.png', // 60
  'images/Unitychan/BasicActions/Unitychan_Damage_3.png',
  'images/Unitychan/BasicActions/Unitychan_Damage_4.png',
  'images/Unitychan/BasicActions/Unitychan_Damage_5.png',
  'images/Unitychan/BasicActions/Unitychan_Damage_6.png',
  'images/Unitychan/BasicActions/Unitychan_Damage_7.png',
  'images/Unitychan/BasicActions/Unitychan_Damage_8.png',
  'images/Unitychan/BasicActions/Unitychan_Damage_9.png',
  'images/Unitychan/BasicActions/Unitychan_Damage_10.png',
  'images/Unitychan/BasicActions/Unitychan_Damage_11.png',
  'images/Unitychan/BasicActions/Unitychan_Damage_12.png',
  'images/Unitychan/BasicActions/Unitychan_Damage_13.png',
  'images/Unitychan/BasicActions/Unitychan_Damage_14.png',
  'images/Unitychan/BasicActions/Unitychan_Damage_15.png',
  'images/Unitychan/BasicActions/Unitychan_Damage_16.png',
  'images/Unitychan/BasicActions/Unitychan_Damage_17.png',
  'images/Unitychan/BasicActions/Unitychan_Damage_18.png',
  'images/Unitychan/BasicActions/Unitychan_Damage_19.png',
  // 78
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
const voiceStat = {jump: 0, doubleJump: 1, punch: 2, kick: 3, win: 4}
const voicePathList = [
  'audio/Misaki/V2001.wav',
  'audio/Misaki/V2002.wav',
  'audio/Misaki/V2005.wav',
  'audio/Misaki/V2006.wav',
  'audio/Misaki/V2024.wav'
]
let voiceLoadedList = []
let voiceLoadedMap = []
voicePathList.forEach(path => {
  const voicePreload = new Audio()
  voicePreload.src = path
  voicePreload.volume = settings.volume.master * settings.volume.voice
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
  musicPreload.volume = settings.volume.master * settings.volume.music
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
    context.drawImage(img, -x - img.width|0, y|0)
  } else context.drawImage(img, x|0, y|0)
  context.restore()
}
const drawEnemy = (v, x, y) => {
  const img = imageLoadedMap[imagePathList[v.image]]
  context.save()
  if (v.direction === 'left') {
    context.scale(-1, 1)
    context.drawImage(img, -x - img.width|0, y|0)
  } else context.drawImage(img, x|0, y|0)
  context.restore()
}
const playAudio = (value, startTime = 0) => {
  voiceLoadedMap[voicePathList[value]].currentTime = startTime
  voiceLoadedMap[voicePathList[value]].play()
}
const size = 16
let stage = {}
let field = []
let stageTime
let gate = []
let stageName
const aftergrowLimit = {
  gate: 240
}
let aftergrow = {
  gate: 0
}
let enemies = []
const setStage = arg => {
  const stageList = {
    Opening: {w: size * 240, h: size * 80},
    DynamicTest: {w: size * 160, h: size * 90}
  }
  stage = stageList[arg]
  field = []
  enemies = []
  const setGround = (x, y, w, h) => {
    field.push({x: x * size, y: y * size, w: w * size, h: h * size})
  }
  setGround(0, stage.h / size - 1, stage.w / size, 1) // frame
  setGround(1, 0, stage.w / size - 1, 1)
  setGround(0, 0, 1, stage.h / size - 1)
  setGround(stage.w / size - 1, 1, 1, stage.h / size - 2)
  if (arg === 'Opening') {
    setGround(7, 16, 9, 1) // object
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
    setGround(55, 40, 1, 9)
    setGround(56, 40, 7, 1)
    setGround(63, 30, 1, 11)
    for (let i = 0; i < 40; i++) setGround(150 + i * 2, 78, 1, 1)
    let interval = 150
    for (let i = 12 ; 0 < i; i--) {
      setGround(interval, 50, 1, 25)
      interval += i
    }
    for (let i = 0; i < 10; i++) setGround(95 + i * 5, 57 + i, 1, 10)
    setGround(80, 65, 1, 10)
    setGround(80, 55, 2, 10)
    setGround(80, 45, 4, 10)
    setGround(80, 35, 7, 10)
    setGround(80, 25, 11, 10)
    setGround(80, 15, 16, 10)
    setGround(80,  5, 22, 10)
    setGround(11, 48, 39, 1)
    setGround(16, 49, 1, 23)
    setGround(23, 56, 1, 20)
    setGround(29, 49, 1, 14)
    setGround(30, 57, 5, 6)
    setGround(41, 53, 1, 14)
    setGround(50, 65, 10, 1)
    setGround(50, 76, 6, 1)
    setGround(55, 56, 1, 5)
    setGround(60, 53, 1, 10)
  } else if (arg === 'DynamicTest') {
    setGround(17, 85, 4, 4)
    setGround(25, 70, 134, 1)
    setGround(30, 69 + 15 / 16, 1,  1 / 16)
    setGround(31, 69 + 14 / 16, 1,  2 / 16)
    setGround(32, 69 + 13 / 16, 1,  3 / 16)
    setGround(33, 69 + 12 / 16, 1,  4 / 16)
    setGround(34, 69 + 11 / 16, 1,  5 / 16)
    setGround(35, 69 + 10 / 16, 1,  6 / 16)
    setGround(36, 69 +  9 / 16, 1,  7 / 16)
    setGround(37, 69 +  8 / 16, 1,  8 / 16)
    setGround(38, 69 +  7 / 16, 1,  9 / 16)
    setGround(39, 69 +  6 / 16, 1, 10 / 16)
    setGround(40, 69 +  5 / 16, 1, 11 / 16)
    setGround(41, 69 +  4 / 16, 1, 12 / 16)
    setGround(42, 69 +  3 / 16, 1, 13 / 16)
    setGround(43, 69 +  2 / 16, 1, 14 / 16)
    setGround(44, 69 +  1 / 16, 1, 15 / 16)
    setGround(45, 69 + 15 / 16, 1 + 15 / 16, 1)
    setGround(45, 69 + 14 / 16, 1 + 14 / 16, 1)
    setGround(45, 69 + 13 / 16, 1 + 13 / 16, 1)
    setGround(45, 69 + 12 / 16, 1 + 12 / 16, 1)
    setGround(45, 69 + 11 / 16, 1 + 11 / 16, 1)
    setGround(45, 69 + 10 / 16, 1 + 10 / 16, 1)
    setGround(45, 69 +  9 / 16, 1 +  9 / 16, 1)
    setGround(45, 69 +  8 / 16, 1 +  8 / 16, 1)
    setGround(45, 69 +  7 / 16, 1 +  7 / 16, 1)
    setGround(45, 69 +  6 / 16, 1 +  6 / 16, 1)
    setGround(45, 69 +  5 / 16, 1 +  5 / 16, 1)
    setGround(45, 69 +  4 / 16, 1 +  4 / 16, 1)
    setGround(45, 69 +  3 / 16, 1 +  3 / 16, 1)
    setGround(45, 69 +  2 / 16, 1 +  2 / 16, 1)
    setGround(45, 69 +  1 / 16, 1 +  1 / 16, 1)
    setGround(50, 69 +  8 / 16, 1, 1 / 2)
    setGround(51, 69          , 1, 1 / 2)
    setGround(52, 68 +  8 / 16, 1, 1 / 2)
    setGround(53, 68          , 1, 1 / 2)
    setGround(54, 67 +  8 / 16, 1, 1 / 2)
    setGround(60             , 69 * 1 + 8 / 16, 1 / 2, 1 / 2)
    setGround(60 +      1 / 2, 69 * 1         , 1 / 2, 1 / 2)
    setGround(60 +          1, 68 * 1 + 8 / 16, 1 / 2, 1 / 2)
    setGround(60 +  1 * 3 / 2, 68 * 1         , 1 / 2, 1 / 2)
    setGround(60 +  1 * 2    , 67 * 1 + 8 / 16, 1 / 2, 1 / 2)
    setGround(60 +  1 * 5 / 2, 67 * 1         , 1 / 2, 1 / 2)
    setGround(60             , 69 * 1 + 8 / 16, 1 / 2, 1 / 2)
    setGround(70     , 69 + 8 / 16, 8, 8)
    setGround(70 +  1 / 16, 69         , 1 / 2, 1 / 2)
    setGround(70 +  2 / 16, 68 + 8 / 16, 1 / 2, 1 / 2)
    setGround(70 +  3 / 16, 68         , 1 / 2, 1 / 2)
    setGround(70 +  4 / 16, 67 + 8 / 16, 1 / 2, 1 / 2)
    setGround(70 +  5 / 16, 67         , 1 / 2, 1 / 2)
    setGround(70 +  6 / 16, 66 + 8 / 16, 1 / 2, 1 / 2)
    setGround(70 +  7 / 16, 66         , 1 / 2, 1 / 2)
    setGround(70 +  8 / 16, 65 + 8 / 16, 1 / 2, 1 / 2)
    setGround(70 +  9 / 16, 65         , 1 / 2, 1 / 2)
    setGround(70 + 10 / 16, 64 + 8 / 16, 1 / 2, 1 / 2)
    setGround(70 + 11 / 16, 64         , 1 / 2, 1 / 2)
    const setObject = (x, y, w, h, dx, dy) => {
      enemies.push({
        type: 'object', x: x * size, y: y * size, w: w * size, h: h * size, dx: dx, dy: dy
      })
    }
    setObject(21, 78, 4, 1, 0, '-7 * size * Math.sin(stageTime / 100)')
    setObject(10, 70, 4, 1, '-7 * size * Math.sin(stageTime / 100)', 0)
    setObject(1, 85, 1, 4, 'stageTime % 1000', 0)
  }
  stageTime = 0
  gate = []
  const setGate = (x, y, w, h, stage, X, Y) => {
    gate.push({
      x: x * size, y: y * size, w: w * size, h: h * size,
      stage: stage, address: {x: X * size, y: Y * size}
    })
  }
  if (arg === 'Opening') {
    setGate(5, 74, 4, 5, 'DynamicTest', 12, 88.5)
  } else if (arg === 'DynamicTest') {
    setGate(5, 84, 4, 5, 'Opening', 12, 78.5)
  }
  stageName = arg
  aftergrow.gate = aftergrowLimit.gate
}
setStage('Opening')
const enterGate = (stage, x, y) => {
  setStage(stage)
  player.x = x
  player.y = y
}
let player = {
  x: stage.w * 1 / 8, y: stage.h * 15 / 16,
  // action: { // TODO: bit operand
  //   idle: true, turn: false, crouch: false, push: false, run: false,
  //   jump: false, step: false, slide: false
  // },
  // direction: {left: false, right: true}
  dx: 0, dy: 0, action: 'idle', direction: 'right', landFlag: false, wallFlag: false,
  grapFlag: false
}
let hitbox = {x: player.x - size / 2, y: player.y - size * 3, w: size, h: size * 3}
let attackBox = {x: NaN, y: NaN, w: NaN, h: NaN}
const walkConstant = .7 // dx := 1.4
const dashConstant = 2.1
const dashThreshold = 3.5
const stepConstant = 4
const slideConstant = 2
const boostConstant = 6
const brakeConstant = .75
const slideBrakeConstant = .95
const gravityConstant = .272
const jumpConstant = 5
let time = 0
let jump = {flag: false, double: false, step: false, time: 0, cooltime: 0, chargeTime: 0}
let cooltime = {
  step: 0, stepLimit: 15, stepDeferment: 15,
  aerialStep: 0, aerialStepLimit: 10,
  slide: 2, slideLimit: 45
}
let action = {
  space: 'space',
  up: 'w', right: 'd', down: 's', left: 'a', jump: 'k', slide: 'j',
  map: 'm', status: 'g', hitbox: 'h'
}
let toggle = {
  DECO: 'e', status: 'g', hitbox: 'h', map: 'm'
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
const input = () => {
  inputProcess()
  // if (size * 53 < player.x) { // warp
  //   player.x = 50
  //   audioLoadedMap[audioPathList[audioStat.win]].currentTime = 0
  //   audioLoadedMap[audioPathList[audioStat.win]].play()
  // }
  if (!(key[action.left] && key[action.right])) { // walk
    let speed = dashConstant // let speed = (key[action.dash]) ? dashConstant : walkConstant
    speed = key[action.left] && -speed < player.dx ? -speed
    : key[action.left] && -dashThreshold < player.dx ? -speed / 4
    : key[action.right] && player.dx < speed ? speed
    : key[action.right] && player.dx < dashThreshold ? speed / 4
    : 0
    speed = player.landFlag ? speed : speed / 3 // aerial brake
    player.dx += speed
  }
  if (!jump.step) { // step
    const stepSpeed = key[action.left] &&
      time - keyHistory.pressed[action.left] < cooltime.stepDeferment &&
      0 < keyHistory.released[action.left] - keyHistory.pressed[action.left]
    ? -stepConstant
    : key[action.right] &&
      time - keyHistory.pressed[action.right] < cooltime.stepDeferment &&
      0 < keyHistory.released[action.right] - keyHistory.pressed[action.right]
    ? stepConstant : 0
    if (stepSpeed !== 0) {
      player.dx += stepSpeed
      jump.step = true
      cooltime.aerialStep = cooltime.aerialStepLimit
    }
  } else if (player.action !== 'jump') jump.step = false
  if (0 < cooltime.aerialStep) {
    player.dy = 0
    cooltime.aerialStep -= 1
  }
  if ( // punch & kick
    key[action.slide] === 1 && !key[action.left] && !key[action.right] &&
    player.landFlag && player.action !== 'slide' && player.action !== 'punch' && player.action !== 'kick'
  ) {
    player.action = 'punch'
    imageStat.punch.time = 0
  }
  if (player.action === 'punch' && key[action.slide] === imageStat.punch.frame) {
    player.action = 'kick'
    imageStat.kick.time = 0
  }
  if (cooltime.slide === 0) { // slide
    if (key[action.slide] && player.landFlag && !player.wallFlag) {
      const slideSpeed = slideConstant < player.dx ? boostConstant
      : player.dx < -slideConstant ? -boostConstant : 0
      if (slideSpeed !== 0) {
        player.dx += slideSpeed
        player.action = 'slide'
        cooltime.slide = cooltime.slideLimit
        if (10 < imageStat.idle.breathInterval) imageStat.idle.breathInterval -= 1
      }
    }
  } else {
    if (player.action !== 'slide') {
      if (!player.landFlag && 1 < cooltime.slide) cooltime.slide -= 2
      else cooltime.slide -= 1
    }
  }
  if (key[action.jump] || key[action.space]) { // jump
    if (jump.flag) {
      if (!jump.double && jump.time === 0 && !player.grapFlag) {
        player.dy = -jumpConstant
        player.action = 'jump'
        jump.double = true
        cooltime.aerialStep = 0
        playAudio(voiceStat.doubleJump)
        if (5 < imageStat.idle.breathInterval) imageStat.idle.breathInterval -= 1
        jump.time = 0
      }
    } else if (jump.cooltime === 0) {
      player.dy = -jumpConstant * (1+Math.abs(player.dx)/20) ** .5
      player.action = 'jump'
      jump.flag = true
      if (!player.landFlag && !player.grapFlag) {
        jump.double = true
        cooltime.aerialStep = 0
        playAudio(voiceStat.doubleJump)
      } else {
        player.dx *= .7
        playAudio(voiceStat.jump)
      }
      if (10 < imageStat.idle.breathInterval) imageStat.idle.breathInterval -= 1
      player.landFlag = false
      jump.cooltime = 10
      jump.time = 0
    }
    jump.time += 1
  } else {
    if (settings.type.DECO) jump.time = 0
    else {
      if (5 < jump.time) {
        if (player.dy < 0) player.dy = 0
        jump.time = 0
      } else if (jump.time !== 0) jump.time += 1
    }
  }
  if (player.wallFlag && 0 < player.dy && key[action.up]) { // wall grap
    player.dy *= .5
    player.dx = player.direction === 'left' ? -dashConstant : dashConstant
    player.grapFlag = true
  } else player.grapFlag = false
  if (player.grapFlag) { // wall kick
    let flag = false
    if ((
      key[action.jump] === 1 || key[action.space] === 1
      ) && player.grapFlag && player.direction === 'right'
    ) {
      player.dx = -4
      player.direction = 'left'
      flag = true
    } else if ((
      key[action.jump] === 1 || key[action.space] === 1
      ) && player.grapFlag && player.direction === 'left'
    ) {
      player.dx = 4
      player.direction = 'right'
      flag = true
    }
    if (flag) {
      player.dy = -jumpConstant
      player.wallFlag = false
      player.grapFlag = false
      jump.flag = true
      player.action = 'jump'
    }
  }
  Object.keys(toggle).forEach(v => {
    if (key[toggle[v]] === 1) {
      settings.type[v] = setStorage(v, !settings.type[v])
      inputDOM[v].checked = !inputDOM[v].checked
    }
  })
}
const modelUpdate = () => {
  if (player.action === 'slide') { // collision detect
    hitbox.x = player.x - size * 1.375
    hitbox.y = player.y - size
    hitbox.w = size * 2.75
    hitbox.h = size
  } else {
    hitbox.x = player.x - size / 2
    hitbox.y = player.y - size * 2.75
    hitbox.w = size
    hitbox.h = size * 2.75
  }
  let aerialFlag = true
  if (player.dx !== 0) player.wallFlag = false
  field.forEach(obj => {
    if (0 < player.dy) { // floor
      const ax = obj.x - hitbox.w / 2
      const ay = obj.y
      const bx = obj.x + obj.w + hitbox.w / 2
      const by = obj.y
      const abx = bx - ax
      const aby = by - ay
      let nx = -aby
      let ny = abx
      let length = (nx ** 2 + ny ** 2) ** .5
      if (0 < length) length = 1 / length
      nx *= length
      ny *= length
      const d = -(ax * nx + ay * ny)
      const t = -(nx * player.x + ny * player.y + d) / (nx * player.dx + ny * player.dy)
      if (0 < t && t <= 1) {
        const cx = player.x + player.dx * t
        const cy = player.y + player.dy * t
        const acx = cx - ax
        const acy = cy - ay
        const bcx = cx - bx
        const bcy = cy - by
        const doc = acx * bcx + acy * bcy
        if (doc < 0) {
          player.y = obj.y - gravityConstant + 1e-12
          player.dy = 0
          aerialFlag = false
        }
      }
    } else if (player.dy !== 0) { // ceiling
      const ax = obj.x - hitbox.w / 2
      const ay = obj.y + obj.h + hitbox.h
      const bx = obj.x + obj.w + hitbox.w / 2
      const by = obj.y + obj.h + hitbox.h
      const abx = bx - ax
      const aby = by - ay
      let nx = -aby
      let ny = abx
      let length = (nx ** 2 + ny ** 2) ** .5
      if (0 < length) length = 1 / length
      nx *= length
      ny *= length
      const d = -(ax * nx + ay * ny)
      const t = -(nx * player.x + ny * player.y + d) / (nx * player.dx + ny * player.dy)
      if (0 < t && t <= 1) {
        const cx = player.x + player.dx * t
        const cy = player.y + player.dy * t
        const acx = cx - ax
        const acy = cy - ay
        const bcx = cx - bx
        const bcy = cy - by
        const doc = acx * bcx + acy * bcy
        if (doc < 0) {
          player.y = obj.y + obj.h + hitbox.h
          player.dy = 0
        }
      }
    }
    if (0 < player.dx) { // left wall
      const ax = obj.x - hitbox.w / 2
      const ay = obj.y
      const bx = obj.x - hitbox.w / 2
      const by = obj.y + obj.h + hitbox.h
      const abx = bx - ax
      const aby = by - ay
      let nx = -aby
      let ny = abx
      let length = (nx ** 2 + ny ** 2) ** .5
      if (0 < length) length = 1 / length
      nx *= length
      ny *= length
      const d = -(ax * nx + ay * ny)
      const t = -(nx * player.x + ny * player.y + d) / (nx * player.dx + ny * player.dy)
      if (0 < t && t <= 1) {
        const cx = player.x + player.dx * t
        const cy = player.y + player.dy * t
        const acx = cx - ax
        const acy = cy - ay
        const bcx = cx - bx
        const bcy = cy - by
        const doc = acx * bcx + acy * bcy
        if (doc < 0) {
          player.x = obj.x - hitbox.w / 2 - 1
          player.dx = 0
          player.wallFlag = true
        }
      }
    } else if (player.dx !== 0) { // right wall
      const ax = obj.x + obj.w + hitbox.w / 2
      const ay = obj.y
      const bx = obj.x + obj.w + hitbox.w / 2
      const by = obj.y + obj.h + hitbox.h
      const abx = bx - ax
      const aby = by - ay
      let nx = -aby
      let ny = abx
      let length = (nx ** 2 + ny ** 2) ** .5
      if (0 < length) length = 1 / length
      nx *= length
      ny *= length
      const d = -(ax * nx + ay * ny)
      const t = -(nx * player.x + ny * player.y + d) / (nx * player.dx + ny * player.dy)
      if (0 < t && t <= 1) {
        const cx = player.x + player.dx * t
        const cy = player.y + player.dy * t
        const acx = cx - ax
        const acy = cy - ay
        const bcx = cx - bx
        const bcy = cy - by
        const doc = acx * bcx + acy * bcy
        if (doc < 0) {
          player.x = obj.x + obj.w + hitbox.w / 2 + 1
          player.dx = 0
          player.wallFlag = true
        }
      }
    }
    if (
      hitbox.x <= obj.x + obj.w && obj.x <= hitbox.x + hitbox.w &&
      hitbox.y <= obj.y + obj.h && obj.y <= hitbox.y + hitbox.h
    ) if (player.state = 'slide') player.dx = 0
  })
  const enemyUpdate = () => {
    stageTime += 1
    if (enemies.length < 1) {
      enemies.push({
        type: 'enemy',
        x: stage.w * 1 / 4, y: stage.h * 15 / 16,
        minXRange: stage.w * 1 / 4, maxXRange: stage.w * 3 / 8,
        direction: 'left', image: unityChanStat.walk.start, imageTimer: 0,
        state: 'walk', life: 3, invincibleTimer: 0
      })
    }
    enemies.forEach((v, i) => {
      if (v.type === 'object') {
        const aftdx = evlt(v.dx)
        const aftdy = evlt(v.dy)
        stageTime -= 1
        const dx = aftdx - evlt(v.dx)
        const dy = aftdy - evlt(v.dy)
        const X = player.dx - dx
        const Y = player.dy - dy
        const axFloor = v.x + evlt(v.dx) - hitbox.w / 2 // y coordinate
        const ayFloor = v.y + evlt(v.dy)
        const bxFloor = v.x + v.w + evlt(v.dx) + hitbox.w / 2
        const byFloor = v.y + evlt(v.dy)
        const abxFloor = bxFloor - axFloor
        const abyFloor = byFloor - ayFloor
        let nxFloor = -abyFloor
        let nyFloor = abxFloor
        let lengthFloor = (nxFloor ** 2 + nyFloor ** 2) ** .5
        if (0 < lengthFloor) lengthFloor = 1 / lengthFloor
        nxFloor *= lengthFloor
        nyFloor *= lengthFloor
        const dFloor = -(axFloor * nxFloor + ayFloor * nyFloor)
        const tFloor = -(
          nxFloor * player.x + nyFloor * player.y + dFloor) / (
          nxFloor * X + nyFloor * Y
        )
        const cxFloor = player.x + X * tFloor
        const cyFloor = player.y + Y * tFloor
        const acxFloor = cxFloor - axFloor
        const acyFloor = cyFloor - ayFloor
        const bcxFloor = cxFloor - bxFloor
        const bcyFloor = cyFloor - byFloor
        const docFloor = acxFloor * bcxFloor + acyFloor * bcyFloor
        const axCeiling = v.x + evlt(v.dx) - hitbox.w / 2
        const ayCeiling = v.y + v.h + evlt(v.dy) + hitbox.h
        const bxCeiling = v.x + v.w + evlt(v.dx) + hitbox.w / 2
        const byCeiling = v.y + v.h + evlt(v.dy) + hitbox.h
        const abxCeiling = bxCeiling - axCeiling
        const abyCeiling = byCeiling - ayCeiling
        let nxCeiling = -abyCeiling
        let nyCeiling = abxCeiling
        let lengthCeiling = (nxCeiling ** 2 + nyCeiling ** 2) ** .5
        if (0 < lengthCeiling) lengthCeiling = 1 / lengthCeiling
        nxCeiling *= lengthCeiling
        nyCeiling *= lengthCeiling
        const dCeiling = -(axCeiling * nxCeiling + ayCeiling * nyCeiling)
        const tCeiling = -(nxCeiling * player.x + nyCeiling * player.y + dCeiling) / (
          nxCeiling * X + nyCeiling * Y
        )
        const cxCeiling = player.x + X * tCeiling
        const cyCeiling = player.y + Y * tCeiling
        const acxCeiling = cxCeiling - axCeiling
        const acyCeiling = cyCeiling - ayCeiling
        const bcxCeiling = cxCeiling - bxCeiling
        const bcyCeiling = cyCeiling - byCeiling
        const docCeiling = acxCeiling * bcxCeiling + acyCeiling * bcyCeiling
        if (docFloor < 0 && 0 < tFloor && tFloor <= 1 && tFloor < tCeiling) {
          player.y = v.y + evlt(v.dy) - gravityConstant / 2 + 1e-12
          player.dy = dy
          player.x += dx
          aerialFlag = false
        } else if (docCeiling < 0 && 0 < tCeiling && tCeiling <= 1) {
          player.y = v.y + v.h + evlt(v.dy) + hitbox.h
          player.dy = 0 < dy ? dy : 0
        }
        if (0 < X) { // left wall
          const axLeft = v.x + evlt(v.dx) - hitbox.w / 2
          const ayLeft = v.y + evlt(v.dy)
          const bxLeft = v.x + evlt(v.dx) - hitbox.w / 2
          const byLeft = v.y + v.h + evlt(v.dy) + hitbox.h
          const abxLeft = bxLeft - axLeft
          const abyLeft = byLeft - ayLeft
          let nxLeft = -abyLeft
          let nyLeft = abxLeft
          let lengthLeft = (nxLeft ** 2 + nyLeft ** 2) ** .5
          if (0 < lengthLeft) lengthLeft = 1 / lengthLeft
          nxLeft *= lengthLeft
          nyLeft *= lengthLeft
          const dLeft = -(axLeft * nxLeft + ayLeft * nyLeft)
          const tLeft = -(nxLeft * player.x + nyLeft * player.y + dLeft) / (nxLeft * X + nyLeft * Y)
          if (0 < tLeft && tLeft <= 1) {
            const cxLeft = player.x + player.dx * tLeft
            const cyLeft = player.y + player.dy * tLeft
            const acxLeft = cxLeft - axLeft
            const acyLeft = cyLeft - ayLeft
            const bcxLeft = cxLeft - bxLeft
            const bcyLeft = cyLeft - byLeft
            const docLeft = acxLeft * bcxLeft + acyLeft * bcyLeft
            if (docLeft < 0) {
              console.log(i, 'left wall')
              player.x = v.x + evlt(v.dx) + dx - hitbox.w / 2 - 1
              player.dx = 0
              player.wallFlag = true
            }
          }
        } else if (X !== 0) { // right wall
          const ax = v.x + v.w + evlt(v.dx) + hitbox.w / 2
          const ay = v.y + evlt(v.dy)
          const bx = v.x + v.w + evlt(v.dx) + hitbox.w / 2
          const by = v.y + v.h + evlt(v.dy) + hitbox.h
          const abx = bx - ax
          const aby = by - ay
          let nx = -aby
          let ny = abx
          let length = (nx ** 2 + ny ** 2) ** .5
          if (0 < length) length = 1 / length
          nx *= length
          ny *= length
          const d = -(ax * nx + ay * ny)
          const t = -(nx * player.x + ny * player.y + d) / (nx * X + ny * Y)
          if (0 < t && t <= 1) {
            const cx = player.x + player.dx * t
            const cy = player.y + player.dy * t
            const acx = cx - ax
            const acy = cy - ay
            const bcx = cx - bx
            const bcy = cy - by
            const doc = acx * bcx + acy * bcy
            if (doc < 0) {
              player.x = v.x + v.w + evlt(v.dx) + dx + hitbox.w / 2 + 1
              player.dx = 0
              player.wallFlag = true
            }
          }
        }
        stageTime += 1
      } else if (v.type === 'enemy') {
        let flag = false
        const eHitbox = {x: v.x - size * .5, y: v.y - size * 2.75, w: size, h: size * 2.75}
        field.forEach(obj => {
          if (
            eHitbox.x <= obj.x + obj.w && obj.x <= eHitbox.x + eHitbox.w &&
            eHitbox.y <= obj.y + obj.h && obj.y <= eHitbox.y + eHitbox.h
          ) flag = true
        })
        if (!flag) v.y += 1
        const moveConstant = .7
        if (v.state === 'walk') {
          if (v.direction === 'left') {
            v.x -= moveConstant
            if (v.x < v.minXRange) v.direction = 'right'
          } else if (v.direction === 'right') {
            v.x += moveConstant
            if (v.maxXRange < v.x) v.direction = 'left'
          }
        }
        if (0 < v.invincibleTimer) v.invincibleTimer -= 1
        if (
          v.invincibleTimer === 0 &&
          eHitbox.x < attackBox.x + attackBox.w && attackBox.x < eHitbox.x + eHitbox.w &&
          eHitbox.y <= attackBox.y + attackBox.h && attackBox.y <= eHitbox.y + eHitbox.h
        ) {
          v.life -= 1
          v.invincibleTimer = 30
          v.state = 'damage'
        }
        if (v.life <= 0) enemies.splice(i, 1)
      }
    })
  }
  enemyUpdate()
  player.landFlag = aerialFlag ? false : true
  // if (player.dy !== 0) player.landFlag = false
  if (player.grapFlag) player.dx = 0
  player.x += player.dx
  if (-.01 < player.dx && player.dx < .01) player.dx = 0
  player.y += player.dy
  player.dy += gravityConstant
  if (size * 2.5 < player.dy) player.dy = size * 2.5 // terminal speed
  if (player.landFlag) {
    if (player.action === 'slide') {
      player.dx *= slideBrakeConstant
    } else player.dx *= brakeConstant
    jump.flag = false
    if (0 < jump.cooltime) jump.cooltime -= 1
    jump.double = false
    if (
      player.action !== 'punch' &&
      player.action !== 'kick' &&
      player.action !== 'run' &&
      player.action !== 'crouch' &&
      player.action !== 'walk' &&
      player.action !== 'turn' &&
      player.action !== 'slide'
    ) player.action = 'idle'
  } else {
    jump.flag = true
    jump.cooltime = 10
    if (player.action !== 'slide') player.action = 'jump'
  }
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
  if (player.action === 'punch' && imageStat.punch.frame < imageStat.punch.time) {
    attackBox = player.direction === 'left' ? {
      x: player.x - size,
      y: player.y - size * 2,
      w: size / 2,
      h: size
    } : {
      x: player.x + size / 2,
      y: player.y - size * 2,
      w: size / 2,
      h: size
    }
  } else if (
    player.action === 'kick' &&
    imageStat.kick.frame * 3 < imageStat.kick.time &&
    imageStat.kick.time < imageStat.kick.frame * 5
  ) {
    attackBox = player.direction === 'left' ? {
      x: player.x - size * 2,
      y: player.y - size * 2,
      w: size * 1.5,
      h: size
    } : {
      x: player.x + size / 2,
      y: player.y - size * 2,
      w: size * 1.5,
      h: size
    }
  } else attackBox = {x: NaN, y: NaN, w: NaN, h: NaN}
  const gateProcess = () => {
    gate.forEach(v => {
      if (
        hitbox.x <= v.x + v.w && v.x <= hitbox.x + hitbox.w &&
        hitbox.y <= v.y + v.h && v.y <= hitbox.y + hitbox.h
      ) {
        if (key[action.up]) {
          enterGate(v.stage, v.address.x, v.address.y)
        }
      }
    })
  }
  gateProcess()
}
const viewUpdate = () => {
  if (player.action !== 'jump') {
    if (key[action.right] && player.dx < dashConstant * brakeConstant) player.action = 'turn'
    if (key[action.left] && -dashConstant * brakeConstant < player.dx) player.action = 'turn'
    if (player.wallFlag && player.landFlag && player.action !== 'slide') player.action = 'push'
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
    : (player.action === 'slide' && (player.dx < -3.5 || 3.5 < player.dx)) ? 'slide'
    : (player.action === 'push') ? 'push'
    : (player.action === 'punch') ? 'punch'
    : (player.action === 'kick') ? 'kick'
    : (-.2 < player.dx && player.dx < .2) ? 'idle'
    : (-1.4 < player.dx && player.dx < 1.4) ? 'walk'
    : 'run'
  }
  if (player.action === 'idle') {
    const i = imageStat.idle
    i.time += 1
    if (( // breath
      i.start <= i.condition && i.condition < i.start + i.length / 4 &&
      i.time % ~~(i.breathInterval) === 0) || (
      i.start + i.length / 4 <= i.condition && i.condition < i.start + i.length *.5 &&
      i.time % ~~(i.breathInterval*.5) === 0) || (
      i.start + i.length * .5 <= i.condition && i.condition < i.start + i.length * 3 / 4 &&
      i.time % ~~(i.breathInterval*2) === 0) || (
      i.start + i.length * 3 / 4 <= i.condition && i.condition < i.start + i.length &&
      i.time % ~~(i.breathInterval*.5) === 0)
    ) {
      i.condition += 3
      i.time = 0
    }
    if (i.length <= i.condition && i.condition <= i.length + 3) {
      i.condition -= i.length
      if (i.breathInterval < i.maxBreath) {
        i.breathInterval += 1
      }
    }
    if (i.start + 2 < i.condition && i.condition < i.start + 6 && i.breathInterval < 25) {
      const num = Math.random()
      const list = num < .9 ? {value: voiceStat.punch, startTime: .3}
      : num < .95 ? {value: voiceStat.jump, startTime: .3}
      : {value: voiceStat.doubleJump, startTime: .33}
      playAudio(list.value, list.startTime)
    }
    if (time % i.frame === 0) { // eye blink
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
    if (i.time === 0) i.condition = 9
  } else if (player.action === 'punch') {
    const i = imageStat.punch
    i.time += 1
    if (i.time % i.frame === 0) {
      i.condition += 1
      if (i.condition === i.playAudio) playAudio(voiceStat.punch)
    }
    if (i.start + i.length - 1 < i.condition) {
      i.time = 0
      i.condition = i.start
      player.action = 'idle'
    }
  } else if (player.action === 'kick') {
    if (0 < imageStat.punch.time) imageStat.punch.time = 0
    const i = imageStat.kick
    i.time += 1
    if (i.time % i.frame === 0) {
      i.condition += 1
      if (i.condition === i.playAudio) playAudio(voiceStat.kick)
    }
    if (i.start + i.length - 1 < i.condition) {
      i.time = 0
      i.condition = i.start
      player.action = 'idle'
    }
  }
  enemies.forEach(v => {
    if (v.type === 'enemy') {
      v.imageTimer += 1
      if (v.state === 'walk') {
        const u = unityChanStat.walk
        if (v.imageTimer % u.frame === 0) {
          if (u.start + u.length - 1 < v.image + 1) v.image = u.start
          else v.image += 1
          v.imageTimer = 0
        }
      } else if (v.state === 'damage') {
        const u = unityChanStat.damage
        if (v.invincibleTimer === 30) v.image = u.start
        if (v.imageTimer % u.frame === 0) {
          if (u.start + u.length - 1 < v.image + 1) {
            v.image = unityChanStat.walk.start
            v.state = 'walk'
          } else v.image += 1
          v.imageTimer = 0
        }
      }
    }
  })
}
const draw = () => {
  context.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
  const stageOffset = {x: 0, y: 0}
  const ratio = {x: canvas.offsetWidth / 3, y: canvas.offsetHeight / 3}
  stageOffset.x = player.x < ratio.x ? 0
  : stage.w - ratio.x < player.x ? stage.w - canvas.offsetWidth
  : ((player.x - ratio.x) / (stage.w - ratio.x * 2)) * (stage.w - canvas.offsetWidth)
  stageOffset.y = player.y < ratio.y ? 0
  : stage.h - ratio.y < player.y ? stage.h - canvas.offsetHeight
  : ((player.y - ratio.y) / (stage.h - ratio.y * 2)) * (stage.h - canvas.offsetHeight)
  const drawGround = () => {
    context.fillStyle = 'hsl(180, 100%, 50%)'
    field.forEach(obj => {
      context.fillRect(obj.x - stageOffset.x|0, obj.y - stageOffset.y|0, obj.w|0, obj.h|0)
    })
  }
  drawGround()
  const drawGate = () => {
    context.fillStyle = 'hsl(0, 0%, 25%)'
    gate.forEach(obj => {
      context.fillRect(obj.x - stageOffset.x|0, obj.y - stageOffset.y|0, obj.w|0, obj.h|0)
    })
    context.strokeStyle = 'hsl(270, 100%, 50%)'
    gate.forEach(obj => {
      context.strokeRect(obj.x - stageOffset.x|0, obj.y - stageOffset.y|0, obj.w|0, obj.h|0)
    })
  }
  drawGate()
  const imageOffset = {x: 64, y: 124}
  context.fillStyle = 'hsl(150, 100%, 50%)'
  enemies.forEach(v => {
    if (v.type === 'object') {
      context.fillRect(
        v.x + evlt(v.dx) - stageOffset.x|0, v.y + evlt(v.dy) - stageOffset.y|0, v.w|0, v.h|0
      )
    }
    if (v.type === 'enemy') {
      const ex = v.x - imageOffset.x - stageOffset.x
      const ey = v.y - imageOffset.y - stageOffset.y
      drawEnemy(v, ex, ey)
    }
  })
  if (0 < aftergrow.gate) {
    context.save()
    context.font = `italic ${size * 2}px sans-serif`
    const start = 60
    const alpha = aftergrow.gate < start ? aftergrow.gate / start : 1
    context.fillStyle = `hsla(0, 0%, 100%, ${alpha})`
    context.textAlign = 'center'
    context.fillText(stageName, canvas.offsetWidth / 2, canvas.offsetHeight / 6)
    context.strokeStyle = `hsla(0, 0%, 50%, ${alpha})`
    context.strokeText(stageName, canvas.offsetWidth / 2, canvas.offsetHeight / 6)
    context.restore()
    aftergrow.gate -= 1
  }
  let i
  if (player.action === 'slide') i = imageStat.slide.condition
  if (player.action === 'push') i = imageStat.push.condition
  else if (player.action === 'jump') {
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
  else if (player.action === 'punch') i = imageStat.punch.condition
  else if (player.action === 'kick') i = imageStat.kick.condition
  const x = (player.x - imageOffset.x - stageOffset.x)
  drawImage(i, x, (player.y - imageOffset.y - stageOffset.y))
  if (settings.type.hitbox) { // displayHitbox
    context.fillStyle = 'hsl(300, 100%, 50%)'
    context.fillRect(
      hitbox.x - stageOffset.x|0, hitbox.y - stageOffset.y|0, hitbox.w|0, 1
    )
    context.fillRect(
      hitbox.x - 1 - stageOffset.x|0, hitbox.y - stageOffset.y|0, 1, hitbox.h + 1|0
    )
    context.fillRect(
      hitbox.x + hitbox.w - stageOffset.x|0, hitbox.y - stageOffset.y|0, 1, hitbox.h + 1|0
    )
    context.fillRect(
      hitbox.x - stageOffset.x|0, hitbox.y + hitbox.h - stageOffset.y|0, hitbox.w|0, 1
    )
    // context.fillRect(hitbox.x+hitbox.w*.2 - stageOffset.x, hitbox.y+hitbox.h*.8 - stageOffset.y, hitbox.w*.6, hitbox.h*.2)
    context.fillRect(
      attackBox.x - stageOffset.x, attackBox.y - stageOffset.y, attackBox.w, attackBox.h
    )
    enemies.forEach(v => {
      if (v.type === 'enemy') {
        context.fillRect(
          v.x - size * .5 - stageOffset.x, v.y - size * 2.75 - stageOffset.y, size, size * 2.75
        )
      }
    })
  }
  if (settings.type.status) { // displayStatus
    context.fillStyle = 'hsl(240, 100%, 50%)'
    context.font = `${size}px sans-serif`
    context.fillText(`stamina: ${imageStat.idle.breathInterval}`, size * 2, size)
    context.fillText('cooltime', size * 2, size * 3)
    context.fillText(`jump : ${jump.cooltime}`, size * 10, size * 3)
    context.fillText(`slide: ${cooltime.slide}`, size * 10, size * 5)
    context.fillText('aerial step :', size * 2, size * 7)
    if (jump.step) context.fillText('unenable', size * 10, size * 7)
    else context.fillText('enable', size * 10, size * 7)
    context.fillText('double jump :', size * 2, size * 9)
    if (jump.double) context.fillText('unenable', size * 10, size * 9)
    else context.fillText('enable', size * 10, size * 9)
  }
  if (settings.type.map) { // displayMap
    const multiple = 2
    const mapOffset = {x: canvas.offsetWidth - size - multiple * stage.w / size, y: size}
    context.fillStyle = 'hsla(0, 0%, 0%, .25)'
    context.fillRect(
      mapOffset.x|0, mapOffset.y|0,
      multiple * stage.w / size|0, multiple * stage.h / size|0)
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
}
let playFlag = false
const musicProcess = () => {
  if (!playFlag && Object.values(key).some(value => {return 0 < value})) {
    playFlag = true
    musicLoadedMap[musicPathList[0]].play()
  }
}
const main = () => {
  time += 1
  input()
  modelUpdate()
  viewUpdate()
  draw()
  musicProcess()
  window.requestAnimationFrame(main)
}