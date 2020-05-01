import {key} from '../../modules/key.mjs'
const canvas = document.getElementById`canvas`
const context = canvas.getContext`2d`
const size = 16
let score = 0
let highscore = 0
let width = 16 * 3
let height = 9 * 3
let field
const resetField = () => {
  field = []
  const column = new Array(width).fill(0)
  for (let i = 0; i < height; i++) {field.unshift(column.concat())}
}
let ownPositionList = []
let intervalTime = 200
const itemObject = {timestamp: 0, createTime: 0}
const speedObject = {timestamp: 0, limit: 0}
let windowState = ''
document.addEventListener('visibilitychange', () => {
  if (document.hidden) windowState = 'hidden'
  else windowState = ''
})
let direction = 'up'
let exectionFlag = false
const reset = () => {
  if (highscore < score) highscore = score
  score = 0
  resetField()
  ownPositionList = [{x: (width / 2)|0, y: height - 1}]
  direction = 'up'
  itemObject.timestamp = Date.now()
  itemObject.createTime = 15 * intervalTime
  speedObject.timestamp = Date.now()
  speedObject.limit = intervalTime
}
reset()
const input = () => {
  const currentDirection = direction
  direction = exectionFlag ? direction :
  key.a.flag && direction !== 'right' ? 'left' :
  key.d.flag && direction !== 'left' ? 'right' :
  key.s.flag && direction !== 'up' ? 'down' :
  key.w.flag && direction !== 'down' ? 'up' : direction
  if (currentDirection !== direction) exectionFlag = true
}
const move = () => {
  speedObject.timestamp += speedObject.limit
  if (direction === 'left') {
    ownPositionList.unshift({x: ownPositionList[0].x - 1, y: ownPositionList[0].y})
  } else if (direction === 'right') {
    ownPositionList.unshift({x: ownPositionList[0].x + 1, y: ownPositionList[0].y})
  } else if (direction === 'down') {
    ownPositionList.unshift({x: ownPositionList[0].x, y: ownPositionList[0].y + 1})
  } else if (direction === 'up') {
    ownPositionList.unshift({x: ownPositionList[0].x, y: ownPositionList[0].y - 1})
  }
  exectionFlag = false
  if (
    ownPositionList[0].x < 0 || width <= ownPositionList[0].x ||
    ownPositionList[0].y < 0 || height <= ownPositionList[0].y ||
    ownPositionList.some((v, i) => {
      if (i === 0) return
      return v.x === ownPositionList[0].x && v.y === ownPositionList[0].y
    }) ||
    field[ownPositionList[0].y][ownPositionList[0].x] === 2
  ) return reset()
  if (field[ownPositionList[0].y][ownPositionList[0].x] === 1) { // getItem
    field[ownPositionList[0].y][ownPositionList[0].x] = 0
    score += 10
    if (score % 50 === 0) speedObject.limit *= .9
  } else if (field[ownPositionList[0].y][ownPositionList[0].x] === 3) { // key
    field[ownPositionList[0].y][ownPositionList[0].x] = 0
    field.forEach((y, iY) => {
      y.forEach((x, iX) => {
        if (x === 2) field[iY][iX] = 1
      })
    })
  } else if (field[ownPositionList[0].y][ownPositionList[0].x] === 4) { // drug
    field[ownPositionList[0].y][ownPositionList[0].x] = 0
    for (let i = 0; i < ownPositionList.length; i++) {
      ownPositionList.pop(ownPositionList.length - 1)
    }
  } else ownPositionList.pop(ownPositionList.length - 1)
}
const createItem = () => {
  itemObject.timestamp += itemObject.createTime
  let randomNumber = Math.random()
  const probabilityList = [.7, .2, .05, .05] // dot, obstacle, key, drug
  let index = 0
  for (let i = 0; i < probabilityList.length; i++) {
    if (randomNumber <= probabilityList[i]) {
      index = i + 1
      break
    } else randomNumber -= probabilityList[i]
    if (i === probabilityList.length - 1) index = i + 1
  }
  field[Math.floor(Math.random() * height)][Math.floor(Math.random() * width)] = index
}
const drawIndicator = () => {
  context.font = `${size}px sans-serif`
  context.fillStyle = 'hsl(0, 0%, 100%)'
  context.fillText('score :', size * 2.5, size * 1.5)
  context.fillText(score, size * 6.5, size * 1.5, size * 10)
  context.fillText('highscore :', canvas.offsetWidth - size * 15.5, size * 1.5)
  context.fillText(highscore, canvas.offsetWidth - size * 9.5, size * 1.5, size * 10)
}
const drawCell = () => {
  field.forEach((y, iY) => {
    y.forEach((x, iX) => {
      if (x === 0) {
        context.strokeStyle = 'hsl(0, 0%, 50%)'
        context.strokeRect(
          size * 2.5 + size * iX,
          size * 2 + size * iY,
          size * .9,
          size * .9)
      } else if (x === 1) {
        context.fillStyle = 'hsl(0, 0%, 100%)'
        context.beginPath()
        context.arc(
          size * 3 + size * iX,
          size * 2.5 + size * iY,
          size / 6, 0,
          Math.PI * 2,
          false)
        context.fill()
      } else if (x === 2) {
        context.fillStyle = 'hsl(0, 0%, 25%)'
        context.fillRect(
          size * 2.5 + size * iX,
          size * 2 + size * iY,
          size * .9,
          size * .9)
      } else if (x === 3) {
        context.strokeStyle = 'hsl(0, 0%, 100%)'
        context.fillStyle = 'hsl(0, 0%, 100%)'
        context.fillText('K', size * 2.5 + size * iX, size * 2.8 + size * iY)
      } else if (x === 4) {
        context.fillStyle = 'hsl(0, 0%, 100%)'
        context.fillText('D', size * 2.5 + size * iX, size * 2.8 + size * iY)
      }
    })
  })
  ownPositionList.forEach((value, index) => {
    context.fillStyle = index === 0 ? 'hsl(0, 0%, 100%)' : 'hsl(0, 0%, 80%)'
    context.fillRect(
      size * 2.5 + size * value.x,
      size * 2 + size * value.y,
      size * .9,
      size * .9)
  })
}
setInterval(() => {
  if (windowState === 'hidden') {
    speedObject.timestamp = Date.now()
    itemObject.timestamp = Date.now()
    return
  }
  input()
  if (speedObject.timestamp + speedObject.limit <= Date.now()) move()
  if (itemObject.timestamp + itemObject.createTime <= Date.now()) createItem()
}, 0)
const draw = () => {
  window.requestAnimationFrame(draw)
  context.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
  drawIndicator()
  drawCell()
}
draw()