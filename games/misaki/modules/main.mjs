import {key, globalTimestamp} from '../../../modules/key.mjs'
import {mapLoader} from '../../../modules/mapLoader.mjs'
import {imageLoader} from '../../../modules/imageLoader.mjs'
import {audioLoader} from '../../../modules/audioLoader.mjs'

const keyMap = {
  up: ['w'],
  right: ['d'],
  down: ['s'],
  left: ['a'],
  jump: ['i', 'l', ' '],
  attack: ['k'],
  dash: ['j'],
  option: ['n'],
  subElasticModulus: ['y'],
  addElasticModulus: ['u'],
  subFrictionalForce: ['o'],
  addFrictionalForce: ['p'],
  gravity: ['g'],
  DECO: ['e'],
  status: ['t'],
  hitbox: ['h'],
  map: ['m'],
  reset: ['r']
}
const keyFirstFlagObject = {}
const isKeyFirst = list => {return list.some(v => key[v].isFirst())} // 今押したか
const isKey = list => {return list.some(v => key[v].flag)} // 押しているか
const howLongKey = list => { // どのくらい押しているか
  return list.reduce((acc, cur) => acc < key[cur].holdtime ? key[cur].holdtime : acc, 0)
}

const internalFrameList = []
const animationFrameList = []
let currentTime = globalTimestamp
let intervalDiffTime = 1
const size = 16
const terrainObject = {'0': [[]],}
const orgRound = (value, base) => {return Math.round(value * base) / base}
{
  const terrainList = [
    [[0, 1], [0, 0], [1, 0], [1, 1],], // rectangle
    [[0, 1], [1, 0], [1, 1],], // triangle
    [[0, 1], [1, .5], [1, 1],], // 22.5 low
    [[0, 1], [1, 0], [1, .5],],
    [[0, .5], [1, 0], [1, .5],], // 22.5 high
    [[0, 1], [0, .5], [1, .5], [1, 1],], // harf rectangle
    [[0, 1], [0, .5], [.5, .5], [.5, 1],], // quarter rectangle
    [[0, 1], [.5, .5], [.5, 1],], // small triangle - bottom left
    [[.5, 1], [1, .5], [1, 1],], // small triangle - bottom right
    [[0, .5], [.5, 0], [.5, .5],], // small triangle - top left
    [[0, 0], [1, 0]], // platform
    [[0, 1], [1, 0],],
    [[0, .5], [1, .5],],
    [[0, 1], [1, .5],],
    [[0, .5], [.5, .5],],
    [[0, 0], [.5, 0],],
    [[0, 1], [.5, .5],],
    [[.5, 1],[1, .5]],
  ]
  const horizontallyInversionTerrain = array => {
    const terrain = JSON.parse(JSON.stringify(array))
    terrain.forEach(v => {
      v[1] = orgRound(1 - v[1], 10)
    })
    terrain.reverse()
    return terrain
  }
  const rotationTerrain = array => {
    const terrain = JSON.parse(JSON.stringify(array))
    terrain.forEach(v => {
      v[0] -= .5
      v[1] -= .5
      ;[v[0], v[1]] = [
        orgRound(v[0] * Math.cos(Math.PI / 2) - v[1] * Math.sin(Math.PI / 2), 10),
        orgRound(v[0] * Math.sin(Math.PI / 2) + v[1] * Math.cos(Math.PI / 2), 10),]
      v[0] += .5
      v[1] += .5
    })
    return terrain
  }
  let id = 1
  terrainList.forEach(v => {
    const isExist = arg => {
      return Object.values(terrainObject).some(val => {
        return arg.every(v => {
          return arg.length === val.length && val.some(valu => {
            return valu.every((value, i) => {
              return v[i] === value
            })
          })
        })
      })
    }
    for (let i = 0; i < 4; i++) {
      let terrain = v
      for (let ix = 0; ix < i; ix++) terrain = rotationTerrain(terrain)
      terrainObject[id] = isExist(terrain) ? [] : terrain
      id++
    }
    for (let i = 0; i < 4; i++) {
      let terrain = v
      for (let ix = 0; ix < i; ix++) terrain = rotationTerrain(terrain)
      terrain = horizontallyInversionTerrain(terrain)
      terrainObject[id] = isExist(terrain) ? [] : terrain
      id++
    }
  })
}
const mapObject = {}
const imageObject = {}
const audioObject = {}
let directoryList = [
  'map_GothicVaniaTown',
  'map_MagicCliffsArtwork',
]
let mapColor = 'rgb(127, 127, 127)'
const gravitationalAcceleration = 9.80665 * 1000 / 25 / 1000 ** 2
let coefficient = 5
let elasticModulus = 0 // 0 to 1
const wallFF = 0
let userFF = .1
let frictionalForce = userFF // 0 to 1
const playerData = {breathMin: 1e3, breathFatigue: 2e3, breathMid: 3e3, breathMax: 5e3}
let player = {
  x: 0, y: 0,
  dx: 0, dy: 0,
  r: size / 2 * .9,
  state: 'idle', direction: 'right',
  landFlag: false, wallFlag: false, grabFlag: false,
  hitbox: {x: 0, y: 0, w: 0, h: 0},
  attackBox: {x: 0, y: 0, w: 0, h: 0},
  invincibleTimer: 0,
  blinkCount: 0,
  blinkInterval: 0,
  blinkTimestamp: globalTimestamp,
  breathCount: 0,
  breathInterval: playerData.breathMid,
  breathTimestamp: globalTimestamp,
}
player.hitbox = {x: player.x - size / 2, y: player.y - size * 3, w: size, h: size * 3}
const landCondition = {y: size / 4, w: size * .6, h: size / 3,}
const normalConstant = .008 // 1 dot = 4 cm, 1 m = 25 dot
const dashConstant = .02
let moveAcceleration = normalConstant
const dashThreshold = 1
const jumpConstant = 1
let gravityFlag = true // temporary
const maxLog = {
  dx: 0,
  dy: 0,
}

