const dot = 2 ** 2
const rem = 16
const a = {x: 0, y: 0}
const b = {x: rem * 6, y: rem * 7}
const c = {x: rem * 2, y: rem * 5}
const d = {x: rem * 4, y: rem * 3}
let crossFlag = false
let selector = 'a'
let flag = false
let abx = b.x - a.x
let aby = b.y - a.y
let cdx = d.x - c.x
let cdy = d.y - c.y
let abD = 0
let cdD = 0
let diffDegree = 0

const cCvs = document.getElementById`cross`
cCvs.style.display = 'inline-block'
cCvs.width = rem ** 2 / 2 + 1
cCvs.height = rem ** 2 / 2 + 1
const cCtx = cCvs.getContext`2d`
const elementCrossContainer = document.getElementById`cross-container`
elementCrossContainer.style.display = 'inline-block'
const elementCrossFlag = document.getElementById`cross-flag`
const elementSelector = document.getElementById`selector`
const dCvs = document.getElementById`degree`
dCvs.style.display = 'inline-block'
dCvs.width = rem ** 2 + 1
dCvs.height = rem ** 2 + 1
const dCtx = dCvs.getContext`2d`
const elementDegreeContainer = document.getElementById`degree-container`
elementDegreeContainer.style.display = 'inline-block'
const elementDegree1 = document.getElementById`degree1`
const elementDegree2 = document.getElementById`degree2`
const elementDegreeD = document.getElementById`degreeD`
const elementDegreeF = document.getElementById`degreeF`
const elementDegreePI = document.getElementById`degreePI`

cCtx.font = '1rem san-serif'
dCtx.font = '1rem san-serif'
const draw = () => {
  cCtx.clearRect(0, 0, cCvs.offsetWidth, cCvs.offsetHeight)
  cCtx.beginPath()
  cCtx.arc(a.x, a.y, dot, 0, Math.PI * 2)
  cCtx.fillText('a', a.x + rem / 2, a.y + rem / 4)
  cCtx.fill()
  cCtx.beginPath()
  cCtx.arc(b.x, b.y, dot, 0, Math.PI * 2)
  cCtx.fillText('b', b.x + rem / 2, b.y + rem / 4)
  cCtx.fill()
  cCtx.beginPath()
  cCtx.moveTo(a.x, a.y)
  cCtx.lineTo(b.x, b.y)
  cCtx.closePath()
  cCtx.stroke()
  cCtx.beginPath()
  cCtx.arc(c.x, c.y, dot, 0, Math.PI * 2)
  cCtx.fillText('c', c.x + rem / 2, c.y + rem / 4)
  cCtx.fill()
  cCtx.beginPath()
  cCtx.arc(d.x, d.y, dot, 0, Math.PI * 2)
  cCtx.fillText('d', d.x + rem / 2, d.y + rem / 4)
  cCtx.fill()
  cCtx.beginPath()
  cCtx.moveTo(c.x, c.y)
  cCtx.lineTo(d.x, d.y)
  cCtx.closePath()
  cCtx.stroke()

  dCtx.clearRect(0, 0, dCvs.offsetWidth, dCvs.offsetHeight)
  dCtx.beginPath()
  dCtx.moveTo(0, dCvs.offsetWidth / 2)
  dCtx.lineTo(dCvs.offsetWidth, dCvs.offsetHeight / 2)
  dCtx.moveTo(dCvs.offsetWidth / 2, 0)
  dCtx.lineTo(dCvs.offsetWidth / 2, dCvs.offsetHeight)
  dCtx.moveTo(dCvs.offsetWidth / 2, dCvs.offsetHeight / 2)
  dCtx.lineTo(dCvs.offsetWidth / 2 + abx, dCvs.offsetHeight / 2 + aby)
  dCtx.moveTo(dCvs.offsetWidth / 2, dCvs.offsetHeight / 2)
  dCtx.lineTo(dCvs.offsetWidth / 2 + cdx, dCvs.offsetHeight / 2 + cdy)
  dCtx.closePath()
  dCtx.stroke()
  elementCrossFlag.textContent = crossFlag
  elementSelector.textContent = selector
  elementDegree1.textContent = abD.toFixed(2)
  elementDegree2.textContent = cdD.toFixed(2)
  elementDegreeD.textContent = (cdD - abD).toFixed(2)
  elementDegreeF.textContent = diffDegree.toFixed(2)
  elementDegreePI.textContent = (diffDegree / Math.PI).toFixed(2)
}

const isCross = () => {
  crossFlag = false
  abx = b.x - a.x
  aby = b.y - a.y
  cdx = d.x - c.x
  cdy = d.y - c.y
  let nx = -cdy
  let ny = cdx
  let length = (nx ** 2 + ny ** 2) ** .5
  if (0 < length) length = 1 / length
  nx *= length
  ny *= length
  const de = -(c.x * nx + c.y * ny)
  const tm = -(nx * a.x + ny * a.y + de) / (nx * abx + ny * aby)
  if (0 < tm && tm <= 1) {
    const cx = a.x + abx * tm
    const cy = a.y + aby * tm
    const acx = cx - c.x
    const acy = cy - c.y
    const bcx = cx - d.x
    const bcy = cy - d.y
    const doc = acx * bcx + acy * bcy
    if (doc < 0) crossFlag = true
  }
  abD = Math.atan2(aby, abx)
  cdD = Math.atan2(cdy, cdx)
  diffDegree = cdD - abD
  if (diffDegree < -Math.PI) diffDegree += Math.PI * 2
  else if (Math.PI < diffDegree) diffDegree -= Math.PI * 2
  draw()
}

const movePoint = (x, y) => {
  if ((x - a.x) ** 2 + (y - a.y) ** 2 < dot ** 2) selector = 'a'
  else if ((x - b.x) ** 2 + (y - b.y) ** 2 < dot ** 2 * 2) selector = 'b'
  else if ((x - c.x) ** 2 + (y - c.y) ** 2 < dot ** 2 * 2) selector = 'c'
  else if ((x - d.x) ** 2 + (y - d.y) ** 2 < dot ** 2 * 2) selector = 'd'
  if (selector === 'a') {
    a.x = x
    a.y = y
  }
  else if (selector === 'b') {
    b.x = x
    b.y = y
  }
  else if (selector === 'c') {
    c.x = x
    c.y = y
  }
  else if (selector === 'd') {
    d.x = x
    d.y = y
  }
  isCross()
}
movePoint(rem, rem)
cCvs.addEventListener('mousedown', e => {
  flag = true
  const target_rect = e.currentTarget.getBoundingClientRect()
  const x = e.clientX - target_rect.left|0
  const y = e.clientY - target_rect.top|0
  movePoint(x, y)
})
cCvs.addEventListener('mousemove', e => {
  if (flag) {
    const target_rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - target_rect.left|0
    const y = e.clientY - target_rect.top|0
    movePoint(x, y)
  }
})
document.addEventListener('mouseup', () => flag = false)
