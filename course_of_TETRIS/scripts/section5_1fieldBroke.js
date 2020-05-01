const canvas = document.getElementById(('myCanvas'))
const context = canvas.getContext('2d')
let screenX = screenY = 0
const nextNumber = 3
let size = 24
class Tetrimino{
  constructor(name, color, shape, condition = 0) {
    this.name = name
    this.color = color
    this.shape = shape
    this.condition = condition
  }
}
const T = new Tetrimino('T', '#0ff', [
  [0, 0, 0],
  [1, 1, 1],
  [0, 1, 0]])
const J = new Tetrimino('J', '#00f', [
  [0, 0, 0],
  [1, 1, 1],
  [0, 0, 1]])
const L = new Tetrimino('L', '#f60', [
  [0, 0, 0],
  [1, 1, 1],
  [1, 0, 0]])
const Z = new Tetrimino('Z', '#0f0', [
  [0, 0, 0],
  [1, 1, 0],
  [0, 1, 1]])
const S = new Tetrimino('S', '#f0f', [
  [0, 0, 0],
  [0, 1, 1],
  [1, 1, 0]])
const I = new Tetrimino('I', '#f00', [
  [0, 0, 0, 0],
  [1, 1, 1, 1],
  [0, 0, 0, 0],
  [0, 0, 0, 0]])
const O = new Tetrimino('O', '#ff0', [
  [0, 0, 0],
  [0, 1, 1],
  [0, 1, 1]])
const tetriminoSet = [T, J, L, Z, S, I, O]
let nextTetrimino = []
let current
function shuffle() {
  let arr = ['T', 'J', 'L', 'Z', 'S', 'I', 'O']
  for (let i = arr.length - 1; i > 0; i--){
    let r = Math.floor(Math.random() * (i + 1))
    let tmp = arr[i]
    arr[i] = arr[r]
    arr[r] = tmp
  }
  return arr
}

function drawTetrimino() {
  for (let i = 0;  i < current.shape.length;  i++) {
    for (let j = 0;  j < current.shape[i].length;  j++) {
      if (current.shape[i][j] === 1) {
        context.fillStyle = current.color
        context.fillRect(locationX + j * size, locationY + i * size, size, size)
      }
    }
  }
}
function drawNext() {
  let next = tetriminoSet.find(x => x.name === nextTetrimino[1])
  for (let i = 0;  i < next.shape.length;  i++) {
    for (let j = 0;  j < next.shape[i].length;  j++) {
      if (next.shape[i][j] === 1) {
        context.fillStyle = next.color
        context.fillRect(size * (5 + j),size * (1 + i), size, size)
      }
    }
  }
}
function rotation(clockwise) {
  let rows = current.shape.length
  let columns = current.shape.length
  let baffer = new Array(rows)
  for (let i = 0; i < columns; i++) {
    baffer[i] = new Array(rows).fill(0)
  }
  if (clockwise) {
    for (let i = 0;  i < rows;  i++) {
      for (let j = 0;  j < columns;  j++) {
        baffer[j][i] = current.shape[columns - i - 1][j]
      }
    }    
  }else{
    for (let i = 0;  i < rows;  i++) {
      for (let j = 0;  j < columns;  j++) {
        baffer[j][i] = current.shape[i][rows - j - 1]
      }
    }
  }
  current.shape = baffer
}
function chkCondition(clockwise) {
  current.condition %= 4
  console.log(current.condition)
  if (current.name === 'O') {
  }else if(current.name === 'Z') {
    if(current.condition % 2) {
      rotation(true)
    }else{
      rotation(false)
    }
  }else if(current.name === 'S' || current.name === 'I') {
    if(current.condition % 2) {
      rotation(false)
    }else{
      rotation(true)
    }
  }else{
    if (clockwise) {
      if (current.condition === 2) {
        let buffer = current.shape.shift()
        current.shape.push(buffer)
      }
      rotation(true)
      if (current.condition === 3) {
        let buffer = current.shape.pop()
        current.shape.unshift(buffer)
      }
    }else{
      if (current.condition === 2) {
        let buffer = current.shape.shift()
        current.shape.push(buffer)
      }
      rotation(false)
      if (current.condition === 1) {
        let buffer = current.shape.pop()
        current.shape.unshift(buffer)
      }
    }
  }
}

function onDown(e) {
  if (screenX < canvas.width / 2) {
    chkCondition(false)
    current.condition += 1
  }else{
    chkCondition(true)
    current.condition += 3
  }
}
function onClick(e) {}
function onMouseMove(e) {
  screenX = e.clientX - canvas.offsetLeft
  screenY = e.clientY - canvas.offsetTop
}

let locationX = size * 5
let locationY = size * 5
let dx = size
let dy = 1

const empty = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]
let field = [
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0]
]
for (let i = 0; i < 20; i++) {
  field.push(empty)
}

for (let i = 0; i < field.length; i++){
  console.log(field[field.length - i - 1])
}

console.log('setup')
context.fillStyle = '#ccc'
context.fillRect(size, size, size * 12, size * 25)
context.clearRect(size * 5, size * 2, size * 4, size * 2)
nextTetrimino.push(...shuffle())
current = tetriminoSet.find(x => x.name === nextTetrimino[0])
drawNext()

function draw(){
  context.clearRect(size * 2, size * 5, size * 10, size * 20)
  // lottery
  if (nextTetrimino.length < nextNumber) {
    nextTetrimino.push(...shuffle())
  }
  drawTetrimino()
  locationY += dy
  //next
  if (canvas.height - size * 4 < locationY) {
    nextTetrimino.shift()
    console.log(`length: ${nextTetrimino.length}`)
    current = tetriminoSet.find(x => x.name === nextTetrimino[0])
    locationY = size * 5
    context.clearRect(size * 5, size * 2, size * 4, size * 2)
    drawNext()
  }
  requestAnimationFrame(draw)
}
draw();

canvas.addEventListener('mousedown', onDown, false)
canvas.addEventListener('click', onClick, false)
canvas.addEventListener('mousemove', onMouseMove, false)