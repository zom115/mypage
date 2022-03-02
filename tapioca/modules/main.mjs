import {code, keydownTimeStamp} from '../../modules/code.mjs'
import {frameCounter} from '../../modules/frameCounter.mjs'

window.addEventListener('keydown', e => e.preventDefault())

const version = 'v.0.9'
const canvas = document.getElementById`canvas`
const font = 'jkmarugo'

const SIZE = 32

canvas.addEventListener('mouseover', () => {
  document.draggable = false
  canvas.draggable = false
  // document.getElementById`canvas`.style.cursor = 'none'
}, false)
canvas.addEventListener('wheel', e => e.preventDefault(), false)
canvas.addEventListener('contextmenu', e => e.preventDefault())

const context = canvas.getContext`2d`
context.imageSmoothingEnabled =
  context.msImageSmoothingEnabled =
  context.webkitImageSmoothingEnabled = false
const storage = localStorage
document.getElementById('clear').addEventListener('click', () => {
  storage.clear()
})
const extractCode = (text) => {
  text = text.replace('Key', '')
  text = text.replace('Digit', '')
  return text
}
const DOM = {
  operation: document.getElementById`operation`,
  inventory: document.getElementById`inventory`,
  reload: document.getElementById`reload`,
  modeSelect: document.getElementById`modeSelect`,
  rotateSlot: document.getElementById`rotateSlot`,
  pause: document.getElementById`pause`,
  debug: document.getElementById`debug`,
  settings: document.getElementById`settings`,
}
const setDOM = (key, value) => {
  if (Object.keys(DOM).some(x => x === key)) {
    DOM[key].innerHTML = extractCode(value).toUpperCase()
  }
}
const setStorageFirst = (key, value) => {
  const exists = storage.getItem(key)
  if (exists) {
    setDOM(key, exists)
    return exists
  }
  storage.setItem(key, value)
  setDOM(key, value)
  return value
}
const setStorage = (key, value) => {
  storage.setItem(key, value)
  setDOM(key, value)
  return value
}

class SpotField {
  static locationList = [
    'bazaar',
    'dungeon'
  ]
  location = ''

  static dungeonList = [
    'Zombie',
    'Homing',
    'Ruins Star',
    'Boss',
    'Map Test'
  ]
  dungeon = ''
}
const spot = new SpotField()
spot.location = SpotField.locationList[0]
spot.dungeon = SpotField.dungeonList[0]

class EnemyField {
  static Enemy_Image_Amount = 3
  enemies = []
  defeatCount = 0
}
const enemyInfo = new EnemyField()

let wave = {
  number: 0,
  enemySpawnInterval: 0, // ms
  enemySpawnIntervalLimit: 0, // ms
  enemyCount: 0,
  enemyLimit: 0,
  roundInterval: 0, // ms
  roundIntervalLimit: 2000, // ms
  enemyHitPoint: 0
}

let bossArray = []
let enemyBulletArray = []
let array = [enemyBulletArray, bossArray]

/*
class EnemyBullet {
  constructor (life, x, y, radius, speed, theta, additionalRadius = 0, additionalSpeed = 0, additionalTheta = 0) {
    this.life = life
    this.x = x
    this.y = y
    this.radius = radius
    this.speed = speed
    this.theta = theta
    this.additionalRadius = additionalRadius
    this.additionalSpeed = additionalSpeed
    this.additionalTheta = additionalTheta
  }
  update = (intervalDiffTime) => {
    this.life -= intervalDiffTime
    this.x += this.speed * Math.cos(this.theta) * intervalDiffTime
    this.y += this.speed * Math.sin(this.theta) * intervalDiffTime
    this.radius += this.additionalRadius * intervalDiffTime
    this.speed += this.additionalSpeed * intervalDiffTime
    this.theta += this.additionalTheta * intervalDiffTime
  }
  render = () => {
    context.save()
    context.fillStyle = 'hsl(0, 100%, 100%)'
    context.beginPath()
    context.arc(relativeX(this.x), relativeY(this.y), this.radius, 0, 2 * Math.PI)
    context.fill()
    context.restore()
  }
}
class HomingBullet {
  constructor (life, x, y, radius, speed, theta, waitTime, homingSpeed, deltaTheta) {
    this.life = life
    this.x = x
    this.y = y
    this.radius = radius
    this.speed = speed
    this.theta = theta
    this.waitTime = waitTime
    this.isHoming = false
    this.homingSpeed = homingSpeed
    this.deltaTheta = deltaTheta
  }
  update = (intervalDiffTime) => {
    this.life -= intervalDiffTime
    this.waitTime -= intervalDiffTime
    const DELTA_THETA = this.deltaTheta * intervalDiffTime
    this.theta +=
      (this.x + this.radius * Math.cos(this.theta) - this.x) * (ownPosition.y - this.y) - (
        ownPosition.x - this.x) * (this.y + this.radius * Math.sin(this.theta) - this.y) < 0 ?  // Cross product
      -DELTA_THETA : DELTA_THETA
    const SPEED = this.waitTime <= 0 ? this.homingSpeed : this.speed
    this.x += SPEED * Math.cos(this.theta) * intervalDiffTime
    this.y += SPEED * Math.sin(this.theta) * intervalDiffTime
  }
  render = () => {
    context.save()
    context.fillStyle = 'hsl(0, 100%, 100%)'
    context.beginPath()
    context.arc(relativeX(this.x), relativeY(this.y), this.radius, 0, 2 * Math.PI)
    context.fill()
    context.restore()
  }
}

class Boss {
  constructor (x, y, life) {
    this.x = x,
    this.y = y,
    this.life = life
    this.lifeLimit = life
    this.initialTime = 3000
    this.initialTimeLimit = 3000
    this.state = 'active'
    this.coolTime = 0
    this.count = 3
    this.front = 0
  }
  update (intervalDiffTime) {
    if (this.initialTime <= 0) this.life -= intervalDiffTime
    if (0 < this.initialTime) this.initialTime -= intervalDiffTime
    if (0 < this.coolTime) this.coolTime -= intervalDiffTime
    else this.state = 'active'
    this.bulletController()
  }
  bulletController () {
    if (this.life < 25000 && this.state === 'active') {
      this.front = this.getFront()
      const SEMISIRCLE = this.count % 2 ? 0 : Math.PI
      enemyBulletArray.push(new HomingBullet(
        10000, this.x, this.y, 8, .1, this.front + Math.PI * .5 + SEMISIRCLE + Math.random() * .5, 1500, .25, .001))
      this.count += 1
      this.state = 'wait'
      if (this.count % 16 === 0) {
        this.coolTime = 2000
        this.count = 0
      } else this.coolTime = 150
    }
    if (35000 < this.life && this.life < 40000) this.count = 0
    if (45000 < this.life && this.life < 60000 && this.state === 'active') {
      const sign = this.count % 2 ? 1 : -1
      enemyBulletArray.push(
        new EnemyBullet(20000, this.x, this.y, 16, .15, 2 * Math.PI * Math.random(), .001, 0, sign * Math.PI * .0001))
      this.count += 1
      this.state = 'wait'
      this.coolTime = 100
    }
    if (63000 < this.life && this.life < 64000) this.count = 0
    if (65000 < this.life && this.life < 95000 && this.state === 'active') { // balkan
      this.front = this.getFront()
      const VALUE = Math.floor(this.count * .02) + 4
      for (let i = 0; i < VALUE; i++) {
        enemyBulletArray.push(new EnemyBullet(
          20000, this.x, this.y, 8, .1, this.front + 2 * Math.PI * (i + .5) / VALUE))
      }
      const WEIGHT = 25
      if (this.count % WEIGHT === 0) {
        const N = Math.ceil(this.count / WEIGHT) + 4
        for (let i = 0; i < N; i++) {
          enemyBulletArray.push(new EnemyBullet(
            20000, this.x, this.y, 8, .15, this.front + 2 * Math.PI * i / N, .3 / N))
        }
      }
      this.count += 1
      this.state = 'wait'
      this.coolTime = 150
    }
    if (95000 < this.life && this.life < 96000) this.count = 0
    if (100000 < this.life && this.life < 127000 && this.state === 'active') { // n-way around
      if (this.count === 3) this.front = this.getFront()
      for (let i = 0; i < this.count; i++) {
        enemyBulletArray.push(new EnemyBullet(
          20000, this.x, this.y, 190 - this.count * 8, .1, this.front + this.count % 2 * Math.PI + 2 * Math.PI * i / this.count))
      }
      this.count += 1
      this.state = 'wait'
      this.coolTime = 3000
    }
  }
  getFront () {
    return Math.atan2(ownPosition.y - this.y, ownPosition.x - this.x)
  }
  render () {

    if (0 < this.initialTime) this.renderWarning()
    context.save()
    context.fillStyle = 'hsla(0, 100%, 50%, .7)'
    const ratio = 0 < this.initialTime ? (
      this.initialTimeLimit - this.initialTime) / this.initialTimeLimit : 1
    context.fillRect( // life gauge
      canvas.offsetWidth * .25,
      canvas.offsetHeight * .05,
      canvas.offsetWidth * .5 * this.life / this.lifeLimit * ratio,
      canvas.offsetHeight * .005
    )
    context.strokeStyle = 'hsla(0, 0%, 0%, .3)'
    context.strokeRect( // life outline
      canvas.offsetWidth * .25, canvas.offsetHeight * .05, canvas.offsetWidth * .5, canvas.offsetHeight * .005)
    context.font = `Italic ${SIZE * .5}px ${font}`
    context.fillStyle = 'hsla(0, 0%, 100%, .7)'
    context.textAlign = 'right'
    context.fillText(Math.floor(this.life * ratio), canvas.offsetWidth * .75, canvas.offsetHeight * .075)
    context.fillStyle = 'hsl(120, 100%, 50%)'
    // context.beginPath()
    // context.arc(relativeX(this.x), relativeY(this.y), size * .5, 0, 2 * Math.PI)
    // context.fill()
    const IMAGE_PATH = 'images/JK1_NN.png'
    drawImage(
      IMAGE[IMAGE_PATH],
      relativeX(this.x - IMAGE[IMAGE_PATH].width / 2),
      relativeY(this.y - IMAGE[IMAGE_PATH].height / 2))
    // context.arc(relativeX(this.x), relativeY(this.y), size * .5, 0, 2 * Math.PI)

    context.restore()
  }
  renderWarning () {
    context.save()
    const a = 500
    const alpha =
      this.initialTime <= a ? context.globalAlpha = this.initialTime / a :
      this.initialTimeLimit - a <= this.initialTime ?
      context.globalAlpha = (this.initialTimeLimit - this.initialTime) / a : 1
    context.fillStyle = `hsla(0, 0%, 0%, ${alpha})`
    context.fillRect(0, canvas.offsetHeight * .3, canvas.offsetWidth, canvas.offsetHeight * .4)

    context.fillStyle = `hsla(0, 100%, 50%, ${alpha})`
    context.font = `bold ${SIZE * 4}px ${font}`
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText('WARNING', canvas.offsetWidth * .5, canvas.offsetHeight * .5)
    let offsetY = canvas.offsetHeight * .31
    const length = 24
    const speed = 2
    for (let i = 0; i < length; i++) {
      const offsetX = SIZE * i * 2 - (this.initialTime / 10) % SIZE * 2 * speed
      context.beginPath()
      context.moveTo(offsetX, offsetY)
      context.lineTo(offsetX + SIZE, offsetY)
      context.lineTo(offsetX - SIZE * .5, offsetY + canvas.offsetHeight * .08)
      context.lineTo(offsetX - SIZE * 1.5, offsetY + canvas.offsetHeight * .08)
      context.closePath()
      context.fill()
    }
    offsetY = canvas.offsetHeight * .61
    for (let i = 0; i < length; i++) {
      const offsetX = SIZE * i * 2 + (this.initialTime / 10) % SIZE * 2 * speed - SIZE * 16
      context.beginPath()
      context.moveTo(offsetX, offsetY)
      context.lineTo(offsetX + SIZE, offsetY)
      context.lineTo(offsetX - SIZE * .5, offsetY + canvas.offsetHeight * .08)
      context.lineTo(offsetX - SIZE * 1.5, offsetY + canvas.offsetHeight * .08)
      context.closePath()
      context.fill()
    }

    context.restore()
  }
}
*/

const radius = SIZE / 2

const targetWidth = .7 // Unit: [m], for effective range
const minImgRadius = SIZE / 4
let afterglow = {
  startBoss: 0,
  startBossLimit: 3000,
  endBoss: 0,
  save: 0,
  point: [],
  inventory: 0,
  recoil: 0,
  round: 0,
  limitBreakResult: 0,
  limitBreakSuccess: 0,
  limitBreakFailed: 0,
  chamberFlag: false,
  reload: 0
}

class EventDispatcher {
  constructor () {
    this._eventListeners = {}
  }

  addEventListener (type, callback) {
    if (this._eventListeners[type] === undefined) {
      this._eventListeners[type] = []
    }

    this._eventListeners[type].push(callback)
  }

  dispatchEvent (type, event) {
    const listeners = this._eventListeners[type]
    if (listeners !== undefined) listeners.forEach((callback) => callback(event))
  }
}

class Ownself {
  constructor () {
    this.x = canvas.offsetWidth * .5
    this.y = canvas.offsetHeight * .5
    this.speed = .05

    this.afterimage = []
    this.direction = 0
    this.currentDirection = 4
    this.dx = 0
    this.dy = 0
    this.radius = 0
    this.theta = 0
    this.moveRecoil = 2
    this.step = 0
    this.stepLimit = 300

    this.r = SIZE * .25
  }
  setTheta = d => {
    /*
      6 4 12
      2 0 8
      3 1 9
    */
    if (d === 1) this.theta = -Math.PI / 2
    else if (d === 3) this.theta = -Math.PI / 4
    else if (d === 2) this.theta = 0
    else if (d === 6) this.theta = Math.PI / 4
    else if (d === 4) this.theta = Math.PI / 2
    else if (d === 12) this.theta = Math.PI * .75
    else if (d === 8) this.theta = Math.PI
    else if (d === 9) this.theta = -Math.PI * .75
  }
  inputProcess = (input) => {
    if (input.getKey('KeyW')) this.direction = (this.direction + 1)|0
    if (input.getKey('KeyD')) this.direction = (this.direction + 2)|0
    if (input.getKey('KeyS')) this.direction = (this.direction + 4)|0
    if (input.getKey('KeyA')) this.direction = (this.direction + 8)|0
    else if (this.direction !== 0) this.currentDirection = this.direction
  }
  dashProcess = (intervalDiffTime) => {
    if (dash.coolTime <= 0 && code[action.dash].isFirst()) {
      const d = this.direction === 0 ? this.currentDirection : this.direction
      this.setTheta(d)
      this.radius = 1
      const multiple = 0.3
      this.dx += multiple * this.radius * Math.cos(this.theta) * intervalDiffTime
      this.dy += multiple * this.radius * Math.sin(this.theta) * intervalDiffTime
      dash.isAttack = false
      dash.coolTime = dash.coolTimeLimit
    }
    // Reset
    if (0 < dash.coolTime) dash.coolTime -= intervalDiffTime
  }
  moveProcess = (intervalDiffTime, map) => {
    this.setTheta(this.direction)
    if (this.direction === 0) this.radius = 0
    else this.radius = 1
    const multiple = 0.0008
    this.dx += multiple * this.radius * Math.cos(this.theta) * intervalDiffTime
    this.dy += multiple * this.radius * Math.sin(this.theta) * intervalDiffTime

    const collisionDetect = () => {
      let cross = []

      const terrainObject = {'0': [[0, 1], [0, 0], [1, 0], [1, 1]]}
      const collisionCheck = collision => {
        for (let x = 0; x < collision.width; x++) {
          if (x * SIZE + SIZE * 2 < this.x) continue
          if (this.x < x * SIZE - SIZE) break
          for (let y = 0; y < collision.height; y++) {
            const id =
              collision.data[collision.width * y + x] -
              map.tilesets.filter(v =>v.source.includes('collision'))[0].firstgid
            if (id < 0) continue
            terrainObject[id].forEach((ro, i) => { // relative origin
              const rn = // relative next
                i === terrainObject[id].length - 1 ? terrainObject[id][0] :
                terrainObject[id].slice(i + 1)[0]
              let tilt = Math.atan2(rn[1] - ro[1], rn[0] - ro[0])
              const ox = this.x
              const oy = this.y
              const dx = this.dx * intervalDiffTime
              const dy = this.dy * intervalDiffTime
              const ax = x * SIZE + ro[0] * SIZE
              const ay = y * SIZE + ro[1] * SIZE
              const bx = x * SIZE + rn[0] * SIZE
              const by = y * SIZE + rn[1] * SIZE
              const abx = bx - ax
              const aby = by - ay
              let nx = -aby
              let ny = abx
              let length = (nx ** 2 + ny ** 2) ** .5
              if (0 < length) length = 1 / length
              nx *= length
              ny *= length
              let nax = ax - nx * this.r
              let nay = ay - ny * this.r
              let nbx = bx - nx * this.r
              let nby = by - ny * this.r
              const d = -(nax * nx + nay * ny)
              const t = -(nx * ox + ny * oy + d) / (nx * dx + ny * dy)
              if (0 < t && t <= 1) {
                const cx = ox + dx * t
                const cy = oy + dy * t
                const acx = cx - nax
                const acy = cy - nay
                const bcx = cx - nbx
                const bcy = cy - nby
                const doc = acx * bcx + acy * bcy
                if (doc <= 0) {
                  cross.push([t, tilt])
                }
              }
            })
          }
        }
      }
      const collisionResponse = tilt => {
        const nX = Math.sin(tilt)
        const nY = Math.cos(tilt)
        const t = -(this.dx * nX + this.dy * nY) / (nX ** 2 + nY ** 2)
        this.dx = t * nX
        this.dy = t * nY
      }
      let count = 0
      let isRepeat
      do {
        isRepeat = false
        count++
        if (3 < count) {
          this.dx = 0
          this.dy = 0
          console.log('Catched an unexpected error. Collision detect loop forever.')
          break
        }
        map.layers.filter(v => v.name.includes('collision_')).forEach(collision => {
          collisionCheck(collision)
        })
        // 周辺全件判定して一番近い交点をresponse
        if (cross.length != 0) {
          const max = cross.reduce((p, c) => {
            if (c[0] < p[0]) return p
            return c
          })
          collisionResponse(max[1])
        }
        this.x += this.dx * intervalDiffTime
        this.y += this.dy * intervalDiffTime
      } while(isRepeat)
    }
    collisionDetect()

    // Normal force
    const brake = .98
    if (Math.abs(this.dx) < 1e-5) this.dx = 0
    else this.dx *= brake
    if (Math.abs(this.dy) < 1e-5) this.dy = 0
    else this.dy *= brake

    // Reset
    if (this.direction !== 0) this.direction = 0
  }

  update = (intervalDiffTime, input, map) => {
    this.inputProcess(input)
    this.dashProcess(intervalDiffTime, input)
    this.moveProcess(intervalDiffTime, map)
  }

