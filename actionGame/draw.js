'use strict';{
const imageCanvas = document.getElementById`drawCanvas`
const imageContext = imageCanvas.getContext`2d`

const cnv = imageCanvas
const ctx = imageContext

const imagePathList = ['./img/TP2F.png', './img/TP2U.png', './img/TP2RU.png', './img/TP2R.png'
, './img/TP2RD.png', './img/TP2D.png', './img/TP2LD.png', './img/TP2L.png', './img/TP2LU.png'
, './img/TP2F.png', "./img/JK32F.png", "./img/JK32L.png", "./img/JK32R.png"]
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
  let img = new Image()
  img.src = './img/JK32F.png'
  const imgOffset = [(cnv.offsetWidth - img.width) / 2, (cnv.offsetHeight - img.height) / 2]
  ctx.save()
  if (frame < frameSector[0]) img.src = './img/JK32R.png'
  else if (frameSector[1] <= frame && frame < frameSector[2]) {
    img.src = './img/JK32R.png'
    imgOffset[0] = -imgOffset[0] - img.width
    ctx.scale(-1, 1)
  }
  ctx.drawImage(img, imgOffset[0], imgOffset[1])
  ctx.restore()
}
const drawTP = () => {
  const frameSector = [10, 30, 45]
  let img = new Image()
  img.src = './img/TP2F.png'
  const imgOffset = [(cnv.offsetWidth - img.width) * 3 / 4, (cnv.offsetHeight - img.height) / 2]
  if (tFrame < frameSector[1]) img.src = './img/TP2R.png'
  if (frameSector[0] <= tFrame && tFrame <= frameSector[2]) {
    ctx.drawImage(img, imgOffset[0], imgOffset[1] - 1)
  } else ctx.drawImage(img, imgOffset[0], imgOffset[1])
}
const drawTapioca = () => {
  const frameSector = [25, 8, 36, 53]
  let img = new Image()
  img.src = './img/TP2F.png'
  const imgOffset = [(cnv.offsetWidth - img.width) / 4, (cnv.offsetHeight - img.height) / 2]
  if (frameSector[1] <= tFrame && tFrame <= frameSector[3]) img.src = './img/TP2R.png'
  if (frameSector[0] <= tFrame && tFrame <= frameSector[2]) {
    ctx.drawImage(img, imgOffset[0], imgOffset[1] - 1)
  } else ctx.drawImage(img, imgOffset[0], imgOffset[1])
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