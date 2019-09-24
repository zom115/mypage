const canvas = document.getElementById(('myCanvas'))
const context = canvas.getContext('2d')
var currentTetrimino = []
const nextNumber = 3
var blockSize = 10
class Tetrimino{
  constructor(shape, color){
    this.shape = shape
    this.color = color
  }
}
const T = new Tetrimino([
  [0, 0, 0],
  [1, 1, 1],
  [0, 1, 0]
], '#0ff')
const J = new Tetrimino([
  [0, 0, 0],
  [1, 1, 1],
  [0, 0, 1]
], '#00f')
const L = new Tetrimino([
  [0, 0, 0],
  [1, 1, 1],
  [1, 0, 0]
], '#f60')
const Z = new Tetrimino([
  [0, 0, 0],
  [1, 1, 0],
  [0, 1, 1]
], '#0f0')
const S = new Tetrimino([
  [0, 0, 0],
  [0, 1, 1],
  [1, 1, 0]
], '#f0f')
const I = new Tetrimino([
  [0, 0, 0, 0],
  [1, 1, 1, 1],
  [0, 0, 0, 0],
  [0, 0, 0, 0]
], '#f00')
const O = new Tetrimino([
  [1, 1],
  [1, 1]
], '#ff0')
makeArray = [T, J, L, Z, S, I, O]

function shuffle(arr){
  for (var i = arr.length - 1; i > 0; i--){
    var r = Math.floor(Math.random() * (i + 1))
    var tmp = arr[i]
    arr[i] = arr[r]
    arr[r] = tmp
  }
  return arr
}

function drawTetrimino(x, y, arr){
  for (var i = 0;  i < arr.length;  i++) {
    for (var j = 0;  j < arr[i].length;  j++) {
      if (arr[i][j] === 1) {
        console.log(currentTetrimino[0].color)
        context.fillStyle = currentTetrimino[0].color
        context.fillRect(x + j * blockSize, y + i * blockSize, blockSize, blockSize)
      }
    }
  }
}

function onDown(e) {
  var x = e.clientX - canvas.offsetLeft
  var y = e.clientY - canvas.offsetTop
  console.log('x:', x, 'y:', y)
  if (currentTetrimino.length < nextNumber) {
    Array.prototype.push.apply(currentTetrimino, shuffle(makeArray))
  }
  console.log('length:' + currentTetrimino.length)
  drawTetrimino(x, y, currentTetrimino[0].shape)
  currentTetrimino.shift()
    console.log('next:')
  for (let i = 0; i < currentTetrimino[0].shape.length; i++){
    console.log(currentTetrimino[0].shape[i])
  }
  /*
  */
}

function onClick(e) {
}

canvas.addEventListener('mousedown', onDown, false)
canvas.addEventListener('click', onClick, false)