  drawAim = (cursor) => { // Expected effective range
    const radius =
      Math.sqrt((screenOwnPos.x - cursor.offsetX) ** 2 + (screenOwnPos.y - cursor.offsetY) ** 2) / 20
    let aimRadius = (
      targetWidth * radius / inventory[selectSlot].effectiveRange) * (
      1 + inventory[selectSlot].recoilEffect + Math.sqrt(this.dx ** 2 + this.dy ** 2) * this.moveRecoil)
    context.save()
    context.strokeStyle = 'hsl(0, 0%, 100%)'
    context.beginPath()
    context.arc(cursor.offsetX, cursor.offsetY, aimRadius * 20, 0, Math.PI * 2)
    context.stroke()
    context.restore()
  }
  render = (intervalDiffTime, cursor) => {
    if (inventory[selectSlot].category !== '' && !inventoryFlag) this.drawAim(cursor)

    if (this.stepLimit <= this.step) this.step = 0 // reset
    if (this.radius === 0) this.step = 0
    else this.step += intervalDiffTime
    // y = -4 * (x - .5) ** 2 + 1
    const formula = -4 * (this.step / this.stepLimit - .5) ** 2 + 1
    const isJumpImage = .3 < formula ? true : false
    const jump = .8 < formula ? 1 : 0
    const setOwnImageFromDiff = (dx, dy) => {
      const coefficient = .2
      return false ? 'images/TP2F.png' : // TODO: Pre-check max diff
        dy < 0 && dx ** 2 < coefficient * dy ** 2 ? 'images/TP2U.png' :
        0 < dx && dy ** 2 < coefficient * dx ** 2 ? 'images/TP2R.png' :
        0 < dy && dx ** 2 < coefficient * dy ** 2 ? 'images/TP2D.png' :
        dx < 0 && dy ** 2 < coefficient * dx ** 2 ? 'images/TP2L.png' :
        dy < 0 && 0 < dx ? 'images/TP2RU.png' :
        0 < dy && 0 < dx ? 'images/TP2RD.png' :
        0 < dy && dx < 0 ? 'images/TP2LD.png' :
        dy < 0 && dx < 0 ? 'images/TP2LU.png' : 'images/TP2F.png'
    }
    const imgMyself =
      this.radius === 0 || !isJumpImage ? 'images/TP2F.png' : setOwnImageFromDiff(this.dx, this.dy)

    const pos =
      settingsObject.isMiddleView ? {x: screenOwnPos.x, y: screenOwnPos.y - jump} : {
        x: canvas.offsetWidth / 2,
        y: canvas.offsetHeight / 2
      }
    context.fillStyle = 'hsla(0, 0%, 0%, .2)' // shadow
    context.beginPath()
    context.arc(
      pos.x + radius * .05, pos.y + radius * .6, SIZE / 4, 0, Math.PI * 2, false
    )
    context.fill()
    if (0 < dash.coolTime) {
      const angle =
        dash.coolTime < dash.coolTimeLimit - dash.invincibleTime ?
        dash.coolTime / (dash.coolTimeLimit - dash.invincibleTime) * Math.PI * 2 :
        Math.PI * 2
      context.fillStyle = 'hsla(0, 100%, 100%, .5)'
      context.beginPath()
      context.moveTo(pos.x, pos.y)
      context.arc(
        pos.x, pos.y, SIZE / 2, -Math.PI * .5, -angle - Math.PI * .5, true
      )
      context.fill()
    }
    context.save()
    if (dash.coolTimeLimit - dash.invincibleTime < dash.coolTime) {
      this.afterimage.push({x: this.x, y: this.y - jump, alpha: .5})
    }
    this.afterimage.forEach((own, index) => {
      context.save()
      context.globalAlpha = own.alpha
      context.drawImage(IMAGE[imgMyself],
        ~~(this.relativeX(own.x - SIZE / 2)+.5),
        ~~(this.relativeY(own.y - SIZE / 2)+.5)
      )
      context.restore()
      own.alpha = own.alpha - .1
      if (own.alpha <= 0) this.afterimage.splice(index, 1)
    })
    context.drawImage(IMAGE[imgMyself], ~~(pos.x - radius+.5), ~~(pos.y - radius+.5))
    context.restore()
  }
}

let dash = {
  coolTime: 0,
  coolTimeLimit: 1000,
  damage: 150,
  invincibleTime: 200,
  isAttack: false
}

let point = 0

/*
let portalFlag = false
let portalCooldinate = {x: ownPosition.x|0, y: (ownPosition.y + SIZE * 3)|0}
let portalParticleTime = 0
let portalParticle = []
*/

const weaponModeList = ['MANUAL', 'SEMI', 'BURST', 'AUTO']
const weaponRarityList = ['Common', 'Uncommon', 'Rare', 'Epic'] // , 'Legendary'
const weaponRatiryColorList = [
  'hsl(0, 0%, 100%)',
  'hsl(120, 100%, 75%)',
  'hsl(210, 100%, 50%)',
  'hsl(270, 100%, 50%)',
  'hsl(30, 100%, 50%)',
]
const weaponCategoryList = ['HG', 'SMG', 'AR', 'DMR', 'SR', 'SG']
class Weapon {
  constructor (
    name, category, modeList, mode, rarity, damage, slideSpeed, bulletSpeed, bulletLife, reloadSpeed,
    magazineSize, magazines, loadingSpeed, penetrationForce, roundLimit, effectiveRange, recoilCoefficient,
    gaugeNumber, limitBreak, limitBreakIndex, level
  ) {
    this.name = name
    this.category = category
    this.modeList = modeList
    this.mode = mode
    this.rarity = rarity
    this.damage = damage
    this.slideSpeed = slideSpeed
    this.bulletSpeed = bulletSpeed
    this.bulletLife = bulletLife
    this.baseReloadSpeed = reloadSpeed
    this.reloadSpeed = reloadSpeed
    this.magazineSize = magazineSize
    this.magazines = magazines
    this.loadingSpeed = loadingSpeed
    this.penetrationForce = penetrationForce
    this.disconnector = false
    this.round = 0
    this.roundLimit = roundLimit
    this.effectiveRange = effectiveRange
    this.gaugeNumber = gaugeNumber

    this.chamber = false
    this.gripFlag = false
    this.grip = 1

    this.slideTime = 1
    this.slideStop = 18
    this.slideDone = 7
    this.slideState = 'done'

    this.reloadTime = 1,
    this.reloadRelease = 10,
    this.reloadPutAway = 15,
    this.reloadTakeOut = 15,
    this.reloadUnrelease = 10,
    this.reloadState = 'done',
    this.reloadAuto = setStorageFirst('autoReload', 'ON')

    this.recoilEffect = 0
    this.recoilCoefficient = recoilCoefficient
    this.recoilMultiple = .99 // TODO: to consider

    this.limitBreak = limitBreak
    this.limitBreakIndex = limitBreakIndex

    this.level = level
  }
}
let warehouse = []
let isWarehouse = false
let orderNumber = -1
let isDescending = false
let inventory = []
let holdSlot = {category: ''}
let mainSlotSize = 3
let inventorySize = 10
let inventoryFlag = false
let selectSlot = 0
let dropItems = []
let bullets = []
class Bullet {
  constructor (x, y, radius, theta, life, damage, penetrationForce, bulletRadius, isHoming) {
    this.x = x
    this.y = y
    this.radius = radius
    this.theta = theta
    this.life = life
    this.baseLife = life
    this.damage = damage
    this.penetrationForce = penetrationForce
    this.detectFlag = false
    this.detectID = -1
    this.bulletRadius = bulletRadius // size / 6
    this.isHoming = isHoming

    this.bulletSpeed = SIZE / 8
  }
  update(intervalDiffTime) {
    this.life -= intervalDiffTime
    this.x += this.radius * Math.cos(this.theta) * intervalDiffTime
    this.y += this.radius * Math.sin(this.theta) * intervalDiffTime
    bullets.forEach((bullet, i) => {
      const hit = enemyInfo.enemies.findIndex((enemy, index) => {
        return index !== bullet.detectID && 0 < enemy.life &&
        Math.sqrt((bullet.x - enemy.x) ** 2 + (bullet.y - enemy.y) ** 2) < radius + this.bulletRadius
      })
      if (hit !== -1) {
        if (!bullet.detectFlag && bullet.detectID !== hit) {
          bullet.detectFlag = true
          bullet.detectID = hit
          let damage = this.damage * bullet.life / this.baseLife
          enemyInfo.enemies[hit].life = enemyInfo.enemies[hit].life - damage
          bullet.life = bullet.life * this.penetrationForce
          if (inventory[selectSlot].level < wave.number) { // TODO: level infuse to bullet
            const additionalPoint = (enemyInfo.enemies[hit].life <= 0) ? 100 : 10
            if (additionalPoint === 100) enemyInfo.defeatCount = (enemyInfo.defeatCount+1)|0
            point = (point+additionalPoint)|0
            afterglow.point.push({number: additionalPoint, count: 30})
          }
          enemyInfo.enemies[hit].damage = damage
          enemyInfo.enemies[hit].timer = damageTimerLimit
        }
      }
    })
  }
}
const magSizeInitial = 7
let cartridgeInfo = {
  life: 1000, // ms
  speed: 1
}
let ammo
let loading = {
  time: 0,
  takeOut: 15,
  takeOutFlag: false,
  done: 60,
  weight: 1
}
let combatReload = {
  magFlag: false,
  flag: false,
  weight: 4,
  auto: setStorageFirst('autoCombatReload', 'OFF')
}

let action

// for settings

let settingsObject = {
  isManipulateSlotAnytime:
    storage.getItem('isManipulateSlotAnytime') ? JSON.parse(storage.getItem('isManipulateSlotAnytime')) : true,
  isTutorialTooltip: storage.getItem('isTutorialTooltip') ? JSON.parse(storage.getItem('isTutorialTooltip')) : true,
  isManipulateCode: storage.getItem('isManipulateCode') ? JSON.parse(storage.getItem('isManipulateCode')) : true,
  isMiddleView: storage.getItem('isMiddleView') ? JSON.parse(storage.getItem('isMiddleView')) : false,
  isReverseBoundary: storage.getItem('isReverseBoundary') ? JSON.parse(storage.getItem('isReverseBoundary')) : false
}
// let isTutorialTooltip = false

// for display
let screenOwnPos = {x: 0, y: 0}

const setAbsoluteBox = (box) => {
  context.save()
  context.font = `${SIZE}px ${font}`
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  const measure = context.measureText(box.text)
  box.absoluteX = box.offsetX - measure.actualBoundingBoxLeft - SIZE / 4,
  box.absoluteY = box.offsetY - measure.actualBoundingBoxAscent - SIZE / 4,
  box.width = measure.width + SIZE / 2
  box.height = measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent + SIZE / 2
  context.restore()
}
let portalConfirmBox = [{
  offsetX: canvas.offsetWidth * 1 / 3,
  offsetY: canvas.offsetHeight * 2 / 5,
  absoluteX: 0,
  absoluteY: 0,
  width: 0,
  height: 0,
  text: 'Yes',
  hue: 210
}, {
  offsetX: canvas.offsetWidth * 2 / 3,
  offsetY: canvas.offsetHeight * 2 / 5,
  absoluteX: 0,
  absoluteY: 0,
  width: 0,
  height: 0,
  text: 'No(Continue)',
  hue: 30
}, {
  offsetX: canvas.offsetWidth / 2,
  offsetY: canvas.offsetHeight * 2 / 5,
  absoluteX: 0,
  absoluteY: 0,
  width: 0,
  height: 0,
  text: 'Yes',
  hue: 30
}]
portalConfirmBox.forEach(v => setAbsoluteBox(v))
let titleMenuWordArray = []
let resultBackBox = {
  offsetX: canvas.offsetWidth / 2,
  offsetY: canvas.offsetHeight * 7 / 8,
  absoluteX: 0,
  absoluteY: 0,
  width: 0,
  height: 0,
  text: 'Rerutn to base',
  hue: 210
}
setAbsoluteBox(resultBackBox)
const setTitleMenuWord = () => {
  titleMenuWordArray = [{
    offsetX: 0,
    offsetY: 0,
    absoluteX: 0,
    absoluteY: 0,
    width: 0,
    height: 0,
    text: `Start`,
    hue: 10
  }
  ]
  titleMenuWordArray.forEach((v, i) => {
    const property = {
      offsetX: canvas.offsetWidth / 2,
      offsetY: canvas.offsetHeight * (2 / 3 + i / 11)
    }
    Object.assign(
      titleMenuWordArray[i], {
        offsetX: property.offsetX,
        offsetY: property.offsetY
    })
    setAbsoluteBox(v)
  })
  context.restore()
}
let inventorySlotBox = []
{
  for (let i = 0; i < mainSlotSize; i++) {
    inventorySlotBox.push({absoluteX: SIZE * (.75 + 2 * i), absoluteY: SIZE * .5, width: SIZE * 1.5, height: SIZE * 1.5})
  }
  const columnSize = 5
  for (let i = 0; i < Math.ceil(inventorySize / columnSize); i++) {
    for (let j = 0; j < columnSize; j++) {
      inventorySlotBox.push({
        absoluteX: SIZE * (.75 + 2 * j), absoluteY: SIZE * (2.75 + 2 * i), width: SIZE * 1.5, height: SIZE * 1.5})}
  }
}

const damageTimerLimit = 30

const strokeText = (text, x, y, maxWidth) => {
  context.strokeText(text, x, y, maxWidth)
  context.fillText(text, x, y, maxWidth)
}
const inventoryBox = {
  absoluteX: SIZE * .25,
  absoluteY: SIZE * .25,
  width: SIZE * 10.5,
  height: SIZE * 6.25
}
const setWave = () => {
  if (wave.number === 0) dropItems = []
  wave.roundInterval = 0
  afterglow.round = 0

  wave.number += 1
  wave.enemySpawnInterval = 0
  wave.enemySpawnIntervalLimit =
    wave.enemySpawnIntervalLimit === 0 ? 500 :
    wave.enemySpawnIntervalLimit < 100 ? 100 :
    wave.enemySpawnIntervalLimit * .95
  wave.enemyCount = 0
  wave.enemyLimit =
    wave.number === 1 ? 6 :
    wave.number === 2 ? 8 :
    wave.number === 3 ? 13 :
    wave.number === 4 ? 18 :
    wave.number === 5 ? 24 :
    wave.number === 6 ? 27 : // unconfirmed
    wave.number === 7 ? 28 : // same on top
    wave.number === 8 ? 29 : // same on top
    wave.number === 9 ? 31 : // same on top
    .0842 * wave.number ** 2 + .1954 * wave.number + 22.05 +.5|0
  wave.enemyHitPoint =
    wave.number === 1 ? 150 :
    wave.number === 2 ? 250 :
    wave.number === 3 ? 350 :
    wave.number === 4 ? 450 :
    wave.number === 5 ? 550 :
    wave.number === 6 ? 650 :
    wave.number === 7 ? 750 :
    wave.number === 8 ? 850 :
    wave.number === 9 ? 950 :
    wave.enemyHitPoint === 0 ? 950 * (1.1 ** (wave.number - 10)) :
    wave.enemyHitPoint * 1.1
}
const saveProcess = (isInventory = true, isPoint = true, isPortal = true, isWave = true, isWarehouse = true) => {
  if (isInventory) storage.setItem('inventoryArray', JSON.stringify(inventory))
  if (isPoint) storage.setItem('point', JSON.stringify(point))
  // if (isPortal) storage.setItem('portalFlag', JSON.stringify(portalFlag))
  if (isWave) storage.setItem('waveNumber', JSON.stringify(wave.number))
  if (isWarehouse) storage.setItem('warehouseArray', JSON.stringify(warehouse))
  afterglow.save = 1000
}
const warehouseBox = {
  absoluteX: SIZE * .25,
  absoluteY: SIZE * 6.75,
  width: SIZE * 20.5,
  height: SIZE * 15.5
}

class BoxInterface {
  isInner = (box, cursor) => {
    const offset = {
      x: cursor.offsetX - box.absoluteX,
      y: cursor.offsetY - box.absoluteY
    }
    return 0 <= offset.x && offset.x <= box.width &&
    0 <= offset.y && offset.y <= box.height
  }
  isDownInBox = (box, isLeftMouseDown, cursor) => {
    if (!isLeftMouseDown) return false
    return this.isInner(box, cursor)
  }
  isDownAndUpInBox = (box, isLeftMouseUp, cursor, mouseDownPos) => {
    if (!isLeftMouseUp) return false
    return this.isInner(box, mouseDownPos) && this.isInner(box, cursor)
  }
}
class RenderBox {
  constructor () {
    this.boxInterface = new BoxInterface()
  }
  render (box, mouseInput, cursor, alpha = 1) {
    context.save()
    // outline box
    const saturation = 90
    context.strokeStyle = `hsl(${box.hue}, ${saturation}%, 60%)`
    context.strokeRect(box.absoluteX, box.absoluteY, box.width, box.height)
    // text highlight
    if (this.boxInterface.isInner(box, cursor)) {
      const lightness = mouseInput.getKeyDown(0) ? 70 : 75
      context.fillStyle = `hsla(${box.hue}, ${saturation}%, ${lightness}%, .5)`
      context.fillRect(box.absoluteX, box.absoluteY, box.width, box.height)
    }
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.font = `${SIZE}px ${font}`
    context.fillStyle = `hsla(${box.hue}, ${saturation}%, 50%, ${alpha})`
    context.fillText(box.text, box.offsetX, box.offsetY)
    context.restore()
  }
}

