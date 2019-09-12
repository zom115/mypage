var canvas = document.getElementById(('myCanvas'))
var context = canvas.getContext('2d')
var currentTetrimino = []
var nextNumber = 3
var blockSize = 10
var T = [
  [0, 0, 0],
  [1, 1, 1],
  [0, 1, 0]
]
var J = [
  [0, 0, 0],
  [1, 1, 1],
  [0, 0, 1]
]
var L = [
  [0, 0, 0],
  [1, 1, 1],
  [1, 0, 0]
]
var Z = [
  [0, 0, 0],
  [1, 1, 0],
  [0, 1, 1]
]
var S = [
  [0, 0, 0],
  [0, 1, 1],
  [1, 1, 0]
]
var I = [
  [0, 0, 0, 0],
  [1, 1, 1, 1],
  [0, 0, 0, 0],
  [0, 0, 0, 0]
]
var O = [
  [1, 1],
  [1, 1]
]
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
  drawTetrimino(x, y, currentTetrimino[0])
  currentTetrimino.shift()
    console.log('next:')
  for (let i = 0; i < currentTetrimino[0].length; i++){
    console.log(currentTetrimino[0][i])
  }
}

function onClick(e) {
}

canvas.addEventListener('mousedown', onDown, false)
canvas.addEventListener('click', onClick, false)