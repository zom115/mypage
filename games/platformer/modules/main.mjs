import {key, globalTimestamp} from '../../../modules/key.mjs'
import {mapLoader} from '../../../modules/mapLoader.mjs'
import {imageLoader} from '../../../modules/imageLoader.mjs'
// import {drawCollision} from './drawCollision.mjs'
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
let currentTime = globalTimestamp
let intervalDiffTime = 1
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
// drawCollision(terrainObject)
/*
gravitational acceleration = 9.80665 m / s ** 2
m / s ** 2 === 1000 / 1000 ** 1000 mm / ms ** 2
1 dot === 40 mm, 1000 mm === 25 * 40 mm
*/
const gravitationalAcceleration = 9.80665 * 1000 / 25 / 1000 ** 2
let coefficient = 5
let elasticModulus = 0 // 0 to 1
const wallFF = 0
let userFF = .1
let frictionalForce = userFF // 0 to 1
const ownCondition = {x: 0, y: 0, dx: 0, dy: 0, jumpFlag: false,}
const moveAcceleration = .01
const normalConstant = .5
const dashConstant = .75
let moveConstant = normalConstant // 1 = 10 m / s
let landFlag = false
const jumpConstant = 1
const keyMapObject = {
  left: key.a,
  right: key.d,
  up: key.w,
  down: key.s,
  jump: key.j,
  dash: key.k,
  collision: key.h,
  subElasticModulus: key.u,
  addElasticModulus: key.i,
  subFrictionalForce: key.o,
  addFrictionalForce: key.p,
  gravity: key.g,
}
let gravityFlag = true // temporary
let collisionDisp = false
const input = () => {
  if (keyMapObject.collision.isFirst()) collisionDisp = !collisionDisp
  if (keyMapObject.subElasticModulus.isFirst() && 0 < elasticModulus) {
    elasticModulus = orgRound(elasticModulus - .1, 10)
  }
  if (keyMapObject.addElasticModulus.isFirst() && elasticModulus < 1) {
    elasticModulus = orgRound(elasticModulus + .1, 10)
  }
  if (keyMapObject.subFrictionalForce.isFirst() && 0 < userFF) {
    userFF = orgRound(userFF - .1, 10)
  }
  if (keyMapObject.addFrictionalForce.isFirst() && userFF < 1) {
    userFF = orgRound(userFF + .1, 10)
  }
  if (keyMapObject.gravity.isFirst()) gravityFlag = !gravityFlag
  if (!gravityFlag) {
    ownCondition.dx = 0
    ownCondition.dy = 0
    const num = 10
    if (keyMapObject.left.flag) ownCondition.dx -= moveAcceleration * intervalDiffTime * num
    if (keyMapObject.right.flag) ownCondition.dx += moveAcceleration * intervalDiffTime * num
    if (keyMapObject.up.flag) ownCondition.dy -= moveAcceleration * intervalDiffTime * num
    if (keyMapObject.down.flag) ownCondition.dy += moveAcceleration * intervalDiffTime * num
  }
  if (keyMapObject.dash.flag) moveConstant = dashConstant
  else moveConstant = normalConstant
  if (keyMapObject.left.flag) {
    if (-moveConstant < ownCondition.dx - moveAcceleration) {
      ownCondition.dx -= moveAcceleration * intervalDiffTime
    } else ownCondition.dx = -moveConstant
  }
  if (keyMapObject.right.flag) {
    if (ownCondition.dx + moveAcceleration < moveConstant) {
      ownCondition.dx += moveAcceleration * intervalDiffTime
    } else ownCondition.dx = moveConstant
  }
  if (keyMapObject.jump.isFirst()) {
    if (landFlag) ownCondition.dy -= jumpConstant
    landFlag = false
  }
}
const ownBox = {w: size, h: size, r: size / 2 * .9,}
const collisionResponse = tilt => {
  const nX = Math.cos(tilt * Math.PI)
  const nY = Math.sin(tilt * Math.PI)
  const t = -(
    ownCondition.dx * nX + ownCondition.dy * nY) / (nX ** 2 + nY ** 2) * (.5 + elasticModulus / 2)
  ownCondition.dx += 2 * t * nX
  ownCondition.dy += 2 * t * nY
  if (tilt <= 1) frictionalForce = wallFF
  ownCondition.dx *= 1 - frictionalForce
  ownCondition.dy *= 1 - frictionalForce
  if (1 < tilt) landFlag = true
}
const collisionDetect = () => {
  let count = 0
  let repeatFlag
  do {
    count++
    if (3 < count) {
      // ownCondition.x = canvas.offsetWidth * 2 / 8
      // ownCondition.y = canvas.offsetHeight * 3 / 4
      ownCondition.dx = 0
      ownCondition.dy = 0
    }
    repeatFlag = false
    for (let x = 0; x < mapObject.layers[layerIndexObject.collision].width; x++) {
      for (let y = 0; y < mapObject.layers[layerIndexObject.collision].height; y++) {
        const id = mapObject.layers[layerIndexObject.collision].data[y * mapObject.layers[layerIndexObject.collision].width + x] -
          mapObject.tilesets[tilesetIndexObject.collision].firstgid + 1
        let terrainIndex
        terrainIndex = 0 < id ? id : '0'
        terrainObject[terrainIndex].forEach((ro, i) => { // relative origin
          if (ro.rength === 0) return
          if (terrainObject[terrainIndex].length === 1) return
          const rp = terrainObject[terrainIndex].slice(i - 1)[0]
          const rn = terrainObject[terrainIndex].length - 1 === i ? // relative next
            terrainObject[terrainIndex][0] : terrainObject[terrainIndex].slice(i + 1)[0]
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
              const target = terrainObject[mapObject.layers[layerIndexObject.collision].data[(
                y + vl[2][1]) * mapObject.layers[layerIndexObject.collision].width + x + vl[2][0]] -
                mapObject.tilesets[tilesetIndexObject.collision].firstgid + 1]
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
          let nax = ax - nx * ownBox.r
          let nay = ay - ny * ownBox.r
          let nbx = bx - nx * ownBox.r
          let nby = by - ny * ownBox.r
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
          if (terrainObject[terrainIndex].length === 2 && (dy < 0 || i === 1)) return // temporary
          if (terrainObject[terrainIndex].length === 2) vertexFlag = true
          if (
            !detectFlag &&
            !vertexFlag &&
            (ax - (ox + dx)) ** 2 + (ay - (oy + dy)) ** 2 <= ownBox.r ** 2
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
}
const stateUpdate = () => {
  ownCondition.dy += gravitationalAcceleration * coefficient * intervalDiffTime
  frictionalForce = userFF
}
const main = () => setInterval(() => {
  frameCounter(internalFrameList)
  intervalDiffTime = globalTimestamp - currentTime
  currentTime = globalTimestamp
  input()
  collisionDetect()
  stateUpdate()
}, 0)
const draw = () => {
  window.requestAnimationFrame(draw)
  frameCounter(animationFrameList)
  context.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
  Object.values(bgIndexObject).forEach(v => { // draw background
    const properties = mapObject.layers[v].properties
    // const offsetX = properties[properties.findIndex(vl => vl.name === 'offsetX')].value
    // offsetX === 'left'
    const direction = properties[properties.findIndex(vl => vl.name === 'direction')].value
    const offsetY = properties[properties.findIndex(vl => vl.name === 'offsetY')].value
    const scrollTimePerSize =
      properties[properties.findIndex(vl => vl.name === 'scrollTimePerSize')].value
    scrollTimePerSize
    const image = resource[mapObject.layers[v].name]
    const resetWidthTime = scrollTimePerSize * image.width / size
    let ratio = globalTimestamp % resetWidthTime / resetWidthTime
    if (direction === 'left') ratio = -ratio
    let offsety = mapObject.layers[v].offsety
    if (offsety === undefined) offsety = 0
    let imageOffsetY = 0
    if (offsetY === 'bottom') imageOffsetY = canvas.offsetHeight - image.height - offsety
    else if (offsetY === 'top') imageOffsetY = offsety
    for (let i = 0; i < Math.ceil(canvas.offsetWidth / image.width) + 1; i++) {
      context.drawImage(image, image.width * (i + ratio), imageOffsetY)
    }
  })
  context.fillStyle = 'hsl(0, 0%, 0%)'
  const list = [
    `internalFPS: ${internalFrameList.length - 1}`,
    `FPS: ${animationFrameList.length - 1}`,
    // `x: ${ownCondition.x}`,
    `x(m): ${Math.floor(ownCondition.x * .04)}`,
    // `y: ${ownCondition.y}`,
    `y(m): ${Math.floor((((mapObject.layers[layerIndexObject.objects].height - 2) * size) - ownCondition.y) * .04)}`,
    `coefficient: ${coefficient}`,
    `dx: ${ownCondition.dx.toFixed(2)}`,
    `dy: ${ownCondition.dy.toFixed(2)}`,
    `[${keyMapObject.gravity.key}]gravity: ${gravityFlag}`,
    `[${keyMapObject.collision.key}]collisionDisp: ${collisionDisp}`,
    `[${keyMapObject.subElasticModulus.key}: -, ${keyMapObject.addElasticModulus.key}: +]` +
    `elasticModulus: ${elasticModulus}`,
    `[${keyMapObject.subFrictionalForce.key}: -, ${keyMapObject.addFrictionalForce.key}: +]` +
    `frictionalForce: ${userFF}`,
  ]
  list.forEach((v, i) => {
    context.fillText(v, canvas.offsetWidth * .8, 10 * (1 + i))
  })
  context.fillStyle = 'hsl(240, 100%, 50%)'
  for (let x = 0; x < mapObject.layers[layerIndexObject.objects].width; x++) {
    for (let y = 0; y < mapObject.layers[layerIndexObject.objects].height; y++) {
      const id = mapObject.layers[layerIndexObject.objects].data[
        mapObject.layers[layerIndexObject.objects].width * y + x] -
        mapObject.tilesets[tilesetIndexObject.tileset].firstgid
      if (id !== 0) {
        context.drawImage(
          resource.tileset,
          (id % mapInfoObject.tileset.columns) * size,
          (id - id % mapInfoObject.tileset.columns) / mapInfoObject.tileset.columns * size
          , size, size, x * size, y * size, size, size)
      }
    }
  }
  context.fillStyle = 'hsl(0, 100%, 50%)'
  context.beginPath()
  context.arc(ownCondition.x, ownCondition.y, size / 32, 0, Math.PI * 2, false)
  context.fill()
  context.strokeStyle = 'hsl(0, 100%, 50%)'
  context.beginPath()
  context.arc(ownCondition.x, ownCondition.y, ownBox.r, 0 , Math.PI * 2)
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
  if (collisionDisp) {
    context.fillStyle = 'hsla(300, 50%, 50%, 1)'
    for (let x = 0; x < mapObject.layers[layerIndexObject.collision].width; x++) {
      for (let y = 0; y < mapObject.layers[layerIndexObject.collision].height; y++) {
        const id = mapObject.layers[layerIndexObject.collision].data[y *
          mapObject.layers[layerIndexObject.collision].width + x] -
          mapObject.tilesets[tilesetIndexObject.collision].firstgid + 1
        if (0 < id) {
          const relativeCooldinates = {x: x * size, y: y * size}
          context.beginPath()
          terrainObject[id].forEach((v, i) => {
            i === 0 ?
            context.moveTo(
              relativeCooldinates.x + v[0] * size, relativeCooldinates.y + v[1] * size) :
            context.lineTo(
              relativeCooldinates.x + v[0] * size, relativeCooldinates.y + v[1] * size)
            if (terrainObject[id].length === 2) {
            context.lineTo(
              relativeCooldinates.x + v[0] * size + 1, relativeCooldinates.y + v[1] * size + 1)
            }
          })
          context.fill()
        }
      }
    }
  }
}
let mapObject = {}
const layerNameList = ['collision', 'objects', 'objectsLayer', 'sky', 'clouds', 'sea']
let layerIndexObject = {}
const bgNameList = ['sky', 'clouds', 'sea']
let bgIndexObject = {}
const tilesetNameList = ['collision', 'tileset']
let tilesetIndexObject = {}
let mapInfoObject = {}
let resource = []
const initialize = () => {
  return new Promise(async resolve => {
    await mapLoader('main', 'resources/main.json').then(result => {
      mapObject = result.main
      mapObject.layers.forEach((v, i) => {
        layerIndexObject[v.name] = i
      })
      mapObject.tilesets.forEach((v, i) => {
        const str = v.source.substring(0, v.source.indexOf('.'))
        tilesetIndexObject[str] = i
        resource.push(mapLoader(str, 'resources/' + v.source))
      })
      {
        const objectsLayer = mapObject.layers[layerIndexObject.objectsLayer]
        const playerPositionIndex = objectsLayer.objects.findIndex(v => {
          return v.name === 'playerPosition'
        })
        const playerPosition = objectsLayer.objects[playerPositionIndex]
        ownCondition.x = playerPosition.x
        ownCondition.y = playerPosition.y
      }
    })
    await Promise.all(resource).then(result => {
      resource = []
      mapObject.layers.forEach((v, i) => {
        if (v.type === 'imagelayer') {
          bgIndexObject[v.name] = i
          const src = v.image
          resource.push(imageLoader(v.name, src.slice(src.indexOf('../') + 1)))
        }
      })
      result.forEach(v => {
        Object.entries(v).forEach(([key, value]) => {
          mapInfoObject[key] = value
          const src = value.image
          resource.push(imageLoader(key, src.slice(src.indexOf('../') + 1)))
        })
      })
    })
    await Promise.all(resource).then(result => {
      resource = {}
      result.forEach(v => resource[Object.keys(v)[0]] = Object.values(v)[0])
      resolve()
    })
  })
}
initialize().then(() => {
  main()
  draw()
})