class StartSpot extends EventDispatcher {
  constructor () {
    super()
    this.startBox = {
      offsetX: canvas.offsetWidth / 2,
      offsetY: canvas.offsetHeight / 5,
      absoluteX: 0,
      absoluteY: 0,
      width: 0,
      height: 0,
      text: 'Start',
      hue: 30
    }
    setAbsoluteBox(this.startBox)
    this.selectBox = {
      offsetX: canvas.offsetWidth * 3 / 4,
      offsetY: canvas.offsetHeight / 5,
      absoluteX: 0,
      absoluteY: 0,
      width: 0,
      height: 0,
      text: 'Select',
      hue: 300
    }
    setAbsoluteBox(this.selectBox)
    this.boxInterface = new BoxInterface()
    this.renderBox = new RenderBox()
  }
  update(intervalDiffTime, mouseInput, cursor, mouseDownPosition, spotData, ownPosition) {
    const areaBox = {absoluteX: spotData.x, absoluteY: spotData.y, width: spotData.width, height: spotData.height}
    const offset = {offsetX: ownPosition.x, offsetY: ownPosition.y}
    if (!this.boxInterface.isInner(areaBox, offset)) return
    const bossProcessFirst = () => {
      // bossArray.push(new Boss(ownPosition.x, ownPosition.y - canvas.offsetHeight * .4, 128000))
    }
    if (this.boxInterface.isDownAndUpInBox(this.startBox, mouseInput.getKeyUp(0), cursor, mouseDownPosition)) {
      spot.location = SpotField.locationList[1]
      dropItems = []
      saveProcess()
      wave.number = 0
      this.dispatchEvent('changemap', MAP[1])
      console.log('b')
      // if (dungeon !== dungeonList[3]) setWave()
      // if (dungeon === dungeonList[4]) {
      // } else {
      //   // bossProcessFirst()
      // }
    }
    if (this.boxInterface.isDownAndUpInBox(this.selectBox, mouseInput.getKeyUp(0), cursor, mouseDownPosition)) {
      const n = SpotField.dungeonList[SpotField.dungeonList.indexOf(spot.dungeon) + 1]
      spot.dungeon = n === SpotField.dungeonList[SpotField.dungeonList.length] ? SpotField.dungeonList[0] : n
    }
  }
  render(mouseInput, cursor, spotData, ownPosition) {
    const areaBox = {absoluteX: spotData.x, absoluteY: spotData.y, width: spotData.width, height: spotData.height}
    const offset = {offsetX: ownPosition.x, offsetY: ownPosition.y}
    if (this.boxInterface.isInner(areaBox, offset)) {
      this.renderBox.render(this.startBox, mouseInput, cursor)
      this.renderBox.render(this.selectBox, mouseInput, cursor)
      context.save()
      context.textAlign = 'center'
      context.fillStyle = 'hsl(210, 100%, 70%)'
      context.fillText(spot.dungeon, this.selectBox.offsetX, this.selectBox.offsetY + SIZE * 2)
      context.restore()
    }
  }
}
class ShopSpot {
  constructor () {
    this.fillAmmoBox = {
      offsetX: canvas.offsetWidth * 4 / 7,
      offsetY: canvas.offsetHeight / 5,
      absoluteX: 0,
      absoluteY: 0,
      width: 0,
      height: 0,
      text: 'Buy ammo',
      hue: 210
    }
    setAbsoluteBox(this.fillAmmoBox)
    this.fillAmmoAllBox = {
      offsetX: canvas.offsetWidth * 6 / 7,
      offsetY: canvas.offsetHeight / 5,
      absoluteX: 0,
      absoluteY: 0,
      width: 0,
      height: 0,
      text: 'Buy ammo all',
      hue: 210
    }
    setAbsoluteBox(this.fillAmmoAllBox)
    this.limitBreakBox = {
      offsetX: canvas.offsetWidth * 3 / 4,
      offsetY: canvas.offsetHeight * 2 / 5,
      absoluteX: 0,
      absoluteY: 0,
      width: 0,
      height: 0,
      text: 'Limit break (x0.01 - x2)',
      hue: 0
    }
    setAbsoluteBox(this.limitBreakBox)
    this.boxInterface = new BoxInterface()
    this.renderBox = new RenderBox()
  }
  calcCost = slot => {
    let cost = 0
    if (slot.category !== '') {
      cost =
        slot.category === weaponCategoryList[0] ? 250 :
        slot.category === weaponCategoryList[1] ? 500 :
        slot.category === weaponCategoryList[5] ? 400 :
        750 // slot.category === categoryList[2]
      cost *=
        slot.rarity === weaponRarityList[0] ? 1 :
        slot.rarity === weaponRarityList[1] ? 2 :
        slot.rarity === weaponRarityList[2] ? 3 :
        4 // slot.rarity === weaponRarityList[3]
    }
    return cost
  }
  update(intervalDiffTime, mouseInput, cursor, mouseDownPosition, spotData, ownPosition) {
    const areaBox = {absoluteX: spotData.x, absoluteY: spotData.y, width: spotData.width, height: spotData.height}
    const offset = {offsetX: ownPosition.x, offsetY: ownPosition.y}
    if (!this.boxInterface.isInner(areaBox, offset)) return

    const costAll = inventory.reduce((p, c, i) => {return p + this.calcCost(inventory[i])}, 0)
    if (
      costAll <= point &&
      this.boxInterface.isDownAndUpInBox(this.fillAmmoAllBox, mouseInput.getKeyUp(0), cursor, mouseDownPosition)
    ) {
      point -= costAll
      inventory.forEach(v => {
        if (v.category !== '') v.magazines.fill(v.magazineSize)
      })
    }
    if (inventory[selectSlot].category !== '') {
      const cost = this.calcCost(inventory[selectSlot])
      if (
        cost <= point &&
        this.boxInterface.isDownAndUpInBox(this.fillAmmoBox, mouseInput.getKeyUp(0), cursor, mouseDownPosition)
      ) {
        point -= cost
        inventory[selectSlot].magazines.fill(inventory[selectSlot].magazineSize)
      }
      if (
        inventory[selectSlot].limitBreak * inventory[selectSlot].limitBreakIndex <= point &&
        this.boxInterface.isDownAndUpInBox(this.limitBreakBox, mouseInput.getKeyUp(0), cursor, mouseDownPosition)
      ) {
        afterglow.limitBreakResult = .01 + Math.random() * 1.99
        inventory[selectSlot].damage = (inventory[selectSlot].damage * afterglow.limitBreakResult)|0
        point -= inventory[selectSlot].limitBreak * inventory[selectSlot].limitBreakIndex
        inventory[selectSlot].limitBreakIndex += 1
        saveProcess(true, true, false, false)
        afterglow.limitBreakSuccess += 2000
      }
    }
    if (0 < afterglow.limitBreakSuccess) afterglow.limitBreakSuccess -= intervalDiffTime
    if (0 < afterglow.limitBreakFailed) afterglow.limitBreakFailed -= intervalDiffTime

  }
  render(mouseInput, cursor, spotData, ownPosition) {
    const areaBox = {absoluteX: spotData.x, absoluteY: spotData.y, width: spotData.width, height: spotData.height}
    const offset = {offsetX: ownPosition.x, offsetY: ownPosition.y}
    if (this.boxInterface.isInner(areaBox, offset)) {
      context.save()
      if (inventory[selectSlot].category !== '') {
        context.fillStyle = 'hsla(300, 100%, 70%, .5)'
        context.fillRect(
          inventorySlotBox[selectSlot].absoluteX,
          inventorySlotBox[selectSlot].absoluteY,
          inventorySlotBox[selectSlot].width,
          inventorySlotBox[selectSlot].height)
      }
      const cost = this.calcCost(inventory[selectSlot])
      const ammoAlpha = inventory[selectSlot].category !== '' && cost <= point ? 1 : .4
      context.font = `${SIZE * .75}px ${font}`
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.fillStyle = `hsla(210, 100%, 70%, ${ammoAlpha})`
      this.renderBox.render(this.fillAmmoBox, mouseInput, cursor, ammoAlpha)
      if (cost !== 0) {
        context.fillText(`Cost: ${cost}`, this.fillAmmoBox.offsetX, this.fillAmmoBox.offsetY + SIZE * 1.5)
      }
      this.renderBox.render(this.fillAmmoAllBox, mouseInput, cursor, ammoAlpha)
      const costAll = inventory.reduce((p, c, i) => {return p + this.calcCost(inventory[i])}, 0)
      if (costAll !== 0) {
        context.fillText(
          `Cost: ${costAll}`, this.fillAmmoAllBox.offsetX, this.fillAmmoAllBox.offsetY + SIZE * 1.5)
      }
      this.renderBox.render(this.limitBreakBox, mouseInput, cursor, ammoAlpha)
      if (inventory[selectSlot].category !== '') {
        context.fillText(
          `Cost: ${inventory[selectSlot].limitBreak * inventory[selectSlot].limitBreakIndex}`,
          this.limitBreakBox.offsetX,
          this.limitBreakBox.offsetY + SIZE * 1.5)
      }
      if (0 < afterglow.limitBreakSuccess) {
        const ratio = afterglow.limitBreakSuccess / 2000
        context.font = `${SIZE * (1 + afterglow.limitBreakResult)}px ${font}`
        context.strokeStyle = `hsla(0, 100%, 0%, ${ratio})`
        context.fillStyle = `hsla(60, 100%, 70%, ${ratio})`
        strokeText(
          'x' + afterglow.limitBreakResult.toPrecision(3),
          canvas.offsetWidth / 2,
          canvas.offsetHeight * 3 / 4)
      }
      context.restore()
    }
  }
}
class SaveSpot {
  constructor () {
    this.saveBox = {
      offsetX: canvas.offsetWidth / 2,
      offsetY: canvas.offsetHeight / 4,
      absoluteX: 0,
      absoluteY: 0,
      width: 0,
      height: 0,
      text: 'Save',
      hue: 210
    }
    setAbsoluteBox(this.saveBox)
    this.warehouseColumn = [
      {
        label: 'Level',
        property: 'level',
        width: 50,
        align: 'right',
        isShow: true
      }, {
        label: 'Name',
        property: 'name',
        width: 50,
        align: 'left',
        isShow: true
      }, {
        label: 'Category',
        property: 'category',
        width: 80,
        align: 'left',
        isShow: true
      }, {
        label: 'Mode',
        property: 'mode',
        width: 50,
        align: 'left',
        isShow: false
      }, {
        label: 'Damage',
        property: 'damage',
        width: 70,
        align: 'right',
        isShow: true
      }, {
        label: 'Mag. size',
        property: 'magazineSize',
        width: 80,
        align: 'right',
        isShow: true
      }, {
        label: 'Penetration force',
        property: 'penetrationForce',
        width: 140,
        align: 'right',
        isShow: true
      }, {
        label: 'Effective range',
        property: 'effectiveRange',
        width: 120,
        align: 'right',
        isShow: true
      }
    ]
    this.warehouseColumn.forEach(v => {
      v.width = context.measureText(v.label).width + SIZE * .25
    })
    this.warehouseOffset = {
      x: warehouseBox.absoluteX + SIZE * .25,
      y: warehouseBox.absoluteY + SIZE * .25
    }
    this.manipulateSortLabelIndex = -1
    this.sendSortLabelIndex = -1
    this.swapAbsoluteX = -1
    this.isSortLabel = false

    this.manipulateColumnSizeNumber = -1
    this.temporaryDiffX = -1

    this.boxInterface = new BoxInterface()
    this.renderBox = new RenderBox()
  }
  update(intervalDiffTime, mouseInput, cursor, mouseDownPosition, spotData, ownPosition) {
    const areaBox = {absoluteX: spotData.x, absoluteY: spotData.y, width: spotData.width, height: spotData.height}
    const offset = {offsetX: ownPosition.x, offsetY: ownPosition.y}
    if (this.boxInterface.isInner(areaBox, offset)) {
      isWarehouse = true
      if (this.boxInterface.isDownInBox(this.saveBox, mouseInput.getKeyDown(0), cursor)) saveProcess()
      this.warehouseColumn.filter(v => v.isShow).reduce((pV, cV, cI, array) => {
        const padding = 10

        const box = {
          absoluteX: this.warehouseOffset.x + pV + padding,
          absoluteY: this.warehouseOffset.y,
          width: cV.width - padding * 2,
          height: SIZE / 2
        }

        // Sort weapon
        if (
          this.boxInterface.isDownAndUpInBox(box, mouseInput.getKeyUp(0), cursor, mouseDownPosition) &&
          !this.isSortLabel
        ) {
          warehouse.sort((a, b) => {
            if (orderNumber === cI && !isDescending) {
              if (cV.property === 'magazineSize') {
                return b[cV.property] * b.magazines.length - a[cV.property] * a.magazines.length
              } else if (cV.property === 'damage') {
                return b[cV.property] * b.gaugeNumber - a[cV.property] * a.gaugeNumber
              } else if (cV.property === 'name') {
                if (a[cV.property] < b[cV.property]) return -1
                if (b[cV.property] < a[cV.property]) return 1
                return 0
              } else return b[cV.property] - a[cV.property]
            } else {
              if (cV.property === 'magazineSize') {
                return a[cV.property] * a.magazines.length - b[cV.property] * b.magazines.length
              } else if (cV.property === 'damage') {
                return a[cV.property] * a.gaugeNumber - b[cV.property] * b.gaugeNumber
              } else if (cV.property === 'name') {
                if (b[cV.property] < a[cV.property]) return -1
                if (a[cV.property] < b[cV.property]) return 1
                return 0
              } else return a[cV.property] - b[cV.property]
            }
          })
          if (orderNumber === cI) isDescending = !isDescending
          else isDescending = false
          orderNumber = cI
        }

        // Sort label
        if (this.boxInterface.isDownInBox(box, mouseInput.getKeyDown(0), cursor)) {
          this.manipulateSortLabelIndex = cI
          this.swapAbsoluteX = cursor.offsetX
        }
        // Start sort label mode if move 5px or more
        if (
          !this.isSortLabel &&
          0 <= this.manipulateSortLabelIndex &&
          mouseInput.getKeyDown(0) &&
          5 <= Math.abs(this.swapAbsoluteX - cursor.offsetX)
        ) this.isSortLabel = true

        if (this.isSortLabel) {
          if (cI === 0) {
            if (cursor.offsetX < this.warehouseOffset.x + cV.width * .5) this.sendSortLabelIndex = cI
          } else if (cI === array.length - 1) {
            if (this.warehouseOffset.x + pV + array[cI].width * .5 < cursor.offsetX) this.sendSortLabelIndex = cI
          } else if (
            cI < this.manipulateSortLabelIndex &&
            this.warehouseOffset.x + pV - array[cI - 1].width * .5 < cursor.offsetX &&
            cursor.offsetX < this.warehouseOffset.x + pV + cV.width * .5
          ) {
            this.sendSortLabelIndex = cI
          } else if (
            this.manipulateSortLabelIndex < cI &&
            this.warehouseOffset.x + pV + cV.width * .5 < cursor.offsetX &&
            cursor.offsetX < this.warehouseOffset.x + pV + cV.width + array[cI + 1].width * .5
          ) {
            this.sendSortLabelIndex = cI
          } else if (
            cI === this.manipulateSortLabelIndex &&
            this.warehouseOffset.x + pV - array[cI - 1].width * .5 <= cursor.offsetX &&
            cursor.offsetX <= this.warehouseOffset.x + pV + cV.width + array[cI + 1].width * .5
          ) {
            this.sendSortLabelIndex = cI
          }
          if (
            cursor.offsetY < this.warehouseOffset.y - SIZE * .5 ||
            this.warehouseOffset.y + SIZE < cursor.offsetY
          ) this.sendSortLabelIndex = -1
        }
        if(this.isSortLabel && mouseInput.getKeyUp(0) && this.sendSortLabelIndex !== -1 && cI === array.length - 1) {
          this.warehouseColumn.splice(
            this.warehouseColumn.findIndex(v => v.label === array[this.sendSortLabelIndex].label),
            0,
            this.warehouseColumn.splice(
              this.warehouseColumn.findIndex(v => v.label === array[this.manipulateSortLabelIndex].label), 1)[0]
          )
          if (orderNumber === this.manipulateSortLabelIndex) orderNumber = this.sendSortLabelIndex
          else if (this.manipulateSortLabelIndex < orderNumber && orderNumber <= this.sendSortLabelIndex) orderNumber -= 1
          else if (orderNumber < this.manipulateSortLabelIndex && this.sendSortLabelIndex <= orderNumber) orderNumber += 1
        }

        // Adjust width
        const colResizeBox = {
          absoluteX: this.warehouseOffset.x + pV + cV.width - padding,
          absoluteY: this.warehouseOffset.y,
          width: padding * 2,
          height: SIZE * .5
        }

        if (this.boxInterface.isDownInBox(colResizeBox, mouseInput.getKeyDown(0), cursor)) {
          if (cV.width <= padding && mouseInput.getKeyDown(0)) {
            colResizeBox.absoluteX += padding
            colResizeBox.width -= padding
            if (this.boxInterface.isInner(colResizeBox, cursor)) {
              this.manipulateColumnSizeNumber = -1
              this.temporaryDiffX = -1
            }
          }
          if (this.manipulateColumnSizeNumber === -1) this.manipulateColumnSizeNumber = cI
          if (this.temporaryDiffX === -1) this.temporaryDiffX = cursor.offsetX - cV.width
        }
        if (this.manipulateColumnSizeNumber === cI && mouseInput.getKeyDown(0)) {
          const x = cursor.offsetX - this.temporaryDiffX
          if (0 < x && this.manipulateColumnSizeNumber === cI) cV.width = x
        }
        if (this.manipulateColumnSizeNumber !== -1 && !mouseInput.getKeyDown(0)) {
          this.temporaryDiffX = -1
          this.manipulateColumnSizeNumber = -1
        }
        return pV + cV.width
      }, 0)
      if((this.isSortLabel || this.sendSortLabelIndex === -1) && !mouseInput.getKeyDown(0)) { // Reset sort label
        this.manipulateSortLabelIndex = -1
        this.sendSortLabelIndex = -1
        this.swapAbsoluteX = -1
        this.isSortLabel = false
      }
      if (this.boxInterface.isDownInBox(warehouseBox, mouseInput.getKeyDown(0), cursor)) {
        let bool = false
        warehouse.forEach((v, i) => {
          const box = {
            absoluteX: this.warehouseOffset.x,
            absoluteY: this.warehouseOffset.y + SIZE * (1 + i * .5),
            width: warehouseBox.width - SIZE * .5,
            height: SIZE * .5
          }
          if (this.boxInterface.isInner(box, cursor)) {
            if (code[action.shift].flag) {
              let findIndex = -1
              findIndex = inventory.findIndex((v, index) => {
                if (!inventoryFlag && mainSlotSize - 1 < index) return -1
                else return v.category === ''
              })
              if (findIndex !== -1) {
                inventory[findIndex] = warehouse.splice(i, 1)[0]
                bool = true
              }
            } else {
              [holdSlot, warehouse[i]] = [warehouse[i], holdSlot]
              if (warehouse[i].category === '') warehouse.splice(i, 1)
              bool = true
              orderNumber = -1
              isDescending = false
            }
          }
        })
        if (!bool && holdSlot.category !== '') {
          warehouse.push(holdSlot)
          holdSlot = {category: ''}
          orderNumber = -1
          isDescending = false
        }
      }
    } else isWarehouse = false
  }
  render(mouseInput, cursor, spotData, ownPosition) {
    const areaBox = {absoluteX: spotData.x, absoluteY: spotData.y, width: spotData.width, height: spotData.height}
    const offset = {offsetX: ownPosition.x, offsetY: ownPosition.y}
    if (this.boxInterface.isInner(areaBox, offset)) {
      context.save()
      this.renderBox.render(this.saveBox, mouseInput, cursor)
      context.fillStyle = 'hsla(0, 0%, 50%, .5)'
      context.fillRect(
        warehouseBox.absoluteX, warehouseBox.absoluteY, warehouseBox.width, warehouseBox.height)
      context.font = `${SIZE * .5}px ${font}`
      context.textBaseline = 'top'
      context.fillStyle = 'hsla(0, 0%, 100%, .5)'
      let isChangeCursorImage = false
      this.warehouseColumn.filter(v => v.isShow).reduce((pV, cV, cI, array) => {
        const getRistrictWidthText = (str, w) => {
          for (let i = str.length; 0 <= i; i--) {
            const text = i === str.length ? str : str.slice(0, i) + '...'
            if (context.measureText(text).width + SIZE * .25 <= w) return text
          }
          return ''
        }
        const box = {
          absoluteX: this.warehouseOffset.x + pV + cV.width - 10,
          absoluteY: this.warehouseOffset.y,
          width: 20,
          height: SIZE * .5
        }
        if ((this.boxInterface.isInner(box, cursor) || this.manipulateColumnSizeNumber !== -1) && !this.isSortLabel) {
          canvas.style.cursor = 'col-resize'
          isChangeCursorImage = true
        } else if (isChangeCursorImage === false) canvas.style.cursor = 'default'

        const drawInterectBoxArea = (box) => {
          context.save()
          if (this.boxInterface.isInner(box, cursor)) {
            if (mouseInput.getKeyDown(0)) context.globalAlpha = .5
            else context.globalAlpha = .3
          } else context.globalAlpha = .05
          context.fillRect(box.absoluteX, box.absoluteY, box.width, box.height)
          context.restore()
        }
        const LABEL_BOX = {
          absoluteX: this.warehouseOffset.x + pV,
          absoluteY: this.warehouseOffset.y,
          width: cV.width,
          height: SIZE * .5
        }
        if (!this.isSortLabel) drawInterectBoxArea(LABEL_BOX)

        if (this.sendSortLabelIndex === cI) {
          if (
            cI < this.manipulateSortLabelIndex || (
            cI === this.manipulateSortLabelIndex &&
            this.warehouseOffset.x + pV - array[cI - 1].width * .5 <= cursor.offsetX &&
            cursor.offsetX <= this.warehouseOffset.x + pV + cV.width * .5)
          ) {
            context.fillRect(this.warehouseOffset.x + pV - 1, this.warehouseOffset.y, 3, SIZE / 2)
          } else { // manipulateSortLabelIndex < cI
            context.fillRect(this.warehouseOffset.x + pV + cV.width - 1, this.warehouseOffset.y, 3, SIZE / 2)
          }
        }
        context.fillRect(this.warehouseOffset.x + pV, this.warehouseOffset.y, 1, SIZE / 2)
        if (cI === array.length - 1) {
          context.fillRect(this.warehouseOffset.x + pV + cV.width , this.warehouseOffset.y, 1, SIZE / 2)
        }

        context.textAlign = 'left'
        const padding = SIZE / 8
        context.fillText(
          getRistrictWidthText(cV.label, cV.width), this.warehouseOffset.x + pV + padding, this.warehouseOffset.y)
        if (this.isSortLabel && this.manipulateSortLabelIndex === cI && this.sendSortLabelIndex !== -1) {
          context.fillText(
            getRistrictWidthText(cV.label, cV.width),
            this.warehouseOffset.x + pV + padding - this.swapAbsoluteX + cursor.offsetX,
            this.warehouseOffset.y - SIZE * .5
          )
        }
        if (cI === orderNumber) {
          context.textAlign = 'center'
          if (isDescending) {
            context.fillText('\u{2228}', box.absoluteX + 10 - cV.width * .5, box.absoluteY - 10)
          } else context.fillText('∧', box.absoluteX + 10 - cV.width * .5, box.absoluteY - 10)

        }
        warehouse.filter(v => v.category !== '').forEach((v, i) => {
          context.save()
          let text = v[cV.property]
          if (cV.property === 'damage') {
            if (v.gaugeNumber !== 1) text += ` * ${v.gaugeNumber}`
          } else if (cV.property === 'penetrationForce' || cV.property === 'effectiveRange') {
            text = text.toPrecision(3)
          } else if (cV.property === 'magazineSize') {
            text += ` * ${v.magazines.length}`
          }
          let offsetY = this.warehouseOffset.x + pV + padding
          context.textAlign = cV.align
          if (cV.align === 'right') {
            offsetY += cV.width - padding * 2
          }
          context.fillStyle = weaponRatiryColorList[weaponRarityList.indexOf(v.rarity)]
          context.globalAlpha = .75
          context.fillText(
            getRistrictWidthText(text.toString(), cV.width), offsetY, this.warehouseOffset.y + SIZE * (1 + i * .5))
          context.restore()
        })
        return pV + cV.width
      }, 0)
      context.textAlign = 'left'
      context.font = `${SIZE * .5}px ${font}`
      context.fillText('TODO: Context menu, Filter, Scroll overall', SIZE * .5, canvas.offsetHeight - SIZE)
      context.restore()
    } else canvas.style.cursor = 'default'
  }
}


