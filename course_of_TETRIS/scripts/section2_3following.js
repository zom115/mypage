const canvas = document.getElementById(('myCanvas'))
const context = canvas.getContext('2d')
var currentTetrimino = []
const nextNumber = 3
var blockSize = 32
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

var x = y = 0
function makeTetrimino(){
  Array.prototype.push.apply(currentTetrimino, shuffle(makeArray))
}
function drawTetrimino(arr){
  for (var i = 0;  i < arr.length;  i++) {
    for (var j = 0;  j < arr[i].length;  j++) {
      if (arr[i][j] === 1) {
        context.fillStyle = currentTetrimino[0].color
        context.fillRect(x + j * blockSize, y + i * blockSize, blockSize, blockSize)
      }
    }
  }
}

function onDown(e) {}

function onClick(e) {
  currentTetrimino.shift()
  console.log('length:' + currentTetrimino.length)
  console.log('next:')
  for (let i = 0; i < currentTetrimino[0].shape.length; i++){
    console.log(currentTetrimino[0].shape[i])
  }
}
var isMouseOver = false
function onMouseOver(e) {
  isMouseOver = true
}
function onMouseMove(e){
  x = e.clientX - canvas.offsetLeft
  y = e.clientY - canvas.offsetTop
}
function onMouseOut() {
  isMouseOver = false
  console.log('1')
}

function draw(){
  context.clearRect(0, 0, canvas.width, canvas.height)
  if (isMouseOver) {
    if (currentTetrimino.length < nextNumber) {
      makeTetrimino()
    }
    drawTetrimino(currentTetrimino[0].shape)
  }
  requestAnimationFrame(draw)
}
draw();
canvas.addEventListener('mousedown', onDown, false)
canvas.addEventListener('click', onClick, false)
canvas.addEventListener('mouseover', onMouseOver, false)
canvas.addEventListener('mousemove', onMouseMove, false)
canvas.addEventListener('mouseout', onMouseOut, false)