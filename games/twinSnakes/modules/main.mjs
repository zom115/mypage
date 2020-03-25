import {key} from '../../../modules/key.mjs'
const canvas = document.getElementById`canvas`
const context = canvas.getContext`2d`
const size = 16
let score = {left: 0, right: 0}
let highscore = 0
let width = 16 * 3
let height = 9 * 3
let field
const resetField = () => {
  field = []
  const column = new Array(width).fill(0)
  for (let i = 0; i < height; i++) {field.unshift(column.concat())}
}
const positionObject = {left: [], right: [],}
let intervalTime = 200
const itemObject = {timestamp: 0, createTime: 0,}
const speedObject = {
  left: {timestamp: 0, limit: 0},
  right: {timestamp: 0, limit: 0},
}
const direction = {left: 'up', right: 'up'}
let exectionFlag = {left: false, right: false,}
let windowState = ''
document.addEventListener('visibilitychange', () => {
  if (document.hidden) windowState = 'hidden'
  else windowState = ''
})
const reset = () => {
  if (highscore < score.left + score.right) highscore = score.left + score.right
  score.left = 0
  score.right = 0
  resetField()
  positionObject.left = [{x: (width / 4)|0, y: height - 1}]
  positionObject.right = [{x: (width * 3 / 4)|0, y: height - 1}]
  direction.left = 'up'
  direction.right = 'up'
  itemObject.timestamp = Date.now()
  itemObject.createTime = 15 * intervalTime
  speedObject.left.timestamp = Date.now()
  speedObject.left.limit = intervalTime
  speedObject.right.timestamp = Date.now()
  speedObject.right.limit = intervalTime
}
reset()
const input = () => {
  const currentDirection = {left: direction.left, right: direction.right,}
  direction.left = exectionFlag.left ? direction.left :
  key.a.flag && direction.left !== 'right' ? 'left' :
  key.d.flag && direction.left !== 'left' ? 'right' :
  key.s.flag && direction.left !== 'up' ? 'down' :
  key.w.flag && direction.left !== 'down' ? 'up' : direction.left
  if (currentDirection.left !== direction.left) exectionFlag.left = true
  direction.right = exectionFlag.right ? direction.right :
  key.j.flag && direction.right !== 'right' ? 'left' :
  key.l.flag && direction.right !== 'left' ? 'right' :
  key.k.flag && direction.right !== 'up' ? 'down' :
  key.i.flag && direction.right !== 'down' ? 'up' : direction.right
  if (currentDirection.right !== direction.right) exectionFlag.right = true
}
const crossCheck = () => {
  let flag = false
  positionObject.left.forEach(leftValue => {
    flag = positionObject.right.some(rightValue => {
      return leftValue.x === rightValue.x && leftValue.y === rightValue.y
    })
  })
  return flag
}
const leftMove = () => {
  speedObject.left.timestamp += speedObject.left.limit
  if (direction.left === 'left') {
    positionObject.left.unshift({x: positionObject.left[0].x - 1, y: positionObject.left[0].y})
  } else if (direction.left === 'right') {
    positionObject.left.unshift({x: positionObject.left[0].x + 1, y: positionObject.left[0].y})
  } else if (direction.left === 'down') {
    positionObject.left.unshift({x: positionObject.left[0].x, y: positionObject.left[0].y + 1})
  } else if (direction.left === 'up') {
    positionObject.left.unshift({x: positionObject.left[0].x, y: positionObject.left[0].y - 1})
  }
  exectionFlag.left = false
  if (
    positionObject.left[0].x < 0 || width <= positionObject.left[0].x ||
    positionObject.left[0].y < 0 || height <= positionObject.left[0].y ||
    positionObject.left.some((v, i) => {
      if (i === 0) return
      return v.x === positionObject.left[0].x && v.y === positionObject.left[0].y
    }) ||
    field[positionObject.left[0].y][positionObject.left[0].x] === 2 ||
    crossCheck()
  ) return reset()
  if (field[positionObject.left[0].y][positionObject.left[0].x] === 1) { // getItem
    field[positionObject.left[0].y][positionObject.left[0].x] = 0
    score.left += 10
    if (score.left % 50 === 0) speedObject.left.limit *= .9
  } else if (field[positionObject.left[0].y][positionObject.left[0].x] === 3) { // key
    field[positionObject.left[0].y][positionObject.left[0].x] = 0
    field.forEach((y, iY) => {
      y.forEach((x, iX) => {
        if (x === 2) field[iY][iX] = 1
      })
    })
  } else if (field[positionObject.left[0].y][positionObject.left[0].x] === 4) { // drug
    field[positionObject.left[0].y][positionObject.left[0].x] = 0
    for (let i = 0; i < positionObject.left.length; i++) {
      positionObject.left.pop(positionObject.left.length - 1)
    }
  } else positionObject.left.pop(positionObject.left.length - 1)
}
const rightMove = () => {
  speedObject.right.timestamp += speedObject.right.limit
  if (direction.right === 'left') {
    positionObject.right.unshift({x: positionObject.right[0].x - 1, y: positionObject.right[0].y})
  } else if (direction.right === 'right') {
    positionObject.right.unshift({x: positionObject.right[0].x + 1, y: positionObject.right[0].y})
  } else if (direction.right === 'down') {
    positionObject.right.unshift({x: positionObject.right[0].x, y: positionObject.right[0].y + 1})
  } else if (direction.right === 'up') {
    positionObject.right.unshift({x: positionObject.right[0].x, y: positionObject.right[0].y - 1})
  }
  exectionFlag.right = false
  if (
    positionObject.right[0].x < 0 || width <= positionObject.right[0].x ||
    positionObject.right[0].y < 0 || height <= positionObject.right[0].y ||
    positionObject.right.some((v, i) => {
      if (i === 0) return
      return v.x === positionObject.right[0].x && v.y === positionObject.right[0].y
    }) ||
    field[positionObject.right[0].y][positionObject.right[0].x] === 2 ||
    crossCheck()
  ) return reset()
  if (field[positionObject.right[0].y][positionObject.right[0].x] === 1) { // getItem
    field[positionObject.right[0].y][positionObject.right[0].x] = 0
    score.right += 10
    if (score.right % 50 === 0) speedObject.right.limit *= .9
  } else if (field[positionObject.right[0].y][positionObject.right[0].x] === 3) { // key
    field[positionObject.right[0].y][positionObject.right[0].x] = 0
    field.forEach((y, iY) => {
      y.forEach((x, iX) => {
        if (x === 2) field[iY][iX] = 1
      })
    })
  } else if (field[positionObject.right[0].y][positionObject.right[0].x] === 4) { // drug
    field[positionObject.right[0].y][positionObject.right[0].x] = 0
    for (let i = 0; i < positionObject.right.length; i++) {
      positionObject.right.pop(positionObject.right.length - 1)
    }
  } else positionObject.right.pop(positionObject.right.length - 1)
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
  context.fillText(`${score.left + score.right}`, size * 6.5, size * 1.5, size * 10)
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
        context.beginPath()
        context.arc(
          size * 3 + size * iX,
          size * 2.5 + size * iY,
          size / 3, 0,
          Math.PI * 2,
          false)
        context.closePath()
        context.stroke()
      } else if (x === 4) {
        context.fillStyle = 'hsl(0, 0%, 100%)'
        context.fillText('D', size * (2.5) + size * iX, size * (2.8) + size * iY)
      }
    })
  })
  positionObject.left.forEach((value, index) => {
    context.fillStyle = index === 0 ? 'hsl(0, 0%, 100%)' :  'hsl(0, 0%, 80%)'
    context.fillRect(
      size * 2.5 + size * value.x,
      size * 2 + size * value.y,
      size * .9,
      size * .9)
    if (index === 0) {
      context.fillStyle = 'hsl(0, 0%, 0%)'
      context.fillText('L', size * 2.5 + size * value.x, size * 2.8 + size * value.y)
    }
  })
  positionObject.right.forEach((value, index) => {
    context.fillStyle = index === 0 ? 'hsl(0, 0%, 100%)' : 'hsl(0, 0%, 80%)'
    context.fillRect(
      size * 2.5 + size * value.x,
      size * 2 + size * value.y,
      size * .9,
      size * .9)
    if (index === 0) {
      context.fillStyle = 'hsl(0, 0%, 0%)'
      context.fillText('R', size * 2.5 + size * value.x, size * 2.8 + size * value.y)
    }
  })
}
setInterval(() => {
  if (windowState === 'hidden') {
    speedObject.left.timestamp = Date.now()
    speedObject.right.timestamp = Date.now()
    itemObject.timestamp = Date.now()
    return
  }
  input()
  if (speedObject.left.timestamp + speedObject.left.limit <= Date.now()) leftMove()
  if (speedObject.right.timestamp + speedObject.right.limit <= Date.now()) rightMove()
  if (itemObject.timestamp + itemObject.createTime <= Date.now()) createItem()
}, 0)
const draw = () => {
  window.requestAnimationFrame(draw)
  context.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
  drawIndicator()
  drawCell()
}
draw()