class Input {
  constructor (keyMap, prevKeyMap) {
    this.keyMap = keyMap
    this.prevKeyMap = prevKeyMap
  }
  _getKeyFromMap(keyName, map) {
    if (map.has(keyName)) return map.get(keyName)
    else return false
  }
  _getPrevKey (keyName) {
    return this._getKeyFromMap(keyName, this.prevKeyMap)
  }
  getKey (keyName) {
    return this._getKeyFromMap(keyName, this.keyMap)
  }
  getKeyDown (keyName) {
    const prevDown = this._getPrevKey(keyName)
    const currentDown = this.getKey(keyName)
    return !prevDown && currentDown
  }
  getKeyUp (keyName) {
    const prevDown = this._getPrevKey(keyName)
    const currentDown = this.getKey(keyName)
    return prevDown && !currentDown
  }
}
class InputReceiver {
  constructor () {
    this._keyMap = new Map()
    this._prevKeyMap = new Map()
    document.addEventListener('keydown', e => this._keyMap.set(e.code, true))
    document.addEventListener('keyup', e => this._keyMap.set(e.code, false))
    this._mouseButtonMap = new Map()
    this._prevMouseButtonMap = new Map()
    canvas.addEventListener('mousedown', e => this._mouseButtonMap.set(e.button, true))
    canvas.addEventListener('mouseup', e => this._mouseButtonMap.set(e.button, false))
    this._mouseOffsetXMap = 0
    this._mouseOffsetYMap = 0
    canvas.addEventListener('mousemove', e => {
      this._mouseOffsetXMap = e.offsetX
      this._mouseOffsetYMap = e.offsetY
    })
    this._mouseWheelMap = new Map()
    canvas.addEventListener('wheel', e => {
      this._mouseWheelMap = e.deltaY
    })
  }
  getKeyInput () {
    const keyMap = new Map(this._keyMap)
    const prevKeyMap = new Map(this._prevKeyMap)
    this._prevKeyMap = new Map(this._keyMap)
    return new Input(keyMap, prevKeyMap)
  }
  getMouseCursorInput () {
    const offset = {offsetX: this._mouseOffsetXMap, offsetY: this._mouseOffsetYMap}
    return offset
  }
  getMouseButtonInput () {
    const mouseButtonMap = new Map(this._mouseButtonMap)
    const prevMouseButtonMap = new Map(this._prevMouseButtonMap)
    this._prevMouseButtonMap = new Map(this._mouseButtonMap)
    return new Input(mouseButtonMap, prevMouseButtonMap)
  }
  getMouseWheelInput () {
    const mouseWheelMap = this._mouseWheelMap
    this._mouseWheelMap = 0
    return mouseWheelMap
  }
}

const drawImage = (img, x, y) => {
  context.drawImage(img, ~~(x+.5), ~~(y+.5))
}

const drawPause = () => {
  let nowTime = Date.now()
  let ss = ('0' + ~~(nowTime % 6e4 / 1e3)).slice(-2)
  let ms = ('0' + ~~(nowTime % 1e3)).slice(-3)
  context.save()
  context.font = `${SIZE}px ${font}`
  context.fillStyle = (ss % 3 === 2) ? `hsl(60, ${100 * (1 - (ms / 1e3))}%, 40%)` :
  (ss % 3 === 1) ? 'hsl(60, 100%, 40%)' :
  `hsl(60, ${100 * (ms / 1e3)}%, 40%)`
  context.textAlign = 'center'
  context.fillText('PAUSE', canvas.offsetWidth / 2, canvas.offsetHeight / 4 + SIZE)
  context.restore()
}
const RESOURCE_LIST = []

const imagePathList = [
  'images/TP2F.png',
  'images/TP2U.png',
  'images/TP2RU.png',
  'images/TP2R.png',
  'images/TP2RD.png',
  'images/TP2D.png',
  'images/TP2LD.png',
  'images/TP2L.png',
  'images/TP2LU.png',
  'images/JK1_NL.png',
  'images/JK1_NN.png',
  'images/JK1_NR.png',
  'images/JK32F.png',
  'images/JK32L.png',
  'images/JK32R.png',
  'images/JK32F_O1.png',
  'images/JK32F_O2.png',
  'images/JK33F.png',
  'images/JK33L.png',
  'images/JK33R.png',
  'images/JK34F.png',
  'images/JK34L.png',
  'images/JK34R.png',
  'images/JK35Fv1.png',
  'images/drinkSmile.png',
  'images/drinking.png',
  'images/ROGOv1.png',
  'images/ROGOv1.2.png',
  'images/stv1.png',
  'images/st1v2.png',
  'images/st2v1.png',
  'images/Homingv1.jpg',
  'images/TAPIOCA_PENETRATEv1.png',
  'images/TASTEv1.jpg',
  'images/EASY_TO_DRINKV1.jpg' ,
  'images/TAPIOCA_SPEEDv1.png',
  'images/TAPIOCA_PENETRATEv1.png',
  'images/COOKING_TIMEv1.png',
  'images/CUP_AMOUNTv1.png',
  'images/CUP_SIZEv1.png',
  'images/TAPIOCA_CAPACITYv1.png',
  'images/arrowDown.png',
  'images/arrowRight.png',
  'images/arrowUp.png'
]
const IMAGE = []
imagePathList.forEach(path => {
  const image = new Image()
  RESOURCE_LIST.push((async () => {
    return new Promise(resolve => {
      image.src = path
      image.addEventListener('load', () => resolve(image))
    }).then(result => IMAGE[path] = result)
  })())
})
const TILESET_DATA_ARRAY = []
const TILESET_IMAGE_ARRAY = []
const MAP_PATH_ARRAY = [
  'resources/map_Lobby.json',
  'resources/map_Test.json'
]
const MAP = []
MAP_PATH_ARRAY.forEach(path => {
  RESOURCE_LIST.push((async () => {
    return new Promise(resolve => {
      const request = new XMLHttpRequest()
      request.open('GET', path)
      request.responseType = 'json'
      request.send()
      request.onload = () => resolve(request.response)
    }).then(result => {
      MAP.push(result)
      result.tilesets.forEach(async v => {
        return new Promise(resolve => {
          const request = new XMLHttpRequest()
          request.open('GET', 'resources/' + v.source)
          request.responseType = 'json'
          request.send()
          request.onload = () => resolve(request.response)
        }).then(async result => {
          return new Promise(resolve => {
            TILESET_DATA_ARRAY[v.source] = result
            const IMG = new Image()
            IMG.src = result.image.slice(3)
            IMG.addEventListener('load', () => resolve(IMG))
          }).then(result => {
            TILESET_IMAGE_ARRAY[v.source] = result
          })
        })
      })
    })

  })())
})

context.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
context.save()
context.font = `${SIZE / 2}px ${font}`
context.textAlign = 'center'
context.textBaseline = 'middle'
context.fillText('Now Loading...', canvas.offsetWidth / 2, canvas.offsetHeight / 2)
context.restore()

class Window extends EventDispatcher {
  constructor (x = -1, y = -1, w = 0, h = 0, color = 0, alpha = 1, is = false) {
    super()
    this.x = x
    this.y = y
    this.w = w
    this.h = h
    this.color = color
    this.alpha = alpha
    this.is = is
    this.addEventListener('active', () => {
      this.is = !this.is
    })
    this.boxInterface = new BoxInterface()
    this.renderBox = new RenderBox()
  }
  update (input) {
    if (input.getKeyDown('KeyR')) console.log(this.color)
  }
  render () {
    context.fillStyle = `hsla(${this.color}, 100%, 50%, ${this.alpha})`
    context.fillRect(this.x, this.y, this.w, this.h)
  }
}

class ResultWindow extends Window {
  constructor () {
    super()
    this.isPenalty = false
  }
  update (mouseInput, cursor, mouseDownPosition) {
    if (!this.isPenalty) {
      point = (point / 100)|0
      point *= 10
      saveProcess(true, true, false, false)
      afterglow.save = 1000
      this.isPenalty = true
    }
    if (this.boxInterface.isDownAndUpInBox(resultBackBox, mouseInput.getKeyUp(0), cursor, mouseDownPosition)) {
      this.dispatchEvent('deleteMenu', 'result')
      this.dispatchEvent('changescene', new MainScene())

      spot.location = SpotField.locationList[0]
      dropItems = []
      bullets = []
      enemyInfo.enemies = []
      bossArray.forEach(v => {
        v.life = 0
      })
      enemyBulletArray.forEach(v => {
        v.life = 0
      })
      wave.number = 0
      wave.enemySpawnInterval = 0
      wave.enemySpawnIntervalLimit = 0
      wave.enemyCount = 0
      wave.enemyLimit = 0
      setWave()
      wave.roundInterval = 0
      enemyInfo.defeatCount = 0
      this.isPenalty = false
    }
  }
  render (cursor) {
    context.font = `${SIZE}px ${font}`
    context.fillStyle = 'hsl(0, 100%, 40%)'
    context.textAlign = 'center'
    context.fillText('YOU WERE DRUNK', canvas.offsetWidth / 2, canvas.offsetHeight / 4 + SIZE)
    context.font = `${SIZE * 2 / 3}px ${font}`
    context.fillStyle = 'hsl(30, 100%, 40%)'
    context.fillText(
      `YOU SATISFIED ${enemyInfo.defeatCount} GIRLS`, canvas.offsetWidth / 2, canvas.offsetHeight / 6
    )
    this.renderBox.render(resultBackBox, mouseInput, cursor)
    context.fillStyle = 'hsla(30, 100%, 50%, .5)'
    context.fillRect(
      canvas.offsetWidth/3, canvas.offsetHeight/3, canvas.offsetWidth/3, canvas.offsetHeight/3
    )
    context.save()
    let nowTime = Date.now()
    let ss = ('0' + ~~(nowTime % 6e4 / 1e3)).slice(-2)
    const imgCutin = (ss % 3 === 0) ? 'images/drinking.png' : 'images/drinkSmile.png'
    context.scale(3, 3)
    context.drawImage(
      IMAGE[imgCutin],
      ~~((canvas.offsetWidth / 6 - IMAGE[imgCutin].width / 2)+.5),
      ~~((canvas.offsetHeight / 6 - IMAGE[imgCutin].height / 2)+.5)
    )
    context.restore()
  }
}
class SettingsWindow extends Window {
  constructor () {
    super()
    this.itemsArray = [{
      toggle: Object.keys(settingsObject)[0],
      explain: 'Manipulate main slot when close inventory',
      offsetX: 0,
      offsetY: 0,
      absoluteX: 0,
      absoluteY: 0,
      width: 0,
      height: 0,
      text: ''
    }, {
      toggle: Object.keys(settingsObject)[1],
      explain: 'Show tutorial tooltip',
      offsetX: 0,
      offsetY: 0,
      absoluteX: 0,
      absoluteY: 0,
      width: 0,
      height: 0,
      text: ''
    }, {
      toggle: Object.keys(settingsObject)[2],
      explain: 'Show manipulate key',
      offsetX: 0,
      offsetY: 0,
      absoluteX: 0,
      absoluteY: 0,
      width: 0,
      height: 0,
      text: ''
    }, {
      toggle: Object.keys(settingsObject)[3],
      explain: 'Draw ownself relative to the cursor',
      offsetX: 0,
      offsetY: 0,
      absoluteX: 0,
      absoluteY: 0,
      width: 0,
      height: 0,
      text: ''
    }, {
      toggle: Object.keys(settingsObject)[4],
      explain: 'Reverse boundary if active above',
      offsetX: 0,
      offsetY: 0,
      absoluteX: 0,
      absoluteY: 0,
      width: 0,
      height: 0,
      text: ''
    }]
  }
  update (mouseInput, cursor, mouseDownPosition) {
    this.itemsArray.forEach((v, i) => {
      if (this.boxInterface.isDownAndUpInBox(v, mouseInput.getKeyUp(0), cursor, mouseDownPosition)) {
        settingsObject[v.toggle] = !settingsObject[v.toggle]
        storage.setItem(v.toggle, JSON.stringify(settingsObject[v.toggle]))
      }
    })
  }
  render (cursor) {
    context.save()
    const frameOffset = {
      x: canvas.offsetWidth * .075,
      y: canvas.offsetHeight * .075,
      w: canvas.offsetWidth * .85,
      h: canvas.offsetHeight * .85
    }
    context.fillStyle = 'hsla(0, 0%, 0%, .5)'
    context.fillRect(frameOffset.x, frameOffset.y, frameOffset.w, frameOffset.h)
    this.itemsArray.forEach((v, i) => {
      v.offsetX = canvas.offsetWidth / 2
      v.offsetY = frameOffset.y + SIZE * 3 + i * SIZE * 2
      const toggleText = settingsObject[v.toggle] ? 'On' : 'Off'
      v.text = `${v.explain}: ${toggleText}`
      setAbsoluteBox(v)
      context.font = this.boxInterface.isInner(v, cursor) ? `bold ${SIZE}px ${font}` : `${SIZE}px ${font}`
      context.fillStyle = this.boxInterface.isInner(v, cursor) ? 'hsl(0, 0%, 90%)' : 'hsl(0, 0%, 80%)'
      context.strokeStyle = this.boxInterface.isInner(v, cursor) ? 'hsl(0, 0%, 20%)' : 'hsl(0, 0%, 0%)'
      context.textAlign = 'center'
      strokeText(v.text, canvas.offsetWidth / 2, frameOffset.y + SIZE * 3 + i * SIZE * 2)
    })
    context.restore()
  }
}

