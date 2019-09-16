const canvas = document.getElementById(('myCanvas'))
const context = canvas.getContext('2d')
let screenX = screenY = 0
const nextNumber = 3
let size = 24
let nextTetrimino = []
let current = {
  name: 'a',
  color: '#000',
  shape: [[]],
  condition: 0
}
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
function setTetrimino(obj, target) {
  switch (target) {
    case 'T':
      obj.name = 'T'
      obj.color = '#0ff'
      obj.shape = [
        [0, 0, 0],
        [1, 1, 1],
        [0, 1, 0]]
      break;
    case 'J':
      obj.name = 'J'
      obj.color = '#00f'
      obj.shape = [
        [0, 0, 0],
        [1, 1, 1],
        [0, 0, 1]]
      break;
    case 'L':
      obj.name = 'L'
      obj.color = '#f60'
      obj.shape = [
        [0, 0, 0],
        [1, 1, 1],
        [1, 0, 0]]
      break;
    case 'Z':
      obj.name = 'Z'
      obj.color = '#0f0'
      obj.shape = [
        [0, 0, 0],
        [1, 1, 0],
        [0, 1, 1]]
      break;
    case 'S':
      obj.name = 'S'
      obj.color = '#f0f'
      obj.shape = [
        [0, 0, 0],
        [0, 1, 1],
        [1, 1, 0]]
      break;
    case 'I':
      obj.name = 'I'
      obj.color = '#f00'
      obj.shape = [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]]
      break;
    case 'O':
      obj.name = 'O'
      obj.color = '#ff0'
      obj.shape = [
        [0, 0, 0],
        [0, 1, 1],
        [0, 1, 1]]
      break;
  }
  obj.condition = 0
  return obj
}
function drawTetrimino() {
  for (let i = 0;  i < current.shape.length;  i++) {
    for (let j = 0;  j < current.shape[i].length;  j++) {
      if (current.shape[i][j] === 1) {
        field[minoDigitalY + i - 1][minoDigitalX + j - 1] = 1
        context.fillStyle = current.color
        context.fillRect(locationX + j * size, locationY + i * size, size, size)
      }
    }
  }
}
function drawNext() {
  let next = {
    name: 'a',
    color: '#000',
    shape: [[]],
    condition: 0
  }
  setTetrimino(next, nextTetrimino[1])
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
  switch (current.name) {
    case 'O':
      break;
    case 'Z':
      if(current.condition % 2) {
        rotation(true)
      }else{
        rotation(false)
      }
      break;
    case 'S':
    case 'I':
      if(current.condition % 2) {
        rotation(false)
      }else{
        rotation(true)
      }
      break;
    default:
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
      break;
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

let minoOffsetX = 5
let minoDigitalX = minoOffsetX
let locationX = size * minoOffsetX
let minoOffsetY = 1
let minoDigitalY = minoOffsetY
let locationOffsetY = 4
let locationY = size * locationOffsetY
let dx = size
let dy = 1

const empty = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]
let field = [
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0]
]
for (let i = 0; i < 21; i++) {
  field.unshift(empty.concat())
}
let testSize = 5
let sizeOffsetTop = 4
let sizeOffsetLeft = 1
function debugPointing() {
  for (let i = 0;  i < field.length;  i++) {
    for (let j = 0;  j < field[i].length;  j++) {
      if (field[i][j] === 1) {
        context.fillStyle = '#333'
        context.fillRect((j + sizeOffsetLeft) * size, (i + sizeOffsetTop) * size, testSize, testSize)
      }else{
        context.fillStyle = '#fff'
        context.fillRect((j + sizeOffsetLeft) * size, (i + sizeOffsetTop) * size, testSize, testSize)
      }
    }
  }
}

let fixedDelay = 0

function landing() {
  if (size * 22 <= locationY) {
    fixedDelay += 1
    if(40 < fixedDelay){
      // set next tetrimino
      fixedDelay = 0
      nextTetrimino.shift()
      if (nextTetrimino.length < nextNumber) {
        nextTetrimino.push(...shuffle())
      }
      // console.log(`length: ${nextTetrimino.length}`)
      setTetrimino(current, nextTetrimino[0])
      locationY = size * 4
      // show next
      context.clearRect(size * 5, size * 2, size * 4, size * 2)
      drawNext()
    }
  }else{
    // falling
    locationY += dy
    minoDigitalY = minoOffsetY + Math.floor( + locationY / size) - locationOffsetY
    if(!fixedDelay === 0) {
      fixedDelay = 0
    }
  }
}

function refresh() {
  context.clearRect(size * 2, size * 5, size * 10, size * 20)
  for (let i = 0;  i < current.shape.length;  i++) {
    for (let j = 0;  j < current.shape[i].length;  j++) {
      if (current.shape[i][j] === 1) {
        field[minoDigitalY + i - 1][minoDigitalX + j - 1] = 0
      }
    }
  }
}

function setup() {
context.fillStyle = '#ccc'
context.fillRect(size, size, size * 12, size * 25)
context.clearRect(size * 5, size * 2, size * 4, size * 2)
nextTetrimino.push(...shuffle())
setTetrimino(current, nextTetrimino[0])
drawNext()
}
setup()
function draw(){
  refresh()
  landing()

  drawTetrimino()
  debugPointing()

  requestAnimationFrame(draw)
}
draw();

canvas.addEventListener('mousedown', onDown, false)
canvas.addEventListener('click', onClick, false)
canvas.addEventListener('mousemove', onMouseMove, false)