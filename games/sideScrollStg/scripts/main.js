{'use strict'
const canvas = document.getElementById`canvas`
const context = canvas.getContext`2d`
const size = 16
const ownPositionObject = {x: canvas.offsetWidth / 8, y: canvas.offsetHeight / 4.5}
const ownShotList = []
const starList = []
for (let i = 0; i < canvas.offsetWidth; i++) {
  starList.push(Math.random() * canvas.offsetHeight)
}
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
  const distance = size / 16
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
    ownPositionObject.y -= distance
  } else if (crossKeyState === 2 || crossKeyState === 7) {
    ownPositionObject.x += distance
  } else if (crossKeyState === 4 || crossKeyState === 14) {
    ownPositionObject.y += distance
  } else if (crossKeyState === 8 || crossKeyState === 13) {
    ownPositionObject.x -= distance
  } else if (crossKeyState === 3) {
    ownPositionObject.x += distance / Math.SQRT2
    ownPositionObject.y -= distance / Math.SQRT2
  } else if (crossKeyState === 6) {
    ownPositionObject.x += distance / Math.SQRT2
    ownPositionObject.y += distance / Math.SQRT2
  } else if (crossKeyState === 9) {
    ownPositionObject.x -= distance / Math.SQRT2
    ownPositionObject.y -= distance / Math.SQRT2
  } else if (crossKeyState === 12) {
    ownPositionObject.x -= distance / Math.SQRT2
    ownPositionObject.y += distance / Math.SQRT2
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
const drawBackground = () => {
  context.fillStyle = 'black'
  context.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
  starList.push(Math.random() * canvas.offsetHeight)
  if (canvas.offsetWidth < starList.length) starList.shift()
  context.fillStyle = 'white'
  starList.forEach((v, i) => {
    context.fillRect(i, v, 1, 1)

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
  context.fillStyle = context.strokeStyle = 'red'
  context.fill()
}
const drawShot = () => {
  ownShotList.forEach(v => {
    context.fillStyle = context.strokeStyle = 'white'
    context.beginPath()
    context.moveTo(v.x, v.y)
    context.lineTo(v.x-size / 2, v.y)
    context.lineTo(v.x-size / 2, v.y - size / 8)
    context.lineTo(v.x, v.y - size / 8)
    context.fill()
  })
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
  ownShotProcess()
  // draw process
  context.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
  drawBackground()
  drawOwn()
  drawShot()
  showFps()
  window.requestAnimationFrame(main)
}
main()
}