class DebugWindow extends Window {
  constructor () {
    super()
    this.internalFrameArray = []
    this.animationFrameArray = []
  }
  update () {
    frameCounter(this.internalFrameArray)
  }
  render () {
    frameCounter(this.animationFrameArray)

    context.textAlign = 'right'
    context.font = `${SIZE / 2}px ${font}`
    context.fillStyle = 'hsl(0, 0%, 50%)'
    const dictionary = {
      internalFps: this.internalFrameArray.length - 1,
      screenFps: this.animationFrameArray.length - 1
    }
    Object.entries(dictionary).forEach((v, i) => {
      context.fillText(`${v[0]}:`, canvas.width - SIZE / 2 * 5, SIZE / 2 * (i + 1))
      context.fillText(v[1], canvas.width, SIZE / 2 * (i + 1))
    })
  }
}
class Scene extends EventDispatcher {
  constructor () {
    super()
    this.boxInterface = new BoxInterface()
    this.renderBox = new RenderBox()

    this.map = MAP[0]

  }
  update (intervalDiffTime, input, mouseInput, cursor, mouseDownPosition, wheelInput) {}
  render (intervalDiffTime, mouseInput, cursor) {}
}
class MainScene extends Scene {
  constructor () {
    super()

    this.startSpot = new StartSpot()
    this.startSpot.addEventListener('changemap', e => {this.map = e
    console.log('a')})
    this.saveSpot = new SaveSpot()
    this.shopSpot = new ShopSpot()

    this.reloadFlashTimeLimit = 5
    this.isShowDamage = true
    this.afterimage = []
    this.ownself = new Ownself()
  }
  setMoreThanMagazine = () => {
    return inventory[selectSlot].magazines.indexOf(Math.max(...inventory[selectSlot].magazines))
  }
  reloadProcess = (mouseInput) => {
    inventory[selectSlot].reloadTime = (inventory[selectSlot].reloadTime+1)|0
    if (inventory[selectSlot].reloadState === 'release' && inventory[selectSlot].reloadRelease * inventory[selectSlot].reloadSpeed <= inventory[selectSlot].reloadTime) {
      inventory[selectSlot].reloadState = 'putAway'
    } else if (inventory[selectSlot].reloadState === 'putAway' && inventory[selectSlot].reloadPutAway * inventory[selectSlot].reloadSpeed <= inventory[selectSlot].reloadTime) {
      inventory[selectSlot].reloadState = 'takeOut'
      inventory[selectSlot].grip = this.setMoreThanMagazine()
    } else if (inventory[selectSlot].reloadState === 'takeOut' && inventory[selectSlot].reloadTakeOut * inventory[selectSlot].reloadSpeed <= inventory[selectSlot].reloadTime) {
        inventory[selectSlot].reloadState = 'unrelease'
    } else if (inventory[selectSlot].reloadState === 'unrelease' && inventory[selectSlot].reloadUnrelease * inventory[selectSlot].reloadSpeed <= inventory[selectSlot].reloadTime) {
        inventory[selectSlot].reloadState = 'done'
        const unreleaseMagazine = () => {
          if (!afterglow.chamberFlag) afterglow.reload = this.reloadFlashTimeLimit
          inventory[selectSlot].gripFlag = true
          combatReload.magFlag = true
        }
        unreleaseMagazine()
    } else if (inventory[selectSlot].reloadState === 'done') {
      if (0 <= inventory[selectSlot].reloadTime) {
        inventory[selectSlot].reloadState = 'release'
        inventory[selectSlot].gripFlag = false
        if (!inventory[selectSlot].chamber) afterglow.chamberFlag = true
      }
    } else return
    inventory[selectSlot].reloadTime = 0
    if (inventory[selectSlot].mode === weaponModeList[2] && !mouseInput.getKeyDown(0)) {
      inventory[selectSlot].round = 0
    }
  }
  mouseFiring = (mouseInput, cursor) => {
    if (
      inventory[selectSlot].reloadAuto === 'ON' &&
      inventory[selectSlot].magazines[inventory[selectSlot].grip] <= 0 &&
      inventory[selectSlot].reloadTime === 0 &&
      0 < inventory[selectSlot].magazines[this.setMoreThanMagazine()] &&
      !inventory[selectSlot].chamber &&
      inventory[selectSlot].slideState === 'release'
    ) {
      inventory[selectSlot].reloadSpeed = inventory[selectSlot].baseReloadSpeed * 1.5
      this.reloadProcess(mouseInput)
      return
    }
    if (!inventory[selectSlot].chamber) return
    const shotBullet = () => {
      const degreeRange = 2 * Math.atan2(targetWidth, inventory[selectSlot].effectiveRange)
      const randomError =
        degreeRange * (Math.random() - .5) * (
        1 + inventory[selectSlot].recoilEffect + Math.sqrt(
        this.ownself.dx ** 2 + this.ownself.dy ** 2) * this.ownself.moveRecoil)
      const theta =
        Math.atan2(
          cursor.offsetY - canvas.offsetHeight / 2,
          cursor.offsetX - canvas.offsetWidth / 2) + randomError
      const bulletRadius = inventory[selectSlot].category === weaponCategoryList[5] ? SIZE / 8 : SIZE / 6
      bullets.push(new Bullet(
        this.ownself.x,
        this.ownself.y,
        inventory[selectSlot].bulletSpeed,
        theta,
        inventory[selectSlot].bulletLife,
        inventory[selectSlot].damage,
        inventory[selectSlot].penetrationForce,
        bulletRadius
      ))
    }
    for (let i = 0; i < inventory[selectSlot].gaugeNumber; i++) shotBullet()

    inventory[selectSlot].chamber = false
    if (inventory[selectSlot].mode === weaponModeList[2]) inventory[selectSlot].round += 1
    if (
      inventory[selectSlot].mode === weaponModeList[1] || (
      inventory[selectSlot].mode === weaponModeList[2] &&
      inventory[selectSlot].round === inventory[selectSlot].roundLimit)
    ) inventory[selectSlot].disconnector = true
    const burstReduction = // TODO: FAMAS and AN-94 are not example of this
      inventory[selectSlot].mode === weaponModeList[2] ? inventory[selectSlot].roundLimit / (inventory[selectSlot].roundLimit + 1) : 1
    inventory[selectSlot].recoilEffect += inventory[selectSlot].recoilCoefficient * burstReduction
  }
  weaponProcess = (mouseInput, cursor) => {
    if (
      code[action.reload].isFirst() &&
      inventory[selectSlot].reloadTime === 0 &&
      inventory[selectSlot].reloadState === 'done'
    ) {
      inventory[selectSlot].reloadSpeed = inventory[selectSlot].baseReloadSpeed
      this.reloadProcess(mouseInput)
    } else if (0 < inventory[selectSlot].reloadTime || inventory[selectSlot].reloadState !== 'done') {
      this.reloadProcess(mouseInput)
    }

    if (((
      mouseInput.getKeyDown(0) && !inventoryFlag) || (
      inventory[selectSlot].mode === weaponModeList[2] && 0 < inventory[selectSlot].round)) &&
      !inventory[selectSlot].disconnector
    ) {
      this.mouseFiring(mouseInput, cursor)
    }
    if (inventory[selectSlot].mode === weaponModeList[1] && !mouseInput.getKeyDown(0)) {
      inventory[selectSlot].disconnector = false
    }
    if (
      inventory[selectSlot].mode === weaponModeList[2] &&
      inventory[selectSlot].round === inventory[selectSlot].roundLimit &&
      !mouseInput.getKeyDown(0)
    ) {
      inventory[selectSlot].disconnector = false
      inventory[selectSlot].round = 0
    }
    const magazineForword = () => {
      inventory[selectSlot].magazines.push(inventory[selectSlot].magazines[1])
      inventory[selectSlot].magazines.splice(1, 1)
    }
    if (code[action.change].isFirst()) magazineForword() // TODO: to consider
  }
  modeSelect = () => {
    if (code[action.modeSelect].isFirst()) {
      if (code[action.shift].flag) {
        const n = inventory[selectSlot].modeList.indexOf(inventory[selectSlot].mode) - 1
        inventory[selectSlot].mode =
          n < 0 ? inventory[selectSlot].modeList[inventory[selectSlot].modeList.length - 1] :
          inventory[selectSlot].modeList[n]
      } else {
        const n = inventory[selectSlot].modeList.indexOf(inventory[selectSlot].mode) + 1
        inventory[selectSlot].mode =
          n < inventory[selectSlot].modeList.length ? inventory[selectSlot].modeList[n] :
          inventory[selectSlot].modeList[0]
      }
    }
  }

  interfaceProcess = (intervalDiffTime, input , mouseInput, cursor, wheelInput) => {

    this.ownself.update(intervalDiffTime, input, this.map)

    if (code[action.primary].isFirst()) selectSlot = 0
    if (code[action.secondary].isFirst()) selectSlot = 1
    if (code[action.tertiary].isFirst()) selectSlot = 2
    if (code[action.rotateSlot].isFirst()) {
      if (code[action.shift].flag) selectSlot -= 0 < selectSlot ? 1 : -(mainSlotSize - 1)
      else selectSlot += selectSlot < mainSlotSize - 1 ? 1 : -(mainSlotSize - 1)
    }
    if (0 < wheelInput) {
      selectSlot += selectSlot < mainSlotSize - 1 ? 1 : -(mainSlotSize - 1)
    }
    if (wheelInput < 0) {
      selectSlot -= 0 < selectSlot ? 1 : -(mainSlotSize - 1)
    }
    if (code[action.inventory].isFirst()) inventoryFlag = !inventoryFlag
    if (inventory[selectSlot].category !== '' && spot.location === SpotField.locationList[1]) this.weaponProcess(mouseInput, cursor)
    if (inventory[selectSlot].category !== '') this.modeSelect()

    if (code[action.debug].isFirst()) this.isShowDamage = !this.isShowDamage
  }
  dropItemProcess = (intervalDiffTime) => {
    const blankInventorySlot = inventory.findIndex(v => v.category === '')
    dropItems.forEach((item, index) => {
      if (item.type === 'droppedWeapon') {
        if (item.life <= 0)  {
          dropItems[index] = {
            type: 'cartridge',
            x: item.x,
            y: item.y,
            life: 630,
            dissapearTime: 660,
            amount: item.magazines.reduce((prev, current) => {return prev + current})
          }
        }
        item.life = (item.life-1)|0
      }
      const width = this.ownself.x - item.x
      const height = this.ownself.y - item.y
      const distance = Math.sqrt(width ** 2 + height ** 2)
      if (0 <= blankInventorySlot) { // vacuuming
        let multiple = (
          SIZE < distance || (
          item.type === 'droppedWeapon')) &&
          mainSlotSize + inventorySize <= inventory.length ? 0 : 1 / distance
        item.x = item.x + width / distance * multiple * intervalDiffTime
        item.y = item.y + height / distance * multiple * intervalDiffTime
      }
      if (0 < item.unavailableTime) item.unavailableTime = (item.unavailableTime-1)|0
      if (item.type === 'cartridge') {
        const bulletRadius = SIZE / 6
        if (distance < minImgRadius + bulletRadius) {
          ammo = (ammo+item.amount)|0
          dropItems.splice(index, 1)
        }
      } else if (item.type === 'magazine') {
        if (inventory[selectSlot].category !== '' && item.unavailableTime <= 0 && distance < minImgRadius * 2) {
          for (let i = 0; i < inventory[selectSlot].magazines.length + 1; i=(i+1)|0) {
            if (inventory[selectSlot].magazines[i] === -1) return inventory[selectSlot].magazines[i] = item.amount
            if (i === inventory[selectSlot].magazines.length + 1) inventory[selectSlot].magazines.push(item.amount)
          }
          dropItems.splice(index, 1)
        }
      } else if (item.type === 'weapon' || item.type === 'droppedWeapon') {
        if (item.unavailableTime <= 0 && distance < minImgRadius * 2 && 0 <= blankInventorySlot) {
          delete item.type,
          delete item.unavailableTime,
          delete item.x,
          delete item.y
          if (item.time) delete item.time
          inventory[blankInventorySlot] = dropItems.splice(index, 1)[0]
        }
      }
    })
  }
  setWeapon = () => {
    let rarityIndex = 0
    const roundRistrict =
      wave.number < 6 ? 3 :
      wave.number < 11 ? 2 :
      wave.number < 16 ? 1 : 0
    for (let i = 0; i < weaponRarityList.length - (1 + roundRistrict); i++) {
      if (.5 < Math.random()) rarityIndex += 1
    }
    let categoryIndex = 0
    for (let i = 0; i < 3; i++) {
      if (.5 < Math.random()) categoryIndex += 1
    }
    if (categoryIndex === 3) categoryIndex = 5
    let modeList = [] // TODO: incomplete manual mode
    // type:: SEMI : BURST : FULL AUTO
    // HG:: 9 : 2 : 6
    // SMG:: 5 : 4 : 10
    // AR:: 7 : 3 : 7
    // DMR
    // SR
    // SG:: 5 : 3 : 3
    if ((
      categoryIndex === 0 && Math.random() < .9) || (
      categoryIndex === 1 && Math.random() < .5) || (
      categoryIndex === 2 && Math.random() < .7) || (
      categoryIndex === 5 && Math.random() < .5)
    ) {
      modeList.push(weaponModeList[1])
    }
    if ((
      categoryIndex === 0 && Math.random() < .2) || (
      categoryIndex === 1 && Math.random() < .4) || (
      categoryIndex === 2 && Math.random() < .3) || (
      categoryIndex === 5 && Math.random() < .3)
    ) {
      modeList.push(weaponModeList[2])
    }
    if ((
      categoryIndex === 0 && Math.random() < .6) || (
      categoryIndex === 1) || (
      categoryIndex === 2 && Math.random() < .7) || (
      categoryIndex === 5 && Math.random() < .3)
    ) {
      modeList.push(weaponModeList[3])
    }
    if (modeList.length === 0) modeList.push(weaponModeList[1])
    if (categoryIndex === 2 && modeList.length === 3 && Math.random() < .5) { // like AK-47
      modeList.push(...modeList.splice(1, 1))
    }
    let modeIndex = Math.floor(modeList.length * Math.random())
    if (modeList.length - 1 < modeIndex) modeIndex -= 1
    const HgMinmagazine = 5
    const HgExtendMag = 28
    const SmgMinMag = 15
    const SmgExtendMag = 35
    const ArMinmagazine = 10
    const ArExtendMag = 65
    const SgMinmagazine = 2
    const SgExtendMag = 30
    const magazineSize =
      categoryIndex === 0 ? (HgMinmagazine + HgExtendMag * Math.random())|0 : // max 33
      categoryIndex === 1 ? (SmgMinMag + SmgExtendMag * Math.random())|0 : // max 50
      categoryIndex === 2 ? (ArMinmagazine + ArExtendMag * Math.random())|0 : // max 75
      categoryIndex === 5 ? (SgMinmagazine + SgExtendMag * Math.random())|0 : // max 32
      // TODO: slug barrels
      0
    const magazines = Array(10).fill(magazineSize, 0, 5).fill(0, 5, 10)
    // Array(2 + ~~(Math.random() * (2 + ~~(wave.number / 5)))).fill(magazineSize)
    const HgBaseDamage = 70
    const SmgBaseDamage = 100
    const ArBaseDamage = 140
    const SgBaseDamage = 20
    const rarityMultiple = [
      1 + Math.random() * .25, // Common
      1 + Math.random() * .5, // Uncommon
      1 + Math.random() * .75, // Rare
      1 + Math.random() // Epic
    ]
    // TODO: Low mag(like revolver) bonus
    // TODO: Semi auto(like FN FAL) bonus
    const damage =
      categoryIndex === 0 ? (HgBaseDamage * rarityMultiple[rarityIndex])|0 :
      categoryIndex === 1 ? (SmgBaseDamage * rarityMultiple[rarityIndex])|0 :
      categoryIndex === 2 ? (ArBaseDamage * rarityMultiple[rarityIndex])|0 :
      categoryIndex === 5 ? (SgBaseDamage * rarityMultiple[rarityIndex])|0 : 0

    const magSizeRatio = (magazineSize < magSizeInitial) ? 1 - magazineSize / magSizeInitial : 0
    const slideSpeed = .75 + magSizeRatio + Math.random() * .25
    const bulletSpeed = cartridgeInfo.speed * (.5 + Math.random() * 1.5)
    const bulletLife = cartridgeInfo.life * (.5 + Math.random() * .5)
    const reloadSpeed = .25 + (1 - magSizeRatio) / 2 + Math.random() * .25
    // the smaller the bigger
    const loadingSpeed = loading.weight * (.25 + magSizeRatio / 2 + Math.random() * .25)
    const penetrationForce = Math.random()
    const roundLimit = modeList.some(v => {return v === weaponModeList[2]}) ? (2 + 3 * Math.random())|0 : 0

    // Expected effective range is halves the probability of hitting the target
    // (Actual range) / 10 [m]
    const effectiveRange =
      categoryIndex === 0 ? 2.5 + 17.5 * Math.random() : // HG: 2.5 - 20
      categoryIndex === 1 ? 5 + 20 * Math.random() : // SMG: 5 - 25
      categoryIndex === 2 ? 15 + 30 * Math.random() : // AR: 15 - 45
      categoryIndex === 5 ? 2 + 8 * Math.random() : 10 // SG: 2 - 10
    const recoilCoefficient =
      categoryIndex === 0 ? .1 + .5 * Math.random() : // HG: .1 - .6
      categoryIndex === 1 ? .2 + 1.3 * Math.random() : // SMG: .2 - 1.5
      categoryIndex === 2 ? 1 + 2 * Math.random() : // AR: 1 - 3
      categoryIndex === 5 ? .3 + .2 * Math.random() : 10 // SR: .3 - .5
    const gaugeNumber = categoryIndex === 5 ? 1 + 19 * Math.random()|0 : 1
    const weapon = new Weapon(
      `# ${wave.number}`,
      weaponCategoryList[categoryIndex],
      modeList,
      modeList[modeIndex],
      weaponRarityList[rarityIndex],
      damage,
      slideSpeed,
      bulletSpeed,
      bulletLife,
      reloadSpeed,
      magazineSize,
      magazines,
      loadingSpeed,
      penetrationForce,
      roundLimit,
      effectiveRange,
      recoilCoefficient,
      gaugeNumber,

      4000,
      0,
      wave.number
    )
    Object.assign(weapon, {type: 'weapon'})
    return weapon
  }
  differenceAddition = (position, dx, dy, intervalDiffTime) => {
    let flag = {x: false, y: false}
    if (!flag.x) position.x = position.x - dx * 60 / 1000 * intervalDiffTime
    if (!flag.y) position.y = position.y - dy * 60 / 1000 * intervalDiffTime
  }
  enemyProcess = (intervalDiffTime) => {
    enemyInfo.enemies.forEach((enemy, index) => {
      if (0 < enemy.timer) enemy.timer = (enemy.timer-1)|0
      if (enemy.life <= 0) {
        if (enemy.timer <= 0) {
          const c = {x: enemy.x, y: enemy.y}
          if (enemy.imageID === EnemyField.Enemy_Image_Amount) {
            enemyInfo.enemies[index] = this.setWeapon()
            enemyInfo.enemies[index].unavailableTime = 30
            enemyInfo.enemies[index].x = c.x
            enemyInfo.enemies[index].y = c.y
            dropItems.push(enemyInfo.enemies.splice(index, 1)[0])
          } else {
            enemyInfo.enemies.splice(index, 1)
          }
        } return
      }
      const width = this.ownself.x - enemy.x
      const height = this.ownself.y - enemy.y
      const length = Math.sqrt(width ** 2 + height ** 2)
      if (spot.dungeon === SpotField.dungeonList[0]) {
        this.differenceAddition(enemy, -width / length * enemy.speed, -height / length * enemy.speed, intervalDiffTime)
        if (
          enemyInfo.enemies.some((e, i) => index !== i && 0 < e.life &&
          Math.sqrt((e.x - enemy.x) ** 2 + (e.y - enemy.y) ** 2) < SIZE)
        ) {
          this.differenceAddition(
            enemy,
            -width / length * enemy.speed + (SIZE / 2 * (.5 - Math.random())),
            -height / length * enemy.speed + (SIZE / 2 * (.5 - Math.random())),
            intervalDiffTime
          )
        }
      } else if (spot.dungeon === SpotField.dungeonList[1]) {
        const r = .17 * intervalDiffTime
        const x = enemy.x + r * Math.cos(enemy.theta)
        const y = enemy.y + r * Math.sin(enemy.theta)
        const DELTA_THETA = .001 * intervalDiffTime
        enemy.theta +=
          (x - enemy.x) * (this.ownself.y - enemy.y) - (this.ownself.x - enemy.x) * (y - enemy.y) < 0 ?  // Cross product
          -DELTA_THETA : DELTA_THETA
        enemy.x += r * Math.cos(enemy.theta)
        enemy.y += r * Math.sin(enemy.theta)
      } else if (spot.dungeon === SpotField.dungeonList[2]) {
        if (enemy.state === 'active') {
          const r = .275 * intervalDiffTime

          const x = enemy.x + r * Math.cos(enemy.theta)
          const y = enemy.y + r * Math.sin(enemy.theta)
          const DELTA_THETA = .0004 * intervalDiffTime
          const CROSS_PRODUCT = (x - enemy.x) * (this.ownself.y - enemy.y) - (this.ownself.x - enemy.x) * (y - enemy.y)
          enemy.theta += CROSS_PRODUCT < 0 ? -DELTA_THETA : DELTA_THETA

          enemy.x += r * Math.cos(enemy.theta)
          enemy.y += r * Math.sin(enemy.theta)
          enemy.fuel -= intervalDiffTime
          if (enemy.fuel < 0) enemy.state = 'wait'
        } else if (enemy.state === 'wait') {
          const r = .35 * intervalDiffTime
          const x = enemy.x + r * Math.cos(enemy.theta)
          const y = enemy.y + r * Math.sin(enemy.theta)
          const DELTA_THETA = .002 * intervalDiffTime
          const CROSS_PRODUCT = (x - enemy.x) * (this.ownself.y - enemy.y) - (this.ownself.x - enemy.x) * (y - enemy.y)
          enemy.theta += CROSS_PRODUCT < 0 ? -DELTA_THETA : DELTA_THETA
          if (Math.abs(CROSS_PRODUCT) <= 1) {
            enemy.state = 'active'
            enemy.fuel = 1500 + 500 * Math.random()
          }
        }
      }
      enemy.step = (enemy.stepLimit <= enemy.step) ? enemy.step = 0 : (enemy.step+1)|0
      // collisionDetect
      if (((
          this.ownself.x - enemy.x) ** 2 + (this.ownself.y - enemy.y) ** 2
        ) ** .5 < minImgRadius * 2 + SIZE / 8 && 0 < enemy.life
      ) {
        if (dash.coolTimeLimit - dash.coolTime < dash.invincibleTime) {
          if (!dash.isAttack) {
            dash.isAttack = true
            enemy.life = (enemy.life-dash.damage)|0
            enemy.damage = dash.damage
            enemy.timer = damageTimerLimit
            const additionalPoint = (enemy.life <= 0) ? 130 : 10
            if (additionalPoint === 130) enemyInfo.defeatCount = (enemyInfo.defeatCount+1)|0
            point = (point+additionalPoint)|0
            afterglow.point.push({number: additionalPoint, count: 30})
          }
        } else {
          this.dispatchEvent('addMenu', 'result')
          return
        }
      }
    })
  }
  /*
  portalProcess = (intervalDiffTime, mouseInput, cursor, mouseDownPosition) => {
    if (!portalFlag) {
      portalFlag = true
      portalCooldinate.x = ownPosition.x|0
      portalCooldinate.y = (ownPosition.y - SIZE * 3)|0
    }
    if (
      portalCooldinate.x - SIZE <= ownPosition.x && ownPosition.x <= portalCooldinate.x + SIZE &&
      portalCooldinate.y - SIZE <= ownPosition.y && ownPosition.y <= portalCooldinate.y + SIZE
    ) {
      // Return to Base
      if (this.boxInterface.isDownAndUpInBox(portalConfirmBox[0], mouseInput.getKeyUp(0), cursor, mouseDownPosition)) {
        portalCooldinate.y += SIZE * 3
        location = locationList[0]
        dropItems = []
        saveProcess()
      }
      // Continue
      if (
        this.boxInterface.isDownAndUpInBox(portalConfirmBox[1], mouseInput.getKeyUp(0), cursor, mouseDownPosition) ||
        this.boxInterface.isDownAndUpInBox(portalConfirmBox[2], mouseInput.getKeyUp(0), cursor, mouseDownPosition)
      ) {
        portalFlag = false
        portalCooldinate.x = 0
        portalCooldinate.y = 0
        location = locationList[1]
        dropItems = []
        saveProcess()
        setWave()
      }
    }
  }
  */
  slideProcess = () => {
    if (
      inventory[selectSlot].magazines[inventory[selectSlot].grip] <= 0 &&
      inventory[selectSlot].slideState === 'release') return
    if (inventory[selectSlot].reloadState !== 'done') return
    inventory[selectSlot].slideTime = (
      combatReload.flag) ? (inventory[selectSlot].slideTime+1)|0 : (inventory[selectSlot].slideTime+1)|0
    if (
      inventory[selectSlot].slideState === 'pullBack' &&
      inventory[selectSlot].slideStop * inventory[selectSlot].slideSpeed <= inventory[selectSlot].slideTime
    ) {
      if (!inventory[selectSlot].gripFlag) return
      inventory[selectSlot].slideState = 'release'
      const stopSlide = () => {
        if (inventory[selectSlot].magazines[inventory[selectSlot].grip] === 0) return // cocking postponement
        if ((code[action.combatReload].flag || combatReload.auto === 'ON') && combatReload.magFlag) {
          combatReload.flag = true
          combatReload.weight = (!code[action.combatReload].flag) ? 8 : 4
        }
      }
      stopSlide()
    } else if (
      inventory[selectSlot].slideState === 'release' &&
      inventory[selectSlot].slideDone * inventory[selectSlot].slideSpeed <= inventory[selectSlot].slideTime
    ) {
      inventory[selectSlot].slideState = 'done'
      const doneSlide = () => {
        if (combatReload.flag) {
          ammo = (ammo-1)|0
          combatReload.flag = false
        } else if (
          0 < inventory[selectSlot].magazines[inventory[selectSlot].grip] &&
          !inventory[selectSlot].chamber
        ) {
          inventory[selectSlot].magazines[inventory[selectSlot].grip] =
            (inventory[selectSlot].magazines[inventory[selectSlot].grip]-1)|0 // semi automatic mechanism
        }
        inventory[selectSlot].chamber = true
        if (afterglow.chamberFlag) {
          afterglow.reload = this.reloadFlashTimeLimit
          afterglow.chamberFlag = false
        }
        combatReload.magFlag = false
        combatReload.weight = (combatReload.auto === 'ON') ? 8 : 4
      }
      doneSlide()
    } else if (inventory[selectSlot].slideState === 'done') {
      if (0 <= inventory[selectSlot].slideTime) return inventory[selectSlot].slideState = 'pullBack'
    } else return
    inventory[selectSlot].slideTime = 0
  }
  setEnemy = () => {
    const setEnemySpeed = () => {
      return (wave.number === 16) ? .95 + Math.random() * .05 : // pre
      (wave.number === 15) ? .9 + Math.random() * .1 :
      (wave.number === 14) ? .85 + Math.random() * .15 :
      (wave.number === 13) ? .8 + Math.random() * .2 :
      (wave.number === 12) ? .75 + Math.random() * .25 :
      (wave.number === 11) ? .75 + Math.random() * .2 :
      (wave.number === 10) ? .75 + Math.random() * .15 :
      (wave.number === 9) ? .7 + Math.random() * .25 :
      (wave.number === 8) ? .7 + Math.random() * .2 :
      (wave.number === 7) ? .7 + Math.random() * .15 :
      (wave.number === 6) ? .65 + Math.random() * .2 :
      (wave.number === 5) ? .65 + Math.random() * .15 :
      (wave.number === 4) ? .65 + Math.random() * .1 :
      (wave.number === 3) ? .6 + Math.random() * .15 :
      (wave.number === 2) ? .6 + Math.random() * .1 :
      (wave.number === 1) ? .6 + Math.random() * .05 : 1
    }
    const type = SpotField.dungeonList[0] ? SpotField.dungeonList[0] : SpotField.dungeonList[1]
    const r =  Math.sqrt(canvas.offsetWidth ** 2 + canvas.offsetHeight ** 2) / 2
    const a = 2 * Math.PI * Math.random()
    const x = this.ownself.x + r * Math.cos(a)
    const y = this.ownself.y + r * Math.sin(a)
    const theta = a - Math.PI
    enemyInfo.enemies.push({
      type: type,
      life: wave.enemyHitPoint+.5|0,
      x: x,
      y: y,
      theta: theta,
      speed: setEnemySpeed(),
      state: 'active',
      fuel: 1000,
      step: 0,
      stepLimit: wave.enemySpawnIntervalLimit - ~~(Math.random() * 5),
      imageID: ~~(Math.random() * EnemyField.Enemy_Image_Amount)
    })
    if (wave.enemyCount === wave.enemyLimit) enemyInfo.enemies[enemyInfo.enemies.length-1].imageID = EnemyField.Enemy_Image_Amount
  }
  waveProcess = (intervalDiffTime, mouseInput, cursor, mouseDownPosition) => {
    if (wave.enemyCount < wave.enemyLimit) {
      if (wave.enemySpawnInterval < wave.enemySpawnIntervalLimit) {
        wave.enemySpawnInterval += intervalDiffTime
      } else if (enemyInfo.enemies.length <= 24) { // && wave.enemySpawnIntervalLimit <= wave.enemySpawnInterval
        wave.enemySpawnInterval = 0
        wave.enemyCount += 1
        this.setEnemy()
      }
    } else if (enemyInfo.enemies.length === 0) { // && wave.enemyLimit <= wave.enemyCount
      wave.roundInterval += intervalDiffTime
      if (wave.roundIntervalLimit <= wave.roundInterval) {
        if (wave.number % 5 === 0) this.portalProcess(intervalDiffTime, mouseInput, cursor, mouseDownPosition)
        else setWave()
      }
    }
  }
  combatProcess = (intervalDiffTime, mouseInput, cursor, mouseDownPosition) => {
    enemyBulletArray.forEach(v => {
      if (((
        this.ownself.x - v.x) ** 2 + (this.ownself.y - v.y) ** 2) ** .5 < v.radius + SIZE * .2 &&
        dash.coolTime < dash.coolTimeLimit - dash.invincibleTime
      ) this.dispatchEvent('addMenu', 'result')
    })

    if (inventory[selectSlot].category !== '' && !inventory[selectSlot].chamber) this.slideProcess()
    if (spot.dungeon !== SpotField.dungeonList[3]) this.waveProcess(intervalDiffTime, mouseInput, cursor, mouseDownPosition)
    if (0 < enemyInfo.enemies.length) this.enemyProcess(intervalDiffTime)
    bullets.forEach((bullet, i) => {
      bullet.update()
      if (bullet.life < 0) bullets.splice(i, 1)
    })
    if (afterglow.round < wave.roundIntervalLimit) afterglow.round += intervalDiffTime
  }

