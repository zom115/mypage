const elementTd = document.getElementsByTagName`td`
Array.prototype.forEach.call(elementTd, e => {
  e.style.textAlign = 'right'
})
const divAtan = document.getElementById`div-atan`
divAtan.style.display = 'inline-block'
divAtan.style.minWidth = '10rem'
const divAtan2 = document.getElementById`div-atan2`
divAtan2.style.display = 'inline-block'
divAtan2.style.minWidth = '10rem'

const elementX = document.getElementById`x`
elementX.style.display = 'inline-block'
elementX.style.minWidth = '3rem'
elementX.style.textAlign = 'right'
const elementY = document.getElementById`y`
elementY.style.display = 'inline-block'
elementY.style.minWidth = '3rem'
elementY.style.textAlign = 'right'
const elementAtan = document.getElementById`atan-value`
elementAtan.style.display = 'inline-block'
elementAtan.style.minWidth = '3rem'
elementAtan.style.textAlign = 'right'
const elementAtanPI = document.getElementById`atan-PI-value`
elementAtanPI.style.display = 'inline-block'
elementAtanPI.style.minWidth = '3rem'
elementAtanPI.style.textAlign = 'right'
const elementAtanCos = document.getElementById`atan-cos-value`
elementAtanCos.style.display = 'inline-block'
elementAtanCos.style.minWidth = '3rem'
elementAtanCos.style.textAlign = 'right'
const elementAtanSin = document.getElementById`atan-sin-value`
elementAtanSin.style.display = 'inline-block'
elementAtanSin.style.minWidth = '3rem'
elementAtanSin.style.textAlign = 'right'
const elementAtan2 = document.getElementById`atan2-value`
elementAtan2.style.display = 'inline-block'
elementAtan2.style.minWidth = '3rem'
elementAtan2.style.textAlign = 'right'
const elementAtan2PI = document.getElementById`atan2-PI-value`
elementAtan2PI.style.display = 'inline-block'
elementAtan2PI.style.minWidth = '3rem'
elementAtan2PI.style.textAlign = 'right'
const elementAtan2Cos = document.getElementById`atan2-cos-value`
elementAtan2Cos.style.display = 'inline-block'
elementAtan2Cos.style.minWidth = '3rem'
elementAtan2Cos.style.textAlign = 'right'
const elementAtan2Sin = document.getElementById`atan2-sin-value`
elementAtan2Sin.style.display = 'inline-block'
elementAtan2Sin.style.minWidth = '3rem'
elementAtan2Sin.style.textAlign = 'right'
const r = 2 ** 6
const margin = 2 ** 6
const dot = 2 ** 2
const rem = 16
const atanCvs = document.getElementById`atan`
atanCvs.style.display = 'inline-block'
atanCvs.width = r * 2 + margin * 2 + 1
atanCvs.height = r * 2 + margin * 2 + 1
const atanCtx = atanCvs.getContext`2d`
let x = 0
let y = 0
const origin = {x: atanCvs.offsetWidth / 2, y: atanCvs.offsetHeight / 2,}
let flag = false
let atan = Math.atan(y / x)
let atan2 = Math.atan2(y, x)
const atan2Cvs = document.getElementById`atan2`
atan2Cvs.style.display = 'inline-block'
atan2Cvs.width = r * 2 + margin * 2 + 1
atan2Cvs.height = r * 2 + margin * 2 + 1
const atan2Ctx = atan2Cvs.getContext`2d`
atan2Ctx.fillRect(0, 0, 10, 10)
atanCtx.font = '1rem sans-serif'
atan2Ctx.font = '1rem sans-serif'
const draw = () => {
  atanCtx.clearRect(0, 0, atanCvs.offsetWidth, atanCvs.offsetHeight)
  atanCtx.fillText('atan', rem, rem)
  atanCtx.fillText('x+', atanCvs.offsetWidth - rem * 1.5, origin.y - rem / 8)
  atanCtx.fillText('y+', origin.x + rem / 8, atanCvs.offsetHeight - rem / 2)
  atanCtx.strokeStyle = 'hsl(0, 0%, 50%)'
  atanCtx.beginPath()
  atanCtx.moveTo(origin.x - Math.cos(Math.PI / 3) * r, origin.y + Math.sin(Math.PI / 3) * r)
  atanCtx.lineTo(origin.x + Math.cos(Math.PI / 3) * r, origin.y - Math.sin(Math.PI / 3) * r)
  atanCtx.moveTo(origin.x - Math.cos(Math.PI / 4) * r, origin.y + Math.sin(Math.PI / 4) * r)
  atanCtx.lineTo(origin.x + Math.cos(Math.PI / 4) * r, origin.y - Math.sin(Math.PI / 4) * r)
  atanCtx.moveTo(origin.x - Math.cos(Math.PI / 6) * r, origin.y + Math.sin(Math.PI / 6) * r)
  atanCtx.lineTo(origin.x + Math.cos(Math.PI / 6) * r, origin.y - Math.sin(Math.PI / 6) * r)
  atanCtx.moveTo(origin.x - Math.cos(Math.PI / 3) * r, origin.y - Math.sin(Math.PI / 3) * r)
  atanCtx.lineTo(origin.x + Math.cos(Math.PI / 3) * r, origin.y + Math.sin(Math.PI / 3) * r)
  atanCtx.moveTo(origin.x - Math.cos(Math.PI / 4) * r, origin.y - Math.sin(Math.PI / 4) * r)
  atanCtx.lineTo(origin.x + Math.cos(Math.PI / 4) * r, origin.y + Math.sin(Math.PI / 4) * r)
  atanCtx.moveTo(origin.x - Math.cos(Math.PI / 6) * r, origin.y - Math.sin(Math.PI / 6) * r)
  atanCtx.lineTo(origin.x + Math.cos(Math.PI / 6) * r, origin.y + Math.sin(Math.PI / 6) * r)
  atanCtx.closePath()
  atanCtx.stroke()
  atanCtx.strokeStyle = 'hsl(0, 0%, 0%)'
  atanCtx.beginPath()
  atanCtx.arc(origin.x, origin.y, r, 0, Math.PI * 2)
  atanCtx.moveTo(0, origin.y)
  atanCtx.lineTo(atanCvs.offsetWidth, origin.y)
  atanCtx.moveTo(origin.x, 0)
  atanCtx.lineTo(origin.x, atanCvs.offsetHeight)
  atanCtx.moveTo(origin.x, origin.y)
  atanCtx.lineTo(origin.x + Math.cos(atan) * r, origin.y + Math.sin(atan) * r)
  atanCtx.lineTo(origin.x + Math.cos(atan) * r, origin.y)
  atanCtx.fillText('cos', origin.x + Math.cos(atan) * r / 2 - rem * .75, origin.y + Math.sin(atan) * r - rem / 8)
  atanCtx.moveTo(origin.x + Math.cos(atan) * r, origin.y + Math.sin(atan) * r)
  atanCtx.lineTo(origin.x, origin.y + Math.sin(atan) * r)
  atanCtx.fillText('sin', origin.x + Math.cos(atan) * r + rem / 8, origin.y + Math.sin(atan) * r / 2 + rem / 4)
  atanCtx.closePath()
  atanCtx.stroke()
  atanCtx.beginPath()
  atanCtx.arc(origin.x + Math.cos(atan) * r, origin.y + Math.sin(atan) * r, dot, 0, Math.PI * 2)
  atanCtx.fill()
  if (x === 0 && y === 0) {
    atanCtx.fillText('You kidding!!', origin.x, rem)
  }
  atan2Ctx.clearRect(0, 0, atan2Cvs.offsetWidth, atan2Cvs.offsetHeight)
  atan2Ctx.fillText('atan2', rem, rem)
  atan2Ctx.fillText('x+', atan2Cvs.offsetWidth - rem * 1.5, origin.y - rem / 8)
  atan2Ctx.fillText('y+', origin.x + rem / 8, atan2Cvs.offsetHeight - rem / 2)
  atan2Ctx.strokeStyle = 'hsl(0, 0%, 50%)'
  atan2Ctx.beginPath()
  atan2Ctx.moveTo(origin.x - Math.cos(Math.PI / 3) * r, origin.y + Math.sin(Math.PI / 3) * r)
  atan2Ctx.lineTo(origin.x + Math.cos(Math.PI / 3) * r, origin.y - Math.sin(Math.PI / 3) * r)
  atan2Ctx.moveTo(origin.x - Math.cos(Math.PI / 4) * r, origin.y + Math.sin(Math.PI / 4) * r)
  atan2Ctx.lineTo(origin.x + Math.cos(Math.PI / 4) * r, origin.y - Math.sin(Math.PI / 4) * r)
  atan2Ctx.moveTo(origin.x - Math.cos(Math.PI / 6) * r, origin.y + Math.sin(Math.PI / 6) * r)
  atan2Ctx.lineTo(origin.x + Math.cos(Math.PI / 6) * r, origin.y - Math.sin(Math.PI / 6) * r)
  atan2Ctx.moveTo(origin.x - Math.cos(Math.PI / 3) * r, origin.y - Math.sin(Math.PI / 3) * r)
  atan2Ctx.lineTo(origin.x + Math.cos(Math.PI / 3) * r, origin.y + Math.sin(Math.PI / 3) * r)
  atan2Ctx.moveTo(origin.x - Math.cos(Math.PI / 4) * r, origin.y - Math.sin(Math.PI / 4) * r)
  atan2Ctx.lineTo(origin.x + Math.cos(Math.PI / 4) * r, origin.y + Math.sin(Math.PI / 4) * r)
  atan2Ctx.moveTo(origin.x - Math.cos(Math.PI / 6) * r, origin.y - Math.sin(Math.PI / 6) * r)
  atan2Ctx.lineTo(origin.x + Math.cos(Math.PI / 6) * r, origin.y + Math.sin(Math.PI / 6) * r)
  atan2Ctx.closePath()
  atan2Ctx.stroke()
  atan2Ctx.strokeStyle = 'hsl(0, 0%, 0%)'
  atan2Ctx.beginPath()
  atan2Ctx.arc(origin.x, origin.y, r, 0, Math.PI * 2)
  atan2Ctx.moveTo(0, origin.y)
  atan2Ctx.lineTo(atan2Cvs.offsetWidth, origin.y)
  atan2Ctx.moveTo(origin.x, 0)
  atan2Ctx.lineTo(origin.x, atan2Cvs.offsetHeight)
  atan2Ctx.moveTo(origin.x, origin.y)
  atan2Ctx.lineTo(origin.x + Math.cos(atan2) * r, origin.y + Math.sin(atan2) * r)
  atan2Ctx.lineTo(origin.x + Math.cos(atan2) * r, origin.y)
  atan2Ctx.fillText('cos', origin.x + Math.cos(atan2) * r / 2 - rem * .75, origin.y + Math.sin(atan2) * r - rem / 8)
  atan2Ctx.moveTo(origin.x + Math.cos(atan2) * r, origin.y + Math.sin(atan2) * r)
  atan2Ctx.lineTo(origin.x, origin.y + Math.sin(atan2) * r)
  atan2Ctx.fillText('sin', origin.x + Math.cos(atan2) * r + rem / 8, origin.y + Math.sin(atan2) * r / 2 + rem / 4)
  atan2Ctx.closePath()
  atan2Ctx.stroke()
  atan2Ctx.beginPath()
  atan2Ctx.arc(origin.x + Math.cos(atan2) * r, origin.y + Math.sin(atan2) * r, dot, 0, Math.PI * 2)
  atan2Ctx.fill()
}
const coordinate = (argX, argY) => {
  x = argX - r - margin
  y = argY - r - margin
  atan = Math.atan(y / x)
  atan2 = Math.atan2(y, x)
  elementX.innerHTML = x
  elementY.innerHTML = y
  elementAtan.textContent = atan.toFixed(2)
  elementAtan2.textContent = atan2.toFixed(2)
  elementAtanPI.innerHTML = (atan / Math.PI).toFixed(2)
  elementAtan2PI.innerHTML = (atan2 / Math.PI).toFixed(2)
  elementAtanCos.innerHTML = Math.cos(atan).toFixed(2)
  elementAtanSin.innerHTML = Math.sin(atan).toFixed(2)
  elementAtan2Cos.innerHTML = Math.cos(atan2).toFixed(2)
  elementAtan2Sin.innerHTML = Math.sin(atan2).toFixed(2)
  draw()
}
coordinate(r, r)
atanCvs.addEventListener('mousedown', e => {
  const target_rect = e.currentTarget.getBoundingClientRect()
  const x = e.clientX - target_rect.left|0
  const y = e.clientY - target_rect.top|0
  coordinate(x, y)
  flag = true
})
atanCvs.addEventListener('mousemove', e => {
  if (flag) {
    const target_rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - target_rect.left|0
    const y = e.clientY - target_rect.top|0
    coordinate(x, y)
  }
})

atan2Cvs.addEventListener('mousedown', e => {
  const target_rect = e.currentTarget.getBoundingClientRect()
  const x = e.clientX - target_rect.left|0
  const y = e.clientY - target_rect.top|0
  coordinate(x, y)
  flag = true
})
atan2Cvs.addEventListener('mousemove', e => {
  if (flag) {
    const target_rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - target_rect.left|0
    const y = e.clientY - target_rect.top|0
    coordinate(x, y)
  }
})
document.addEventListener('mouseup', () => flag = false)