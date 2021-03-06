const canvas = document.getElementById(('myCanvas'))
const context = canvas.getContext('2d')
let nextTetrimino = []
let x = y = 0
const nextNumber = 3
let blockSize = 24
let isMouseOver = false
class Tetrimino{
  constructor(name, color, shape, condition = 0){
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
  [1, 1],
  [1, 1]])
let makeArray = [T, J, L, Z, S, I, O]

function shuffle(){
  for (let i = makeArray.length - 1; i > 0; i--){
    let r = Math.floor(Math.random() * (i + 1))
    let tmp = makeArray[i]
    makeArray[i] = makeArray[r]
    makeArray[r] = tmp
  }
  return makeArray
}

function drawTetrimino(){
  for (let i = 0;  i < nextTetrimino[0].shape.length;  i++) {
    for (let j = 0;  j < nextTetrimino[0].shape[i].length;  j++) {
      if (nextTetrimino[0].shape[i][j] === 1) {
        context.fillStyle = nextTetrimino[0].color
        context.fillRect(x + j * blockSize, y + i * blockSize, blockSize, blockSize)
      }
    }
  }
}
function rotation(clockwise) {
  let rows = nextTetrimino[0].shape.length
  let columns = nextTetrimino[0].shape.length
  let baffer = new Array(rows)
  for (let i = 0; i < columns; i++) {
    baffer[i] = new Array(rows).fill(0)
  }
  if (clockwise) {
    for (let i = 0;  i < rows;  i++) {
      for (let j = 0;  j < columns;  j++) {
        baffer[j][i] = nextTetrimino[0].shape[columns - i - 1][j]
      }
    }    
  }else{
    for (let i = 0;  i < rows;  i++) {
      for (let j = 0;  j < columns;  j++) {
        baffer[j][i] = nextTetrimino[0].shape[i][rows - j - 1]
      }
    }
  }
  nextTetrimino[0].shape = baffer
}
function chkCondition(clockwise){
  nextTetrimino[0].condition %= 4
  console.log(nextTetrimino[0].condition)
  if (nextTetrimino[0].name === 'O') {
  }else if(nextTetrimino[0].name === 'Z'){
    if(nextTetrimino[0].condition % 2){
      rotation(true)
    }else{
      rotation(false)
    }
  }else if(nextTetrimino[0].name === 'S' || nextTetrimino[0].name === 'I'){
    if(nextTetrimino[0].condition % 2){
      rotation(false)
    }else{
      rotation(true)
    }
  }else{
    if (clockwise) {
      if (nextTetrimino[0].condition === 2) {
        let buffer = nextTetrimino[0].shape.shift()
        nextTetrimino[0].shape.push(buffer)
      }
      rotation(true)
      if (nextTetrimino[0].condition === 3) {
        let buffer = nextTetrimino[0].shape.pop()
        nextTetrimino[0].shape.unshift(buffer)
      }
    }else{
      if (nextTetrimino[0].condition === 2) {
        let buffer = nextTetrimino[0].shape.shift()
        nextTetrimino[0].shape.push(buffer)
      }
      rotation(false)
      if (nextTetrimino[0].condition === 1) {
        let buffer = nextTetrimino[0].shape.pop()
        nextTetrimino[0].shape.unshift(buffer)
      }
    }
  }
}

function onDown(e) {
  if (x < canvas.width / 2) {
    chkCondition(false)
    nextTetrimino[0].condition += 1
  }else{
    chkCondition(true)
    nextTetrimino[0].condition += 3
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
  console.log(`length: ${nextTetrimino.length}`)
  console.log('next:')
  for (let i = 0; i < nextTetrimino[0].shape.length; i++){
    console.log(nextTetrimino[0].shape[i])
  }
}

function draw(){
  context.clearRect(0, 0, canvas.width, canvas.height)
  if (isMouseOver) {
    if (nextTetrimino.length < nextNumber) {
      nextTetrimino.push(...shuffle())
    }
    drawTetrimino()
  }
  requestAnimationFrame(draw)
}
draw();

canvas.addEventListener('mousedown', onDown, false)
canvas.addEventListener('click', onClick, false)
canvas.addEventListener('mouseover', onMouseOver, false)
canvas.addEventListener('mousemove', onMouseMove, false)
canvas.addEventListener('mouseout', onMouseOut, false)