  inventoryProcess = (mouseInput, cursor) => {
    inventory.forEach(v => {
      if (v.category !== '') v.recoilEffect *= v.recoilMultiple
    })
    if (!settingsObject.isManipulateSlotAnytime && !inventoryFlag) {
      if (holdSlot.category !== '') {
        inventory.forEach((v, i) => {
          if (v.category === '') {
            [holdSlot, inventory[i]] = [inventory[i], holdSlot]
          }
        })
      }
      return
    }
    inventorySlotBox.forEach((v, i) => {
      if (!inventoryFlag && mainSlotSize - 1 < i) return
      if (this.boxInterface.isDownInBox(v, mouseInput.getKeyDown(0), cursor)) {
        if (code[action.shift].flag) {
          if (isWarehouse) {
            warehouse.push(inventory[i])
            inventory[i] = {category: ''}
            orderNumber = -1
            isDescending = false
          } else {
            let findIndex = -1
            if (i < mainSlotSize) {
              findIndex = inventory.findIndex((v, index) => mainSlotSize <= index && v.category === '')
            } else findIndex = inventory.findIndex((v, index) => index < mainSlotSize && v.category === '')
            if (findIndex !== -1) [inventory[i], inventory[findIndex]] = [inventory[findIndex], inventory[i]]
          }
        } else {
          [holdSlot, inventory[i]] = [inventory[i], holdSlot]
          // afterglow.inventory = 60
        }
      }
    })
    if (
      holdSlot.category !== '' &&
      !this.boxInterface.isDownInBox(inventoryBox, mouseInput.getKeyDown(0), cursor) &&
      mouseInput.getKeyDown(0) && (
      !isWarehouse || !this.boxInterface.isDownInBox(warehouseBox, mouseInput.getKeyDown(0), cursor))
    ) {
      holdSlot.type = 'weapon'
      holdSlot.unavailableTime = 30
      const r = SIZE * 3
      const theta = Math.atan2(cursor.offsetY - canvas.offsetHeight / 2, cursor.offsetX - canvas.offsetWidth / 2)
      holdSlot.x = this.ownself.x + r * Math.cos(theta)
      holdSlot.y = this.ownself.y + r * Math.sin(theta)
      dropItems.push(holdSlot)
      holdSlot = {category: ''}
    }

    if (0 < afterglow.inventory) afterglow.inventory = (afterglow.inventory-1)|0
  }
  update (intervalDiffTime, input, mouseInput, cursor, mouseDownPosition, wheelInput) {
    if (spot.location === SpotField.locationList[1] && spot.dungeon === SpotField.dungeonList[4]) {
    } else {
      this.interfaceProcess(intervalDiffTime, input, mouseInput, cursor, wheelInput)
      if (0 < dropItems.length) this.dropItemProcess(intervalDiffTime)
      this.inventoryProcess(mouseInput, cursor)

      const arrayUpdater = array => {
        array.forEach((v, i) => {
          v.update(intervalDiffTime)
        if (v.life <= 0) array.splice(i, 1)
        })
      }
      array.forEach(v => {
        arrayUpdater(v)
      })
    }
    // if (portalFlag) this.portalProcess()
    if (spot.location === SpotField.locationList[1]) this.combatProcess(intervalDiffTime, mouseInput, cursor, mouseDownPosition)

    this.map.layers.filter(v => v.name.includes('event_')).forEach(v => {
      v.objects.filter(a => a.name.includes('start')).forEach(spotData => {
        this.startSpot.update(intervalDiffTime, mouseInput, cursor, mouseDownPosition, spotData, this.ownself)
      })
      v.objects.filter(a => a.name.includes('save')).forEach(spotData => {
        this.saveSpot.update(intervalDiffTime, mouseInput, cursor, mouseDownPosition, spotData, this.ownself)
      })
      v.objects.filter(a => a.name.includes('shop')).forEach(spotData => {
        this.shopSpot.update(intervalDiffTime, mouseInput, cursor, mouseDownPosition, spotData, this.ownself)
      })
    })
  }