const slideConstant = 2
const boostConstant = 6
const brakeConstant = .75
const slideBrakeConstant = .95
// const jumpConstant = 5
let jump = {flag: false, double: false, step: false, time: 0, speed: 0}
let slide = {flag: false}
let cooltime = {
  step: 0, stepLimit: 15, stepDeferment: 15,
  aerialStep: 0, aerialStepLimit: 10,
  slide: 2, slideLimit: 45
}
let floatMenuCursor = 0
const floatMenuCursorMax = 3

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
    voice : setStorage('voice', .1, true),
    music : setStorage('music', .02, true),
  }, type: {
    DECO  : setStorage('DECO', false, true),
    status: setStorage('status', false, true),
    hitbox: setStorage('hitbox', false, true),
    map   : setStorage('map', false, true),
  }
}
const keySettingElementList = document.getElementsByClassName`key-setting`
Object.keys(settings.type).forEach(v => {
  keySettingElementList['key-' + v].textContent = keyMap[v].map(vl => vl.toUpperCase())
})
Object.keys(settings.type).forEach(v => {})
const inputDOM = document.getElementsByTagName`input`
Object.keys(settings.type).forEach(v => {
  inputDOM[v].checked = settings.type[v]
  inputDOM[v].addEventListener('change', () => {
    settings.type[v] = setStorage(v, inputDOM[v].checked, false)
  }, false)
})
const resourceList = []
const setDirectory = str => {return 'resources/' + str}
const getMapData = directory => {
  return new Promise(async resolve => {
    const mapInfoObject = {
      layersIndex: {
        collision: [],
        tileset: [],
        objectgroup: [],
        background: [],
      }, tilesetsIndex: {},
    }
    let resource = []
    await mapLoader('main', setDirectory(directory + '.json')).then(result => {
      Object.assign(mapInfoObject, result.main)
      mapInfoObject.layers.forEach((v, i) => {
        if(v.type === 'tilelayer') {
          if (v.name.startsWith('collision')) mapInfoObject.layersIndex.collision.push(i)
          else mapInfoObject.layersIndex.tileset.push(i)
        } else if (v.type === 'objectgroup') {
          mapInfoObject.layersIndex.objectgroup.push(i)
        }
      })
      mapInfoObject.tilesets.forEach((v, i) => {
        const str = v.source.substring(v.source.indexOf('_') + 1, v.source.indexOf('.'))
        mapInfoObject.tilesetsIndex[str] = {}
        mapInfoObject.tilesetsIndex[str].index = i
        resource.push(mapLoader(str, setDirectory(v.source)))
      })
    })
    await Promise.all(resource).then(result => {
      resource = []
      mapInfoObject.layers.forEach((v, i) => {
        if (v.type === 'imagelayer') {
          mapInfoObject.layersIndex.background.push(i)
          const src = v.image
          resource.push(imageLoader(v.name, setDirectory(src)))
        }
      })
      result.forEach(v => {
        Object.entries(v).forEach(([key, value]) => {
          Object.assign(mapInfoObject.tilesetsIndex[key], value)
          const src = value.image
          resource.push(imageLoader(key, setDirectory(src)))
        })
      })
    })
    await Promise.all(resource).then(result => {
      result.forEach(v => imageObject[Object.keys(v)[0]] = Object.values(v)[0])
      mapObject[directory] = mapInfoObject
      resolve()
    })
  })
}
directoryList.forEach(v => {resourceList.push(getMapData(v))})
let image = {
  misaki: {
    idle: {
      data: [],
      src: [
        'images/Misaki/Misaki_Idle_1.png',
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
      ],
    }, walk : {
      data: [],
      src: [
        'images/Misaki/Misaki_Walk_1.png',
        'images/Misaki/Misaki_Walk_2.png',
        'images/Misaki/Misaki_Walk_3.png',
        'images/Misaki/Misaki_Walk_4.png',
        'images/Misaki/Misaki_Walk_5.png',
        'images/Misaki/Misaki_Walk_6.png',
      ],
    }, turn : {
      data: [],
      src: [
        'images/Misaki/Misaki_Turn_3.png',
        'images/Misaki/Misaki_Turn_2.png',
      ],
    }, run : {
      data: [],
      src: [
        'images/Misaki/Misaki_Run_1.png',
        'images/Misaki/Misaki_Run_2.png',
        'images/Misaki/Misaki_Run_3.png',
        'images/Misaki/Misaki_Run_4.png',
        'images/Misaki/Misaki_Run_5.png',
        'images/Misaki/Misaki_Run_6.png',
        'images/Misaki/Misaki_Run_7.png',
        'images/Misaki/Misaki_Run_8.png',
      ],
    }, crouch: {
      data: [],
      src: [
        'images/Misaki/Misaki_Crouch_1.png',
        'images/Misaki/Misaki_Crouch_2.png',
        'images/Misaki/Misaki_Crouch_3.png',
      ],
    }, jump : {
      data: [],
      src: [
        'images/Misaki/Misaki_Jump_up_1.png',
        'images/Misaki/Misaki_Jump_up_2.png',
        'images/Misaki/Misaki_Jump_up_3.png',
        'images/Misaki/Misaki_Jump_MidAir_1.png',
        'images/Misaki/Misaki_Jump_MidAir_2.png',
        'images/Misaki/Misaki_Jump_MidAir_3.png',
        'images/Misaki/Misaki_Jump_Fall_1.png',
        'images/Misaki/Misaki_Jump_Fall_2.png',
        'images/Misaki/Misaki_Jump_Fall_3.png',
      ],
    }, slide : {
      data: [],
      src: ['images/Misaki/Misaki_Slide_1.png'],
    }, push : {
      data: [],
      src: ['images/Misaki/Misaki_Push_1.png'],
    }, punch: {
      data: [],
      src: [
        'images/Misaki/Misaki_Punch_1.png',
        'images/Misaki/Misaki_Punch_2.png',
      ],
    }, kick : {
      data: [],
      src: [
        'images/Misaki/Misaki_Kick_1.png',
        'images/Misaki/Misaki_Kick_2.png',
        'images/Misaki/Misaki_Kick_3.png',
        'images/Misaki/Misaki_Kick_4.png',
        'images/Misaki/Misaki_Kick_5.png',
        'images/Misaki/Misaki_Kick_6.png',
      ],
    }, damage: {
      data: [],
      src: [
        'images/Misaki/Misaki_Damage_1.png',
        'images/Misaki/Misaki_Damage_2.png',
        'images/Misaki/Misaki_Damage_3.png',
        'images/Misaki/Misaki_Damage_4.png',
      ],
    }, down : {
      data: [],
      src: [
        'images/Misaki/Misaki_Damage_down_1.png',
        'images/Misaki/Misaki_Damage_down_2.png',
        'images/Misaki/Misaki_Damage_down_3.png',
        'images/Misaki/Misaki_Damage_down_4.png',
      ],
    }, return: {
      data: [],
      src: [
        'images/Misaki/Misaki_Damage_return_1.png',
        'images/Misaki/Misaki_Damage_return_2.png',
        'images/Misaki/Misaki_Damage_return_3.png',
      ],
    },
  }, kohaku: {
    idle: {
      data: [],
      src: [
        'images/Unitychan/BasicActions/Unitychan_Idle_1.png',
        'images/Unitychan/BasicActions/Unitychan_Idle_2.png',
        'images/Unitychan/BasicActions/Unitychan_Idle_3.png',
        'images/Unitychan/BasicActions/Unitychan_Idle_4.png',
      ],
    }, walk  : {
      data: [],
      src: [
        'images/Unitychan/BasicActions/Unitychan_Walk_1.png',
        'images/Unitychan/BasicActions/Unitychan_Walk_2.png',
        'images/Unitychan/BasicActions/Unitychan_Walk_3.png',
        'images/Unitychan/BasicActions/Unitychan_Walk_4.png',
        'images/Unitychan/BasicActions/Unitychan_Walk_5.png',
        'images/Unitychan/BasicActions/Unitychan_Walk_6.png',
      ],
    }, damage: {
      data: [],
      src: [
        'images/Unitychan/BasicActions/Unitychan_Damage_2.png',
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
      ],
    }, sword: {
      data: [],
      src: [
        'images/Unitychan/Attack/Unitychan_Soard_Combo_2.png',
        'images/Unitychan/Attack/Unitychan_Soard_Combo_3.png',
        'images/Unitychan/Attack/Unitychan_Soard_Combo_4.png',
        'images/Unitychan/Attack/Unitychan_Soard_Combo_5.png',
        'images/Unitychan/Attack/Unitychan_Soard_Combo_6.png',
        'images/Unitychan/Attack/Unitychan_Soard_Combo_7.png',
      ],
    },
  },
}
const imageListLoader = obj => {
  return new Promise(resolve => {
    let resource = []
    obj.src.forEach((v, i) => resource.push(imageLoader(i, v)))
    Promise.all(resource).then(result => {
      const object = {}
      result.forEach(v => {object[Object.keys(v)[0]] = Object.values(v)[0]})
      for (let i = 0; i < result.length; i++) {
        obj.data.push(object[i])
        if (i === result.length - 1) resolve()
      }
    })
  })
}
Object.keys(image).forEach(v => {
  Object.keys(image[v]).forEach(vl => {
    resourceList.push(imageListLoader(image[v][vl]))
  })
})
const audio = {
  misaki: {
    jump : {
      data: '',
      src: 'audio/Misaki/V2001.wav',
    }, doubleJump: {
      data: '',
      src: 'audio/Misaki/V2002.wav',
    }, punch : {
      data: '',
      src: 'audio/Misaki/V2005.wav',
    }, kick : {
      data: '',
      src: 'audio/Misaki/V2006.wav',
    }, win : {
      data: '',
      src: 'audio/Misaki/V2024.wav',
    },
  }, music: {
    'テレフォン・ダンス': {
      data: '',
      src: 'audio/music/nc109026.wav',
    }, 'アオイセカイ': {
      data: '',
      src: 'audio/music/nc110060.mp3',
    },
  },
}
const audioObjectLoader = obj => {
  return new Promise(resolve => {
    audioLoader('data', obj.src).then(result => {
      obj.data = Object.values(result)[0]
      resolve()
    })
  })
}
Object.keys(audio).forEach(v => {
  Object.keys(audio[v]).forEach(vl => {
    resourceList.push(audioObjectLoader(audio[v][vl]))
  })
})
const voiceVolumeHandler = voice => {
  voice.volume = settings.volume.master * settings.volume.voice
}
const musicVolumeHandler = music => {
  music.volume = settings.volume.master * settings.volume.music
}
const volumeController = () => {
  Object.keys(audio).forEach(v => {
    Object.keys(audio[v]).forEach(vl => {
      if (v === 'misaki') {
        voiceVolumeHandler(audio[v][vl].data)
      } else if (v === 'music') {
        musicVolumeHandler(audio[v][vl].data)
      }
    })
  })
}
Object.keys(settings.volume).forEach(v => {
  document.getElementById(`${v}Input`).value = settings.volume[v]
  document.getElementById(`${v}Output`).value = settings.volume[v] * 100|0
  document.getElementById(`${v}Input`).addEventListener('input', e => {
    document.getElementById(`${v}Output`).value = e.target.value * 100|0
    settings.volume[v] = setStorage(v, e.target.value, false)
    volumeController()
  })
})
let imageStat = {
  idle  : {
    blinkAnimationInterval: 15,
    blinkInterval: 5e3,
    blinkMax: 3,
    blinkRotate: [0, 1, 2, 1],
    breathCount: 0,
    breathInterval: 30,
    breathMax: 4,
    breathTimestamp: globalTimestamp,
    condition: 0,
  },
  walk  : {condition: 0, distance: 0, stride: 14}, // in rearistic, stride = 7
  run   : {condition: 0, distance: 0, stride: 20}, // in rearistic, stride = 10
  turn  : {condition: 0, time: 0, frame: 5},
  crouch: {condition: 0, time: 0, intervalTime: 50},
  jump  : {condition: 0},
  slide : {condition: 0},
  push  : {condition: 0},
  punch : {condition: 0, time: 0, frame: 3, audioTrigger: 1},
  kick  : {condition: 0, time: 0, frame: 7, audioTrigger: 3},
  damage: {condition: 0, time: 0, frame: 7, audioTrigger: 0},
}
const unityChanStat = {
  idle  : {frame: 55},
  walk  : {frame: 10},
  damage: {frame: 5},
  sword : {
    frame: 7,
    startUp: 7,
    startUpLength: 3,
    active: 7,
    activeLength: 1,
    recovery: 5,
    recoveryLength: 2,
  },
}
let playFlag = false
let currentPlay = 'アオイセカイ'
const playAudio = (element, startTime = 0) => {
  element.currentTime = startTime
  element.play()
}
let menuFlag = false
const menuWidthMax = canvas.offsetWidth / 2
const menuGaugeMax = 100
let menuGauge = 0
let menuWidth = 0
let menuGaugeMaxTime = 100 * (1 / 75)
let menuOpenTimestamp = 0
let menuCloseTimestamp = 0
const screenList = ['title', 'main']
let screenState = screenList[1]
let mapData = {name: directoryList[0], w: 0, h: 0, checkPoint: {x: 0, y: 0}}
const timestamp = {
  gate: 0,
}
let enemies = []

