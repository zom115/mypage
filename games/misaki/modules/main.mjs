import {key, globalTimestamp} from '../../../modules/key.mjs'
import {mapLoader} from '../../../modules/mapLoader.mjs'
import {imageLoader} from '../../../modules/imageLoader.mjs'
import {audioLoader} from '../../../modules/audioLoader.mjs'

const PI = Math.PI

const keyMap = {
  up: ['w'],
  right: ['d'],
  down: ['s'],
  left: ['a'],
  crouch: ['c'],
  jump: ['i', 'l', ' '],
  attack: ['k'],
  dash: ['j'],
  option: ['n'],
  subElasticModulus: ['y'],
  addElasticModulus: ['u'],
  subFrictionalForce: ['o'],
  addFrictionalForce: ['p'],
  gravity: ['g'],
  DECO: ['e'], // temporary
  status: ['t'],
  hitbox: ['h'],
  map: ['m'],
  reset: ['r'],
  skin: ['q'],
  pushEnemy: ['z'], // temporary
}
const isKeyFirst = list => {
  return list.some(v => key[v].holdtime !== 0 && key[v].holdtime <= intervalDiffTime)
} // 今押したか
const isKey = list => {return list.some(v => key[v].flag)} // 押しているか
const keyHoldTime = list => { // どのくらい押しているか
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
        orgRound(v[0] * Math.cos(PI / 2) - v[1] * Math.sin(PI / 2), 10),
        orgRound(v[0] * Math.sin(PI / 2) + v[1] * Math.cos(PI / 2), 10),]
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
const mapData = {}
const imageObject = {}
const audioObject = {}
let directoryList = [
  'map_battleField',
  'map_GothicVaniaTown',
  'map_MagicCliffsArtwork',
]
let mapColor = 'rgb(127, 127, 127)'