  relativeX = (arg) => {
    const a = settingsObject.isMiddleView ? screenOwnPos.x - this.ownself.x : canvas.offsetWidth / 2 - this.ownself.x
    return a + arg
  }
  relativeY = (arg) => {
    const a = settingsObject.isMiddleView ? screenOwnPos.y - this.ownself.y : canvas.offsetHeight / 2 - this.ownself.y
    return a + arg
  }
  renderMap = (mouseInput, cursor) => {
    const pos =
      settingsObject.isMiddleView ? {
        x: this.ownself.x - screenOwnPos.x,
        y: this.ownself.y - screenOwnPos.y
      } : {
        x: this.ownself.x - canvas.offsetWidth * .5,
        y: this.ownself.y - canvas.offsetHeight * .5
      }
    this.map.layers.filter(v => v.name.includes('tileset_')).forEach(v => {
      for (let x = 0; x < v.width; x++) {
        for (let y = 0; y < v.height; y++) {
          let id = v.data[v.width * y + x]
          if (0 < id) {
            let flag = false
            this.map.tilesets.forEach((vl, i, a) => {
              if (flag) return
              if (id < vl.firstgid) {
                const diff = i === 0 ? 0 : a[i - 1].firstgid
                context.drawImage(
                  TILESET_IMAGE_ARRAY[a[i - 1].source],
                  ((id - diff) % TILESET_DATA_ARRAY[a[i - 1].source].columns) * SIZE,
                  ((id - diff) - (id - diff) % TILESET_DATA_ARRAY[a[i - 1].source].columns) /
                    TILESET_DATA_ARRAY[a[i - 1].source].columns * SIZE,
                  SIZE,
                  SIZE,
                  (x * SIZE - pos.x)|0,
                  (y * SIZE - pos.y)|0,
                  SIZE,
                  SIZE
                  )
                flag = true
              }
            }, 0)
          }
        }
      }
    })
    this.map.layers.filter(v => v.name.includes('image_')).forEach(v => {
      const IMG = v.image.replace('../', '')
      context.drawImage(IMAGE[IMG], this.relativeX(v.offsetx), this.relativeY(v.offsety))
    })
    this.map.layers.filter(v => v.name.includes('event_')).forEach(v => {
      v.objects.filter(a => a.name.includes('start')).forEach(spotData => {
        this.startSpot.render(mouseInput, cursor, spotData, this.ownself)
      })
      v.objects.filter(a => a.name.includes('save')).forEach(spotData => {
        this.saveSpot.render(mouseInput, cursor, spotData, this.ownself)
      })
      v.objects.filter(a => a.name.includes('shop')).forEach(spotData => {
        this.shopSpot.render(mouseInput, cursor, spotData, this.ownself)
      })
    })
  }
  /*
  renderPortal = (intervalDiffTime, timeStamp, cursor) => {
    const particle = class {
      constructor (x, y, w, h, dx, dy, life, lightness) {
        this.x = x
        this.y = y
        this.w = w
        this.h = h
        this.dx = dx
        this.dy = dy
        this.presetLife = life
        this.life = life
        this.lightness = lightness
      }
      lifeCycle(i) {
        this.life -= intervalDiffTime
        if (this.life <= 0) portalParticle.splice(i, 1)
      }
      setColor() {
        const ms = 75
        const alpha =
          this.presetLife - ms < this.life ? (this.presetLife - this.life) / ms :
          this.life < ms ? this.life / ms : 1
        return `hsla(180, 100%, ${this.lightness}%, ${alpha})`
      }
    }
    portalParticleTime += intervalDiffTime
    const interval = 100 // ms
    if (interval <= portalParticleTime) {
      portalParticleTime -= interval + Math.random()
      portalParticle.push(new particle(
        portalCooldinate.x + (Math.random() - .5) * SIZE, portalCooldinate.y + (Math.random() / 2 - .75) * SIZE,
        1, SIZE / 2, 0, -.15,
        600 + Math.random() * 300, 80 + Math.random() * 20))
    }
    context.fillStyle =
      `hsl(180, 100%, ${85 + ((1 + Math.sin(timeStamp / 600)) / 2) * 15}%)`
    context.beginPath()
    context.ellipse(
      this.relativeX(portalCooldinate.x), this.relativeY(portalCooldinate.y), SIZE * .7, SIZE * .3, 0, 0, 2 * Math.PI, false)
    context.fill()
    portalParticle.forEach((v, i) => {
      v.lifeCycle(i)
      context.fillStyle = v.setColor()
      context.fillRect(this.relativeX(v.x), this.relativeY(v.y), v.w, v.h)
      v.x += v.dx
      v.y += v.dy
    })

    const drawScreenEdge = (obj, hue) => {
      context.save()
      context.fillStyle = `hsl(${hue}, 100%, 90%)`
      if (
        obj.x < ownPosition.x - screenOwnPos.x + radius &&
       obj.y < ownPosition.y - screenOwnPos.y + radius // left & top
      ) context.fillRect(0, 0, SIZE, SIZE)
      else if (
        obj.x < ownPosition.x - screenOwnPos.x + radius &&
        ownPosition.y + canvas.offsetHeight - screenOwnPos.y - SIZE + radius < obj.y // left & bottom
      ) context.fillRect(0, canvas.offsetHeight - SIZE, SIZE, SIZE)
      else if (
        ownPosition.x + canvas.offsetWidth - screenOwnPos.x - SIZE + radius < obj.x &&
        obj.y < ownPosition.y - screenOwnPos.y + radius // right & top
      ) context.fillRect(canvas.offsetWidth - SIZE, 0, SIZE, SIZE)
      else if (
        ownPosition.x + canvas.offsetWidth - screenOwnPos.x - SIZE + radius < obj.x &&
        ownPosition.y + canvas.offsetHeight - screenOwnPos.y - SIZE + radius < obj.y // right & bottom
      ) context.fillRect(canvas.offsetWidth - SIZE, canvas.offsetHeight - SIZE, SIZE, SIZE)
      else if (obj.x < ownPosition.x - screenOwnPos.x + radius) { // out of left
        context.fillRect(0, this.relativeY(obj.y - radius), SIZE, SIZE)
      } else if (ownPosition.x + canvas.offsetWidth - screenOwnPos.x + radius < obj.x) { // out of right
        context.fillRect(canvas.offsetWidth-SIZE, this.relativeY(obj.y - radius), SIZE, SIZE)
      } else if (obj.y < ownPosition.y - screenOwnPos.y + radius) { // out of top
        context.fillRect(this.relativeX(obj.x - radius), 0, SIZE, SIZE)
      } else if (ownPosition.y + canvas.offsetHeight - screenOwnPos.y + radius < obj.y) { // out of bottom
        context.fillRect(this.relativeX(obj.x - radius), canvas.offsetHeight - SIZE, SIZE, SIZE)
      }
      context.restore()
    }
    drawScreenEdge(portalCooldinate, 180)
    if (
      portalCooldinate.x - SIZE <= ownPosition.x && ownPosition.x <= portalCooldinate.x + SIZE &&
      portalCooldinate.y - SIZE <= ownPosition.y && ownPosition.y <= portalCooldinate.y + SIZE
    ) {
      context.save()
      context.textAlign = 'center'
      context.fillStyle = ' hsl(30, 100%, 50%)'
      context.font = `${SIZE}px ${font}`
      if (location === locationList[0]) {
        context.fillText(`Continue to round ${wave.number + 1}`, canvas.offsetWidth / 2, canvas.offsetHeight * 3 / 8)
      } else { // location === locationList[1]
        context.fillText('Return to Base?', canvas.offsetWidth / 2, canvas.offsetHeight / 5)
      }
      portalConfirmBox.forEach((v, i) => {
        if (location === locationList[0] && (i !== 2)) return
        if (location === locationList[1] && (i === 2)) return
        this.renderBox.render(v, mouseInput, cursor)
      })
      context.restore()
    }
  }
  */
  drawBullets = () => {
    bullets.forEach(bullet => {
      context.fillStyle = `hsla(0, 0%, 0%, ${bullet.life / bullet.baseLife})`
      context.beginPath()
      context.arc(this.relativeX(bullet.x), this.relativeY(bullet.y), bullet.bulletRadius, 0, Math.PI * 2, false)
      context.fill()
    })
  }
  drawEnemies = () => {
    enemyInfo.enemies.forEach(enemy => {
      context.fillStyle = (enemy.imageID === 0) ? 'hsla(0, 100%, 50%, .5)' :
      (enemy.imageID === 1) ? 'hsla(300, 100%, 50%, .5)' :
      (enemy.imageID === 2) ? 'hsla(60, 100%, 60%, .5)' : 'hsla(0, 0%, 100%, .5)'
      {
        const imgPath = (enemy.imageID === 0) ?
        {F: 'images/JK32F.png', L: 'images/JK32L.png', R: 'images/JK32R.png'} :
        (enemy.imageID === 1) ?
        {F: 'images/JK33F.png', L: 'images/JK33L.png', R: 'images/JK33R.png'} :
        (enemy.imageID === 2) ?
        {F: 'images/JK34F.png', L: 'images/JK34L.png', R: 'images/JK34R.png'} :
        {F: 'images/JK35Fv1.png', L:'images/JK35Fv1.png', R: 'images/JK35Fv1.png'}
        const imgEnemy = (enemy.step <= enemy.stepLimit * 3 / 8) ? imgPath.R :
        (enemy.stepLimit / 2 <= enemy.step && enemy.step <= enemy.stepLimit * 7 / 8) ?
        imgPath.L : imgPath.F
        const coordinate = (enemy.life <= 0) ?
        {x:enemy.x - radius, y:enemy.y - radius + (enemy.timer - damageTimerLimit) * .25} :
        {x:enemy.x - radius, y:enemy.y - radius}
          context.save()
        if (enemy.life <= 0) context.globalAlpha = enemy.timer/damageTimerLimit
        context.drawImage(
          IMAGE[imgEnemy], ~~(this.relativeX(coordinate.x)+.5), ~~(this.relativeY(coordinate.y)+.5)
        )
        context.restore()
        if (this.isShowDamage) {
          if (0 < enemy.life) {
            context.font = `${SIZE/2}px ${font}`
            context.fillRect(this.relativeX(enemy.x - radius), this.relativeY(enemy.y - radius * 1.2),
            enemy.life / wave.enemyHitPoint * SIZE, SIZE / 16)
            // context.fillText(Math.ceil(enemy.life) // numerical drawing
            // , relativeX(enemy.x - radius), relativeY(enemy.y - radius * 1.2))
          }
          // pop damage
          context.font = `${SIZE * 2 / 3 * enemy.timer/damageTimerLimit}px ${font}`
          context.fillStyle = `hsla(0, 0%, 50%, ${enemy.timer/damageTimerLimit})`
          context.fillText(
            Math.ceil(enemy.damage),
            this.relativeX(enemy.x - radius - (damageTimerLimit - enemy.timer)),
            this.relativeY(enemy.y - radius * 2 - (damageTimerLimit - enemy.timer))
          )
        }
      }
    })
  }
  drawScreenEdgeArc = (item) => {
    const testSize = SIZE / 3
    context.save()
    context.fillStyle =
      item.rarity === weaponRarityList[0] ? weaponRatiryColorList[0] :
      item.rarity === weaponRarityList[1] ? weaponRatiryColorList[1] :
      item.rarity === weaponRarityList[2] ? weaponRatiryColorList[2] :
      item.rarity === weaponRarityList[3] ? weaponRatiryColorList[3] : weaponRatiryColorList[4]
    context.beginPath()
    if ( // left & top
      item.x < this.ownself.x - screenOwnPos.x + testSize / 2 &&
      item.y < this.ownself.y - screenOwnPos.y + testSize / 2
    ) context.arc(
      testSize / 2, testSize / 2, testSize / 2, 0 / 2, Math.PI * 2, false
    )
    else if ( // left & bottom
      item.x < this.ownself.x - screenOwnPos.x + testSize / 2 &&
      this.ownself.y + canvas.offsetHeight - screenOwnPos.y - testSize / 2 < item.y
    ) context.arc(
      testSize / 2, canvas.offsetHeight - testSize / 2,
      testSize / 2, 0, Math.PI * 2, false
    )
    else if ( // right & top
      this.ownself.x + canvas.offsetWidth - screenOwnPos.x - testSize / 2 < item.x &&
      item.y < this.ownself.y - screenOwnPos.y + testSize / 2
    ) context.arc(
      canvas.offsetWidth - testSize / 2, testSize / 2,
      testSize / 2, 0, Math.PI * 2, false
    )
    else if ( // right & bottom
      this.ownself.x + canvas.offsetWidth - screenOwnPos.x - testSize / 2 < item.x &&
      this.ownself.y + canvas.offsetHeight - screenOwnPos.y - testSize / 2 < item.y
    ) context.arc(
      canvas.offsetWidth - testSize / 2,
      canvas.offsetHeight - testSize / 2,
      testSize / 2, 0, Math.PI * 2, false
    )
    else if (item.x < this.ownself.x - screenOwnPos.x + testSize / 2) { // out of left
      context.arc(
        testSize / 2, this.relativeY(item.y), testSize / 2, 0, Math.PI * 2, false
      )
    } else if (this.ownself.x + canvas.offsetWidth - screenOwnPos.x + testSize / 2 < item.x) { // out of right
      context.arc(
        canvas.offsetWidth - testSize / 2, this.relativeY(item.y),
        testSize / 2, 0, Math.PI * 2, false
      )
    } else if (item.y < this.ownself.y - screenOwnPos.y + testSize / 2) { // out of top
      context.arc(
        this.relativeX(item.x), testSize / 2,
        testSize / 2, 0, Math.PI * 2, false
      )
    } else if (this.ownself.y + canvas.offsetHeight - screenOwnPos.y + testSize / 2 < item.y) { // out of bottom
      context.arc(
        this.relativeX(item.x), canvas.offsetHeight - testSize  + testSize / 2,
        testSize / 2, 0, Math.PI * 2, false
      )
    } else {
      context.arc(this.relativeX(item.x), this.relativeY(item.y), testSize, 0, Math.PI * 2, false)
    }
    context.fill()
    context.restore()
  }
  drawDropItems = () => {
    dropItems.forEach(item => {
      if (item.type === 'weapon') {
        this.drawScreenEdgeArc(item)
      } else if (item.type === 'magazine') {
        context.fillStyle = 'hsl(120, 100%, 20%)'
        context.fillRect(this.relativeX(item.x), this.relativeY(item.y), SIZE / 3, SIZE * 2 / 3)
      } else if (item.type === 'droppedWeapon') {
        context.fillStyle = (item.type === 'droppedWeapon') ?
        `hsla(180, 100%, 30%, ${item.life/600})` :
        'hsl(180, 100%, 40%)'
        context.fillRect(this.relativeX(item.x), this.relativeY(item.y), SIZE * 2 / 3, SIZE * 2 / 3)
      }
    })
  }
  drawIndicator = () => {
    const setOtherMagazine = () => {
      const array = inventory[selectSlot].magazines.map((x, i) => {
        if (x === inventory[selectSlot].magazineSize || i === inventory[selectSlot].grip) return -1
        else return x
      })
      const index = array.indexOf(Math.max(...array))
      if (
        index !== inventory[selectSlot].grip && // if only a magazine
        inventory[selectSlot].magazines[index] !== inventory[selectSlot].magazineSize
      ) return index
      else return -1
    }
    let c = {x: canvas.offsetWidth - SIZE / 2, y: canvas.offsetHeight - SIZE}
    context.font = `${SIZE}px ${font}`
    context.fillStyle = 'hsla(120, 100%, 30%, .7)'
    context.textAlign = 'right'
    context.fillText(point, c.x, c.y - SIZE * 5)
    context.fillStyle = 'hsla(60, 100%, 50%, .7)'
    if (0 < afterglow.point.length) {
      context.font = `${SIZE*.75}px ${font}`
      afterglow.point.forEach((x, i) => {
        context.fillText(`+${x.number}`, c.x - SIZE * 2 - (30 - x.count)/2, c.y - SIZE * 6)
        x.count = (x.count-1)|0
        if (x.count <= 0) afterglow.point.splice(i, 1)
      })
      context.font = `${SIZE}px ${font}`
    }
    if (inventory[selectSlot].category !== '') {
      const cartridges = inventory[selectSlot].magazines[inventory[selectSlot].grip]
      context.fillStyle = (cartridges < inventory[selectSlot].magazineSize * .1) ? 'hsla(0, 100%, 60%, .7)' :
      (cartridges < inventory[selectSlot].magazineSize * .3) ? 'hsla(60, 100%, 70%, .7)' : 'hsla(210, 100%, 50%, .7)'
      context.save()
      inventory[selectSlot].modeList.forEach((v, i) => {
        context.fillStyle = 'hsla(210, 100%, 50%, .7)'
        if (inventory[selectSlot].mode === v) {
          context.fillRect(c.x - SIZE * .8, c.y - SIZE * (9.7 - i), SIZE / 6, SIZE * .65)
        }
        const text =
          v === weaponModeList[1] ? '1' : // SEMI AUTO
          v === weaponModeList[2] ? inventory[selectSlot].roundLimit : // BURST
          v === weaponModeList[3] ? 'F' : '' // FULL AUTO
          context.fillText(text, c.x, c.y - SIZE * (9 - i))
      })
      if (settingsObject.isManipulateCode && 1 < inventory[selectSlot].modeList.length) {
        context.fillStyle = 'hsla(210, 100%, 75%, .4)'
        context.fillRect(c.x - SIZE * .55, c.y - SIZE * 10.6, SIZE * .6, SIZE * .6)
        context.font = `${SIZE*.75}px ${font}`
        context.fillStyle = 'hsla(0, 0%, 100%, .4)'
        context.fillText(extractCode(action.modeSelect), c.x , c.y - SIZE * 10)
      }
      context.restore()
      context.save()
      const inChamber = (inventory[selectSlot].chamber) ? 1 : 0
      context.fillText(`${cartridges}+${inChamber}`, c.x, c.y - SIZE * 3)
      // context.fillStyle = ammo === 0 ? 'hsla(0, 100%, 60%, .7)' : 'hsla(210, 100%, 50%, .7)'
      // context.fillText(ammo, c.x, c.y)
      context.restore()
      const cartridgeSize = 1 / (inventory[selectSlot].magazineSize + 1)
      const yOffset = canvas.offsetHeight - SIZE * .75
      const yHeight = SIZE * 3
      c.x = canvas.offsetWidth - SIZE * .75
      c.y = yOffset - inventory[selectSlot].magazineSize * cartridgeSize * yHeight
      if (0 < afterglow.reload) context.fillStyle = 'hsla(0, 100%, 100%, .7)'
      context.fillRect(c.x, c.y, -SIZE / 4, -inChamber * cartridgeSize * yHeight) // chamber
      const releaseTime = inventory[selectSlot].reloadRelease * inventory[selectSlot].reloadSpeed
      const putAwayTime = inventory[selectSlot].reloadPutAway * inventory[selectSlot].reloadSpeed
      const takeOutTime = inventory[selectSlot].reloadTakeOut * inventory[selectSlot].reloadSpeed
      const unreleaseTime = inventory[selectSlot].reloadUnrelease * inventory[selectSlot].reloadSpeed
      let ratio = (inventory[selectSlot].reloadState === 'release' && inventory[selectSlot].reloadTime <= releaseTime) ?
      1 - inventory[selectSlot].reloadTime / releaseTime : // 1
      (inventory[selectSlot].reloadState === 'unrelease' && inventory[selectSlot].reloadTime <= unreleaseTime) ? // 2
      inventory[selectSlot].reloadTime / unreleaseTime : 1
      if (inventory[selectSlot].reloadState === 'done' || inventory[selectSlot].reloadState === 'release' || inventory[selectSlot].reloadState === 'unrelease') {
        c.y = yOffset - (ratio - 1) * inventory[selectSlot].magazineSize * cartridgeSize * yHeight
        if (inventory[selectSlot].slideState !== 'release' && inventory[selectSlot].slideTime === 0) { // slide gauge
          context.fillRect(c.x - SIZE * 5 / 16, c.y, SIZE / 16, -yHeight) // full
        } else if (inventory[selectSlot].slideState === 'pullBack') {
          context.fillRect(
            c.x - SIZE * 5 / 16,
            c.y,
            SIZE / 16,
            -(1 - inventory[selectSlot].slideTime / (inventory[selectSlot].slideStop * inventory[selectSlot].slideSpeed)) * yHeight
          )
        } else if (inventory[selectSlot].slideState === 'release') {
          context.fillRect(
            c.x - SIZE * 5 / 16,
            c.y,
            SIZE / 16,
            - (inventory[selectSlot].slideTime / (inventory[selectSlot].slideDone * inventory[selectSlot].slideSpeed)) * yHeight
          )
        }
      }
      ratio = (inventory[selectSlot].reloadState === 'release') ? 1 - inventory[selectSlot].reloadTime / releaseTime :
      (inventory[selectSlot].reloadState === 'putAway') ? inventory[selectSlot].reloadTime / putAwayTime :
      (inventory[selectSlot].reloadState === 'takeOut') ? 1 - inventory[selectSlot].reloadTime / takeOutTime :
      (inventory[selectSlot].reloadState === 'unrelease') ? inventory[selectSlot].reloadTime / unreleaseTime : 1
      inventory[selectSlot].magazines.forEach((magazine, index) => {
        if (magazine !== -1) {
          context.fillStyle = (0 < afterglow.reload && index === inventory[selectSlot].grip) ?
          'hsla(0, 100%, 100%, .7)' :
          (magazine < inventory[selectSlot].magazineSize * .1) ?
          'hsla(0, 100%, 60%, .7)' :
          (magazine < inventory[selectSlot].magazineSize * .3) ?
          'hsla(60, 100%, 70%, .7)' : 'hsla(210, 100%, 50%, .7)'
          if (
            index === inventory[selectSlot].grip && !(inventory[selectSlot].reloadState === 'putAway' || inventory[selectSlot].reloadState === 'takeOut')
          ) c.x = canvas.offsetWidth - SIZE * .75
          else c.x = canvas.offsetWidth - SIZE * (1.75 + index)
          if (index === inventory[selectSlot].grip) {
            c.y = yOffset - ratio * inventory[selectSlot].magazineSize * cartridgeSize * yHeight
          } else c.y = yOffset - inventory[selectSlot].magazineSize * cartridgeSize * yHeight
          context.fillRect(c.x, c.y, -SIZE / 4, magazine * cartridgeSize * yHeight) // cartridges
          context.fillRect( // magazine stop
            c.x + SIZE / 16,
            c.y + inventory[selectSlot].magazineSize * cartridgeSize * yHeight,
            -SIZE * 3 / 8, SIZE / 16
          )
          if (
            index === inventory[selectSlot].grip &&
            (inventory[selectSlot].reloadState === 'putAway' || inventory[selectSlot].reloadState === 'takeOut') ||
            index !== inventory[selectSlot].grip
          ) {
            context.fillRect( // left width bar
              c.x - SIZE / 4,
              c.y, -SIZE / 16,
              inventory[selectSlot].magazineSize * cartridgeSize * yHeight
            )
          }
          if ((
            index === setOtherMagazine() || inventory[selectSlot].magazines.length === 1) &&
            (loading.time !== 0 || magazine.magazines !== inventory[selectSlot].magazineSize)
          ) {
            context.fillRect( // loading gauge
              c.x,
              c.y + inventory[selectSlot].magazineSize * cartridgeSize * yHeight,
              SIZE / 16,
              (-loading.time / (loading.done * inventory[selectSlot].loadingSpeed))
              * inventory[selectSlot].magazineSize * cartridgeSize * yHeight
            )
          } else {
            context.fillRect( // filled
              c.x,
              c.y,
              SIZE / 16,
              inventory[selectSlot].magazineSize * cartridgeSize * yHeight
            )
          }
        }
      })
    }
    // context.fillStyle = (0 < dash.coolTime) ? 'hsla(340, 100%, 50%, .7)' :
    // (0 < afterglow.dashGauge) ? 'hsla(0, 100%, 100%, .7)' :
    // 'hsla(210, 100%, 50%, .7)' // dash guage
    // if (0 < afterglow.dashGauge) afterglow.dashGauge = (afterglow.dashGauge-1)|0
    // c = {x: (canvas.offsetWidth/2) - dash.limit, y: size}
    // context.fillRect(c.x, c.y, (1 - dash.coolTime/dash.limit)*(dash.limit*2*size/32), size/8)
    // context.fillRect(c.x, c.y, dash.limit*2*size/32, -size/32)
    context.save()
    if (spot.dungeon !== SpotField.dungeonList[3]) {
      context.fillStyle =  // round number
        0 < wave.roundInterval ? `hsla(0, 100%, 30%, ${(1 - wave.roundInterval / wave.roundIntervalLimit) * .7})` :
        0 < afterglow.round ? `hsla(0, 100%, 30%, ${afterglow.round / wave.roundIntervalLimit * .7})` :
        'hsla(0, 100%, 30%, .7)'
      c = {x: SIZE, y: canvas.offsetHeight - SIZE}
      context.font = `${SIZE * 1.5}px ${font}`
      context.textAlign = 'left'
      context.fillText(wave.number, c.x, c.y)
    }
    context.restore()
  }
  renderWeaponCategory = (box, weapon) => {
    context.save()
    context.fillStyle= weaponRatiryColorList[weaponRarityList.indexOf(weapon.rarity)]
    context.globalAlpha = weapon.level <= wave.number ? 1 : .5
    context.textAlign = 'center'
    context.font = `${SIZE * .75}px ${font}`
    context.fillText(weapon.category, box.absoluteX + SIZE * .75, box.absoluteY + SIZE, SIZE * 1.25)
    if (weapon.category !== '') {
      let totalAmmo = 0
      totalAmmo += weapon.chamber ? 1 : 0
      totalAmmo += weapon.magazines.reduce((p, c) => p + c)
      let ratio = totalAmmo / (weapon.magazineSize * weapon.magazines.length + 1)
      context.fillStyle =
        ratio < .1 ? 'hsl(0, 100%, 60%)' :
        ratio < .3 ? 'hsl(60, 100%, 70%)' : 'hsl(210, 100%, 50%)'
      if (ratio === 0) ratio = 1
      context.fillRect(box.absoluteX + SIZE / 16, box.absoluteY + SIZE * 1.4, SIZE * 1.4 * ratio, SIZE / 16)
    }
    context.restore()
  }
  renderWeaponDetail = (box, i, cursor) => {
    if (inventory[i].category !== '' && this.boxInterface.isInner(box, cursor)) {
      context.font = `${SIZE*.75}px ${font}`
      context.textAlign = 'left'
      context.fillStyle = 'hsla(0, 0%, 0%, .6)'
      context.strokeStyle = 'hsl(0, 0%, 100%)'
      strokeText(inventory[i].name, cursor.offsetX + SIZE, cursor.offsetY + SIZE)
      if (!inventoryFlag) return
      const damage =
        inventory[i].category === weaponCategoryList[5] ?
          `${inventory[i].damage.toFixed(0)} * ${inventory[i].gaugeNumber}` :
        inventory[i].damage.toFixed(0)
      const dictionary = {
        MODE: inventory[i].mode === weaponModeList[2] ? `${inventory[i].roundLimit}-R ${inventory[i].mode}` :
          inventory[i].mode,
        DAMAGE: damage,
        'P. FORCE': inventory[i].penetrationForce.toFixed(2),
        'MAG. SIZE': `${inventory[i].magazineSize} * ${inventory[i].magazines.length}`
      }
      Object.keys(dictionary).forEach((v, i) => {
        strokeText(v, cursor.offsetX + SIZE, cursor.offsetY + SIZE * (2 + i), SIZE * 3)
        strokeText(dictionary[v], cursor.offsetX + SIZE * 5, cursor.offsetY + SIZE * (2 + i), SIZE * 3)
      })
    }
  }
  renderSlot = (cursor) => {
    context.save()
    if (inventoryFlag) {
      context.fillStyle = 'hsla(0, 0%, 50%, .2)'
      context.fillRect(inventoryBox.absoluteX, inventoryBox.absoluteY, inventoryBox.width, inventoryBox.height)
    }
    const box = {
      absoluteX: cursor.offsetX,
      absoluteY: cursor.offsetY
    }
    this.renderWeaponCategory(box, holdSlot)
    inventorySlotBox.forEach((v, i) => {
      if (mainSlotSize - 1 < i && !inventoryFlag) return
      context.fillStyle = 'hsla(210, 100%, 75%, .4)'
      context.fillRect(v.absoluteX, v.absoluteY, v.width, v.height)
      if (i === selectSlot) {
        context.strokeRect(v.absoluteX + 1, v.absoluteY + 1, v.width - 1, v.height - 1)
      }
      this.renderWeaponCategory(v, inventory[i])
      if (settingsObject.isManipulateCode && i < mainSlotSize) {
        context.fillStyle = 'hsla(210, 100%, 75%, .4)'
        context.fillRect(v.absoluteX + SIZE * 1.15, v.absoluteY - SIZE / 3, SIZE * .6, SIZE * .6)
        context.font = `${SIZE*.75}px ${font}`
        context.fillStyle = 'hsla(0, 0%, 100%, .4)'
        context.textAlign = 'center'
        const text =
          i === 0 ? extractCode(action.primary) :
          i === 1 ? extractCode(action.secondary) :
          i === 2 ? extractCode(action.tertiary) : ''
        context.fillText(text, v.absoluteX + SIZE * 1.45, v.absoluteY + SIZE / 4)
      }
    })
    inventorySlotBox.forEach((v, i) => {
      if (mainSlotSize - 1 < i && !inventoryFlag) return
      this.renderWeaponDetail(v, i, cursor)
    })
    context.restore()
  }
  drawSaveCompleted = (intervalDiffTime) => {
    const ratio = afterglow.save / 1000
    context.save()
    context.font = `${SIZE / 2}px ${font}`
    context.textAlign = 'center'
    context.textBaseline = 'bottom'
    context.fillStyle = `hsla(0, 0%, 100%, ${ratio})`
    const box = {
      offsetX: canvas.offsetWidth / 2,
      offsetY: canvas.offsetHeight - (1.5 - ratio) * SIZE,
      absoluteX: 0,
      absoluteY: 0,
      width: 0,
      height: 0,
      text: 'Save complete.'
    }
    const measure = context.measureText(box.text)
    box.absoluteX = box.offsetX - measure.actualBoundingBoxLeft,
    box.absoluteY = box.offsetY - measure.actualBoundingBoxAscent,
    box.width = measure.width
    box.height = measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent
    context.fillText(box.text, box.offsetX, box.offsetY)
    context.restore()
    afterglow.save -= intervalDiffTime
  }
  render (intervalDiffTime, mouseInput, cursor) {
    const WIDTH_RANGE = 16
    const WIDTH_RATIO = 1.5
    const HEIGHT_RANGE = 9
    screenOwnPos = !settingsObject.isMiddleView ? {
      x: canvas.offsetWidth * .5, y: canvas.offsetHeight * .5
    } : settingsObject.isReverseBoundary ? {
      x: cursor.offsetX <= canvas.offsetWidth * WIDTH_RATIO * 2 / WIDTH_RANGE ?
        canvas.offsetWidth * (WIDTH_RANGE / 2 + WIDTH_RATIO * 2) / WIDTH_RANGE - cursor.offsetX :
        canvas.offsetWidth * (WIDTH_RANGE - WIDTH_RATIO * 2) / WIDTH_RANGE <= cursor.offsetX ?
        canvas.offsetWidth * (WIDTH_RANGE + (WIDTH_RANGE - WIDTH_RATIO * 4) / 2) / WIDTH_RANGE - cursor.offsetX :
        canvas.offsetWidth / 2,
      y: cursor.offsetY <= canvas.offsetHeight * WIDTH_RATIO * 2 / HEIGHT_RANGE ?
        canvas.offsetHeight * (HEIGHT_RANGE / 2 + WIDTH_RATIO * 2) / HEIGHT_RANGE - cursor.offsetY :
        canvas.offsetHeight * (HEIGHT_RANGE - WIDTH_RATIO * 2) / HEIGHT_RANGE <= cursor.offsetY ?
        canvas.offsetHeight * (HEIGHT_RANGE + (HEIGHT_RANGE - WIDTH_RATIO * 4) / 2) / HEIGHT_RANGE - cursor.offsetY :
        canvas.offsetHeight / 2
    } : {
      x: cursor.offsetX < canvas.offsetWidth * ((WIDTH_RANGE - HEIGHT_RANGE) / 2 + WIDTH_RATIO) / WIDTH_RANGE ?
        canvas.offsetWidth * (WIDTH_RANGE - (WIDTH_RANGE - HEIGHT_RANGE) / 2 - WIDTH_RATIO) / WIDTH_RANGE :
        canvas.offsetWidth * (
          WIDTH_RANGE - (WIDTH_RANGE - HEIGHT_RANGE) / 2 - WIDTH_RATIO) / WIDTH_RANGE < cursor.offsetX ?
        canvas.offsetWidth * ((WIDTH_RANGE - HEIGHT_RANGE) / 2 + WIDTH_RATIO) / WIDTH_RANGE :
        canvas.offsetWidth - cursor.offsetX,
      y: cursor.offsetY < canvas.offsetHeight * WIDTH_RATIO / HEIGHT_RANGE ?
        canvas.offsetHeight * (HEIGHT_RANGE - WIDTH_RATIO) / HEIGHT_RANGE :
        canvas.offsetHeight * (HEIGHT_RANGE - WIDTH_RATIO) / HEIGHT_RANGE < cursor.offsetY ?
        canvas.offsetHeight * WIDTH_RATIO / HEIGHT_RANGE :
        canvas.offsetHeight - cursor.offsetY
    }

    this.renderMap(mouseInput, cursor)

    // if (portalFlag) this.renderPortal(intervalDiffTime, timeStamp, cursor)
    if (0 < bullets.length) this.drawBullets()
    if (0 < enemyInfo.enemies.length) this.drawEnemies()
    if (0 < dropItems.length) this.drawDropItems()
    this.drawIndicator()

    const arrayRenderer = array => {
      array.forEach(v => {
        v.render()
      })
    }
    array.forEach(v => {
      arrayRenderer(v)
    })

    this.renderSlot(cursor)
    if (0 <= afterglow.save) this.drawSaveCompleted(intervalDiffTime)
    if (0 < afterglow.recoil) afterglow.recoil = (afterglow.recoil-1)|0
    if (0 < afterglow.reload) afterglow.reload = (afterglow.reload-1)|0

    this.ownself.render(intervalDiffTime, cursor)
  }
}
class TitleScene extends Scene {
  // constructor () {
  //   super()
  // }
  update (intervalDiffTime, input, mouseInput, cursor, mouseDownPosition, wheelInput) {
    if (
      mouseInput.getKeyUp(0) &&
      this.boxInterface.isDownAndUpInBox(titleMenuWordArray[0], true, cursor, mouseDownPosition)
    ) {
      this.dispatchEvent('changescene', new MainScene)
    }
  }
  render (intervalDiffTime, mouseInput, cursor) {
    let nowTime = Date.now()
    let ss = ('0' + ~~(nowTime % 6e4 / 1e3)).slice(-2)
    let ms = ('0' + ~~(nowTime % 1e3)).slice(-3)
    context.drawImage(
      IMAGE['images/ROGOv1.2.png'],
      ~~(((canvas.offsetWidth - IMAGE['images/ROGOv1.2.png'].width) / 2)+.5), ~~(SIZE*4+.5))

    titleMenuWordArray.forEach(v => this.renderBox.render(v, mouseInput, cursor))

    context.textAlign = 'right'
    context.fillStyle = 'hsla(30, 100%, 40%, .75)'
    context.fillText(version, canvas.offsetWidth - SIZE, canvas.offsetHeight - SIZE)
    const c = {x: SIZE, y: canvas.offsetHeight - SIZE*.9}
    const drawCharacter = (image, cooldinateX, cooldinateY) => {
      context.save()
      context.scale(2, 2)
      context.drawImage(IMAGE[image], ~~((cooldinateX / 2)+.5), ~~((cooldinateY / 2)+.5))
      context.restore()
    }
    if (ss % 2 === 1 && ~~(ms/100) === 0) c.y = c.y - SIZE/16
    drawCharacter('images/JK32F.png', c.x, c.y)
    if (ss % 2 === 1 && ~~(ms/100) === 0) c.y = c.y + SIZE/16
    if (ss % 2 === 1 && ~~(ms/100) === 5) c.y = c.y - SIZE/16
    drawCharacter('images/JK33F.png', c.x + SIZE * 2, c.y)
    if (ss % 2 === 1 && ~~(ms/100) === 5) c.y = c.y + SIZE/16
    if (ss % 2 === 0 && ~~(ms/100) === 0) c.y = c.y - SIZE/16
    drawCharacter('images/JK34F.png', c.x + SIZE * 4, c.y)
    if (ss % 2 === 0 && ~~(ms/100) === 0) c.y = c.y + SIZE/16
    if (ss % 2 === 0 && ~~(ms/100) === 5) c.y = c.y - SIZE/16
    drawCharacter('images/JK35Fv1.png', c.x + SIZE * 6, c.y)
    const IMG = ms < 500 ? 'images/JK1_NL.png' : 'images/JK1_NR.png'
    drawImage(IMAGE[IMG], SIZE, SIZE)
  }
}
class WindowManager extends EventDispatcher {
  constructor () {
    super()
    this.floatWindowOrder = []
    this.windows = {
      result: new ResultWindow(0, 0, canvas.offsetWidth, canvas.offsetHeight, 0, 0, true),

      warehouse: new Window(0, 0, canvas.offsetWidth, canvas.offsetHeight, 0, 0, true),
      inventory: new Window(SIZE * 15, SIZE * 10, SIZE * 7, SIZE * 5, 180, .5),
      settings: new SettingsWindow(SIZE * 7, SIZE * 12, SIZE * 10, SIZE * 4, 90, .5)
    }
    this.windows.result.addEventListener('deleteMenu', e => {
      this.floatWindowOrder.splice(this.floatWindowOrder.indexOf(e), 1)
    })
    this.debugWindow = new DebugWindow()
  }
  changeScene (scene) {
    scene.addEventListener('changescene', e => this.changeScene(e))
    scene.addEventListener('addMenu', e => {
      if (!this.floatWindowOrder.some(v => v === e)) this.floatWindowOrder.push(e)
    })
    this.scene = scene
  }
  update (intervalDiffTime, input, mouseInput, cursor, mouseDownPosition, wheelInput) {
    if (input.getKeyDown('Escape')) {
      const index = this.floatWindowOrder.findIndex(v => v !== 'main')
      if (index === -1) {
        this.windows.settings.dispatchEvent('active')
        this.floatWindowOrder.push('settings')
      } else {
        this.windows[this.floatWindowOrder[index]].dispatchEvent('active')
        this.floatWindowOrder.splice(index, 1)
      }
    }
    if (this.windows.settings.is === false) {
      if (input.getKeyDown('KeyE')) {
        this.windows.inventory.dispatchEvent('active')
        const index = this.floatWindowOrder.indexOf('inventory')
        if (index === -1) this.floatWindowOrder.push('inventory')
        else this.floatWindowOrder.splice(index, 1)
      }
    }

    // Send key input
    if (this.floatWindowOrder.length !== 0) {
      this.windows[this.floatWindowOrder.slice(-1)[0]].update(mouseInput, cursor, mouseDownPosition)
    }

    if (!this.floatWindowOrder.some(v => v === 'result')) {
      this.scene.update(intervalDiffTime, input, mouseInput, cursor, mouseDownPosition, wheelInput)
    }

    this.debugWindow.update()
  }
  render (intervalDiffTime, mouseInput, cursor) {
    this.scene.render(intervalDiffTime, mouseInput, cursor)
    this.floatWindowOrder.forEach(v => {
      this.windows[v].render(cursor)
    })
    context.textAlign = 'left'
    context.fillStyle = 'hsl(0, 0%, 0%)'
    context.fillText(this.floatWindowOrder, SIZE, SIZE)

    this.debugWindow.render()
  }
}

