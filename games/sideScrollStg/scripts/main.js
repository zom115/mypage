{'use strict'
const canvas = document.getElementById`canvas`
const context = canvas.getContext`2d`
let startTime = Date.now()
const size = 16
const ownPositionObject = {x: canvas.offsetWidth / 8, y: canvas.offsetHeight / 2}
let ownMovedistance = size / 16
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
const ownShotList = []
const missileList = []
const doubleList = []
const laserList = []
const optionList = []
const enemyNameList = ['small']
const enemySizeList = [size * (2 / 3)]
const enemyFormationList = ['S', 'Z']
const formationFlagList = [2e3, 5e3, 8e3, 11e3]
let formationCount = 0 // temporary
const enemyList = []
let itemStock = 0
const itemList = [
  {x: canvas.offsetWidth * (5/8), y: canvas.offsetHeight / 2},
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
const ownMoveProcess = () => {
  const keyList = ['w', 'd', 's', 'a']
  let crossKeyState = 0
  keyList.forEach((v, i) => {
    if (key[`${v}Flag`]) {
      i === 0 ? crossKeyState += 1 :
      i === 1 ? crossKeyState += 2 :
      i === 2 ? crossKeyState += 4 :
      i === 3 ? crossKeyState += 8 : false
    }
  })
  //     9 | 1 ,11 |  3
  // 8, 13 |       |  2 ,7
  //    12 | 4 ,14 |  6
  // 納得いかん。w, a押下時に追加でd押下すると左上に進むのが自然でしょ
  if (crossKeyState === 1 || crossKeyState === 11) {
    ownPositionObject.y -= ownMovedistance
  } else if (crossKeyState === 2 || crossKeyState === 7) {
    ownPositionObject.x += ownMovedistance
  } else if (crossKeyState === 4 || crossKeyState === 14) {
    ownPositionObject.y += ownMovedistance
  } else if (crossKeyState === 8 || crossKeyState === 13) {
    ownPositionObject.x -= ownMovedistance
  } else if (crossKeyState === 3) {
    ownPositionObject.x += ownMovedistance / Math.SQRT2
    ownPositionObject.y -= ownMovedistance / Math.SQRT2
  } else if (crossKeyState === 6) {
    ownPositionObject.x += ownMovedistance / Math.SQRT2
    ownPositionObject.y += ownMovedistance / Math.SQRT2
  } else if (crossKeyState === 9) {
    ownPositionObject.x -= ownMovedistance / Math.SQRT2
    ownPositionObject.y -= ownMovedistance / Math.SQRT2
  } else if (crossKeyState === 12) {
    ownPositionObject.x -= ownMovedistance / Math.SQRT2
    ownPositionObject.y += ownMovedistance / Math.SQRT2
  }
  screenMarginObject = {x: size, y: size / 4}
  if (ownPositionObject.x < screenMarginObject.x) ownPositionObject.x = screenMarginObject.x
  if (canvas.offsetWidth - screenMarginObject.x < ownPositionObject.x) {
    ownPositionObject.x = canvas.offsetWidth - screenMarginObject.x
  }
  if (ownPositionObject.y < screenMarginObject.y) ownPositionObject.y = screenMarginObject.y
  if (canvas.offsetHeight - screenMarginObject.y < ownPositionObject.y) {
    ownPositionObject.y = canvas.offsetHeight - screenMarginObject.y
  }
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
    if (itemStock === 1) ownMovedistance += speedUpRate
    else if (itemStock === 2) missileFlag = true
    else if (itemStock === 3) {
      doubleFlag = true
      laserCount = 0
    } else if (itemStock === 4) {
      laserCount += 1
      doubleFlag = false
    } else if (itemStock === 5) {
      optionList.push({x: ownPositionObject.x, y: ownPositionObject.y})
    }
    itemStock = 0
  }
}
const attackProcess = () => {
  const bulletRestrictValue = 3
  const missileRestrictValue = 2
  const doubleRestrictValue = 3
  const laserRestrictValue = 3
  if (key.k === 1) {
    if (ownShotList.length + 1 <= bulletRestrictValue && !laserCount) {
      ownShotList.push({x: ownPositionObject.x + size / 2, y: ownPositionObject.y})
    }
    if (missileFlag && missileList.length + 1 <= missileRestrictValue) {
      missileList.push({x: ownPositionObject.x + size / 2, y: ownPositionObject.y})
    }
    if (doubleFlag && doubleList.length + 1 <= doubleRestrictValue) {
      doubleList.push({x: ownPositionObject.x + size / 2, y: ownPositionObject.y})
    }
    if (laserCount && laserList.length + 1 <= laserRestrictValue) {
      laserList.push({
        count: 0,
        w: 0,
        x: ownPositionObject.x + size / 2,
        y: ownPositionObject.y
      })
    }
  }
}
const ownShotProcess = () => {
  const distance = size / 2
  ownShotList.forEach((v, i) => {
    v.x += distance
    if (canvas.offsetWidth <= v.x) ownShotList.splice(i, 1)
  })
}
const missileProcess = () => {
  const distance = size / 6
  missileList.forEach((v, i) => {
    v.x += distance / Math.SQRT2
    v.y += distance / Math.SQRT2
    if (canvas.offsetWidth <= v.x || canvas.offsetHeight <= v.y) missileList.splice(i, 1)
  })
}
const doubleProcess = () => {
  const distance = size / 2
  doubleList.forEach((v, i) => {
    v.x += distance / Math.SQRT2
    v.y -= distance / Math.SQRT2
    if (canvas.offsetWidth <= v.x || v.y <= 0) doubleList.splice(i, 1)
  })
}
const laserProcess = () => {
  const distance = size / 2
  const firstLimit = 5
  const secondLimit = 20
  laserList.forEach((v, i) => {
    v.count += 1
    if ((
      laserCount === 1 && v.count < firstLimit) ||
      laserCount === 2 && v.count < secondLimit
    ) {
      v.w += distance
      v.y = ownPositionObject.y
    }
    v.x += distance
    if (canvas.offsetWidth <= v.x - v.w) laserList.splice(i, 1)
  })
}
const collisionDetect = () => {
  // item
  const itemLangeObject = {x: size * (3 / 4), y: size / 2}
  itemList.forEach((v, i) => {
    if (v.x - itemLangeObject.x <= ownPositionObject.x &&
      ownPositionObject.x <= v.x + itemLangeObject.x &&
      v.y - itemLangeObject.y <= ownPositionObject.y &&
      ownPositionObject.y <= v.y + itemLangeObject.y
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
    ownShotList.forEach((s, iS) => {
      if (
        Math.sqrt((e.x - s.x) ** 2 + (e.y - s.y) ** 2) < enemySizeList[0] ||
        Math.sqrt((e.x + ownShotSizeObject.x - s.x) ** 2 + (e.y - s.y) ** 2) < enemySizeList[0] ||
        Math.sqrt((e.x - s.x) ** 2 + (e.y + ownShotSizeObject.y - s.y) ** 2) < enemySizeList[0] ||
        Math.sqrt(
          (e.x + ownShotSizeObject.x - s.x) ** 2 + (e.y + ownShotSizeObject.y - s.y) ** 2) <
          enemySizeList[0]
      ) hitProcess(iE, iS, ownShotList)
    })
    // enemy * missile
    missileList.forEach((m, iM) => {
      if (
        Math.sqrt((m.x - e.x) ** 2 + (m.y - e.y) ** 2) < missileRadius + enemySizeList[0]
      ) hitProcess(iE, iM, missileList)

    })
    // enemy * double
    doubleList.forEach((d, iD) => {
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
      ) hitProcess(iE, iD, doubleList)
    })
    // enemy * laser
    laserList.forEach(l => {
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
    // enemy * own
    const ownLange = size / 8
    if (
      Math.sqrt((ownPositionObject.x - e.x) ** 2 + (ownPositionObject.y - e.y) ** 2) <
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
  const offset = {x: ownPositionObject.x - size, y: ownPositionObject.y - size / 2}
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
  context.arc(ownPositionObject.x, ownPositionObject.y, size / 8, 0, Math.PI * 2, false)
  context.fillStyle = 'red'
  context.fill()
}
const drawShot = () => {
  context.fillStyle = 'white'
  ownShotList.forEach(v => {
    context.beginPath()
    context.moveTo(v.x, v.y)
    context.lineTo(v.x - ownShotSizeObject.x, v.y)
    context.lineTo(v.x - ownShotSizeObject.x, v.y - ownShotSizeObject.y)
    context.lineTo(v.x, v.y - ownShotSizeObject.y)
    context.fill()
  })
}
const drawMissile = () => {
  context.fillStyle = 'lightgray'
  missileList.forEach(v => {
    context.beginPath()
    context.arc(v.x, v.y, missileRadius, 0, Math.PI * 2, false)
    context.fill()
  })
}
const drawDouble = () => {
  context.fillStyle = 'white'
  doubleList.forEach(v => {
    const offset = {x: v.x - ownShotSizeObject.x / 2, y: v.y + ownShotSizeObject.y / 2}
    context.beginPath()
    context.moveTo(offset.x + doubleRotateList[0], offset.y + doubleRotateList[1])
    context.lineTo(offset.x + doubleRotateList[2], offset.y + doubleRotateList[3])
    context.lineTo(offset.x + doubleRotateList[4], offset.y + doubleRotateList[5])
    context.lineTo(offset.x + doubleRotateList[6], offset.y + doubleRotateList[7])
    context.fill()
  })
}
const drawLaser = () => {
  context.fillStyle = 'deepskyblue'
  laserList.forEach(v => {
    context.fillRect(v.x - v.w, v.y - laserHeight / 2, v.w, laserHeight)
  })
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
  console.log(optionList.length)
  input()
  ownMoveProcess()
  enemyProcess()
  itemProcess()
  itemUseProcess()
  attackProcess()
  ownShotProcess()
  missileProcess()
  doubleProcess()
  laserProcess()
  collisionDetect()
  // draw process
  context.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
  drawBackground()
  drawItem()
  drawEnemy()
  drawShot()
  drawMissile()
  drawDouble()
  drawLaser()
  drawOwn()
  drawHUD()
  showFps()
  window.requestAnimationFrame(main)
}
main()
}