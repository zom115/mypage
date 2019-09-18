!(_ = () => {'use strict'

const canvas = document.getElementById`canvas`
const context = canvas.getContext`2d`
const size = 2
const startPoint = (canvas.offsetWidth * 1 / 8)|0
let time
let ownCondition = {}
let locus = []
let needle = []
let needleCount
let holeSize
let dy
let dyMax
let speed
let interval
let highscore = 0
let score = 0
const setInitValue = () => {
  time = 0
  ownCondition = {y: (canvas.offsetHeight * 1 / 8)|0, dy: -3}
  locus = []
  needle = []
  needleCount = 0
  holeSize = 60
  dy = .1
  dyMax = 4
  speed = 2
  interval = {timestamp: 0, limit: 200}
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
    interval.limit -= 1
    if (needleCount % 5 === 0) {
      if (20 < holeSize && needleCount % 100 - 1 < 50) holeSize -= 2
      else if (10 < holeSize) holeSize -= 1
    }
    if (needleCount % 40 === 20) interval.limit -= 50
    else if (needleCount % 40 === 0) interval.limit += 50
    if (needleCount % 100 === 0) {
      holeSize += 10
      interval.limit += 75
    } else if (needleCount % 50 === 0) {
      holeSize += 15
      interval.limit += 25
    }
  }
  if (needle.length === 0) addHole()
  else needle.forEach(v => v.x -= speed)
  if (time === interval.timestamp + interval.limit) {
    interval.timestamp = time
    addHole()
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
  if (needle[0].x < startPoint && needle[0].flag) {
    if (
      needle[0].y < ownCondition.y &&
      ownCondition.y < needle[0].y + needle[0].hole
    ) {
      score += 1
      if (highscore < score) highscore = score
      const speedUp = (arg = 1) => {
        dy += .001 * arg
        dyMax += .04 * arg
        speed += .02 * arg
      }
      speedUp()
      if (score % 50 === 0) speedUp(-45)
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
  const displayHoleSize = (needle.length === 0) ? holeSize : (needle[0].flag) ? needle[0].hole : needle[1].hole
  context.fillText(`${displayHoleSize}mm`, canvas.offsetWidth * 3/5, canvas.offsetHeight * 2/16)
  context.fillText('現在', canvas.offsetWidth * 3/4, canvas.offsetHeight * 1/16)
  context.fillText(`${score}本`, canvas.offsetWidth * 3/4, canvas.offsetHeight * 2/16)
  context.fillText('最高', canvas.offsetWidth * 7/8, canvas.offsetHeight * 1/16)
  context.fillText(`${highscore}本`, canvas.offsetWidth * 7/8, canvas.offsetHeight * 2/16)
}
const main = () => {
  time += 1
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