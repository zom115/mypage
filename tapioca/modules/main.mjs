import {key, globalTimestamp} from '../../modules/key.mjs'
import {frameCounter} from '../../modules/frameCounter.mjs'
const keyMap = {
  lookUp: ['i'],
  lookRight: ['l'],
  lookDown: ['k'],
  lookLeft: ['j'],
}

const internalFrameList = []
const animationFrameList = []
let intervalDiffTime = 1
let currentTime = globalTimestamp
const isKeyFirst = list => {
  return list.some(v => key[v].holdtime !== 0 && key[v].holdtime <= intervalDiffTime)
}
const version = 'v.0.8.8.1'
const canvas = document.getElementById`canvas`
canvas.oncontextmenu = () => {return false}
canvas.addEventListener('mouseover', () => {
  document.draggable = false
  canvas.draggable = false
  // document.getElementById`canvas`.style.cursor = 'none'
}, false)
let cursor = {offsetX: 0, offsetY: 0}
canvas.addEventListener('mousemove', e => cursor = e, false)
let isFire = false
let mouseDownPos = {offsetX: 0, offsetY: 0}
canvas.addEventListener('mousedown', e => {
  mouseDownPos = e
  if (state === 'main') isFire = true
}, false)
let mouseUpPos = {offsetX: 0, offsetY: 0}
let mouseUpState = false
let isMouseUp = () => {
  let bool = mouseUpState
  mouseUpState = false
  return bool
}
canvas.addEventListener('mouseup', e => {
  mouseUpPos = e
  mouseUpState = true
}, false)
canvas.addEventListener('click', () => {}, false)
const isInner = (box, pos) => {
  const offset = {
    x: pos.offsetX - box.absoluteX,
    y: pos.offsetY - box.absoluteY
  }
  return 0 <= offset.x && offset.x <= box.width &&
  0 <= offset.y && offset.y <= box.height
}
const button = box => {
  return isInner(box, mouseDownPos) && isInner(box, mouseUpPos) && isMouseUp()
}
const DOM = {
  operation: document.getElementById`operation`,
  lookUp: document.getElementById`lookUp`,
  lookRight: document.getElementById`lookRight`,
  lookDown: document.getElementById`lookDown`,
  lookLeft: document.getElementById`lookLeft`,
  fire: document.getElementById`fire`,
  slow: document.getElementById`slow`,
  reload: document.getElementById`reload`,
  back: document.getElementById`back`,
  dash: document.getElementById`dash`,
  inventory: document.getElementById`inventory`,
  pause: document.getElementById`pause`,
  debug: document.getElementById`debug`
}
const context = canvas.getContext`2d`
context.imageSmoothingEnabled =
context.msImageSmoothingEnabled =
context.webkitImageSmoothingEnabled = false
const storage = localStorage
document.getElementById('clear').addEventListener('click', () => {
  storage.clear()
})
const setDOM = (key, value) => {
  if (Object.keys(DOM).some(x => x === key)) {
    DOM[key].innerHTML = value === ' ' ? 'SPACE' : value.toUpperCase()
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
let point = 0
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
const bulletRadius = size / 6
const storeSize = size * 4.5
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
  attackFlag: false,
  breakthrough: 10,
  coolTime: 0,
  damage: 150,
  decrease: 10,
  limit: 150
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
let objects, currentDirection, ownStep
let direction = 0
let angle = 0
let ownStepLimit = 50

const Weapon = class {
  constructor(
    name, category, baseDamage, damage, slideSpeed, bulletSpeed, baseBulletLife, bulletLife, baseReloadSpeed,
    reloadSpeed, magazineSize, magazines, loadingSpeed, penetrationForce, limitBreak, limitBreakIndex
  ) {
    this.name = name
    this.category = category
    this.baseDamage = baseDamage
    this.damage = damage
    this.slideSpeed = slideSpeed
    this.bulletSpeed = bulletSpeed
    this.baseBulletLife = baseBulletLife
    this.bulletLife = bulletLife
    this.baseReloadSpeed= baseReloadSpeed
    this.reloadSpeed = reloadSpeed
    this.magazineSize = magazineSize
    this.magazines = magazines
    this.loadingSpeed = loadingSpeed
    this.penetrationForce = penetrationForce
    this.limitBreak = limitBreak
    this.limitBreakIndex = limitBreakIndex
  }
}
let inventory = []
let inventorySize = 5
let inventoryFlag = false
let selectedIndex = 0
let dropItems = []
let bullets = []
const Bullet = class {
  constructor(life, x, y, dx, dy, isHoming) {
    this.life = life
    this.x = x
    this.y = y
    this.dx = dx
    this.dy = dy
    this.detectFlag = false
    this.detectID = -1
    this.isHoming = isHoming
  }
  update() {
    this.life -= intervalDiffTime
    this.x += this.dx * bulletSpeed
    this.y += this.dy * bulletSpeed
    if (homingFlag) {
      bullets.forEach((bullet, i) => {
        bullet.life = bullet.life - 1
        if (inventory[0].baseBulletLife < bullet.life) {
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
        if (length < radius + bulletRadius){
          const damage = inventory[0].damage * bullet.life / inventory[0].baseBulletLife
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
                const damage = inventory[0].damage * (1 - radius / explosiveRange)
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
          } else if (bullet.prepareFlag && key[action.fire].isFirst()) bullet.life = 2
          else if (key[action.fire].isFirst()) bullet.prepareFlag = true
          return false
        }
        const hit = enemies.findIndex((enemy, index) => {
          return index !== bullet.detectID && 0 < enemy.life &&
          Math.sqrt((bullet.x - enemy.x) ** 2 + (bullet.y - enemy.y) ** 2) < radius + bulletRadius
        })
        if (explosive3Flag) {
          if (bullet.life === 1) {
            const distance = enemies.map(enemy => {
              if (0 < enemy.life) return Math.sqrt((bullet.x - enemy.x) ** 2 + (bullet.y - enemy.y) ** 2)
            })
            distance.forEach((radius, index) => {
              if (radius < explosiveRange) {
                const damage = inventory[0].damage * (1 - radius / explosiveRange)
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
          } else if (bullet.prepareFlag && key[action.fire].isFirst()) {
            bullet.life = 2
            return
          }
          else if (key[action.fire].isFirst()) bullet.prepareFlag = true
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
            let damage = inventory[0].damage * bullet.life / inventory[0].baseBulletLife
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
                    damage = inventory[0].damage * (1 - radius / explosiveRange)
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
              bullet.life = bullet.life * inventory[0].penetrationForce
              const additionalPoint = (enemies[hit].life <= 0) ? 100 : 10
              if (additionalPoint === 100) defeatCount = (defeatCount+1)|0
              point = (point+additionalPoint)|0
              afterglow.point.push({number: additionalPoint, count: 30})
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
let firearm = {
  chamberFlag: false,
  gripFlag: false,
  grip: 1
}
let slide = {
  time: 0,
  stop: 18,
  done: 7,
  state: 'done',
  weight: 1
}
let reload = {
  time: 0,
  release: 10,
  putAway: 15,
  takeOut: 15,
  unrelease: 10,
  state: 'done',
  weight: 1,
  prepareFlag: false,
  unreleaseFlag: false,
  auto: setStorageFirst('autoReload', 'ON')
}
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
  delayTime: 0,
  delayLimit: 0,
  amount: 0,
  amountLimit: 0,
  interval: 0,
  intervalLimit: 120,
  hitPoint: 0
}
let defeatCount
let action
const setOperation = () => {
  if (operationMode === 'WASD') {
    action.up = setStorage('up', 'w')
    action.right = setStorage('right', 'd')
    action.down = setStorage('down', 's')
    action.left = setStorage('left', 'a')
  } else if (operationMode === 'ESDF') {
    action.up = setStorage('up', 'e')
    action.right = setStorage('right', 'f')
    action.down = setStorage('down', 'd')
    action.left = setStorage('left', 's')
  }
}
const setAngle = () => {
  if (angleMode === 'IJKL') {
    action.lookUp = setStorage('lookUp', 'i')
    action.lookRight = setStorage('lookRight', 'l')
    action.lookDown = setStorage('lookDown', 'k')
    action.lookLeft = setStorage('lookLeft', 'j')
  }
}
const getKeyName = key => {
  if (key === ' ') return 'SPACE'
  else return key.toUpperCase() // can't work in turco
}
let titleMenuWordArray = []
const setTitleMenuWord = () => {
  titleMenuWordArray = [
    {text: `PRESS [${getKeyName(action.fire)}] TO START`, hue: 10},
    {text: `PRESS [${getKeyName(action.slow)}] TO EDIT KEY LAYOUT`, hue: 210},
    {text: `[${getKeyName(action.change)}]MAP: ${mapMode}`, hue: 210}
  ]
  context.save()
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.font = `${size}px sans-serif`
  titleMenuWordArray.forEach((v, i) => {
    const property = {
      offsetX: canvas.offsetWidth / 2,
      offsetY: canvas.offsetHeight * (2 / 3 + i / 11)
    }
    const measure = context.measureText(v.text)
    {
      Object.assign(
        titleMenuWordArray[i],
        {offsetX: property.offsetX},
        {offsetY: property.offsetY},
        {absoluteX: property.offsetX - measure.actualBoundingBoxLeft},
        {absoluteY: property.offsetY - measure.actualBoundingBoxAscent},
        {width: measure.width},
        {height: measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent}
      )
    }
  })
  context.restore()
}
document.addEventListener('DOMContentLoaded', () => {
  action = {
    fire: setStorageFirst('fire', ' '),
    reload: setStorageFirst('reload', 'r'),
    combatReload: setStorageFirst('combatReload', 'c'),
    slow: setStorageFirst('slow', 'Shift'),
    dash: setStorageFirst('dash', 'n'),
    back: setStorageFirst('back', 'b'),
    change: setStorageFirst('change', 'm'),
    inventory: setStorageFirst('inventory', 'e'),
    pause: setStorageFirst('pause', 'p'),
    debug: setStorageFirst('debug', 'g')
  }
  setOperation()
  setAngle()
  setTitleMenuWord()
})
const slideProcess = () => {
  if (inventory[0].magazines[firearm.grip] <= 0 && slide.state === 'release') return
  if (reload.state !== 'done') return
  if ((
    explosive1Flag || explosive2Flag || explosive3Flag) &&
    bullets.length !== 0 && slide.state === 'release'
  ) return
  slide.time = (combatReload.flag) ? (slide.time+1)|0 : (slide.time+1)|0
  if (slide.state === 'pullBack' && slide.stop * inventory[0].slideSpeed <= slide.time) {
    if (!firearm.gripFlag) return
    slide.state = 'release'
    const stopSlide = () => {
      if (inventory[0].magazines[firearm.grip] === 0) return // cocking postponement
      if ((key[action.combatReload].flag || combatReload.auto === 'ON') && combatReload.magFlag) {
        combatReload.flag = true
        combatReload.weight = (!key[action.combatReload].flag) ? 8 : 4
      }
    }
    stopSlide()
  } else if (slide.state === 'release' && slide.done * inventory[0].slideSpeed <= slide.time) {
    slide.state = 'done'
    const doneSlide = () => {
      if (combatReload.flag) {
        ammo = (ammo-1)|0
        combatReload.flag = false
      } else if (0 < inventory[0].magazines[firearm.grip] && !firearm.chamberFlag) {
        inventory[0].magazines[firearm.grip] = (inventory[0].magazines[firearm.grip]-1)|0 // semi automatic mechanism
      }
      firearm.chamberFlag = true
      if (afterglow.chamberFlag) {
        afterglow.reload = flashTimeLimit
        afterglow.chamberFlag = false
      }
      combatReload.magFlag = false
      combatReload.weight = (combatReload.auto === 'ON') ? 8 : 4
    }
    doneSlide()
  } else if (slide.state === 'done') {
    if (0 <= slide.time) return slide.state = 'pullBack'
  } else return
  slide.time = 0
}
const differenceAddition = (position, dx, dy) => {
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
const mouseFiring = () => {
  if (
    reload.auto === 'ON' &&
    inventory[0].magazines[firearm.grip] <= 0 &&
    reload.time === 0 &&
    0 < inventory[0].magazines[setMoreThanMagazine()] &&
    !firearm.chamberFlag &&
    slide.state === 'release'
  ) {
    inventory[0].reloadSpeed = inventory[0].baseReloadSpeed * 1.5
    reloadProcess()
    return
  }
  if (!firearm.chamberFlag) return
  const theta = Math.atan2(
    cursor.offsetY - canvas.offsetHeight / 2,
    cursor.offsetX - canvas.offsetWidth / 2
  )
  let dx = Math.cos(theta)
  let dy = Math.sin(theta)
  if (dx === 0 && dy === 0) return
  if (reload.state !== 'done') { // random direction when incomplete reload
    const tmpDx = dx
    const tmpDy = dy
    const theta = (45 - Math.random() * 90) * (Math.PI / 180) // front 90 degrees
    dx = tmpDx * Math.cos(theta) - tmpDy * Math.sin(theta)
    dy = tmpDx * Math.sin(theta) + tmpDy * Math.cos(theta)
  }
  bullets.push(new Bullet(
    inventory[0].bulletLife,
    ownPosition.x,
    ownPosition.y,
    dx * inventory[0].bulletSpeed,
    dy * inventory[0].bulletSpeed
  ))
  // setBullet(
  //   inventory[0].bulletLife,
  //   ownPosition.x,
  //   ownPosition.y,
  //   dx * inventory[0].bulletSpeed,
  //   dy * inventory[0].bulletSpeed
  // )

  /*
  { // recoil / blowback
    differenceAddition(ownPosition, -dx * bulletRadius, -dy * bulletRadius)
    recoilEffect.dx = dx * bulletRadius
    recoilEffect.dy = dy * bulletRadius
    afterglow.recoil = recoilEffect.flame
  }
  */

  firearm.chamberFlag = false
}
const firingProcess = () => {
  if (
    reload.auto === 'ON' &&
    inventory[0].magazines[firearm.grip] <= 0 &&
    reload.time === 0 &&
    0 < inventory[0].magazines[setMoreThanMagazine()] &&
    !firearm.chamberFlag &&
    slide.state === 'release'
  ) {
    inventory[0].reloadSpeed = inventory[0].baseReloadSpeed * 1.5
    reloadProcess()
    return
  }
  if (!firearm.chamberFlag) return
  let {dx, dy} = (angle !== 0) ? directionCalc(angle) : directionCalc(currentDirection)
  if (dx === 0 && dy === 0) return
  [dx, dy] = [-dx, -dy]
  if (reload.state !== 'done') { // random direction when incomplete reload
    const tmpDx = dx
    const tmpDy = dy
    const theta = (45 - Math.random() * 90) * (Math.PI / 180) // front 90 degrees
    dx = tmpDx * Math.cos(theta) - tmpDy * Math.sin(theta)
    dy = tmpDx * Math.sin(theta) + tmpDy * Math.cos(theta)
  }

  // TODO: Homing?

  if (homingFlag) {
    const r =  size * 3
    const theta = (5 - Math.random() * 10) * (Math.PI / 180) // front 10 degrees
    bullets.push(
      inventory[0].bulletLife + prepareTime,
      ownPosition.x,
      ownPosition.y,
      r * (dx * Math.cos(theta) - dy * Math.sin(theta)) / prepareTime,
      r * (dx * Math.sin(theta) + dy * Math.cos(theta)) / prepareTime
    )
  } else {
    bullets.push(
      inventory[0].bulletLife,
      ownPosition.x,
      ownPosition.y,
      dx * inventory[0].bulletSpeed,
      dy * inventory[0].bulletSpeed
    )

    // TODO: Clone?

    if (0 < clonePosition.length) {
      bullets.push(
        inventory[0].bulletLife * clonePower,
        clonePosition.reduce((pre, current) => {return pre + current.dx}, ownPosition.x),
        clonePosition.reduce((pre, current) => {return pre + current.dy}, ownPosition.y),
        dx * inventory[0].bulletSpeed,
        dy * inventory[0].bulletSpeed
      )
    }
    // recoil / blowback
    differenceAddition(ownPosition, -dx * bulletRadius, -dy * bulletRadius)
    recoilEffect.dx = dx * bulletRadius
    recoilEffect.dy = dy * bulletRadius
    afterglow.recoil = recoilEffect.flame
  }
  firearm.chamberFlag = false
}
const setOtherMagazine = () => {
  const array = inventory[0].magazines.map((x, i) => {
    if (x === inventory[0].magazineSize || i === firearm.grip) return -1
    else return x
  })
  const index = array.indexOf(Math.max(...array))
  if (
    index !== firearm.grip && // if only a magazine
    inventory[0].magazines[index] !== inventory[0].magazineSize
  ) return index
  else return -1
}
const setMoreThanMagazine = () => {
  return inventory[0].magazines.indexOf(Math.max(...inventory[0].magazines))
}
const reloadProcess = () => {
  reload.time = (reload.time+1)|0
  if (reload.state === 'release' && reload.release * inventory[0].reloadSpeed <= reload.time) {
    reload.state = 'putAway'
  } else if (reload.state === 'putAway' && reload.putAway * inventory[0].reloadSpeed <= reload.time) {
    reload.state = 'takeOut'
    firearm.grip = setMoreThanMagazine()
  } else if (reload.state === 'takeOut' && reload.takeOut * inventory[0].reloadSpeed <= reload.time) {
      reload.state = 'unrelease'
  } else if (reload.state === 'unrelease' && reload.unrelease * inventory[0].reloadSpeed <= reload.time) {
      reload.state = 'done'
      const unreleaseMagazine = () => {
        if (!afterglow.chamberFlag) afterglow.reload = flashTimeLimit
        firearm.gripFlag = true
        combatReload.magFlag = true
      }
      unreleaseMagazine()
  } else if (reload.state === 'done') {
    if (0 <= reload.time) {
      reload.state = 'release'
      firearm.gripFlag = false
      if (!firearm.chamberFlag) afterglow.chamberFlag = true
    }
  } else return
  reload.time = 0
}
const loadingProcess = () => {
  if (slide.state !== 'done' && firearm.chamberFlag) return
  if (
    setOtherMagazine() === -1 && (inventory[0].magazines.length !== 1 ||
    inventory[0].magazines[0] === inventory[0].magazineSize)
  ) return
  if (ammo <= 0 && !loading.takeOutFlag) return
  if (combatReload.flag) {
    ammo = (loading.takeOutFlag) ? (ammo+1)|0 : ammo
    return loading.time = 0 // TODO: after implementation multiple cartridges
  } else if (reload.state !== 'done') {
    return loading.time = (loading.time <= 0) ? 0 : (loading.time-1)|0
  } else if (!firearm.gripFlag) { // equal reload or one magazine
    let counter = 0
    for (let i = 0; i < inventory[0].magazines.length; i=(i+1)|0) {
      if (inventory[0].magazines[i] <= 0) counter = (counter+1)|0
    }
    if (1 < counter) return
    if (1 < loading.time) { // TODO: to consider
      loading.time = (loading.time+1)|0
    }
  }
  const movingWeight = () => {
    let {dx, dy} = directionCalc(direction)
    return (dx === 0 && dy === 0) ? 1 : 1 / 3
  }
  loading.time = loading.time + movingWeight()
  if (loading.time < loading.takeOut * inventory[0].loadingSpeed && loading.takeOutFlag) {
    ammo = (ammo+1)|0
    loading.takeOutFlag = false
  } else if (loading.takeOut * inventory[0].loadingSpeed <= loading.time && !loading.takeOutFlag) {
    ammo = (ammo-1)|0
    loading.takeOutFlag = true
  }
  if (loading.time < loading.done * inventory[0].loadingSpeed) return
  else if (inventory[0].magazines.length === 1) inventory[0].magazines[0] += 1
  else inventory[0].magazines[setOtherMagazine()] = (inventory[0].magazines[setOtherMagazine()]+1)|0
  loading.takeOutFlag = false
  loading.time = 0
}
const magazineForword = () => {
  inventory[0].magazines.push(inventory[0].magazines[1])
  inventory[0].magazines.splice(1, 1)
}
const dashCoolTimer = arg => {
  if (dash.coolTime === 1) {
    dash.attackFlag = false
    afterglow.dashGauge = flashTimeLimit
  }
  if (typeof arg === 'number') dash.coolTime = arg
  else if (0 < dash.coolTime) dash.coolTime = (dash.coolTime-1)|0
  return dash.coolTime
}
const dashProcess = () => {
  if (cloneDashType1Flag && !key[action.slow].flag) cloneSpeed = dash.breakthrough
  else if (cloneDashType2Flag) { ownSpeed.current = dash.breakthrough
  } else if (cloneDashType3Flag && !key[action.slow].flag) {
    clonePosition = []
    cloneSpeed = dash.breakthrough
  } else ownSpeed.current = dash.breakthrough
  dashCoolTimer(dash.limit)
}
const speedAdjust = () => {
  if (((
    key[action.up].flag && key[action.lookDown].flag) ||
    (key[action.right].flag && key[action.lookLeft].flag) ||
    (key[action.down].flag && key[action.lookUp].flag) ||
    (key[action.left].flag && key[action.lookRight].flag)) &&
    ownSpeed.min < ownSpeed.current
  ) {
    ownSpeed.current = ownSpeed.current - ownSpeed.dx
  } else if (ownSpeed.current < ownSpeed.max) {
    ownSpeed.current = ownSpeed.current + ownSpeed.constDx
  }
  if (ownSpeed.max < ownSpeed.current) {
    ownSpeed.current = ownSpeed.current - ownSpeed.dx * dash.decrease
  }
  if (cloneDashType1Flag) {
    if (ownSpeed.max < cloneSpeed) cloneSpeed = cloneSpeed - ownSpeed.dx * dash.decrease
    else if (ownSpeed.max < ownSpeed.current) {} else cloneSpeed = ownSpeed.current
  } else if (cloneDashType2Flag) {
    if (ownSpeed.max < cloneSpeed) cloneSpeed = cloneSpeed - ownSpeed.dx * dash.decrease
    else cloneSpeed = ownSpeed.current
  } else if (cloneDashType3Flag) {
    if (ownSpeed.max < cloneSpeed) cloneSpeed = cloneSpeed - ownSpeed.dx * dash.decrease
    else if (ownSpeed.max < ownSpeed.current) {} else cloneSpeed = ownSpeed.current
  } else cloneSpeed = ownSpeed.current
}
const moving = () => {
  let {dx, dy} = (ownSpeed.max < ownSpeed.current) ? directionCalc(currentDirection) :
  directionCalc(direction)
  differenceAddition(ownPosition, dx * ownSpeed.current, dy * ownSpeed.current)
  if (cloneFlag) {
    if (key[action.slow].flag) {
      clonePosition.unshift({dx: dx * cloneSpeed, dy: dy * cloneSpeed})
    } else {
      if (ownSpeed.max < cloneSpeed && (
        cloneDashType1Flag || cloneDashType2Flag || cloneDashType3Flag)
      ) {
        const tmp = directionCalc(currentDirection)
        dx = -tmp.dx
        dy = -tmp.dy
      }
      clonePosition.push({dx: dx * cloneSpeed, dy: dy * cloneSpeed})
    }
  }
}
const bomb = () => {
  enemies.forEach(enemy => {
    enemy.life = 0
    enemy.timer = 30
  })
}
const interfaceProcess = () => {
  if (key[action.pause].isFirst()) state = 'pause'
  if (key[action.inventory].isFirst()) inventoryFlag = !inventoryFlag
  speedAdjust()
  if (key[action.lookUp].flag) angle = (angle+1)|0
  if (key[action.lookRight].flag) angle = (angle+2)|0
  if (key[action.lookDown].flag) angle = (angle+4)|0
  if (key[action.lookLeft].flag) angle = (angle+8)|0
  if (key[action.up].flag) direction = (direction+1)|0
  if (key[action.right].flag) direction = (direction+2)|0
  if (key[action.down].flag) direction = (direction+4)|0
  if (key[action.left].flag) direction = (direction+8)|0
  if (0 < angle) currentDirection = angle
  else if (direction !== 0) currentDirection = direction
  if (key[action.reload].isFirst() && reload.time === 0 && reload.state === 'done') {
    inventory[0].reloadSpeed = inventory[0].baseReloadSpeed
    reloadProcess()
  } else if (0 < reload.time || reload.state !== 'done') reloadProcess()

  // if (key[action.fire].flag) firingProcess()

  if (isFire) mouseFiring()
  isFire = false

  loadingProcess()
  if (key[action.change].isFirst()) magazineForword() // TODO: to consider
  if (dashCoolTimer() === 0 && key[action.dash].isFirst()) dashProcess()
  if (0 < direction || ownSpeed.max < ownSpeed.current || ownSpeed.max < cloneSpeed) moving()
  if (key[action.debug].isFirst()) debugMode = !debugMode
  if (manyAmmo() && key[action.back].isFirst()) bomb()
}
const cloneProcess = () => {
  if (
    cloneReturnFlag && direction === 0 && !key[action.slow].flag &&
    cloneSpeed <= ownSpeed.max
  ) clonePosition.shift()
  if (60 < clonePosition.length) clonePosition.shift()
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
    ownStepLimit / 2 + delayStep <= ownStep || ownStep < delayStep) &&
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
    loadedMap[imgClone], ~~(relativeX(pos.x - radius)+.5), ~~(relativeY(pos.y - radius)+.5)
  )
  context.restore()
  if (0 < dash.coolTime && (cloneDashType1Flag || cloneDashType2Flag || cloneDashType3Flag)) { // clone dash
    if (ownSpeed.max < cloneSpeed) afterimage.push({
      x: pos.x, y: pos.y, alpha: .5
    })
    afterimage.forEach((clone, index) => {
      context.save()
      context.globalAlpha = clone.alpha
      context.drawImage(loadedMap[imgClone],
        ~~(relativeX(clone.x - size / 2)+.5),
        ~~(relativeY(clone.y - size / 2)+.5)
      )
      context.restore()
      clone.alpha = clone.alpha - .05
      if (clone.alpha <= 0) afterimage.splice(index, 1)
    })
  }
}
const drawMyself = () => {
  if (direction === 0) ownStep = 0
  else ownStep = (ownStep+1)|0
  const imgMyself = ownStepLimit / 2 <= ownStep && ownSpeed.current <= ownSpeed.max
  ? 'images/TP2F.png' :
  ownSpeed.max < ownSpeed.current && 0 < currentDirection ? setOwnImage(currentDirection) :
  0 < angle ? setOwnImage(angle) : setOwnImage(direction)
  const pos = { // recoil effect
    x: canvas.offsetWidth / 2 + recoilEffect.dx * (afterglow.recoil / recoilEffect.flame),
    y: canvas.offsetHeight / 2 + recoilEffect.dy * (afterglow.recoil / recoilEffect.flame)
  }
  context.fillStyle = 'hsla(0, 0%, 0%, .2)' // shadow
  context.beginPath()
  context.arc(
    pos.x + radius * .05, pos.y + radius * .6, size / 4, 0, Math.PI * 2, false
  )
  context.fill()
  if (0 < afterglow.dashGauge) {
    context.fillStyle = 'hsla(0, 100%, 100%, .5)'
    context.beginPath()
    context.arc(
      pos.x, pos.y, size / 2, 0, Math.PI * 2, false
    )
    context.fill()
  }
  context.save()
  if (0 < dash.coolTime) {
    if (ownSpeed.max < ownSpeed.current) afterimage.push({
      x: ownPosition.x, y: ownPosition.y, alpha: .5
    })
    afterimage.forEach((own, index) => {
      context.save()
      context.globalAlpha = own.alpha
      context.drawImage(loadedMap[imgMyself],
        ~~(relativeX(own.x - size / 2)+.5),
        ~~(relativeY(own.y - size / 2)+.5)
      )
      context.restore()
      own.alpha = own.alpha - .05
      if (own.alpha <= 0) afterimage.splice(index, 1)
    })
    context.globalAlpha = .5
    if (
      key[action.dash].flag && key[action.dash].holdtime <= flashTimeLimit &&
      ownSpeed.current <= ownSpeed.max
    ) {
      context.fillStyle = 'hsla(0, 100%, 50%, .5)'
      context.beginPath()
      context.arc(pos.x, pos.y, size / 2, 0, Math.PI * 2, false)
      context.fill()
    }
  }
  context.globalAlpha = (0 < moreAwayCount) ? moreAwayCount / moreAwayLimit : 1
  context.drawImage(loadedMap[imgMyself], ~~(pos.x - radius+.5), ~~(pos.y - radius+.5))
  context.restore()
  if (ownStepLimit <= ownStep) ownStep = 0
}
const drawDirection = () => {
  const pos = { // recoil effect
    x: canvas.offsetWidth / 2 + recoilEffect.dx * (afterglow.recoil / recoilEffect.flame),
    y: canvas.offsetHeight / 2 + recoilEffect.dy * (afterglow.recoil / recoilEffect.flame)
  }
  let {dx, dy} = (angle !== 0) ? directionCalc(angle) : directionCalc(currentDirection)
  context.fillStyle = 'hsla(0, 0%, 0%, .2)'
  context.beginPath()
  context.arc(
    pos.x - dx * size / 2, pos.y - dy * size / 2,
    size / 8, 0, Math.PI * 2, false
  )
  context.fill()
}
const drawField = () => {
  context.fillStyle = 'hsl(240, 100%, 60%)'
  const width = size * 7.5
  const pos = (0 < afterglow.recoil) ? {
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
const setWeapon = i => {
  const baseDamage = maxDamageInitial * (
    .5 + Math.random() * (.5 + Math.random() * wave.number * .5)
  )
  const magazineSize = 1 + ~~(Math.random() * (magSizeInitial + wave.number))
  const magSizeRatio = (magazineSize < magSizeInitial) ? 1 - magazineSize / magSizeInitial : 0
  const additionalDamage =  (1 < slideSpeed) ? slideSpeed - 1 : 0
  const damage = baseDamage + maxDamageInitial * (
      Math.random() * (wave.number * additionalDamage)
    ) * (1 + magSizeRatio)
  const slideSpeed = slide.weight * (.75 + magSizeRatio + Math.random() * .25)
  const bulletSpeed = cartridgeInfo.speed * (.5 + Math.random() * 1.5)
  const bulletLife = cartridgeInfo.life * (.5 + Math.random() * .5)
  const reloadSpeed = reload.weight * (.25 + (1 - magSizeRatio) / 2 + Math.random() * .25)
  // the smaller the bigger
  const magazines = Array(1 + ~~(Math.random() * (2 + ~~(wave.number/10)))).fill(magazineSize)
  const loadingSpeed = loading.weight * (.25 + magSizeRatio / 2 + Math.random() * .25)
  const penetrationForce = Math.random()
  const weapon = new Weapon(
    `# ${wave.number}`,
    'SMG',
    baseDamage,
    damage,
    slideSpeed,
    bulletSpeed,
    bulletLife,
    bulletLife,
    reloadSpeed,
    reloadSpeed,
    magazineSize,
    magazines,
    loadingSpeed,
    penetrationForce,
    4000,
    0
  )
  Object.assign(weapon, {type: 'weapon'})
  enemies[i] = weapon
}
const enemyProcess = () => {
  enemies.forEach((enemy, index) => {
    if (0 < enemy.timer) enemy.timer = (enemy.timer-1)|0
    if (enemy.life <= 0) {
      if (enemy.timer <= 0) {
        const c = {x: enemy.x, y: enemy.y}
        if (enemy.imageID === enemyImageAmount) {
          setWeapon(index)
        } else {
          const waveWeight = (wave.number <= 4) ? 2 : 1
          enemies[index] = {
            type: 'cartridge',
            life: 630,
            dissapearTime: 660,
            amount: waveWeight * wave.number
          }
        }
        enemies[index].unavailableTime = 30
        enemies[index].x = c.x
        enemies[index].y = c.y
        dropItems.push(enemies.splice(index, 1)[0])
      } return
    }
    const width = ownPosition.x - enemy.x
    const height = ownPosition.y - enemy.y
    const length = Math.sqrt(width ** 2 + height ** 2)
    if (0 < moreAwayCount) {
      differenceAddition(enemy, width / length * enemy.speed, height / length * enemy.speed)
    } else {
      differenceAddition(enemy, -width / length * enemy.speed, -height / length * enemy.speed)
    }
    if (
      Math.sqrt(canvas.offsetWidth ** 2 + canvas.offsetHeight ** 2)*.7 < length &&
      !reviveFlag
    ) { // repop
      const r = Math.sqrt(canvas.offsetWidth ** 2 + canvas.offsetHeight ** 2) / 2
      const a = ~~(Math.random() * 360 + 1)
      enemy.x = ownPosition.x + r * Math.cos(a * (Math.PI / 180))
      enemy.y = ownPosition.y + r * Math.sin(a * (Math.PI / 180))
    }
    if (
      enemies.some((e, i) => index !== i && 0 < e.life &&
      Math.sqrt((e.x - enemy.x) ** 2 + (e.y - enemy.y) ** 2) < size)
    ) {
      differenceAddition(
        enemy,
        -width / length * enemy.speed + (size / 2 * (.5 - Math.random())),
        -height / length * enemy.speed + (size / 2 * (.5 - Math.random()))
      )
    }
    enemy.step = (enemy.stepLimit <= enemy.step) ? enemy.step = 0 : (enemy.step+1)|0
    // collisionDetect
    if (((
        ownPosition.x - enemy.x) ** 2 + (ownPosition.y - enemy.y) ** 2
      ) ** .5 < minImgRadius * 2 + size / 8 && 0 < enemy.life
    ) {
      if (ownSpeed.max < ownSpeed.current) {
        if (!dash.attackFlag) {
          dash.attackFlag = true
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
          state = 'result'
          return
        }
      }
    }
    if (
      ownSpeed.max < cloneSpeed && !dash.attackFlag &&
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
        dash.attackFlag = true
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
const drawEnemies = () => {
  enemies.forEach(enemy => {
    context.fillStyle = (enemy.imageID === 0) ? 'hsla(0, 100%, 50%, .5)' :
    (enemy.imageID === 1) ? 'hsla(300, 100%, 50%, .5)' :
    (enemy.imageID === 2) ? 'hsla(60, 100%, 60%, .5)' : 'hsla(0, 0%, 100%, .5)'
    if (
      enemy.x < ownPosition.x - canvas.offsetWidth/2 + radius &&
     enemy.y < ownPosition.y - canvas.offsetHeight/2 + radius // left & top
    ) context.fillRect(0, 0, size, size)
    else if (
      enemy.x < ownPosition.x - canvas.offsetWidth/2 + radius &&
      ownPosition.y + canvas.offsetHeight/2 - size + radius < enemy.y // left & bottom
    ) context.fillRect(0, canvas.offsetHeight - size, size, size)
    else if (
      ownPosition.x + canvas.offsetWidth/2 - size + radius < enemy.x &&
      enemy.y < ownPosition.y - canvas.offsetHeight/2 + radius // right & top
    ) context.fillRect(canvas.offsetWidth - size, 0, size, size)
    else if (
      ownPosition.x + canvas.offsetWidth/2 - size + radius < enemy.x &&
      ownPosition.y + canvas.offsetHeight/2 - size + radius < enemy.y // right & bottom
    ) context.fillRect(canvas.offsetWidth - size, canvas.offsetHeight - size, size, size)
    else if (enemy.x < ownPosition.x - canvas.offsetWidth/2 + radius) { // out of left
      context.fillRect(0, relativeY(enemy.y - radius), size, size)
    } else if (ownPosition.x + canvas.offsetWidth/2 + radius < enemy.x) { // out of right
      context.fillRect(canvas.offsetWidth-size, relativeY(enemy.y - radius), size, size)
    } else if (enemy.y < ownPosition.y - canvas.offsetHeight/2 + radius) { // out of top
      context.fillRect(relativeX(enemy.x - radius), 0, size, size)
    } else if (ownPosition.y + canvas.offsetHeight/2 + radius < enemy.y) { // out of bottom
      context.fillRect(relativeX(enemy.x - radius), canvas.offsetHeight - size, size, size)
    } else {
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
        loadedMap[imgEnemy], ~~(relativeX(coordinate.x)+.5), ~~(relativeY(coordinate.y)+.5)
      )
      context.restore()
      if (debugMode) {
        if (0 < enemy.life) {
          context.font = `${size/2}px sans-serif`
          context.fillRect(relativeX(enemy.x - radius), relativeY(enemy.y - radius * 1.2),
          enemy.life / wave.hitPoint * size, size / 16)
          // context.fillText(Math.ceil(enemy.life) // numerical drawing
          // , relativeX(enemy.x - radius), relativeY(enemy.y - radius * 1.2))
        }
        // pop damage
        context.font = `${size * 2 / 3 * enemy.timer/damageTimerLimit}px sans-serif`
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
    context.fillStyle = `hsla(0, 0%, 0%, ${bullet.life / inventory[0].baseBulletLife})`
    context.beginPath()
    context.arc(relativeX(bullet.x), relativeY(bullet.y), bulletRadius, 0, Math.PI * 2, false)
    context.fill()
  })
}
const dropItemProcess = () => {
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
    let multiple = (
      item.type === 'weapon' || item.type === 'droppedWeapon') &&
      inventorySize <= inventory.length ? 0 : .5 + 160 / (distance) // : size / 512
    if (0 < item.unavailableTime) item.unavailableTime = (item.unavailableTime-1)|0
    else {
      item.x = item.x + width / distance * multiple
      item.y = item.y + height / distance * multiple
    }
    if (item.type === 'cartridge') {
      if (distance < minImgRadius + bulletRadius) {
        ammo = (ammo+item.amount)|0
        dropItems.splice(index, 1)
      }
    } else if (item.type === 'magazine') {
      if (item.unavailableTime <= 0 && distance < minImgRadius * 2) {
        for (let i = 0; i < inventory[0].magazines.length + 1; i=(i+1)|0) {
          if (inventory[0].magazines[i] === -1) return inventory[0].magazines[i] = item.amount
          if (i === inventory[0].magazines.length + 1) inventory[0].magazines.push(item.amount)
        }
        dropItems.splice(index, 1)
      }
    } else if (item.type === 'weapon' || item.type === 'droppedWeapon') {
      if (
        item.unavailableTime <= 0 && distance < minImgRadius * 2 &&
        inventory.length < inventorySize
      ) {
        delete item.type,
        delete item.unavailableTime,
        delete item.x,
        delete item.y
        if (item.time) delete item.time
        inventory.push(dropItems.splice(index, 1)[0])
      }
    }
  })
}
const drawDropItems = () => {
  dropItems.forEach(item => {
    if (item.type === 'cartridge') {
      context.fillStyle = `hsla(0, 0%, 25%, ${item.life / item.dissapearTime})`
      context.beginPath()
      if ( // left & top
        item.x < ownPosition.x - canvas.offsetWidth / 2 + bulletRadius / 2 &&
        item.y < ownPosition.y - canvas.offsetHeight / 2 + bulletRadius / 2
      ) context.arc(
        bulletRadius / 2, bulletRadius / 2, bulletRadius / 2, 0 / 2, Math.PI * 2, false
      )
      else if ( // left & bottom
        item.x < ownPosition.x - canvas.offsetWidth / 2 + bulletRadius / 2 &&
        ownPosition.y + canvas.offsetHeight / 2 - bulletRadius / 2 < item.y
      ) context.arc(
        bulletRadius / 2, canvas.offsetHeight - bulletRadius / 2,
        bulletRadius / 2, 0, Math.PI * 2, false
      )
      else if ( // right & top
        ownPosition.x + canvas.offsetWidth/2 - bulletRadius / 2 < item.x &&
        item.y < ownPosition.y - canvas.offsetHeight/2 + bulletRadius / 2
      ) context.arc(
        canvas.offsetWidth - bulletRadius / 2, bulletRadius / 2,
        bulletRadius / 2, 0, Math.PI * 2, false
      )
      else if ( // right & bottom
        ownPosition.x + canvas.offsetWidth/2 - bulletRadius / 2 < item.x &&
        ownPosition.y + canvas.offsetHeight/2 - bulletRadius / 2 < item.y
      ) context.arc(
        canvas.offsetWidth - bulletRadius / 2,
        canvas.offsetHeight - bulletRadius / 2,
        bulletRadius / 2, 0, Math.PI * 2, false
      )
      else if (item.x < ownPosition.x - canvas.offsetWidth/2 + bulletRadius / 2) { // out of left
        context.arc(
          bulletRadius / 2, relativeY(item.y), bulletRadius / 2, 0, Math.PI * 2, false
        )
      } else if (ownPosition.x + canvas.offsetWidth / 2 + bulletRadius / 2 < item.x) { // out of right
        context.arc(
          canvas.offsetWidth - bulletRadius / 2, relativeY(item.y),
          bulletRadius / 2, 0, Math.PI * 2, false
        )
      } else if (item.y < ownPosition.y - canvas.offsetHeight / 2 + bulletRadius / 2) { // out of top
        context.arc(
          relativeX(item.x), bulletRadius / 2,
          bulletRadius / 2, 0, Math.PI * 2, false
        )
      } else if (ownPosition.y + canvas.offsetHeight / 2 + bulletRadius / 2 < item.y) { // out of bottom
        context.arc(
          relativeX(item.x), canvas.offsetHeight - bulletRadius  + bulletRadius / 2,
          bulletRadius / 2, 0, Math.PI * 2, false
        )
      } else {

      }
      context.arc(relativeX(item.x), relativeY(item.y), bulletRadius, 0, Math.PI * 2, false)
      context.fill()
    } else if (item.type === 'magazine') {
      context.fillStyle = 'hsl(120, 100%, 20%)'
      context.fillRect(relativeX(item.x), relativeY(item.y), size / 3, size * 2 / 3)
    } else if (item.type === 'explosive') {
      context.fillStyle = `hsla(0, 0%, 0%, ${.2 * (item.life / explosiveLimit)})`
      context.beginPath()
      context.arc(relativeX(item.x), relativeY(item.y), explosiveRange, 0, Math.PI * 2, false)
      context.fill()
    } else if (item.type === 'weapon' || item.type === 'droppedWeapon') {
      context.fillStyle = (item.type === 'droppedWeapon') ?
      `hsla(180, 100%, 30%, ${item.life/600})` :
      'hsl(180, 100%, 40%)'
      context.fillRect(relativeX(item.x), relativeY(item.y), size * 2 / 3, size * 2 / 3)
    }
  })
}
const drawText = (fontSize, align, content, coordinate) => {
  context.font = `${fontSize}px sans-serif`
  context.textAlign = align
  context.fillText(content, coordinate.x, coordinate.y)
}
const drawIndicator = () => {
  let c = {x: canvas.offsetWidth - size, y: canvas.offsetHeight - size}
  context.save()
  context.font = `${size * .5}px sans-serif`
  context.fillStyle = 'hsl(330, 100%, 50%)'
  context.globalAlpha = .7
  if (homingFlag) {
    context.drawImage(loadedMap['images/Homingv1.jpg'], ~~(c.x - size * 2+.5), ~~(c.y - size * 8+.5))
  } else if (explosive1Flag) {
    context.drawImage(loadedMap['images/TP2F.png'], ~~(c.x - size * 2+.5), ~~(c.y - size * 8+.5))
    context.fillText('1', c.x - size * 2, c.y - size * 8)
  } else if (explosive2Flag) {
    context.drawImage(loadedMap['images/TP2F.png'], ~~(c.x - size * 2+.5), ~~(c.y - size * 8+.5))
    context.fillText('2', c.x - size * 2, c.y - size * 8)
  } else if (explosive3Flag) {
    context.drawImage(loadedMap['images/TP2F.png'], ~~(c.x - size * 2+.5), ~~(c.y - size * 8+.5))
    context.fillText('3', c.x - size * 2, c.y - size * 8)
  }
    context.restore()
  context.font = `${size}px sans-serif`
  context.fillStyle = 'hsla(120, 100%, 30%, .7)'
  context.textAlign = 'right'
  context.fillText(point, c.x, c.y - size * 5)
  context.fillStyle = 'hsla(60, 100%, 50%, .7)'
  if (0 < afterglow.point.length) {
    context.font = `${size*.75}px sans-serif`
    afterglow.point.forEach((x, i) => {
      context.fillText(`+${x.number}`, c.x - size * 2 - (30 - x.count)/2, c.y - size * 6)
      x.count = (x.count-1)|0
      if (x.count <= 0) afterglow.point.splice(i, 1)
    })
    context.font = `${size}px sans-serif`
  }
  const cartridges = inventory[0].magazines[firearm.grip]
  context.fillStyle = (cartridges < inventory[0].magazineSize * .1) ? 'hsla(0, 100%, 60%, .7)' :
  (cartridges < inventory[0].magazineSize * .3) ? 'hsla(60, 100%, 70%, .7)' : 'hsla(210, 100%, 50%, .7)'
  context.save()
  const inChamber = (firearm.chamberFlag) ? 1 : 0
  context.fillText(`${cartridges}+${inChamber}`, c.x, c.y - size * 3)
  context.fillStyle = ammo === 0 ? 'hsla(0, 100%, 60%, .7)' : 'hsla(210, 100%, 50%, .7)'
  context.fillText(ammo, c.x, c.y)
  context.restore()
  const cartridgeSize = 1 / (inventory[0].magazineSize + 1)
  const yOffset = canvas.offsetHeight - size
  const yHeight = size * 4
  c.x = canvas.offsetWidth - size * 5.25
  c.y = yOffset - inventory[0].magazineSize * cartridgeSize * yHeight
  if (0 < afterglow.reload) context.fillStyle = 'hsla(0, 100%, 100%, .7)'
  context.fillRect(c.x, c.y, -size / 4, -inChamber * cartridgeSize * yHeight) // chamber
  const releaseTime = reload.release * inventory[0].reloadSpeed
  const putAwayTime = reload.putAway * inventory[0].reloadSpeed
  const takeOutTime = reload.takeOut * inventory[0].reloadSpeed
  const unreleaseTime = reload.unrelease * inventory[0].reloadSpeed
  let ratio = (reload.state === 'release' && reload.time <= releaseTime) ?
  1 - reload.time / releaseTime : // 1
  (reload.state === 'unrelease' && reload.time <= unreleaseTime) ? // 2
  reload.time / unreleaseTime : 1
  if (reload.state === 'done' || reload.state === 'release' || reload.state === 'unrelease') {
    c.y = yOffset - (ratio - 1) * inventory[0].magazineSize * cartridgeSize * yHeight
    if (slide.state !== 'release' && slide.time === 0) { // slide gauge
      context.fillRect(c.x - size * 5 / 16, c.y, size / 16, -yHeight) // full
    } else if (slide.state === 'pullBack') {
      context.fillRect(
        c.x - size * 5 / 16,
        c.y,
        size / 16,
        -(1 - slide.time / (slide.stop * inventory[0].slideSpeed)) * yHeight
      )
    } else if (slide.state === 'release') {
      context.fillRect(
        c.x - size * 5 / 16,
        c.y,
        size / 16,
        - (slide.time / (slide.done * inventory[0].slideSpeed)) * yHeight
      )
    }
  }
  ratio = (reload.state === 'release') ? 1 - reload.time / releaseTime :
  (reload.state === 'putAway') ? reload.time / putAwayTime :
  (reload.state === 'takeOut') ? 1 - reload.time / takeOutTime :
  (reload.state === 'unrelease') ? reload.time / unreleaseTime : 1
  inventory[0].magazines.forEach((magazine, index) => {
    if (magazine !== -1) {
      context.fillStyle = (0 < afterglow.reload && index === firearm.grip) ?
      'hsla(0, 100%, 100%, .7)' :
      (magazine < inventory[0].magazineSize * .1) ?
      'hsla(0, 100%, 60%, .7)' :
      (magazine < inventory[0].magazineSize * .3) ?
      'hsla(60, 100%, 70%, .7)' : 'hsla(210, 100%, 50%, .7)'
      if (
        index === firearm.grip && !(reload.state === 'putAway' || reload.state === 'takeOut')
      ) c.x = canvas.offsetWidth - size * 5.25
      else c.x = canvas.offsetWidth - size * (6.25 + index)
      if (index === firearm.grip) {
        c.y = yOffset - ratio * inventory[0].magazineSize * cartridgeSize * yHeight
      } else c.y = yOffset - inventory[0].magazineSize * cartridgeSize * yHeight
      context.fillRect(c.x, c.y, -size / 4, magazine * cartridgeSize * yHeight) // cartridges
      context.fillRect( // magazine stop
        c.x + size / 16,
        c.y + inventory[0].magazineSize * cartridgeSize * yHeight,
        -size * 3 / 8, size / 16
      )
      if (
        index === firearm.grip &&
        (reload.state === 'putAway' || reload.state === 'takeOut') ||
        index !== firearm.grip
      ) {
        context.fillRect( // left width bar
          c.x - size / 4,
          c.y, -size / 16,
          inventory[0].magazineSize * cartridgeSize * yHeight
        )
      }
      if ((
        index === setOtherMagazine() || inventory[0].magazines.length === 1) &&
        (loading.time !== 0 || magazine.magazines !== inventory[0].magazineSize)
      ) {
        context.fillRect( // loading gauge
          c.x,
          c.y + inventory[0].magazineSize * cartridgeSize * yHeight,
          size / 16,
          (-loading.time / (loading.done * inventory[0].loadingSpeed))
          * inventory[0].magazineSize * cartridgeSize * yHeight
        )
      } else {
        context.fillRect( // filled
          c.x,
          c.y,
          size / 16,
          inventory[0].magazineSize * cartridgeSize * yHeight
        )
      }
    }
  })
  context.fillStyle = (0 < dash.coolTime) ? 'hsla(340, 100%, 50%, .7)' :
  (0 < afterglow.dashGauge) ? 'hsla(0, 100%, 100%, .7)' :
  'hsla(210, 100%, 50%, .7)' // dash guage
  if (0 < afterglow.dashGauge) afterglow.dashGauge = (afterglow.dashGauge-1)|0
  c = {x: (canvas.offsetWidth/2) - dash.limit, y: size}
  context.fillRect(c.x, c.y, (1 - dash.coolTime/dash.limit)*(dash.limit*2*size/32), size/8)
  context.fillRect(c.x, c.y, dash.limit*2*size/32, -size/32)
  context.fillStyle = (0 < afterglow.round) ? // round number
  `hsla(0, 100%, 30%, ${(1 - afterglow.round / wave.intervalLimit)*.7})` :
  (wave.interval === 0) ? 'hsla(0, 100%, 30%, .7)' :
  `hsla(0, 100%, 30%, ${(wave.interval / wave.intervalLimit)*.7})`
  if (0 < afterglow.round) afterglow.round = (afterglow.round-1)|0
  c = {x: size, y: canvas.offsetHeight - size}
  drawText(size * 1.5, 'left', wave.number, c)
}
const drawWeaponCategory = (box, i) => {
  context.fillStyle= 'hsl(0, 0%, 100%)'
  context.textAlign = 'center'
  context.font = `${size * .75}px sans-serif`
  context.fillText(inventory[i].category, box.absoluteX + size * .75, box.absoluteY + size, size * 1.25)
}
const drawWeaponDetail = (box, i) => {
  if (isInner(box, cursor)) {
    const strokeText = (text, x, y, maxWidth) => {
      context.strokeText(text, x, y, maxWidth)
      context.fillText(text, x, y, maxWidth)
    }
    context.font = `${size*.75}px sans-serif`
    context.textAlign = 'left'
    context.fillStyle = 'hsla(0, 0%, 0%, .6)'
    context.strokeStyle = 'hsl(0, 0%, 100%)'
    strokeText(inventory[i].name, cursor.offsetX + size, cursor.offsetY + size)
    if (!inventoryFlag) return
    const dictionary = {
      DAMAGE: inventory[i].damage.toFixed(0),
      'MAG. SIZE': `${inventory[i].magazineSize} * ${inventory[i].magazines.length}`
    }
    Object.keys(dictionary).forEach((v, i) => {
      strokeText(v, cursor.offsetX + size, cursor.offsetY + size * (2 + i), size * 3)
      strokeText(dictionary[v], cursor.offsetX + size * 5, cursor.offsetY + size * (2 + i), size * 3)
    })
  }

}
const drawWeaponSlot = () => {
  let box = []
  for (let i = 0; i < 3; i++) {
    box.push({absoluteX: size * (.75 + 2 * i), absoluteY: size * .5, width: size * 1.5, height: size * 1.5})
  }
  context.save()
  for (let i = 0; i < 3; i++) {
    context.fillStyle= 'hsla(210, 100%, 75%, .4)'
    context.fillRect(box[i].absoluteX, box[i].absoluteY, box[i].width, box[i].height)
    if (i < inventory.length) {
      drawWeaponCategory(box[i], i)
    }
  }
  for (let i = 0; i < 3; i++) {
    if (i < inventory.length) {
      drawWeaponDetail(box[i], i)
    }
  }
  context.restore()
}
const drawInventorySlot = () => {
  let box = [] // Draw weapon slot
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 5; j++) {
      box.push({absoluteX: size * (.75 + 2 * j), absoluteY: size * (2.75 + 2 * i), width: size * 1.5, height: size * 1.5})    }
  }
  context.save()
  box.forEach((v, i) => {
    context.fillStyle= 'hsla(210, 100%, 75%, .4)'
    context.fillRect(v.absoluteX, v.absoluteY, v.width, v.height)
    if (i + 3 < inventory.length) drawWeaponCategory(v, i + 3)
  })
  box.forEach((v, i) => {
    if (i + 3 < inventory.length) drawWeaponDetail(v, i + 3)
  })
  context.restore()
}
const drawItemSlot = () => {
  if (inventoryFlag) drawInventorySlot()
  drawWeaponSlot()
}
const inventoryProcess = () => {
  if (0 < key[action.inventory]) {
    selectedIndex = 0
    afterglow.inventory = 0
    return
  }
  const dropPosition = [
    {x: 0, y: 0},
    {x: 0, y: -size * 5.5},
    {x: size * 5.5, y: 0},
    {x: 0, y: size * 5.5},
    {x: -size * 5.5, y: 0}
  ]
  const selectedBuffer = selectedIndex
  selectedIndex = (isKeyFirst(keyMap.lookUp)) ? 1 :
  (isKeyFirst(keyMap.lookRight)) ? 2 :
  (isKeyFirst(keyMap.lookDown)) ? 3 :
  (isKeyFirst(keyMap.lookLeft)) ? 4 : selectedIndex
  const swapArray = (pressedKey, num) => {
    console.log(pressedKey)
    if (num + 1 <= inventory.length && isKeyFirst(pressedKey) && afterglow.inventory === 0) {
      if (key[action.slow].flag) {
        inventory[num].type = 'droppedWeapon'
        inventory[num].unavailableTime = 30
        inventory[num].x = ownPosition.x + dropPosition[num].x
        inventory[num].y = ownPosition.y + dropPosition[num].y
        inventory[num].life = 600
        dropItems.push(inventory.splice(num, 1)[0])
      } else {
        [inventory[0], inventory[num]] = [inventory[num], inventory[0]]
      }
      afterglow.inventory = 60
      firearm.grip = 0
      selectedIndex = 0
    }
  }
  if (selectedBuffer === 1 || key[action.slow].flag) swapArray(keyMap.lookUp, 1)
  if (selectedBuffer === 2 || key[action.slow].flag) swapArray(keyMap.lookRight, 2)
  if (selectedBuffer === 3 || key[action.slow].flag) swapArray(keyMap.lookDown, 3)
  if (selectedBuffer === 4 || key[action.slow].flag) swapArray(keyMap.lookLeft, 4)
  if (0 < afterglow.inventory) afterglow.inventory = (afterglow.inventory-1)|0
}
const setWave = () => {
  wave.number = (wave.number+1)|0
  wave.delayTime = 0
  wave.delayLimit = (wave.number === 1) ? 120 :
  (wave.delayLimit < 4.8) ? 4.8 : wave.delayLimit * .95
  wave.amount = 0
  wave.amountLimit = (wave.number === 9) ? 31 : // unconfirmed
  (wave.number === 8) ? 29 : // same on top
  (wave.number === 7) ? 28 : // same on top
  (wave.number === 6) ? 27 : // same on top
  (wave.number === 5) ? 24 :
  (wave.number === 4) ? 18 :
  (wave.number === 3) ? 13 :
  (wave.number === 2) ? 8 :
  (wave.number === 1) ? 6 :
  (.0842 * wave.number ** 2 + .1954 * wave.number + 22.05)+.5|0
  wave.hitPoint = (wave.number === 9) ? 950 :
  (wave.number === 8) ? 850 :
  (wave.number === 7) ? 750 :
  (wave.number === 6) ? 650 :
  (wave.number === 5) ? 550 :
  (wave.number === 4) ? 450 :
  (wave.number === 3) ? 350 :
  (wave.number === 2) ? 250 :
  (wave.number === 1) ? 150 : wave.hitPoint * 1.1
}
const waveProcess = () => {
  if (0 < wave.interval) {
    wave.interval = (wave.interval-1)|0
    if (1 < wave.interval) return
    else if (1 === wave.interval) {
      afterglow.round = wave.intervalLimit
      setWave()
    }
  }
  if (wave.amount < wave.amountLimit) wave.delayTime = (wave.delayTime+1)|0
  else if (enemies.length === 0) wave.interval = wave.intervalLimit
  else return
  const setEnemy = () => {
    const r =  Math.sqrt(canvas.offsetWidth ** 2 + canvas.offsetHeight ** 2) / 2
    const a = ~~(Math.random() * 360 + 1)
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
    enemies.push({
      life: wave.hitPoint+.5|0,
      x: ownPosition.x + r * Math.cos(a * (Math.PI / 180)),
      y: ownPosition.y + r * Math.sin(a * (Math.PI / 180)),
      speed: setEnemySpeed(),
      step: 0,
      stepLimit: wave.delayLimit - ~~(Math.random() * 5),
      imageID: ~~(Math.random() * enemyImageAmount)
    })
    if (wave.amount === wave.amountLimit) enemies[enemies.length-1].imageID = enemyImageAmount
  }
  if (wave.delayLimit <= wave.delayTime) {
    if (enemies.length <= 24) {
      wave.amount = (wave.amount+1)|0
      setEnemy()
    }
    wave.delayTime = 0
  }
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
const setStore = () => {
  const offset = {x: canvas.offsetWidth / 2, y: canvas.offsetHeight / 2}
  const Spot = class {
    constructor(dx, dy, w, h, Id, img) {
      this.x = offset.x + dx
      this.y = offset.y + dy
      this.w = storeSize * w
      this.h = storeSize * h
      this.Id = Id
      this.img = img
    }
    process() {}
    draw() {}
  }
  const box = {
    absoluteX: canvas.offsetWidth / 2 - 50,
    absoluteY: 100,
    width: 100,
    height: 40,
    text: 'START'
  }
  class StartSpot extends Spot {
    process() {
      if ((
        this.x <= ownPosition.x && ownPosition.x <= this.x + this.w) && (
        this.y <= ownPosition.y && ownPosition.y <= this.y + this.h)
      ) {
        if (button(box)) {
          location = locationList[1]
          objects = []
        }
      }
    }
    draw() {
      if ((
        this.x <= ownPosition.x && ownPosition.x <= this.x + this.w) && (
        this.y <= ownPosition.y && ownPosition.y <= this.y + this.h)
      ) {
        context.save()
        context.fillStyle = 'hsl(30, 100%, 70%)'
        context.fillRect(box.absoluteX - 10, box.absoluteY, box.width + 20, box.height)
        context.textAlign = 'left'
        context.textBaseline = 'top'
        context.fillStyle = 'hsl(210, 100%, 70%)'
        context.fillText(box.text, box.absoluteX, box.absoluteY)
        context.restore()
      }
    }
  }
  objects.push(new Spot(-size * 7, size, 1, 1, 0, 'images/st2v1.png'))
  objects.push(new Spot(size * 4, size, 1, 1, 1, 'images/st1v2.png'))
  objects.push(new StartSpot(-size * 3, -size * 10, 1.25, 1.25, 2, 'images/stv1.png'))

}
const upgradeDash =() => {
  if (holdTimeLimit <= key[action.lookUp].holdtime && cost.dashDamage <= ammo) {
    cost.dashDamageIndex = (cost.dashDamageIndex+1)|0
    dash.damage = dash.damage + dash.damage * (1 / cost.dashDamageIndex)
    ammo = (ammo - cost.dashDamage)|0
    cost.dashDamage = (cost.dashDamage*2)|0
    afterglow.dashDamage = holdTimeLimit
  } else if (0 < afterglow.dashDamage) afterglow.dashDamage = (afterglow.dashDamage-1)|0
  if (holdTimeLimit <= key[action.lookRight].holdtime && cost.dashDistance <= point) {
    dash.decrease = dash.decrease*.85
    point = (point - cost.dashDistance)|0
    cost.dashDistance = (cost.dashDistance*2)|0
    cost.dashDistanceIndex = (cost.dashDistanceIndex+1)|0
    afterglow.dashDistance = holdTimeLimit
  } else if (0 < afterglow.dashDistance) afterglow.dashDistance = (afterglow.dashDistance-1)|0
  if (holdTimeLimit <= key[action.lookDown].holdtime && cost.dashCooltime <= point) {
    dash.limit = dash.limit * .95
    point = (point - cost.dashCooltime)|0
    cost.dashCooltime = (cost.dashCooltime+cost.dashCooltime*2)|0
    cost.dashCooltimeIndex = (cost.dashCooltimeIndex+1)|0
    afterglow.dashCooltime = holdTimeLimit
  } else if (0 < afterglow.dashCooltime) afterglow.dashCooltime = (afterglow.dashCooltime-1)|0
  if (holdTimeLimit <= key[action.lookLeft].holdtime && cost.dashDistance <= point) {
    dash.breakthrough = dash.breakthrough * 1.05
    point = (point - cost.dashDistance)|0
    cost.dashDistance = (cost.dashDistance*2)|0
    cost.dashSpeedIndex = (cost.dashSpeedIndex+1)|0
    afterglow.dashSpeed = holdTimeLimit
  } else if (0 < afterglow.dashSpeed) afterglow.dashSpeed = (afterglow.dashSpeed-1)|0
}
const upgradeExplosive = () => {
  if (holdTimeLimit <= key[action.lookDown].holdtime && inventory[0].explosive3 <= ammo) {
    homingFlag = false
    explosive1Flag = false
    explosive2Flag = false
    explosive3Flag = !explosive3Flag
    ammo = (ammo - inventory[0].explosive3)|0
    afterglow.explosive3 = holdTimeLimit
  } else if (0 < afterglow.explosive3) afterglow.explosive3 = (afterglow.explosive3-1)|0
}
const upgradeTest = () => {
  if (holdTimeLimit <= key[action.lookRight].holdtime && cost.clone <= point) {
    cloneFlag = true
    point = (point - cost.clone)|0
    cost.clone = (cost.clone * 2)|0
    afterglow.clone = holdTimeLimit
  } else if (0 < afterglow.clone) afterglow.clone = (afterglow.clone-1)|0
}
const upgradeLimitBreak = () => {
  if (holdTimeLimit <= key[action.lookUp].holdtime && inventory[0].limitBreak <= point) {
    afterglow.limitBreakResult = .1 + Math.random() * 1.9
    inventory[0].damage = inventory[0].damage * afterglow.limitBreakResult
    point = (point - inventory[0].limitBreak)|0
    inventory[0].limitBreakIndex = (inventory[0].limitBreakIndex+1)|0
    if (1 < afterglow.limitBreakResult) afterglow.limitBreakSuccess = holdTimeLimit
    else afterglow.limitBreakFailed = holdTimeLimit
  } else if (0 < afterglow.limitBreakSuccess) {
    afterglow.limitBreakSuccess = afterglow.limitBreakSuccess - .1
  } else if (0 < afterglow.limitBreakFailed) {
    afterglow.limitBreakFailed = afterglow.limitBreakFailed - .1
  }
}
const upgradeClone = ()  => {
  if (holdTimeLimit <= key[action.lookUp].holdtime) {
    cloneDashType1Flag = !cloneDashType1Flag
    cloneDashType2Flag = false
    cloneDashType3Flag = false
    afterglow.explosive1 = holdTimeLimit
  } else if (0 < afterglow.explosive1) afterglow.explosive1 = (afterglow.explosive1-1)|0
  if (holdTimeLimit <= key[action.lookRight].holdtime) {
    cloneDashType1Flag = false
    cloneDashType2Flag = !cloneDashType2Flag
    cloneDashType3Flag = false
    afterglow.explosive2 = holdTimeLimit
  } else if (0 < afterglow.explosive2) afterglow.explosive2 = (afterglow.explosive2-1)|0
  if (holdTimeLimit <= key[action.lookDown].holdtime) {
    cloneDashType1Flag = false
    cloneDashType2Flag = false
    cloneDashType3Flag = !cloneDashType3Flag
    afterglow.explosive3 = holdTimeLimit
  } else if (0 < afterglow.explosive3) afterglow.explosive3 = (afterglow.explosive3-1)|0
  if (holdTimeLimit <= key[action.lookLeft].holdtime) {
    cloneReturnFlag = !cloneReturnFlag
    afterglow.explosiveRange = holdTimeLimit
  } else if (
    0 < afterglow.explosiveRange
  ) afterglow.explosiveRange = (afterglow.explosiveRange-1)|0
}
const storeProcess = () => {
  objects.forEach(object => {
    object.process()
  })
}
const drawStore = () => {
  context.font = `${size}px sans-serif`
  objects.forEach(object => { // only rectangle
    context.fillStyle = 'hsla(30, 100%, 70%)'
    if (
      object.x < ownPosition.x - canvas.offsetWidth/2 - object.w &&
      object.y < ownPosition.y - canvas.offsetHeight/2
    ) context.fillRect(0, 0, size, size) // left & top
    else if (object.x < ownPosition.x - canvas.offsetWidth/2 - object.w &&
      ownPosition.y + canvas.offsetHeight/2 - object.h < object.y)
    { // left & bottom
      context.fillRect(0, canvas.offsetHeight, size, size)
    } else if (ownPosition.x + canvas.offsetWidth/2 < object.x &&
      object.y < ownPosition.y - canvas.offsetHeight/2) { // right & top
      context.fillRect(canvas.offsetWidth - size, 0, size, size)
    } else if (ownPosition.x + canvas.offsetWidth/2 < object.x &&
      ownPosition.y + canvas.offsetHeight/2 < object.y) { // right & bottom
      context.fillRect(canvas.offsetWidth - size, canvas.offsetHeight - size, size, size)
    } else if (object.x < ownPosition.x - canvas.offsetWidth/2 - object.w) { // out of left
      context.fillRect(0, relativeY(object.y + object.h/2 - size), size, size)
    } else if (ownPosition.x + canvas.offsetWidth/2 < object.x) { // out of right
      context.fillRect(canvas.offsetWidth - size, relativeY(object.y + object.h/2 - size), size, size)
    } else if (object.y < ownPosition.y - canvas.offsetHeight/2 - object.h) { // out of top
      context.fillRect(relativeX(object.x + object.w/2), 0, size, size)
    } else if (ownPosition.y + canvas.offsetHeight/2 < object.y) { // out of bottom
      context.fillRect(relativeX(object.x + object.w/2), canvas.offsetHeight- size, size, size)
    } else {
      context.drawImage(loadedMap[object.img], ~~(relativeX(object.x)+.5), ~~(relativeY(object.y)+.5))
    }
    object.draw()
  })
}
const drawObjects = () => {
  if (!mapMode) drawStore()
  else {
    context.fillStyle = (mapMode) ? 'hsl(0, 0%, 50%)' : 'hsla(30, 100%, 85%)'
    objects.forEach((object) => {
      context.fillRect(relativeX(object.x), relativeY(object.y), object.width, object.height)
    })
  }
}
const relativeX = (arg) => {
  return canvas.offsetWidth / 2 - ownPosition.x + recoilEffect.dx * (afterglow.recoil/recoilEffect.flame) + arg
}
const relativeY = (arg) => {
  return canvas.offsetHeight / 2 - ownPosition.y + recoilEffect.dy * (afterglow.recoil/recoilEffect.flame) + arg
}
const command = () => {
  let bool = false
  let counter = 0
  return () => {
    if (counter % 2 === 0 && key[action.lookUp].flag && key[action.up].flag) counter += 1
    else if (
      counter % 2 === 1 && key[action.lookUp].flag && key[action.down].flag) counter += 1
    if (counter === 5) {
      bool = true
    }
    if (state === 'result') {
      bool = false
      counter = 0
    }
    return bool
  }
}; const manyAmmo = command()
const reset = () => {
  state = 'title'
  location = locationList[0]
  objects = []
  setStore()
  // if (mapMode) setMap()

  point = 500
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
  ownStep = 0
  dropItems = []
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
  dash = {
    attackFlag: false,
    breakthrough: 10,
    coolTime: 0,
    damage: 150,
    decrease: 10,
    limit: 150
  }
  inventoryFlag = false
  inventory = [
    new Weapon(
      'INITIAL',
      'HG',
      maxDamageInitial,
      maxDamageInitial,
      slide.weight,
      cartridgeInfo.speed,
      cartridgeInfo.life,
      cartridgeInfo.life,
      reload.weight,
      reload.weight,
      magSizeInitial,
      Array(2).fill(magSizeInitial),
      loading. weight,
      0,

      4000,
      0
    ), new Weapon(
      'INITIAL',
      'HG',
      maxDamageInitial,
      maxDamageInitial,
      slide.weight,
      cartridgeInfo.speed,
      cartridgeInfo.life,
      cartridgeInfo.life,
      reload.weight,
      reload.weight,
      magSizeInitial,
      Array(2).fill(magSizeInitial),
      loading. weight,
      0,

      4000,
      0
    ), new Weapon(
      'INITIAL',
      'HG',
      maxDamageInitial,
      maxDamageInitial,
      slide.weight,
      cartridgeInfo.speed,
      cartridgeInfo.life,
      cartridgeInfo.life,
      reload.weight,
      reload.weight,
      magSizeInitial,
      Array(2).fill(magSizeInitial),
      loading. weight,
      0,

      4000,
      0
    )
  ]
  selectedIndex = 0
  firearm = {
    chamberFlag: false,
    gripFlag: false,
    grip: 1
  }
  ammo = 24
  loading = {
    time: 0,
    takeOut: 15,
    takeOutFlag: false,
    done: 60,
    weight: 1
  }
  reload.time = reload.putAway * inventory[0].reloadSpeed
  reload.cancelFlag = false
  reload.prepareFlag = (reload.auto === 'ON') ? false : true,
  slide = {
    time: 0,
    stop: 18,
    done: 7,
    state: 'done',
    weight: 1
  }
  slide.time = slide.stop
  combatReload.flag = false
  combatReload.magFlag = false
  combatReload.weight = (combatReload.auto === 'ON') ? 8 : 4
  afterglow.point = []
  afterglow.round = wave.intervalLimit
  wave.number = 0
  wave.delayTime = 0
  wave.delayLimit = 0
  wave.amount = 0
  wave.amountLimit = 0
  setWave()
  wave.interval = 0
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
    key.q.isFirst()) ? 0 :
    (key.w.isFirst()) ? 1 :
    (key.e.isFirst()) ? 2 :
    (key.r.isFirst()) ? 3 :
    (key.t.isFirst()) ? 4 :
    (key.y.isFirst()) ? 5 :
    (key.u.isFirst()) ? 6 :
    (key.i.isFirst()) ? 7 :
    (key.o.isFirst()) ? 8 :
    (key.p.isFirst()) ? 9 :
    (key.a.isFirst()) ? 10 :
    (key.s.isFirst()) ? 11 :
    (key.d.isFirst()) ? 12 :
    (key.f.isFirst()) ? 13 :
    (key.g.isFirst()) ? 14 :
    (key.h.isFirst()) ? 15 :
    (key.j.isFirst()) ? 16 :
    (key.k.isFirst()) ? 17 :
    (key.l.isFirst()) ? 18 :
    (key.z.isFirst()) ? 20 :
    (key.x.isFirst()) ? 21 :
    (key.c.isFirst()) ? 22 :
    (key.v.isFirst()) ? 23 :
    (key.b.isFirst()) ? 24 :
    (key.n.isFirst()) ? 25 :
    (key.m.isFirst()) ? 26 :
    (key.Shift.isFirst()) ? 30 :
    (key[' '].isFirst()) ? 31 : -2
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
    if (key[action.down].isFirst()) {
      if (num === array.slice(-1)[0]) num = array[0]
      else num = (num+1)|0
    } else if (key[action.up].isFirst()) {
      if (num === array[0]) num = array.slice(-1)[0]
      else num = (num-1)|0
    }
    return num
  }
}; const rotate = menuColumn()
let rowPosition = 0
let keyPosition = -2

const titleProcess = () => {
  if (key[action.fire].isFirst() || button(titleMenuWordArray[0])) {
    reset()
    if (manyAmmo()) {
      inventory[0].magazines = [99, inventory[0].magazineSize]
      point = 999999
      ammo = 99999
    }
    state = 'main'
  }
  if (key[action.slow].isFirst() || button(titleMenuWordArray[1])) {
    input()
    state = 'keyLayout'
  }
  if (key[action.change].isFirst() || button(titleMenuWordArray[2])) {
    mapMode = !mapMode
    setTitleMenuWord()
  }
}
const combatProcess = () => {
  if (!firearm.chamberFlag) slideProcess()
  waveProcess()
  if (0 < enemies.length) enemyProcess()
  bullets.forEach((bullet, i) => {
    bullet.update()
    if (bullet.life < 0) bullets.splice(i, 1)
  })
  if (0 < dropItems.length) dropItemProcess()
  if (cloneFlag) cloneProcess()
  if (0 < moreAwayCount) moreAwayCount = (moreAwayCount-1)|0
  else if (reviveFlag) {
    cloneFlag = false
    clonePosition = []
    reviveFlag = false
  }
}
const mainProcess = () => {
  interfaceProcess()
  if (direction !== 0) direction = 0
  if (angle !== 0) angle = 0
  if (inventoryFlag) inventoryProcess()

  if (location === locationList[0]) storeProcess()
  else if (location === locationList[1]) combatProcess()
}
const pauseProcess = () => {
  if (key[action.pause].isFirst()) state = 'main'
}
const resultProcess = () => {
  manyAmmo()
  if (key[action.back].isFirst()) reset()
}
const keyLayoutProcess = () => {
  rowPosition = rotate()
  keyPosition = input()
  if (keyPosition === order.indexOf('w') && holdTimeLimit <= key.w.holdtime &&
    !(Object.values(action).some(x => x === 'w' || x === 'a'))) {
    operationMode = setStorage('operation', 'WASD')
    setOperation()
  }
  if (keyPosition === order.indexOf('e') && holdTimeLimit <= key.e.holdtime &&
    !(Object.values(action).some(x => x === 'e' || x === 'f'))) {
    operationMode = setStorage('operation', 'ESDF')
    setOperation()
  }
  if (rowPosition === 0 && (key[action.left].isFirst() || key[action.right].isFirst())) {
    reload.auto = (reload.auto === 'ON') ? setStorage('autoReload', 'OFF') :
    setStorage('autoReload', 'ON')
  }
  if (rowPosition === 1 && (key[action.left].isFirst() || key[action.right].isFirst())) {
    combatReload.auto = (combatReload.auto === 'ON') ? setStorage('autoCombatReload', 'OFF') :
    setStorage('autoCombatReload', 'ON')
  }
  if (
    keyPosition === order.indexOf(action.back) && holdTimeLimit <= key[action.back].holdtime
  ) state = 'title'
}
const main = () => setInterval(() => {
  frameCounter(internalFrameList)
  intervalDiffTime = globalTimestamp - currentTime
  if (100 < intervalDiffTime) intervalDiffTime = 0
  currentTime = globalTimestamp
  if (state === 'title') titleProcess()
  else if (state === 'main') mainProcess()
  else if (state === 'pause') pauseProcess()
  else if (state === 'result') resultProcess()
  else if (state === 'keyLayout') keyLayoutProcess()
}, 0)
const drawTitleScreen = () => {
  let nowTime = Date.now()
  let ss = ('0' + ~~(nowTime % 6e4 / 1e3)).slice(-2)
  let ms = ('0' + ~~(nowTime % 1e3)).slice(-3)
  context.drawImage(
    loadedMap['images/ROGOv1.2.png'],
    ~~(((canvas.offsetWidth-loadedMap['images/ROGOv1.2.png'].width) / 2)+.5), ~~(size*4+.5))

  context.save()
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.font = `${size}px sans-serif`

  titleMenuWordArray.forEach(v => {
    // text highlight
    if (isInner(v, cursor)) {
      context.fillStyle = `hsl(${v.hue}, 50%, 75%)`
      context.fillRect(v.absoluteX, v.absoluteY, v.width, v.height)
    }
    context.fillStyle = `hsl(${v.hue}, 50%, 50%)`
    context.fillText(v.text, v.offsetX, v.offsetY)

  })
  context.restore()

  context.textAlign = 'right'
  context.fillStyle = (manyAmmo()) ? 'hsla(0, 0%, 0%, .75)' : 'hsla(30, 100%, 40%, .75)'
  context.fillText(version, canvas.offsetWidth - size, canvas.offsetHeight - size)
  const c = {x: size, y: canvas.offsetHeight - size*.9}
  const drawCharacter = (image, cooldinateX, cooldinateY) => {
    context.save()
    context.scale(2, 2)
    context.drawImage(loadedMap[image], ~~((cooldinateX / 2)+.5), ~~((cooldinateY / 2)+.5))
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
}
const drawMain = () => {
  drawField()
  if (0 < objects.length) drawObjects()
  if (0 < clonePosition.length) drawClone()
  if (0 < bullets.length) drawBullets()
  if (0 < enemies.length) drawEnemies()
  if (0 < dropItems.length) drawDropItems()
  drawMyself()
  drawDirection()
  drawIndicator()
  drawItemSlot()
  if (0 < afterglow.recoil) afterglow.recoil = (afterglow.recoil-1)|0
  if (0 < afterglow.reload) afterglow.reload = (afterglow.reload-1)|0
  if (state === 'pause') drawPause()
}
const drawPause = () => {
  let nowTime = Date.now()
  let ss = ('0' + ~~(nowTime % 6e4 / 1e3)).slice(-2)
  let ms = ('0' + ~~(nowTime % 1e3)).slice(-3)
  context.save()
  context.font = '32px sans-serif'
  context.fillStyle = (ss % 3 === 2) ? `hsl(60, ${100 * (1 - (ms / 1e3))}%, 40%)` :
  (ss % 3 === 1) ? 'hsl(60, 100%, 40%)' :
  `hsl(60, ${100 * (ms / 1e3)}%, 40%)`
  context.textAlign = 'center'
  context.fillText('PAUSE', canvas.offsetWidth / 2, canvas.offsetHeight / 4 + size)
  context.restore()
}
const drawResult = () => {
  context.font = '32px sans-serif'
  context.fillStyle = 'hsl(0, 100%, 40%)'
  context.textAlign = 'center'
  context.fillText('YOU WERE DRUNK', canvas.offsetWidth / 2, canvas.offsetHeight / 4 + size)
  context.font = '24px sans-serif'
  context.fillStyle = 'hsl(30, 100%, 40%)'
  context.fillText(
    `YOU SATISFIED ${defeatCount} GIRLS`, canvas.offsetWidth / 2, canvas.offsetHeight / 6
  )
  context.fillText(
    `BACK TO TITLE[${getKeyName(action.back)}]`,
    canvas.offsetWidth / 2, canvas.offsetHeight * 7/ 8
  )
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
    loadedMap[imgCutin],
    ~~((canvas.offsetWidth / 6 - loadedMap[imgCutin].width / 2)+.5),
    ~~((canvas.offsetHeight / 6 - loadedMap[imgCutin].height / 2)+.5)
  )
  context.restore()
  context.font = '32px sans-serif'
  context.fillStyle = 'hsl(300, 100%, 50%)'
  context.fillText('カットイン(仮)', size*5, canvas.offsetHeight / 2)
}
const drawKeyLayout = () => {
  console.log('a')
  // resetScreen()
  const nowTime = Date.now()
  const ss = ('0' + ~~(nowTime % 6e4 / 1e3)).slice(-2)
  const ms = ('0' + ~~(nowTime % 1e3)).slice(-3)
  context.font = `${size * .65}px sans-serif`
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
  context.font = `bold ${size * .5}px sans-serif`
  context.fillText('＜', p.x - size * 1.4, p.y + size * rowPosition - size/16)
  context.fillText('＞', p.x + size * 1.4, p.y + size * rowPosition - size/16)
  context.fillStyle = 'hsl(210, 100%, 40%)'
  context.font = `${size * .65}px sans-serif`
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
  context.fillText(reload.auto, p.x, p.y)
  context.fillText(combatReload.auto, p.x, p.y + size)
  p.x = p.x + size * 2
  context.font = `${size * .65}px sans-serif`
  context.textAlign = 'left'
  context.fillStyle = 'hsla(280, 100%, 50%, .5)'
  const text = (action.up === 'w') ? '[HOLD "E"]' : '[HOLD "W"]'
  context.fillText(text, p.x, p.y - size * 2)
  context.font = `${size*2}px sans-serif`
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
      action.up === 'e' && key.w.flag && key.w.holdtime < holdTimeLimit) &&
      i === order.indexOf('w') &&
      keyPosition === order.indexOf('w') || keyPosition === order.indexOf('e') &&
      (action.up === 'w' && key.e.flag && key.e.holdtime < holdTimeLimit) &&
      i === order.indexOf('e')
    ) {
      flag = true
      const time = (action.up === 'e') ? key.w.flag : key.e.flag
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
      context.font = (ss % 2 === 0) ? `${size * (2 - .1 * (1 - (ms / 1e3)))}px sans-serif` :
      `${size * (2 - .1 * (ms / 1e3))}px sans-serif`
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
    context.font = `${size}px sans-serif`
    if (i === order.indexOf('f') || i === order.indexOf('j')) {
      context.fillStyle = 'hsla(210, 100%, 40%, .3)'
      context.fillText('_', p.x, p.y)
    }
    context.restore()
    context.save()
    p.y = p.y - size / 6
    context.font = `bold ${size}px sans-serif`
    context.fillStyle = 'hsl(210, 100%, 40%)'
    if (i === order.indexOf(action.up)) context.fillText('↑', p.x, p.y)
    else if (i === order.indexOf(action.right)) context.fillText('→', p.x, p.y)
    else if (i === order.indexOf(action.down)) context.fillText('↓', p.x, p.y)
    else if (i === order.indexOf(action.left)) context.fillText('←', p.x, p.y)
    else if (i === order.indexOf(action.lookUp)) context.fillText('∧', p.x, p.y)
    else if (i === order.indexOf(action.lookRight)) context.fillText('>', p.x, p.y)
    else if (i === order.indexOf(action.lookDown)) context.fillText('∨', p.x, p.y)
    else if (i === order.indexOf(action.lookLeft)) context.fillText('<', p.x, p.y)
    p.y = p.y - size / 6
    context.font = `bold ${size / 2}px sans-serif`
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
    context.font = `bold ${size / 3}px sans-serif`
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
  context.font = `${size}px sans-serif`
  context.textAlign = 'left'
  context.fillText('KEY LAYOUT EDITOR', size, size * 1.75)
  context.textAlign = 'right'
  context.fillStyle = (
      keyPosition === order.indexOf(action.back) && !key[action.back].flag
    ) ? 'hsla(0, 0%, 35%, .3)' : 'hsla(340, 100%, 35%, .6)'
  context.fillText(
    `[HOLD "${getKeyName(action.back)}"] TO TITLE`,
    canvas.offsetWidth - size, canvas.offsetHeight - size
  )
  if (keyPosition === order.indexOf(action.back)) {
    context.fillRect(
      canvas.offsetWidth - size * 11.5, canvas.offsetHeight - size,
      size * 10.6 * key[action.back].holdtime / holdTimeLimit, size * .2
    )
  }
}
const drawDebug = () => {
  context.textAlign = 'right'
  context.font = `${size / 2}px sans-serif`
  const num = bullets.length ? bullets[0].life|0 : 0
  const dictionary = {
    'player(x, y)': `${ownPosition.x|0} ${ownPosition.y|0}`,
    'cursor(x, y)': `${cursor.offsetX} ${cursor.offsetY}`,
    internalFps: internalFrameList.length - 1,
    screenFps: animationFrameList.length - 1,
    bulletLife: num,
    a: isInner(titleMenuWordArray[2], mouseDownPos),
    b: isInner(titleMenuWordArray[2], mouseUpPos),
    c: isMouseUp(),
  }
  Object.keys(dictionary).forEach((v, i) => {
    context.fillText(`${v}:`, canvas.width - size / 2 * 5, size / 2 * (i + 1))
    context.fillText(dictionary[v], canvas.width, size / 2 * (i + 1))
  })
}
const draw = () => {
  requestAnimationFrame(draw)
  frameCounter(animationFrameList)
  context.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
  if (state === 'title') drawTitleScreen()
  else if (state !== 'keyLayout') drawMain()
  if (state === 'pause') drawPause()
  else if (state === 'result') drawResult()
  else if (state === 'keyLayout') drawKeyLayout()
  drawDebug()
}

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
let loadedList = []
let loadedMap = []
imagePathList.forEach(path => {
  const imgPreload = new Image()
  imgPreload.src = path
  imgPreload.onload = function () {
    loadedList.push(path)
    loadedMap[path] = imgPreload
  }
})
const timerId = setInterval(() => { // loading monitoring
  if (loadedList.length === imagePathList.length) { // untrustworthy length in associative
    clearInterval(timerId)
    main()
    draw()
  }
}, 100)