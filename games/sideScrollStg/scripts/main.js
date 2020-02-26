{'use strict'
const canvas = document.getElementById`canvas`
const context = canvas.getContext`2d`
let startTime = Date.now()
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
const formationFlagList = [2e3, 5e3, 8e3, 11e3]
let formationCount = 0 // temporary
const enemyList = []
let itemStock = 0
const itemList = [
  {x: canvas.offsetWidth * (5/8), y: canvas.offsetHeight / 2},
  {x: canvas.offsetWidth * (5/8), y: canvas.offsetHeight / 2},
  {x: canvas.offsetWidth * (5/8), y: canvas.offsetHeight / 2},
  {x: canvas.offsetWidth * (5/8), y: canvas.offsetHeight / 2},
  {x: canvas.offsetWidth * (5/8), y: canvas.offsetHeight / 2},
  {x: canvas.offsetWidth * (3/4), y: canvas.offsetHeight / 2},
  {x: canvas.offsetWidth * (3/4), y: canvas.offsetHeight / 2},
  {x: canvas.offsetWidth * (3/4), y: canvas.offsetHeight / 2},
  {x: canvas.offsetWidth * (3/4), y: canvas.offsetHeight / 2},
  {x: canvas.offsetWidth * (3/4), y: canvas.offsetHeight / 2},
  {x: canvas.offsetWidth * (7/8), y: canvas.offsetHeight / 2},
  {x: canvas.offsetWidth, y: canvas.offsetHeight / 2}
]
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
  if (startTime + formationFlagList[0] < Date.now()) {
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
    }
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
const drawBackground = () => {
  context.fillStyle = 'black'
  context.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
  starList.pop()
  makeStar()
  context.fillStyle = 'white'
  starList.forEach((v, i) => context.fillRect(canvas.offsetWidth - i, v, 1, 1))
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
const drawOwn = () => {
  context.fillStyle = 'white'
  const offset = {x: ownStateObject.x - size, y: ownStateObject.y - size / 2}
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
const main = () => {
  input()
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
  context.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
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
  window.requestAnimationFrame(main)
}
main()
}