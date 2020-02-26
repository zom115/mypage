{'use strict'
const canvas = document.getElementById`canvas`
const context = canvas.getContext`2d`
const screenList = ['title', 'main', 'pause', 'setting']
let screenState = screenList[0]
let titleState = screenList[1]
const settingObject = {'HIT DISP': false, 'FPS COUNTER': false}
let settingState = Object.keys(settingObject)[0]
let startTimestamp = 0
const size = 16
const ownStateObject = {
  distance: size / 16,
  shotList: [],
  missileList: [],
  doubleList: [],
  laserList: [],
  x: canvas.offsetWidth / 8,
  y: canvas.offsetHeight / 2
}
const optionList = []
let crossKeyState = 0
const speedUpRate = size / 16
const ownShotSizeObject = {x: size / 2, y: size / 8}
const missileRadius = size / 4
let missileFlag = false
const doubleRotateList = [
  ownShotSizeObject.x / 2 * Math.cos(Math.PI *(3/ 4)) -
    - ownShotSizeObject.y / 2 * Math.sin(Math.PI *(3/ 4)),
  ownShotSizeObject.x / 2 * Math.sin(Math.PI *(3/ 4)) +
    - ownShotSizeObject.y / 2 * Math.cos(Math.PI *(3/ 4)),
  - ownShotSizeObject.x / 2 * Math.cos(Math.PI *(3/ 4)) -
    - ownShotSizeObject.y / 2 * Math.sin(Math.PI *(3/ 4)),
  - ownShotSizeObject.x / 2 * Math.sin(Math.PI *(3/ 4)) +
    - ownShotSizeObject.y / 2 * Math.cos(Math.PI *(3/ 4)),
  - ownShotSizeObject.x / 2 * Math.cos(Math.PI *(3/ 4)) -
    ownShotSizeObject.y / 2 * Math.sin(Math.PI *(3/ 4)),
  - ownShotSizeObject.x / 2 * Math.sin(Math.PI *(3/ 4)) +
    ownShotSizeObject.y / 2 * Math.cos(Math.PI *(3/ 4)),
  ownShotSizeObject.x / 2 * Math.cos(Math.PI *(3/ 4)) -
    ownShotSizeObject.y / 2 * Math.sin(Math.PI *(3/ 4)),
  ownShotSizeObject.x / 2 * Math.sin(Math.PI *(3/ 4)) +
    ownShotSizeObject.y / 2 * Math.cos(Math.PI *(3/ 4))
]
let doubleFlag = false
const laserHeight = size / 8
let laserCount = 0
const enemyNameList = ['small']
const enemySizeList = [size * (2 / 3)]
const enemyFormationList = ['S', 'Z']
const formationFlagList = [2e3, 5e3, 8e3, 11e3, 20e3]
let formationCount = 0 // temporary
const enemyList = []
let itemStock = 0
const itemList = []
const starList = []
const starDensity = 1 / 10
const makeStar = () => {
  const falseNum = -1
  if (starList.length < 1 / starDensity || starList[1 / starDensity] === falseNum) {
    starList.unshift(falseNum)
  } else if (starList.length === starDensity || starList[1 / starDensity] !== falseNum) {
    starList.unshift(Math.random() * canvas.offsetHeight)
  }
}
for (let i = 0; i < canvas.offsetWidth; i++) makeStar(i)
let landFlag = false
let landCount = 0
const landObject = {
  ceil: [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  floor: [0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 3, 2, 1, 1, 0]
}
let pauseTimestamp = 0
const timestampList = [] // for calc. fps
const keyObject = {
  shift: 16,
  space: 32,
  a: 65,
  b: 66,
  c: 67,
  d: 68,
  e: 69,
  f: 70,
  g: 71,
  h: 72,
  i: 73,
  j: 74,
  k: 75,
  l: 76,
  m: 77,
  n: 78,
  o: 79,
  p: 80,
  q: 81,
  r: 82,
  s: 83,
  t: 84,
  u: 85,
  v: 86,
  w: 87,
  x: 88,
  y: 89,
  z: 90
}
const key = {}
Object.keys(keyObject).forEach(v => {
  key[`${v}Flag`] = false
  key[v] = 0
})
document.addEventListener('keydown', e => {
  Object.entries(keyObject).forEach(([k, v]) => {
    if (e.keyCode === v) key[k + 'Flag'] = true
    if (e.keyCode === keyObject.space) {
      key[`${k}Flag`] = true
      if (e.preventDefault) e.preventDefault()
      else e.keyCode = 0
    }
  })
}, false)
document.addEventListener('keyup', e => {
  Object.entries(keyObject).forEach(([k, v]) => {
    if (e.keyCode === v) {
      key[`${k}Flag`] = false
      key[k] = 0
    }
  })
}, false)
const input = () => {
  Object.keys(keyObject).forEach(v => {
    if (key[`${v}Flag`]) key[v] += 1
  })
}
const titleProcess = () => {
  if (key.w === 1 || key.s === 1) {
    titleState = titleState === screenList[1] ? screenList[3] : screenList[1]
  }
  if (key.k === 1) {
    screenState = titleState
    if (titleState === screenList[1]) startTimestamp = Date.now()
  }
}
const moveProcess = (object, state, distance) => {
  //     9 | 1 ,11 |  3
  // 8, 13 |       |  2 ,7
  //    12 | 4 ,14 |  6
  // 納得いかん。w, a押下時に追加でd押下すると左上に進むのが自然でしょ
  if (state === 1 || state === 11) {
    object.y -= distance
  } else if (state === 2 || state === 7) {
    object.x += distance
  } else if (state === 4 || state === 14) {
    object.y += distance
  } else if (state === 8 || state === 13) {
    object.x -= distance
  } else if (state === 3) {
    object.x += distance / Math.SQRT2
    object.y -= distance / Math.SQRT2
  } else if (state === 6) {
    object.x += distance / Math.SQRT2
    object.y += distance / Math.SQRT2
  } else if (state === 9) {
    object.x -= distance / Math.SQRT2
    object.y -= distance / Math.SQRT2
  } else if (state === 12) {
    object.x -= distance / Math.SQRT2
    object.y += distance / Math.SQRT2
  }
  const screenMarginObject = {x: size, y: size / 4}
  if (object.x < screenMarginObject.x) object.x = screenMarginObject.x
  if (canvas.offsetWidth - screenMarginObject.x < object.x) {
    object.x = canvas.offsetWidth - screenMarginObject.x
  }
  if (object.y < screenMarginObject.y) object.y = screenMarginObject.y
  if (canvas.offsetHeight - screenMarginObject.y < object.y) {
    object.y = canvas.offsetHeight - screenMarginObject.y
  }
}
const ownMoveProcess = () => {
  const keyList = ['w', 'd', 's', 'a']
  crossKeyState = 0
  keyList.forEach((v, i) => {
    if (key[`${v}Flag`]) {
      i === 0 ? crossKeyState += 1 :
      i === 1 ? crossKeyState += 2 :
      i === 2 ? crossKeyState += 4 :
      i === 3 ? crossKeyState += 8 : false
    }
  })
  moveProcess(ownStateObject, crossKeyState, ownStateObject.distance)
}
const enemyProcess = () => {
  if (startTimestamp + formationFlagList[0] < Date.now()) {
    formationFlagList.shift()
    formationCount += 1
    let formation
    let appearHeight
    if (formationCount === 1 || formationCount === 3) {
      formation = enemyFormationList[0]
      appearHeight = canvas.offsetHeight / 4
    } else if (formationCount === 2 || formationCount === 4) {
      formation = enemyFormationList[1]
      appearHeight = canvas.offsetHeight * (3 / 4)
    } else if (formationCount === 5) landFlag = true
    for (let i = 0; i < 5; i++) {
      enemyList.push({
        flag: [false, false],
        name: enemyNameList[0],
        platoon: formationCount,
        type: formation,
        x: canvas.offsetWidth + i * size * 3,
        y: appearHeight
      })
    }
  }
  const distance = size / 6
  enemyList.forEach((v, i) => {
    if (v.type === enemyFormationList[0]) {
      if (v.x < canvas.offsetWidth * (2 / 5)) v.flag[0] = true
      if (v.flag[0] && !v.flag[1]) {
        v.x += distance / Math.SQRT2
        v.y += distance / Math.SQRT2
      }
      if (v.flag[0] && canvas.offsetWidth * (3 / 5) < v.x) v.flag[1] = true
      if ((!v.flag[0] && !v.flag[1]) || v.flag[0] && v.flag[1]) v.x -= distance
    } else if (v.type === enemyFormationList[1]) {
      if (v.x < canvas.offsetWidth * (2 / 5)) v.flag[0] = true
      if (v.flag[0] && !v.flag[1]) {
        v.x += distance / Math.SQRT2
        v.y -= distance / Math.SQRT2
      }
      if (v.flag[0] && canvas.offsetWidth * (3 / 5) < v.x) v.flag[1] = true
      if ((!v.flag[0] && !v.flag[1]) || v.flag[0] && v.flag[1]) v.x -= distance
    }
  })
}
const itemProcess = () => {
  const distance = size / 16
  itemList.forEach((v, i) => {
    v.x -= distance
    if (v.x < 0) itemList.splice(i, 1)
  })
}
const itemUseProcess = () => {
  if (key.j === 1) {
    if ((itemStock === 2 && missileFlag) || (
      itemStock === 3 && doubleFlag) || (
      itemStock === 4 && 1 < laserCount) ||
      (itemStock === 5 && 3 < optionList.length)) return
    if (itemStock === 1) ownStateObject.distance += speedUpRate
    else if (itemStock === 2) missileFlag = true
    else if (itemStock === 3) {
      doubleFlag = true
      laserCount = 0
    } else if (itemStock === 4) {
      laserCount += 1
      doubleFlag = false
    } else if (itemStock === 5) {
      optionList.push({
        count: 0,
        shotList: [],
        missileList: [],
        doubleList: [],
        laserList: [],
        log: [],
        distance: [],
        x: ownStateObject.x,
        y: ownStateObject.y})
    }
    itemStock = 0
  }
}
const attackProcess = object => {
  const bulletRestrictValue = 3
  const missileRestrictValue = 2
  const doubleRestrictValue = 3
  const laserRestrictValue = 3
  if (key.k === 1) {
    if (object.shotList.length + 1 <= bulletRestrictValue && !laserCount) {
      object.shotList.push({x: object.x + size / 2, y: object.y})
    }
    if (missileFlag && object.missileList.length + 1 <= missileRestrictValue) {
      object.missileList.push({x: object.x + size / 2, y: object.y})
    }
    if (doubleFlag && object.doubleList.length + 1 <= doubleRestrictValue) {
      object.doubleList.push({x: object.x + size / 2, y: object.y})
    }
    if (laserCount && object.laserList.length + 1 <= laserRestrictValue) {
      object.laserList.push({
        count: 0,
        w: 0,
        x: object.x + size / 2,
        y: object.y
      })
    }
  }
}
const shotProcess = object => {
  const distance = size / 2
  object.shotList.forEach((v, i) => {
    v.x += distance
    if (canvas.offsetWidth <= v.x) object.shotList.splice(i, 1)
  })
}
const missileProcess = object => {
  const distance = size / 6
  object.missileList.forEach((v, i) => {
    v.x += distance / Math.SQRT2
    v.y += distance / Math.SQRT2
    if (canvas.offsetWidth <= v.x || canvas.offsetHeight <= v.y) object.missileList.splice(i, 1)
  })
}
const doubleProcess = object => {
  const distance = size / 2
  object.doubleList.forEach((v, i) => {
    v.x += distance / Math.SQRT2
    v.y -= distance / Math.SQRT2
    if (canvas.offsetWidth <= v.x || v.y <= 0) object.doubleList.splice(i, 1)
  })
}
const laserProcess = object => {
  const distance = size / 2
  const firstLimit = 5
  const secondLimit = 20
  object.laserList.forEach((v, i) => {
    v.count += 1
    if ((
      laserCount === 1 && v.count < firstLimit) ||
      laserCount === 2 && v.count < secondLimit
    ) {
      v.w += distance
      v.y = object.y
    }
    v.x += distance
    if (canvas.offsetWidth <= v.x - v.w) object.laserList.splice(i, 1)
  })
}
const optionProcess = () => {
  const interval = 30
  optionList.forEach((v, i) => {
    attackProcess(v)
    shotProcess(v)
    missileProcess(v)
    doubleProcess(v)
    laserProcess(v)
    if (0 < crossKeyState) {
      v.log.push(crossKeyState)
      v.distance.push(ownStateObject.distance)
      v.count = v.count === null || interval * (1 + i) < v.count ? null : v.count += 1
      if (v.count === null) {
        moveProcess(v, v.log[0], v.distance[0])
        v.log.shift()
        v.distance.shift()
      }
    }
  })
}
const collisionDetect = () => {
  // item
  const itemLangeObject = {x: size * (3 / 4), y: size / 2}
  itemList.forEach((v, i) => {
    if (v.x - itemLangeObject.x <= ownStateObject.x &&
      ownStateObject.x <= v.x + itemLangeObject.x &&
      v.y - itemLangeObject.y <= ownStateObject.y &&
      ownStateObject.y <= v.y + itemLangeObject.y
    ) {
      if (itemStock < 7) itemStock += 1
      else itemStock = 0
      itemList.splice(i, 1)
    }
  })
  enemyList.forEach((e, iE) => {
    // enemy * shot
    // -- normal shot description --
    // hit judgement is bullet top or bottom only
    const hitProcess = (enemyIndex, listIndex, list) => {
      enemyList.splice(enemyIndex, 1)
      if (enemyList.every(v => v.platoon !== e.platoon)) itemList.push({x: e.x, y: e.y})
      list.splice(listIndex, 1)
    }
    const shot = object => {
      object.shotList.forEach((s, iS) => {
        if (
          Math.sqrt((e.x - s.x) ** 2 + (e.y - s.y) ** 2) < enemySizeList[0] ||
          Math.sqrt((e.x + ownShotSizeObject.x - s.x) ** 2 + (e.y - s.y) ** 2) < enemySizeList[0] ||
          Math.sqrt((e.x - s.x) ** 2 + (e.y + ownShotSizeObject.y - s.y) ** 2) < enemySizeList[0] ||
          Math.sqrt(
            (e.x + ownShotSizeObject.x - s.x) ** 2 + (e.y + ownShotSizeObject.y - s.y) ** 2) <
            enemySizeList[0]
        ) hitProcess(iE, iS, object.shotList)
      })
    }
    const missile = object => {
      object.missileList.forEach((m, iM) => {
        if (
          Math.sqrt((m.x - e.x) ** 2 + (m.y - e.y) ** 2) < missileRadius + enemySizeList[0]
        ) hitProcess(iE, iM, object.missileList)
      })
    }
    const double = object => {
      object.doubleList.forEach((d, iD) => {
        const offset = {x: d.x - ownShotSizeObject.x / 2, y: d.y + ownShotSizeObject.y / 2}
        if (
          Math.sqrt((
            e.x - offset.x + doubleRotateList[0]) ** 2 + (
            e.y - offset.y + doubleRotateList[1]) ** 2) < enemySizeList[0] ||
          Math.sqrt((
            e.x - offset.x + doubleRotateList[2]) ** 2 + (
            e.y - offset.y + doubleRotateList[3]) ** 2) < enemySizeList[0] ||
          Math.sqrt((
            e.x - offset.x + doubleRotateList[4]) ** 2 + (
            e.y - offset.y + doubleRotateList[5]) ** 2) < enemySizeList[0] ||
          Math.sqrt((
            e.x - offset.x + doubleRotateList[6]) ** 2 + (
            e.y - offset.y + doubleRotateList[7]) ** 2) < enemySizeList[0]
        ) hitProcess(iE, iD, object.doubleList)
      })
    }
    const laser = object => {
      object.laserList.forEach(l => {
        if (
          Math.sqrt((
            e.x - l.x) ** 2 + (
            e.y - l.y + laserHeight / 2) ** 2) < enemySizeList[0] ||
          Math.sqrt((
            e.x - l.x + l.w) ** 2 + (
            e.y - l.y) ** 2) < enemySizeList[0] ||
          Math.sqrt((
            e.x - l.x) ** 2 + (
            e.y - l.y + laserHeight / 2) ** 2) < enemySizeList[0] ||
          Math.sqrt((
            e.x - l.x + l.w / 2) ** 2 + (
            e.y - l.y + laserHeight / 2) ** 2) < enemySizeList[0]
        ) {
          enemyList.splice(iE, 1)
          if (enemyList.every(v => v.platoon !== e.platoon)) itemList.push({x: e.x, y: e.y})
        }
      })
    }
    shot(ownStateObject)
    missile(ownStateObject)
    double(ownStateObject)
    laser(ownStateObject)
    optionList.forEach(v => {
      shot(v)
      missile(v)
      double(v)
      laser(v)
    })
    // enemy * own
    const ownLange = size / 8
    if (
      Math.sqrt((ownStateObject.x - e.x) ** 2 + (ownStateObject.y - e.y) ** 2) <
      ownLange + enemySizeList[0]) console.log('detect!!')
  })
}
const pauseAcceptor = () => {
  const pauseProcess = () => {
    screenState = screenList[2]
    pauseTimestamp = Date.now()
  }
  const resumeProcess = () => {
    screenState = screenList[1]
    startTimestamp += Date.now() - pauseTimestamp
  }
  if (key.p === 1) {
    screenState === screenList[1] ? pauseProcess() :
    resumeProcess()
  }
}
const settingProcess = () => {
  const currentIndex = Object.keys(settingObject).findIndex(v => v === settingState)
  if (key.w === 1) {
    settingState = currentIndex === 0 ?
    Object.keys(settingObject)[Object.keys(settingObject).length - 1] :
    Object.keys(settingObject)[currentIndex - 1]
  } else if (key.s === 1) {
    settingState = currentIndex === Object.keys(settingObject).length - 1 ?
    Object.keys(settingObject)[0] :
    Object.keys(settingObject)[currentIndex + 1]
  }
  const switchBool = () => {
    settingObject[settingState] = !settingObject[settingState]
  }
  if (key.k === 1) switchBool()
  if (key.a === 1 && settingObject[settingState]) switchBool()
  if (key.d === 1 && !settingObject[settingState]) switchBool()

}
const drawBackground = () => {
  context.fillStyle = 'black'
  context.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
  starList.pop()
  landFlag ? starList.unshift(-1) : makeStar()
  context.fillStyle = 'white'
  starList.forEach((v, i) => context.fillRect(canvas.offsetWidth - i, v, 1, 1))
  if (landFlag) {
    landCount += 1
    context.fillStyle = 'brown'
    context.beginPath()
    context.moveTo(canvas.offsetWidth - landCount, canvas.offsetHeight)
    landObject.floor.forEach((v, i) => {
      context.lineTo(canvas.offsetWidth - landCount + i * size, canvas.offsetHeight - v * size)
    })
    context.fill()
    context.beginPath()
    context.moveTo(canvas.offsetWidth - landCount, 0)
    landObject.ceil.forEach((v, i) => {
      context.lineTo(canvas.offsetWidth - landCount + i * size, v * size)
    })
    context.fill()
  }
}
const drawItem = () => {
  itemList.forEach(v => {
    context.fillStyle = 'white'
    context.beginPath()
    context.moveTo(v.x - size * (3 / 4), v.y - size / 2)
    context.lineTo(v.x - size * (1 / 4), v.y - size / 3)
    context.lineTo(v.x + size * (1 / 4), v.y - size / 3)
    context.lineTo(v.x + size * (3 / 4), v.y - size / 2)
    context.lineTo(v.x + size * (1 / 2), v.y - size * (1 / 6))
    context.lineTo(v.x + size * (3 / 4), v.y)
    context.lineTo(v.x + size * (1 / 2), v.y + size * (1 / 6))
    context.lineTo(v.x + size * (3 / 4), v.y + size / 2)
    context.lineTo(v.x + size * (1 / 4), v.y + size / 3)
    context.lineTo(v.x - size * (1 / 4), v.y + size / 3)
    context.lineTo(v.x - size * (3 / 4), v.y + size / 2)
    context.lineTo(v.x - size * (1 / 2), v.y + size * (1 / 6))
    context.lineTo(v.x - size * (3 / 4), v.y)
    context.lineTo(v.x - size * (1 / 2), v.y - size * (1 / 6))
    context.fill()
    context.fillStyle = 'orangered'
    context.beginPath()
    context.moveTo(v.x - size * (1 / 3), v.y - size * (1 / 5))
    context.lineTo(v.x + size * (1 / 3), v.y - size * (1 / 5))
    context.lineTo(v.x + size * (1 / 3), v.y + size * (1 / 5))
    context.lineTo(v.x - size * (1 / 3), v.y + size * (1 / 5))
    context.fill()
  })
}
const drawEnemy = () => {
  context.fillStyle = 'gray'
  enemyList.forEach(v => {
    if (v.name === enemyNameList[0]) {
      context.beginPath()
      context.arc(v.x, v.y, enemySizeList[0], 0, Math.PI * 2, false)
      context.fill()
    }
  })
}
const drawOwnMachine = object => {
  context.fillStyle = 'white'
  const offset = {x: object.x - size, y: object.y - size / 2}
  context.beginPath()
  context.moveTo(offset.x, offset.y)
  context.lineTo(offset.x + size / 5, offset.y)
  context.lineTo(offset.x + size * (4 / 5), offset.y + size * (1 / 3))
  context.lineTo(offset.x + size * (6 / 5), offset.y + size * (1 / 3))
  context.lineTo(offset.x + size * 2, offset.y + size * (1 / 2))
  context.lineTo(offset.x + size * (1 / 2), offset.y + size * (5 / 7))
  context.lineTo(offset.x + size * (1 / 3), offset.y + size * (5 / 7))
  context.lineTo(offset.x + size * (1 / 3), offset.y + size * (4 / 6))
  context.lineTo(offset.x + size * (1 / 8), offset.y + size * (4 / 6))
  context.lineTo(offset.x + size * (1 / 8), offset.y + size * (3 / 6))
  context.lineTo(offset.x + size * (1 / 5), offset.y + size * (3 / 6))
  context.lineTo(offset.x + size * (1 / 3), offset.y + size * (1 / 3))
  context.fill()
}
const drawOwn = () => {
  drawOwnMachine(ownStateObject)
  context.beginPath()
  context.arc(ownStateObject.x, ownStateObject.y, size / 8, 0, Math.PI * 2, false)
  context.fillStyle = 'red'
  context.fill()
}
const drawShot = object => {
  context.fillStyle = 'white'
  object.shotList.forEach(v => {
    context.beginPath()
    context.moveTo(v.x, v.y)
    context.lineTo(v.x - ownShotSizeObject.x, v.y)
    context.lineTo(v.x - ownShotSizeObject.x, v.y - ownShotSizeObject.y)
    context.lineTo(v.x, v.y - ownShotSizeObject.y)
    context.fill()
  })
}
const drawMissile = object => {
  context.fillStyle = 'lightgray'
  object.missileList.forEach(v => {
    context.beginPath()
    context.arc(v.x, v.y, missileRadius, 0, Math.PI * 2, false)
    context.fill()
  })
}
const drawDouble = object => {
  context.fillStyle = 'white'
  object.doubleList.forEach(v => {
    const offset = {x: v.x - ownShotSizeObject.x / 2, y: v.y + ownShotSizeObject.y / 2}
    context.beginPath()
    context.moveTo(offset.x + doubleRotateList[0], offset.y + doubleRotateList[1])
    context.lineTo(offset.x + doubleRotateList[2], offset.y + doubleRotateList[3])
    context.lineTo(offset.x + doubleRotateList[4], offset.y + doubleRotateList[5])
    context.lineTo(offset.x + doubleRotateList[6], offset.y + doubleRotateList[7])
    context.fill()
  })
}
const drawLaser = object => {
  context.fillStyle = 'deepskyblue'
  object.laserList.forEach(v => {
    context.fillRect(v.x - v.w, v.y - laserHeight / 2, v.w, laserHeight)
  })
}
const drawOption = () => {
  context.save()
  context.scale(2, 1)
  context.fillStyle = 'red'
  optionList.forEach(v => {
    context.beginPath()
    context.arc(v.x / 2, v.y, size * (1 / 3), 0, Math.PI * 2, false)
    context.fill()
  })
  context.restore()
}
const drawHUD = () => {
  context.save()
  context.textAlign = 'center'
  context.lineWidth = size / 8
  context.globalAlpha = .5
  for (let i = 0; i < 6; i++) {
    context.fillStyle = 'royalblue'
    context.fillRect(
      size * 6 + i * size * 7,
      canvas.offsetHeight * (15 / 16),
      size * 7,
      canvas.offsetHeight * (1 / 24))
    context.fillStyle = 'white'
    const text = i === 0 ? 'SPEED UP' :
    i === 1 && !missileFlag ? 'MISSILE' :
    i === 2 && !doubleFlag ? 'DOUBLE' :
    i === 3 && laserCount < 1 ? 'LASER' :
    i === 3 && laserCount === 1 ? 'LASER # 2' :
    i === 4 && optionList.length < 4 ? 'OPTION' :
    i === 5 ? '?' : ''
    context.fillText(
      text,
      size * 9.5 + i * size * 7,
      canvas.offsetHeight * (249 / 256)
      )
    context.strokeStyle = i + 1 === itemStock ? 'yellow' : 'black'
    context.strokeRect(
      size * 6 + i * size * 7,
      canvas.offsetHeight * (15 / 16),
      size * 7,
      canvas.offsetHeight * (1 / 24))
  }
  context.restore()
}
const showFps = () => {
  timestampList.push(Date.now())
  timestampList.forEach((v, i) => {
    if (v < Date.now() - 1e3) timestampList.splice(i, 1)
  })
  context.font = `${size}px sans-serif`
  context.fillStyle = 'white'
  context.textAlign = 'right'
  context.fillText(
    `${timestampList.length - 1} fps`, canvas.offsetWidth - size, size * 1.5)
}
const  drawTitle = () => {
  context.font = `${size * 5}px sans-serif`
  context.fillStyle = 'white'
  context.textAlign = 'center'
  context.fillText('TITLE', canvas.offsetWidth / 2, canvas.offsetHeight * (1 / 3))
  context.font = `${size}px sans-serif`
  context.fillStyle = 'white'
  context.fillText('PLAYER 1', canvas.offsetWidth / 2, canvas.offsetHeight * (3 / 4))
  context.fillText('SETTING', canvas.offsetWidth / 2, canvas.offsetHeight * (7 / 8))
  const object = titleState === screenList[1] ?
  {x: canvas.offsetWidth * (2 / 5), y: canvas.offsetHeight * (3 / 4) - size * (1 / 4)} :
  {x: canvas.offsetWidth * (2 / 5), y: canvas.offsetHeight * (7 / 8) - size * (1 / 4)}
  drawOwnMachine(object)
}
const drawPause = () => {
  context.font = `${size}px sans-serif`
  context.fillStyle = 'white'
  context.textAlign = 'center'
  context.fillText('PAUSE', canvas.offsetWidth / 2, canvas.offsetHeight / 2)
}
const drawSetting = () => {
  const offsetFirstColumn = {
    x: canvas.offsetWidth  * (1 / 5),
    y: canvas.offsetWidth  * (1 / 5)
  }
  const offsetSecondColumn = {
    x: canvas.offsetWidth  * (2 / 5),
    y: canvas.offsetWidth  * (1 / 5)
  }
  const columnSpace = size * 2
  context.font = `${size}px sans-serif`
  context.fillStyle = 'white'
  context.textAlign = 'left'
  context.fillText('SETTING', offsetFirstColumn.x, offsetFirstColumn.y - columnSpace * 2)
  Object.entries(settingObject).forEach(([k, v], i) => {
    context.fillText(k, offsetFirstColumn.x, offsetFirstColumn.y + columnSpace * i)
    context.fillText(v, offsetSecondColumn.x, offsetSecondColumn.y + columnSpace * i)
  })
  const object = {
    x: offsetFirstColumn.x - columnSpace,
    y: offsetFirstColumn.y - size * (1 / 4) +
      columnSpace * Object.keys(settingObject).findIndex(v => v === settingState)
  }
  drawOwnMachine(object)
}
const title = () => {
  titleProcess()
  drawTitle()
}
const main = () => {
  pauseAcceptor()
  ownMoveProcess()
  enemyProcess()
  itemProcess()
  itemUseProcess()
  attackProcess(ownStateObject)
  shotProcess(ownStateObject)
  missileProcess(ownStateObject)
  doubleProcess(ownStateObject)
  laserProcess(ownStateObject)
  optionProcess()
  collisionDetect()
  // draw process
  drawBackground()
  drawItem()
  drawEnemy()
  drawOption()
  optionList.forEach(v => {
    drawShot(v)
    drawMissile(v)
    drawDouble(v)
    drawLaser(v)
  })
  drawShot(ownStateObject)
  drawMissile(ownStateObject)
  drawDouble(ownStateObject)
  drawLaser(ownStateObject)
  drawOwn()
  drawHUD()
  showFps()
}
const pause = () => {
  pauseAcceptor()
  drawPause()
}
const setting = () => {
  settingProcess()
  drawSetting()
}
const loop = () => {
  input()
  context.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
  if (screenState === screenList[0]) title()
  else if (screenState === screenList[1]) main()
  else if (screenState === screenList[2]) pause()
  else if (screenState === screenList[3]) setting()
  requestAnimationFrame(loop)
}
loop()
}