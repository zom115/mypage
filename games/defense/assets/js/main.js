!(x = x => {'use strict'

const canvas = document.getElementById`canvas`
const context = canvas.getContext`2d`
const size = 16
let score
let highscore = 0
let time
let mouseFlag = false
let mouseCooldinate = {x: 0, y: 0}
const playerRadius = size
let bullets
const bulletRadius = size / 2
let rapidFireRate
let shotTimeStamp
let enemies
let enemyAppearanceRate
const decreaseRate = 5
const reactionRate = 5
const burstRate = 1
let enemyTimeStamp

const enemyRadius = size * 1.5
let afterglowScore
const displayTime = 60
const reset = () => {
  if (highscore < score) highscore = score
  score = 0
  time = 0
  bullets = []
  rapidFireRate = 60
  shotTimeStamp = -rapidFireRate
  enemies = []
  enemyAppearanceRate = 240
  enemyTimeStamp = -enemyAppearanceRate
  afterglowScore = []
}
reset()
canvas.addEventListener('mouseover', () => {
  document.draggable = false
  canvas.draggable = false
  document.getElementById`canvas`.style.cursor = 'none'
}, false)
canvas.addEventListener('mousemove', e => {
  let rect = e.target.getBoundingClientRect()
  mouseCooldinate.x = e.clientX - rect.left
  mouseCooldinate.y = e.clientY - rect.top
}, false)
const shot = () => {
  shotTimeStamp = time
  if (rapidFireRate < enemyAppearanceRate && reactionRate < rapidFireRate) {
    rapidFireRate -= burstRate
  }
  console.log(rapidFireRate, enemyAppearanceRate)
  const info = {
    x: canvas.offsetWidth / 2 - mouseCooldinate.x,
    y: canvas.offsetHeight / 2 - mouseCooldinate.y
  }
  info.distance = (info.x**2+info.y**2)**.5
  if (info.distance !== 0) {
    const bulletSpeed = 100
    bullets.push({
      x: canvas.offsetWidth / 2, y: canvas.offsetHeight / 2,
      dx: (info.x / info.distance) * (bulletSpeed / info.distance),
      dy: (info.y / info.distance) * (bulletSpeed / info.distance)
    })
  }
}
canvas.addEventListener('mousedown', () => {mouseFlag = true}, false)
canvas.addEventListener('mouseup', () => {mouseFlag = false}, false)
const internalProcess = () => {
  time += 1
  if (mouseFlag && shotTimeStamp + rapidFireRate < time) shot()
  const bulletProcess = () => {
    bullets.forEach((value, index) => {
      value.x -= value.dx
      value.y -= value.dy
      if (
        value.x < 0 || canvas.offsetWidth < value.x ||
        value.y < 0 || canvas.offsetHeight < value.y
      ) {
        bullets.splice(index, 1)
        score -= 10
        afterglowScore.push({
          x: canvas.offsetWidth - size * 1.8, y: size * 4.5,
          score: -10, time: displayTime
        })
      }
    })
  }
  const enemyProcess = () => {
    if (enemyTimeStamp + enemyAppearanceRate < time) {
      enemyTimeStamp = time
      if (rapidFireRate / 2 < enemyAppearanceRate) enemyAppearanceRate -= decreaseRate

      const r = ((canvas.offsetWidth / 1.8) ** 2 + (canvas.offsetHeight / 1.8) ** 2) ** .5
      const a = ~~(Math.random() * 360 + 1)
      enemies.push({
        x: canvas.offsetWidth / 2 + r * Math.cos(a * (Math.PI / 180)),
        y: canvas.offsetHeight / 2 + r * Math.sin(a * (Math.PI / 180)),
        hue: ~~(Math.random() * 360 + 1)
      })
    }
    enemies.forEach(value => {
    const width = canvas.offsetWidth / 2 - value.x
    const height = canvas.offsetHeight / 2 - value.y
    const length = (width ** 2 + height ** 2) ** .5
    const enemySpeed = 2.5
      value.x += (width / length) / enemySpeed
      value.y += (height / length) / enemySpeed
    })
  }
  const collisionDetect = () => {
    enemies.forEach((enemy, enemyIndex) => {
      const width = canvas.offsetWidth / 2 - enemy.x
      const height = canvas.offsetHeight / 2 - enemy.y
      const length = (width ** 2 + height ** 2) ** .5
      bullets.forEach((bullet, bulletIndex) => {
        const shotWidth = enemy.x - bullet.x
        const shotHeight = enemy.y - bullet.y
        const shotLength = (shotWidth ** 2 + shotHeight ** 2) ** .5
        if (shotLength < bulletRadius + enemyRadius) {
          const thisScore = length/10|0
          score += thisScore
          afterglowScore.push({x: enemy.x, y: enemy.y, score: thisScore, time: displayTime})
          enemies.splice(enemyIndex, 1)
          bullets.splice(bulletIndex, 1)
        }
      })
      if (length < playerRadius + enemyRadius) reset()
    })
  }
  bulletProcess()
  enemyProcess()
  collisionDetect()
}
const draw = () => {
  const indicator = () => {
    context.font = `${size}px sans-serif`
    context.fillStyle = 'hsl(0, 100%, 100%)'
    context.textAlign = 'right'
    context.fillText(`highscore : ${highscore}`, canvas.offsetWidth - size, size * 1.5)
    context.fillText(`score : ${score}`, canvas.offsetWidth - size, size * 3)
  }
  const rapidFire = () => {
    context.fillStyle = 'hsl(300, 100%, 85%)'
    const h = size / 4
    context.fillRect(
      0, canvas.offsetHeight - h,
      canvas.offsetWidth * ((time - shotTimeStamp) / rapidFireRate), h
    )
  }
  const player = () => {
    context.beginPath()
    context.arc(canvas.offsetWidth / 2, canvas.offsetHeight / 2, playerRadius, 0, Math.PI * 2, false)
    context.fillStyle = 'hsl(120, 100%, 85%)'
    context.fill()
  }
  const drawBullet = () => {
    bullets.forEach(value => {
      context.beginPath()
      context.arc(value.x, value.y, size / 2, 0, Math.PI * 2, false)
      context.fillStyle = 'hsl(300, 100%, 85%)'
      context.fill()
    })
  }
  const drawEnemy = () => {
    enemies.forEach(value => {
      context.beginPath()
      context.arc(value.x, value.y, enemyRadius, 0, Math.PI * 2, false)
      context.fillStyle = `hsl(${value.hue}, 100%, 85%)`
      context.fill()
    })
  }
  const corsor = () => {
    context.beginPath()
    context.arc(mouseCooldinate.x, mouseCooldinate.y, size / 2, 0, Math.PI * 2, false)
    context.fillStyle = 'hsl(60, 100%, 85%)'
    context.fill()
  }
  const drawAfterglow = () => {
    afterglowScore.forEach((value, index) => {
      context.font = `${size}px sans-serif`
      context.fillStyle = 'hsl(0, 100%, 100%)'
      context.textAlign = 'center'
      context.fillText(value.score, value.x, value.y)
      value.time -= 1
      if (value.time === 0) afterglowScore.splice(index, 1)
    })
  }
  indicator()
  if (time - shotTimeStamp < rapidFireRate) rapidFire()
  player()
  drawBullet()
  drawEnemy()
  corsor()
  if (0 < afterglowScore.length) drawAfterglow()
}
const main = () => {
  internalProcess()
  context.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
  draw()
  window.requestAnimationFrame(main)
}
main()

})()