const setStartPosition = arg => {
  arg.layersIndex.objectgroup.forEach(v => {
    const index = arg.layers[v].objects.findIndex(vl => {
      return vl.name === 'playerPosition'
    })
    if (index !== -1) {
      const playerPosition = arg.layers[v].objects[index]
      player.x = mapData.checkPoint.x = playerPosition.x
      player.y = mapData.checkPoint.y = playerPosition.y
    }
  })
}
const getColor = arg => {
  arg.layersIndex.objectgroup.forEach(v => {
    const index = arg.layers[v].objects.findIndex(vl => vl.name === 'color')
    if (index !== 0) {
      let color = arg.layers[v].objects[index].properties[0].value
      mapColor = `rgba(${
        parseInt(color.slice(3, 5), 16)}, ${
        parseInt(color.slice(5, 7), 16)}, ${
        parseInt(color.slice(7, 9), 16)}, ${
        parseInt(color.slice(1, 3), 16)})`
    }
  })
}
const getMusic = arg => {
  arg.layersIndex.objectgroup.forEach(v => {
    const index = arg.layers[v].objects.findIndex(vl => vl.name === 'audio')
    if (index !== -1) {
      let path = arg.layers[v].objects[index].properties[0].value
      path = setDirectory(path)
      if (Object.keys(audioObject).some(v => v === mapData.name)) {
        audioObject[mapData.name].currentTime = 0
        audioObject[mapData.name].play()
      } else {
        audioLoader(mapData.name, path).then(result => {
          musicVolumeHandler(Object.values(result)[0])
          Object.values(result)[0].loop = true
          Object.values(result)[0].play()
          Object.assign(audioObject, result)
        })
      }
    }
  })
}
const setMapProcess = arg => {
  timestamp.gate = globalTimestamp
  mapData.name = arg
  mapData.w = mapObject[arg].tilewidth * mapObject[arg].width
  mapData.h = mapObject[arg].tileheight * mapObject[arg].height
  setStartPosition(mapObject[arg])
  getColor(mapObject[arg])
  getMusic(mapObject[arg])
}

