import {key} from '../../../modules/key.mjs'
import {mapLoader} from './mapLoader.mjs'
let mapObject = {}
let layerObject = {}
const internalFrameList = []
const animationFrameList = []
const frameCounter = list => {
  const now = Date.now()
  list.push(now)
  let flag = true
  do {
    if (list[0] + 1e3 < now) list.shift()
    else flag = false
  } while (flag)
}
let currentTime = Date.now()
let globalElapsedTime = 1
const canvas = document.getElementById`canvas`
const context = canvas.getContext`2d`
const size = 16
const terrainList = [
  [[0, 0], [1, 0], [1, 1], [0, 1],], // rectangle
  [[0, 0], [1, 0]], // platform
  [[1, 0], [1, 1], [0, 1],], // triangle
  [[1, .5], [1, 1], [0, 1],], // 22.5 low
  [[0, .5], [1, 0], [1, 1], [0, 1],], // 22.5 high
  [[0, .5], [1, .5], [1, 1], [0, 1],], // harf rectangle
  [[1, 0], [1, .5], [0, .5],], // 22.5 harf
]
const terrainObject = {'0': [[]],}
const orgRound = (value, base) => {
  return Math.round(value * base) / base
}
const inversionTerrain = array => {
  const terrain = JSON.parse(JSON.stringify(array))
  terrain.forEach(v => {
    v[0] = orgRound(1 - v[0], 10)
  })
  terrain.reverse() // 線分の向きを揃える
  return terrain
}
const rotationTerrain = array => {
  const terrain = JSON.parse(JSON.stringify(array))
  terrain.forEach(v => {
    v[0] -= .5
    v[1] -= .5
    ;[v[0], v[1]] = [
      orgRound(v[0] * Math.cos(Math.PI / 2) - v[1] * Math.sin(Math.PI / 2), 10),
      orgRound(v[0] * Math.sin(Math.PI / 2) + v[1] * Math.cos(Math.PI / 2), 10),]
    v[0] += .5
    v[1] += .5
  })
  return terrain
}
let id = 1
terrainList.forEach(v => {
  for (let i = 0; i < 4; i++) {
    if (i === 0) {
      terrainObject[id] = JSON.parse(JSON.stringify(v))
    } else terrainObject[id] = rotationTerrain(terrainObject[id - 2])
    id++
    terrainObject[id] = inversionTerrain(terrainObject[id - 1])
    id++
  }
})
const testObject = {
  data: [],
  height: 1,
  width: 16,
}
Object.keys(terrainObject).forEach((v, i) => {
  if (i % 8 === 1) {
    for (let index = 0; index < 8; index++) testObject.data.push('0')
    testObject.height += 1
  }
  if (i === 0) for (let index = 0; index < 16; index++) testObject.data.push('0')
  else testObject.data.push(v)
})
const ownCondition = {
  x: canvas.offsetWidth * 2 / 8,
  y: canvas.offsetHeight * 3 / 4,
  dx: 0,
  dy: 0,
  jumpFlag: false,
}
const moveAcceleration = .01
// 1 = 10 m / s
let moveConstant = .75
// gravitational acceleration = 9.80665 m / s ** 2
// m / s ** 2 === 1000 / 1000 ** 1000 mm / ms ** 2
// 1 dot === 40 mm, 1000 mm === 25 * 40 mm
const gravitationalAcceleration = 9.80665 * 1000 / 25 / 1000 ** 2
let coefficient = 5
let userEM = 5
let userFF = 1
let elasticModulus = userEM * .1 // 0 to 1
let frictionalForce = userFF * .1 // 0 to 1
let gravityFlag = true // temporary
const input = () => {
  if (key.u.isFirst() && userEM < 10) {
    userEM += 1
    elasticModulus = userEM * .1
  }
  if (key.j.isFirst() && 0 < userEM) {
    userEM -= 1
    elasticModulus = userEM * .1
  }
  if (key.i.isFirst() && userFF < 10) {
    userFF += 1
    frictionalForce = userFF * .1
  }
  if (key.k.isFirst() && 0 < userFF) {
    userFF -= 1
    frictionalForce = userFF * .1
  }
  if (key.g.isFirst()) gravityFlag = !gravityFlag
  if (!gravityFlag) {
    ownCondition.dx = 0
    ownCondition.dy = 0
    const num = 10
    if (key.a.flag) ownCondition.dx -= moveAcceleration * globalElapsedTime * num
    if (key.d.flag) ownCondition.dx += moveAcceleration * globalElapsedTime * num
    if (key.w.flag) ownCondition.dy -= moveAcceleration * globalElapsedTime * num
    if (key.s.flag) ownCondition.dy += moveAcceleration * globalElapsedTime * num
  }
  if (key.a.flag) {
    if (-moveConstant < ownCondition.dx - moveAcceleration) {
      ownCondition.dx -= moveAcceleration * globalElapsedTime
    } else ownCondition.dx = -moveConstant
  }
  if (key.d.flag) {
    if (ownCondition.dx + moveAcceleration < moveConstant) {
      ownCondition.dx += moveAcceleration * globalElapsedTime
    } else ownCondition.dx = moveConstant
  }
  // else {
  //   if (jumpConstant < jumpTime) jumpTime = 0
  //   if (jumpTime !== 0) ownCondition.dy += jumpConstant - jumpTime
  //   jumpTime = 0
  // }
  // if (key.k) {
  //   moveConstant =  dashConstant
  //   if (-stopConstant < ownCondition.dx && ownCondition.dx < stopConstant) {
  //     ownCondition.dx = ownCondition.dx / 2
  //   }
  // } else moveConstant = normalConstant
  // if (key.s) {
  //   if (jumpChargeTime < jumpConstant && !jumpFlag) jumpChargeTime += 1
  // } else if (jumpChargeTime !== 0) {
  //   ownCondition.dy -= jumpChargeTime
  //   jumpChargeTime = 0
  //   jumpFlag = true
  // }
  // if (key.w) {
  //   if (!jumpFlag) {
  //     ownCondition.dy -= jumpConstant
  //     jumpFlag = true
  //   }
  // }
  ownCondition.dy += gravitationalAcceleration * coefficient * globalElapsedTime
}
const ownBox = {w: 0, h: 0, r: size / 2 * .9,}
const collisionResponse = tilt => {
  const nX = Math.cos(tilt * Math.PI)
  const nY = Math.sin(tilt * Math.PI)
  const t = -(
    ownCondition.dx * nX + ownCondition.dy * nY) / (nX ** 2 + nY ** 2) * (.5 + elasticModulus / 2)
  ownCondition.dx += 2 * t * nX
  ownCondition.dy += 2 * t * nY
  ownCondition.dx *= 1 - frictionalForce
  ownCondition.dy *= 1 - frictionalForce
}
const collisionDetect = () => {
  let count = 0
  let repeatFlag
  do {
    count++
    if (100 < count) {
      ownCondition.x = canvas.offsetWidth * 2 / 8
      ownCondition.y = canvas.offsetHeight * 3 / 4
      ownCondition.dx = 0
      ownCondition.dy = 0
    }
    repeatFlag = false
    for (let x = 0; x < layerObject.width; x++) {
      for (let y = 0; y < layerObject.height; y++) {
        const number = layerObject.data[layerObject.width * y + x]
        let testIndex
        testIndex = number !== 0 ? '1' : '0'
        terrainObject[testIndex].forEach((ro, i) => { // relative origin
          if (terrainObject[testIndex].length === 1) return
          const rp = terrainObject[testIndex].slice(i - 1)[0]
          const rn = terrainObject[testIndex].length - 1 === i ? // relative next
            terrainObject[testIndex][0] : terrainObject[testIndex].slice(i + 1)[0]
          let tilt = Math.atan2(rn[1] - ro[1], rn[0] - ro[0]) / Math.PI // 判定する線分の傾き
          const previousTilt = Math.atan2(ro[1] - rp[1], ro[0] - rp[0]) / Math.PI
          const findVertexList = [
            [0, 0, [-1, 0], [-1, -1]],
            [0, 1, [1, 0], [1, 1]],
            [1, 0, [0, -1], [1, -1]],
            [1, 1, [0, 1], [-1, 1]],
          ]
          let vertexFlag = false
          let returnFlag = false
          findVertexList.forEach((vl, i) => {
            if (ro[vl[0]] === vl[1]) {
              const target = terrainObject[layerObject.data[(
                y + vl[2][1]) * layerObject.width + x + vl[2][0]]]
              if (target === undefined) return
              const vertex = i === 0 ? [1, ro[1]] :
              i === 1 ? [0, ro[1]] :
              i === 2 ? [ro[0], 1] : [ro[0], 0]
              // x, y それぞれ0, 1が含まれている隣を調べる
              const index = target.findIndex(val => {
                return val[0] === vertex[0] && val[1] === vertex[1]
              })
              if (index !== -1) {
                const previousIndex = index === 0 ? target.length - 1 : index - 1
                const nextIndex = index === target.length - 1 ? 0 : index + 1
                const previousVertex = i === 0 ? [1, rn[1]] :
                i === 1 ? [0, rn[1]] :
                i === 2 ? [rn[0], 1] : [rn[0], 0]
                if ( // 隣に同じ線分があったら、この線分の判定は無効
                  (ro[0] === rn[0] || ro[1] === rn[1]) &&
                  target[previousIndex][0] === previousVertex[0] &&
                  target[previousIndex][1] === previousVertex[1]
                ) returnFlag = true
                const cPreviousTilt = Math.atan2(
                  target[index][1] - target[previousIndex][1],
                  target[index][0] - target[previousIndex][0]) / Math.PI
                const cNextTilt = Math.atan2(
                  target[nextIndex][1] - target[index][1],
                  target[nextIndex][0] - target[index][0]) / Math.PI
                if (
                  target.length !== 2 && (
                  tilt === cPreviousTilt || previousTilt === cPreviousTilt ||
                  tilt === cNextTilt || previousTilt === cNextTilt)
                ) vertexFlag = true
              }
            }
          })
          const cornerList = [
            [[0, 0], [-1, -1], [1, 1]],
            [[1, 0], [1, -1], [0, 1]],
            [[1, 1], [1, 1], [0, 0]],
            [[0, 1], [-1, 1], [1, 0]],
          ]
          cornerList.forEach(vl => { // diagonally
            if (vl[0][0] !== ro[0] || vl[0][1] !== ro[1]) return
            const dTarget = terrainObject[layerObject.data[(
              y + vl[2][1]) * layerObject.width + x + vl[2][0]]]
            if (dTarget === undefined) return
            const dVertex = vl[2]
            const dIndex = dTarget.findIndex(val => {
              return val[0] === dVertex[0] && val[1] === dVertex[1]
            })
            if (dIndex === -1) return
            const dPreviousIndex = dIndex === 0 ? dTarget.length - 1 : dIndex - 1
            const dNextIndex = dIndex === dTarget.length - 1 ? 0 : dIndex + 1
            const dPreviousTilt = Math.atan2(
              dTarget[dIndex][1] - dTarget[dPreviousIndex][1],
                dTarget[dIndex][0] - dTarget[dPreviousIndex][0]) / Math.PI
            const dNextTilt = Math.atan2(
              dTarget[dNextIndex][1] - dTarget[dIndex][1],
              dTarget[dNextIndex][0] - dTarget[dIndex][0]) / Math.PI
            if (
                dTarget.length !== 2 && (
                tilt === dPreviousTilt || previousTilt === dPreviousTilt ||
                tilt === dNextTilt || previousTilt === dNextTilt)
            ) vertexFlag = true
          })
          if (returnFlag) return
          const ox = ownCondition.x
          const oy = ownCondition.y
          const dx = ownCondition.dx
          const dy = ownCondition.dy
          const ax = x * size + ro[0] * size
          const ay = y * size + ro[1] * size
          const bx = x * size + rn[0] * size
          const by = y * size + rn[1] * size
          const abx = bx - ax
          const aby = by - ay
          let nx = -aby
          let ny = abx
          let length = (nx ** 2 + ny ** 2) ** .5
          if (0 < length) length = 1 / length
          nx *= length
          ny *= length
          let nax = ax - nx * (ownBox.w + ownBox.r)
          let nay = ay - ny * (ownBox.h + ownBox.r)
          let nbx = bx - nx * (ownBox.w + ownBox.r)
          let nby = by - ny * (ownBox.h + ownBox.r)
          const d = -(nax * nx + nay * ny)
          const t = -(nx * ox + ny * oy + d) / (nx * dx + ny * dy)
          let detectFlag = false
          if (0 < t && t <= 1) {
            const cx = ox + dx * t
            const cy = oy + dy * t
            const acx = cx - nax
            const acy = cy - nay
            const bcx = cx - nbx
            const bcy = cy - nby
            const doc = acx * bcx + acy * bcy
            if (doc <= 0) {
              detectFlag = true
              tilt += tilt < .5 ? 1.5 : -.5
            }
          }
          if (terrainObject[testIndex].length === 2 && (dy < 0 || i === 1)) return // temporary
          if (terrainObject[testIndex].length === 2) vertexFlag = true
          if (
            !detectFlag &&
            !vertexFlag &&
            (ax - (ox + dx)) ** 2 + (ay - (oy + dy)) ** 2 <= (
              (ownBox.w + ownBox.h) / 2 +
              ownBox.r) ** 2
          ) {
            tilt = Math.atan2(oy - ay, ox - ax) / Math.PI
            detectFlag = true
          }
          if (detectFlag) {
            collisionResponse(tilt)
            repeatFlag = true
          }
        })
      }
    }
  } while(repeatFlag)
  ownCondition.x += ownCondition.dx
  ownCondition.y += ownCondition.dy
  // elasticModulus.x = 0
  // elasticModulus.y = 0
}
const main = () => setInterval(() => {
  frameCounter(internalFrameList)
  globalElapsedTime = Date.now() - currentTime
  currentTime = Date.now()
  input()
  collisionDetect()
}, 0)
const draw = () => {
  window.requestAnimationFrame(draw)
  frameCounter(animationFrameList)
  context.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
  context.fillStyle = 'hsl(0, 100%, 50%)'
  context.beginPath()
  context.arc(
    ownCondition.x, ownCondition.y, size / 32, 0, Math.PI * 2, false)
  context.fill()
  context.strokeStyle = 'hsl(0, 100%, 50%)'
  context.strokeRect(
    ownCondition.x - ownBox.w, ownCondition.y - ownBox.h, ownBox.w * 2, ownBox.h * 2)
  context.beginPath()
  context.arc(
    ownCondition.x - ownBox.w, ownCondition.y - ownBox.h,
    ownBox.r, Math.PI, Math.PI * 1.5, false)
  context.arc(
    ownCondition.x + ownBox.w, ownCondition.y - ownBox.h,
    ownBox.r, Math.PI * 1.5, Math.PI * 2, false)
  context.arc(
    ownCondition.x + ownBox.w, ownCondition.y + ownBox.h,
    ownBox.r, 0, Math.PI * .5, false)
  context.arc(
    ownCondition.x - ownBox.w, ownCondition.y + ownBox.h,
    ownBox.r, Math.PI * .5, Math.PI, false)
  context.closePath()
  context.stroke()
  const r = (ownCondition.dx ** 2 + ownCondition.dy ** 2) ** .5
  context.beginPath()
  context.moveTo(ownCondition.x, ownCondition.y)
  context.lineTo(
    ownCondition.x + size * r * ownCondition.dx / r,
    ownCondition.y + size * r * ownCondition.dy / r)
  context.lineTo(
    ownCondition.x + size * r * ownCondition.dx / r + 1,
    ownCondition.y + size * r * ownCondition.dy / r + 1)
    context.lineTo(ownCondition.x + 1, ownCondition.y + 1)
  context.fill()
  context.fillStyle = 'hsl(180, 100%, 50%)'
  for (let x = 0; x < testObject.width; x++) {
    for (let y = 0; y < testObject.height; y++) {
      const relativeCooldinates = {x: x * size, y: y * size}
      const n = +testObject.data[testObject.width * y + x]
      if (n === 0) continue
      // console.log(testObject.data[n], n)
      context.beginPath()
      terrainObject[n].forEach((v, i) => {
        i === 0 ?
        context.moveTo(
          relativeCooldinates.x + v[0] * size, relativeCooldinates.y + v[1] * size) :
        context.lineTo(
          relativeCooldinates.x + v[0] * size, relativeCooldinates.y + v[1] * size)
        if (terrainObject[n].length === 2) {
        context.lineTo(
          relativeCooldinates.x + v[0] * size - 2, relativeCooldinates.y + v[1] * size + 2)
        }
      })
      context.fill()
    }
  }
  // terrainList.forEach((y, iY) => {
  //   for (let iX = 0; iX < terrainList[0].length; iX++) {
  //     const relativeCooldinates = {x: iX * size,y: iY * size}
  //     context.beginPath()
  //     terrainObject[y[iX]].forEach((v, i) => {
  //       i === 0 ?
  //       context.moveTo(
  //         relativeCooldinates.x + v[0] * size, relativeCooldinates.y + v[1] * size) :
  //       context.lineTo(
  //         relativeCooldinates.x + v[0] * size, relativeCooldinates.y + v[1] * size)
  //       if (terrainObject[y[iX]].length === 2) {
  //       context.lineTo(
  //         relativeCooldinates.x + v[0] * size + 1, relativeCooldinates.y + v[1] * size + 1)
  //       }
  //     })
  //     context.fill()
  //   }
  // })
  context.fillStyle = 'hsl(0, 0%, 0%)'
  const list = [
    `internalFPS: ${internalFrameList.length - 1}`,
    `FPS: ${animationFrameList.length - 1}`,
    // `x: ${ownCondition.x}`,
    `x(m): ${Math.floor(ownCondition.x * .04)}`,
    // `y: ${ownCondition.y}`,
    `y(m): ${Math.floor((((layerObject.height - 2) * size) - ownCondition.y) * .04)}`,
    `coefficient: ${coefficient}`,
    `dx: ${ownCondition.dx}`,
    `dy: ${ownCondition.dy}`,
    `[G]gravity: ${gravityFlag}`,
    `[J: +, U: -]elasticModulus: ${userEM * .1}`,
    `[I: +, K: -]frictionalForce: ${userFF * .1}`,
  ]
  list.forEach((v, i) => {
    context.fillText(v, canvas.offsetWidth * .8, 10 * (1 + i))
  })
  context.fillStyle = 'hsl(240, 100%, 50%)'
  for (let x = 0; x < layerObject.width; x++) {
    for (let y = 0; y < layerObject.height; y++) {
      const relativeCooldinates = {x: x * size, y: y * size}
      if (layerObject.data[layerObject.width * y + x] !== 0) {
        context.beginPath()
        terrainObject['1'].forEach((v, i) => {
          i === 0 ?
          context.moveTo(
            relativeCooldinates.x + v[0] * size, relativeCooldinates.y + v[1] * size) :
          context.lineTo(
            relativeCooldinates.x + v[0] * size, relativeCooldinates.y + v[1] * size)
          if (terrainObject['1'].length === 2) {
          context.lineTo(
            relativeCooldinates.x + v[0] * size + 1, relativeCooldinates.y + v[1] * size + 1)
          }
        })
        context.fill()
      }
    }
  }
}
const getJSON = async () => {
  return new Promise(async resolve => {
    mapObject = await mapLoader()
    resolve()
  })
}
getJSON().then(() => {
  layerObject = mapObject.layers[0]
  main()
  draw()
})