{
'use strict'
const imageCanvas = document.getElementById`drawCanvas`
const imageContext = imageCanvas.getContext`2d`

const cnv = imageCanvas
const ctx = imageContext

const imagePathList = [
  'images/TP2F.png',
  'images/TP2U.png',
  'images/TP2RU.png',
  'images/TP2R.png',
  'images/TP2RD.png',
  'images/TP2D.png',
  'images/TP2LD.png',
  'images/TP2L.png',
  'images/TP2LU.png',
  'images/TP2F.png',
  'images/JK32F.png', // 10
  'images/JK32L.png',
  'images/JK32R.png'
]
let loadedList = []
let loadedMap = []

imagePathList.forEach(function (imagePath) {
  const img = new Image()
  img.src = imagePath
  img.onload = function () {
    loadedList.push(imagePath)
    loadedMap[imagePath] = img
  }
})
const timerId = setInterval(function () { // 読み込み監視
  if (loadedList.length === imagePathList.length) { // 連想配列ではlengthがあてにならない
    clearInterval(timerId)
    imageLoop()
  }
}, 100)

const frameLimit = 120
let frame = 0
const tLimit = 60
let tFrame = 0

const drawImage = () => {
  const frameSector = [40, 60, 100]
  let img = frame < frameSector[0] || frameSector[1] <= frame && frame < frameSector[2]
  ? loadedMap[imagePathList[12]]
  : loadedMap[imagePathList[10]]
  ctx.save()
  let imgOffset
  if (frameSector[1] <= frame && frame < frameSector[2]) {
    imgOffset = -(cnv.offsetWidth + img.width) / 2
    ctx.scale(-1, 1)
  } else {
    imgOffset = (cnv.offsetWidth - img.width) / 2
  }
  ctx.drawImage(img,
    imgOffset,
    (cnv.offsetHeight - img.height) / 2)
  ctx.restore()
}
const drawTP = () => {
  const frameSector = [10, 30, 45]
  let img = 'images/TP2F.png'
  const imgOffset = [
    (cnv.offsetWidth - loadedMap[img].width) * 3 / 4,
    (cnv.offsetHeight - loadedMap[img].height) / 2
  ]
  if (tFrame < frameSector[1]) img = 'images/TP2R.png'
  if (frameSector[0] <= tFrame && tFrame <= frameSector[2]) {
    ctx.drawImage(loadedMap[img], imgOffset[0], imgOffset[1] - 1)
  } else ctx.drawImage(loadedMap[img], imgOffset[0], imgOffset[1])
}
const drawTapioca = () => {
  const frameSector = [25, 8, 36, 53]
  let img = 'images/TP2F.png'
  const imgOffset = [
    (cnv.offsetWidth - loadedMap[img].width) / 4,
    (cnv.offsetHeight - loadedMap[img].height) / 2
  ]
  if (frameSector[1] <= tFrame && tFrame <= frameSector[3]) img = 'images/TP2R.png'
  if (frameSector[0] <= tFrame && tFrame <= frameSector[2]) {
    ctx.drawImage(loadedMap[img], imgOffset[0], imgOffset[1] - 1)
  } else ctx.drawImage(loadedMap[img], imgOffset[0], imgOffset[1])
}
const drawIndicator = () => {
  ctx.fillRect(frame - 1, ~~(((frame - 30) ** 2) / 15 + (cnv.offsetHeight - 1) - 60), 1, 1)
  ctx.fillRect(frame - 1, ~~(((frame - 90) ** 2) / 15 + (cnv.offsetHeight - 1) - 60), 1, 1)
  ctx.fillRect(frame - 1, cnv.offsetHeight - 30, 1, 1)
  ctx.fillRect(cnv.offsetWidth / 2 + frame - 1, cnv.offsetHeight - 30, 1, 1)
  if (frame <= frameLimit / 4) {
    ctx.fillRect(cnv.offsetWidth / 2 + frame - 1, -frame * 2 + cnv.offsetHeight - 1, 1, 1)
  } else if (frameLimit / 4 <= frame && frame <= frameLimit / 2) {
    ctx.fillRect(cnv.offsetWidth / 2 + frame - 1, frame * 2 - 120 + cnv.offsetHeight - 1, 1, 1)
  } else if (frameLimit / 2 <= frame && frame <= frameLimit * 3 / 4) {
    ctx.fillRect(cnv.offsetWidth / 2 + frame - 1, -(frame - 60) * 2 + cnv.offsetHeight - 1, 1, 1)
  } else {
    ctx.fillRect(cnv.offsetWidth / 2 + frame - 1, frame * 2 - 240 + cnv.offsetHeight - 1, 1, 1)
  }
  if (!bool) {
    ctx.clearRect(0, cnv.offsetHeight * 2 / 3, frame, cnv.offsetHeight / 3)
    ctx.clearRect(cnv.offsetWidth / 2, cnv.offsetHeight * 2 / 3, frame, cnv.offsetHeight / 3)
  }

}
let bool = true
const imageLoop = x => {
  frame = (frame + 1)|0
  tFrame = (tFrame + 1)|0
  ctx.clearRect(0, 0, cnv.offsetWidth, cnv.offsetHeight * 2 / 3)
  drawImage()
  drawTP()
  drawTapioca()
  drawIndicator()
  if (frameLimit <= frame ) {
    frame = 0
    if (bool) bool = false
    else bool = true
  }
  if (tLimit <= tFrame) tFrame = 0
  requestAnimationFrame(imageLoop)
}

}