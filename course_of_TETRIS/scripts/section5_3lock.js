const canvas = document.getElementById(('myCanvas'))
const context = canvas.getContext('2d')
const bgColor = '#222'
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

// mino.. 配列ベースの位置関係
// location.. sizeベースの位置関係 = size * mono

const minoOffsetLeft = 5
let minoDigitalX = minoOffsetLeft
let locationX = size * minoOffsetLeft

const minoOffsetTop = 1
let minoDigitalY = minoOffsetTop
// next表示分にheaderとってあるからminoOffsetTopよりズレる
// next分ってことを明示するconst置けばよくない？
const nextMinoOffsetTop = 3
let locationY = size * (minoOffsetTop + nextMinoOffsetTop)
let dy = 1
let LockDelayTime = 0
let LockDelayLimit = 30
const testSize = 5
const sizeOffsetTop = 4
const sizeOffsetLeft = 1
const empty = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]
let field = [
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0]
]
for (let i = 0; i < 21; i++) {
  field.unshift(empty.concat())
}
function onDown(e) {
  if (screenX < canvas.width / 2) {
    rotation(false)
    current.condition += 1
  }else{
    rotation(true)
    current.condition += 3
  }
}
function onClick(e) {}
function onMouseMove(e) {
  screenX = e.clientX - canvas.offsetLeft
  screenY = e.clientY - canvas.offsetTop
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
  let nextShowX = minoOffsetLeft * size
  let nextShowY = 2 * size
  let nextShowWidth = 4 * size
  let nextShowHeight = 2 * size
  context.clearRect(nextShowX, nextShowY, nextShowWidth, nextShowHeight)
  setTetrimino(next, nextTetrimino[0])
  for (let i = 0;  i < next.shape.length;  i++) {
    for (let j = 0;  j < next.shape[i].length;  j++) {
      if (next.shape[i][j] === 1) {
        context.fillStyle = next.color
        context.fillRect(size * (minoOffsetLeft + j),size * (minoOffsetTop + i), size, size)
      }
    }
  }
}
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
function roll(clockwise) {
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
function rotation(clockwise) {
  refreshCurrent()
  current.condition %= 4
  switch (current.name) {
    case 'O':
      break;
    case 'Z':
      if(current.condition % 2) {
        roll(true)
      }else{
        roll(false)
      }
      break;
    case 'S':
    case 'I':
      if(current.condition % 2) {
        roll(false)
      }else{
        roll(true)
      }
      break;
    default:
      if (clockwise) {
        if (current.condition === 2) {
          let buffer = current.shape.shift()
          current.shape.push(buffer)
        }
        roll(true)
        if (current.condition === 3) {
          let buffer = current.shape.pop()
          current.shape.unshift(buffer)
        }
      }else{
        if (current.condition === 2) {
          let buffer = current.shape.shift()
          current.shape.push(buffer)
        }
        roll(false)
        if (current.condition === 1) {
          let buffer = current.shape.pop()
          current.shape.unshift(buffer)
        }
      }
      break;
  }
}
function judgment() {
  // landing

  if (size * 22 <= locationY) {
    LockDelayTime += 1
    if(LockDelayLimit <= LockDelayTime){
      for (let i = 0;  i < current.shape.length;  i++) {
        for (let j = 0;  j < current.shape[i].length;  j++) {
          if (current.shape[i][j] === 1) {
            field[minoDigitalY + i - 1][minoDigitalX + j - 1] = 1
            context.fillStyle = current.color
            context.fillRect(locationX + j * size, locationY + i * size, size, size)
          }
        }
      }
      LockDelayTime = 0
      // nextTetrimino.shift()
      // lottery
      if (nextTetrimino.length < nextNumber) {
        nextTetrimino.push(...shuffle())
      }
      setTetrimino(current, nextTetrimino.shift())
      locationY = size * (minoOffsetTop + nextMinoOffsetTop)
      minoDigitalY = minoOffsetTop
      drawNext()
    }
  }else{
    // falling
    locationY += dy
    minoDigitalY = Math.floor(locationY / size) - nextMinoOffsetTop
    if(!LockDelayTime === 0) {
      LockDelayTime = 0
    }
  }
}
function refreshCurrent() {
  for (let i = 0;  i < current.shape.length;  i++) {
    for (let j = 0;  j < current.shape[i].length;  j++) {
      if (current.shape[i][j] === 1) {
        field[minoDigitalY + i - 1][minoDigitalX + j - 1] = 0
        context.fillStyle = bgColor
        context.fillRect(locationX + j * size, locationY + i * size, size, size)
      }
    }
  }
}
function refresh() {
  //context.clearRect(size * 2, size * 5, size * 10, size * 20)
  refreshCurrent()
}

!function() {
  context.fillStyle = '#ccc'
  context.fillRect(size, size, size * field[0].length, size * (nextMinoOffsetTop + field.length))
  context.fillStyle = bgColor
  const fieldOffsetLeft = size * 2
  const fieldOffsetTop = size * 5
  const fieldWidth = size * 10
  const fieldHeight = size * 20
  context.fillRect(fieldOffsetLeft, fieldOffsetTop, fieldWidth, fieldHeight)
  nextTetrimino.push(...shuffle())
  setTetrimino(current, nextTetrimino.shift())
  drawNext()
  }()// setup
  function draw(){
    refresh()
    judgment()

    drawTetrimino()
    debugPointing()

    requestAnimationFrame(draw)
}
draw();

canvas.addEventListener('mousedown', onDown, false)
canvas.addEventListener('click', onClick, false)
canvas.addEventListener('mousemove', onMouseMove, false)