document.getElementsByTagName`audio`[0].volume = .1
const canvas = document.getElementById`canvas`
const context = canvas.getContext`2d`
const setStorage = (key, value, firstFlag = false) => {
  const exists = localStorage.getItem(key)
  if (firstFlag && exists) return JSON.parse(exists)
  localStorage.setItem(key, value)
  return value
}
let settings = { // initial value
  volume: {
    master: setStorage('master', .5, true),
    music : setStorage('music' ,.02, true),
    se    : setStorage('se'    , .1, true),
    voice : setStorage('voice' , .1, true),
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
      mapData[directory] = mapInfoObject
      resolve()
    })
  })
}
directoryList.forEach(v => {resourceList.push(getMapData(v))})
const image = {}
{
  let imageSource = {
    /*
    misaki: {
      idle: {
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
        src: [
          'images/Misaki/Misaki_Walk_1.png',
          'images/Misaki/Misaki_Walk_2.png',
          'images/Misaki/Misaki_Walk_3.png',
          'images/Misaki/Misaki_Walk_4.png',
          'images/Misaki/Misaki_Walk_5.png',
          'images/Misaki/Misaki_Walk_6.png',
        ],
      }, turn : {
        src: [
          'images/Misaki/Misaki_Turn_3.png',
          'images/Misaki/Misaki_Turn_2.png',
        ],
      }, run : {
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
        src: [
          'images/Misaki/Misaki_Crouch_1.png',
          'images/Misaki/Misaki_Crouch_2.png',
          'images/Misaki/Misaki_Crouch_3.png',
        ],
      }, jump : {
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
        src: ['images/Misaki/Misaki_Slide_1.png'],
      }, push : {
        src: ['images/Misaki/Misaki_Push_1.png'],
      }, handgun: {
        startup: {
          src: [
            'images/Unitychan/Attack/Unitychan_Hundgun1_2.png', // hand
            'images/Unitychan/Attack/Unitychan_Hundgun1_3.png',
            'images/Unitychan/Attack/Unitychan_Hundgun1_4.png',
          ]
        },
        // active: {
        //   src: [
        //   ]
        // },
        recovery: {
          src: [
            'images/Unitychan/Attack/Unitychan_Hundgun2_5.png',
            'images/Unitychan/Attack/Unitychan_Hundgun2_6.png',
          ]
        },
      }, handgun2: {
        startup: {
          src: [
            'images/Unitychan/Attack/Unitychan_Hundgun2_7.png',
          ]
        },
        // active: {
        //   src: [
        //   ]
        // },
        recovery: {
          src: [
            'images/Unitychan/Attack/Unitychan_Hundgun2_7.png',
            'images/Unitychan/Attack/Unitychan_Hundgun2_8.png',
            'images/Unitychan/Attack/Unitychan_Hundgun2_9.png',
            'images/Unitychan/Attack/Unitychan_Hundgun1_4.png',
            'images/Unitychan/Attack/Unitychan_Hundgun1_3.png',
            'images/Unitychan/Attack/Unitychan_Hundgun1_2.png',
          ]
        },
      }, kick : {
        startup: {
          src: [
            'images/Misaki/Misaki_Kick_1.png',
            'images/Misaki/Misaki_Kick_2.png',
            'images/Misaki/Misaki_Kick_3.png',
          ]
        },
        active: {
          src: [
            'images/Misaki/Misaki_Kick_4.png',
          ]
        },
        recovery: {
          src: [
            'images/Misaki/Misaki_Kick_5.png',
            'images/Misaki/Misaki_Kick_6.png',
            'images/Misaki/Misaki_Kick_2.png',
            'images/Misaki/Misaki_Kick_1.png',
          ]
        },
      }, damage: {
        src: [
          'images/Misaki/Misaki_Damage_1.png',
          'images/Misaki/Misaki_Damage_2.png',
          'images/Misaki/Misaki_Damage_3.png',
          'images/Misaki/Misaki_Damage_4.png',
        ],
      }, down : {
        src: [
          'images/Misaki/Misaki_Damage_down_1.png',
          'images/Misaki/Misaki_Damage_down_2.png',
          'images/Misaki/Misaki_Damage_down_3.png',
          'images/Misaki/Misaki_Damage_down_4.png',
        ],
      }, return: {
        src: [
          'images/Misaki/Misaki_Damage_return_1.png',
          'images/Misaki/Misaki_Damage_return_2.png',
          'images/Misaki/Misaki_Damage_return_3.png',
        ],
      },
    }, */
    kohaku: {
      idle: {
        startup: [
          'images/Unitychan/BasicActions/Unitychan_Idle_1.png',
          'images/Unitychan/BasicActions/Unitychan_Idle_1.png',
          'images/Unitychan/BasicActions/Unitychan_Idle_1.png',
          'images/Unitychan/BasicActions/Unitychan_Idle_2.png',
          'images/Unitychan/BasicActions/Unitychan_Idle_2.png',
          'images/Unitychan/BasicActions/Unitychan_Idle_2.png',
          'images/Unitychan/BasicActions/Unitychan_Idle_3.png',
          'images/Unitychan/BasicActions/Unitychan_Idle_3.png',
          'images/Unitychan/BasicActions/Unitychan_Idle_3.png',
          'images/Unitychan/BasicActions/Unitychan_Idle_4.png',
          'images/Unitychan/BasicActions/Unitychan_Idle_4.png',
          'images/Unitychan/BasicActions/Unitychan_Idle_4.png',
        ],
      }, walk  : {
        startup: [
          'images/Unitychan/BasicActions/Unitychan_Walk_1.png',
          'images/Unitychan/BasicActions/Unitychan_Walk_2.png',
          'images/Unitychan/BasicActions/Unitychan_Walk_3.png',
          'images/Unitychan/BasicActions/Unitychan_Walk_4.png',
          'images/Unitychan/BasicActions/Unitychan_Walk_5.png',
          'images/Unitychan/BasicActions/Unitychan_Walk_6.png',
        ],
      }, damage: {
        startup: [
          'images/Unitychan/BasicActions/Unitychan_Damage_2.png',
          'images/Unitychan/BasicActions/Unitychan_Damage_3.png',
        ],
      }, down : {
        startup: [
          'images/Unitychan/BasicActions/Unitychan_Damage_4.png',
          'images/Unitychan/BasicActions/Unitychan_Damage_5.png',
          'images/Unitychan/BasicActions/Unitychan_Damage_6.png',
          'images/Unitychan/BasicActions/Unitychan_Damage_7.png',
          'images/Unitychan/BasicActions/Unitychan_Damage_8.png',
          'images/Unitychan/BasicActions/Unitychan_Damage_9.png',
          'images/Unitychan/BasicActions/Unitychan_Damage_10.png',
          'images/Unitychan/BasicActions/Unitychan_Damage_11.png',
        ],
      }, return: {
        startup: [
          'images/Unitychan/BasicActions/Unitychan_Damage_12.png',
          'images/Unitychan/BasicActions/Unitychan_Damage_13.png',
          'images/Unitychan/BasicActions/Unitychan_Damage_14.png',
          'images/Unitychan/BasicActions/Unitychan_Damage_15.png',
          'images/Unitychan/BasicActions/Unitychan_Damage_16.png',
          'images/Unitychan/BasicActions/Unitychan_Damage_17.png',
          'images/Unitychan/BasicActions/Unitychan_Damage_18.png',
          'images/Unitychan/BasicActions/Unitychan_Damage_19.png',
        ],
      }, run: {
        startup: [
          'images/Unitychan/BasicActions/Unitychan_Run_1.png',
          'images/Unitychan/BasicActions/Unitychan_Run_2.png',
          'images/Unitychan/BasicActions/Unitychan_Run_3.png',
          'images/Unitychan/BasicActions/Unitychan_Run_4.png',
          'images/Unitychan/BasicActions/Unitychan_Run_5.png',
          'images/Unitychan/BasicActions/Unitychan_Run_6.png',
          'images/Unitychan/BasicActions/Unitychan_Run_7.png',
          'images/Unitychan/BasicActions/Unitychan_Run_8.png',
        ],
      }, crouch: {
        startup: [
          'images/Unitychan/BasicActions/Unitychan_Crouch_2.png',
          'images/Unitychan/BasicActions/Unitychan_Crouch_3.png',
          'images/Unitychan/BasicActions/Unitychan_Crouch_4.png',
          'images/Unitychan/BasicActions/Unitychan_Crouch_5.png',
        ],
      }, turn: {
        startup: [
          'images/Unitychan/BasicActions/Unitychan_Brake_2.png',
          'images/Unitychan/BasicActions/Unitychan_Brake_3.png',
          'images/Unitychan/BasicActions/Unitychan_Brake_8.png',
          'images/Unitychan/BasicActions/Unitychan_Brake_9.png',
          'images/Unitychan/BasicActions/Unitychan_Brake_10.png',
          'images/Unitychan/BasicActions/Unitychan_Brake_11.png',
          'images/Unitychan/BasicActions/Unitychan_Brake_12.png',
        ],
        active: [
          'images/Unitychan/Brake_13_reverse.png',
          'images/Unitychan/Brake_14_reverse.png',
          'images/Unitychan/Brake_15_reverse.png',
        ],
      }, jump: {
        startup: [
          'images/Unitychan/BasicActions/Unitychan_Jump_Landing.png',
        ], active: [
          'images/Unitychan/Jump_Up_1.png',
          'images/Unitychan/Jump_Up_2.png',
          'images/Unitychan/Jump_MidAir_1.png',
          'images/Unitychan/Jump_MidAir_2.png',
          'images/Unitychan/Jump_MidAir_3.png',
          'images/Unitychan/Jump_Fall_1.png',
          'images/Unitychan/Jump_Fall_2.png',
        ], fall: [
          'images/Unitychan/Jump_Fall_1.png',
          'images/Unitychan/Jump_Fall_2.png',
        ], recovery: [
          'images/Unitychan/BasicActions/Unitychan_Jump_Landing.png',
        ],
      }, doubleJump: {
        startup: [
          'images/Unitychan/BasicActions/Unitychan_Jump_Landing.png',
        ], active: [
          'images/Unitychan/Jump_Up_1.png',
          'images/Unitychan/Jump_Up_2.png',
          'images/Unitychan/Jump_MidAir_1.png',
          'images/Unitychan/Jump_MidAir_2.png',
          'images/Unitychan/Jump_MidAir_3.png',
          'images/Unitychan/Jump_Fall_1.png',
          'images/Unitychan/Jump_Fall_2.png',
        ], fall: [
          'images/Unitychan/Jump_Fall_1.png',
          'images/Unitychan/Jump_Fall_2.png',
        ], recovery: [
          'images/Unitychan/BasicActions/Unitychan_Jump_Landing.png',
        ],
      }, push: {
        startup: [
          'images/Unitychan/BasicActions/Unitychan_Damage_19.png',
        ],
      }, handgun: {
        startup: [
          'images/Unitychan/Attack/Unitychan_Hundgun1_2.png', // hand
          'images/Unitychan/Attack/Unitychan_Hundgun1_3.png',
          'images/Unitychan/Attack/Unitychan_Hundgun1_4.png',
        ],
        recovery: [
          'images/Unitychan/Attack/Unitychan_Hundgun2_5.png',
          'images/Unitychan/Attack/Unitychan_Hundgun2_6.png',
        ],
      }, handgun2: {
        startup: [
          'images/Unitychan/Attack/Unitychan_Hundgun2_7.png',
        ], recovery: [
          'images/Unitychan/Attack/Unitychan_Hundgun2_7.png',
          'images/Unitychan/Attack/Unitychan_Hundgun2_8.png',
          'images/Unitychan/Attack/Unitychan_Hundgun2_9.png',
          'images/Unitychan/Attack/Unitychan_Hundgun1_4.png',
          'images/Unitychan/Attack/Unitychan_Hundgun1_3.png',
          'images/Unitychan/Attack/Unitychan_Hundgun1_2.png',
        ],
      }, sword: {
        startup: [
          'images/Unitychan/Attack/Unitychan_Soard_Combo_2.png',
          'images/Unitychan/Attack/Unitychan_Soard_Combo_3.png',
          'images/Unitychan/Attack/Unitychan_Soard_Combo_4.png',
        ], active: [
          'images/Unitychan/Attack/Unitychan_Soard_Combo_5.png',
        ], recovery: [
          'images/Unitychan/Attack/Unitychan_Soard_Combo_6.png',
          'images/Unitychan/Attack/Unitychan_Soard_Combo_7.png',
          'images/Unitychan/Attack/Unitychan_Soard_Combo_3.png',
          'images/Unitychan/Attack/Unitychan_Soard_Combo_2.png',
        ],
      }, slide: {
        active: [
          'images/Unitychan/BasicActions/Unitychan_Brake_2.png',
          'images/Unitychan/BasicActions/Unitychan_Brake_3.png',
        ],
      },
    }, slimeA: {
      idle: {
        startup: [
          'images/monster/slimeA_idle0.png',
          'images/monster/slimeA_idle1.png',
          'images/monster/slimeA_idle2.png',
          'images/monster/slimeA_idle1.png',
        ],
      }, damage: {
        startup: [
          'images/monster/slimeA_damage1.png',
          'images/monster/slimeA_damage0.png',
          'images/monster/slimeA_damage1.png',
        ],
        recovery: [
          'images/monster/slimeA_damage2.png',
        ],
      }, attack: {
        startup: [
          'images/monster/slimeA_attack0.png',
          'images/monster/slimeA_attack1.png',
        ],
        active: [
          'images/monster/slimeA_attack2.png',
        ],
        recovery: [
          'images/monster/slimeA_attack3.png',
          'images/monster/slimeA_attack4.png',
        ],
      }, move: {
        startup: [
          'images/monster/slimeA_move0.png',
          'images/monster/slimeA_move1.png',
          'images/monster/slimeA_move2.png',
          'images/monster/slimeA_move3.png',
        ],
      },
    },
  }
  const imageListLoader = (obj, img) => {
    return new Promise(resolve => {
      let resource = []
      obj.forEach((v, i) => resource.push(imageLoader(i, v)))
      Promise.all(resource).then(result => {
        const object = {}
        result.forEach(v => {object[Object.keys(v)[0]] = Object.values(v)[0]})
        for (let i = 0; i < result.length; i++) {
          img.push(object[i])
          if (i === result.length - 1) resolve()
        }
      })
    })
  }
  Object.keys(imageSource).forEach(v => {
    image[v] = {}
    Object.keys(imageSource[v]).forEach(vl => {
      image[v][vl] = {}
      Object.keys(imageSource[v][vl]).forEach(val => {
        image[v][vl][val] = []
        resourceList.push(imageListLoader(imageSource[v][vl][val], image[v][vl][val]))
      })
    })
  })
  imageSource = null
}
const audio = {
  misaki: {
    jump : {
      src: 'audio/Misaki/V2001.wav',
    }, doubleJump: {
      src: 'audio/Misaki/V2002.wav',
    }, handgun : {
      src: 'audio/Misaki/V2005.wav',
    }, handgun2 : {
      src: 'audio/Misaki/V2005.wav',
    }, kick : {
      src: 'audio/Misaki/V2006.wav',
    }, win : {
      src: 'audio/Misaki/V2024.wav',
    },
  }, kohaku: {
    jump : {
      src: 'audio/Kohaku/V0001.wav',
    }, doubleJump: {
      src: 'audio/Kohaku/V0002.wav',
    }, sword : {
      src: 'audio/Kohaku/V0006.wav',
    }, win : {
      src: 'audio/Kohaku/V0024.wav',
    },
  }, music: {
    'テレフォン・ダンス': {
      src: 'audio/music/nc109026.wav',
    }, 'アオイセカイ': {
      src: 'audio/music/nc110060.mp3',
    },
  }, se: {
    shot: {
      src: 'audio/se/handgun-firing1.mp3',
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
const voiceVolumeHandle = voice => {
  voice.volume = settings.volume.master * settings.volume.voice
}
const musicVolumeHandle = music => {
  music.volume = settings.volume.master * settings.volume.music
}
const seVolumeHandle = music => {
  music.volume = settings.volume.master * settings.volume.se
}
const volumeControll = () => {
  Object.keys(audio).forEach(v => {
    Object.keys(audio[v]).forEach(vl => {
      if (v === 'music') musicVolumeHandle(audio[v][vl].data)
      else if (v === 'se') seVolumeHandle(audio[v][vl].data)
      else voiceVolumeHandle(audio[v][vl].data)
    })
  })
}
const audioTableElement = document.getElementById`audio`
Object.keys(settings.volume).forEach(v => {
  const tr = document.createElement`tr`
  audioTableElement.appendChild(tr)
  const labelTd = document.createElement`td`
  tr.appendChild(labelTd)
  labelTd.textContent = v
  const inputTd = document.createElement`td`
  tr.appendChild(inputTd)
  const input = document.createElement`input`
  inputTd.appendChild(input)
  input.id = `${v}Input`
  input.type = 'range'
  input.min = 0
  input.max = 1
  input.step = .01
  input.value = settings.volume[v]
  const output = document.createElement`td`
  output.style.minWidth = '2rem'
  tr.appendChild(output)
  output.textContent = settings.volume[v] * 100|0
  input.addEventListener('input', e => {
    output.textContent = e.target.value * 100|0
    settings.volume[v] = setStorage(v, e.target.value, false)
    volumeControll()
  })
})
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
let field = {name: directoryList[0], w: 0, h: 0, checkPoint: {x: 0, y: 0}}
const timestamp = {
  gate: 0,
}

const setStartPosition = arg => {
  arg.layersIndex.objectgroup.forEach(v => {
    const index = arg.layers[v].objects.findIndex(vl => {
      return vl.name === 'playerPosition'
    })
    if (index !== -1) {
      const playerPosition = arg.layers[v].objects[index]
      player.x = field.checkPoint.x = playerPosition.x
      player.y = field.checkPoint.y = playerPosition.y
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
      if (Object.keys(audioObject).includes(field.name)) {
        audioObject[field.name].currentTime = 0
        audioObject[field.name].play()
      } else {
        audioLoader(field.name, path).then(result => {
          musicVolumeHandle(Object.values(result)[0])
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
  field.name = arg
  field.w = mapData[arg].tilewidth * mapData[arg].width
  field.h = mapData[arg].tileheight * mapData[arg].height
  setStartPosition(mapData[arg])
  getColor(mapData[arg])
  // getMusic(mapObject[arg])
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

const gravitationalAcceleration = 9.80665 * 1000 / 25 / 1000 ** 2
let elasticModulus = 0 // 0 to 1
const wallFF = 0
let userFF = .1
let frictionalForce = userFF // 0 to 1
const slideFF = .02
const playerData = {
  breath: {
    min    : 1e3,
    fatigue: 2e3,
    mid    : 3e3,
    max    : 5e3,
  }, stride: {
    walk: 14, // in rearistic, stride = 7
    run : 20, // in rearistic, stride = 10
  }, image: {
    idle  : {
      blinkAnimationInterval: 15,
      blinkInterval         : 5e3,
      blinkMax              : 3,
      blinkRotate           : [0, 1, 2, 1],
      breathCount           : 0,
      breathInterval        : 30,
      breathMax             : 4,
      breathTimestamp       : globalTimestamp,
    }, crouch: {intervalTime: 50},
    push  : {},
    damage: {time: 0, frame: 7, audioTrigger: 0},
    turn  : {
      startupTime : 20 * 1000 / 60,
      activeTime  : 10 * 1000 / 60,
      recoveryTime: 0,
    }, jump : {
      startupTime : 0,
      activeTime  : 36 * 1000 / 60,
      recoveryTime: 4 * 1000 / 60,
    }, doubleJump : {
      startupTime : 0,
      activeTime  : 36 * 1000 / 60,
      recoveryTime: 4 * 1000 / 60,
    }, slide : {
      startupTime : 0,
      activeTime  : 36 * 1000 / 60,
      recoveryTime: 0,
    }, handgun : {
      startupTime : 16 * 1000 / 60,
      activeTime  : 0,
      recoveryTime: 100,
      nextState: 'handgun2',
    }, handgun2 : {
      startupTime : 0,
      activeTime  : 0,
      recoveryTime: 38 * 1000 / 60,
    }, sword : {
      startupTime : 7 * 1000 / 60,
      activeTime  : 5 * 1000 / 60,
      recoveryTime: 21 * 1000 / 60,
    },
  },
}
let player = {
  x: 0,
  y: 0,
  dx: 0,
  dy: 0,
  r: size / 2 * .9,
  skin: 'kohaku',
  state: 'idle',
  attackState: 'startup',
  motionFirstFlag: false,
  attackElapsedTime: 0,
  imageIndex: 0,
  direction: 'right',
  descentFlag: false,
  landFlag: false,
  fallFlag: false,
  doubleJumpFlag: false,
  grabFlag: false,
  wallFlag: false,
  fallTime: 0,
  hitCircleList: [
    {x: 0, y: -size * 1.5, r: size / 2,},
    {x: 0, y: -size *  .5, r: size / 2,},
  ],
  attackCircleList: [],
  invincibleTimer: 0,
  blinkCount: 0,
  blinkInterval: 0,
  blinkTimestamp: globalTimestamp,
  breathCount: 0,
  breathInterval: playerData.breath.mid,
  breathTimestamp: globalTimestamp,
  movingDistance: 0,
  crouchTime: 0,
}

const landCondition = {y: size / 4, w: size * .6, h: size / 3,}
const normalConstant = .001 // 1 dot = 4 cm, 1 m = 25 dot
const dashConstant = .004
let moveAcceleration = normalConstant
const floorThreshold = .001
const walkThreshold = .1
const runThreshold = .3
const dashThreshold = 1 / 5
const jumpConstant = -.2
let gravityFlag = true // temporary
const maxLog = {
  dx: 0,
  dy: 0,
}
const enemies = []
const enemyData = {
  slimeA: {
    idle: {
      startup : 3e3,
      active  : 0,
      recovery: 0,
    }, damage: {
      startup : 200,
      active  : 0,
      recovery: 500,
    }, attack: {
      startup : 0,
      active  : 0,
      recovery: 0,
    }, move: {
      startup : 0,
      active  : 0,
      recovery: 0,
    },
  },
}
const setEnemy = () => {
  return {
    x: size * 3,
    y: size * 20,
    r: size,
    dx: 0,
    dy: 0,
    landFlag: false,
    descentFlag: false,
    wallFlag: false,
    skin: 'slimeA',
    state: 'idle',
    beforeState: 'idle',
    attackState: 'startup',
    direction: 'right',
    imageIndex: 0,
    imageOffset: {x: 24, y: 28},
    invincibleTimer: 0,
    hitCircleList: [{x: 0, y: 0, r: size,},],
    attackCircleList: [],
    elapsedTime: 0,
    breathTime: 0,
  }
}
enemies.push(setEnemy())

const effectData = {lifetime: 500}
const effectList = []
const setEffect = (x, y, text) => {
  return {
    x: x + size * (Math.random() * .5 - .25),
    y: y + size * (Math.random() * .5 - .5),
    text: text,
    lifetime: effectData.lifetime,
    d: -(Math.random() * .5 + .25) * PI,
  }
}

let cooltime = {
  step: 0,
  stepLimit: 15 * 1000 / 60,
  stepDeferment: 15 * 1000 / 60,
  aerialStep: 0,
  aerialStepLimit: 10 * 1000 / 60,
  slide: 2,
  slideLimit: 45 * 1000 / 60,
}

let floatMenuCursor = 0
const floatMenuCursorMax = 3

const soundEfffectObject = {
  kohaku: {
    handgun   : audio.se.shot,
    handgun2  : audio.se.shot,
    sword     : audio.kohaku.sword,
  },
}
const motionList = ['turn', 'slide', 'jump', 'doubleJump', 'sword', 'handgun', 'handgun2']
const actionInitObject = {
  jump: () => {
    const jumpCoefficient = 5
    player.dy = jumpConstant * (1 + Math.abs(player.dx) / jumpCoefficient) ** .5 // temporary
    player.dx /= Math.SQRT2
    if (player.doubleJumpFlag) playAudio(audio[player.skin].doubleJump.data)
    else playAudio(audio[player.skin][player.state].data)

    cooltime.aerialStep = 0 // temporary
  }, slide: () => {
    const boostConstant = .4
    const slideSpeed = player.dx < 0 ? -boostConstant : boostConstant
    player.dx += slideSpeed
    cooltime.slide = cooltime.slideLimit
  },
  turn: () => {
    if (
      (player.direction === 'left' && floorThreshold < player.dx) ||
      (player.direction === 'right' && player.dx < -floorThreshold)
    ) {
      player.direction = player.direction === 'left' ? 'right' : 'left'
    } else player.attackState = 'recovery'
  },
}
const uniqueActionObject = {
  jump: () => {
    player.attackElapsedTime = 0
    // cancel
    if (!settings.type.DECO && !isKey(keyMap.jump) && !player.fallFlag && player.dy < 0) {
      player.fallFlag = true
      player.dy /= 2
    }

    if (player.landFlag && 0 < player.dy) {
      player.fallFlag = false
      player.attackState = 'recovery'
      player.attackElapsedTime = intervalDiffTime
      player.doubleJumpFlag = false
    }
  },
  slide: () => {player.attackElapsedTime = 0},
}
const commonCondition = i => {
  if (i.activeTime <= player.attackElapsedTime) {
    player.attackState = 'recovery'
    player.attackElapsedTime -= i.activeTime
  }
}
const recoveryCondition = {
  turn    : i  => {commonCondition(i)},
  handgun : i  => {commonCondition(i)},
  handgun2: i  => {commonCondition(i)},
  sword   : i  => {commonCondition(i)},
  slide   : () => {
    if (Math.abs(player.dx) < walkThreshold) player.attackState = 'recovery'
  },
}
const attackCircleObject = {
  handgun: {
    x: size * 1.5,
    y: -size * 1.75,
    r: size * .25,
    a: 0,
    d: 7.5, // 7.5 = 300 m / s
    gravity: true,
    lifetime: 1000,
    damage: 1,
  }, handgun2: {
    x: size * 1.5,
    y: -size * 1.5,
    r: size * .25,
    a: 0,
    d: 7.5,
    gravity: true,
    lifetime: 1000,
    damage: 1,
  }, sword: {
    x: size,
    y: -size * .75,
    r: size * .75,
    a: PI,
    d: .05,
    gravity: false,
    lifetime: 300,
    damage: 10,
  },
}
Object.values(attackCircleObject).forEach(v => v.flag = false)

const stateReset = () => {
  if (player.descentFlag) player.descentFlag = false
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
    const registValue = .1
    speed *= player.state === 'jump' ? aerialBrake :
    player.state === 'turn' && player.attackState === 'startup' ? registValue :
    player.state === 'turn' && player.attackState === 'active' ? 1 :
    ['crouch', 'damage'].includes(player.state) || motionList.includes(player.state) ? 0 : 1
    if (isKey(keyMap.left)) player.dx -= speed
    if (isKey(keyMap.right)) player.dx += speed
  }
  if (isKey(keyMap.crouch)) {
    if (!player.grabFlag) { // crouch
      if (player.landFlag) {
        const crouchPermissionList = ['idle', 'walk']
        if (crouchPermissionList.includes(player.state)) {
          player.state = 'crouch'
        }
      }
    }
    if (isKey(keyMap.jump)) player.descentFlag = true // descent
  }
  if (isKey(keyMap.down)) {
    if (player.state === 'jump') { // down force
      const downForce = .01
      const restrictValue = .5
      player.dy += player.dy < restrictValue ? downForce : 0
    }
    if (isKey(keyMap.jump)) player.descentFlag = true // descent
  }

  if (isKeyFirst(keyMap.jump) && !isKey(keyMap.crouch)) { // jump
    if (player.attackState !== 'recovery' && !player.doubleJumpFlag) {
      if (player.state === 'jump') player.doubleJumpFlag = true
      player.state = 'jump'
      player.motionFirstFlag = false
    }
  }
  let actionList = ['crouch']
  motionList.forEach(v => actionList.push(v))
  if (!menuFlag && !actionList.includes(player.state)) {
    const swordDeferment = 6 * 1000 / 60
    const conditionObject = {
      turn:
        isKey(keyMap.left) !== isKey(keyMap.right) &&
        walkThreshold < Math.abs(player.dx) &&
        ((player.direction === 'left' && isKey(keyMap.right)) ||
        (player.direction === 'right' && isKey(keyMap.left))),
      handgun:
        isKeyFirst(keyMap.attack) &&
        // !isKey(keyMap.left) &&
        // !isKey(keyMap.right) &&
        player.landFlag,
      sword:
        isKeyFirst(keyMap.attack) &&
        player.landFlag &&
        (keyMap.left.some(v => globalTimestamp - key[v].timestamp <= swordDeferment) ||
        keyMap.right.some(v => globalTimestamp - key[v].timestamp <= swordDeferment)),
      slide:
        isKey(keyMap.down) &&
        (isKey(keyMap.left) || isKey(keyMap.right)) &&
        walkThreshold <= Math.abs(player.dx) &&
        cooltime.slide === 0 &&
        player.landFlag &&
        !player.wallFlag,
    }
    Object.keys(conditionObject).some(v => {
      if (conditionObject[v]) {
        player.state = v
        player.attackElapsedTime = 0
      }
    })
  }
  if (false) { // wall grab
    if (
      player.wallFlag &&
      !player.landFlag &&
      0 < player.dy &&
      isKey(keyMap.up)
    ) {
      if (
        (player.wallFlag === 'left' && player.direction === 'right') ||
        (player.wallFlag === 'right' && player.direction === 'left')
      ) {
        const decayRatio = .5
        player.dy *= decayRatio
        player.dx = player.direction === 'left' ? -dashConstant : dashConstant
        player.grabFlag = true
      }
    }
    if (
      !(player.wallFlag &&
      !player.landFlag &&
      0 < player.dy &&
      isKey(keyMap.up))
    ) player.grabFlag = false
  }
  if (false && player.grabFlag) { // wall kick
    const jumpRatio = 1
    if (isKeyFirst(keyMap.jump) && player.grabFlag) {
      if (player.direction === 'right') {
        player.dx = -jumpRatio
        player.direction = 'left'
      } else if (player.direction === 'left') {
        player.dx = jumpRatio
        player.direction = 'right'
      }
      player.dy = jumpConstant
      player.wallFlag = false
      player.grabFlag = false
      player.state = 'jump'
      player.attackState = 'active'
    }
  }
  mapData[field.name].layers[mapData[
  field.name].layersIndex.objectgroup].objects.forEach(v => { // gate process
    if (
      v.name === 'gate' &&
      v.x < player.x && player.x < v.x + v.width &&
      v.y < player.y && player.y < v.y + v.height
    ) {
      v.properties.forEach(vl => {
        if (vl.name === 'address' && isKeyFirst(keyMap.up)) {
          setMapProcess(vl.value)
        }
      })
    }
  })
  Object.keys(settings.type).forEach(v => {
    if (isKeyFirst(keyMap[v])) {
      settings.type[v] = setStorage(v, !settings.type[v])
      inputDOM[v].checked = !inputDOM[v].checked
    }
  })
  { // for debug
    if (isKeyFirst(keyMap.pushEnemy)) enemies.push(setEnemy())
    if (isKeyFirst(keyMap.reset)) {
      maxLog.dx = 0
      maxLog.dy = 0
    }
    if (isKeyFirst(keyMap.subElasticModulus) && 0 < elasticModulus) {
      elasticModulus = orgRound(elasticModulus - .1, 10)
    }
    if (isKeyFirst(keyMap.addElasticModulus) && elasticModulus < 1) {
      elasticModulus = orgRound(elasticModulus + .1, 10)
    }
    if (isKeyFirst(keyMap.subFrictionalForce) && 0 < userFF) {
      userFF = orgRound(userFF - .1, 10)
    }
    if (isKeyFirst(keyMap.addFrictionalForce) && userFF < 1) {
      userFF = orgRound(userFF + .1, 10)
    }
    if (isKeyFirst(keyMap.gravity)) gravityFlag = !gravityFlag
    if (!gravityFlag) {
      player.dx = 0
      player.dy = 0
      const num = 10
      if (isKey(keyMap.left)) player.dx -= moveAcceleration * intervalDiffTime * num
      if (isKey(keyMap.right)) player.dx += moveAcceleration * intervalDiffTime * num
      if (isKey(keyMap.up)) player.dy -= moveAcceleration * intervalDiffTime * num
      if (isKey(keyMap.down)) player.dy += moveAcceleration * intervalDiffTime * num
    }
    if (false && isKeyFirst(keyMap.skin)) {
      player.skin = player.skin === 'misaki' ? 'kohaku' : 'misaki'
    }
  }
}
const judgement = () => {
  const collisionDetect = obj => {
    const collisionResponse = tilt => {
      const nX = Math.cos(tilt * PI)
      const nY = Math.sin(tilt * PI)
      const t = -(
        obj.dx * nX + obj.dy * nY) / (
        nX ** 2 + nY ** 2) * (.5 + elasticModulus / 2)
      obj.dx += 2 * t * nX
      obj.dy += 2 * t * nY
      if (tilt <= 1) frictionalForce = wallFF
      obj.dx *= obj.state === 'slide' ? 1 - slideFF : 1 - frictionalForce
      obj.dy *= 1 - frictionalForce
      if (tilt === 0) obj.wallFlag = 'right'
      else if (tilt === 1) obj.wallFlag = 'left'
      else obj.wallFlag = false
    }
    let count = 0
    let onetimeLandFlag = false
    let repeatFlag
    const collisionCheck = collisionIndex => {
      for (let x = 0; x < mapData[field.name].layers[collisionIndex].width; x++) {
        if (x * size + size * 2 < obj.x) continue
        if (obj.x < x * size - size) break
        for (let y = 0; y < mapData[field.name].layers[collisionIndex].height; y++) {
          const id =
            mapData[field.name].layers[collisionIndex].data[
              y * mapData[field.name].layers[collisionIndex].width + x] -
            mapData[field.name].tilesets[mapData[
              field.name].tilesetsIndex.collision.index].firstgid + 1
          if (id <= 0) continue
          terrainObject[id].forEach((ro, i) => { // relative origin
            const rp = terrainObject[id].slice(i - 1)[0]
            const rn = terrainObject[id].length - 1 === i ? // relative next
              terrainObject[id][0] : terrainObject[id].slice(i + 1)[0]
            let tilt = Math.atan2(rn[1] - ro[1], rn[0] - ro[0]) / PI // 判定する線分の傾き
            const previousTilt = Math.atan2(ro[1] - rp[1], ro[0] - rp[0]) / PI
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
                const target = terrainObject[mapData[field.name].layers[collisionIndex].data[(
                  y + vl[2][1]) * mapData[field.name].layers[collisionIndex].width + x + vl[2][0]] -
                  mapData[field.name].tilesets[mapData[
                  field.name].tilesetsIndex.collision.index].firstgid + 1]
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
                    target[index][0] - target[previousIndex][0]) / PI
                  const cNextTilt = Math.atan2(
                    target[nextIndex][1] - target[index][1],
                    target[nextIndex][0] - target[index][0]) / PI
                  if (
                    tilt === cPreviousTilt || previousTilt === cPreviousTilt ||
                    tilt === cNextTilt || previousTilt === cNextTilt
                  ) vertexFlag = true
                }
              }
            })
            if (returnFlag) return
            const ox = obj.x
            const oy = obj.y
            const dx = obj.dx * intervalDiffTime
            const dy = obj.dy * intervalDiffTime
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
              const permissionValue = -.1
              if (0 < tm && tm <= 1) {
                const cx = (ox - landCondition.w / 2) + dx * tm
                const cy = (oy + landCondition.y) + (dy + landCondition.h) * tm
                const acx = cx - ax
                const acy = cy - ay
                const bcx = cx - bx
                const bcy = cy - by
                const doc = acx * bcx + acy * bcy
                if (
                  doc <= 0 && (terrainObject[id].length !== 2 ||
                  permissionValue < obj.dy)) onetimeLandFlag = true
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
                  doc <= 0 && (terrainObject[id].length !== 2 ||
                  permissionValue < obj.dy)) onetimeLandFlag = true
              }
            }
            let nax = ax - nx * obj.r
            let nay = ay - ny * obj.r
            let nbx = bx - nx * obj.r
            let nby = by - ny * obj.r
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
              if (doc <= 0 && (2 < terrainObject[id].length || i !== 1)) {
                detectFlag = true
                if (terrainObject[id].length === 2) {
                  const compareTilt = Math.atan2(dy, dx) / PI
                  let diffTilt = compareTilt - tilt
                  diffTilt = diffTilt < -1 ? diffTilt + 2 :
                  1 < diffTilt ? diffTilt - 2 : diffTilt
                  if (diffTilt < 0) return
                }
                tilt += tilt < .5 ? 1.5 : -.5
                if (1 < tilt) onetimeLandFlag = true
              }
            }
            if (
              !detectFlag &&
              !vertexFlag &&
              (ax - (ox + dx)) ** 2 + (ay - (oy + dy)) ** 2 <= obj.r ** 2
            ) {
              if (terrainObject[id].length === 2) {
                if ((ax - ox) ** 2 + (ay - oy) ** 2 <= obj.r ** 2) return
                const compareTilt = Math.atan2(dy, dx) / PI
                let diffTilt = i === 0 ? compareTilt - tilt : tilt - compareTilt
                diffTilt = diffTilt < -1 ? diffTilt + 2 :
                1 < diffTilt ? diffTilt - 2 : diffTilt
                if (diffTilt < 0) return
              }
              detectFlag = true
              tilt = Math.atan2(oy - ay, ox - ax) / PI
              if (tilt < 0) onetimeLandFlag = true
            }
            if (detectFlag && (!obj.descentFlag || terrainObject[id].length !== 2)) {
              collisionResponse(tilt)
              repeatFlag = true
            }
          })
        }
      }
    }
    do {
      repeatFlag = false
      count++
      if (3 < count) {
        obj.dx = 0
        obj.dy = 0
        break
      }
      mapData[field.name].layersIndex.collision.forEach(v => collisionCheck(v))
    } while(repeatFlag)
    obj.x += obj.dx * intervalDiffTime
    obj.y += obj.dy * intervalDiffTime
    obj.landFlag = onetimeLandFlag
  }
  collisionDetect(player)
  enemies.forEach(v => {collisionDetect(v)})

  const hitDetect = (own, target) => {
    let index = []
    own.attackCircleList.forEach((o, io) => {
      target.hitCircleList.forEach((t, it) => {
        const harf = {
          x: o.d * Math.cos(o.a) * intervalDiffTime / 2,
          y: o.d * Math.sin(o.a) * intervalDiffTime / 2,
        }
        const tP = {x: target.x + t.x, y: target.y + t.y}
        const relativePosition = {
          x: tP.x - (o.x + harf.x),
          y: tP.y - (o.y + harf.y),
        }
        const transformPosition = {
          x: relativePosition.x * Math.cos(-o.a) + relativePosition.y * Math.sin(-o.a),
          y: -relativePosition.y * Math.sin(-o.a) + relativePosition.y * Math.cos(-o.a),
        }
        const r = (o.r + t.r) ** 2
        if (
          (- harf.x - o.r - t.r <= transformPosition.x && transformPosition.x <= harf.x + o.r + t.r &&
          - harf.y - o.r - t.r <= transformPosition.y && transformPosition.y <= harf.y + o.r + t.r) ||
          (o.x - tP.x) ** 2 + (o.y - tP.y) ** 2 <= r ||
          (o.x + o.d * Math.cos(o.a) * intervalDiffTime - tP.x) ** 2 + (o.y - tP.y) ** 2 <= r ||
          (o.x - tP.x) ** 2 + (o.y + o.d * Math.sin(o.a) * intervalDiffTime - tP.y) ** 2 <= r ||
          (o.x + o.d * Math.cos(o.a) * intervalDiffTime - tP.x) ** 2 +
          (o.y + o.d * Math.sin(o.a) * intervalDiffTime - tP.y) ** 2 <= r
        ) {
          if (!o.flag && (index[0] !== undefined || !index.some(v => v[0] === io || v[1] === it))) {
            o.flag = true
            index.push([io, it])
          }
        }
      })
    })
    index.reverse().forEach(v => {
      effectList.push(setEffect(target.x + target.hitCircleList[v[1]].x,
        target.y + target.hitCircleList[v[1]].y, own.attackCircleList[v[0]].damage))
      target.state = 'damage'
    })
  }
  enemies.forEach((e, i) => {
    hitDetect(player, e)
    hitDetect(e, player)
    enemies.forEach((en, ix) => {
      if (i !== ix) hitDetect(e, en)
    })
  })
}
const update = () => {
  {
    if (maxLog.dx < Math.abs(player.dx)) maxLog.dx = Math.abs(player.dx)
    if (maxLog.dy < Math.abs(player.dy)) maxLog.dy = Math.abs(player.dy)
  }
  { // dy
    // add gravity
    const gravity = gravitationalAcceleration * intervalDiffTime
    player.dy += gravity
    enemies.forEach(v => v.dy += gravity)
    frictionalForce = userFF
    const terminalVelocity = size
    if (terminalVelocity < player.dy) player.dy = terminalVelocity

    player.attackCircleList.forEach((v, i) => {
      v.lifetime -= intervalDiffTime
      if (v.lifetime <= 0) player.attackCircleList.splice(i, 1)
      else {
        if (v.direction === 'right') {
          v.x += v.d * Math.cos(v.a) * intervalDiffTime
          v.y += v.d * Math.sin(v.a) * intervalDiffTime
        } else {
          const a = 0 < v.a ? PI / 2 - (v.a - PI / 2) : -PI / 2 - (v.a + PI / 2)
          v.x += v.d * Math.cos(a) * intervalDiffTime
          v.y += v.d * Math.sin(a) * intervalDiffTime
        }
      }
      if (v.gravity) v.y += gravity
    })
  }
  { // dx
    if (player.grabFlag) player.dx = 0
    if (player.dx !== 0) player.wallFlag = false
  }
  { // out of map
    const gameoverThreshold = size * 10
    if (field.h + gameoverThreshold < player.y) {
      player.x = field.checkPoint.x
      player.y = field.checkPoint.y
    }
  }

  if (player.state !== 'slide' && cooltime.slide !== 0) { // slide cooltime
    if (!player.landFlag && 1 < cooltime.slide) cooltime.slide -= 2 ** intervalDiffTime
    else cooltime.slide -= intervalDiffTime
    if ((cooltime.slide < 0 && !isKey(keyMap.attack)) || !player.landFlag) cooltime.slide = 0
  }

  // if (0 < player.invincibleTimer) player.invincibleTimer -= intervalDiffTime
  if (player.landFlag) {
    if (!['crouch', 'push', 'damage'].includes(player.state) && !motionList.includes(player.state)) {
      const stateHistory = player.state
      player.state = player.wallFlag && player.state !== 'slide' ? 'push' :
      walkThreshold < Math.abs(player.dx) ? 'run' :
      floorThreshold < Math.abs(player.dx) ? 'walk' : 'idle'
      if (player.dx < -floorThreshold && isKey(keyMap.left) !== isKey(keyMap.right)) {
        player.direction = 'left'
      }
      if (floorThreshold < player.dx && isKey(keyMap.left) !== isKey(keyMap.right)) {
        player.direction = 'right'
      }
      if (
        stateHistory === 'run' &&
        stateHistory !== player.state &&
        isKey(keyMap.left) === isKey(keyMap.right)
      ) {
        player.state = 'turn'
        player.attackElapsedTime = 0
      }
    }
  } else {
    if (!player.doubleJumpFlag) { // fall
      player.state = 'jump'
      player.attackState = 'active'
      player.motionFirstFlag = true
    }
  }

  if (player.state === 'idle') {
    const i = playerData.image[player.state]
    if ( // breath
      player.breathTimestamp + player.breathInterval / i.breathMax * (player.breathCount + 1) <=
      globalTimestamp
    ) {
      player.breathCount++
      if (i.breathMax <= player.breathCount) {
        player.breathCount = 0
        player.breathTimestamp = globalTimestamp
        if (player.breathInterval < playerData.breath.max) player.breathInterval += 1
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
    player.imageIndex = player.breathCount * i.blinkMax + i.blinkRotate[player.blinkCount]
    if ( // temporary
      false &&
      2 < player.imageIndex && player.imageIndex < 6 &&
      player.breathInterval < playerData.breath.fatigue
    ) {
      const num = Math.random()
      const list = num < .9 ? {value: audio[player.skin].handgun.data, startTime: .3}
      : num < .95 ? {value: audio[player.skin].jump.data, startTime: .3}
      : {value: audio[player.skin].doubleJump.data, startTime: .33}
      playAudio(list.value, list.startTime)
    }
  } else if (player.state === 'walk' || player.state === 'run') {
    player.movingDistance += Math.abs(player.dx * intervalDiffTime)
    if (playerData.stride[player.state] < player.movingDistance) {
      player.movingDistance -= playerData.stride[player.state]
      player.imageIndex++
    }
    if (image[player.skin][player.state][player.attackState].length <= player.imageIndex) {
      player.imageIndex -= image[player.skin][player.state][player.attackState].length
      if (player.midBreath < player.breathInterval) player.breathInterval -= 1
      else if (player.breathInterval < player.midBreath) player.breathInterval += 1
    }
  } else if (player.state === 'crouch') {
    const i = playerData.image[player.state]
    const index = Math.floor(player.crouchTime / i.intervalTime)
    if (isKey(keyMap.crouch)) {
      if ((index < image[player.skin][player.state][player.attackState].length - 1)) {
        player.crouchTime += intervalDiffTime
      }
    } else {
      player.crouchTime -= intervalDiffTime
      if (player.crouchTime <= 0) {
        player.crouchTime = 0
        player.state = 'idle'
      }
    }
    player.imageIndex = index
  } else if (player.state === 'damage') {
    const i = playerData.image[player.state]
    i.time += 1
    if (i.time % i.frame === 0) player.imageIndex += 1
    if (player.imageIndex === image[player.skin][player.state][player.attackState].length) {
      player.imageIndex -= image[player.skin][player.state][player.attackState].length
      i.time = 0
      player.state = 'idle'
    }
  } else if (motionList.includes(player.state)) {
    const i = playerData.image[player.state]
    player.attackElapsedTime += intervalDiffTime
    if (player.attackState === 'startup' && i.startupTime <= player.attackElapsedTime) {
      player.attackState = 'active'
      player.attackElapsedTime -= i.startupTime
    }
    if (player.attackState === 'active') {
      if (!player.motionFirstFlag) { // motion
        player.motionFirstFlag = true
        if (actionInitObject[player.state] !== undefined) actionInitObject[player.state]()
        if (attackCircleObject[player.state] !== undefined) {
          const object = JSON.parse(JSON.stringify(attackCircleObject[player.state]))
          if (player.direction === 'right') object.x = player.x + object.x
          else object.x = player.x - (object.x + object.r)
          object.y = player.y + object.y
          object.direction = player.direction
          player.attackCircleList.push(object)
        }
        if (soundEfffectObject[player.skin][player.state] !== undefined) {
          playAudio(soundEfffectObject[player.skin][player.state].data)
        }
        if (playerData.breath.min < player.breathInterval) player.breathInterval -= 1 // temporary
      }
      if (uniqueActionObject[player.state] !== undefined) uniqueActionObject[player.state]()
      if (recoveryCondition[player.state] !== undefined) recoveryCondition[player.state](i)
    }
    if (player.attackState === 'recovery' && i.recoveryTime <= player.attackElapsedTime) {
      if (player.state === 'jump') {
        player.fallFlag = false
        player.fallTime = 0
      }
      if (i.nextState !== undefined) {
        player.attackElapsedTime -= i.recoveryTime
        player.state = i.nextState
      } else {
        player.attackElapsedTime = 0
        player.state = 'idle'
      }
      player.attackState = 'startup'
      player.motionFirstFlag = false
    }
    if (player.state !== 'idle') {
      const l = image[player.skin][player.state][player.attackState].length
      if (player.state === 'jump' && player.attackState === 'active') {
        for (let i = Math.floor(l / 2); 0 <= i; i--) {
          if (Math.abs(player.dy) < -jumpConstant / (2 ** i * .75)) {
            if (player.dy < 0) player.imageIndex = i
            else player.imageIndex = l - i - 1
            break
          } else if (i === 0) {
            if (0 < player.dy) {
              player.fallTime += intervalDiffTime
              const interval = 7 * 1000 / 60
              const dl = image[player.skin][player.state].fall.length
              player.imageIndex = l - dl + ((player.fallTime / (interval * dl) % dl)|0)
            }
          }
        }
      } else {
        player.imageIndex = Math.floor(player.attackElapsedTime / i[player.attackState + 'Time'] * l)
      }
    }
  }
  enemies.forEach(v => {
    if (v.beforeState !== v.state) v.elapsedTime = 0
    v.beforeState = v.state
    v.elapsedTime += intervalDiffTime
    if (v.attackState === 'startup' && enemyData[v.skin][v.state].startup <= v.elapsedTime) {
      v.elapsedTime -= enemyData[v.skin][v.state].startup
      v.attackState = 'active'
    }
    if (v.attackState === 'active' && enemyData[v.skin][v.state].active <= v.elapsedTime) {
      v.elapsedTime -= enemyData[v.skin][v.state].active
      v.attackState = 'recovery'
    }
    if (v.attackState === 'recovery' && enemyData[v.skin][v.state].recovery < v.elapsedTime) {
      v.elapsedTime -= enemyData[v.skin][v.state].recovery
      v.attackState = 'startup'
      if (v.state !== 'idle') v.state = 'idle'
    }
    v.imageIndex = Math.floor(
      v.elapsedTime / enemyData[v.skin][v.state][v.attackState] *
      image[v.skin][v.state][v.attackState].length)
  })
  effectList.forEach((v, i) => {
    v.lifetime -= intervalDiffTime
    if (v.lifetime <= 0) effectList.splice(i, 1)
  })
}
const main = () => setInterval(() => {
  frameCounter(internalFrameList)
  intervalDiffTime = globalTimestamp - currentTime
  if (100 < intervalDiffTime) intervalDiffTime = 0
  currentTime = globalTimestamp

  stateReset()
  proposal()
  judgement()
  update()

  const titleProcess = () => {
    if (isKeyFirst(keyMap.attack)) screenState = screenList[1]
  }
  const title = () => {
    if (!menuFlag) titleProcess()
  }
  // if (screenState === screenList[0]) title()
  // else if (screenState === screenList[1]) inGame()
  const floatMenu = () => {
    if (isKeyFirst(keyMap.option)) {
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
      if (isKeyFirst(keyMap.down)) {
        floatMenuCursor = floatMenuCursor === floatMenuCursorMax ? 0 : floatMenuCursor + 1
      }
      if (isKeyFirst(keyMap.up)) {
        floatMenuCursor = floatMenuCursor === 0 ? floatMenuCursorMax : floatMenuCursor - 1
      }
      const k = Object.keys(settings.type)[floatMenuCursor]
      if ((
        isKeyFirst(keyMap.attack)) || (
        isKeyFirst(keyMap.left)) && settings.type[k] || (
        isKeyFirst(keyMap.right)) && !settings.type[k]
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
      return field.name === 'AthleticCourse' ? 'テレフォン・ダンス' : 'アオイセカイ'
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
  mapData[field.name].layersIndex.background.forEach(v => { // draw background
    const properties = mapData[field.name].layers[v].properties
    // const offsetX = properties[properties.findIndex(vl => vl.name === 'offsetX')].value
    // offsetX === 'left'
    const direction = properties[properties.findIndex(vl => vl.name === 'direction')].value
    const offsetY = properties[properties.findIndex(vl => vl.name === 'offsetY')].value
    const scrollTimePerSize =
      properties[properties.findIndex(vl => vl.name === 'scrollTimePerSize')].value
    const image = imageObject[mapData[field.name].layers[v].name]
    const resetWidthTime = scrollTimePerSize * image.width / size
    let ratio = scrollTimePerSize === 0 ? 1 : globalTimestamp % resetWidthTime / resetWidthTime
    if (direction === 'left') ratio = -ratio
    let offsety = mapData[field.name].layers[v].offsety
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
  field.w - ratio.x < player.x ? field.w - canvas.offsetWidth : ((
    player.x - ratio.x) / (field.w - ratio.x * 2)) * (field.w - canvas.offsetWidth)
  stageOffset.y = player.y < ratio.y ? 0 :
  field.h - ratio.y < player.y ? field.h - canvas.offsetHeight : ((
    player.y - ratio.y) / (field.h - ratio.y * 2)) * (field.h - canvas.offsetHeight)

  mapData[field.name].layersIndex.tileset.forEach(v => {
    let flag = false
    mapData[field.name].layers[v].properties.forEach(vl => {
      if (vl.name === 'foreground') {
        flag = vl.value
      }
    })
    if (flag) return
    for (let x = 0; x < mapData[field.name].layers[v].width; x++) {
      for (let y = 0; y < mapData[field.name].layers[v].height; y++) {
        let id = mapData[field.name].layers[v].data[mapData[field.name].layers[v].width * y + x] - 1
        if (0 < id) {
          let flag = false
          Object.entries(mapData[field.name].tilesetsIndex).forEach(([k, vl]) => {
            if (flag) return
            if (vl.tilecount < id) id -= vl.tilecount
            else {
              context.drawImage(
                imageObject[k],
                (id % mapData[field.name].tilesetsIndex[k].columns) * size,
                (id - id % mapData[field.name].tilesetsIndex[k].columns) /
                  mapData[field.name].tilesetsIndex[k].columns * size,
                size, size, (x * size - stageOffset.x)|0, (y * size - stageOffset.y)|0, size, size)
              flag = true
            }
          })
        }
      }
    }
  })
  mapData[field.name].layers[mapData[
  field.name].layersIndex.objectgroup].objects.forEach(v => {
    if (v.name !== 'gate') return
    const oneRound = 5e3
    const ratio = (Math.sin(PI * 2 * (globalTimestamp % oneRound / oneRound)) + 1) / 2
    context.fillStyle = `hsla(0, 0%, 50%, ${ratio / 4})`
    context.fillRect(
      v.x - stageOffset.x + player.r,
      v.y - stageOffset.y + player.r,
      v.width - player.r * 2,
      v.height - player.r * 2)
  })

  const imageOffset = {x: 64, y: 119}
  context.fillStyle = 'hsl(30, 100%, 50%)'
  enemies.forEach(v => {
    let ex = v.x - v.imageOffset.x - stageOffset.x|0
    const ey = v.y - v.imageOffset.y - stageOffset.y|0
    const imag = image[v.skin][v.state][v.attackState][v.imageIndex]
    context.save()
    if (v.direction === 'left') {
      context.scale(-1, 1)
      ex = -ex - imag.width
    }
    context.drawImage(imag, ex, ey)
    context.restore()
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
    context.fillText(field.name, canvas.offsetWidth / 2, canvas.offsetHeight / 6)
    context.strokeStyle = `hsla(0, 0%, 50%, ${alpha})`
    context.strokeText(field.name, canvas.offsetWidth / 2, canvas.offsetHeight / 6)
    context.restore()
    if (end < elapsedTime) timestamp.gate = 0
  }
  let x = player.x - imageOffset.x - stageOffset.x
  const imag = image[player.skin][player.state][player.attackState][player.imageIndex]
  context.save()
  if (player.direction === 'left') {
    context.scale(-1, 1)
    x = -x - imag.width
  }
  context.drawImage(imag, x|0, player.y - imageOffset.y - stageOffset.y|0)
  context.restore()
  mapData[field.name].layersIndex.tileset.forEach(v => {
    let flag = false
    mapData[field.name].layers[v].properties.forEach(vl => {
      if (vl.name === 'foreground') flag = !vl.value
    })
    if (flag) return
    for (let x = 0; x < mapData[field.name].layers[v].width; x++) {
      for (let y = 0; y < mapData[field.name].layers[v].height; y++) {
        let id = mapData[field.name].layers[v].data[mapData[field.name].layers[v].width * y + x] - 1
        if (0 < id) {
          let flag = false
          Object.entries(mapData[field.name].tilesetsIndex).forEach(([k, vl]) => {
            if (flag) return
            if (vl.tilecount < id) id -= vl.tilecount
            else {
              context.drawImage(
                imageObject[k],
                (id % mapData[field.name].tilesetsIndex[k].columns) * size,
                (id - id % mapData[field.name].tilesetsIndex[k].columns) /
                  mapData[field.name].tilesetsIndex[k].columns * size,
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
    mapData[field.name].layersIndex.collision.forEach(value => {
      for (let x = 0; x < mapData[field.name].layers[value].width; x++) {
        for (let y = 0; y < mapData[field.name].layers[value].height; y++) {
          let id = mapData[field.name].layers[value].data[y *
            mapData[field.name].layers[value].width + x]
          if (0 < id) {
            for(let j = 0; j < mapData[field.name].tilesets.length ; j++) {
              if (Object.keys(terrainObject).length < id) {
                id -= mapData[field.name].tilesets[j].firstgid - 1
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
    const strokeCollisionCircle = obj => {
      context.beginPath()
      context.arc(obj.x - stageOffset.x, obj.y - stageOffset.y, obj.r, 0, PI * 2)
      context.closePath()
      context.stroke()
    }
    context.strokeStyle = 'hsl(0, 100%, 50%)'
    strokeCollisionCircle(player)
    { // player's delta vector
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

    const fillCircle = (x, y, r) => {
      context.beginPath()
      context.arc(x - stageOffset.x|0, y - stageOffset.y|0, r, 0, PI * 2)
      context.fill()
    }
    context.fillStyle = 'hsla(300, 100%, 50%, .5)'
    player.hitCircleList.forEach(v => fillCircle(player.x + v.x, player.y + v.y, v.r))
    player.attackCircleList.forEach(v => {
      let a
      if (v.direction === 'right') a = v.a
      else a = 0 < v.a ? PI / 2 - (v.a - PI / 2) : -PI / 2 - (v.a + PI / 2)
      fillCircle(
        v.x + v.d * Math.cos(a) * intervalDiffTime,
        v.y + v.d * Math.sin(a) * intervalDiffTime,
        v.r)
      context.save()
      context.lineWidth = v.r * 2
      context.beginPath()
      context.moveTo(v.x - stageOffset.x|0, v.y - stageOffset.y|0)
      context.lineTo(
        v.x + v.d * Math.cos(a) * intervalDiffTime - stageOffset.x|0,
        v.y + v.d * Math.sin(a) * intervalDiffTime - stageOffset.y|0)
      context.closePath()
      context.stroke()
      context.restore()
    })
    enemies.forEach(v => {
      strokeCollisionCircle(v)
      context.fillStyle = 'hsla(30, 100%, 50%, .5)'
      if (v.invincibleTimer === 0) {
        v.hitCircleList.forEach(vl => fillCircle(v.x + vl.x, v.y + vl.y, vl.r))
      }
      context.fillStyle = 'hsla(0, 100%, 50%, .5)'
      v.attackCircleList.forEach(vl => fillCircle(v.x + vl.x, v.y + vl.y, vl.r))
    })
  }
  {
    effectList.forEach(v => {
      context.save()
      context.font = `bold ${size}px sans-serif`
      context.fillStyle = 'hsl(0, 0%, 100%)'
      context.textAlign = 'center'
      const n = (effectData.lifetime - v.lifetime) * .02
      const offsetY = -size * 2
      context.fillText(
        v.text,
        v.x + Math.cos(v.d) * n - stageOffset.x|0,
        v.y + offsetY + Math.sin(v.d) * n - stageOffset.y|0)
      context.strokeStyle = 'hsl(0, 0%, 25%)'
      context.strokeText(
        v.text,
        v.x + Math.cos(v.d) * n - stageOffset.x|0,
        v.y + offsetY + Math.sin(v.d) * n - stageOffset.y|0)
      context.restore()
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
    mapData[field.name].layersIndex.collision.forEach(v => {
      for (let x = 0; x < mapData[field.name].layers[v].width; x++) {
        for (let y = 0; y < mapData[field.name].layers[v].height; y++) {
          const X = multiple * (x * size - player.x) / size
          const Y = multiple * (y * size - player.y) / size
          if (
            -mapSize.x / 2 < Math.round(X) && X < mapSize.x / 2 - 2 &&
            -mapSize.y / 2 < Math.ceil(Y) && Y < mapSize.y / 2
          ) {
            let id = mapData[field.name].layers[v
            ].data[mapData[field.name].layers[v].width * y + x] - 1
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

    mapData[field.name].layers[mapData[
    field.name].layersIndex.objectgroup].objects.forEach(v => { // gate process
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
      `x(m, row): ${Math.floor(player.x * .04)} ${player.x.toFixed(2)}`,
      `y(m, row): ${Math.floor(((
        mapData[field.name].layers[mapData[
        field.name].layersIndex.tileset[0]].height * size) -
        player.y) * .04)} ${player.y.toFixed(2)}`,
      `dx: ${maxLog.dx.toFixed(2)} ${player.dx.toFixed(2)}`,
      `dy: ${maxLog.dy.toFixed(2)} ${player.dy.toFixed(2)}`,
      `player state: ${player.state}`,
      `direction: ${player.direction}`,
      `double jump: ${player.doubleJumpFlag}`,
      `attack state: ${player.attackState}`,
      `land flag: ${player.landFlag}`,
      `wall flag: ${player.wallFlag}`,
      `descent flag: ${player.descentFlag}`,
      `slide cooltime: ${cooltime.slide}`,
      `stamina: ${player.breathInterval}`,
      `[${keyMap.gravity}]gravity: ${gravityFlag}`,
      `[${keyMap.subElasticModulus}: -, ${keyMap.addElasticModulus}: +]` +
      `elasticModulus: ${elasticModulus}`,
      `[${keyMap.subFrictionalForce}: -, ${
        keyMap.addFrictionalForce}: +]` +
      `frictionalForce: ${userFF}`,
      `enemy: ${enemies.length}`,
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
    offset.x + Math.cos(PI * globalTimestamp / divide + PI * i / polygon * 2) * a
    const y =
    offset.y + Math.sin(PI * globalTimestamp / divide + PI * i / polygon * 2) * a
    i === 0 ? context.moveTo(x, y) : context.lineTo(x, y)
  }
  context.closePath()
  context.stroke()
}
loadingScreen()
Promise.all(resourceList).then(() => {
  loadedFlag = true
  volumeControll()
  setMapProcess(field.name)
  // console.log(mapData, field)
  main()
  draw()
})