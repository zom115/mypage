{'use strict'
let currentTime = Date.now()
let globalElapsedTime = 1
const canvas = document.getElementById`canvas`
const context = canvas.getContext`2d`
const size = 64
const ownCondition = {
  x: canvas.offsetWidth * 2 / 8,
  y: canvas.offsetHeight * 7 / 8,
  dx: 0,
  dy: 0,
  jumpFlag: false,
}
const moveAcceleration = 1
let moveConstant = 1
const brakeConstant = .75 / (1000 / 60)
let brake = .75
// gravitational acceleration = 9.80665 m / s ** 2
// m / s ** 2 === 1000 / 1000 ** 1000 mm / ms ** 2
// 1 dot === 40 mm, 1000 mm === 25 * 40 mm
const gravitationalAcceleration = 9.80665 * 1000 / 25 / 1000 ** 2
// 17 ???
let coefficient = 17
const elasticModulus = {x: 1, y: 1,}
const jumpConstant = 3
let jumpChargeTime = 0
const terrainObject = {
  '0': [[]],
  '1': [[0, 0], [1, 0], [1, 1], [0, 1],], // rectangle
  '2': [[1, 0], [1, 1], [0, 1],], // triangle
  '3': [[1, 1], [0, 1], [0, 0],],
  '4': [[0, 1], [0, 0], [1, 0],],
  '5': [[0, 0], [1, 0], [1, 1],],
}
const terrainList = [
  '000000000000000000000000000000000000000000000000000000',
  '111111111111111111111111111111111111111111111111111111',
  '100000000000000000000000000000000000000000000000000001',
  '100400001000000000000000000000000000000000000000000001',
  '103150010000000000000000000000000000000000000000000001',
  '100202000000000000000000000000000000000000000000000001',
  '100020000000000000000000000000000000000000000000000001',
  '111100000000000000000000000000000000000000000000000001',
  '100000000000000000000000000000000000000000000000000001',
  '111000000000000000000000000000000000000000000000000001',
  '100111100000000000000000000000000000000000000000000001',
  '100000000000000000000000000000000000000000000000000001',
  '100000000000000000000000000000000000000000000000000001',
  '100000000000000000000000000000000111111111110000000001',
  '111000000000000000000000000000000000000000000000000001',
  '100000000000000000000000000000000111000000000000000001',
  '100000000000000000000000000000000000000000000000000001',
  '100000000000000000000000000000000000000000000000000001',
  '100000000000000000000000000000000000000000000000000001',
  '100000000000000000000000000000000000000000000000000001',
  '100000000000000000021111100000000000000000000000000001',
  '100000000000000000210000000000000000000000000000000001',
  '100000000000000002100000000000000000000000000000000001',
  '100000000000000021000000000000000000000000000000000001',
  '100000000000000210000000000000000000000000000000000001',
  '100000000000002103000000000000000000000000000000000001',
  '100000000000021000300000000000000000000000000000000001',
  '100000000000210000030000000000000000000000000000000001',
  '100000000002100000003000000000000000000000000000000001',
  '111111111111111111111111111111111111111111111111111111',
  '000000000000000000000000000000000000000000000000000000',
]
terrainList.forEach((v, i) => {
  terrainList[i] = '0' + v + '0'
})
let terrainVertexList = []
const storeDegree = () => {
  terrainVertexList = []
  terrainList.forEach((y, iY) => {
    terrainVertexList.push([])
    for (let iX = 0; iX < terrainList[0].length; iX++) {
      terrainVertexList[iY].push([])
      terrainObject[y[iX]].forEach((v, i) => {
        if (terrainObject[y[iX]].length === 0) return
        const rp = terrainObject[y[iX]].slice(i - 1)[0] // relative previous
        const ro = v // relative origin
        const rn = terrainObject[y[iX]].length - 1 === i ? // relative next
        terrainObject[y[iX]][0] : terrainObject[y[iX]].slice(i + 1)[0]
        const vox = ro[0]
        const voy = ro[1]
        const vax = rn[0]
        const vay = rn[1]
        const voax = vax - vox
        const voay = vay - voy
        const vbx = rp[0]
        const vby = rp[1]
        const vobx = vbx - vox
        const voby = vby - voy
        const voa = ((vax - vox) ** 2 + (vay - voy) ** 2)
        const vob = ((vbx - vox) ** 2 + (vby - voy) ** 2)
        const vab = ((vbx - vax) ** 2 + (vby - vay) ** 2)
        let degree = (voa + vob - vab) / (2 * voa ** .5 * vob ** .5)
        degree = Math.acos(degree) / Math.PI // 判定する線分の傾き
        const a = Math.atan2(voay, voax) / Math.PI
        let vertexFlag = true
        // ここ4分岐するの鬱陶しいなあ
        // arctan使う以上仕方ないか
        if (a === 0) { // 0 degree search ceil
          const index = Object.values( // こいつがいたら頂点の判定は無効
            terrainObject[terrainList[iY - 1][iX]]).findIndex(v => {
              return v === ro
            })
          if (index !== -1 && index !== 0) { // 隣に同じ線分があったら、この線分の判定は無効
            vertexFlag = false
            if (rn === terrainObject[terrainList[iY - 1][iX]][index - 1]) return
          }
        } else if (a === .5) { // 90 degrees search right
          const index = Object.values(terrainObject[y[iX + 1]]).findIndex(v => {
              return v === ro
            })
          if (index !== -1 && index !== 0) {
            vertexFlag = false
            if (rn === terrainObject[y[iX + 1]][index - 1]) return
          }
        } else if (a === 1) { // 180 degrees search floor
          const index = Object.values(
            terrainObject[terrainList[iY + 1][iX]]).findIndex(v => {
              return v === ro
            })
          if (index !== -1 && index !== 0) {
            vertexFlag = false
            if (rn === terrainObject[terrainList[iY + 1][iX]][index - 1]) return
          }
        } else if (a === -.5) { // 270 degrees search left
          const index = Object.values(terrainObject[y[iX - 1]]).findIndex(v => {
            return v === ro
          })
          if (index !== -1 && index !== 0) {
            vertexFlag = false
            if (rn === terrainObject[y[iX - 1]][index - 1]) return
          }
        }
        if (vertexFlag) {
          // 自機とvertexの位置、角の当たりどころで、
          // どこまでをこの線分としての判定とするか
          const b = Math.atan2(voby, vobx) / Math.PI // こいつが矩形に沿ってなかったら角度決定
          // 沿っていれば隣を調べる
          if (b === 0) { // floor
            const index = Object.values(
              terrainObject[terrainList[iY + 1][iX]].findIndex(v => {
                return v === ro
              })
            )
            if (index === -1) { // 角度決定
            } else { // お隣は0ですか？
              if (terrainList[iY + 1][iX] === '0') { // 角度決定
              } else {
                let sa
                // index + 1ができるか
                if (index < terrainObject[terrainList[iY + 1][iX]].length) {
                  sa = terrainObject[terrainList[iY + 1][iX]].slice(index + 1)[0]
                } else sa = terrainObject[terrainList[iY + 1][iX]][0]
                const so = terrainObject[terrainList[iY + 1][iX]].slice(index)[0]
                const soax = sa[0] - so[0]
                const soay = sa[1] - so[1]
                const soa = Math.atan2(soay, soax) / Math.PI
                if (soa === b) { // 唯一角度が変わるよ
                  const sb = terrainObject[terrainList[iY + 1][iX]].slice(index - 1)[0]
                  const soa = ((sa[0] - so[0]) ** 2 + (sa[1] - so[1]) ** 2)
                  const sob = ((sb[0] - so[0]) ** 2 + (sb[1] - so[1]) ** 2)
                  const sab = ((sb[0] - sa[0]) ** 2 + (sb[1] - sa[1]) ** 2)
                  const d = (soa + sob - sab) / (2 * soa ** .5 * sob ** .5)
                  degree += Math.acos(d) / Math.PI
                } else {} // soa が隣接していなければ角度決定
              }
            }
          } else if (b === .5) { // left
            const index = Object.values(
              terrainObject[y[iX - 1]].findIndex(v => {
                return v === ro
              })
            )
            if (index !== -1 && y[iX - 1] !== '0') {
              let sa
              if (index < terrainObject[y[iX - 1]].length) {
                sa = terrainObject[y[iX - 1]].slice(index + 1)[0]
              } else sa = terrainObject[y[iX - 1]][0]
              const so = terrainObject[y[iX - 1]].slice(index)[0]
              const soax = sa[0] - so[0]
              const soay = sa[1] - so[1]
              const soa = Math.atan2(soay, soax) / Math.PI
              if (soa === b) {
                const sb = terrainObject[y[iX - 1]].slice(index - 1)[0]
                const soa = ((sa[0] - so[0]) ** 2 + (sa[1] - so[1]) ** 2)
                const sob = ((sb[0] - so[0]) ** 2 + (sb[1] - so[1]) ** 2)
                const sab = ((sb[0] - sa[0]) ** 2 + (sb[1] - sa[1]) ** 2)
                const d = (soa + sob - sab) / (2 * soa ** .5 * sob ** .5)
                degree += Math.acos(d) / Math.PI
              }
            }
          } else if (b === 1) { // ceil
            const index = Object.values(
              terrainObject[terrainList[iY - 1][iX]].findIndex(v => {
                return v === ro
              })
            )
            if (index !== -1 && terrainList[iY - 1][iX] !== '0') {
              let sa
              if (index < terrainObject[terrainList[iY - 1][iX]].length) {
                sa = terrainObject[terrainList[iY - 1][iX]].slice(index + 1)[0]
              } else sa = terrainObject[terrainList[iY - 1][iX]][0]
              const so = terrainObject[terrainList[iY - 1][iX]].slice(index)[0]
              const soax = sa[0] - so[0]
              const soay = sa[1] - so[1]
              const soa = Math.atan2(soay, soax) / Math.PI
              if (soa === b) {
                const sb = terrainObject[terrainList[iY - 1][iX]].slice(index - 1)[0]
                const soa = ((sa[0] - so[0]) ** 2 + (sa[1] - so[1]) ** 2)
                const sob = ((sb[0] - so[0]) ** 2 + (sb[1] - so[1]) ** 2)
                const sab = ((sb[0] - sa[0]) ** 2 + (sb[1] - sa[1]) ** 2)
                const d = (soa + sob - sab) / (2 * soa ** .5 * sob ** .5)
                degree += Math.acos(d) / Math.PI
              }
            }
          } else if (b === -.5) { // right
            const index = Object.values(
              terrainObject[y[iX + 1]].findIndex(v => {
                return v === ro
              })
            )
            if (index !== -1 && y[iX + 1] !== '0') {
              let sa
              if (index < terrainObject[y[iX + 1]].length) {
                sa = terrainObject[y[iX + 1]].slice(index + 1)[0]
              } else sa = terrainObject[y[iX + 1]][0]
              const so = terrainObject[y[iX + 1]].slice(index)[0]
              const soax = sa[0] - so[0]
              const soay = sa[1] - so[1]
              const soa = Math.atan2(soay, soax) / Math.PI
              if (soa === b) {
                const sb = terrainObject[y[iX + 1]].slice(index - 1)[0]
                const soa = ((sa[0] - so[0]) ** 2 + (sa[1] - so[1]) ** 2)
                const sob = ((sb[0] - so[0]) ** 2 + (sb[1] - so[1]) ** 2)
                const sab = ((sb[0] - sa[0]) ** 2 + (sb[1] - sa[1]) ** 2)
                const d = (soa + sob - sab) / (2 * soa ** .5 * sob ** .5)
                degree += Math.acos(d) / Math.PI
              }
            }
          }
        }
        degree = (2 - degree) / 2 // (2pi - x) / 2
        terrainVertexList[iY][iX].push(degree)
      })
    }
  })
}
storeDegree()
let key = {a: false, d: false, j: false, k: false, s: false, w: false}
document.addEventListener('keydown', e => {
  if (e.keyCode === 65) key.a = true
  if (e.keyCode === 68) key.d = true
  if (e.keyCode === 74) key.j = true
  if (e.keyCode === 75) key.k = true
  if (e.keyCode === 83) key.s = true
  if (e.keyCode === 87) key.w = true
}, false)
document.addEventListener('keyup', e => {
  if (e.keyCode === 65) key.a = false
  if (e.keyCode === 68) key.d = false
  if (e.keyCode === 74) key.j = false
  if (e.keyCode === 75) key.k = false
  if (e.keyCode === 83) key.s = false
  if (e.keyCode === 87) key.w = false
}, false)
const input = () => {
  { // temporary
    ownCondition.dx = 0
    ownCondition.dy = 0
  }
  if (key.a) {
    if (-moveConstant < ownCondition.dx - moveAcceleration) {
      ownCondition.dx -= moveAcceleration
    } else ownCondition.dx = -moveConstant
  }
  if (key.d) {
    if (ownCondition.dx + moveAcceleration < moveConstant) {
      ownCondition.dx += moveAcceleration
    } else ownCondition.dx = moveConstant
  }
  if (key.w && -moveConstant < ownCondition.dy) {
    ownCondition.dy -= moveAcceleration
  } // temporary
  if (key.s && ownCondition.dy < moveConstant) ownCondition.dy += moveAcceleration // temporary
  if (key.j) {
    if (!ownCondition.jumpFlag) {
      elasticModulus.y = 1
      ownCondition.jumpFlag = true
    }
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
const ownBox = {w: size / 8, h: size / 8}
const collisionResponse = tilt => {
  if (tilt === 0) { // 0 degree, floor
    ownCondition.dy = -ownCondition.dy * elasticModulus.y
  } else if (tilt === .25) { // 45 degree
    ;[ownCondition.dx, ownCondition.dy] =
    [ownCondition.dy * elasticModulus.y, ownCondition.dx * elasticModulus.x]
  } else if (tilt === .5) { // 90 degree, left wall
    ownCondition.dx = -ownCondition.dx * elasticModulus.x
  } else if (tilt === .75) { // 135 degree
    ;[ownCondition.dx, ownCondition.dy] =
    [-ownCondition.dy * elasticModulus.y, -ownCondition.dx * elasticModulus.x]
  } else if (tilt === 1) { // 180 degree, ceil
    ownCondition.dy = -ownCondition.dy * elasticModulus.y
  } else if (tilt === -.75) { // 225 degree
    ;[ownCondition.dx, ownCondition.dy] =
    [ownCondition.dy * elasticModulus.y, ownCondition.dx * elasticModulus.x]
  } else if (tilt === -.5) { // 270 degree, right wall
    ownCondition.dx = -ownCondition.dx * elasticModulus.x
  } else if (tilt === -.25) { // 315 degree
    ;[ownCondition.dx, ownCondition.dy] =
    [-ownCondition.dy * elasticModulus.y, -ownCondition.dx * elasticModulus.x]
  } else {
    const r = (ownCondition.dx ** 2 + ownCondition.dy ** 2) ** .5
    ownCondition.dx = r * Math.cos(tilt * Math.PI) * elasticModulus.x
    ownCondition.dy = r * Math.sin(tilt * Math.PI) * elasticModulus.y
  }
}
const collisionDetect = () => {
  let count = 0
  let repeatFlag
  do {
    count++
    if (10 < count) {
      ownCondition.x = canvas.offsetWidth * 2 / 8
      ownCondition.y = canvas.offsetHeight * 7 / 8
    }
    repeatFlag = false
    terrainList.forEach((y, iY) => {
      for (let iX = 0; iX < terrainList[0].length; iX++) {
        terrainObject[y[iX]].forEach((ro, i) => { // relative origin
          if (terrainObject[y[iX]].length === 0) return
          const rp = terrainObject[y[iX]].slice(i - 1)[0]
          const rn = terrainObject[y[iX]].length - 1 === i ? // relative next
            terrainObject[y[iX]][0] : terrainObject[y[iX]].slice(i + 1)[0]
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
              const target = terrainObject[terrainList[iY + vl[2][1]][iX + vl[2][0]]]
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
                  tilt === cPreviousTilt || previousTilt === cPreviousTilt ||
                  tilt === cNextTilt || previousTilt === cNextTilt
                ) vertexFlag = true
              }
            }
          })
          // diagonally
          const cornerList = [
            [[0, 0], [-1, -1], [1, 1]],
            [[1, 0], [1, -1], [0, 1]],
            [[1, 1], [1, 1], [0, 0]],
            [[0, 1], [-1, 1], [1, 0]],
          ]
          cornerList.forEach(vl => {
            if (vl[0][0] !== ro[0] || vl[0][1] !== ro[1]) return
            const dTarget = terrainObject[terrainList[iY + vl[1][1]][iX + vl[1][0]]]
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
                tilt === dPreviousTilt || previousTilt === dPreviousTilt ||
                tilt === dNextTilt || previousTilt === dNextTilt
            ) vertexFlag = true
          })
          if (returnFlag) return
          const ox = ownCondition.x
          const oy = ownCondition.y
          const dx = ownCondition.dx
          const dy = ownCondition.dy
          const ax = iX * size + ro[0] * size
          const ay = iY * size + ro[1] * size
          const bx = iX * size + rn[0] * size
          const by = iY * size + rn[1] * size
          const abx = bx - ax
          const aby = by - ay
          let nx = -aby
          let ny = abx
          let length = (nx ** 2 + ny ** 2) ** .5
          if (0 < length) length = 1 / length
          nx *= length
          ny *= length
          let nax = ax - nx * ownBox.w
          let nay = ay - ny * ownBox.h
          let nbx = bx - nx * ownBox.w
          let nby = by - ny * ownBox.h
          const d = -(nax * nx + nay * ny)
          const t = -(nx * ox + ny * oy + d) / (nx * dx + ny * dy)
          let detectFlag = false
          if (0 <= t && t <= 1) {
            const cx = ox + dx * t
            const cy = oy + dy * t
            const acx = cx - nax
            const acy = cy - nay
            const bcx = cx - nbx
            const bcy = cy - nby
            const doc = acx * bcx + acy * bcy
            if (doc <= 0) detectFlag = true
          }
          if (
            !detectFlag &&
            !vertexFlag &&
            (ax - (ox + dx)) ** 2 + (ay - (oy + dy)) ** 2 <= ownBox.w ** 2
          ) {
            console.log('vertex')
            tilt = Math.atan2(oy - ay, ox - ax) / Math.PI
            detectFlag = true
          }
          if (detectFlag) {
            collisionResponse(tilt)
            repeatFlag = true
          }
        })
      }
    })
    ownCondition.x += ownCondition.dx
    ownCondition.y += ownCondition.dy
    // elasticModulus.x = 0
    // elasticModulus.y = 0
  } while(repeatFlag)
}
const draw = () => {
  context.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
  context.fillStyle = 'hsl(0, 100%, 50%)'
  context.beginPath()
  context.arc(
    ownCondition.x, ownCondition.y + jumpChargeTime, size / 32, 0, Math.PI * 2, false)
  context.fill()
  context.strokeStyle = 'hsl(0, 100%, 50%)'
  context.beginPath()
  context.arc(
    ownCondition.x, ownCondition.y + jumpChargeTime, ownBox.w, 0, Math.PI * 2, false)
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
  terrainList.forEach((y, iY) => {
    for (let iX = 0; iX < terrainList[0].length; iX++) {
      const relativeCooldinates = {x: iX * size,y: iY * size}
      context.beginPath()
      terrainObject[y[iX]].forEach((v, i) => {
        i === 0 ?
        context.moveTo(
          relativeCooldinates.x + v[0] * size, relativeCooldinates.y + v[1] * size) :
          context.lineTo(
            relativeCooldinates.x + v[0] * size, relativeCooldinates.y + v[1] * size)
      })
      context.fill()
    }
  })
  context.fillStyle = 'hsl(0, 0%, 0%)'
  const list = [
    `x: ${ownCondition.x}`,
    `y: ${ownCondition.y}`,
    `y(m): ${(((terrainList.length - 3) * size) - ownCondition.y) * .04}`,
    `coefficient: ${coefficient}`,
    `dx: ${ownCondition.dx}`,
    `dy: ${ownCondition.dy}`,
  ]
  list.forEach((v, i) => {
    context.fillText(v, size * 11, size * (1 + i))
  })
}
const main = () => {
  window.requestAnimationFrame(main)
  globalElapsedTime = Date.now() - currentTime
  currentTime = Date.now()
  // internal process
  input()
  collisionDetect()
  // draw process
  draw()
}
main()
}