const frameCounter = list => {
  const now = Date.now()
  list.push(now)
  let flag = true
  do {
    if (list[0] + 1e3 < now) list.shift()
    else flag = false
  } while (flag)
}
const proposal = () => {
  // rule: value control only [
  // dx, dy, state]
  { // dash
    if (isKey(keyMap.dash)) moveAcceleration = dashConstant
    else moveAcceleration = normalConstant
  }
  { // walk, aerial control
    let speed = moveAcceleration * intervalDiffTime
    const attenuationRatio = .95
    speed *= dashThreshold < Math.abs(player.dx) ? 1 - attenuationRatio : 1
    const aerialBrake = .2
    speed *= ['crouch', 'punch', 'kick', 'damage'].some(v => v === player.state) ? 0 :
    player.state === 'jump' ? aerialBrake : 1
    if (isKey(keyMap.left)) player.dx -= speed
    if (isKey(keyMap.right)) player.dx += speed
    const ristrict = isKey(keyMap.dash) ? 1 : .5
    if (ristrict < player.dx) player.dx -= speed
    if (player.dx < -ristrict) player.dx += speed
  }
  { // jump
    if (keyFirstFlagObject.jump && player.state !== 'damage' && !isKey(keyMap.down)) { // temporary
      if (jump.flag) {
        if (!jump.double && jump.time === 0 && !player.grabFlag) {
          player.dy = -jumpConstant
          player.state = 'jump' // temporary
          jump.double = true
          cooltime.aerialStep = 0 // temporary
          playAudio(audio.misaki.doubleJump.data) // temporary
          if (5 < player.breathInterval) player.breathInterval -= 1 // temporary
          jump.time = 0 // temporary
        }
      } else if (jump.time === 0) {
        const jumpCoefficient = 5
        player.dy = -jumpConstant * (1 + Math.abs(player.dx) / jumpCoefficient) ** .5
        player.state = 'jump' // temporary
        jump.flag = true
        if (!player.landFlag && !player.grabFlag) {
          jump.double = true
          cooltime.aerialStep = 0 // temporary
          playAudio(audio.misaki.doubleJump.data) // temporary
        } else {
          player.dx /= Math.SQRT2
          playAudio(audio.misaki.jump.data) // temporary
        }
        if (playerData.breathMin < player.breathInterval) player.breathInterval -= 1 // temporary
      }
      jump.time += 1 // temporary
    }
    if(!isKey(keyMap.jump)) { // temporary
      if (settings.type.DECO) jump.time = 0
      else {
        if (5 < jump.time) { // temporary
          if (player.dy < 0) player.dy = 0
          jump.time = 0
        } else if (jump.time !== 0) jump.time += 1
      }
    }
  }
  { // crouch, down force
    if (isKey(keyMap.down) && !player.grabFlag) {
      if (player.landFlag) {
        const crouchPermissionList = ['idle', 'walk']
        if (crouchPermissionList.some(v => v === player.state)) {
          player.state = 'crouch'
        }
      }
    }
    if (player.state === 'jump') {
      if (isKey(keyMap.down)) {
        const downForce = .05
        const restrictValue = 2
        player.dy += player.dy < restrictValue ? downForce : 0
      }
    }
  }
  { // for debug
    if (keyFirstFlagObject.reset) {
      maxLog.dx = 0
      maxLog.dy = 0
    }
    if (keyFirstFlagObject.subElasticModulus && 0 < elasticModulus) {
      elasticModulus = orgRound(elasticModulus - .1, 10)
    }
    if (keyFirstFlagObject.addElasticModulus && elasticModulus < 1) {
      elasticModulus = orgRound(elasticModulus + .1, 10)
    }
    if (keyFirstFlagObject.subFrictionalForce && 0 < userFF) {
      userFF = orgRound(userFF - .1, 10)
    }
    if (keyFirstFlagObject.addFrictionalForce && userFF < 1) {
      userFF = orgRound(userFF + .1, 10)
    }
    if (keyFirstFlagObject.gravity) gravityFlag = !gravityFlag
    if (!gravityFlag) {
      player.dx = 0
      player.dy = 0
      const num = 10
      if (isKey(keyMap.left)) player.dx -= moveAcceleration * intervalDiffTime * num
      if (isKey(keyMap.right)) player.dx += moveAcceleration * intervalDiffTime * num
      if (isKey(keyMap.up)) player.dy -= moveAcceleration * intervalDiffTime * num
      if (isKey(keyMap.down)) player.dy += moveAcceleration * intervalDiffTime * num
    }
  }
  const inGameInputProcess = () => {
    { // wall grab
      if (
        player.wallFlag &&
        !player.landFlag &&
        0 < player.dy &&
        keyMap.up.some(v => key[v].flag)) {
        if (
          (player.wallFlag === 'left' && player.direction === 'right') ||
          (player.wallFlag === 'right' && player.direction === 'left')
        ) {
          player.dy *= .5
          player.dx = player.direction === 'left' ? -dashConstant : dashConstant
          player.grabFlag = true
        }
      }
      if (!(
        player.wallFlag &&
        !player.landFlag &&
        0 < player.dy &&
        keyMap.up.some(v => key[v].flag))) {
        player.grabFlag = false
      }
    }
    if (player.grabFlag) { // wall kick
      let flag = false
      if (
        keyFirstFlagObject.jump &&
        player.grabFlag &&
        player.direction === 'right'
      ) {
        player.dx = -4
        player.direction = 'left'
        flag = true
      } else if (
        keyFirstFlagObject.jump &&
        player.grabFlag &&
        player.direction === 'left'
      ) {
        player.dx = 4
        player.direction = 'right'
        flag = true
      }
      if (flag) {
        player.dy = -jumpConstant
        player.wallFlag = false
        player.grabFlag = false
        jump.flag = true
        player.state = 'jump'
      }
    }
    { // attack
      const actionList = ['crouch', 'slide', 'punch', 'kick']
      if ( // punch
        keyFirstFlagObject.attack &&
        !keyMap.left.some(v => key[v].flag) &&
        !keyMap.right.some(v => key[v].flag) &&
        player.landFlag &&
        !actionList.some(v => v === player.state)
      ) {
        player.state = 'punch'
        imageStat.punch.time = 0
      }
      const kickDeferment = 1000 / 60 * 6
      if ( // kick
        keyFirstFlagObject.attack &&
        player.landFlag &&
        !actionList.some(v => v === player.state) && (
        keyMap.left.some(v => globalTimestamp - key[v].timestamp <= kickDeferment) ||
        keyMap.right.some(v => globalTimestamp - key[v].timestamp <= kickDeferment))
      ) {
        player.state = 'kick'
        imageStat.kick.time = 0
      }
      if (cooltime.slide === 0) {
        if ( // slide
          keyFirstFlagObject.attack && (
          keyMap.left.some(v => key[v].flag) ||
          keyMap.right.some(v => key[v].flag)) &&
          !actionList.some(v => v === player.state) &&
          player.landFlag &&
          !player.wallFlag &&
          !slide.flag
        ) {
          const slideSpeed = slideConstant < player.dx ? boostConstant
          : player.dx < -slideConstant ? -boostConstant : 0
          if (slideSpeed !== 0) {
            player.dx += slideSpeed
            player.state = 'slide'
            cooltime.slide = cooltime.slideLimit
            if (10 < player.breathInterval) player.breathInterval -= 1
          }
          slide.flag = true
        }
      }
      if (player.state !== 'slide' && cooltime.slide !== 0) {
        if (!player.landFlag && 1 < cooltime.slide) cooltime.slide -= 2
        else cooltime.slide -= 1
      }
      if (!keyMap.dash.some(v => key[v].flag)) slide.flag = false
      // if ( // accel
      //   player.action !== 'crouch' && !jump.step
      // ) {
      //   const stepSpeed = key[action.left] && key[action.accel] ? -stepConstant
      //   : key[action.right] && key[action.accel] ? stepConstant : 0
      //   if (stepSpeed !== 0) {
      //     player.dx += stepSpeed
      //     jump.step = true
      //     cooltime.aerialStep = cooltime.aerialStepLimit
      //   }
      // }
      // if (player.action !== 'jump' && jump.step) jump.step = false
      // if (0 < cooltime.aerialStep) {
      //   player.dy = 0
      //   cooltime.aerialStep -= 1
      // }
    }
  }
  if (false && !menuFlag) inGameInputProcess()
  Object.keys(settings.type).forEach(v => {
    if (keyFirstFlagObject[v]) {
      settings.type[v] = setStorage(v, !settings.type[v])
      inputDOM[v].checked = !inputDOM[v].checked
    }
  })
  mapObject[mapData.name].layers[mapObject[
  mapData.name].layersIndex.objectgroup].objects.forEach(v => { // gate process
    if (
      v.name === 'gate' &&
      v.x < player.x && player.x < v.x + v.width &&
      v.y < player.y && player.y < v.y + v.height
    ) {
      v.properties.forEach(vl => {
        if (vl.name === 'address' && keyFirstFlagObject.up) {
          setMapProcess(vl.value)
        }
      })
    }
  })
}
const judgement = () => {
  const collisionResponse = tilt => {
    const nX = Math.cos(tilt * Math.PI)
    const nY = Math.sin(tilt * Math.PI)
    const t = -(
      player.dx * nX + player.dy * nY) / (
      nX ** 2 + nY ** 2) * (.5 + elasticModulus / 2)
    player.dx += 2 * t * nX
    player.dy += 2 * t * nY
    if (tilt <= 1) frictionalForce = wallFF
    player.dx *= 1 - frictionalForce
    player.dy *= 1 - frictionalForce
  }
  let count = 0
  let onetimeLandFlag = false
  let repeatFlag
  do {
    count++
    if (3 < count) {
      player.dx = 0
      player.dy = 0
    }
    repeatFlag = false
    const collisionFn = collisionIndex => {
      for (let x = 0; x < mapObject[mapData.name].layers[collisionIndex].width; x++) {
        for (let y = 0; y < mapObject[mapData.name].layers[collisionIndex].height; y++) {
          const id =
            mapObject[mapData.name].layers[collisionIndex].data[
              y * mapObject[mapData.name].layers[collisionIndex].width + x] -
            mapObject[mapData.name].tilesets[mapObject[
              mapData.name].tilesetsIndex.collision.index].firstgid + 1
          let terrainIndex
          terrainIndex = 0 < id ? id : '0'
          terrainObject[terrainIndex].forEach((ro, i) => { // relative origin
            if (ro.rength === 0) return
            if (terrainObject[terrainIndex].length === 1) return
            const rp = terrainObject[terrainIndex].slice(i - 1)[0]
            const rn = terrainObject[terrainIndex].length - 1 === i ? // relative next
              terrainObject[terrainIndex][0] : terrainObject[terrainIndex].slice(i + 1)[0]
            let tilt = Math.atan2(rn[1] - ro[1], rn[0] - ro[0]) / Math.PI // 判定する線分の傾き
            const previousTilt = Math.atan2(ro[1] - rp[1], ro[0] - rp[0]) / Math.PI
            const findVertexList = [
              [0, 0, [-1, 0], [-1, -1]],
              [0, 1, [1, 0], [1, 1]],
              [1, 0, [0, -1], [1, -1]],
              [1, 1, [0, 1], [-1, 1]],
            ]
            let vertexFlag = false
            let returnFlag = false
            findVertexList.forEach((vl, i) => {
              if (ro[vl[0]] === vl[1]) {
                const target = terrainObject[mapObject[mapData.name].layers[collisionIndex].data[(
                  y + vl[2][1]) * mapObject[mapData.name].layers[collisionIndex].width + x + vl[2][0]] -
                  mapObject[mapData.name].tilesets[mapObject[mapData.name].
                  tilesetsIndex.collision.index].firstgid + 1]
                if (target === undefined) return
                const vertex = i === 0 ? [1, ro[1]] :
                i === 1 ? [0, ro[1]] :
                i === 2 ? [ro[0], 1] : [ro[0], 0]
                // x, y それぞれ0, 1が含まれている隣を調べる
                const index = target.findIndex(val => {
                  return val[0] === vertex[0] && val[1] === vertex[1]
                })
                if (index !== -1) {
                  const previousIndex = index === 0 ? target.length - 1 : index - 1
                  const nextIndex = index === target.length - 1 ? 0 : index + 1
                  const previousVertex = i === 0 ? [1, rn[1]] :
                  i === 1 ? [0, rn[1]] :
                  i === 2 ? [rn[0], 1] : [rn[0], 0]
                  if ( // 隣に同じ線分があったら、この線分の判定は無効
                    (ro[0] === rn[0] || ro[1] === rn[1]) &&
                    target[previousIndex][0] === previousVertex[0] &&
                    target[previousIndex][1] === previousVertex[1]
                  ) returnFlag = true
                  const cPreviousTilt = Math.atan2(
                    target[index][1] - target[previousIndex][1],
                    target[index][0] - target[previousIndex][0]) / Math.PI
                  const cNextTilt = Math.atan2(
                    target[nextIndex][1] - target[index][1],
                    target[nextIndex][0] - target[index][0]) / Math.PI
                  if (
                    target.length !== 2 && (
                    tilt === cPreviousTilt || previousTilt === cPreviousTilt ||
                    tilt === cNextTilt || previousTilt === cNextTilt)
                  ) vertexFlag = true
                }
              }
            })
            if (returnFlag) return
            const ox = player.x
            const oy = player.y
            const dx = player.dx
            const dy = player.dy
            const ax = x * size + ro[0] * size
            const ay = y * size + ro[1] * size
            const bx = x * size + rn[0] * size
            const by = y * size + rn[1] * size
            const abx = bx - ax
            const aby = by - ay
            let nx = -aby
            let ny = abx
            let length = (nx ** 2 + ny ** 2) ** .5
            if (0 < length) length = 1 / length
            nx *= length
            ny *= length
            if (!onetimeLandFlag) {
              const d = -(ax * nx + ay * ny)
              const tm = -(nx * (ox - landCondition.w / 2) + ny * (oy + landCondition.y) + d) / (
                nx * dx + ny * (dy + landCondition.h))
              const permisstionValue = -.1
              if (0 < tm && tm <= 1) {
                const cx = (ox - landCondition.w / 2) + dx * tm
                const cy = (oy + landCondition.y) + (dy + landCondition.h) * tm
                const acx = cx - ax
                const acy = cy - ay
                const bcx = cx - bx
                const bcy = cy - by
                const doc = acx * bcx + acy * bcy
                if (
                  doc <= 0 && (terrainObject[terrainIndex].length !== 2 ||
                  permisstionValue < player.dy)) onetimeLandFlag = true
              }
              const tp = -(nx * (ox + landCondition.w / 2) + ny * (oy + landCondition.y) + d) / (
                nx * dx + ny * (dy + landCondition.h))
              if (0 < tp && tp <= 1) {
                const cx = (ox + landCondition.w / 2) + dx * tp
                const cy = (oy + landCondition.y) + (dy + landCondition.h) * tp
                const acx = cx - ax
                const acy = cy - ay
                const bcx = cx - bx
                const bcy = cy - by
                const doc = acx * bcx + acy * bcy
                if (
                  doc <= 0 && (terrainObject[terrainIndex].length !== 2 ||
                  permisstionValue < player.dy)) onetimeLandFlag = true
              }
            }
            let nax = ax - nx * player.r
            let nay = ay - ny * player.r
            let nbx = bx - nx * player.r
            let nby = by - ny * player.r
            const d = -(nax * nx + nay * ny)
            const t = -(nx * ox + ny * oy + d) / (nx * dx + ny * dy)
            let detectFlag = false
            if (0 < t && t <= 1) {
              const cx = ox + dx * t
              const cy = oy + dy * t
              const acx = cx - nax
              const acy = cy - nay
              const bcx = cx - nbx
              const bcy = cy - nby
              const doc = acx * bcx + acy * bcy
              if (doc <= 0) {
                detectFlag = true
                tilt += tilt < .5 ? 1.5 : -.5
                // if (1 < tilt) onetimeLandFlag = true
              }
            }
            if (terrainObject[terrainIndex].length === 2 && (dy < 0 || i === 1)) return // temporary
            if (terrainObject[terrainIndex].length === 2) vertexFlag = true
            if (
              !detectFlag &&
              !vertexFlag &&
              (ax - (ox + dx)) ** 2 + (ay - (oy + dy)) ** 2 <= player.r ** 2
            ) {
              tilt = Math.atan2(oy - ay, ox - ax) / Math.PI
              // if (tilt < 0) onetimeLandFlag = true
              detectFlag = true
            }
            if (detectFlag) {
              collisionResponse(tilt)
              repeatFlag = true
            }
          })
        }
      }
    }
    mapObject[mapData.name].layersIndex.collision.forEach(v => collisionFn(v))
  } while(repeatFlag)
  player.x += player.dx
  player.y += player.dy
  if (maxLog.dx < Math.abs(player.dx)) maxLog.dx = Math.abs(player.dx)
  if (maxLog.dy < Math.abs(player.dy)) maxLog.dy = Math.abs(player.dy)
  player.landFlag = onetimeLandFlag
}
const update = () => {
  player.dy += gravitationalAcceleration * coefficient * intervalDiffTime
  frictionalForce = userFF
  const terminalVelocity = size
  if (terminalVelocity < player.dy) player.dy = terminalVelocity
  const floorThreshold = .01
  if (-floorThreshold < player.dx && player.dx < floorThreshold) player.dx = 0

  {
    if (player.grabFlag) player.dx = 0
    if (player.landFlag) {
      if (player.state === 'jump') player.state = 'idle' // landing
      {
        if (player.state === 'slide') {
          player.dx *= slideBrakeConstant
        }
        jump.flag = false
        jump.double = false
      }
    } else {
      if (0 < player.dy) player.state = 'jump'
      {
        jump.flag = true
        if (player.state !== 'slide') player.state = 'jump'
        const gameoverThreshold = size * 10
        if (mapData.h + gameoverThreshold < player.y) {
          player.x = mapData.checkPoint.x
          player.y = mapData.checkPoint.y
        }
      }
    }
    if (player.state === 'punch' && imageStat.punch.frame < imageStat.punch.time) {
      player.attackBox = player.direction === 'left' ? {
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
      player.state === 'kick' &&
      imageStat.kick.frame * 3 < imageStat.kick.time &&
      imageStat.kick.time < imageStat.kick.frame * 5
    ) {
      player.attackBox = player.direction === 'left' ? {
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
    } else player.attackBox = {x: 0, y: 0, w: 0, h: 0}
    if (0 < player.invincibleTimer) player.invincibleTimer -= 1
  }

  if (!menuFlag) {
    const turnProhibitionList = ['jump', 'crouch', 'punch', 'kick', 'damage']
    player.direction = ((
      keyMap.left.some(v => key[v].flag) &&
      keyMap.right.some(v => key[v].flag)) ||
      !player.landFlag ||
      turnProhibitionList.some(v => v === player.state)
      ) ? player.direction
    : keyMap.left.some(v => key[v].flag) ? 'left'
    : keyMap.right.some(v => key[v].flag) ? 'right'
    : player.direction
    if (!turnProhibitionList.some(v => v === player.state)) {
      if (
        keyMap.right.some(v => key[v].flag) && player.dx < dashConstant * brakeConstant
      ) player.state = 'turn'
      if (
        keyMap.left.some(v => key[v].flag) && -dashConstant * brakeConstant < player.dx
      ) player.state = 'turn'
      if (player.wallFlag && player.landFlag && player.state !== 'slide') player.state = 'push'
      if (
        keyMap.left.some(v => key[v].flag) && keyMap.right.some(v => key[v].flag)
      ) player.state = 'idle'
    }
  }

  const stateList = ['crouch', 'jump', 'turn', 'push', 'punch', 'kick', 'damage']
  if (!stateList.some(v => v === player.state)) {
    player.state = player.state === 'slide' && (player.dx < -3.5 || 3.5 < player.dx) ? 'slide' :
    player.dx === 0 ? 'idle' :
    isKey(keyMap.dash) ? 'run' : 'walk'
  }
  if (player.state === 'jump' || !player.landFlag) {
    const number = 3
    imageStat.jump.condition =
     number * 2 ** -1 < player.dy ? 7 :
     number * 2 ** -2 < player.dy ? 6 :
     number * 2 ** -3 < player.dy ? 5 :
                    0 < player.dy ? 4 :
    -number * 2 ** -3 < player.dy ? 3 :
    -number * 2 ** -2 < player.dy ? 2 :
    -number * 2 ** -1 < player.dy ? 1 :
    -number * 2 **  0 < player.dy ? 0 : 8
  }
  if (player.state === 'idle') {
    const i = imageStat[player.state]
    if ( // breath
      player.breathTimestamp + player.breathInterval / i.breathMax * (player.breathCount + 1) <=
      globalTimestamp
    ) {
      player.breathCount++
      if (i.breathMax <= player.breathCount) {
        player.breathCount = 0
        player.breathTimestamp = globalTimestamp
        if (player.breathInterval < playerData.breathMax) player.breathInterval += 1
      }
    }
    if (
      player.blinkTimestamp + player.blinkInterval +
      i.blinkAnimationInterval * player.blinkCount <=
      globalTimestamp
    ) { // eye blink
      player.blinkCount++
      if (i.blinkRotate.length <= player.blinkCount) {
        player.blinkCount = 0
        player.blinkInterval = Math.random() * i.blinkInterval
        player.blinkTimestamp = globalTimestamp
      }
    }
    i.condition = player.breathCount * i.blinkMax + i.blinkRotate[player.blinkCount]
    if (
      2 < i.condition && i.condition < 6 &&
      player.breathInterval < playerData.breathFatigue
    ) {
      const num = Math.random()
      const list = num < .9 ? {value: audio.misaki.punch.data, startTime: .3}
      : num < .95 ? {value: audio.misaki.jump.data, startTime: .3}
      : {value: audio.misaki.doubleJump.data, startTime: .33}
      playAudio(list.value, list.startTime)
    }
  } else if (player.state === 'walk' || player.state === 'run') {
    const i = imageStat[player.state]
    i.distance += Math.abs(player.dx)
    if (i.stride < i.distance) {
      i.distance -= i.stride
      i.condition++
    }
    if (image.misaki[player.state].data.length <= i.condition) {
      i.condition -= image.misaki[player.state].data.length
      if (player.midBreath < player.breathInterval) player.breathInterval -= 1
      else if (player.breathInterval < player.midBreath) player.breathInterval += 1
    }
  } else if (player.state === 'crouch') {
    const i = imageStat[player.state]
    const index = Math.floor(i.time / i.intervalTime)
    if (isKey(keyMap.down)) {
      if ((index < image.misaki.crouch.data.length - 1)) i.time += intervalDiffTime
    } else {
      i.time -= intervalDiffTime
      if (i.time <= 0) {
        i.time = 0
        player.state = 'idle'
      }
    }
    i.condition = index
  } else if (player.state === 'damage') {
    const i = imageStat[player.state]
    i.time += 1
    if (i.time % i.frame === 0) i.condition += 1
    if (i.condition === image.misaki[player.state].data.length) {
      i.condition -= image.misaki[player.state].data.length
      i.time = 0
      player.state = 'idle'
    }
  } else if (player.state === 'turn') {
    const i = imageStat[player.state]
    i.time += 1
    if (i.time % i.frame === 0) i.condition += 1
    if (i.condition === image.misaki[player.state].data.length) {
      i.condition -= image.misaki[player.state].data.length
      i.time = 0
      if (!menuFlag) {
        if (
          !(player.wallFlag && keyMap.left.some(v => key[v].flag) &&
          keyMap.right.some(v => key[v].flag))) player.state = 'walk'
      }
    }
  } else if (player.state === 'punch') {
    const i = imageStat[player.state]
    i.time += 1
    if (i.time % i.frame === 0) {
      i.condition += 1
      if (i.condition === i.audioTrigger) playAudio(audio.misaki[player.state].data)
    }
    if (i.condition === image.misaki[player.state].data.length) {
      i.time = 0
      i.condition -= image.misaki[player.state].data.length
      player.state = 'idle'
    }
  } else if (player.state === 'kick') {
    if (0 < imageStat.punch.time) imageStat.punch.time = 0
    const i = imageStat[player.state]
    i.time += 1
    if (i.time % i.frame === 0) {
      i.condition += 1
      if (i.condition === i.audioTrigger) playAudio(audio.misaki[player.state].data)
    }
    if (i.condition === image.misaki[player.state].data.length) {
      i.time = 0
      i.condition -= image.misaki[player.state].data.length
      player.state = 'idle'
    }
  }
  Object.keys(imageStat).forEach(v => {
    if (player.state !== v && v !== 'idle') imageStat[v].condition = 0
  })
  enemies.forEach(v => {
    if (v.type === 'enemy') {
      v.imageTimer += 1
      if (v.state === 'walk') {
        if (v.imageTimer % unityChanStat[v.state].frame === 0) {
          v.image += 1
          if (v.image === image.kohaku[v.state].data.length) {
            v.image -= image.kohaku[v.state].data.length
          }
          v.imageTimer = 0
        }
      } else if (v.state === 'damage') {
        if (v.invincibleTimer === 30) v.image = 0
        if (v.imageTimer % unityChanStat[v.state].frame === 0) {
          v.image += 1
          if (v.image === image.kohaku[v.state].data.length) {
            v.image -= image.kohaku[v.state].data.length
            v.state = 'walk'
          }
          v.imageTimer = 0
        }
      } else if (v.state === 'sword') {
        const u = unityChanStat[v.state]
        if (
          (
            v.imageTimer <= u.startUp * u.startUpLength &&
            v.imageTimer % u.startUp === 0) || (
            v.imageTimer <= u.startUp * u.startUpLength + u.active * u.activeLength &&
            v.imageTimer % u.active === 0) || (
            v.imageTimer <= u.startUp * u.startUpLength + u.active * u.activeLength + u.recovery * u.recoveryLength &&
            v.imageTimer % u.recovery === 0
          )
        ) {
          v.image += 1
          if (v.image === image.kohaku[v.state].data.length) {
            v.image -= image.kohaku[v.state].data.length
            v.state = 'idle'
          }
          v.imageTimer = 0
        }
      } else if (v.state === 'idle') {
        if (v.imageTimer % unityChanStat[v.state].frame === 0) {
          v.image += 1
          if (v.image === image.kohaku[v.state].data.length) {
            v.image -= image.kohaku[v.state].data.length
          }
          v.imageTimer = 0
        }
      }
    }
  })
}
const main = () => setInterval(() => {
  Object.entries(keyMap).forEach(([k, v]) => keyFirstFlagObject[k] = isKeyFirst(v))
  frameCounter(internalFrameList)
  intervalDiffTime = globalTimestamp - currentTime
  currentTime = globalTimestamp

  proposal()
  judgement()
  update()

  const titleProcess = () => {
    if (keyFirstFlagObject.attack) screenState = screenList[1]
  }
  const title = () => {
    if (!menuFlag) titleProcess()
  }
  // if (screenState === screenList[0]) title()
  // else if (screenState === screenList[1]) inGame()
  const floatMenu = () => {
    if (keyFirstFlagObject.option) {
      menuFlag = !menuFlag
      if (menuOpenTimestamp) {
        menuOpenTimestamp = 0
        menuCloseTimestamp = Date.now()
      } else {
        menuOpenTimestamp = Date.now()
        menuCloseTimestamp = 0
      }
    }
    if (!menuFlag && !menuGauge) return
    if (menuGauge < 0) {return menuFlag = false}
    if (menuFlag && menuGauge < menuGaugeMax &&
      menuGauge * (1 / 75) < Date.now() - menuOpenTimestamp) menuGauge += 1
    else if (
      !menuFlag &&
      menuGaugeMaxTime - menuGauge * (1 / 75) < Date.now() - menuCloseTimestamp
    ) menuGauge -= 1
    menuWidth = menuWidthMax * (menuGauge / menuGaugeMax)
    const config = () => {
      if (keyFirstFlagObject.down) {
        floatMenuCursor = floatMenuCursor === floatMenuCursorMax ? 0 : floatMenuCursor + 1
      }
      if (keyFirstFlagObject.up) {
        floatMenuCursor = floatMenuCursor === 0 ? floatMenuCursorMax : floatMenuCursor - 1
      }
      const k = Object.keys(settings.type)[floatMenuCursor]
      if ((
        keyFirstFlagObject.attack) || (
        keyFirstFlagObject.left) && settings.type[k] || (
        keyFirstFlagObject.right) && !settings.type[k]
      ) {
        settings.type[k] = setStorage(k, !settings.type[k])
        inputDOM[k].checked = !inputDOM[k].checked
      }
    }
    if (menuFlag) config()
  }
  // floatMenu()
  const musicProcess = () => {
    const setMusic = () => {
      return mapData.name === 'AthleticCourse' ? 'テレフォン・ダンス' : 'アオイセカイ'
    }
    if (
      currentPlay !== setMusic() ||
      !playFlag && Object.values(key).some(v => v.flag)
    ) {
      Object.keys(audio.music).forEach(v => audio.music[v].data.pause())
      if (!playFlag) playFlag = true
      currentPlay = setMusic()
      audio.music[currentPlay].data.currentTime = 0
      audio.music[currentPlay].data.play()
    }
    if (
      currentPlay === 'テレフォン・ダンス' &&
      32.74 < audio.music[currentPlay].data.currentTime
    ) audio.music[currentPlay].data.currentTime = 7.14 + 4 / 60 // 4 frame delay?
    else if (
      currentPlay === 'アオイセカイ' &&
      60 + 13 < audio.music[currentPlay].data.currentTime
    ) audio.music[currentPlay].data.currentTime = 73 - 112 * (2 / 3.3) + 4 / 60
  }
  // musicProcess()
}, 0)
const draw = () => {
  window.requestAnimationFrame(draw)
  frameCounter(animationFrameList)
  context.fillStyle = mapColor
  context.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
  mapObject[mapData.name].layersIndex.background.forEach(v => { // draw background
    const properties = mapObject[mapData.name].layers[v].properties
    // const offsetX = properties[properties.findIndex(vl => vl.name === 'offsetX')].value
    // offsetX === 'left'
    const direction = properties[properties.findIndex(vl => vl.name === 'direction')].value
    const offsetY = properties[properties.findIndex(vl => vl.name === 'offsetY')].value
    const scrollTimePerSize =
      properties[properties.findIndex(vl => vl.name === 'scrollTimePerSize')].value
    const image = imageObject[mapObject[mapData.name].layers[v].name]
    const resetWidthTime = scrollTimePerSize * image.width / size
    let ratio = scrollTimePerSize === 0 ? 1 : globalTimestamp % resetWidthTime / resetWidthTime
    if (direction === 'left') ratio = -ratio
    let offsety = mapObject[mapData.name].layers[v].offsety
    if (offsety === undefined) offsety = 0
    let imageOffsetY = 0
    if (offsetY === 'bottom') imageOffsetY = canvas.offsetHeight - image.height - offsety
    else if (offsetY === 'top') imageOffsetY = offsety
    for (let i = 0; i < Math.ceil(canvas.offsetWidth / image.width) + 1; i++) {
      context.drawImage(image, image.width * (i + ratio), imageOffsetY)
    }
  })
  const stageOffset = {x: 0, y: 0}
  const ratio = {x: canvas.offsetWidth / 3, y: canvas.offsetHeight / 3}
  stageOffset.x = player.x < ratio.x ? 0 :
  mapData.w - ratio.x < player.x ? mapData.w - canvas.offsetWidth : ((
    player.x - ratio.x) / (mapData.w - ratio.x * 2)) * (mapData.w - canvas.offsetWidth)
  stageOffset.y = player.y < ratio.y ? 0 :
  mapData.h - ratio.y < player.y ? mapData.h - canvas.offsetHeight : ((
    player.y - ratio.y) / (mapData.h - ratio.y * 2)) * (mapData.h - canvas.offsetHeight)
  mapObject[mapData.name].layersIndex.tileset.forEach(v => {
    let flag = false
    mapObject[mapData.name].layers[v].properties.forEach(vl => {
      if (vl.name === 'foreground') {
        flag = vl.value
      }
    })
    if (flag) return
    for (let x = 0; x < mapObject[mapData.name].layers[v].width; x++) {
      for (let y = 0; y < mapObject[mapData.name].layers[v].height; y++) {
        let id = mapObject[mapData.name].layers[v].data[mapObject[mapData.name].layers[v].width * y + x] - 1
        if (0 < id) {
          let flag = false
          Object.entries(mapObject[mapData.name].tilesetsIndex).forEach(([k, vl]) => {
            if (flag) return
            if (vl.tilecount < id) id -= vl.tilecount
            else {
              context.drawImage(
                imageObject[k],
                (id % mapObject[mapData.name].tilesetsIndex[k].columns) * size,
                (id - id % mapObject[mapData.name].tilesetsIndex[k].columns) /
                  mapObject[mapData.name].tilesetsIndex[k].columns * size,
                size, size, (x * size - stageOffset.x)|0, (y * size - stageOffset.y)|0, size, size)
              flag = true
            }
          })
        }
      }
    }
  })
  mapObject[mapData.name].layers[mapObject[
  mapData.name].layersIndex.objectgroup].objects.forEach(v => {
    if (v.name !== 'gate') return
    const oneRound = 5e3
    const ratio = (Math.sin(Math.PI * 2 * (globalTimestamp % oneRound / oneRound)) + 1) / 2
    context.fillStyle = `hsla(0, 0%, 50%, ${ratio / 4})`
    context.fillRect(
      v.x - stageOffset.x + player.r,
      v.y - stageOffset.y + player.r,
      v.width - player.r * 2,
      v.height - player.r * 2)
  })

  const imageOffset = {x: 64, y: 119}
  context.fillStyle = 'hsl(30, 100%, 50%)'
  if (false) enemies.forEach(v => {
    if (v.type === 'object') {
      context.fillRect(
        v.x + evlt(v.dx) - stageOffset.x|0, v.y + evlt(v.dy) - stageOffset.y|0, v.w|0, v.h|0
      )
    }
    if (v.type === 'enemy') {
      let ex = v.x - imageOffset.x - stageOffset.x
      const ey = v.y - imageOffset.y - stageOffset.y
      const img = image.kohaku[v.state].data[v.image]
      context.save()
      if (v.direction === 'left') {
        context.scale(-1, 1)
        ex = -ex - img.width
      }
      context.drawImage(img, ex|0, ey|0)
      context.restore()
    }
  })
  if (0 < timestamp.gate) {
    context.save()
    context.font = `italic ${size * 2}px sans-serif`
    const start = 1e3
    const end = 5e3
    const elapsedTime = globalTimestamp - timestamp.gate
    const alpha = start < elapsedTime ? (end - start - elapsedTime) / (end - start) : 1
    context.fillStyle = `hsla(0, 0%, 100%, ${alpha})`
    context.textAlign = 'center'
    context.fillText(mapData.name, canvas.offsetWidth / 2, canvas.offsetHeight / 6)
    context.strokeStyle = `hsla(0, 0%, 50%, ${alpha})`
    context.strokeText(mapData.name, canvas.offsetWidth / 2, canvas.offsetHeight / 6)
    context.restore()
    if (end < elapsedTime) timestamp.gate = 0
  }
  let x = player.x - imageOffset.x - stageOffset.x
  const img = image.misaki[player.state].data[imageStat[player.state].condition]
  context.save()
  if (player.direction === 'left') {
    context.scale(-1, 1)
    x = -x - img.width
  }
  context.drawImage(img, x|0, player.y - imageOffset.y - stageOffset.y|0)
  context.restore()
  mapObject[mapData.name].layersIndex.tileset.forEach(v => {
    let flag = false
    mapObject[mapData.name].layers[v].properties.forEach(vl => {
      if (vl.name === 'foreground') {
        flag = !vl.value
      }
    })
    if (flag) return
    for (let x = 0; x < mapObject[mapData.name].layers[v].width; x++) {
      for (let y = 0; y < mapObject[mapData.name].layers[v].height; y++) {
        let id = mapObject[mapData.name].layers[v].data[mapObject[mapData.name].layers[v].width * y + x] - 1
        if (0 < id) {
          let flag = false
          Object.entries(mapObject[mapData.name].tilesetsIndex).forEach(([k, vl]) => {
            if (flag) return
            if (vl.tilecount < id) id -= vl.tilecount
            else {
              context.drawImage(
                imageObject[k],
                (id % mapObject[mapData.name].tilesetsIndex[k].columns) * size,
                (id - id % mapObject[mapData.name].tilesetsIndex[k].columns) /
                  mapObject[mapData.name].tilesetsIndex[k].columns * size,
                size, size, (x * size - stageOffset.x)|0, (y * size - stageOffset.y)|0, size, size)
              flag = true
            }
          })
        }
      }
    }
  })
  if (settings.type.hitbox) {
    context.fillStyle = 'hsl(300, 50%, 50%)'
    context.strokeStyle = 'hsl(300, 50%, 50%)'
    mapObject[mapData.name].layersIndex.collision.forEach(value => {
      for (let x = 0; x < mapObject[mapData.name].layers[value].width; x++) {
        for (let y = 0; y < mapObject[mapData.name].layers[value].height; y++) {
          let id = mapObject[mapData.name].layers[value].data[y *
            mapObject[mapData.name].layers[value].width + x]
          if (0 < id) {
            for(let j = 0; j < mapObject[mapData.name].tilesets.length ; j++) {
              if (Object.keys(terrainObject).length < id) {
                id -= mapObject[mapData.name].tilesets[j].firstgid - 1
              } else break
            }
            const relativeCooldinates = {x: x * size - stageOffset.x, y: y * size - stageOffset.y}
            if (
              relativeCooldinates.x + size < 0 || canvas.offsetWidth < relativeCooldinates.x ||
              relativeCooldinates.y + size < 0 || canvas.offsetHeight < relativeCooldinates.y
            ) continue
            context.beginPath()
            terrainObject[id].forEach((v, i) => {
              const m = {x: 0, y: 0}
              if (terrainObject[id].length === 2) {
                m.x = v[0] === 0 ? 1 : v[0] === 1 ? -1 : 0
                m.y = v[1] === 0 ? 1 : v[1] === 1 ? -1 : 0
              }
              i === 0 ?
              context.moveTo(
                relativeCooldinates.x + v[0] * size + m.x|0,
                relativeCooldinates.y + v[1] * size + m.y|0) :
              context.lineTo(
                relativeCooldinates.x + v[0] * size + m.x|0,
                relativeCooldinates.y + v[1] * size + m.y|0)
            })
            if (terrainObject[id].length === 2) {
              context.closePath()
              context.stroke()
            } else context.fill()
          }
        }
      }
    })
    context.fillStyle = 'hsla(30, 100%, 50%, .5)'
    context.fillRect(
      player.x - stageOffset.x - landCondition.w / 2,
      player.y - stageOffset.y + landCondition.y,
      landCondition.w,
      landCondition.h)
    {
      context.strokeStyle = 'hsl(0, 100%, 50%)'
      context.beginPath()
      context.arc(player.x - stageOffset.x, player.y - stageOffset.y, player.r, 0 , Math.PI * 2)
      context.closePath()
      context.stroke()
      context.beginPath()
      context.moveTo(player.x - stageOffset.x, player.y - stageOffset.y)
      context.lineTo(
        player.x - stageOffset.x + size * player.dx,
        player.y - stageOffset.y + size * player.dy)
      context.closePath()
      context.save()
      context.lineWidth = size / 8
      context.stroke()
      context.restore()
    }

    context.fillStyle = 'hsla(300, 100%, 50%, .5)'
    context.fillRect(
      player.hitbox.x - stageOffset.x|0, player.hitbox.y - stageOffset.y|0,
      player.hitbox.w|0, player.hitbox.h|0
    )
    context.fillRect(
      player.attackBox.x - stageOffset.x, player.attackBox.y - stageOffset.y,
      player.attackBox.w, player.attackBox.h
    )
    enemies.forEach(v => {
      if (v.type === 'enemy') {
        if (v.invincibleTimer === 0) {
          context.fillStyle = 'hsla(30, 100%, 50%, .5)'
          context.fillRect(
            v.hitbox.x - stageOffset.x|0, v.hitbox.y - stageOffset.y|0,
            v.hitbox.w, v.hitbox.h
          )
        }
        context.fillStyle = 'hsla(0, 100%, 50%, .5)'
        context.fillRect(
          v.attackBox.x - stageOffset.x|0, v.attackBox.y - stageOffset.y|0,
          v.attackBox.w, v.attackBox.h
        )
      }
    })
  }
  if (settings.type.map) {
    const multiple = 2
    const mapSize = {x: canvas.offsetWidth / 5, y: canvas.offsetHeight / 5}
    const mapOffset = {x: canvas.offsetWidth - mapSize.x - size, y: size}
    context.fillStyle = 'hsla(0, 0%, 0%, .1)'
    context.fillRect(mapOffset.x|0, mapOffset.y|0, mapSize.x|0, mapSize.y|0)
    context.fillStyle = 'hsla(10, 100%, 50%, .4)'
    const playerSize = {x: 1, y: 3}
    context.fillRect(
      mapOffset.x + mapSize.x / 2|0, mapOffset.y + mapSize.y / 2 - multiple * playerSize.y|0,
      multiple * playerSize.x|0, multiple * playerSize.y|0
    )
    context.fillStyle = 'hsla(240, 100%, 50%, .4)'
    mapObject[mapData.name].layersIndex.tileset.forEach(v => {
      for (let x = 0; x < mapObject[mapData.name].layers[v].width; x++) {
        for (let y = 0; y < mapObject[mapData.name].layers[v].height; y++) {
          const X = multiple * (x * size - player.x) / size
          const Y = multiple * (y * size - player.y) / size
          if (
            -mapSize.x / 2 < Math.round(X) && X < mapSize.x / 2 - 1 &&
            -mapSize.y / 2 < Math.ceil(Y) && Y < mapSize.y / 2
          ) {
            let id = mapObject[mapData.name].layers[v
            ].data[mapObject[mapData.name].layers[v].width * y + x] - 1
            if (0 < id) {
              context.fillRect(
                mapOffset.x + mapSize.x / 2 + X|0,
                mapOffset.y + mapSize.y / 2 + Y|0,
                multiple|0, multiple|0)
            }
          }
        }
      }
    })

    mapObject[mapData.name].layers[mapObject[
    mapData.name].layersIndex.objectgroup].objects.forEach(v => { // gate process
      if (v !== 'gate') return
      const X = multiple * (v.x - player.x) / size + 1
      const Y = multiple * (v.y - player.y) / size
      if (
        -mapSize.x / 2 < Math.round(X) && X < mapSize.x / 2 - 1 &&
        -mapSize.y / 2 < Math.ceil(Y) && Y < mapSize.y / 2
      ) {
        context.fillStyle = 'hsla(0, 0%, 0%, .4)'
        context.fillRect(
          mapOffset.x + mapSize.x / 2 + X|0, mapOffset.y + mapSize.y / 2 + Y|0,
          multiple * v.width / size|0, multiple * v.height / size|0
        )
      }
    })
  }
  if (settings.type.status) {
    context.save()
    const offsetY = size * 8
    const list = [
      `internalFPS: ${internalFrameList.length - 1}`,
      `FPS: ${animationFrameList.length - 1}`,
      // `x: ${ownCondition.x}`,
      `x(m): ${Math.floor(player.x * .04)}`,
      // `y: ${ownCondition.y}`,
      `y(m): ${Math.floor((((
        mapObject[mapData.name].layers[mapObject[
        mapData.name].layersIndex.tileset[0]].height - 2) * size) -
        player.y) * .04)}`,
      `dx: ${maxLog.dx.toFixed(2)} ${player.dx.toFixed(2)}`,
      `dy: ${maxLog.dy.toFixed(2)} ${player.dy.toFixed(2)}`,
      `landFlag: ${player.landFlag}`,
      `[${keyMap.gravity}]gravity: ${gravityFlag}`,
      `[${keyMap.subElasticModulus}: -, ${keyMap.addElasticModulus}: +]` +
      `elasticModulus: ${elasticModulus}`,
      `[${keyMap.subFrictionalForce}: -, ${
        keyMap.addFrictionalForce}: +]` +
      `frictionalForce: ${userFF}`,
      `stamina: ${player.breathInterval}`,
      `slide cooltime: ${cooltime.slide}`,
      `jump flag: ${jump.flag}`,
      `double jump: ${!jump.double}`,
      `player state: ${player.state}`,
    ]
    context.fillStyle = 'hsla(0, 50%, 100%, .5)'
    const fontsize = 10
    context.fillRect(
      canvas.offsetWidth * .8 - size / 2, offsetY, size * 10, fontsize * (list.length + 1))
    context.fillStyle = 'hsl(0, 0%, 0%)'
    list.forEach((v, i) => {
      context.fillText(v, canvas.offsetWidth * .8, offsetY + fontsize * (1 + i))
    })
    context.restore()
  }
  const drawTitle = () => {
    context.fillStyle = 'hsl(0, 0%, 0%)'
    context.font = `${size * 4}px sans-serif`
    context.textAlign = 'center'
    const ow = -menuWidth / 2
    context.fillText('Title', canvas.offsetWidth / 2 + ow, canvas.offsetHeight / 2)
    context.font = `${size * 2}px sans-serif`
    context.fillText(
      `Press '${keyMap.attack[0].toUpperCase()}' to Start`,
      canvas.offsetWidth / 2 - menuWidth / 2, canvas.offsetHeight * 3 / 4)
    Object.entries(keyMap).forEach(([k, v], i) => {
      context.fillText(
        k, canvas.offsetWidth * 3 / 4 + ow, canvas.offsetHeight * 1 / 4 + i * size * 2)
      context.fillText(
        v, canvas.offsetWidth * 3 / 4 + size * 8 + ow,
        canvas.offsetHeight * 1 / 4 + i * size * 2)
    })
  }
  // if (screenState === screenList[0]) drawTitle()
  // else if (screenState === screenList[1]) drawInGame()
  const drawFloatMenu = () => {
    context.save()
    context.fillStyle = 'hsl(0, 0%, 25%)'
    const ox = canvas.offsetWidth - menuWidth
    context.fillRect( // BG
      ox, 0, canvas.offsetWidth, canvas.offsetHeight)
    context.font = `${size * 2}px sans-serif`
    context.fillStyle = 'hsl(0, 0%, 100%)'
    context.textAlign = 'left'
    Object.entries(settings.type).forEach(([k, v], i) => {
      context.fillText(k, ox + size * 2, size * 4 + i * size * 2)
      context.fillText(v, ox + size * 10, size * 4 + i * size * 2)
    })
    context.fillText('[', ox + size, size * 4 + floatMenuCursor * size * 2)
    context.fillText(']', ox + size * 15, size * 4 + floatMenuCursor * size * 2)
    context.restore()
  }
  // drawFloatMenu()
}
let loadedFlag = false
const loadingScreen = () => {
  if (!loadedFlag) window.requestAnimationFrame(loadingScreen)
  // context.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
  const offset = {x: canvas.offsetWidth / 2, y: canvas.offsetHeight / 2}
  const a = size * 10
  const polygon = 3
  const divide = 1
  context.beginPath()
  for (let i = 0; i < polygon; i++) {
    const x =
    offset.x + Math.cos(Math.PI * globalTimestamp / divide + Math.PI * i / polygon * 2) * a
    const y =
    offset.y + Math.sin(Math.PI * globalTimestamp / divide + Math.PI * i / polygon * 2) * a
    i === 0 ? context.moveTo(x, y) : context.lineTo(x, y)
  }
  context.closePath()
  context.stroke()
}
loadingScreen()
Promise.all(resourceList).then(() => {
  loadedFlag = true
  volumeController()
  setMapProcess(mapData.name)
  console.log(mapObject)
  main()
  draw()
})