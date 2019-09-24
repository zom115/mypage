const canvas = document.getElementById(('myCanvas'))
const context = canvas.getContext('2d')
var nextTetrimino = []
const nextNumber = 3
var blockSize = 32
var isMouseOver = false
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
var current = new Tetrimino([
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0]
], '#000')
makeArray = [T, J, L, Z, S, I, O]

function shuffle(arr){
  for (let i = arr.length - 1; i > 0; i--){
    let r = Math.floor(Math.random() * (i + 1))
    let tmp = arr[i]
    arr[i] = arr[r]
    arr[r] = tmp
  }
  return arr
}

var x = y = 0
function makeTetrimino(){
  Array.prototype.push.apply(nextTetrimino, shuffle(makeArray))
}
function drawTetrimino(arr){
  for (let i = 0;  i < arr.length;  i++) {
    for (let j = 0;  j < arr[i].length;  j++) {
      if (arr[i][j] === 1) {
        context.fillStyle = nextTetrimino[0].color
        context.fillRect(x + j * blockSize, y + i * blockSize, blockSize, blockSize)
      }
    }
  }
}
function rotationA(arr) {
  let rows = arr.length
  let columns = arr[0].length
  current.shape = new Array(rows)
  for (let i = 0; i < columns; i++) {
    current.shape[i] = new Array(rows).fill(0)
  }
  for (let i = 0;  i < rows;  i++) {
    for (let j = 0;  j < columns;  j++) {
      current.shape[j][i] = arr[i][rows - j - 1]
    }
  }
  return current.shape
}
function rotationB(arr) {
  let rows = arr.length
  let columns = arr[0].length
  current.shape = new Array(rows)
  for (let i = 0; i < columns; i++) {
    current.shape[i] = new Array(rows).fill(0)
  }
  for (let i = 0;  i < rows;  i++) {
    for (let j = 0;  j < columns;  j++) {
      current.shape[j][i] = arr[columns - i - 1][j]
    }
  }
  return current.shape
}

function onDown(e) {
  if (x < canvas.width / 2) {
    nextTetrimino[0].shape = rotationA(nextTetrimino[0].shape)
  }else{
    nextTetrimino[0].shape = rotationB(nextTetrimino[0].shape)
  }
}
function onClick(e) {}
function onMouseOver(e) {
  isMouseOver = true
}
function onMouseMove(e){
  x = e.clientX - canvas.offsetLeft
  y = e.clientY - canvas.offsetTop
}
function onMouseOut() {
  isMouseOver = false
  nextTetrimino.shift()
  console.log('length:' + nextTetrimino.length)
  console.log('next:')
  for (let i = 0; i < nextTetrimino[0].shape.length; i++){
    console.log(nextTetrimino[0].shape[i])
  }
}

function draw(){
  context.clearRect(0, 0, canvas.width, canvas.height)
  if (isMouseOver) {
    if (nextTetrimino.length < nextNumber) {
      makeTetrimino()
    }
    drawTetrimino(nextTetrimino[0].shape)
  }
  requestAnimationFrame(draw)
}
draw();

canvas.addEventListener('mousedown', onDown, false)
canvas.addEventListener('click', onClick, false)
canvas.addEventListener('mouseover', onMouseOver, false)
canvas.addEventListener('mousemove', onMouseMove, false)
canvas.addEventListener('mouseout', onMouseOut, false)