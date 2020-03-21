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
const gravitationalAcceleration =
9.80665 * 1000 / 25 / 1000 ** 2
// 17 ???
let coefficient = 17
const elasticModulus = {x: 0, y: 0,}
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
  '100000000000000000000000000000000000000000000000000001',
  '100003000000000000000000000000000000000000000000000001',
  '101000000000000000000000000000000000000000000000000001',
  '100210000000000000000000000000000000000000000000000001',
  '111000000000000000000000000000000000000000000000000001',
  '100210000000000000000000000000000000000000000000000001',
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
        if (y[iX] === '0') return
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
            } else {
              // お隣は0ですか？
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
                  console.log(`d: ${d}`)
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
const collisionResponse = () => {
  ownCondition.dx = -ownCondition.dx * elasticModulus.x
  ownCondition.dy = -ownCondition.dy * elasticModulus.y
  flag = true
}
const collisionDetect = () => {
  let count = 0
  let flag
  do {
    count++
    if (10 < count) {
      ownCondition.x = canvas.offsetWidth * 1 / 8
      ownCondition.y = canvas.offsetHeight * 7 / 8
    }
    flag = false
    terrainList.forEach((y, iY) => {
      for (let iX = 0; iX < terrainList[0].length; iX++) {
        const tileWidth = size
        terrainObject[y[iX]].forEach((v, i) => {
          if (y[iX] === '0') return
          const ox = ownCondition.x
          const oy = ownCondition.y
          const dx = ownCondition.dx
          const dy = ownCondition.dy
          const ro = v // relative origin
          const rn = terrainObject[y[iX]].length - 1 === i ? // relative next
            terrainObject[y[iX]][0] : terrainObject[y[iX]].slice(i + 1)[0]
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
          const ab = ((bx - ax) ** 2 + (by - ay) ** 2)
          const ao = ((ox - ax) ** 2 + (oy - ay) ** 2)
          const bo = ((ox - bx) ** 2 + (oy - by) ** 2)
          if (0 <= t && t <= 1) {
            const cx = ox + dx * t
            const cy = oy + dy * t
            const acx = cx - nax
            const acy = cy - nay
            const bcx = cx - nbx
            const bcy = cy - nby
            const doc = acx * bcx + acy * bcy
            if (doc <= 0) collisionResponse()
          } else if ((ax - (ox + dx)) ** 2 + (ay - (oy + dy)) ** 2 <= ownBox.w ** 2) {
            const vox = ro[0]
            const voy = ro[1]
            const vax = rn[0]
            const vay = rn[1]
            const voax = vax - vox
            const voay = vay - voy
            const a = Math.atan2(voay, voax) / Math.PI // 判定する線分の傾き
            // ここ4分岐するの鬱陶しいなあ
            // arctan使う以上仕方ないか
            if (a === 0) { // 0 degree search ceil
              const index = Object.values( // こいつがいたら頂点の判定は無効
                terrainObject[terrainList[iY - 1][iX]]).findIndex(v => {
                  return v === ro
                })
              if (index !== -1 && index !== 0) { // 隣に同じ線分があったら、この線分の判定は無効
                if (rn === terrainObject[terrainList[iY - 1][iX]][index - 1]) return
              }
            } else if (a === .5) { // 90 degrees search right
              const index = Object.values(terrainObject[y[iX + 1]]).findIndex(v => {
                  return v === ro
                })
              if (index !== -1 && index !== 0) {
                if (rn === terrainObject[y[iX + 1]][index - 1]) return
              }
            } else if (a === 1) { // 180 degrees search floor
              const index = Object.values(
                terrainObject[terrainList[iY + 1][iX]]).findIndex(v => {
                  return v === ro
                })
              if (index !== -1 && index !== 0) {
                if (rn === terrainObject[terrainList[iY + 1][iX]][index - 1]) return
              }
            } else if (a === -.5) { // 270 degrees search left
              const index = Object.values(terrainObject[y[iX - 1]]).findIndex(v => {
                return v === ro
              })
              if (index !== -1 && index !== 0) {
                if (rn === terrainObject[y[iX - 1]][index - 1]) return
              }
            }
            // t 線分より内側か、法線ベクトルとってやってるけど
            // なんか思ってる値と符号が逆。本当は0 < tにしたい
            // まあいいや、どうせすぐ直す

            // cDegreeが180 degrees以内(tで判定)で
            // degree内ならこの線分の判定を返す
            let cDegree = (ab + ao - bo) / (2 * ab ** .5 * ao ** .5)
            cDegree = Math.acos(cDegree) / Math.PI
            if (t <= 0 && cDegree <= terrainVertexList[iY][iX][i]) {
              console.log('start', terrainVertexList[iY][iX][i])
              // この線分のcollision response
              collisionResponse()
            }
          } else if ((bx - (ox + dx)) ** 2 + (by - (oy + dy)) ** 2 <= ownBox.w ** 2) {
            // こっちもcDegreeとtの判定せな使えへん
            let cDegree = (ab + bo - ao) / (2 * ab ** .5 * bo ** .5)
            cDegree = Math.acos(cDegree) / Math.PI
            if (t <= 0 && cDegree <= terrainVertexList[iY][iX][i]) {
              console.log('end', terrainVertexList[iY][iX][i])
              collisionResponse()
            }
          }
        })
        // if (y[iX] === '1') {
        //   if (0 < ownCondition.dy && terrainList[iY - 1][iX] === '0') { // floor
        //     const x = ownCondition.x
        //     const y = ownCondition.y
        //     const dx = ownCondition.dx
        //     const dy = ownCondition.dy
        //     const ax = iX * size - ownBox.w
        //     const ay = iY * size - ownBox.h
        //     const bx = iX * size + tileWidth + ownBox.w
        //     const by = iY * size - ownBox.h
        //     const abx = bx - ax
        //     const aby = by - ay
        //     let nx = -aby
        //     let ny = abx
        //     let length = (nx ** 2 + ny ** 2) ** .5
        //     if (0 < length) length = 1 / length
        //     nx *= length
        //     ny *= length
        //     const d = -(ax * nx + ay * ny)
        //     const t = -(nx * x + ny * y + d) / (nx * dx + ny * dy)
        //     if (0 <= t && t <= 1) {
        //       const cx = x + dx * t
        //       const cy = y + dy * t
        //       const acx = cx - ax
        //       const acy = cy - ay
        //       const bcx = cx - bx
        //       const bcy = cy - by
        //       const doc = acx * bcx + acy * bcy
        //       if (doc <= 0) {
        //         ownCondition.dy = -(ownCondition.dy + jumpConstant) * elasticModulus.y
        //         ownCondition.dx *= brake
        //         ownCondition.jumpFlag = false
        //         flag = true
        //       }
        //     }
        //   }
        //   if (ownCondition.dy < 0 && terrainList[iY + 1][iX] === '0') { // ceil
        //     const ax = iX * size - ownBox.w
        //     const ay = iY * size + tileWidth + ownBox.h
        //     const bx = iX * size + tileWidth + ownBox.w
        //     const by = iY * size + tileWidth + ownBox.h
        //     const abx = bx - ax
        //     let ny = abx
        //     let length = (ny ** 2) ** .5
        //     if (0 < length) length = 1 / length
        //     ny *= length
        //     const d = -(ay * ny)
        //     const t = -(ny * ownCondition.y + d) / (ny * (ownCondition.dy))
        //     if (0 <= t && t <= 1) {
        //       const cx = ownCondition.x + ownCondition.dx * t
        //       const cy = ownCondition.y + ownCondition.dy * t
        //       const acx = cx - ax
        //       const acy = cy - ay
        //       const bcx = cx - bx
        //       const bcy = cy - by
        //       const doc = acx * bcx + acy * bcy
        //       if (doc < 0) {
        //         console.log('detect ceil')
        //         ownCondition.dy = -ownCondition.dy * elasticModulus.y
        //         flag = true
        //       }
        //     }
        //   }
        //   if (0 < ownCondition.dx && y[iX - 1] === '0') { // right wall
        //     const ax = iX * size - ownBox.w
        //     const ay = iY * size - ownBox.h
        //     const bx = iX * size - ownBox.w
        //     const by = iY * size + tileWidth + ownBox.h
        //     const aby = by - ay
        //     let nx = -aby
        //     let length = (nx ** 2) ** .5
        //     if (0 < length) length = 1 / length
        //     nx *= length
        //     const d = -(ax * nx)
        //     const t = -(nx * ownCondition.x + d) / (nx * (ownCondition.dx))
        //     if (0 <= t && t <= 1) {
        //       const cx = ownCondition.x + ownCondition.dx * t
        //       const cy = ownCondition.y + ownCondition.dy * t
        //       const acx = cx - ax
        //       const acy = cy - ay
        //       const bcx = cx - bx
        //       const bcy = cy - by
        //       const doc = acx * bcx + acy * bcy
        //       if (doc < 0) {
        //         console.log('detect right wall')
        //         ownCondition.dx = -ownCondition.dx * elasticModulus.x
        //         flag = true
        //       }
        //     }
        //   }
        //   if (ownCondition.dx < 0 && y[iX + 1] === '0') { // left wall
        //     const ax = iX * size + tileWidth + ownBox.w
        //     const ay = iY * size - ownBox.h
        //     const bx = iX * size + tileWidth + ownBox.w
        //     const by = iY * size + tileWidth + ownBox.h
        //     const aby = by - ay
        //     let nx = -aby
        //     let length = (nx ** 2) ** .5
        //     if (0 < length) length = 1 / length
        //     nx *= length
        //     const d = -(ax * nx)
        //     const t = -(nx * ownCondition.x + d) / (nx * (ownCondition.dx))
        //     if (0 <= t && t <= 1) {
        //       const cx = ownCondition.x + ownCondition.dx * t
        //       const cy = ownCondition.y + ownCondition.dy * t
        //       const acx = cx - ax
        //       const acy = cy - ay
        //       const bcx = cx - bx
        //       const bcy = cy - by
        //       const doc = acx * bcx + acy * bcy
        //       if (doc < 0) {
        //         console.log('detect left wall 1', iX, iY)
        //         ownCondition.dx = -ownCondition.dx * elasticModulus.x
        //         // ownCondition.dy *= brakeConstantflag = true
        //       }
        //     }
        //   }
        // } else
        // if (y[iX] === '2') {
        //   if ( // floor & right wall = slope
        //     (0 < ownCondition.dy || 0 < ownCondition.dx) &&
        //     terrainList[iY - 1][iX] === '0' &&
        //     y[iX - 1] === '0'
        //   ) {
        //     const x = ownCondition.x
        //     const y = ownCondition.y
        //     const dx = ownCondition.dx
        //     const dy = ownCondition.dy
        //     const ax = iX * size - ownBox.w
        //     const ay = iY * size + tileWidth - ownBox.h
        //     const bx = iX * size + tileWidth - ownBox.w
        //     const by = iY * size - ownBox.h
        //     const abx = bx - ax
        //     const aby = by - ay
        //     let nx = -aby
        //     let ny = abx
        //     let length = (nx ** 2 + ny ** 2) ** .5
        //     if (0 < length) length = 1 / length
        //     nx *= length
        //     ny *= length
        //     const d = -(ax * nx + ay * ny)
        //     const t = -(nx * x + ny * y + d) / (nx * dx + ny * dy)
        //     if (0 <= t && t <= 1) {
        //       const cx = x + dx * t
        //       const cy = y + dy * t
        //       const acx = cx - ax
        //       const acy = cy - ay
        //       const bcx = cx - bx
        //       const bcy = cy - by
        //       const doc = acx * bcx + acy * bcy
        //       if (doc <= 0) {
        //         console.log('detect slope', iX, iY)
        //         ;[ownCondition.dx, ownCondition.dy] = [-ownCondition.dy, -ownCondition.dx]
        //         ownCondition.jumpFlag = false
        //         flag = true
        //       }
        //     }
        //   }
        //   if (ownCondition.dy < 0 && terrainList[iY + 1][iX] === '0') { // ceil
        //     const ax = iX * size - ownBox.w
        //     const ay = iY * size + tileWidth + ownBox.h
        //     const bx = iX * size + tileWidth + ownBox.w
        //     const by = iY * size + tileWidth + ownBox.h
        //     const abx = bx - ax
        //     let ny = abx
        //     let length = (ny ** 2) ** .5
        //     if (0 < length) length = 1 / length
        //     ny *= length
        //     const d = -(ay * ny)
        //     const t = -(ny * ownCondition.y + d) / (ny * (ownCondition.dy))
        //     if (0 <= t && t <= 1) {
        //       const cx = ownCondition.x + ownCondition.dx * t
        //       const cy = ownCondition.y + ownCondition.dy * t
        //       const acx = cx - ax
        //       const acy = cy - ay
        //       const bcx = cx - bx
        //       const bcy = cy - by
        //       const doc = acx * bcx + acy * bcy
        //       // const diff = ownCondition.x < ax + r ? ownCondition.x - ax - r :
        //       // bx - r < ownCondition.x ? ownCondition.x - bx + r : 0
        //       if (
        //         (doc < 0
        //         //   && ax + r <= ownCondition.x && ownCondition.x <= bx - r) ||
        //         // ((ax < ownCondition.x && ownCondition.x < ax + r) ||
        //         // (bx - r < ownCondition.x && ownCondition.x < bx)) &&
        //         // -(ay - ownCondition.y - ownCondition.dy) <
        //         // r * Math.cos((diff / r) * (Math.PI / 2)
        //         )
        //       ) {
        //         console.log('detect ceil')
        //         // ownCondition.dy = -ownCondition.dy * elasticModulus
        //         // ownCondition.y = ay + r
        //         ownCondition.dy = -ownCondition.dy * elasticModulus.y
        //         //  - gravityConstant * (1 - t)
        //         // ownCondition.dx *= brakeConstant
        //         flag = true
        //       }
        //     }
        //   }
        //   if (ownCondition.dx < 0 && y[iX + 1] === '0') { // left wall
        //     const ax = iX * size + tileWidth + ownBox.w
        //     const ay = iY * size - ownBox.h
        //     const bx = iX * size + tileWidth + ownBox.w
        //     const by = iY * size + tileWidth + ownBox.h
        //     const aby = by - ay
        //     let nx = -aby
        //     let length = (nx ** 2) ** .5
        //     if (0 < length) length = 1 / length
        //     nx *= length
        //     const d = -(ax * nx)
        //     const t = -(nx * ownCondition.x + d) / (nx * (ownCondition.dx))
        //     if (0 <= t && t <= 1) {
        //       const cx = ownCondition.x + ownCondition.dx * t
        //       const cy = ownCondition.y + ownCondition.dy * t
        //       const acx = cx - ax
        //       const acy = cy - ay
        //       const bcx = cx - bx
        //       const bcy = cy - by
        //       const doc = acx * bcx + acy * bcy
        //       // const diff = ownCondition.y < ay + r ? ownCondition.y - ay - r :
        //       // by - r < ownCondition.y ? ownCondition.y - by + r : 0
        //       if (
        //         (doc < 0
        //         //   && ay + r <= ownCondition.y && ownCondition.y <= by - r) ||
        //         // ((ay < ownCondition.y && ownCondition.y < ay + r) ||
        //         // (by - r < ownCondition.y && ownCondition.y < by)) &&
        //         // -(ax - ownCondition.x - ownCondition.dx) <
        //         // r * Math.cos((diff / r) * (Math.PI / 2)
        //         )
        //       ) {
        //         console.log('detect left wall')
        //         // ownCondition.dx = -ownCondition.dx * elasticModulus
        //         // ownCondition.x = ax + r
        //         ownCondition.dx = -ownCondition.dx * elasticModulus.x
        //         // ownCondition.dy *= brakeConstant
        //         flag = true
        //       }
        //     }
        //   }
        // }
      }
    })
    ownCondition.x += ownCondition.dx
    ownCondition.y += ownCondition.dy
    elasticModulus.x = 0
    elasticModulus.y = 0
  } while(flag)
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
  context.beginPath()
  context.moveTo(ownCondition.x, ownCondition.y)
  context.lineTo(ownCondition.x + ownCondition.dx * size, ownCondition.y)
  context.lineTo(ownCondition.x + ownCondition.dx * size, ownCondition.y + 1)
  context.lineTo(ownCondition.x, ownCondition.y + 1)
  context.fill()
  context.beginPath()
  context.moveTo(ownCondition.x, ownCondition.y)
  context.lineTo(ownCondition.x, ownCondition.y + ownCondition.dy * size)
  context.lineTo(ownCondition.x + 1, ownCondition.y + ownCondition.dy * size)
  context.lineTo(ownCondition.x + 1, ownCondition.y)
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
    context.fillText(v, size * 2, size * (3 + i))
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