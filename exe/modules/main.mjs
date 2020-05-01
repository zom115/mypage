import {key} from '../../modules/key.mjs'
const canvas = document.getElementById`canvas`
const context = canvas.getContext`2d`
context.textAlign = 'center'
const size = 16
let field
const setField = () => {
  field = []
  const row = [0, 0, 0, 1, 1, 1]
  for (let i = 0; i < 3; i++) {field.unshift(row.concat())}
}
setField()
let ownState = {
  x: 1, y: 1, moveWeight: 0, weightFrame: 12, charge: 0, chargeLimit: 60,
  shotWeight: 0, shotWeightFrame: 9, shotEffect: 0, shotEffectConst: 5,
  flag: false, effect: 30
}
let enemies = [{
  x: 4, y: 0, state: 'guard', time: 0, guardWeight: 150, weight: 60, hitPoint: 120
}]
let shockWaves = []
const move = () => {
  if (ownState.moveWeight !== 0) return ownState.moveWeight -= 1
  const direction = key.a.flag ? {x:-1, y: 0}
  : key.d.flag ? {x: 1, y: 0}
  : key.s.flag ? {x: 0, y: 1}
  : key.w.flag ? {x: 0, y: -1} : 0
  if (direction === 0) return
  if (field[ownState.y + direction.y] === undefined) {
  } else if (field[ownState.y + direction.y][ownState.x + direction.x] === 0) {
    ownState.x += direction.x
    ownState.y += direction.y
    ownState.moveWeight = ownState.weightFrame
  }
}
const shot = () => {
  if (0 < ownState.shotWeight) ownState.shotWeight -= 1
  if (0 < ownState.shotEffect) ownState.shotEffect -= 1
  if (key.j.flag && ownState.shotWeight === 0) {
    if (ownState.charge < ownState.chargeLimit) ownState.charge += 1
  } else if (ownState.charge !== 0) {
    enemies.forEach(e => {
      if (e.y === ownState.y && e.state !== 'guard') {
        if (ownState.charge === ownState.chargeLimit) e.hitPoint -= 10
        else e.hitPoint -= 1
      }
    })
    ownState.shotWeight = ownState.shotWeightFrame
    ownState.charge = 0
    ownState.shotEffect = ownState.shotEffectConst
  }
}
const enemyProcess = () => {
  enemies.forEach((e, i) => {
    if (e.hitPoint <= 0) {
      enemies.splice(i, 1)
    }
    e.time += 1
    if (e.time === e.guardWeight) {
      e.state = 'move'
      e.time = 0
    }
    if (e.state === 'move') {
      if (e.y === ownState.y) {
        if (e.time === e.weight) {
          e.state = 'attack'
          shockWaves.push({x: e.x - 1, y: e.y, time: 0, weight: 20})
          e.time = 0
        }
      } else if (e.y < ownState.y && e.time === e.weight) {
        e.y += 1
        e.time = 0
      }else if (ownState.y < e.y && e.time === e.weight) {
        e.y -= 1
        e.time = 0
      }
    }
    if (e.state === 'attack') {
      if (e.time === e.weight) e.state = 'guard'
    }
  })
  shockWaves.forEach((s, i) => {
    s.time += 1
    if (s.time === s.weight) {
      s.x -= 1
      s.time = 0
    }
    if (s.x === ownState.x && s.y === ownState.y) { // collisionDetect
      ownState.flag = true
    }
    if (s.x < 0) shockWaves.splice(i, 1)
  })
}
const draw = () => {
  context.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
  const cellSize = {x: size * 8, y: size * 5}
  const offset = {x: size * 3.25, y: size * 10}
  field.forEach((y, iY) => {
    y.forEach((x, iX) => {
      if (x === 0) context.strokeStyle = 'hsl(0, 100%, 50%)'
      else if (x === 1) context.strokeStyle = 'hsl(220, 100%, 50%)'
      context.strokeRect(
        offset.x + cellSize.x * iX,
        offset.y + cellSize.y * iY + size * 2,
        cellSize.x - size,
        cellSize.y - size
      )
    })
  })
  enemies.forEach(e => {
    context.fillStyle = e.state === 'guard' ? 'hsl(60, 100%, 25%)'
    : e.state === 'attack' ? 'hsl(60, 100%, 90%)'
    : 'hsl(60, 100%, 50%)'
    context.fillRect(
      offset.x + cellSize.x * e.x + size * 1.5,
      offset.y + cellSize.y * e.y + size,
      cellSize.x - size * 4,
      size * 4
    )
    context.fillStyle = 'hsl(0, 0%, 100%)'
    context.font = `${size * 2}px sans-serif`
    context.fillText(
      e.hitPoint,
      offset.x + cellSize.x * e.x + size * 3.5,
      offset.y + cellSize.y * e.y + size * 6.75,
      cellSize.x - size * 4,
      size * 4
    )
  })
  shockWaves.forEach(s => {
    context.fillStyle = 'hsl(0, 0%, 100%)'
    context.fillRect(
      offset.x + cellSize.x * s.x + size * 1.5,
      offset.y + cellSize.y * s.y + size,
      cellSize.x - size * 4,
      size * 4
    )
  })
  if (ownState.flag) {
    context.fillStyle = 'hsl(220, 100%, 50%)'
    ownState.effect += 1
    context.font = `${size * 8}px sans-serif`
    context.fillText(
      '◎',
      offset.x + cellSize.x * ownState.x + size * 1.5 + ownState.effect * 4,
      offset.y + cellSize.y * ownState.y + size * 3
    )
    context.fillText(
      '◎',
      offset.x + cellSize.x * ownState.x + size * 1.5 - ownState.effect * 4,
      offset.y + cellSize.y * ownState.y + size * 3
    )
    context.fillText(
      '◎',
      offset.x + cellSize.x * ownState.x + size * 1.5,
      offset.y + cellSize.y * ownState.y + size * 3 + ownState.effect * 4
    )
    context.fillText(
      '◎',
      offset.x + cellSize.x * ownState.x + size * 1.5,
      offset.y + cellSize.y * ownState.y + size * 3 - ownState.effect * 4
    )
    context.fillText(
      '◎',
      offset.x + cellSize.x * ownState.x + size * 1.5 - ownState.effect * 2.8,
      offset.y + cellSize.y * ownState.y + size * 3 - ownState.effect * 2.8
    )
    context.fillText(
      '◎',
      offset.x + cellSize.x * ownState.x + size * 1.5 + ownState.effect * 2.8,
      offset.y + cellSize.y * ownState.y + size * 3 - ownState.effect * 2.8
    )
    context.fillText(
      '◎',
      offset.x + cellSize.x * ownState.x + size * 1.5 - ownState.effect * 2.8,
      offset.y + cellSize.y * ownState.y + size * 3 + ownState.effect * 2.8
    )
    context.fillText(
      '◎',
      offset.x + cellSize.x * ownState.x + size * 1.5 + ownState.effect * 2.8,
      offset.y + cellSize.y * ownState.y + size * 3 + ownState.effect * 2.8
    )
    const after = 60
    if (after / 2 < ownState.effect) {
      context.fillText(
        '◎',
        offset.x + cellSize.x * ownState.x + size * 1.5 + ownState.effect * 3 - after,
        offset.y + cellSize.y * ownState.y + size * 3
      )
      context.fillText(
        '◎',
        offset.x + cellSize.x * ownState.x + size * 1.5 - ownState.effect * 3 + after,
        offset.y + cellSize.y * ownState.y + size * 3
      )
      context.fillText(
        '◎',
        offset.x + cellSize.x * ownState.x + size * 1.5,
        offset.y + cellSize.y * ownState.y + size * 3 + ownState.effect * 3 - after
      )
      context.fillText(
        '◎',
        offset.x + cellSize.x * ownState.x + size * 1.5,
        offset.y + cellSize.y * ownState.y + size * 3 - ownState.effect * 3 + after
      )
    }
  } else {
    context.fillStyle = 0 < ownState.charge
    ? `hsl(220, 100%, ${50 + (ownState.charge / ownState.chargeLimit) * 30}%)`
    : 0 < ownState.shotEffect ? 'hsl(220, 100%, 80%)' : 'hsl(220, 100%, 50%)'
    context.fillRect(
      offset.x + cellSize.x * ownState.x + size * 1.5,
      offset.y + cellSize.y * ownState.y - size * 1.5,
      size * 4,
      size * 6.5
    )
  }
}
const main = () => {
  if (!ownState.flag) {
    move()
    shot()
  }
  enemyProcess()
  draw()
  window.requestAnimationFrame(main)
}
main()