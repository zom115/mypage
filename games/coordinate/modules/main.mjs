import {key} from '../../../modules/key.mjs'
const canvas = document.getElementById`canvas`
const context = canvas.getContext`2d`
const size = 16
let state = 'title'
let time = {start: 0, elapsed: 0, best: 0}
let left
let alphabet = [
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
  'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
]
let coordinate
let target = {}
const shuffle = arg => {
  for (let i = arg.length - 1; i > 0; i=(i-1)|0) {
    let r = ~~(Math.random() * (i + 1))
    ;[arg[i], arg[r]] = [arg[r], arg[i]]
  }
}
const reset = () => {
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
const title = () => {
  if (key[' '].flag) {
    reset()
    time.start = Date.now()
    state = 'game'
  }
}
const game = () => {
  time.elapsed = Date.now() - time.start
  if (
    key[coordinate.x[target.x[target.x.length - 1]]].flag &&
    key[coordinate.y[target.y[target.y.length - 1]]].flag
  ) {
    left -= 1
    target.x.pop()
    target.y.pop()
    if (left === 0) {
      if (time.elapsed < time.best || time.best === 0) time.best = time.elapsed
      state = 'title'
    }
  }
}
setInterval(() => {
  if (state === 'title') title()
  else if (state === 'game') game()
}, 0)
const draw = () => {
  window.requestAnimationFrame(draw)
  context.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
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
      if (key[coordinate.x[i]].flag) {
        context.fillStyle = 'hsla(300, 100%, 50%, .2)'
        context.fillRect(margin - size * .5 + size * 3 * i, margin - size * 5, size, canvas.offsetHeight - size * 3)
      }
      if (key[coordinate.y[i]].flag) {
        context.fillStyle = 'hsla(300, 100%, 50%, .2)'
        context.fillRect(margin - size * 4.5, margin - size * 1 + size * 3 * i, canvas.offsetWidth - size * 3.5, size)
      }
      context.textAlign = 'center'
      context.fillStyle = (key[coordinate.x[i]].flag) ? 'hsl(300, 100%, 50%)' : 'hsl(0, 100%, 100%)'
      context.fillText(coordinate.x[i], margin + size * 3 * i, margin - size * 3)
      context.fillStyle = (key[coordinate.y[i]].flag) ? 'hsl(300, 100%, 50%)' : 'hsl(0, 100%, 100%)'
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
draw()