import {key} from '../../../modules/key.mjs'
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
let hiddenTimestamp = 0
const timeUpdate = () => {
  const diffTime = Date.now() - hiddenTimestamp
  itemObject.timestamp += diffTime
  speedObject.timestamp += diffTime
  hiddenTimestamp = 0
}
document.addEventListener('visibilitychange', () => {
  document.hidden ? hiddenTimestamp = Date.now() : timeUpdate()
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
  } else ownPositionList.pop(ownPositionList.length - 1)
}
const createItem = () => {
  itemObject.timestamp += itemObject.createTime
  field[Math.floor(Math.random() * height)][Math.floor(Math.random() * width)] =
  Math.random() < .8 ? 1 : 2
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
          size * (2.5 + .5) + size * iX,
          size * (2 + .5) + size * iY,
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