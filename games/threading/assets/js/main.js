!(_ = () => {'use strict'

const canvas = document.getElementById`canvas`
const context = canvas.getContext`2d`
const size = 2
const startPoint = (canvas.offsetWidth * 1 / 8)|0
let timer = 0
let ownCondition = {}
let locus = []
let needle = []
let needleCount = 0
let holeSize
let dy
let dyMax
let speed
let interval
let highscore = 0
let score
const setInitValue = () => {
  timer = 0
  ownCondition = {y: (canvas.offsetHeight * 1 / 8)|0, dy: -3}
  locus = []
  needle = []
  needleCount = 0
  holeSize = 60
  dy = .1
  dyMax = 3
  speed = 2
  interval = 200
  if (highscore < score) highscore = score
  score = 0
}
setInitValue()
let key = false
document.addEventListener('keydown', () => key = true, false)
document.addEventListener('keyup', () => key = false, false)
canvas.addEventListener('mousedown', () => key = true, false)
canvas.addEventListener('mouseup', () => key = false, false)
const input = () => {
  if (key) {
    if(-dyMax < ownCondition.dy) ownCondition.dy += -dy
  } else if (ownCondition.dy < dyMax) ownCondition.dy += dy
}
const hole = () => {
  const addHole = () => {
    needle.push({
      x: canvas.offsetWidth,
      y: Math.random() * (canvas.offsetHeight - holeSize),
      hole : holeSize,
      flag: true
    })
    needleCount += 1
  }
  if (needle.length === 0) addHole()
  else needle.forEach(v => v.x -= speed)
  if (timer % interval === 0) {
    addHole()
    timer = 0
  }
}
const move = () => {
  ownCondition.y += ownCondition.dy
  locus.unshift({x: startPoint,y: ownCondition.y})
  locus.forEach(v => v.x -= speed)
  if (startPoint < locus.length) locus.pop()
}
const collisionDetect = () => {
  if (needle[0].x < 0) needle.shift()
  if (
    needle[0].x < startPoint &&
    needle[0].flag
  ) {
    if (
      needle[0].y < ownCondition.y &&
      ownCondition.y < needle[0].y + needle[0].hole
    ) {
      score += 1
      if (highscore < score) highscore = score
      if (score % 10 === 0) {
        if (20 < holeSize) holeSize -= 5
        else if (10 < holeSize) holeSize -= 2
        if (score === 50 || score === 100) {
          holeSize += 15
          dy += .05
          dyMax += 1.5
          speed += 1
          interval -= 50
          timer -= 50
        }
      }
      needle[0].flag = false
    } else setInitValue()
  }
}
context.font = `${size * 12}px sans-serif`
context.fillStyle = 'hsl(0, 0%, 100%)'
const draw = () => {
  locus.forEach((v, i) => {
    context.beginPath()
    context.arc(v.x, v.y, size, 0, Math.PI * 2, false)
    if (i !== 0) {
      context.arc((
        v.x + locus[i - 1].x) / 2, (v.y + locus[i - 1].y) / 2, size, 0, Math.PI * 2, false
      )
    }
    context.fill()
  })
  needle.forEach(v => {
    context.fillRect(v.x, v.y, size * 2, -size / 2)
    context.fillRect(v.x, v.y, size / 2, v.hole)
    context.fillRect(v.x + size * 2, v.y, -size / 2, v.hole)
    context.fillRect(v.x, v.y + v.hole, size * 2, canvas.offsetHeight / 2)
    context.fillRect(v.x + size / 2, v.y + canvas.offsetHeight / 2 + v.hole, size, size * 4)
  })
  context.textAlign = 'center'
  context.fillText('穴の大きさ', canvas.offsetWidth * 3/5, canvas.offsetHeight * 1/16)
  context.textAlign = 'right'
  context.fillText(holeSize, canvas.offsetWidth * 3/5, canvas.offsetHeight * 2/16)
  context.textAlign = 'left'
  context.fillText('mm', canvas.offsetWidth * 3/5, canvas.offsetHeight * 2/16)
  context.textAlign = 'center'
  context.fillText('現在', canvas.offsetWidth * 3/4, canvas.offsetHeight * 1/16)
  context.textAlign = 'right'
  context.fillText(score, canvas.offsetWidth * 3/4, canvas.offsetHeight * 2/16)
  context.textAlign = 'left'
  context.fillText('本', canvas.offsetWidth * 3/4, canvas.offsetHeight * 2/16)
  context.textAlign = 'center'
  context.fillText('最高', canvas.offsetWidth * 7/8, canvas.offsetHeight * 1/16)
  context.textAlign = 'right'
  context.fillText(highscore, canvas.offsetWidth * 7/8, canvas.offsetHeight * 2/16)
  context.textAlign = 'left'
  context.fillText('本', canvas.offsetWidth * 7/8, canvas.offsetHeight * 2/16)
}
const main = () => {
  timer += 1
  input()
  hole()
  move()
  collisionDetect()
  context.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
  draw()
  window.requestAnimationFrame(main)
}
main()

})()