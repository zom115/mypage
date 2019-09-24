!(x = arg => {'use strict'

const canvas = document.getElementById`canvas`
const context = canvas.getContext`2d`
const size = 16
let state = 'title'
let time = {start: 0, elapsed: 0, best: 0}
let left
let alphabet = [
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
  'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
]
let coordinate
let target = {}
let key = {
  shiftFlag: false, shift: 0,
  spaceFlag: false, space: 0,
  aFlag: false, a: 0,
  bFlag: false, b: 0,
  cFlag: false, c: 0,
  dFlag: false, d: 0,
  eFlag: false, e: 0,
  fFlag: false, f: 0,
  gFlag: false, g: 0,
  hFlag: false, h: 0,
  iFlag: false, i: 0,
  jFlag: false, j: 0,
  kFlag: false, k: 0,
  lFlag: false, l: 0,
  mFlag: false, m: 0,
  nFlag: false, n: 0,
  oFlag: false, o: 0,
  pFlag: false, p: 0,
  qFlag: false, q: 0,
  rFlag: false, r: 0,
  sFlag: false, s: 0,
  tFlag: false, t: 0,
  uFlag: false, u: 0,
  vFlag: false, v: 0,
  wFlag: false, w: 0,
  xFlag: false, x: 0,
  yFlag: false, y: 0,
  zFlag: false, z: 0
}
document.addEventListener('keydown', e => {
  if (e.keyCode === 32) {
    if (e.preventDefault) e.preventDefault()
    else {
      e.keyCode = 0
      return false
    }
  }
}, false)
document.addEventListener('keydown', e => {
  if (e.keyCode === 16) key.shiftFlag = true
  if (e.keyCode === 32) key.spaceFlag = true
  if (e.keyCode === 65) key.aFlag = true
  if (e.keyCode === 66) key.bFlag = true
  if (e.keyCode === 67) key.cFlag = true
  if (e.keyCode === 68) key.dFlag = true
  if (e.keyCode === 69) key.eFlag = true
  if (e.keyCode === 70) key.fFlag = true
  if (e.keyCode === 71) key.gFlag = true
  if (e.keyCode === 72) key.hFlag = true
  if (e.keyCode === 73) key.iFlag = true
  if (e.keyCode === 74) key.jFlag = true
  if (e.keyCode === 75) key.kFlag = true
  if (e.keyCode === 76) key.lFlag = true
  if (e.keyCode === 77) key.mFlag = true
  if (e.keyCode === 78) key.nFlag = true
  if (e.keyCode === 79) key.oFlag = true
  if (e.keyCode === 80) key.pFlag = true
  if (e.keyCode === 81) key.qFlag = true
  if (e.keyCode === 82) key.rFlag = true
  if (e.keyCode === 83) key.sFlag = true
  if (e.keyCode === 84) key.tFlag = true
  if (e.keyCode === 85) key.uFlag = true
  if (e.keyCode === 86) key.vFlag = true
  if (e.keyCode === 87) key.wFlag = true
  if (e.keyCode === 88) key.xFlag = true
  if (e.keyCode === 89) key.yFlag = true
  if (e.keyCode === 90) key.zFlag = true
}, false)
document.addEventListener('keyup', e => {
  if (e.keyCode === 16) key.shiftFlag = false, key.shift = 0
  if (e.keyCode === 32) key.spaceFlag = false, key.space = 0
  if (e.keyCode === 65) key.aFlag = false, key.a = 0
  if (e.keyCode === 66) key.bFlag = false, key.b = 0
  if (e.keyCode === 67) key.cFlag = false, key.c = 0
  if (e.keyCode === 68) key.dFlag = false, key.d = 0
  if (e.keyCode === 69) key.eFlag = false, key.e = 0
  if (e.keyCode === 70) key.fFlag = false, key.f = 0
  if (e.keyCode === 71) key.gFlag = false, key.g = 0
  if (e.keyCode === 72) key.hFlag = false, key.h = 0
  if (e.keyCode === 73) key.iFlag = false, key.i = 0
  if (e.keyCode === 74) key.jFlag = false, key.j = 0
  if (e.keyCode === 75) key.kFlag = false, key.k = 0
  if (e.keyCode === 76) key.lFlag = false, key.l = 0
  if (e.keyCode === 77) key.mFlag = false, key.m = 0
  if (e.keyCode === 78) key.nFlag = false, key.n = 0
  if (e.keyCode === 79) key.oFlag = false, key.o = 0
  if (e.keyCode === 80) key.pFlag = false, key.p = 0
  if (e.keyCode === 81) key.qFlag = false, key.q = 0
  if (e.keyCode === 82) key.rFlag = false, key.r = 0
  if (e.keyCode === 83) key.sFlag = false, key.s = 0
  if (e.keyCode === 84) key.tFlag = false, key.t = 0
  if (e.keyCode === 85) key.uFlag = false, key.u = 0
  if (e.keyCode === 86) key.vFlag = false, key.v = 0
  if (e.keyCode === 87) key.wFlag = false, key.w = 0
  if (e.keyCode === 88) key.xFlag = false, key.x = 0
  if (e.keyCode === 89) key.yFlag = false, key.y = 0
  if (e.keyCode === 90) key.zFlag = false, key.z = 0
}, false)
const inputProcess = () => {
  if (key.shiftFlag) key.shift += 1
  if (key.spaceFlag) key.space += 1
  if (key.aFlag) key.a += 1
  if (key.bFlag) key.b += 1
  if (key.cFlag) key.c += 1
  if (key.dFlag) key.d += 1
  if (key.eFlag) key.e += 1
  if (key.fFlag) key.f += 1
  if (key.gFlag) key.g += 1
  if (key.hFlag) key.h += 1
  if (key.iFlag) key.i += 1
  if (key.jFlag) key.j += 1
  if (key.kFlag) key.k += 1
  if (key.lFlag) key.l += 1
  if (key.mFlag) key.m += 1
  if (key.nFlag) key.n += 1
  if (key.oFlag) key.o += 1
  if (key.pFlag) key.p += 1
  if (key.qFlag) key.q += 1
  if (key.rFlag) key.r += 1
  if (key.sFlag) key.s += 1
  if (key.tFlag) key.t += 1
  if (key.uFlag) key.u += 1
  if (key.vFlag) key.v += 1
  if (key.wFlag) key.w += 1
  if (key.xFlag) key.x += 1
  if (key.yFlag) key.y += 1
  if (key.zFlag) key.z += 1
}
const shuffle = arg => {
  for (let i = arg.length - 1; i > 0; i=(i-1)|0) {
    let r = ~~(Math.random() * (i + 1))
    ; [arg[i], arg[r]] = [arg[r], arg[i]]
  }
}
const reset = () => {
  if (time.elapsed < time.best || time.best === 0) time.best = time.elapsed
  time.elapsed = 0
  left = 13
  shuffle(alphabet)
  coordinate = {x: alphabet.slice(0, 13), y: alphabet.slice(13, 26)}
  let numset = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  shuffle(numset)
  target.x = numset.concat()
  shuffle(numset)
  target.y = numset.concat()
}
reset()
const game = () => {
  time.elapsed = Date.now() - time.start
  if (
    key[coordinate.x[target.x[target.x.length - 1]]] &&
    key[coordinate.y[target.y[target.y.length - 1]]]
  ) {
    left -= 1
    target.x.pop()
    target.y.pop()
    if (left === 0) {
      reset()
      state = 'title'
    }
  }
}
const internalProcess = () => {
  inputProcess()
  if (state === 'title') {
    if (key['space']) {
      state = 'game'
      time.start = Date.now()
    }
  } else if (state === 'game') game()
}
const draw = () => {
  context.font = `${size}px sans-serif`
  context.fillStyle = 'hsl(0, 100%, 100%)'
  context.textAlign = 'right'
  let mm = ('0' + ~~(time.best / 6e4)).slice(-2)
  let ss = ('0' + ~~(time.best % 6e4 / 1e3)).slice(-2)
  let ms = ('00' + ~~(time.best % 1e3)).slice(-3)
  context.fillText(
    `best time : ${mm}:${ss}:${ms}`, canvas.offsetWidth - size, size * 1.5
  )
  mm = ('0' + ~~(time.elapsed / 6e4)).slice(-2)
  ss = ('0' + ~~(time.elapsed % 6e4 / 1e3)).slice(-2)
  ms = ('00' + ~~(time.elapsed % 1e3)).slice(-3)
  context.fillText(
    `time : ${mm}:${ss}:${ms}`, canvas.offsetWidth - size * 15, size * 1.5
  )
  if (state === 'title') {
    context.textAlign = 'center'
    context.fillText(
      'title', canvas.offsetWidth / 2, canvas.offsetHeight * 1 / 3
    )
    context.fillText(
      'press SPACE to start', canvas.offsetWidth / 2, canvas.offsetHeight * 2 / 3
    )
  } else if (state === 'game') {
    context.textAlign = 'left'
    context.fillText(
      `left : ${left}`, canvas.offsetWidth - size * 35, size * 1.5
    )
    const margin = size * 7
    for (let i = 0; i < coordinate.x.length; i++) {
      context.font = `${size * 2}px sans-serif`
      if (key[coordinate.x[i]]) {
        context.fillStyle = 'hsla(300, 100%, 50%, .2)'
        context.fillRect(margin - size * .5 + size * 3 * i, margin - size * 5, size, canvas.offsetHeight - size * 3)
      }
      if (key[coordinate.y[i]]) {
        context.fillStyle = 'hsla(300, 100%, 50%, .2)'
        context.fillRect(margin - size * 4.5, margin - size * 1 + size * 3 * i, canvas.offsetWidth - size * 3.5, size)
      }
      context.textAlign = 'center'
      context.fillStyle = (key[coordinate.x[i]]) ? 'hsl(300, 100%, 50%)' : 'hsl(0, 100%, 100%)'
      context.fillText(coordinate.x[i], margin + size * 3 * i, margin - size * 3)
      context.fillStyle = (key[coordinate.y[i]]) ? 'hsl(300, 100%, 50%)' : 'hsl(0, 100%, 100%)'
      context.fillText(coordinate.y[i], margin - size * 3, margin + size * 3 * i)
      context.fillStyle = 'hsl(0, 100%, 100%)'
      context.fillRect(margin - size * 1.5 + size * 3 * i, margin - size * 5, 1, canvas.offsetHeight - size * 3)
      context.fillRect(margin - size * 4.5, margin - size * 2 + size * 3 * i, canvas.offsetWidth - size * 3.5, 1)
    }
    for (let i = 12; 12 - target.x.length < i; i--) {
      context.fillStyle = (i === 13 - target.x.length) ? 'hsl(120, 100%, 50%)'
      : 'hsl(0, 100%, 100%)'
      context.fillText(
        i + 1,
        margin + target.x[12 - i] * size * 3,
        margin + size / 4 + target.y[12 - i] * size * 3
      )
    }
  }
}
const main = () => {
  internalProcess()
  context.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
  draw()
  window.requestAnimationFrame(main)
}
main()

})()