class Entry {
  constructor () {
    this.timeStamp = Date.now()
    this.currentTime = Date.now()
    this.intervalDiffTime = this.timeStamp - this.currentTime

    this._inputReceiver = new InputReceiver()
    this.cursor = this._inputReceiver.getMouseCursorInput()
    this.mouseDownPosition = this.cursor
    this.wheelInput = this._inputReceiver.getMouseWheelInput()
    this._windowManager = new WindowManager()
  }
  changeScene (scene) {
    this._windowManager.changeScene(scene)
  }
  loop = setInterval (() => {
    this.timeStamp = Date.now()
    this.intervalDiffTime = this.timeStamp - this.currentTime
    this.currentTime = this.timeStamp

    this.cursor = this._inputReceiver.getMouseCursorInput()
    this.mouseInput = this._inputReceiver.getMouseButtonInput()
    if (this.mouseInput.getKeyDown(0)) this.mouseDownPosition = this.cursor
    this.wheelInput = this._inputReceiver.getMouseWheelInput()

    this._windowManager.update(
      this.intervalDiffTime,
      this._inputReceiver.getKeyInput(),
      this.mouseInput,
      this.cursor,
      this.mouseDownPosition,
      this.wheelInput
    )
  }, 0)

  render () {
    context.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

    this._windowManager.render(
      this.intervalDiffTime,
      this.mouseInput,
      this._inputReceiver.getMouseCursorInput()
    )

    requestAnimationFrame(this.render.bind(this))
  }
}

document.addEventListener('DOMContentLoaded', () => { // init
  action = {
    fire: setStorageFirst('fire', 'Space'),
    reload: setStorageFirst('reload', 'KeyR'),
    combatReload: setStorageFirst('combatReload', 'KeyC'),
    slow: setStorageFirst('slow', 'ShiftLeft'),
    shift: setStorageFirst('shift', 'ShiftLeft'),
    modeSelect: setStorageFirst('modeSelect', 'KeyB'),
    dash: setStorageFirst('dash', 'KeyN'),
    back: setStorageFirst('back', 'KeyB'),
    change: setStorageFirst('changescene', 'KeyM'),
    primary: setStorageFirst('primary', 'Digit1'),
    secondary: setStorageFirst('secondary', 'Digit2'),
    tertiary: setStorageFirst('tertiary', 'Digit3'),
    rotateSlot: setStorageFirst('rotateSlot', 'KeyQ'),
    inventory: setStorageFirst('inventory', 'KeyE'),
    pause: setStorageFirst('pause', 'KeyP'),
    debug: setStorageFirst('debug', 'KeyG'),
    settings: setStorageFirst('settings', 'Escape')
  }
  const operationMode = setStorageFirst('operation', 'WASD')
  if (operationMode === 'WASD') {
    action.up = setStorage('up', 'KeyW')
    action.right = setStorage('right', 'KeyD')
    action.down = setStorage('down', 'KeyS')
    action.left = setStorage('left', 'KeyA')
  } else if (operationMode === 'ESDF') {
    action.up = setStorage('up', 'KeyE')
    action.right = setStorage('right', 'KeyF')
    action.down = setStorage('down', 'KeyD')
    action.left = setStorage('left', 'KeyS')
  }
  setTitleMenuWord()

  const reset = () => {
    dropItems = []

    const temporaryPoint = JSON.parse(storage.getItem('point'))
    point = !temporaryPoint || temporaryPoint < 500 ? 500 : temporaryPoint

    // const temporaryPortalFlag = JSON.parse(storage.getItem('portalFlag'))
    // portalFlag = temporaryPortalFlag ? true : false

    bullets = []
    selectSlot = 0
    const temporaryWarehouse = JSON.parse(storage.getItem('warehouseArray'))
    if (temporaryWarehouse) warehouse = temporaryWarehouse
    inventoryFlag = false
    inventory = JSON.parse(storage.getItem('inventoryArray'))
    if (!inventory || inventory.every(v => v.category === '')) {
      inventory = []
      for (let i = 0; i < mainSlotSize + inventorySize; i++) {
        inventory.push({category: ''})
      }
      const initWeapon = () => {
        const maxDamageInitial = 70
        return new Weapon(
          'T1911',
          'HG',
          [weaponModeList[1]],
          weaponModeList[1],
          weaponRarityList[0],
          maxDamageInitial,
          1,
          cartridgeInfo.speed,
          cartridgeInfo.life,
          1,
          magSizeInitial,
          Array(10).fill(magSizeInitial, 0, 5).fill(0, 5, 10),
          loading.weight,
          .2,
          0,
          10,
          .2,
          1,

          4000,
          0,
          0
        )
      }
      inventory[selectSlot] = initWeapon()
    }
    ammo = 24
    loading = {
      time: 0,
      takeOut: 15,
      takeOutFlag: false,
      done: 60,
      weight: 1
    }
    combatReload.flag = false
    combatReload.magFlag = false
    combatReload.weight = (combatReload.auto === 'ON') ? 8 : 4
    afterglow.point = []
    afterglow.round = 0
    const temporaryWaveNumber = JSON.parse(storage.getItem('waveNumber'))
    wave.number = temporaryWaveNumber ? temporaryWaveNumber - 1 : 0
    wave.enemySpawnInterval = 0
    wave.enemySpawnIntervalLimit = 0
    wave.enemyCount = 0
    wave.enemyLimit = 0
    setWave()
    wave.roundInterval = 0
    enemyInfo.defeatCount = 0
  }
  reset()
})

Promise.all(RESOURCE_LIST).then(() => {
  const ENTRY_POINT = new Entry()
  ENTRY_POINT.changeScene(new TitleScene())
  ENTRY_POINT.render()
})