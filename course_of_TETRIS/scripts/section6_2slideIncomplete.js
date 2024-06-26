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
let lockDelayTime = 0
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
let jFired = 0
let lFired = 0
let kFired = 0
let sFired = 0
let fFired = 0
let jEvent = true
let lEvent = true
let kEvent = true
let sEvent = true
let fEvent = true
function onKeyDown(e) {
  // j or l
  if (e.keyCode === 74 ) {
    jFired += 1
  }
  if (e.keyCode === 76) {
    lFired += 1
  }
  if (e.keyCode === 75) {
    kFired += 1
  }
  // s 83
  if (e.keyCode === 83) {
    sFired += 1
  }
  // f 70
  if (e.keyCode === 70) {
    fFired += 1
  }
}
function onKeyUp(e) {
  if (e.keyCode === 74) {
    jFired = 0
    jEvent = true
  }
  if (e.keyCode === 76) {
    lFired = 0
    lEvent = true
  }
  if (e.keyCode === 75) {
    kFired = 0
    kEvent = true
  }
  if (e.keyCode === 83) {
    sFired = 0
    sEvent = true
  }
  if (e.keyCode === 70) {
    fFired = 0
    fEvent = true
  }
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
function rotation(clockwise) {
  refresh()
  current.condition %= 4
  let originalShape = current.shape
  let isOverlap = false
  let rows = current.shape.length
  let columns = current.shape[0].length
  let buffer = new Array(rows)
  for (let i = 0; i < columns; i++) {
    buffer[i] = new Array(rows).fill(0)
  }
  function roll(clockwise) {
    if (clockwise) {
      for (let i = 0;  i < rows;  i++) {
        for (let j = 0;  j < columns;  j++) {
          buffer[j][i] = current.shape[columns - i - 1][j]
        }
      }    
    }else{
      for (let i = 0;  i < rows;  i++) {
        for (let j = 0;  j < columns;  j++) {
          buffer[j][i] = current.shape[i][rows - j - 1]
        }
      }
    }
    current.shape = buffer
  }
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
      // ここで配列の破壊的な入れ替えをしてるからrollだけやっても付け焼き刃
      if (clockwise) {
        if (current.condition === 2) {
          let bufferShape = current.shape.shift()
          current.shape.push(bufferShape)
        }
        roll(true)
        if (current.condition === 3) {
          let bufferShape = current.shape.pop()
          current.shape.unshift(bufferShape)
        }
      }else{
        if (current.condition === 2) {
          let bufferShape = current.shape.shift()
          current.shape.push(bufferShape)
        }
        roll(false)
        if (current.condition === 1) {
          let bufferShape = current.shape.pop()
          current.shape.unshift(bufferShape)
        }
      }
      break;
  }
  for (let i = 0;  i < rows;  i++) {
    for (let j = 0;  j < columns;  j++) {
      if (buffer[i][j] === 1) {
        console.log(field[minoDigitalY + i - 1][minoDigitalX + j - 1])
        if (field[minoDigitalY + i - 1][minoDigitalX + j - 1] === 1) {
          isOverlap = true
        }
      }
    }
  }
  if(lockDelayTime === 0){
    isOverlap = chkUnder()
  }
  if (isOverlap) {
    current.shape = originalShape
  }else{
    if (clockwise) {
      current.condition += 3
    } else {
      current.condition += 1
    }
  }
}
function chkUnder() {
  for (let i = 0;  i < current.shape.length;  i++) {
    for (let j = 0;  j < current.shape[i].length;  j++) {
      if (current.shape[i][j] === 1) {
        if (field[minoDigitalY + i][minoDigitalX + j - 1] === 1) {
          return true
        }
      }
    }
  }
}
function judgment() {
  // landing
  if (chkUnder()) {
    lockDelayTime += 1
    if(LockDelayLimit <= lockDelayTime){
      for (let i = 0;  i < current.shape.length;  i++) {
        for (let j = 0;  j < current.shape[i].length;  j++) {
          if (current.shape[i][j] === 1) {
            field[minoDigitalY + i - 1][minoDigitalX + j - 1] = 1
            context.fillStyle = current.color
            context.fillRect(locationX + j * size, locationY + i * size, size, size)
          }
        }
      }
      lockDelayTime = 0
      // lottery
      if (nextTetrimino.length < nextNumber) {
        nextTetrimino.push(...shuffle())
      }
      setTetrimino(current, nextTetrimino.shift())
      minoDigitalX = minoOffsetLeft
      locationX = size * minoOffsetLeft
      minoDigitalY = minoOffsetTop
      locationY = size * (minoOffsetTop + nextMinoOffsetTop)
      drawNext()
    }
  }else{
    // falling
    locationY += dy
    minoDigitalY = Math.floor(locationY / size) - nextMinoOffsetTop
    if(0 < lockDelayTime) {
      lockDelayTime = 0
    }
  }
}
function refresh() {
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
function slideLeft() {
  refresh()
  let detect = false
  for (let i = 0;  i < current.shape.length;  i++) {
    for (let j = 0;  j < current.shape[i].length;  j++) {
      if (current.shape[i][j] === 1) {
        if (field[minoDigitalY + i - 1][minoDigitalX + j - 2] === 1) {
          detect = true
        }
      }
    }
  }
  if (!detect) {
    minoDigitalX -= 1
    locationX = size * minoDigitalX
  }
}
function slideRight() {
  refresh()
  let detect = false
  for (let i = 0;  i < current.shape.length;  i++) {
    for (let j = 0;  j < current.shape[i].length;  j++) {
      if (current.shape[i][j] === 1) {
        if (field[minoDigitalY + i - 1][minoDigitalX + j] === 1) {
          detect = true
        }
      }
    }
  }
  if (!detect) {
    minoDigitalX += 1
    locationX = size * minoDigitalX
  }
}

// setup
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
  }()
  function draw(){
    console.log(lockDelayTime)
    refresh()
    judgment()

    drawTetrimino()
    debugPointing()
    if (0 < jFired && jEvent) {
      rotation(false)
      jEvent = false
    }
    if (0 < lFired && lEvent) {
      rotation(false)
      lEvent = false
    }
    if (0 < kFired && kEvent) {
      rotation(true)
      kEvent = false
    }
    if (0 < sFired && sEvent) {
      if (14 <= sFired) {
        slideLeft()
      }else{
      slideLeft()
      sEvent = false
      }
    }
    if (0 < fFired && fEvent) {
      slideRight()
      fEvent = false
    }
    requestAnimationFrame(draw)
}
draw();

document.addEventListener('keydown', onKeyDown, false)
document.addEventListener('keyup', onKeyUp, false)