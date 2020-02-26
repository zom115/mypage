{'use strict'
const canvas = document.getElementById`canvas`
const context = canvas.getContext`2d`
let startTime = Date.now()
const size = 16
const ownPositionObject = {x: canvas.offsetWidth / 8, y: canvas.offsetHeight / 2}
let ownMovedistance = size / 16
const speedUpRate = size / 16
let missileFlag = false
const ownShotSizeObject = {x: size / 2, y: size / 8}
const ownShotList = []
const enemyNameList = ['small']
const enemySizeList = [size * (2 / 3)]
const enemyFormationList = ['S', 'Z']
const formationFlagList = [2e3, 5e3, 8e3, 11e3]
let formationCount = 0 // temporary
const enemyList = []
let itemStock = 0
const itemList = [{x: canvas.offsetWidth * (3/4), y: canvas.offsetHeight / 2}]
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
const ownShotProcess = () => {
  const restrictValue = 3
  const distance = size / 2
  if (key.k === 1 && ownShotList.length + 1 <= restrictValue) {
    ownShotList.push({x: ownPositionObject.x + size / 2, y: ownPositionObject.y})
  }
  ownShotList.forEach((v, i) => {
    v.x += distance
    if (canvas.offsetWidth <= v.x) {ownShotList.splice(i, 1)}
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
  const speedUp = () => {
    ownMovedistance += speedUpRate
  }
  if (key.j === 1) {
    if (itemStock === 2 && missileFlag) return
    if (itemStock === 1) speedUp()
    else if (itemStock === 2 && !missileFlag) missileFlag = true
    itemStock = 0
  }
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
    // shot
    // -- normal shot description --
    // hit judgement is bullet top or bottom only
    ownShotList.forEach((s, iS) => {
      if (
        Math.sqrt((e.x - s.x) ** 2 + (e.y - s.y) ** 2) < enemySizeList[0] ||
        Math.sqrt((e.x + ownShotSizeObject.x - s.x) ** 2 + (e.y - s.y) ** 2) < enemySizeList[0] ||
        Math.sqrt((e.x - s.x) ** 2 + (e.y + ownShotSizeObject.y - s.y) ** 2) < enemySizeList[0] ||
        Math.sqrt(
          (e.x + ownShotSizeObject.x - s.x) ** 2 + (e.y + ownShotSizeObject.y - s.y) ** 2) <
          enemySizeList[0]
      ) {
        const platoon = e.platoon
        enemyList.splice(iE, 1)
        if (enemyList.every(v => v.platoon !== platoon)) itemList.push({x: e.x, y: e.y})
        ownShotList.splice(iS, 1)
      }
    })
    // enemy
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
  enemyList.forEach(v => {
    if (v.name === enemyNameList[0]) {
      context.fillStyle = 'gray'
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
  ownShotList.forEach(v => {
    context.fillStyle = 'white'
    context.beginPath()
    context.moveTo(v.x, v.y)
    context.lineTo(v.x - ownShotSizeObject.x, v.y)
    context.lineTo(v.x - ownShotSizeObject.x, v.y - ownShotSizeObject.y)
    context.lineTo(v.x, v.y - ownShotSizeObject.y)
    context.fill()
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
    i === 2 ? 'DOUBLE' :
    i === 3 ? 'LASER' :
    i === 4 ? 'OPTION' :
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
  ownShotProcess()
  itemProcess()
  itemUseProcess()
  collisionDetect()
  // draw process
  context.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
  drawBackground()
  drawItem()
  drawEnemy()
  drawShot()
  drawOwn()
  drawHUD()
  showFps()
  window.requestAnimationFrame(main)
}
main()
}