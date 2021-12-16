import {code, keydownTimeStamp} from '../../modules/code.mjs'
import {frameCounter} from '../../modules/frameCounter.mjs'

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
  // lookUp: document.getElementById`lookUp`,
  // lookRight: document.getElementById`lookRight`,
  // lookDown: document.getElementById`lookDown`,
  // lookLeft: document.getElementById`lookLeft`,
  // fire: document.getElementById`fire`,
  // slow: document.getElementById`slow`,
  // back: document.getElementById`back`,
  // dash: document.getElementById`dash`,
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
let debugMode = true
let operationMode = setStorageFirst('operation', 'WASD')
let angleMode = setStorageFirst('angle', 'IJKL')
let state = ''
let locationList = ['bazaar', 'dungeon']
let location = locationList[0]
let dungeonList = ['Zombie', 'Homing', 'Ruins Star', 'Boss', 'Map Test']
let dungeon = dungeonList[0]

let bossArray = []
let enemyBulletArray = []
let array = [enemyBulletArray, bossArray]

const EnemyBullet = class {
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
const HomingBullet = class {
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

const Boss = class {
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
    context.font = `Italic ${size * .5}px ${font}`
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
    context.font = `bold ${size * 4}px ${font}`
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText('WARNING', canvas.offsetWidth * .5, canvas.offsetHeight * .5)
    let offsetY = canvas.offsetHeight * .31
    const length = 24
    const speed = 2
    for (let i = 0; i < length; i++) {
      const offsetX = size * i * 2 - (this.initialTime / 10) % size * 2 * speed
      context.beginPath()
      context.moveTo(offsetX, offsetY)
      context.lineTo(offsetX + size, offsetY)
      context.lineTo(offsetX - size * .5, offsetY + canvas.offsetHeight * .08)
      context.lineTo(offsetX - size * 1.5, offsetY + canvas.offsetHeight * .08)
      context.closePath()
      context.fill()
    }
    offsetY = canvas.offsetHeight * .61
    for (let i = 0; i < length; i++) {
      const offsetX = size * i * 2 + (this.initialTime / 10) % size * 2 * speed - size * 16
      context.beginPath()
      context.moveTo(offsetX, offsetY)
      context.lineTo(offsetX + size, offsetY)
      context.lineTo(offsetX - size * .5, offsetY + canvas.offsetHeight * .08)
      context.lineTo(offsetX - size * 1.5, offsetY + canvas.offsetHeight * .08)
      context.closePath()
      context.fill()
    }

    context.restore()
  }
}

let point = 0
let portalFlag = false
let portalCooldinate = {x: 0, y: 0}
let portalParticleTime = 0
let portalParticle = []

let cost = {
  dashDistance: 1000,
  dashDistanceIndex: 0,
  dashSpeed: 1000,
  dashSpeedIndex: 0,
  dashCooltime: 1000,
  dashCooltimeIndex: 0,
  dashDamage: 50,
  dashDamageIndex: 0,
  clone: 5000,
  cloneIndex: 0
}
const size = 32
const radius = size / 2
const storeSize = size * 4.5

const targetWidth = .7 // Unit: [m], for effective range
const bulletSpeed = size / 8
const minImgRadius = size / 4
const holdTimeLimit = 14 * 60
let explosiveRange = size * 2
const explosiveLimit = 30
let recoilEffect = {
  flame: size / 4,
  dx: 0,
  dy: 0
}
let afterglow = {
  startBoss: 0,
  startBossLimit: 3000,
  endBoss: 0,
  save: 0,
  point: [],
  inventory: 0,
  recoil: 0,
  round: 0,
  dashGauge: 0,
  limitBreakResult: 0,
  limitBreakSuccess: 0,
  limitBreakFailed: 0,
  loading: 0,
  homing: 0,
  slide: 0,
  bulletSpeed: 0,
  bulletLife: 0,
  slow: 0,
  chamberFlag: false,
  reload: 0,
  dashDamage: 0,
  dashDistance: 0,
  dashCooltime: 0,
  dashSpeed: 0,
  ammo: 0,
  clone: 0,
  explosive1: 0,
  explosive2: 0,
  explosive3: 0,
  explosiveRange: 0,
  reset: 0
}
const flashTimeLimit = 5
const ownPosition = {x: 0, y: 0}
const ownState = {dx: 0, dy: 0, radius: 0, theta: 0, moveRecoil: 2, step: 0, stepLimit: 300}
let clonePosition = []
let cloneFlag = false
let clonePower = .8
let reviveFlag = false
let moreAwayCount = 0
let moreAwayLimit
let ownSpeed = {
  current: size / 16,
  min: size / 32,
  max: size / 16,
  dx: (size / 32) * .05,
  constDx: (size / 32) * .05
}
let dash = {
  coolTime: 0,
  coolTimeLimit: 1000,
  damage: 150,
  invincibleTime: 200,
  isAttack: false
}
let cloneDashType1Flag = false
let cloneDashType2Flag = false
let cloneDashType3Flag = false
let cloneSpeed = 0
let cloneReturnFlag = false
let prepareTime = 90
let homingFlag = false
let explosive1Flag = false
let explosive2Flag = false
let explosive3Flag = false
let collectRadius = size * 5
let afterimage = []
let objects, currentDirection
let direction = 0
let angle = 0
let ownStepLimit = 50

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
const Weapon = class {
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
const Bullet = class {
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
  }
  update(intervalDiffTime) {
    this.life -= intervalDiffTime
    this.x += this.radius * Math.cos(this.theta) * intervalDiffTime
    this.y += this.radius * Math.sin(this.theta) * intervalDiffTime
    if (homingFlag) {
      bullets.forEach((bullet, i) => {
        bullet.life = bullet.life - 1
        if (this.baseLife < bullet.life) {
          bullet.x = bullet.x - bullet.dx
          bullet.y = bullet.y - bullet.dy
          return
        }
        if (bullet.life < 0) {
          bullets.splice(i, 1)
          return
        }
        const distance = enemies.map(enemy => {
          if (0 < enemy.life) return Math.sqrt((bullet.x - enemy.x) ** 2 + (bullet.y - enemy.y) ** 2)
        })
        const index = distance.indexOf(Math.min(...distance))
        if (index === -1) return
        const width = bullet.x - enemies[index].x
        const height = bullet.y - enemies[index].y
        const length = Math.sqrt(width ** 2 + height ** 2)
        const minTheta =  -degree * (Math.PI / 180)
        const maxTheta = degree * (Math.PI / 180)
        const bulletDegree = Math.atan2(bullet.dy, bullet.dx) * 180 / Math.PI + 180 + degree
        const wishDegree = Math.atan2(height, width) * 180 / Math.PI + 180 + degree
        if (wishDegree - degree < bulletDegree && bulletDegree < wishDegree + degree) { // inner
          bullet.dx = width / length
          bullet.dy = height / length
        } else if (0) { // clockwork side
          bullet.dx = bullet.dx * Math.cos(minTheta) - bullet.dy * Math.sin(minTheta)
          bullet.dy = bullet.dx * Math.sin(minTheta) + bullet.dy * Math.cos(minTheta)
        } else { // another clockwork side
          bullet.dx = bullet.dx * Math.cos(maxTheta) - bullet.dy * Math.sin(maxTheta)
          bullet.dy = bullet.dx * Math.sin(maxTheta) + bullet.dy * Math.cos(maxTheta)
        }
        bullet.x = bullet.x - bullet.dx * bulletSpeed
        bullet.y = bullet.y - bullet.dy * bulletSpeed
        if (length < radius + this.bulletRadius){
          const damage = this.damage * bullet.life / this.baseLife
          enemies[index].life = enemies[index].life - damage
          bullet.life = 0
          const additionalPoint = (enemies[index].life <= 0) ? 100 : 10
          if (additionalPoint === 100) defeatCount = (defeatCount+1)|0
          point = (point+additionalPoint)|0
          afterglow.point.push({number: additionalPoint, count: 30})
          enemies[index].damage = damage
          enemies[index].timer = damageTimerLimit
        }
      })
    } else {
      bullets.forEach((bullet, i) => {
        // let theta = key[action.combatReload].flag ?  -degree * (Math.PI / 180) :
        // key[action.change].flag ? degree * (Math.PI / 180) : 0
        // const oldDx = bullet.dx
        // const oldDy = bullet.dy
        // bullet.dx = oldDx * Math.cos(theta) - oldDy * Math.sin(theta)
        // bullet.dy = oldDx * Math.sin(theta) + oldDy * Math.cos(theta)
        // bullet.x = bullet.x + bullet.dx * bulletSpeed
        // bullet.y = bullet.y + bullet.dy * bulletSpeed
        if (explosive2Flag) {
          if (bullet.life === 1) {
            const distance = enemies.map(enemy => {
              if (0 < enemy.life) return Math.sqrt((bullet.x - enemy.x) ** 2 + (bullet.y - enemy.y) ** 2)
            })
            distance.forEach((radius, index) => {
              if (radius < explosiveRange) {
                const damage = this.damage * (1 - radius / explosiveRange)
                enemies[index].life = enemies[index].life - damage
                const additionalPoint = (enemies[index].life <= 0) ? 50 : 10
                if (additionalPoint === 50) defeatCount = (defeatCount+1)|0
                point = (point+additionalPoint)|0
                afterglow.point.push({number: additionalPoint, count: 30})
                enemies[index].damage = damage
                enemies[index].timer = damageTimerLimit
                dropItems.push({type: 'explosive', x: bullet.x, y: bullet.y, life: explosiveLimit})
              }
            })
          } else if (bullet.prepareFlag && code[action.fire].isFirst()) bullet.life = 2
          else if (code[action.fire].isFirst()) bullet.prepareFlag = true
          return false
        }
        const hit = enemies.findIndex((enemy, index) => {
          return index !== bullet.detectID && 0 < enemy.life &&
          Math.sqrt((bullet.x - enemy.x) ** 2 + (bullet.y - enemy.y) ** 2) < radius + this.bulletRadius
        })
        if (explosive3Flag) {
          if (bullet.life === 1) {
            const distance = enemies.map(enemy => {
              if (0 < enemy.life) return Math.sqrt((bullet.x - enemy.x) ** 2 + (bullet.y - enemy.y) ** 2)
            })
            distance.forEach((radius, index) => {
              if (radius < explosiveRange) {
                const damage = this.damage * (1 - radius / explosiveRange)
                enemies[index].life = enemies[index].life - damage
                const additionalPoint = (enemies[index].life <= 0) ? 50 : 10
                if (additionalPoint === 50) defeatCount = (defeatCount+1)|0
                point = (point+additionalPoint)|0
                afterglow.point.push({number: additionalPoint, count: 30})
                enemies[index].damage = damage
                enemies[index].timer = damageTimerLimit
                dropItems.push({type: 'explosive', x: bullet.x, y: bullet.y, life: explosiveLimit})
              }
            })
          } else if (bullet.prepareFlag && code[action.fire].isFirst()) {
            bullet.life = 2
            return
          }
          else if (code[action.fire].isFirst()) bullet.prepareFlag = true
          if (hit === -1) return
          bullet.dx = 0
          bullet.dy = 0
          bullet.x = bullet.x - 1/(enemies[hit].x - bullet.x)
          bullet.y = bullet.y - 1/(enemies[hit].y - bullet.y)
          bullet.life = bullet.life + 1
          return false
        } else if (hit === -1) {
          if (!explosive1Flag && !explosive2Flag && !explosive3Flag) bullet.detectFlag = false
          return
        } else {
          if (!bullet.detectFlag && bullet.detectID !== hit) {
            bullet.detectFlag = true
            bullet.detectID = hit
            let damage = this.damage * bullet.life / this.baseLife
            if (explosive1Flag) {
              dropItems.push({type: 'explosive', x: bullet.x, y: bullet.y, life: explosiveLimit})
              bullet.dx = 0, bullet.dy = 0
              if (typeof bullet.explosive1life !== 'number') {
                bullet.explosive1life = bullet.life
                const distance = enemies.map(enemy => {
                  if (0 < enemy.life) return Math.sqrt((bullet.x - enemy.x) ** 2 + (bullet.y - enemy.y) ** 2)
                })
                distance.forEach((radius, index) => {
                  if (radius < explosiveRange) {
                    damage = this.damage * (1 - radius / explosiveRange)
                    enemies[index].life = enemies[index].life - damage
                    const additionalPoint = (enemies[index].life <= 0) ? 50 : 10
                    if (additionalPoint === 50) defeatCount = (defeatCount+1)|0
                    point = (point+additionalPoint)|0
                    afterglow.point.push({number: additionalPoint, count: 30})
                    enemies[index].damage = damage
                    enemies[index].timer = damageTimerLimit
                  }
                })
              }
            } else {
              enemies[hit].life = enemies[hit].life - damage
              bullet.life = bullet.life * this.penetrationForce
              if (inventory[selectSlot].level < wave.number) { // TODO: level infuse to bullet
                const additionalPoint = (enemies[hit].life <= 0) ? 100 : 10
                if (additionalPoint === 100) defeatCount = (defeatCount+1)|0
                point = (point+additionalPoint)|0
                afterglow.point.push({number: additionalPoint, count: 30})
              }
              enemies[hit].damage = damage
              enemies[hit].timer = damageTimerLimit
            }
          }
        }
      })
    }
  }
}
const magSizeInitial = 7
const maxDamageInitial = 70
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

let enemies
const enemyImageAmount = 3
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
let defeatCount
let action
const setOperation = () => {
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
}
const setAngle = () => {
  if (angleMode === 'IJKL') {
    action.lookUp = setStorage('lookUp', 'KeyI')
    action.lookRight = setStorage('lookRight', 'KeyL')
    action.lookDown = setStorage('lookDown', 'KeyK')
    action.lookLeft = setStorage('lookLeft', 'KeyJ')
  }
}
const getKeyName = key => {
  if (key === ' ') return 'SPACE'
  else return key.toUpperCase() // can't work in turco
}

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
  context.font = `${size}px ${font}`
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  const measure = context.measureText(box.text)
  box.absoluteX = box.offsetX - measure.actualBoundingBoxLeft - size / 4,
  box.absoluteY = box.offsetY - measure.actualBoundingBoxAscent - size / 4,
  box.width = measure.width + size / 2
  box.height = measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent + size / 2
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
    // {text: `PRESS [${getKeyName(action.slow)}] TO EDIT KEY LAYOUT`, hue: 210},
    // {text: `[${getKeyName(action.change)}]MAP: ${mapMode}`, hue: 210}
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
    inventorySlotBox.push({absoluteX: size * (.75 + 2 * i), absoluteY: size * .5, width: size * 1.5, height: size * 1.5})
  }
  const columnSize = 5
  for (let i = 0; i < Math.ceil(inventorySize / columnSize); i++) {
    for (let j = 0; j < columnSize; j++) {
      inventorySlotBox.push({
        absoluteX: size * (.75 + 2 * j), absoluteY: size * (2.75 + 2 * i), width: size * 1.5, height: size * 1.5})}
  }
}
let settingsArray = [{
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
    change: setStorageFirst('change', 'KeyM'),
    primary: setStorageFirst('primary', 'Digit1'),
    secondary: setStorageFirst('secondary', 'Digit2'),
    tertiary: setStorageFirst('tertiary', 'Digit3'),
    rotateSlot: setStorageFirst('rotateSlot', 'KeyQ'),
    inventory: setStorageFirst('inventory', 'KeyE'),
    pause: setStorageFirst('pause', 'KeyP'),
    debug: setStorageFirst('debug', 'KeyG'),
    settings: setStorageFirst('settings', 'Escape')
  }
  setOperation()
  setAngle()
  setTitleMenuWord()
})
const directionCalc = arg => {
  let dx = 0, dy = 0
  /*
    6 4 12
    2 0 8
    3 1 9
  */
  if (arg === 1) dy = 1
  else if (arg === 3) {
    dx = -1 / Math.SQRT2
    dy = 1 / Math.SQRT2
  } else if (arg === 2) dx = -1
  else if (arg === 6) {
    dx = -1 / Math.SQRT2
    dy = -1 / Math.SQRT2
  } else if (arg === 4) dy = -1
  else if (arg === 12) {
    dx = 1 / Math.SQRT2
    dy = -1 / Math.SQRT2
  } else if (arg === 8) dx = 1
  else if (arg === 9) {
    dx = 1 / Math.SQRT2
    dy = 1 / Math.SQRT2
  }
  return {dx, dy}
}
const setMoreThanMagazine = () => {
  return inventory[selectSlot].magazines.indexOf(Math.max(...inventory[selectSlot].magazines))
}
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
const magazineForword = () => {
  inventory[selectSlot].magazines.push(inventory[selectSlot].magazines[1])
  inventory[selectSlot].magazines.splice(1, 1)
}
const setTheta = d => {
  /*
    6 4 12
    2 0 8
    3 1 9
  */
  if (d === 1) ownState.theta = -Math.PI / 2
  else if (d === 3) ownState.theta = -Math.PI / 4
  else if (d === 2) ownState.theta = 0
  else if (d === 6) ownState.theta = Math.PI / 4
  else if (d === 4) ownState.theta = Math.PI / 2
  else if (d === 12) ownState.theta = Math.PI * .75
  else if (d === 8) ownState.theta = Math.PI
  else if (d === 9) ownState.theta = -Math.PI * .75
}
const dashProcess = (intervalDiffTime) => {
  const d = direction === 0 ? currentDirection : direction
  setTheta(d)
  ownState.radius = 1
  const multiple = 0.3
  ownState.dx += multiple * ownState.radius * Math.cos(ownState.theta) * intervalDiffTime
  ownState.dy += multiple * ownState.radius * Math.sin(ownState.theta) * intervalDiffTime
  dash.isAttack = false
  dash.coolTime = dash.coolTimeLimit
}
const moving = (intervalDiffTime) => {
  setTheta(direction)
  if (direction === 0) ownState.radius = 0
  else ownState.radius = 1
  const multiple = 0.0008
  ownState.dx += multiple * ownState.radius * Math.cos(ownState.theta) * intervalDiffTime
  ownState.dy += multiple * ownState.radius * Math.sin(ownState.theta) * intervalDiffTime

  ownPosition.x += ownState.dx * intervalDiffTime
  ownPosition.y += ownState.dy * intervalDiffTime
  const brake = .98
  if (Math.abs(ownState.dx) < 1e-5) ownState.dx = 0
  else ownState.dx *= brake
  if (Math.abs(ownState.dy) < 1e-5) ownState.dy = 0
  else ownState.dy *= brake
}
const modeSelect = () => {
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
const cloneProcess = () => {
  if (
    cloneReturnFlag && direction === 0 && !code[action.slow].flag &&
    cloneSpeed <= ownSpeed.max
  ) clonePosition.shift()
  if (60 < clonePosition.length) clonePosition.shift()
}
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
const setOwnImage = arg => {
  return (arg === 1) ? 'images/TP2U.png' :
  (arg === 3) ? 'images/TP2RU.png' :
  (arg === 2) ? 'images/TP2R.png' :
  (arg === 6) ? 'images/TP2RD.png' :
  (arg === 4) ? 'images/TP2D.png' :
  (arg === 12) ? 'images/TP2LD.png' :
  (arg === 8) ? 'images/TP2L.png' :
  (arg === 9) ? 'images/TP2LU.png' : 'images/TP2F.png'
}
const drawClone = () => {
  const delayStep = 15
  const imgClone = ((
    ownStepLimit / 2 + delayStep <= ownState.step || ownState.step < delayStep) &&
    cloneSpeed <= ownSpeed.max
  ) ? 'images/TP2F.png' :
  (0 < angle) ? setOwnImage(angle) : setOwnImage(direction)
  const pos = {
    x: clonePosition.reduce((a, v) => {return a + v.dx}, ownPosition.x),
    y: clonePosition.reduce((a, v) => {return a + v.dy}, ownPosition.y)
  }
  context.save()
  context.globalAlpha = (0 < moreAwayCount) ? .5 + .5 * (1 - moreAwayCount / moreAwayLimit) : .5
  context.drawImage(
    IMAGE[imgClone], ~~(relativeX(pos.x - radius)+.5), ~~(relativeY(pos.y - radius)+.5)
  )
  context.restore()
  if (0 < dash.coolTime && (cloneDashType1Flag || cloneDashType2Flag || cloneDashType3Flag)) { // clone dash
    if (ownSpeed.max < cloneSpeed) afterimage.push({
      x: pos.x, y: pos.y, alpha: .5
    })
    afterimage.forEach((clone, index) => {
      context.save()
      context.globalAlpha = clone.alpha
      context.drawImage(IMAGE[imgClone],
        ~~(relativeX(clone.x - size / 2)+.5),
        ~~(relativeY(clone.y - size / 2)+.5)
      )
      context.restore()
      clone.alpha = clone.alpha - .05
      if (clone.alpha <= 0) afterimage.splice(index, 1)
    })
  }
}
const drawMyself = (intervalDiffTime) => {
  if (ownState.radius === 0) ownState.step = 0
  else ownState.step += intervalDiffTime
  // y = -4 * (x - .5) ** 2 + 1
  const formula = -4 * (ownState.step / ownState.stepLimit - .5) ** 2 + 1
  const isJumpImage = .3 < formula ? true : false
  const jump = .8 < formula ? 1 : 0
  const imgMyself =
    ownState.radius === 0 || !isJumpImage ? 'images/TP2F.png' : setOwnImageFromDiff(ownState.dx, ownState.dy)

  const pos =
    settingsObject.isMiddleView ? {x: screenOwnPos.x, y: screenOwnPos.y - jump} : { // recoil effect
      x: canvas.offsetWidth / 2 + recoilEffect.dx * (afterglow.recoil / recoilEffect.flame),
      y: canvas.offsetHeight / 2 - jump + recoilEffect.dy * (afterglow.recoil / recoilEffect.flame)
    }
  context.fillStyle = 'hsla(0, 0%, 0%, .2)' // shadow
  context.beginPath()
  context.arc(
    pos.x + radius * .05, pos.y + radius * .6, size / 4, 0, Math.PI * 2, false
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
      pos.x, pos.y, size / 2, -Math.PI * .5, -angle - Math.PI * .5, true
    )
    context.fill()
  }
  context.save()
  if (dash.coolTimeLimit - dash.invincibleTime < dash.coolTime) {
    afterimage.push({
      x: ownPosition.x, y: ownPosition.y - jump, alpha: .5
    })
  }
  afterimage.forEach((own, index) => {
    context.save()
    context.globalAlpha = own.alpha
    context.drawImage(IMAGE[imgMyself],
      ~~(relativeX(own.x - size / 2)+.5),
      ~~(relativeY(own.y - size / 2)+.5)
    )
    context.restore()
    own.alpha = own.alpha - .1
    if (own.alpha <= 0) afterimage.splice(index, 1)
  })
  context.globalAlpha = (0 < moreAwayCount) ? moreAwayCount / moreAwayLimit : 1
  context.drawImage(IMAGE[imgMyself], ~~(pos.x - radius+.5), ~~(pos.y - radius+.5))
  context.restore()
}
const drawField = () => {
  context.fillStyle = 'hsl(240, 100%, 60%)'
  const width = size * 7.5
  const pos =
    settingsObject.isMiddleView ? {x: ownPosition.x - screenOwnPos.x, y: ownPosition.y - screenOwnPos.y} :
    0 < afterglow.recoil ? {
      x: ownPosition.x - recoilEffect.dx * (afterglow.recoil/recoilEffect.flame),
      y: ownPosition.y - recoilEffect.dy * (afterglow.recoil/recoilEffect.flame)
    } : {x: ownPosition.x, y: ownPosition.y}
  for (let i = -1, l = Math.ceil(canvas.offsetWidth / width) + 2; i < l; i=(i+1)|0) {
    for (let j = -1, l = Math.ceil(canvas.offsetHeight / width) + 2; j < l; j=(j+1)|0) {
      context.fillStyle = 'hsla(0, 0%, 50%, .5)'
      context.beginPath()
      context.arc(
        i * width - pos.x % width + size / 4, j * width - pos.y % width + size / 4,
        size, 0, Math.PI * 2, false
      )
      context.fill()
      context.fillStyle = 'hsl(300, 30%, 90%)'
      context.beginPath()
      context.arc(
        i * width - pos.x % width, j * width - pos.y % width,
        size, 0, Math.PI * 2, false
      )
      context.fill()
    }
  }
}
const setWeapon = () => {
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

const drawEnemies = () => {
  enemies.forEach(enemy => {
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
        IMAGE[imgEnemy], ~~(relativeX(coordinate.x)+.5), ~~(relativeY(coordinate.y)+.5)
      )
      context.restore()
      if (debugMode) {
        if (0 < enemy.life) {
          context.font = `${size/2}px ${font}`
          context.fillRect(relativeX(enemy.x - radius), relativeY(enemy.y - radius * 1.2),
          enemy.life / wave.enemyHitPoint * size, size / 16)
          // context.fillText(Math.ceil(enemy.life) // numerical drawing
          // , relativeX(enemy.x - radius), relativeY(enemy.y - radius * 1.2))
        }
        // pop damage
        context.font = `${size * 2 / 3 * enemy.timer/damageTimerLimit}px ${font}`
        context.fillStyle = `hsla(0, 0%, 50%, ${enemy.timer/damageTimerLimit})`
        context.fillText(
          Math.ceil(enemy.damage),
          relativeX(enemy.x - radius - (damageTimerLimit - enemy.timer)),
          relativeY(enemy.y - radius * 2 - (damageTimerLimit - enemy.timer))
        )
      }
    }
  })
}
const damageTimerLimit = 30
let degree = 5
const drawBullets = () => {
  bullets.forEach(bullet => {
    if ((explosive1Flag || explosive2Flag || explosive3Flag) && bullet.detectFlag) return
    context.fillStyle = `hsla(0, 0%, 0%, ${bullet.life / bullet.baseLife})`
    context.beginPath()
    context.arc(relativeX(bullet.x), relativeY(bullet.y), bullet.bulletRadius, 0, Math.PI * 2, false)
    context.fill()
  })
}
const dropItemProcess = (intervalDiffTime) => {
  const blankInventorySlot = inventory.findIndex(v => v.category === '')
  dropItems.forEach((item, index) => {
    if (item.type === 'explosive' || item.type === 'droppedWeapon') {
      if (item.life <= 0)  {
        if (item.type === 'explosive') dropItems.splice(index, 1)
        else {
          dropItems[index] = {
            type: 'cartridge',
            x: item.x,
            y: item.y,
            life: 630,
            dissapearTime: 660,
            amount: item.magazines.reduce((prev, current) => {return prev + current})
          }
        }
      }
      item.life = (item.life-1)|0
      if (item.type === 'explosive') return
    }
    const width = ownPosition.x - item.x
    const height = ownPosition.y - item.y
    const distance = Math.sqrt(width ** 2 + height ** 2)
    if (0 <= blankInventorySlot) { // vacuuming
      let multiple = (
        size < distance || (
        item.type === 'droppedWeapon')) &&
        mainSlotSize + inventorySize <= inventory.length ? 0 : 1 / distance
      item.x = item.x + width / distance * multiple * intervalDiffTime
      item.y = item.y + height / distance * multiple * intervalDiffTime
    }
    if (0 < item.unavailableTime) item.unavailableTime = (item.unavailableTime-1)|0
    if (item.type === 'cartridge') {
      const bulletRadius = size / 6
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

const drawScreenEdgeArc = (item) => {
  const testSize = size / 3
  context.save()
  context.fillStyle =
    item.rarity === weaponRarityList[0] ? weaponRatiryColorList[0] :
    item.rarity === weaponRarityList[1] ? weaponRatiryColorList[1] :
    item.rarity === weaponRarityList[2] ? weaponRatiryColorList[2] :
    item.rarity === weaponRarityList[3] ? weaponRatiryColorList[3] : weaponRatiryColorList[4]
  context.beginPath()
  if ( // left & top
    item.x < ownPosition.x - screenOwnPos.x + testSize / 2 &&
    item.y < ownPosition.y - screenOwnPos.y + testSize / 2
  ) context.arc(
    testSize / 2, testSize / 2, testSize / 2, 0 / 2, Math.PI * 2, false
  )
  else if ( // left & bottom
    item.x < ownPosition.x - screenOwnPos.x + testSize / 2 &&
    ownPosition.y + canvas.offsetHeight - screenOwnPos.y - testSize / 2 < item.y
  ) context.arc(
    testSize / 2, canvas.offsetHeight - testSize / 2,
    testSize / 2, 0, Math.PI * 2, false
  )
  else if ( // right & top
    ownPosition.x + canvas.offsetWidth - screenOwnPos.x - testSize / 2 < item.x &&
    item.y < ownPosition.y - screenOwnPos.y + testSize / 2
  ) context.arc(
    canvas.offsetWidth - testSize / 2, testSize / 2,
    testSize / 2, 0, Math.PI * 2, false
  )
  else if ( // right & bottom
    ownPosition.x + canvas.offsetWidth - screenOwnPos.x - testSize / 2 < item.x &&
    ownPosition.y + canvas.offsetHeight - screenOwnPos.y - testSize / 2 < item.y
  ) context.arc(
    canvas.offsetWidth - testSize / 2,
    canvas.offsetHeight - testSize / 2,
    testSize / 2, 0, Math.PI * 2, false
  )
  else if (item.x < ownPosition.x - screenOwnPos.x + testSize / 2) { // out of left
    context.arc(
      testSize / 2, relativeY(item.y), testSize / 2, 0, Math.PI * 2, false
    )
  } else if (ownPosition.x + canvas.offsetWidth - screenOwnPos.x + testSize / 2 < item.x) { // out of right
    context.arc(
      canvas.offsetWidth - testSize / 2, relativeY(item.y),
      testSize / 2, 0, Math.PI * 2, false
    )
  } else if (item.y < ownPosition.y - screenOwnPos.y + testSize / 2) { // out of top
    context.arc(
      relativeX(item.x), testSize / 2,
      testSize / 2, 0, Math.PI * 2, false
    )
  } else if (ownPosition.y + canvas.offsetHeight - screenOwnPos.y + testSize / 2 < item.y) { // out of bottom
    context.arc(
      relativeX(item.x), canvas.offsetHeight - testSize  + testSize / 2,
      testSize / 2, 0, Math.PI * 2, false
    )
  } else {
    context.arc(relativeX(item.x), relativeY(item.y), testSize, 0, Math.PI * 2, false)
  }
  context.fill()
  context.restore()
}
const drawDropItems = () => {
  dropItems.forEach(item => {
    if (item.type === 'weapon') {
      drawScreenEdgeArc(item)
    } else if (item.type === 'magazine') {
      context.fillStyle = 'hsl(120, 100%, 20%)'
      context.fillRect(relativeX(item.x), relativeY(item.y), size / 3, size * 2 / 3)
    } else if (item.type === 'explosive') {
      context.fillStyle = `hsla(0, 0%, 0%, ${.2 * (item.life / explosiveLimit)})`
      context.beginPath()
      context.arc(relativeX(item.x), relativeY(item.y), explosiveRange, 0, Math.PI * 2, false)
      context.fill()
    } else if (item.type === 'droppedWeapon') {
      context.fillStyle = (item.type === 'droppedWeapon') ?
      `hsla(180, 100%, 30%, ${item.life/600})` :
      'hsl(180, 100%, 40%)'
      context.fillRect(relativeX(item.x), relativeY(item.y), size * 2 / 3, size * 2 / 3)
    }
  })
}
const drawText = (fontSize, align, content, coordinate) => {
  context.font = `${fontSize}px ${font}`
  context.textAlign = align
  context.fillText(content, coordinate.x, coordinate.y)
}
const drawIndicator = () => {
  let c = {x: canvas.offsetWidth - size / 2, y: canvas.offsetHeight - size}
  context.save()
  context.font = `${size * .5}px ${font}`
  context.fillStyle = 'hsl(330, 100%, 50%)'
  context.globalAlpha = .7
  if (homingFlag) {
    context.drawImage(IMAGE['images/Homingv1.jpg'], ~~(c.x - size * 2+.5), ~~(c.y - size * 8+.5))
  } else if (explosive1Flag) {
    context.drawImage(IMAGE['images/TP2F.png'], ~~(c.x - size * 2+.5), ~~(c.y - size * 8+.5))
    context.fillText('1', c.x - size * 2, c.y - size * 8)
  } else if (explosive2Flag) {
    context.drawImage(IMAGE['images/TP2F.png'], ~~(c.x - size * 2+.5), ~~(c.y - size * 8+.5))
    context.fillText('2', c.x - size * 2, c.y - size * 8)
  } else if (explosive3Flag) {
    context.drawImage(IMAGE['images/TP2F.png'], ~~(c.x - size * 2+.5), ~~(c.y - size * 8+.5))
    context.fillText('3', c.x - size * 2, c.y - size * 8)
  }
    context.restore()
  context.font = `${size}px ${font}`
  context.fillStyle = 'hsla(120, 100%, 30%, .7)'
  context.textAlign = 'right'
  context.fillText(point, c.x, c.y - size * 5)
  context.fillStyle = 'hsla(60, 100%, 50%, .7)'
  if (0 < afterglow.point.length) {
    context.font = `${size*.75}px ${font}`
    afterglow.point.forEach((x, i) => {
      context.fillText(`+${x.number}`, c.x - size * 2 - (30 - x.count)/2, c.y - size * 6)
      x.count = (x.count-1)|0
      if (x.count <= 0) afterglow.point.splice(i, 1)
    })
    context.font = `${size}px ${font}`
  }
  if (inventory[selectSlot].category !== '') {
    const cartridges = inventory[selectSlot].magazines[inventory[selectSlot].grip]
    context.fillStyle = (cartridges < inventory[selectSlot].magazineSize * .1) ? 'hsla(0, 100%, 60%, .7)' :
    (cartridges < inventory[selectSlot].magazineSize * .3) ? 'hsla(60, 100%, 70%, .7)' : 'hsla(210, 100%, 50%, .7)'
    context.save()
    inventory[selectSlot].modeList.forEach((v, i) => {
      context.fillStyle = 'hsla(210, 100%, 50%, .7)'
      if (inventory[selectSlot].mode === v) {
        context.fillRect(c.x - size * .8, c.y - size * (9.7 - i), size / 6, size * .65)
      }
      const text =
        v === weaponModeList[1] ? '1' : // SEMI AUTO
        v === weaponModeList[2] ? inventory[selectSlot].roundLimit : // BURST
        v === weaponModeList[3] ? 'F' : '' // FULL AUTO
        context.fillText(text, c.x, c.y - size * (9 - i))
    })
    if (settingsObject.isManipulateCode && 1 < inventory[selectSlot].modeList.length) {
      context.fillStyle = 'hsla(210, 100%, 75%, .4)'
      context.fillRect(c.x - size * .55, c.y - size * 10.6, size * .6, size * .6)
      context.font = `${size*.75}px ${font}`
      context.fillStyle = 'hsla(0, 0%, 100%, .4)'
      context.fillText(extractCode(action.modeSelect), c.x , c.y - size * 10)
    }
    context.restore()
    context.save()
    const inChamber = (inventory[selectSlot].chamber) ? 1 : 0
    context.fillText(`${cartridges}+${inChamber}`, c.x, c.y - size * 3)
    // context.fillStyle = ammo === 0 ? 'hsla(0, 100%, 60%, .7)' : 'hsla(210, 100%, 50%, .7)'
    // context.fillText(ammo, c.x, c.y)
    context.restore()
    const cartridgeSize = 1 / (inventory[selectSlot].magazineSize + 1)
    const yOffset = canvas.offsetHeight - size * .75
    const yHeight = size * 3
    c.x = canvas.offsetWidth - size * .75
    c.y = yOffset - inventory[selectSlot].magazineSize * cartridgeSize * yHeight
    if (0 < afterglow.reload) context.fillStyle = 'hsla(0, 100%, 100%, .7)'
    context.fillRect(c.x, c.y, -size / 4, -inChamber * cartridgeSize * yHeight) // chamber
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
        context.fillRect(c.x - size * 5 / 16, c.y, size / 16, -yHeight) // full
      } else if (inventory[selectSlot].slideState === 'pullBack') {
        context.fillRect(
          c.x - size * 5 / 16,
          c.y,
          size / 16,
          -(1 - inventory[selectSlot].slideTime / (inventory[selectSlot].slideStop * inventory[selectSlot].slideSpeed)) * yHeight
        )
      } else if (inventory[selectSlot].slideState === 'release') {
        context.fillRect(
          c.x - size * 5 / 16,
          c.y,
          size / 16,
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
        ) c.x = canvas.offsetWidth - size * .75
        else c.x = canvas.offsetWidth - size * (1.75 + index)
        if (index === inventory[selectSlot].grip) {
          c.y = yOffset - ratio * inventory[selectSlot].magazineSize * cartridgeSize * yHeight
        } else c.y = yOffset - inventory[selectSlot].magazineSize * cartridgeSize * yHeight
        context.fillRect(c.x, c.y, -size / 4, magazine * cartridgeSize * yHeight) // cartridges
        context.fillRect( // magazine stop
          c.x + size / 16,
          c.y + inventory[selectSlot].magazineSize * cartridgeSize * yHeight,
          -size * 3 / 8, size / 16
        )
        if (
          index === inventory[selectSlot].grip &&
          (inventory[selectSlot].reloadState === 'putAway' || inventory[selectSlot].reloadState === 'takeOut') ||
          index !== inventory[selectSlot].grip
        ) {
          context.fillRect( // left width bar
            c.x - size / 4,
            c.y, -size / 16,
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
            size / 16,
            (-loading.time / (loading.done * inventory[selectSlot].loadingSpeed))
            * inventory[selectSlot].magazineSize * cartridgeSize * yHeight
          )
        } else {
          context.fillRect( // filled
            c.x,
            c.y,
            size / 16,
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
  if (dungeon !== dungeonList[3]) {
    context.fillStyle =  // round number
      0 < wave.roundInterval ? `hsla(0, 100%, 30%, ${(1 - wave.roundInterval / wave.roundIntervalLimit) * .7})` :
      0 < afterglow.round ? `hsla(0, 100%, 30%, ${afterglow.round / wave.roundIntervalLimit * .7})` :
      'hsla(0, 100%, 30%, .7)'
    c = {x: size, y: canvas.offsetHeight - size}
    drawText(size * 1.5, 'left', wave.number, c)
  }
  context.restore()
}
const strokeText = (text, x, y, maxWidth) => {
  context.strokeText(text, x, y, maxWidth)
  context.fillText(text, x, y, maxWidth)
}
const inventoryBox = {
  absoluteX: size * .25,
  absoluteY: size * .25,
  width: size * 10.5,
  height: size * 6.25
}
const drawAim = (cursor) => { // Expected effective range
  const radius =
    Math.sqrt((screenOwnPos.x - cursor.offsetX) ** 2 + (screenOwnPos.y - cursor.offsetY) ** 2) / 20
  let aimRadius = (
    targetWidth * radius / inventory[selectSlot].effectiveRange) * (
    1 + inventory[selectSlot].recoilEffect + Math.sqrt(ownState.dx ** 2 + ownState.dy ** 2) * ownState.moveRecoil)
  context.save()
  context.strokeStyle = 'hsl(0, 0%, 100%)'
  context.beginPath()
  context.arc(cursor.offsetX, cursor.offsetY, aimRadius * 20, 0, Math.PI * 2)
  context.stroke()
  context.restore()
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
const setEnemy = () => {
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
  const type = dungeonList[0] ? dungeonList[0] : dungeonList[1]
  const r =  Math.sqrt(canvas.offsetWidth ** 2 + canvas.offsetHeight ** 2) / 2
  const a = 2 * Math.PI * Math.random()
  const x = ownPosition.x + r * Math.cos(a)
  const y = ownPosition.y + r * Math.sin(a)
  const theta = a - Math.PI
  enemies.push({
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
    imageID: ~~(Math.random() * enemyImageAmount)
  })
  if (wave.enemyCount === wave.enemyLimit) enemies[enemies.length-1].imageID = enemyImageAmount
}
const saveProcess = (isInventory = true, isPoint = true, isPortal = true, isWave = true, isWarehouse = true) => {
  if (isInventory) storage.setItem('inventoryArray', JSON.stringify(inventory))
  if (isPoint) storage.setItem('point', JSON.stringify(point))
  if (isPortal) storage.setItem('portalFlag', JSON.stringify(portalFlag))
  if (isWave) storage.setItem('waveNumber', JSON.stringify(wave.number))
  if (isWarehouse) storage.setItem('warehouseArray', JSON.stringify(warehouse))
  afterglow.save = 1000
}
const setMap = () => {
  const offset = {x: canvas.offsetWidth / 2, y: canvas.offsetHeight / 2}
  const l = size/9.2
  objects.push({x: offset.x - l*(251-0), y: offset.y - l*(435-10), width: l*9, height: l*7})
  objects.push({x: offset.x - l*(251-9), y: offset.y - l*(435-10), width: l*36, height: l*2})
  objects.push({x: offset.x - l*(251-45), y: offset.y - l*(435-10), width: l*42, height: l*7})
  objects.push({x: offset.x - l*(251-85), y: offset.y - l*(435-15), width: l*17, height: l*16})
  objects.push({x: offset.x - l*(251-74), y: offset.y - l*(435-65), width: l*13, height: l*27})
  objects.push({x: offset.x - l*(251-40), y: offset.y - l*(435-40), width: l*27, height: l*12})
  objects.push({x: offset.x - l*(251-80), y: offset.y - l*(435-30), width: l*5, height: l*1})
  objects.push({x: offset.x - l*(251-80), y: offset.y - l*(435-41), width: l*5, height: l*11})
  objects.push({x: offset.x - l*(251-85), y: offset.y - l*(435-41), width: l*2, height: l*24})
  objects.push({x: offset.x - l*(251-100), y: offset.y - l*(435-31), width: l*2, height: l*21})
  objects.push({x: offset.x - l*(251-118), y: offset.y - l*(435-31), width: l*1, height: l*21})
  objects.push({x: offset.x - l*(251-102), y: offset.y - l*(435-15), width: l*33, height: l*2})
  objects.push({x: offset.x - l*(251-0), y: offset.y - l*(435-17), width: l*2, height: l*200})
  objects.push({x: offset.x - l*(251-2), y: offset.y - l*(435-215), width: l*28, height: l*2})
  objects.push({x: offset.x - l*(251-30), y: offset.y - l*(435-215), width: l*2, height: l*60})
  objects.push({x: offset.x - l*(251-32), y: offset.y - l*(435-225), width: l*40, height: l*2})
  objects.push({x: offset.x - l*(251-0), y: offset.y - l*(435-275), width: l*52, height: l*2})
  objects.push({x: offset.x - l*(251-0), y: offset.y - l*(435-277), width: l*2, height: l*53})
  objects.push({x: offset.x - l*(251-0), y: offset.y - l*(435-330), width: l*20, height: l*2})
  objects.push({x: offset.x - l*(251-20), y: offset.y - l*(435-320), width: l*2, height: l*12})
  objects.push({x: offset.x - l*(251-22), y: offset.y - l*(435-320), width: l*28, height: l*2})
  objects.push({x: offset.x - l*(251-50), y: offset.y - l*(435-316), width: l*2, height: l*71})
  objects.push({x: offset.x - l*(251-52), y: offset.y - l*(435-385), width: l*38, height: l*2})
  objects.push({x: offset.x - l*(251-90), y: offset.y - l*(435-385), width: l*7, height: l*12})
  objects.push({x: offset.x - l*(251-85), y: offset.y - l*(435-390), width: l*5, height: l*2})
  objects.push({x: offset.x - l*(251-85), y: offset.y - l*(435-392), width: l*2, height: l*15})
  objects.push({x: offset.x - l*(251-87), y: offset.y - l*(435-405), width: l*33, height: l*2})
  objects.push({x: offset.x - l*(251-120), y: offset.y - l*(435-390), width: l*2, height: l*17})
  objects.push({x: offset.x - l*(251-115), y: offset.y - l*(435-385), width: l*2, height: l*7})
  objects.push({x: offset.x - l*(251-117), y: offset.y - l*(435-390), width: l*3, height: l*2})
  objects.push({x: offset.x - l*(251-117), y: offset.y - l*(435-385), width: l*48, height: l*2})
  objects.push({x: offset.x - l*(251-165), y: offset.y - l*(435-359), width: l*2, height: l*28})
  objects.push({x: offset.x - l*(251-167), y: offset.y - l*(435-365), width: l*13, height: l*2})
  // stage
  objects.push({x: offset.x - l*(251-135), y: offset.y - l*(435-37), width: l*2, height: l*41})
  objects.push({x: offset.x - l*(251-80), y: offset.y - l*(435-41), width: l*7, height: l*11})
  objects.push({x: offset.x - l*(251-85), y: offset.y - l*(435-52), width: l*2, height: l*13})
  objects.push({x: offset.x - l*(251-60), y: offset.y - l*(435-65), width: l*2, height: l*6})
  objects.push({x: offset.x - l*(251-87), y: offset.y - l*(435-65), width: l*15, height: l*12})
  objects.push({x: offset.x - l*(251-118), y: offset.y - l*(435-65), width: l*17, height: l*9})
  objects.push({x: offset.x - l*(251-118), y: offset.y - l*(435-74), width: l*1, height: l*3})
  objects.push({x: offset.x - l*(251-87), y: offset.y - l*(435-90), width: l*48, height: l*2})
  objects.push({x: offset.x - l*(251-62), y: offset.y - l*(435-90), width: l*12, height: l*2})
  objects.push({x: offset.x - l*(251-60), y: offset.y - l*(435-86), width: l*2, height: l*116})
  objects.push({x: offset.x - l*(251-62), y: offset.y - l*(435-200), width: l*23, height: l*2})
  objects.push({x: offset.x - l*(251-85), y: offset.y - l*(435-200), width: l*2, height: l*100})
  objects.push({x: offset.x - l*(251-21), y: offset.y - l*(435-300), width: l*99, height: l*2})
  objects.push({x: offset.x - l*(251-50), y: offset.y - l*(435-302), width: l*2, height: l*4})
  objects.push({x: offset.x - l*(251-120), y: offset.y - l*(435-300), width: l*17, height: l*22})
  objects.push({x: offset.x - l*(251-125), y: offset.y - l*(435-322), width: l*12, height: l*10})
  objects.push({x: offset.x - l*(251-135), y: offset.y - l*(435-89), width: l*2, height: l*211})
  objects.push({x: offset.x - l*(251-137), y: offset.y - l*(435-155), width: l*50, height: l*177})
  objects.push({x: offset.x - l*(251-165), y: offset.y - l*(435-332), width: l*2, height: l*6})
  objects.push({x: offset.x - l*(251-137), y: offset.y - l*(435-45), width: l*5, height: l*27})
  objects.push({x: offset.x - l*(251-155), y: offset.y - l*(435-37), width: l*17, height: l*10})
  objects.push({x: offset.x - l*(251-270), y: offset.y - l*(435-2), width: l*22, height: l*10})
  objects.push({x: offset.x - l*(251-317), y: offset.y - l*(435-2), width: l*18, height: l*27})
  objects.push({x: offset.x - l*(251-181), y: offset.y - l*(435-64), width: l*13, height: l*14})
  objects.push({x: offset.x - l*(251-204), y: offset.y - l*(435-41), width: l*39, height: l*24})
  objects.push({x: offset.x - l*(251-260), y: offset.y - l*(435-41), width: l*38, height: l*22})
  objects.push({x: offset.x - l*(251-276), y: offset.y - l*(435-63), width: l*14, height: l*15})
  objects.push({x: offset.x - l*(251-318), y: offset.y - l*(435-71), width: l*19, height: l*19})
  objects.push({x: offset.x - l*(251-137), y: offset.y - l*(435-90), width: l*54, height: l*32})
  objects.push({x: offset.x - l*(251-310), y: offset.y - l*(435-90), width: l*54, height: l*32})
  objects.push({x: offset.x - l*(251-215), y: offset.y - l*(435-125), width: l*2, height: l*11})
  objects.push({x: offset.x - l*(251-217), y: offset.y - l*(435-125), width: l*70, height: l*2})
  objects.push({x: offset.x - l*(251-285), y: offset.y - l*(435-127), width: l*2, height: l*9})
  objects.push({x: offset.x - l*(251-360), y: offset.y - l*(435-60), width: l*7, height: l*62})
  objects.push({x: offset.x - l*(251-187), y: offset.y - l*(435-155), width: l*45, height: l*112})
  objects.push({x: offset.x - l*(251-220), y: offset.y - l*(435-280), width: l*22, height: l*52})
  objects.push({x: offset.x - l*(251-187), y: offset.y - l*(435-330), width: l*33, height: l*2})
  objects.push({x: offset.x - l*(251-260), y: offset.y - l*(435-280), width: l*10, height: l*52})
  objects.push({x: offset.x - l*(251-270), y: offset.y - l*(435-155), width: l*95, height: l*137})
  objects.push({x: offset.x - l*(251-270), y: offset.y - l*(435-292), width: l*42, height: l*40})
  objects.push({x: offset.x - l*(251-312), y: offset.y - l*(435-330), width: l*25, height: l*2})
  objects.push({x: offset.x - l*(251-335), y: offset.y - l*(435-332), width: l*2, height: l*7})
  objects.push({x: offset.x - l*(251-115), y: offset.y - l*(435-355), width: l*27, height: l*12})
  objects.push({x: offset.x - l*(251-75), y: offset.y - l*(435-335), width: l*5, height: l*7})
  objects.push({x: offset.x - l*(251-80), y: offset.y - l*(435-320), width: l*7, height: l*47})
  objects.push({x: offset.x - l*(251-87), y: offset.y - l*(435-345), width: l*5, height: l*12})
  objects.push({x: offset.x - l*(251-70), y: offset.y - l*(435-302), width: l*12, height: l*5})
  objects.push({x: offset.x - l*(251-365), y: offset.y - l*(435-122), width: l*2, height: l*180})
  objects.push({x: offset.x - l*(251-210), y: offset.y - l*(435-345), width: l*52, height: l*7})
  // lobby
  objects.push({x: offset.x - l*(251-180), y: offset.y - l*(435-365), width: l*2, height: l*102})
  objects.push({x: offset.x - l*(251-182), y: offset.y - l*(435-465), width: l*153, height: l*2})
  objects.push({x: offset.x - l*(251-320), y: offset.y - l*(435-359), width: l*2, height: l*68})
  objects.push({x: offset.x - l*(251-322), y: offset.y - l*(435-425), width: l*20, height: l*2})
  objects.push({x: offset.x - l*(251-335), y: offset.y - l*(435-427), width: l*7, height: l*40})
  objects.push({x: offset.x - l*(251-310), y: offset.y - l*(435-405), width: l*10, height: l*2})
  objects.push({x: offset.x - l*(251-320), y: offset.y - l*(435-365), width: l*15, height: l*2})
  objects.push({x: offset.x - l*(251-335), y: offset.y - l*(435-359), width: l*2, height: l*48})
  objects.push({x: offset.x - l*(251-337), y: offset.y - l*(435-405), width: l*58, height: l*2})
  objects.push({x: offset.x - l*(251-395), y: offset.y - l*(435-380), width: l*2, height: l*27})
  objects.push({x: offset.x - l*(251-397), y: offset.y - l*(435-380), width: l*18, height: l*2})
  objects.push({x: offset.x - l*(251-415), y: offset.y - l*(435-380), width: l*2, height: l*12})
  objects.push({x: offset.x - l*(251-417), y: offset.y - l*(435-390), width: l*88, height: l*2})
  objects.push({x: offset.x - l*(251-497), y: offset.y - l*(435-381), width: l*8, height: l*9})
  objects.push({x: offset.x - l*(251-505), y: offset.y - l*(435-302), width: l*2, height: l*90})
  objects.push({x: offset.x - l*(251-471), y: offset.y - l*(435-300), width: l*36, height: l*2})
  objects.push({x: offset.x - l*(251-470), y: offset.y - l*(435-260), width: l*2, height: l*7})
  objects.push({x: offset.x - l*(251-472), y: offset.y - l*(435-265), width: l*23, height: l*2})
  objects.push({x: offset.x - l*(251-495), y: offset.y - l*(435-265), width: l*2, height: l*35})
  objects.push({x: offset.x - l*(251-525), y: offset.y - l*(435-150), width: l*2, height: l*112})
  objects.push({x: offset.x - l*(251-472), y: offset.y - l*(435-260), width: l*53, height: l*2})
  objects.push({x: offset.x - l*(251-471), y: offset.y - l*(435-150), width: l*54, height: l*2})
  objects.push({x: offset.x - l*(251-471), y: offset.y - l*(435-140), width: l*9, height: l*2})
  objects.push({x: offset.x - l*(251-475), y: offset.y - l*(435-142), width: l*2, height: l*8})
  objects.push({x: offset.x - l*(251-480), y: offset.y - l*(435-22), width: l*2, height: l*120})
  objects.push({x: offset.x - l*(251-367), y: offset.y - l*(435-20), width: l*115, height: l*2})
  objects.push({x: offset.x - l*(251-335), y: offset.y - l*(435-0), width: l*32, height: l*32})
  objects.push({x: offset.x - l*(251-202), y: offset.y - l*(435-0), width: l*133, height: l*2})
  objects.push({x: offset.x - l*(251-187), y: offset.y - l*(435-0), width: l*15, height: l*12})
  objects.push({x: offset.x - l*(251-135), y: offset.y - l*(435-0), width: l*52, height: l*37})
  objects.push({x: offset.x - l*(251-265), y: offset.y - l*(435-365), width: l*27, height: l*2})
  objects.push({x: offset.x - l*(251-290), y: offset.y - l*(435-367), width: l*2, height: l*25})
  objects.push({x: offset.x - l*(251-250), y: offset.y - l*(435-405), width: l*27, height: l*7})
  objects.push({x: offset.x - l*(251-273), y: offset.y - l*(435-382), width: l*4, height: l*23})
  objects.push({x: offset.x - l*(251-277), y: offset.y - l*(435-379), width: l*13, height: l*4})
  objects.push({x: offset.x - l*(251-210), y: offset.y - l*(435-365), width: l*2, height: l*27})
  objects.push({x: offset.x - l*(251-367), y: offset.y - l*(435-260), width: l*85, height: l*42})
  objects.push({x: offset.x - l*(251-395), y: offset.y - l*(435-302), width: l*22, height: l*60})
  objects.push({x: offset.x - l*(251-440), y: offset.y - l*(435-325), width: l*42, height: l*42})
  objects.push({x: offset.x - l*(251-426), y: offset.y - l*(435-55), width: l*12, height: l*62})
  objects.push({x: offset.x - l*(251-367), y: offset.y - l*(435-140), width: l*80, height: l*12})
  objects.push({x: offset.x - l*(251-447), y: offset.y - l*(435-140), width: l*4, height: l*2})
  objects.push({x: offset.x - l*(251-367), y: offset.y - l*(435-152), width: l*35, height: l*40})
  objects.push({x: offset.x - l*(251-390), y: offset.y - l*(435-192), width: l*17, height: l*10})
  objects.push({x: offset.x - l*(251-421), y: offset.y - l*(435-170), width: l*16, height: l*47})
  objects.push({x: offset.x - l*(251-437), y: offset.y - l*(435-170), width: l*15, height: l*13})
  objects.push({x: offset.x - l*(251-421), y: offset.y - l*(435-217), width: l*3, height: l*27})
  objects.push({x: offset.x - l*(251-424), y: offset.y - l*(435-240), width: l*63, height: l*4})
  objects.push({x: offset.x - l*(251-487), y: offset.y - l*(435-240), width: l*18, height: l*2})
  objects.push({x: offset.x - l*(251-505), y: offset.y - l*(435-211), width: l*2, height: l*29})
  objects.push({x: offset.x - l*(251-385), y: offset.y - l*(435-235), width: l*17, height: l*12})
  objects.push({x: offset.x - l*(251-452), y: offset.y - l*(435-283), width: l*29, height: l*1})
  objects.push({x: offset.x - l*(251-212), y: offset.y - l*(435-365), width: l*10, height: l*2})
  objects.push({x: offset.x - l*(251-320), y: offset.y - l*(435-435), width: l*7, height: l*22})
  objects.push({x: offset.x - l*(251-212), y: offset.y - l*(435-392), width: l*15, height: l*15})
  objects.push({x: offset.x - l*(251-210), y: offset.y - l*(435-460), width: l*17, height: l*5})
  objects.push({x: offset.x - l*(251-245), y: offset.y - l*(435-460), width: l*21, height: l*5})
  objects.push({x: offset.x - l*(251-295), y: offset.y - l*(435-460), width: l*17, height: l*5})
  objects.push({x: offset.x - l*(251-468), y: offset.y - l*(435-190), width: l*21, height: l*29})
}
let isDefeatBoss = false
const warehouseBox = {
  absoluteX: size * .25,
  absoluteY: size * 6.75,
  width: size * 20.5,
  height: size * 15.5
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
    context.font = `${size}px ${font}`
    context.fillStyle = `hsla(${box.hue}, ${saturation}%, 50%, ${alpha})`
    context.fillText(box.text, box.offsetX, box.offsetY)
    context.restore()
  }
}

const Shop = class {
  constructor (dx, dy, w, h, Id, img) {
    this.x = ownPosition.x + dx // TODO: integrate x and absoluteX
    this.y = ownPosition.y + dy
    this.absoluteX = ownPosition.x + dx
    this.absoluteY = ownPosition.y + dy
    this.w = storeSize * w
    this.h = storeSize * h
    this.width = storeSize * w
    this.height = storeSize * h
    this.Id = Id
    this.img = img
    this.boxInterface = new BoxInterface()
    this.renderBox = new RenderBox()
  }
  update (intervalDiffTime, mouseInput, cursor, mouseDownPosition) {}

  drawShop = () => {
    context.drawImage(IMAGE[this.img], ~~(relativeX(this.x)+.5), ~~(relativeY(this.y)+.5))
  }
  render (mouseInput, cursor) {}
}
class StartSpot extends Shop {
  constructor (dx, dy, w, h, Id, img) {
    super(dx, dy, w, h, Id, img)
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
  }
  update(intervalDiffTime, mouseInput, cursor, mouseDownPosition) {
    const offset = {offsetX: ownPosition.x, offsetY: ownPosition.y}
    if (!this.boxInterface.isInner(this, offset)) return
    const bossProcessFirst = () => {
      bossArray.push(new Boss(ownPosition.x, ownPosition.y - canvas.offsetHeight * .4, 128000))
    }
    if (this.boxInterface.isDownAndUpInBox(this.startBox, mouseInput.getKeyUp(0), cursor, mouseDownPosition)) {
      location = locationList[1]
      objects = []
      dropItems = []
      portalFlag = false
      saveProcess()
      wave.number = 0
      if (dungeon !== dungeonList[3]) setWave()
      if (dungeon === dungeonList[4]) {
        const MAIN_TEST = new Main()
        MAIN_TEST.render()
      }
      else bossProcessFirst()
    }
    if (this.boxInterface.isDownAndUpInBox(this.selectBox, mouseInput.getKeyUp(0), cursor, mouseDownPosition)) {
      const n = dungeonList[dungeonList.indexOf(dungeon) + 1]
      dungeon = n === dungeonList[dungeonList.length] ? dungeonList[0] : n
    }
  }
  render(mouseInput, cursor) {
    this.drawShop()
    const offset = {offsetX: ownPosition.x, offsetY: ownPosition.y}
    if (this.boxInterface.isInner(this, offset)) {
      this.renderBox.render(this.startBox, mouseInput, cursor)
      this.renderBox.render(this.selectBox, mouseInput, cursor)
      context.save()
      context.textAlign = 'center'
      context.fillStyle = 'hsl(210, 100%, 70%)'
      context.fillText(dungeon, this.selectBox.offsetX, this.selectBox.offsetY + size * 2)
      context.restore()
    }
  }
}
class ShopSpot extends Shop {
  constructor (dx, dy, w, h, Id, img) {
    super(dx, dy, w, h, Id, img)
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
  update(intervalDiffTime, mouseInput, cursor, mouseDownPosition) {
    const offset = {offsetX: ownPosition.x, offsetY: ownPosition.y}
    if (!this.boxInterface.isInner(this, offset)) return

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
  render(mouseInput, cursor) {
    this.drawShop()
    const offset = {offsetX: ownPosition.x, offsetY: ownPosition.y}
    if (this.boxInterface.isInner(this, offset)) {
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
      context.font = `${size * .75}px ${font}`
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.fillStyle = `hsla(210, 100%, 70%, ${ammoAlpha})`
      this.renderBox.render(this.fillAmmoBox, mouseInput, cursor, ammoAlpha)
      if (cost !== 0) {
        context.fillText(`Cost: ${cost}`, this.fillAmmoBox.offsetX, this.fillAmmoBox.offsetY + size * 1.5)
      }
      this.renderBox.render(this.fillAmmoAllBox, mouseInput, cursor, ammoAlpha)
      const costAll = inventory.reduce((p, c, i) => {return p + this.calcCost(inventory[i])}, 0)
      if (costAll !== 0) {
        context.fillText(
          `Cost: ${costAll}`, this.fillAmmoAllBox.offsetX, this.fillAmmoAllBox.offsetY + size * 1.5)
      }
      this.renderBox.render(this.limitBreakBox, mouseInput, cursor, ammoAlpha)
      if (inventory[selectSlot].category !== '') {
        context.fillText(
          `Cost: ${inventory[selectSlot].limitBreak * inventory[selectSlot].limitBreakIndex}`,
          this.limitBreakBox.offsetX,
          this.limitBreakBox.offsetY + size * 1.5)
      }
      if (0 < afterglow.limitBreakSuccess) {
        const ratio = afterglow.limitBreakSuccess / 2000
        context.font = `${size * (1 + afterglow.limitBreakResult)}px ${font}`
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
class SaveSpot extends Shop {
  constructor (dx, dy, w, h, Id, img) {
    super(dx, dy, w, h, Id, img)
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
      v.width = context.measureText(v.label).width + size * .25
    })
    this.warehouseOffset = {
      x: warehouseBox.absoluteX + size * .25,
      y: warehouseBox.absoluteY + size * .25
    }
    this.manipulateSortLabelIndex = -1
    this.sendSortLabelIndex = -1
    this.swapAbsoluteX = -1
    this.isSortLabel = false

    this.manipulateColumnSizeNumber = -1
    this.temporaryDiffX = -1
  }
  update(intervalDiffTime, mouseInput, cursor, mouseDownPosition) {
    const offset = {offsetX: ownPosition.x, offsetY: ownPosition.y}
    if (this.boxInterface.isInner(this, offset)) {
      isWarehouse = true
      if (this.boxInterface.isDownInBox(this.saveBox, mouseInput.getKeyDown(0), cursor)) saveProcess()
      this.warehouseColumn.filter(v => v.isShow).reduce((pV, cV, cI, array) => {
        const padding = 10

        const box = {
          absoluteX: this.warehouseOffset.x + pV + padding,
          absoluteY: this.warehouseOffset.y,
          width: cV.width - padding * 2,
          height: size / 2
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
            cursor.offsetY < this.warehouseOffset.y - size * .5 ||
            this.warehouseOffset.y + size < cursor.offsetY
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
          height: size * .5
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
            absoluteY: this.warehouseOffset.y + size * (1 + i * .5),
            width: warehouseBox.width - size * .5,
            height: size * .5
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
  render(mouseInput, cursor) {
    this.drawShop()
    const offset = {offsetX: ownPosition.x, offsetY: ownPosition.y}
    if (this.boxInterface.isInner(this, offset)) {
      context.save()
      this.renderBox.render(this.saveBox, mouseInput, cursor)
      context.fillStyle = 'hsla(0, 0%, 50%, .5)'
      context.fillRect(
        warehouseBox.absoluteX, warehouseBox.absoluteY, warehouseBox.width, warehouseBox.height)
      context.font = `${size * .5}px ${font}`
      context.textBaseline = 'top'
      context.fillStyle = 'hsla(0, 0%, 100%, .5)'
      let isChangeCursorImage = false
      this.warehouseColumn.filter(v => v.isShow).reduce((pV, cV, cI, array) => {
        const getRistrictWidthText = (str, w) => {
          for (let i = str.length; 0 <= i; i--) {
            const text = i === str.length ? str : str.slice(0, i) + '...'
            if (context.measureText(text).width + size * .25 <= w) return text
          }
          return ''
        }
        const box = {
          absoluteX: this.warehouseOffset.x + pV + cV.width - 10,
          absoluteY: this.warehouseOffset.y,
          width: 20,
          height: size * .5
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
          height: size * .5
        }
        if (!this.isSortLabel) drawInterectBoxArea(LABEL_BOX)

        if (this.sendSortLabelIndex === cI) {
          if (
            cI < this.manipulateSortLabelIndex || (
            cI === this.manipulateSortLabelIndex &&
            this.warehouseOffset.x + pV - array[cI - 1].width * .5 <= cursor.offsetX &&
            cursor.offsetX <= this.warehouseOffset.x + pV + cV.width * .5)
          ) {
            context.fillRect(this.warehouseOffset.x + pV - 1, this.warehouseOffset.y, 3, size / 2)
          } else { // manipulateSortLabelIndex < cI
            context.fillRect(this.warehouseOffset.x + pV + cV.width - 1, this.warehouseOffset.y, 3, size / 2)
          }
        }
        context.fillRect(this.warehouseOffset.x + pV, this.warehouseOffset.y, 1, size / 2)
        if (cI === array.length - 1) {
          context.fillRect(this.warehouseOffset.x + pV + cV.width , this.warehouseOffset.y, 1, size / 2)
        }

        context.textAlign = 'left'
        const padding = size / 8
        context.fillText(
          getRistrictWidthText(cV.label, cV.width), this.warehouseOffset.x + pV + padding, this.warehouseOffset.y)
        if (this.isSortLabel && this.manipulateSortLabelIndex === cI && this.sendSortLabelIndex !== -1) {
          context.fillText(
            getRistrictWidthText(cV.label, cV.width),
            this.warehouseOffset.x + pV + padding - this.swapAbsoluteX + cursor.offsetX,
            this.warehouseOffset.y - size * .5
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
            getRistrictWidthText(text.toString(), cV.width), offsetY, this.warehouseOffset.y + size * (1 + i * .5))
          context.restore()
        })
        return pV + cV.width
      }, 0)
      context.textAlign = 'left'
      context.font = `${size * .5}px ${font}`
      context.fillText('TODO: Context menu, Filter, Scroll overall', size * .5, canvas.offsetHeight - size)
      context.restore()
    } else canvas.style.cursor = 'default'
  }
}

if (false) { // TODO: Add to class
  const weapon = initWeapon()
  Object.assign(
    weapon, {
      type: 'weapon',
      x: ownPosition.x - size * 3,
      y: ownPosition.y + size * 6,
      unavailableTime: 30
    }
  )
  dropItems.push(weapon)
}

const upgradeExplosive = () => {
  if (holdTimeLimit <= code[action.lookDown].holdtime && inventory[selectSlot].explosive3 <= ammo) {
    homingFlag = false
    explosive1Flag = false
    explosive2Flag = false
    explosive3Flag = !explosive3Flag
    ammo = (ammo - inventory[selectSlot].explosive3)|0
    afterglow.explosive3 = holdTimeLimit
  } else if (0 < afterglow.explosive3) afterglow.explosive3 = (afterglow.explosive3-1)|0
}
const upgradeTest = () => {
  if (holdTimeLimit <= code[action.lookRight].holdtime && cost.clone <= point) {
    cloneFlag = true
    point = (point - cost.clone)|0
    cost.clone = (cost.clone * 2)|0
    afterglow.clone = holdTimeLimit
  } else if (0 < afterglow.clone) afterglow.clone = (afterglow.clone-1)|0
}
const upgradeClone = ()  => {
  if (holdTimeLimit <= code[action.lookUp].holdtime) {
    cloneDashType1Flag = !cloneDashType1Flag
    cloneDashType2Flag = false
    cloneDashType3Flag = false
    afterglow.explosive1 = holdTimeLimit
  } else if (0 < afterglow.explosive1) afterglow.explosive1 = (afterglow.explosive1-1)|0
  if (holdTimeLimit <= code[action.lookRight].holdtime) {
    cloneDashType1Flag = false
    cloneDashType2Flag = !cloneDashType2Flag
    cloneDashType3Flag = false
    afterglow.explosive2 = holdTimeLimit
  } else if (0 < afterglow.explosive2) afterglow.explosive2 = (afterglow.explosive2-1)|0
  if (holdTimeLimit <= code[action.lookDown].holdtime) {
    cloneDashType1Flag = false
    cloneDashType2Flag = false
    cloneDashType3Flag = !cloneDashType3Flag
    afterglow.explosive3 = holdTimeLimit
  } else if (0 < afterglow.explosive3) afterglow.explosive3 = (afterglow.explosive3-1)|0
  if (holdTimeLimit <= code[action.lookLeft].holdtime) {
    cloneReturnFlag = !cloneReturnFlag
    afterglow.explosiveRange = holdTimeLimit
  } else if (
    0 < afterglow.explosiveRange
  ) afterglow.explosiveRange = (afterglow.explosiveRange-1)|0
}
const drawStore = (cursor) => {
  context.font = `${size}px ${font}`
  objects.forEach(object => {
    drawScreenEdge(object, 30)
    context.drawImage(IMAGE[object.img], ~~(relativeX(object.x)+.5), ~~(relativeY(object.y)+.5))
    object.draw(cursor)
  })
}
const drawObjects = (cursor) => {
  if (!mapMode) drawStore(cursor)
  else {
    context.fillStyle = (mapMode) ? 'hsl(0, 0%, 50%)' : 'hsla(30, 100%, 85%)'
    objects.forEach((object) => {
      context.fillRect(relativeX(object.x), relativeY(object.y), object.width, object.height)
    })
  }
}
const relativeX = (arg) => {
  const a = settingsObject.isMiddleView ? screenOwnPos.x - ownPosition.x : canvas.offsetWidth / 2 - ownPosition.x
  return a + recoilEffect.dx * (afterglow.recoil/recoilEffect.flame) + arg
}
const relativeY = (arg) => {
  const a = settingsObject.isMiddleView ? screenOwnPos.y - ownPosition.y : canvas.offsetHeight / 2 - ownPosition.y
  return a + recoilEffect.dy * (afterglow.recoil/recoilEffect.flame) + arg
}

const initWeapon = () => {
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
const reset = () => {
  state = 'title'
  location = locationList[0]
  objects = []
  dropItems = []
  // if (mapMode) setMap()

  const temporaryPoint = JSON.parse(storage.getItem('point'))
  point = !temporaryPoint || temporaryPoint < 500 ? 500 : temporaryPoint

  const temporaryPortalFlag = JSON.parse(storage.getItem('portalFlag'))
  portalFlag = temporaryPortalFlag ? true : false
  if (portalFlag) {
    portalCooldinate.x = ownPosition.x|0
    portalCooldinate.y = (ownPosition.y + size * 3)|0
  }

  ownPosition.x = canvas.offsetWidth / 2
  ownPosition.y = canvas.offsetHeight / 2
  clonePosition = []
  cloneFlag = false
  cloneDashType1Flag = false
  cloneDashType2Flag = false
  cloneDashType3Flag = false
  cloneReturnFlag = false
  reviveFlag = false
  moreAwayCount = 0
  moreAwayLimit = 300
  homingFlag = false
  explosive1Flag = false
  explosive2Flag = false
  explosive3Flag = false
  currentDirection = 4
  bullets = []
  enemies = []
  cost = {
    dashDistance: 1000,
    dashDistanceIndex: 0,
    dashSpeed: 1000,
    dashSpeedIndex: 0,
    dashCooltime: 1000,
    dashCooltimeIndex: 0,
    dashDamage: 50,
    dashDamageIndex: 0,
    clone: 5000,
    cloneIndex: 0,
    collectRadius: 0,
    reset: 0
  }
  ownSpeed = {
    current: size / 16,
    min: size / 32,
    max: size / 16,
    dx: (size / 32) * .05,
    constDx: (size / 32) * .05
  }
  // dash = {
  //   attackFlag: false,
  //   breakthrough: 10,
  //   coolTime: 0,
  //   damage: 150,
  //   decrease: 10,
  //   limit: 150
  // }
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
  defeatCount = 0
}; reset()
let mapMode = false
const swap = (get, set) => {
  let before = Object.keys(action)[Object.values(action).indexOf(order[get])]
  let after = Object.keys(action)[Object.values(action).indexOf(order[set])]
  if(typeof before === 'string') action[before] = setStorage(before, order[set])
  if(typeof after === 'string') action[after] = setStorage(after, order[get])
}
const order = [
  'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p',
  'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';',
  'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'shift', 'space'
]
const keyInput = () => {
  let aft = -2
  let bfr = aft
  return () => {
    bfr = aft
    aft = (
    code.q.isFirst()) ? 0 :
    (code.w.isFirst()) ? 1 :
    (code.e.isFirst()) ? 2 :
    (code.r.isFirst()) ? 3 :
    (code.t.isFirst()) ? 4 :
    (code.y.isFirst()) ? 5 :
    (code.u.isFirst()) ? 6 :
    (code.i.isFirst()) ? 7 :
    (code.o.isFirst()) ? 8 :
    (code.p.isFirst()) ? 9 :
    (code.a.isFirst()) ? 10 :
    (code.s.isFirst()) ? 11 :
    (code.d.isFirst()) ? 12 :
    (code.f.isFirst()) ? 13 :
    (code.g.isFirst()) ? 14 :
    (code.h.isFirst()) ? 15 :
    (code.j.isFirst()) ? 16 :
    (code.k.isFirst()) ? 17 :
    (code.l.isFirst()) ? 18 :
    (code.z.isFirst()) ? 20 :
    (code.x.isFirst()) ? 21 :
    (code.c.isFirst()) ? 22 :
    (code.v.isFirst()) ? 23 :
    (code.b.isFirst()) ? 24 :
    (code.n.isFirst()) ? 25 :
    (code.m.isFirst()) ? 26 :
    (code.Shift.isFirst()) ? 30 :
    (code[' '].isFirst()) ? 31 : -2
    if (aft === -2) aft = bfr
    else if (bfr === aft) aft = -2
    if (
      aft === order.indexOf(action.up) || aft === order.indexOf(action.right) ||
      aft === order.indexOf(action.down) || aft === order.indexOf(action.left)
    ) aft = -2
    if (bfr !== -2 && bfr !== aft) {
      if (aft !== -2) {
        swap(bfr, aft)
        aft = -2
      }
    }
    if (state === 'title') bfr = aft = -2
    return aft
  }
}; const input = keyInput()
const menuColumn = () => {
  const array = [0, 1]
  let num = array[0]
  return () => {
    if (code[action.down].isFirst()) {
      if (num === array.slice(-1)[0]) num = array[0]
      else num = (num+1)|0
    } else if (code[action.up].isFirst()) {
      if (num === array[0]) num = array.slice(-1)[0]
      else num = (num-1)|0
    }
    return num
  }
}; const rotate = menuColumn()
let rowPosition = 0
let keyPosition = -2

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
class Ownself {
  constructor () {
    this.absoluteX = 0
    this.absoluteY = 0
    this.offsetX = canvas.offsetWidth * .5
    this.offsetY = canvas.offsetHeight * .5
    this.speed = .05
  }
  update = (input, elapsedTime) => {
    if (input.getKey('KeyW')) this.offsetY -= this.speed * elapsedTime
    if (input.getKey('KeyS')) this.offsetY += this.speed * elapsedTime
    if (input.getKey('KeyD')) this.offsetX += this.speed * elapsedTime
    if (input.getKey('KeyA')) this.offsetX -= this.speed * elapsedTime
  }
  render = () => {
    context.save()
    context.fillStyle = 'hsl(50, 100%, 90%)'
    context.beginPath()
    context.arc(
      this.offsetX,
      this.offsetY, size * .5, 0, 2 * Math.PI)
    context.fill()
    context.restore()
  }
}
const mapProcess = () => {}
class Main {
  constructor () {
    this.timeStamp = Date.now()
    this.currentTime = Date.now()
    this.elapsedTime = this.timeStamp - this.currentTime
    this._inputReceiver = new InputReceiver()
    this.array = []
    this.array.push(new Ownself)

    this.mapArray = []
    this.mapArray.push(MAP[0])
    this.location = 'map_Test'
    this.SELECTED_MAP = this.setMap()
  }
  start = () => this.render()
  update = setInterval (() => {
    this.timeStamp = Date.now()
    this.elapsedTime = this.timeStamp - this.currentTime
    this.currentTime = this.timeStamp

    const input = this._inputReceiver.getInput()
    this.array.forEach((v, i) => {
      v.update(input, this.elapsedTime)
      if (v.life <= 0) array.splice(i, 1)
    })
  })
  setMap = () => {
    return this.mapArray.filter(v => {
      const OBJECTGROUP_ID = v.layers.findIndex(v => v.type === 'objectgroup')
      const ADDRESS_ID = v.layers[OBJECTGROUP_ID].properties.findIndex(v => v.name === 'address')
      return this.location === v.layers[OBJECTGROUP_ID].properties[ADDRESS_ID].value
    })[0]
  }
  setLocation = str => this.location = str
  renderMap = () => {
    this.SELECTED_MAP.layers.filter(v => v.name.includes('tileset_')).forEach(v => {
      for (let x = 0; x < v.width; x++) {
        for (let y = 0; y < v.height; y++) {
          let id = v.data[v.width * y + x]
          if (0 < id) {
            let flag = false
            this.SELECTED_MAP.tilesets.forEach((vl, i, a) => {
              if (flag) return
              if (id < vl.firstgid) {
                const diff = i === 0 ? 0 : a[i - 1].firstgid
                context.drawImage(
                  TILESET_IMAGE_ARRAY[a[i - 1].source],
                  ((id - diff) % TILESET_DATA_ARRAY[a[i - 1].source].columns) * size,
                  ((id - diff) - (id - diff) % TILESET_DATA_ARRAY[a[i - 1].source].columns) /
                    TILESET_DATA_ARRAY[a[i - 1].source].columns * size,
                  size,
                  size,
                  (x * size)|0,
                  (y * size)|0,
                  size,
                  size
                  )
                flag = true
              }
            }, 0)
          }
        }
      }
    })
  }
  render = () => {
    context.fillStyle = 'hsl(0, 0%, 60%)'
    context.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
    context.fillStyle = 'hsl(0, 0%, 0%)'
    context.textAlign = 'left'

    this.renderMap()

    this.array.forEach(v => v.render())
    requestAnimationFrame(this.render.bind(this))
  }
}

const mainProcess = (intervalDiffTime, cursor) => {
}
const pauseProcess = () => {
  if (code[action.pause].isFirst()) state = 'main'
}
const keyLayoutProcess = () => {
  rowPosition = rotate()
  keyPosition = input()
  if (keyPosition === order.indexOf('w') && holdTimeLimit <= code.w.holdtime &&
    !(Object.values(action).some(x => x === 'w' || x === 'a'))) {
    operationMode = setStorage('operation', 'WASD')
    setOperation()
  }
  if (keyPosition === order.indexOf('e') && holdTimeLimit <= code.e.holdtime &&
    !(Object.values(action).some(x => x === 'e' || x === 'f'))) {
    operationMode = setStorage('operation', 'ESDF')
    setOperation()
  }
  if (rowPosition === 0 && (code[action.left].isFirst() || code[action.right].isFirst())) {
    inventory[selectSlot].reloadAuto = (inventory[selectSlot].reloadAuto === 'ON') ? setStorage('autoReload', 'OFF') :
    setStorage('autoReload', 'ON')
  }
  if (rowPosition === 1 && (code[action.left].isFirst() || code[action.right].isFirst())) {
    combatReload.auto = (combatReload.auto === 'ON') ? setStorage('autoCombatReload', 'OFF') :
    setStorage('autoCombatReload', 'ON')
  }
  if (
    keyPosition === order.indexOf(action.back) && holdTimeLimit <= code[action.back].holdtime
  ) state = 'title'
}
const frameResetProcess = (intervalDiffTime) => {
  if (0 < dash.coolTime) dash.coolTime -= intervalDiffTime

  if (ownState.stepLimit <= ownState.step) ownState.step = 0
}
const drawImage = (img, x, y) => {
  context.drawImage(img, ~~(x+.5), ~~(y+.5))
}
const drawTitleScreen = (cursor) => {
}
const drawScreenEdge = (obj, hue) => {
  context.save()
  context.fillStyle = `hsl(${hue}, 100%, 90%)`
  if (
    obj.x < ownPosition.x - screenOwnPos.x + radius &&
   obj.y < ownPosition.y - screenOwnPos.y + radius // left & top
  ) context.fillRect(0, 0, size, size)
  else if (
    obj.x < ownPosition.x - screenOwnPos.x + radius &&
    ownPosition.y + canvas.offsetHeight - screenOwnPos.y - size + radius < obj.y // left & bottom
  ) context.fillRect(0, canvas.offsetHeight - size, size, size)
  else if (
    ownPosition.x + canvas.offsetWidth - screenOwnPos.x - size + radius < obj.x &&
    obj.y < ownPosition.y - screenOwnPos.y + radius // right & top
  ) context.fillRect(canvas.offsetWidth - size, 0, size, size)
  else if (
    ownPosition.x + canvas.offsetWidth - screenOwnPos.x - size + radius < obj.x &&
    ownPosition.y + canvas.offsetHeight - screenOwnPos.y - size + radius < obj.y // right & bottom
  ) context.fillRect(canvas.offsetWidth - size, canvas.offsetHeight - size, size, size)
  else if (obj.x < ownPosition.x - screenOwnPos.x + radius) { // out of left
    context.fillRect(0, relativeY(obj.y - radius), size, size)
  } else if (ownPosition.x + canvas.offsetWidth - screenOwnPos.x + radius < obj.x) { // out of right
    context.fillRect(canvas.offsetWidth-size, relativeY(obj.y - radius), size, size)
  } else if (obj.y < ownPosition.y - screenOwnPos.y + radius) { // out of top
    context.fillRect(relativeX(obj.x - radius), 0, size, size)
  } else if (ownPosition.y + canvas.offsetHeight - screenOwnPos.y + radius < obj.y) { // out of bottom
    context.fillRect(relativeX(obj.x - radius), canvas.offsetHeight - size, size, size)
  }
  context.restore()
}
const drawSaveCompleted = (intervalDiffTime) => {
  const ratio = afterglow.save / 1000
  context.save()
  context.font = `${size / 2}px ${font}`
  context.textAlign = 'center'
  context.textBaseline = 'bottom'
  context.fillStyle = `hsla(0, 0%, 100%, ${ratio})`
  const box = {
    offsetX: canvas.offsetWidth / 2,
    offsetY: canvas.offsetHeight - (1.5 - ratio) * size,
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

const drawMain = (intervalDiffTime, timeStamp, cursor) => {
}
const drawPause = () => {
  let nowTime = Date.now()
  let ss = ('0' + ~~(nowTime % 6e4 / 1e3)).slice(-2)
  let ms = ('0' + ~~(nowTime % 1e3)).slice(-3)
  context.save()
  context.font = `${size}px ${font}`
  context.fillStyle = (ss % 3 === 2) ? `hsl(60, ${100 * (1 - (ms / 1e3))}%, 40%)` :
  (ss % 3 === 1) ? 'hsl(60, 100%, 40%)' :
  `hsl(60, ${100 * (ms / 1e3)}%, 40%)`
  context.textAlign = 'center'
  context.fillText('PAUSE', canvas.offsetWidth / 2, canvas.offsetHeight / 4 + size)
  context.restore()
}
const drawResult = (cursor) => {
}
const drawKeyLayout = () => {
  // resetScreen()
  const nowTime = Date.now()
  const ss = ('0' + ~~(nowTime % 6e4 / 1e3)).slice(-2)
  const ms = ('0' + ~~(nowTime % 1e3)).slice(-3)
  context.font = `${size * .65}px ${font}`
  context.fillStyle = 'hsl(210, 100%, 40%)'
  let p = {x: canvas.offsetWidth * .56, y: canvas.offsetHeight * .3} // absolute coordinate
  context.textAlign = 'right'
  context.fillText('OPERATION MODE:', p.x, p.y - size * 2)
  context.fillStyle = (ms < 500) ? `hsla(30, 100%, 45%, ${(1 - (ms / 1e3) - .25) * 2})` :
  `hsla(30, 100%, 45%, ${((ms / 1e3) - .25) * 2})`
  context.save()
  if (rowPosition !== 0) context.fillStyle = 'hsl(210, 100%, 40%)'
  context.fillText('AUTO RELOAD:', p.x, p.y)
  context.restore()
  context.save()
  if (rowPosition !== 1) context.fillStyle = 'hsl(210, 100%, 40%)'
  context.fillText('AUTO COMBAT RELOADING:', p.x, p.y + size)
  context.restore()
  p.x = p.x + size * 1.75
  context.textAlign = 'center'
  context.font = `bold ${size * .5}px ${font}`
  context.fillText('＜', p.x - size * 1.4, p.y + size * rowPosition - size/16)
  context.fillText('＞', p.x + size * 1.4, p.y + size * rowPosition - size/16)
  context.fillStyle = 'hsl(210, 100%, 40%)'
  context.font = `${size * .65}px ${font}`
  if (operationMode === 'WASD') {
    context.fillText('W', p.x, p.y - size * 2.4)
    context.fillText('A', p.x - size * .6, p.y - size * 1.6)
    context.fillText('S', p.x, p.y - size * 1.6)
    context.fillText('D', p.x + size * .6, p.y - size * 1.6)
  } else if (operationMode === 'ESDF') {
    context.fillText('E', p.x, p.y - size * 2.4)
    context.fillText('S', p.x - size * .6, p.y - size * 1.6)
    context.fillText('D', p.x, p.y - size * 1.6)
    context.fillText('F', p.x + size * .6, p.y - size * 1.6)
  }
  context.fillText(inventory[selectSlot].reloadAuto, p.x, p.y)
  context.fillText(combatReload.auto, p.x, p.y + size)
  p.x = p.x + size * 2
  context.font = `${size * .65}px ${font}`
  context.textAlign = 'left'
  context.fillStyle = 'hsla(280, 100%, 50%, .5)'
  const text = (action.up === 'w') ? '[HOLD "E"]' : '[HOLD "W"]'
  context.fillText(text, p.x, p.y - size * 2)
  context.font = `${size*2}px ${font}`
  context.textAlign = 'center'
  context.fillStyle = 'hsla(210, 100%, 40%, .3)'
  let flag = false
  for (let i = 0; i < 32; i=(i+1)|0) {
    context.save()
    if ((
      i === order.indexOf('w') || i === order.indexOf('e')) &&
      !Object.values(action).some(x => order[i] === x)
    ) context.fillStyle = 'hsla(280, 100%, 50%, .4)'
    if (
      i === order.indexOf(action.up) || i === order.indexOf(action.right) ||
      i === order.indexOf(action.down) || i === order.indexOf(action.left)
    ) context.fillStyle = 'hsla(100, 100%, 35%, .5)'
    if (i === order.indexOf(action.back)) context.fillStyle = 'hsla(340, 100%, 35%, .5)'
    p = { // absolute coordinate
      x: canvas.offsetWidth/30 * (
        4.5 + ~~('0'+i%10).slice(-1)*2.5 + ~~('0'+i/10).slice(1)*.5
      ),
      y: canvas.offsetHeight/20 *(11 + ~~('0' + i / 10).slice(1) * 2)
    }
    if ((
      action.up === 'e' && code.w.flag && code.w.holdtime < holdTimeLimit) &&
      i === order.indexOf('w') &&
      keyPosition === order.indexOf('w') || keyPosition === order.indexOf('e') &&
      (action.up === 'w' && code.e.flag && code.e.holdtime < holdTimeLimit) &&
      i === order.indexOf('e')
    ) {
      flag = true
      const time = (action.up === 'e') ? code.w.flag : code.e.flag
      context.fillStyle = 'hsla(280, 100%, 45%, .4)'
      context.fillRect(
        p.x - size * .86, p.y + size * .25,
        size * 1.73, -size * 1.69 * time / holdTimeLimit
      )
    }
    if (keyPosition !== -2 && keyPosition !== order.indexOf(action.up) && !flag) {
      if (Object.values(action).some(x => order[keyPosition] === x)) {
        context.fillStyle = ((
          i === order.indexOf(action.up) || i === order.indexOf(action.right) ||
          i === order.indexOf(action.down) || i === order.indexOf(action.left))
        ) ? 'hsla(0, 0%, 35%, .3)' :
        (Object.values(action).some(x => order[i] === x)) ? 'hsla(20, 100%, 50%, .5)' :
        'hsla(20, 100%, 50%, .3)'
      } else {
        context.fillStyle = (
          Object.values(action).some(x => order[i] === x) &&
          !(i === order.indexOf(action.up) || i === order.indexOf(action.right) ||
          i === order.indexOf(action.down) || i === order.indexOf(action.left))
        ) ? 'hsla(20, 100%, 50%, .5)' : 'hsla(0, 0%, 35%, .3)'
      }
    }
    if (i === keyPosition) {
      context.fillStyle = (ss % 2 === 0) ? `hsl(60, 100%, ${45 + 5 * (1 - (ms / 1e3))}%)` :
      `hsl(60, 100%, ${45 + 5 * (ms / 1e3)}%)`
      context.font = (ss % 2 === 0) ? `${size * (2 - .1 * (1 - (ms / 1e3)))}px ${font}` :
      `${size * (2 - .1 * (ms / 1e3))}px ${font}`
    } else if (i === 19 || i === 27 || i === 28 || i === 29) {
      context.fillStyle = 'hsla(210, 100%, 40%, .1)'
    }
    if (i < 30) {
      context.fillText('[', p.x - size * .8, p.y)
      context.fillText(']', p.x + size * .8, p.y)
    } else if (i === 30) {
      p = {x:p.x - canvas.offsetWidth * 3.5 / 30, y: p.y - canvas.offsetHeight * 2 / 20}
      context.fillText('[', p.x - size * 1.3, p.y)
      context.fillText(']', p.x + size * 1.3, p.y)
    } else if (i === 31) {
      p.x = p.x + canvas.offsetWidth * 7 / 30
      context.fillText('[', p.x - size * 3, p.y)
      context.fillText(']', p.x + size * 3, p.y)
    }
    context.font = `${size}px ${font}`
    if (i === order.indexOf('f') || i === order.indexOf('j')) {
      context.fillStyle = 'hsla(210, 100%, 40%, .3)'
      context.fillText('_', p.x, p.y)
    }
    context.restore()
    context.save()
    p.y = p.y - size / 6
    context.font = `bold ${size}px ${font}`
    context.fillStyle = 'hsl(210, 100%, 40%)'
    if (i === order.indexOf(action.up)) context.fillText('↑', p.x, p.y)
    else if (i === order.indexOf(action.right)) context.fillText('→', p.x, p.y)
    else if (i === order.indexOf(action.down)) context.fillText('↓', p.x, p.y)
    else if (i === order.indexOf(action.left)) context.fillText('←', p.x, p.y)
    else if (i === order.indexOf(action.lookUp)) context.fillText('∧', p.x, p.y)
    else if (i === order.indexOf(action.lookRight)) context.fillText('>', p.x, p.y)
    else if (i === order.indexOf(action.lookDown)) context.fillText('\u{2228}', p.x, p.y)
    else if (i === order.indexOf(action.lookLeft)) context.fillText('<', p.x, p.y)
    p.y = p.y - size / 6
    context.font = `bold ${size / 2}px ${font}`
    context.fillStyle = 'hsl(210, 100%, 40%)'
    if (i === order.indexOf(action.fire)) context.fillText('FIRE', p.x, p.y)
    else if (i === order.indexOf(action.slow)) context.fillText('SLOW', p.x, p.y)
    else if (i === order.indexOf(action.dash)) context.fillText('DASH', p.x, p.y)
    else if (i === order.indexOf(action.back)) context.fillText('BACK', p.x, p.y)
    else if (i === order.indexOf(action.inventory)) context.fillText('INV.', p.x, p.y)
    else if (i === order.indexOf(action.pause)) context.fillText('PAUSE', p.x, p.y)
    context.restore()
    context.save()
    p.y = p.y - size / 12
    context.font = `bold ${size / 3}px ${font}`
    context.fillStyle = 'hsl(210, 100%, 40%)'
    if (i === order.indexOf(action.reload)) context.fillText('RELOAD', p.x, p.y)
    else if (i === order.indexOf(action.debug)) context.fillText('DEBUG', p.x, p.y)
    context.fillStyle = 'hsla(210, 100%, 40%, .2)'
    if (i === order.indexOf(action.change)) context.fillText('MAGCHG', p.x, p.y)
    else if (i === order.indexOf(action.combatReload)) {
      context.fillText('COMBAT', p.x, p.y - size / 4)
      context.fillText('RELOAD', p.x, p.y + size / 4)
    }
    context.restore()
  }
  context.fillStyle = 'hsl(210, 100%, 40%)'
  context.font = `${size}px ${font}`
  context.textAlign = 'left'
  context.fillText('KEY LAYOUT EDITOR', size, size * 1.75)
  context.textAlign = 'right'
  context.fillStyle = (
      keyPosition === order.indexOf(action.back) && !code[action.back].flag
    ) ? 'hsla(0, 0%, 35%, .3)' : 'hsla(340, 100%, 35%, .6)'
  context.fillText(
    `[HOLD "${getKeyName(action.back)}"] TO TITLE`,
    canvas.offsetWidth - size, canvas.offsetHeight - size
  )
  if (keyPosition === order.indexOf(action.back)) {
    context.fillRect(
      canvas.offsetWidth - size * 11.5, canvas.offsetHeight - size,
      size * 10.6 * code[action.back].holdtime / holdTimeLimit, size * .2
    )
  }
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
const MAP_PATH_ARRAY = ['resources/map_test.json']
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
context.font = `${size / 2}px ${font}`
context.textAlign = 'center'
context.textBaseline = 'middle'
context.fillText('Now Loading...', canvas.offsetWidth / 2, canvas.offsetHeight / 2)
context.restore()

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
class Window extends EventDispatcher {
  constructor (x, y, w, h, color, alpha, is = false) {
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

let resultFlag = false
const resultProcess = () => {
}
class SettingsWindow extends Window {
  constructor () {
    super()
  }
  update (mouseInput, cursor, mouseDownPosition) {
    settingsArray.forEach((v, i) => {
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
    settingsArray.forEach((v, i) => {
      v.offsetX = canvas.offsetWidth / 2
      v.offsetY = frameOffset.y + size * 3 + i * size * 2
      const toggleText = settingsObject[v.toggle] ? 'On' : 'Off'
      v.text = `${v.explain}: ${toggleText}`
      setAbsoluteBox(v)
      context.font = this.boxInterface.isInner(v, cursor) ? `bold ${size}px ${font}` : `${size}px ${font}`
      context.fillStyle = this.boxInterface.isInner(v, cursor) ? 'hsl(0, 0%, 90%)' : 'hsl(0, 0%, 80%)'
      context.strokeStyle = this.boxInterface.isInner(v, cursor) ? 'hsl(0, 0%, 20%)' : 'hsl(0, 0%, 0%)'
      context.textAlign = 'center'
      strokeText(v.text, canvas.offsetWidth / 2, frameOffset.y + size * 3 + i * size * 2)
    })
    context.restore()
  }
}

class ResultWindow extends Window {
  constructor () {
    super()
  }
  update (mouseInput, cursor, mouseDownPosition) {
    if (!resultFlag) {
      point = (point / 100)|0
      point *= 10
      saveProcess(true, true, false, false)
      afterglow.save = 1000
      resultFlag = true
    }
    if (this.boxInterface.isDownAndUpInBox(resultBackBox, mouseInput.getKeyUp(0), cursor, mouseDownPosition)) {
      this.dispatchEvent('deleteMenu', 'result')
      this.dispatchEvent('change', new LobbyScene())

      state = 'main'
      location = locationList[0]
      dropItems = []
      bullets = []
      enemies = []
      objects = []
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
      defeatCount = 0
    }
  }
  render (cursor) {
    context.font = `${size}px ${font}`
    context.fillStyle = 'hsl(0, 100%, 40%)'
    context.textAlign = 'center'
    context.fillText('YOU WERE DRUNK', canvas.offsetWidth / 2, canvas.offsetHeight / 4 + size)
    context.font = `${size * 2 / 3}px ${font}`
    context.fillStyle = 'hsl(30, 100%, 40%)'
    context.fillText(
      `YOU SATISFIED ${defeatCount} GIRLS`, canvas.offsetWidth / 2, canvas.offsetHeight / 6
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
class Scene extends EventDispatcher {
  constructor () {
    super()
    this.boxInterface = new BoxInterface()
    this.renderBox = new RenderBox()
  }
  change (scene) {
    this.dispatchEvent('change', scene)
  }
  update (intervalDiffTime, mouseInput, cursor, mouseDownPosition, wheelInput) {}
  render (intervalDiffTime, mouseInput, cursor) {}
}
class LobbyScene extends Scene {
  constructor () {
    super()
    this.shopArray = []
    this.shopArray.push(new SaveSpot(-size * 7, size, 1, 1, 0, 'images/st2v1.png'))
    this.shopArray.push(new ShopSpot(size * 4, size, 1, 1, 1, 'images/st1v2.png'))
    this.shopArray.push(new StartSpot(-size * 3, -size * 10, 1.25, 1.25, 2, 'images/stv1.png'))
  }

  reloadProcess = (mouseInput) => {
    inventory[selectSlot].reloadTime = (inventory[selectSlot].reloadTime+1)|0
    if (inventory[selectSlot].reloadState === 'release' && inventory[selectSlot].reloadRelease * inventory[selectSlot].reloadSpeed <= inventory[selectSlot].reloadTime) {
      inventory[selectSlot].reloadState = 'putAway'
    } else if (inventory[selectSlot].reloadState === 'putAway' && inventory[selectSlot].reloadPutAway * inventory[selectSlot].reloadSpeed <= inventory[selectSlot].reloadTime) {
      inventory[selectSlot].reloadState = 'takeOut'
      inventory[selectSlot].grip = setMoreThanMagazine()
    } else if (inventory[selectSlot].reloadState === 'takeOut' && inventory[selectSlot].reloadTakeOut * inventory[selectSlot].reloadSpeed <= inventory[selectSlot].reloadTime) {
        inventory[selectSlot].reloadState = 'unrelease'
    } else if (inventory[selectSlot].reloadState === 'unrelease' && inventory[selectSlot].reloadUnrelease * inventory[selectSlot].reloadSpeed <= inventory[selectSlot].reloadTime) {
        inventory[selectSlot].reloadState = 'done'
        const unreleaseMagazine = () => {
          if (!afterglow.chamberFlag) afterglow.reload = flashTimeLimit
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
      0 < inventory[selectSlot].magazines[setMoreThanMagazine()] &&
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
        1 + inventory[selectSlot].recoilEffect + Math.sqrt(ownState.dx ** 2 + ownState.dy ** 2) * ownState.moveRecoil)
      const theta =
        Math.atan2(
          cursor.offsetY - canvas.offsetHeight / 2,
          cursor.offsetX - canvas.offsetWidth / 2) + randomError
      const bulletRadius = inventory[selectSlot].category === weaponCategoryList[5] ? size / 8 : size / 6
      bullets.push(new Bullet(
        ownPosition.x,
        ownPosition.y,
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
      mouseInput.getKeyDown(0) && !inventoryFlag && !portalFlag) || (
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
    // loadingProcess()
    if (code[action.change].isFirst()) magazineForword() // TODO: to consider
  }
  interfaceProcess = (intervalDiffTime, mouseInput, cursor, wheelInput) => {
    if (code[action.pause].isFirst()) state = 'pause'
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
    if (code[action.lookUp].flag) angle = (angle+1)|0
    if (code[action.lookRight].flag) angle = (angle+2)|0
    if (code[action.lookDown].flag) angle = (angle+4)|0
    if (code[action.lookLeft].flag) angle = (angle+8)|0
    if (code[action.up].flag) direction = (direction+1)|0
    if (code[action.right].flag) direction = (direction+2)|0
    if (code[action.down].flag) direction = (direction+4)|0
    if (code[action.left].flag) direction = (direction+8)|0
    if (0 < angle) currentDirection = angle
    else if (direction !== 0) currentDirection = direction
    if (inventory[selectSlot].category !== '' && location === locationList[1]) this.weaponProcess(mouseInput, cursor)
    if (inventory[selectSlot].category !== '') modeSelect()
    if (dash.coolTime <= 0 && (code[action.dash].isFirst() || mouseInput.getKeyDown(2))) dashProcess(intervalDiffTime)
    moving(intervalDiffTime)
    if (code[action.debug].isFirst()) debugMode = !debugMode
  }
  differenceAddition = (position, dx, dy, intervalDiffTime) => {
    let flag = {x: false, y: false}
    objects.forEach((object) => { // only rectangle
      const space = .1
      if (mapMode || (object.ID === 3 && typeof position.imageID !== 'number')) {
        if (
          object.y <= position.y && position.y <= object.y + object.height &&
          (object.x <= position.x && position.x <= object.x + object.width + dx ||
          (position.x <= object.x + object.width && object.x + dx <= position.x))
        ) {
          position.x = (0 < dx) ? object.x + object.width + space : object.x - space
          flag.x = true
        }
        if (
          object.x <= position.x && position.x <= object.x + object.width &&
          (object.y <= position.y && position.y <= object.y + object.height + dy ||
          (position.y <= object.y + object.height && object.y + dy <= position.y))
        ) {
          position.y = (0 < dy) ? object.y + object.height + space : object.y - space
          flag.y = true
        }
      }
    })
    if (!flag.x) position.x = position.x - dx * 60 / 1000 * intervalDiffTime
    if (!flag.y) position.y = position.y - dy * 60 / 1000 * intervalDiffTime
  }
  enemyProcess = (intervalDiffTime) => {
    enemies.forEach((enemy, index) => {
      if (0 < enemy.timer) enemy.timer = (enemy.timer-1)|0
      if (enemy.life <= 0) {
        if (enemy.timer <= 0) {
          const c = {x: enemy.x, y: enemy.y}
          if (enemy.imageID === enemyImageAmount) {
            enemies[index] = setWeapon()
            enemies[index].unavailableTime = 30
            enemies[index].x = c.x
            enemies[index].y = c.y
            dropItems.push(enemies.splice(index, 1)[0])
          } else {
            enemies.splice(index, 1)
          }
        } return
      }
      const width = ownPosition.x - enemy.x
      const height = ownPosition.y - enemy.y
      const length = Math.sqrt(width ** 2 + height ** 2)
      if (dungeon === dungeonList[0]) {
        if (0 < moreAwayCount) { // clone process
          this.differenceAddition(enemy, width / length * enemy.speed, height / length * enemy.speed, intervalDiffTime)
        } else { // close to myself
          this.differenceAddition(enemy, -width / length * enemy.speed, -height / length * enemy.speed, intervalDiffTime)
        }
        // if (
        //   Math.sqrt(canvas.offsetWidth ** 2 + canvas.offsetHeight ** 2)*.7 < length &&
        //   !reviveFlag
        // ) { // repop
        //   const r = Math.sqrt(canvas.offsetWidth ** 2 + canvas.offsetHeight ** 2) / 2
        //   const a = ~~(Math.random() * 360 + 1)
        //   enemy.x = ownPosition.x + r * Math.cos(a * (Math.PI / 180))
        //   enemy.y = ownPosition.y + r * Math.sin(a * (Math.PI / 180))
        // }
        if (
          enemies.some((e, i) => index !== i && 0 < e.life &&
          Math.sqrt((e.x - enemy.x) ** 2 + (e.y - enemy.y) ** 2) < size)
        ) {
          this.differenceAddition(
            enemy,
            -width / length * enemy.speed + (size / 2 * (.5 - Math.random())),
            -height / length * enemy.speed + (size / 2 * (.5 - Math.random())),
            intervalDiffTime
          )
        }
      } else if (dungeon === dungeonList[1]) {
        const r = .17 * intervalDiffTime
        const x = enemy.x + r * Math.cos(enemy.theta)
        const y = enemy.y + r * Math.sin(enemy.theta)
        const DELTA_THETA = .001 * intervalDiffTime
        enemy.theta +=
          (x - enemy.x) * (ownPosition.y - enemy.y) - (ownPosition.x - enemy.x) * (y - enemy.y) < 0 ?  // Cross product
          -DELTA_THETA : DELTA_THETA
        enemy.x += r * Math.cos(enemy.theta)
        enemy.y += r * Math.sin(enemy.theta)
      } else if (dungeon === dungeonList[2]) {
        if (enemy.state === 'active') {
          const r = .275 * intervalDiffTime

          const x = enemy.x + r * Math.cos(enemy.theta)
          const y = enemy.y + r * Math.sin(enemy.theta)
          const DELTA_THETA = .0004 * intervalDiffTime
          const CROSS_PRODUCT = (x - enemy.x) * (ownPosition.y - enemy.y) - (ownPosition.x - enemy.x) * (y - enemy.y)
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
          const CROSS_PRODUCT = (x - enemy.x) * (ownPosition.y - enemy.y) - (ownPosition.x - enemy.x) * (y - enemy.y)
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
          ownPosition.x - enemy.x) ** 2 + (ownPosition.y - enemy.y) ** 2
        ) ** .5 < minImgRadius * 2 + size / 8 && 0 < enemy.life
      ) {
        if (dash.coolTimeLimit - dash.coolTime < dash.invincibleTime) {
          if (!dash.isAttack) {
            dash.isAttack = true
            enemy.life = (enemy.life-dash.damage)|0
            enemy.damage = dash.damage
            enemy.timer = damageTimerLimit
            const additionalPoint = (enemy.life <= 0) ? 130 : 10
            if (additionalPoint === 130) defeatCount = (defeatCount+1)|0
            point = (point+additionalPoint)|0
            afterglow.point.push({number: additionalPoint, count: 30})
          }
        } else {
          if (cloneFlag) {
            reviveFlag = true
            moreAwayCount = moreAwayLimit
          } else if (!reviveFlag) {
            this.dispatchEvent('addMenu', 'result')
            return
          }
        }
      }
      if (
        ownSpeed.max < cloneSpeed && !dash.isAttack &&
        (cloneDashType1Flag || cloneDashType2Flag || cloneDashType3Flag)
      ) {
        const pos = {
          x: clonePosition.reduce((a, v) => {return a + v.dx}, ownPosition.x),
          y: clonePosition.reduce((a, v) => {return a + v.dy}, ownPosition.y)
        }
        if (((
          pos.x - enemy.x) ** 2 + (pos.y - enemy.y) ** 2) ** .5 < minImgRadius * 2 + size / 8 &&
          0 < enemy.life
        ) {
          dash.isAttack = true
          enemy.life = (enemy.life-dash.damage)|0
          enemy.damage = dash.damage
          enemy.timer = damageTimerLimit
          const additionalPoint = (enemy.life <= 0) ? 130 : 10
          point = (point+additionalPoint)|0
          afterglow.point.push({number: additionalPoint, count: 30})
        }
      }
    })
  }
  portalProcess = (intervalDiffTime, mouseInput, cursor, mouseDownPosition) => {
    if (!portalFlag) {
      portalFlag = true
      portalCooldinate.x = ownPosition.x|0
      portalCooldinate.y = (ownPosition.y - size * 3)|0
    }
    if (
      portalCooldinate.x - size <= ownPosition.x && ownPosition.x <= portalCooldinate.x + size &&
      portalCooldinate.y - size <= ownPosition.y && ownPosition.y <= portalCooldinate.y + size
    ) {
      // Return to Base
      if (this.boxInterface.isDownAndUpInBox(portalConfirmBox[0], mouseInput.getKeyUp(0), cursor, mouseDownPosition)) {
        portalCooldinate.y += size * 3
        location = locationList[0]
        objects = []
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
        objects = []
        dropItems = []
        saveProcess()
        setWave()
      }
    }
  }
  slideProcess = () => {
    if (
      inventory[selectSlot].magazines[inventory[selectSlot].grip] <= 0 &&
      inventory[selectSlot].slideState === 'release') return
    if (inventory[selectSlot].reloadState !== 'done') return
    if ((
      explosive1Flag || explosive2Flag || explosive3Flag) &&
      bullets.length !== 0 && inventory[selectSlot].slideState === 'release'
    ) return
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
          afterglow.reload = flashTimeLimit
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
  waveProcess = (intervalDiffTime, mouseInput, cursor, mouseDownPosition) => {
    if (wave.enemyCount < wave.enemyLimit) {
      if (wave.enemySpawnInterval < wave.enemySpawnIntervalLimit) {
        wave.enemySpawnInterval += intervalDiffTime
      } else if (enemies.length <= 24) { // && wave.enemySpawnIntervalLimit <= wave.enemySpawnInterval
        wave.enemySpawnInterval = 0
        wave.enemyCount += 1
        setEnemy()
      }
    } else if (enemies.length === 0) { // && wave.enemyLimit <= wave.enemyCount
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
        ownPosition.x - v.x) ** 2 + (ownPosition.y - v.y) ** 2) ** .5 < v.radius + size * .2 &&
        dash.coolTime < dash.coolTimeLimit - dash.invincibleTime
      ) this.dispatchEvent('addMenu', 'result')
    })

    if (inventory[selectSlot].category !== '' && !inventory[selectSlot].chamber) this.slideProcess()
    if (dungeon !== dungeonList[3]) this.waveProcess(intervalDiffTime, mouseInput, cursor, mouseDownPosition)
    if (0 < enemies.length) this.enemyProcess(intervalDiffTime)
    bullets.forEach((bullet, i) => {
      bullet.update()
      if (bullet.life < 0) bullets.splice(i, 1)
    })
    if (cloneFlag) cloneProcess()
    if (0 < moreAwayCount) moreAwayCount = (moreAwayCount-1)|0
    else if (reviveFlag) {
      cloneFlag = false
      clonePosition = []
      reviveFlag = false
    }
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
      const r = size * 3
      const theta = Math.atan2(cursor.offsetY - canvas.offsetHeight / 2, cursor.offsetX - canvas.offsetWidth / 2)
      holdSlot.x = ownPosition.x + r * Math.cos(theta)
      holdSlot.y = ownPosition.y + r * Math.sin(theta)
      dropItems.push(holdSlot)
      holdSlot = {category: ''}
    }

    if (0 < afterglow.inventory) afterglow.inventory = (afterglow.inventory-1)|0
  }
  update (intervalDiffTime, mouseInput, cursor, mouseDownPosition, wheelInput) {
    if (location === locationList[1] && dungeon === dungeonList[4]) {
    } else {
      this.interfaceProcess(intervalDiffTime, mouseInput, cursor, wheelInput)
      if (direction !== 0) direction = 0
      if (angle !== 0) angle = 0
      if (0 < dropItems.length) dropItemProcess(intervalDiffTime)
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

      if (location === locationList[0]) {
        this.shopArray.forEach(v => v.update(intervalDiffTime, mouseInput, cursor, mouseDownPosition))
        if (portalFlag) this.portalProcess()
      } else if (location === locationList[1]) this.combatProcess(intervalDiffTime, mouseInput, cursor, mouseDownPosition)
    }
  }

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
        portalCooldinate.x + (Math.random() - .5) * size, portalCooldinate.y + (Math.random() / 2 - .75) * size,
        1, size / 2, 0, -.15,
        600 + Math.random() * 300, 80 + Math.random() * 20))
    }
    context.fillStyle =
      `hsl(180, 100%, ${85 + ((1 + Math.sin(timeStamp / 600)) / 2) * 15}%)`
    context.beginPath()
    context.ellipse(
      relativeX(portalCooldinate.x), relativeY(portalCooldinate.y), size * .7, size * .3, 0, 0, 2 * Math.PI, false)
    context.fill()
    portalParticle.forEach((v, i) => {
      v.lifeCycle(i)
      context.fillStyle = v.setColor()
      context.fillRect(relativeX(v.x), relativeY(v.y), v.w, v.h)
      v.x += v.dx
      v.y += v.dy
    })

    drawScreenEdge(portalCooldinate, 180)
    if (
      portalCooldinate.x - size <= ownPosition.x && ownPosition.x <= portalCooldinate.x + size &&
      portalCooldinate.y - size <= ownPosition.y && ownPosition.y <= portalCooldinate.y + size
    ) {
      context.save()
      context.textAlign = 'center'
      context.fillStyle = ' hsl(30, 100%, 50%)'
      context.font = `${size}px ${font}`
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
  renderWeaponCategory = (box, weapon) => {
    context.save()
    context.fillStyle= weaponRatiryColorList[weaponRarityList.indexOf(weapon.rarity)]
    context.globalAlpha = weapon.level <= wave.number ? 1 : .5
    context.textAlign = 'center'
    context.font = `${size * .75}px ${font}`
    context.fillText(weapon.category, box.absoluteX + size * .75, box.absoluteY + size, size * 1.25)
    if (weapon.category !== '') {
      let totalAmmo = 0
      totalAmmo += weapon.chamber ? 1 : 0
      totalAmmo += weapon.magazines.reduce((p, c) => p + c)
      let ratio = totalAmmo / (weapon.magazineSize * weapon.magazines.length + 1)
      context.fillStyle =
        ratio < .1 ? 'hsl(0, 100%, 60%)' :
        ratio < .3 ? 'hsl(60, 100%, 70%)' : 'hsl(210, 100%, 50%)'
      if (ratio === 0) ratio = 1
      context.fillRect(box.absoluteX + size / 16, box.absoluteY + size * 1.4, size * 1.4 * ratio, size / 16)
    }
    context.restore()
  }
  renderWeaponDetail = (box, i, cursor) => {
    if (inventory[i].category !== '' && this.boxInterface.isInner(box, cursor)) {
      context.font = `${size*.75}px ${font}`
      context.textAlign = 'left'
      context.fillStyle = 'hsla(0, 0%, 0%, .6)'
      context.strokeStyle = 'hsl(0, 0%, 100%)'
      strokeText(inventory[i].name, cursor.offsetX + size, cursor.offsetY + size)
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
        strokeText(v, cursor.offsetX + size, cursor.offsetY + size * (2 + i), size * 3)
        strokeText(dictionary[v], cursor.offsetX + size * 5, cursor.offsetY + size * (2 + i), size * 3)
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
        context.fillRect(v.absoluteX + size * 1.15, v.absoluteY - size / 3, size * .6, size * .6)
        context.font = `${size*.75}px ${font}`
        context.fillStyle = 'hsla(0, 0%, 100%, .4)'
        context.textAlign = 'center'
        const text =
          i === 0 ? extractCode(action.primary) :
          i === 1 ? extractCode(action.secondary) :
          i === 2 ? extractCode(action.tertiary) : ''
        context.fillText(text, v.absoluteX + size * 1.45, v.absoluteY + size / 4)
      }
    })
    inventorySlotBox.forEach((v, i) => {
      if (mainSlotSize - 1 < i && !inventoryFlag) return
      this.renderWeaponDetail(v, i, cursor)
    })
    context.restore()
  }
  render (intervalDiffTime, mouseInput, cursor) {
    // context.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

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
    drawField()
    if (portalFlag) this.renderPortal(intervalDiffTime, timeStamp, cursor)
    if (0 < objects.length) drawObjects(cursor)
    if (0 < clonePosition.length) drawClone()
    if (0 < bullets.length) drawBullets()
    if (0 < enemies.length) drawEnemies()
    if (0 < dropItems.length) drawDropItems()
    drawIndicator()

    const arrayRenderer = array => {
      array.forEach(v => {
        v.render()
      })
    }
    array.forEach(v => {
      arrayRenderer(v)
    })

    this.shopArray.forEach(v => {
      drawScreenEdge(v, 30)
      v.render(mouseInput, cursor)
    })

    drawMyself(intervalDiffTime)
    this.renderSlot(cursor)
    if (inventory[selectSlot].category !== '' && !inventoryFlag) drawAim(cursor)
    if (0 <= afterglow.save) drawSaveCompleted(intervalDiffTime)
    if (0 < afterglow.recoil) afterglow.recoil = (afterglow.recoil-1)|0
    if (0 < afterglow.reload) afterglow.reload = (afterglow.reload-1)|0
  }
}
class TitleScene extends Scene {
  // constructor () {
  //   super()
  // }
  update (intervalDiffTime, mouseInput, cursor, mouseDownPosition, wheelInput) {
    if (
      mouseInput.getKeyUp(0) &&
      this.boxInterface.isDownAndUpInBox(titleMenuWordArray[0], true, cursor, mouseDownPosition)
    ) {
      this.change(new LobbyScene)
    }
  }
  render (intervalDiffTime, mouseInput, cursor) {
    let nowTime = Date.now()
    let ss = ('0' + ~~(nowTime % 6e4 / 1e3)).slice(-2)
    let ms = ('0' + ~~(nowTime % 1e3)).slice(-3)
    context.drawImage(
      IMAGE['images/ROGOv1.2.png'],
      ~~(((canvas.offsetWidth - IMAGE['images/ROGOv1.2.png'].width) / 2)+.5), ~~(size*4+.5))

    titleMenuWordArray.forEach(v => this.renderBox.render(v, mouseInput, cursor))

    context.textAlign = 'right'
    context.fillStyle = 'hsla(30, 100%, 40%, .75)'
    context.fillText(version, canvas.offsetWidth - size, canvas.offsetHeight - size)
    const c = {x: size, y: canvas.offsetHeight - size*.9}
    const drawCharacter = (image, cooldinateX, cooldinateY) => {
      context.save()
      context.scale(2, 2)
      context.drawImage(IMAGE[image], ~~((cooldinateX / 2)+.5), ~~((cooldinateY / 2)+.5))
      context.restore()
    }
    if (ss % 2 === 1 && ~~(ms/100) === 0) c.y = c.y - size/16
    drawCharacter('images/JK32F.png', c.x, c.y)
    if (ss % 2 === 1 && ~~(ms/100) === 0) c.y = c.y + size/16
    if (ss % 2 === 1 && ~~(ms/100) === 5) c.y = c.y - size/16
    drawCharacter('images/JK33F.png', c.x + size * 2, c.y)
    if (ss % 2 === 1 && ~~(ms/100) === 5) c.y = c.y + size/16
    if (ss % 2 === 0 && ~~(ms/100) === 0) c.y = c.y - size/16
    drawCharacter('images/JK34F.png', c.x + size * 4, c.y)
    if (ss % 2 === 0 && ~~(ms/100) === 0) c.y = c.y + size/16
    if (ss % 2 === 0 && ~~(ms/100) === 5) c.y = c.y - size/16
    drawCharacter('images/JK35Fv1.png', c.x + size * 6, c.y)
    const IMG = ms < 500 ? 'images/JK1_NL.png' : 'images/JK1_NR.png'
    drawImage(IMAGE[IMG], size, size)
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
  }
  change (scene) {
    this.scene = scene
    this.scene.addEventListener('change', e => this.change(e))
    this.scene.addEventListener('addMenu', e => {
      if (!this.floatWindowOrder.some(v => v === e)) this.floatWindowOrder.push(e)}
      )
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
      this.scene.update(intervalDiffTime, mouseInput, cursor, mouseDownPosition, wheelInput)
    }
  }
  render (intervalDiffTime, mouseInput, cursor) {
    this.scene.render(intervalDiffTime, mouseInput, cursor)
    this.floatWindowOrder.forEach(v => {
      this.windows[v].render(cursor)
    })
    context.textAlign = 'left'
    context.fillStyle = 'hsl(0, 0%, 0%)'
    context.fillText(this.floatWindowOrder, SIZE, SIZE)
  }
}

class Entry {
  constructor () {
    this.timeStamp = Date.now()
    this.currentTime = Date.now()
    this.intervalDiffTime = this.timeStamp - this.currentTime

    this.internalFrameArray = []
    this.animationFrameArray = []

    this._inputReceiver = new InputReceiver()
    this.cursor = this._inputReceiver.getMouseCursorInput()
    this.mouseDownPosition = this.cursor
    this.wheelInput = this._inputReceiver.getMouseWheelInput()
    this._windowManager = new WindowManager()
  }
  change (scene) {
    this._windowManager.change(scene)
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

    frameCounter(this.internalFrameArray)

    frameResetProcess(this.intervalDiffTime)
  }, 0)

  render () {
    frameCounter(this.animationFrameArray)
    context.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

    this._windowManager.render(
      this.intervalDiffTime,
      this.mouseInput,
      this._inputReceiver.getMouseCursorInput()
    )

    // Draw debug
    context.textAlign = 'right'
    context.font = `${size / 2}px ${font}`
    context.fillStyle = 'hsl(0, 0%, 50%)'
    const dictionary = {
      internalFps: this.internalFrameArray.length - 1,
      screenFps: this.animationFrameArray.length - 1,
      pos: `${this.mouseDownPosition.offsetX} ${this.mouseDownPosition.offsetY}`
    }
    Object.entries(dictionary).forEach((v, i) => {
      context.fillText(`${v[0]}:`, canvas.width - size / 2 * 5, size / 2 * (i + 1))
      context.fillText(v[1], canvas.width, size / 2 * (i + 1))
    })

    requestAnimationFrame(this.render.bind(this))
  }
}

Promise.all(RESOURCE_LIST).then(() => {
  const ENTRY_POINT = new Entry()
  ENTRY_POINT.change(new TitleScene())
  ENTRY_POINT.render()
})