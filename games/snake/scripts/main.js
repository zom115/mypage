!(x = x => {'use strict'

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
  const row = new Array(height).fill(0)
  for (let i = 0; i < width; i++) {field.unshift(row.concat())}
}
resetField()
let ownPosition = [{x: (width / 2)|0, y: height - 1}]
let time = 0
let speed = {timestamp: 0, limit: 15}
let itemSpeed = 300
let getItemFlag = false
let key = {a: false, d: false, s: false, w: false}
const onKeyDown = e => {
  if (e.keyCode === 65) key.a = true
  if (e.keyCode === 68) key.d = true
  if (e.keyCode === 83) key.s = true
  if (e.keyCode === 87) key.w = true
}
document.addEventListener('keydown', onKeyDown, false)
const onKeyUp = e => {
  if (e.keyCode === 65) key.a = false
  if (e.keyCode === 68) key.d = false
  if (e.keyCode === 83) key.s = false
  if (e.keyCode === 87) key.w = false
}
document.addEventListener('keyup', onKeyUp, false)
let direction = 'up'
let exectionFlag = false
const input = () => {
  const current = direction
  direction = (exectionFlag) ? direction
  : (key.a && direction !== 'right') ? 'left'
  : (key.d && direction !== 'left') ? 'right'
  : (key.s && direction !== 'up') ? 'down'
  : (key.w && direction !== 'down') ? 'up'
  : direction
  if (current !== direction) exectionFlag = true
}
const move = () => {
  speed.timestamp = time
  if (direction === 'left') ownPosition.unshift({x: ownPosition[0].x - 1, y: ownPosition[0].y})
  else if (direction === 'right') ownPosition.unshift({x: ownPosition[0].x + 1, y: ownPosition[0].y})
  else if (direction === 'down') ownPosition.unshift({x: ownPosition[0].x, y: ownPosition[0].y + 1})
  else if (direction === 'up') ownPosition.unshift({x: ownPosition[0].x, y: ownPosition[0].y - 1})
  if (getItemFlag) getItemFlag = false
  else ownPosition.pop(ownPosition.length - 1)
  exectionFlag = false
  const reset = () => {
    resetField()
    ownPosition = [{x: (width / 2)|0, y: height - 1}]
    direction = 'up'
    time = 0
    if (highscore < score) highscore = score
    score = 0
    speed = {timestamp: 0, limit: 15}
  }
  if ((
    ownPosition[0].x < 0 || width <= ownPosition[0].x ||
    ownPosition[0].y < 0 || height <= ownPosition[0].y) ||
    ownPosition.some((v, i) => {
      console.log(v, ownPosition[0], v.x, v.y)
    if (i === 0) return
    return v.x === ownPosition[0].x && v.y === ownPosition[0].y
  })) reset()
}
const createItem = () => {
  const position = {x: (Math.random() * width)|0, y: (Math.random() * height)|0}
  field[position.x][position.y] = (field[position.x][position.y] === 0) ? 1
  : field[position.x][position.y]
}
const getItem = () => {
  if (field[ownPosition[0].x][ownPosition[0].y] === 1) {
    field[ownPosition[0].x][ownPosition[0].y] = 0
    getItemFlag = true
    score += 10
    if (score % 50 === 0 && 1 < speed.limit) {
      speed.limit -= 1
      speed.current = time
    }
  }
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
  field.forEach((x, iX) => {
    x.forEach((y, iY) => {
      context.strokeStyle = 'hsl(0, 0%, 50%)'
      if (y === 0) {
        context.strokeRect(size * 2.5 + size * iX, size * 2 + size * iY, size*.9, size*.9)
      } else if (y === 1) {
        context.fillStyle = 'hsl(0, 0%, 100%)'
        context.beginPath()
        context.arc(
          size * (2.5 + .5) + size * iX, size * (2 + .5) + size * iY,
          size / 6, 0, Math.PI*2, false
        )
        context.fill()
      }
    })
    ownPosition.forEach((value, index) => {
      if (index !== 0) {
        context.fillStyle = 'hsl(0, 0%, 80%)'
        context.fillRect(
          size * 2.5 + size * value.x,
          size * 2 + size * value.y,
          size*.9,
          size*.9
          )
        } else {
          context.fillStyle = 'hsl(0, 0%, 100%)'
          context.fillRect(
            size * 2.5 + size * value.x,
            size * 2 + size * value.y,
            size*.9,
            size*.9
          )
      }
    });
  })
}
const main = () => {
  const internalProcess = () => {
    input()
    time += 1
    if (time === speed.timestamp + speed.limit) move()
    getItem()
    if (time % itemSpeed === 0) createItem()
  }
  internalProcess()
  const draw = () => {
    context.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
    drawIndicator()
    drawCell()
  }
  draw()
  window.requestAnimationFrame(main)
}
main()

})()