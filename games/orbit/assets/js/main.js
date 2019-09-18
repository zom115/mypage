!(_ = () => {'use strict'

const canvas = document.getElementById`canvas`
const context = canvas.getContext`2d`
const size = 16
let posX = {x: canvas.offsetWidth / 8, y: canvas.offsetHeight / 4.5}
let posY = {x: canvas.offsetWidth / 8, y: canvas.offsetHeight / 4.5}
let radX = 0
let object = []
const exitLine = canvas.offsetWidth * ((size - 1) / size)
let timer = 0
let count = 0
let death = 0
let stage = 1
let bossFlag = false
let bossLife = 0
let bossPosition = {}
const firstBossStage = 18
let ball = {
  x: 0,
  y: 0,
  attackFlag: false,
  radius: size * 2.5,
  speed: size / 4,
  direction: 0,
  timer: 0,
  timerLimit: 360
}
let firstMessage = true
let defeatFlag = false
let extraFlag = false
const operation = () => {
  [posX.x, posX.y, posY.x, posY.y] = [posY.x, posY.y, posX.x, posX.y]
  radX = (180 < radX) ? radX - 180 : radX + 180
  count += 1
}
document.addEventListener('keydown', operation, false)
canvas.addEventListener('mousedown', operation, false)

const createObject = () => {
  const setObject = (x, y, w, h) => {
    return {
      x: (canvas.offsetWidth * x)|0, y: (canvas.offsetHeight * y)|0,
      w: (canvas.offsetWidth * w)|0, h: (canvas.offsetHeight * h)|0
    }
  }
  object = (stage === 1) ? [
    setObject(4  / 16, 7  / 16, 1 / 16, 1 / 16),
    setObject(5  / 16, 8  / 16, 1 / 16, 1 / 16),
    setObject(6  / 16, 9  / 16, 1 / 16, 1 / 16),
    setObject(1  / 16, 10 / 16, 7 / 16, 1 / 16),
    setObject(4  / 16, 13 / 16, 1 / 16, 1 / 16),
    setObject(5  / 16, 12 / 16, 1 / 16, 1 / 16),
    setObject(6  / 16, 11 / 16, 1 / 16, 1 / 16),
    setObject(11 / 16, 2  / 16, 1 / 16, 1 / 16),
    setObject(12 / 16, 3  / 16, 1 / 16, 1 / 16),
    setObject(13 / 16, 4  / 16, 1 / 16, 1 / 16),
    setObject(8  / 16, 5  / 16, 7 / 16, 1 / 16),
    setObject(11 / 16, 8  / 16, 1 / 16, 1 / 16),
    setObject(12 / 16, 7  / 16, 1 / 16, 1 / 16),
    setObject(13 / 16, 6  / 16, 1 / 16, 1 / 16)
  ] : (stage === 2) ? [
    setObject(1  / 16, 7 / 8, 1 / 16, 1 / 8),
    setObject(2  / 16, 6 / 8, 1 / 16, 1 / 8),
    setObject(3  / 16, 5 / 8, 1 / 16, 1 / 8),
    setObject(4  / 16, 4 / 8, 1 / 16, 1 / 8),
    setObject(5  / 16, 3 / 8, 1 / 16, 1 / 8),
    setObject(6  / 16, 0    , 1 / 16, 1 / 8),
    setObject(7  / 16, 1 / 8, 1 / 16, 1 / 8),
    setObject(8  / 16, 2 / 8, 1 / 16, 1 / 8),
    setObject(9  / 16, 3 / 8, 1 / 16, 1 / 8),
    setObject(9  / 16, 7 / 8, 1 / 16, 1 / 8),
    setObject(10 / 16, 6 / 8, 1 / 16, 1 / 8),
    setObject(11 / 16, 5 / 8, 1 / 16, 1 / 8),
    setObject(12 / 16, 4 / 8, 1 / 16, 1 / 8),
    setObject(13 / 16, 3 / 8, 1 / 16, 1 / 8),
    setObject(14 / 16, 2 / 8, 1 / 16, 1 / 8)
  ] : (stage === 3) ? [
    setObject(1 / 4, 0    , 1 / 32, 1 / 4),
    setObject(1 / 4, 1 / 2, 1 / 32, 2 / 4),
    setObject(2 / 4, 0    , 1 / 32, 3 / 6),
    setObject(2 / 4, 4 / 6, 1 / 32, 2 / 6),
    setObject(3 / 4, 0    , 1 / 32, 5 / 8),
    setObject(3 / 4, 6 / 8, 1 / 32, 2 / 8)
  ] : (stage === 4) ? [
    setObject(6  / 16, 2 / 8, 1 / 16, 1 / 8),
    setObject(6  / 16, 6 / 8, 1 / 16, 1 / 8),
    setObject(8  / 16, 0    , 1 / 16, 1 / 8),
    setObject(8  / 16, 4 / 8, 1 / 16, 1 / 8),
    setObject(10 / 16, 2 / 8, 1 / 16, 1 / 8),
    setObject(10 / 16, 6 / 8, 1 / 16, 1 / 8),
    setObject(12 / 16, 0    , 1 / 16, 1 / 8),
    setObject(12 / 16, 4 / 8, 1 / 16, 1 / 8)
  ] : (stage === 5) ? [
    setObject(2 / 8, 2 / 8, 1 / 32, 12 / 16),
    setObject(2 / 8, 4 / 8, 5 / 32, 1  / 16),
    setObject(4 / 8, 0    , 1 / 32, 12 / 16),
    setObject(4 / 8, 5 / 8, 4 / 32, 1  / 16),
    setObject(6 / 8, 2 / 8, 1 / 32, 14 / 16),
    setObject(5 / 8, 3 / 8, 5 / 32, 1  / 16)
  ] : (stage === 6) ? [
    setObject(0      , 7 / 8, 1 / 16, 1 / 8),
    setObject(2  / 16, 6 / 8, 1 / 16, 1 / 8),
    setObject(4  / 16, 5 / 8, 1 / 16, 1 / 8),
    setObject(6  / 16, 4 / 8, 1 / 16, 1 / 8),
    setObject(8  / 16, 3 / 8, 1 / 16, 1 / 8),
    setObject(10 / 16, 2 / 8, 1 / 16, 1 / 8),
    setObject(12 / 16, 1 / 8, 1 / 16, 1 / 8),
    setObject(14 / 16, 0 / 8, 1 / 16, 1 / 8),
    setObject(7  / 16, 1 / 8, 1 / 16, 1 / 8),
    setObject(9  / 16, 5 / 8, 1 / 16, 1 / 8),
    setObject(10 / 16, 7 / 8, 1 / 16, 1 / 8)
  ] : (stage === 7) ? [
    setObject(1 / 4,       timer % 1080 / 1080, 1 / 4, 2 / 3),
    setObject(1 / 4, - 1 + timer % 1080 / 1080, 1 / 4, 2 / 3),
    setObject(2 / 4,   1 - timer % 1080 / 1080, 1 / 4, 2 / 3),
    setObject(2 / 4,     - timer % 1080 / 1080, 1 / 4, 2 / 3)
  ] : (stage === 8) ? [
    setObject(3  / 16, 3 / 8, 1 / 16, 1 / 8),
    setObject(4  / 16, 2 / 8, 1 / 16, 1 / 8),
    setObject(5  / 16, 1 / 8, 1 / 16, 1 / 8),
    setObject(6  / 16, 0    , 1 / 16, 1 / 8),
    setObject(7  / 16, 1 / 8, 1 / 16, 1 / 8),
    setObject(8  / 16, 2 / 8, 1 / 16, 1 / 8),
    setObject(9  / 16, 3 / 8, 1 / 16, 1 / 8),
    setObject(10 / 16, 4 / 8, 1 / 16, 1 / 8),
    setObject(11 / 16, 1 / 8, 1 / 16, 1 / 8),
    setObject(12 / 16, 2 / 8, 1 / 16, 1 / 8),
    setObject(13 / 16, 3 / 8, 1 / 16, 1 / 8),
    setObject(14 / 16, 4 / 8, 1 / 16, 1 / 8),
    setObject(0      , 4 / 8, 1 / 16, 1 / 8),
    setObject(1  / 16, 5 / 8, 1 / 16, 1 / 8),
    setObject(2  / 16, 6 / 8, 1 / 16, 1 / 8),
    setObject(3  / 16, 7 / 8, 1 / 16, 1 / 8),
    setObject(4  / 16, 6 / 8, 1 / 16, 1 / 8),
    setObject(5  / 16, 5 / 8, 1 / 16, 1 / 8),
    setObject(6  / 16, 4 / 8, 1 / 16, 1 / 8),
    setObject(7  / 16, 5 / 8, 1 / 16, 1 / 8),
    setObject(8  / 16, 6 / 8, 1 / 16, 1 / 8),
    setObject(9  / 16, 7 / 8, 1 / 16, 1 / 8),
    setObject(11 / 16, 7 / 8, 1 / 16, 1 / 8),
    setObject(12 / 16, 6 / 8, 1 / 16, 1 / 8),
    setObject(13 / 16, 5 / 8, 1 / 16, 1 / 8)
  ] : (stage === 9) ? [
    setObject(2 / 8, 0    , 1 / 16, 1 / 16),
    setObject(3 / 8, 1 / 8, 1 / 16, 1 / 16),
    setObject(2 / 8, 2 / 8, 1 / 16, 1 / 16),
    setObject(3 / 8, 3 / 8, 1 / 16, 1 / 16),
    setObject(2 / 8, 4 / 8, 1 / 16, 1 / 16),
    setObject(3 / 8, 5 / 8, 1 / 16, 1 / 16),
    setObject(2 / 8, 6 / 8, 1 / 16, 1 / 16),
    setObject(3 / 8, 7 / 8, 1 / 16, 1 / 16),
    setObject(6 / 8, 0 / 8, 1 / 16, 1 / 16),
    setObject(5 / 8, 1 / 8, 1 / 16, 1 / 16),
    setObject(6 / 8, 2 / 8, 1 / 16, 1 / 16),
    setObject(5 / 8, 3 / 8, 1 / 16, 1 / 16),
    setObject(6 / 8, 4 / 8, 1 / 16, 1 / 16),
    setObject(5 / 8, 5 / 8, 1 / 16, 1 / 16),
    setObject(6 / 8, 6 / 8, 1 / 16, 1 / 16),
    setObject(5 / 8, 7 / 8, 1 / 16, 1 / 16),
  ] : (stage === 10) ? [
    setObject(4  / 16, 3 / 8, 1 / 16, 1 / 8),
    setObject(5  / 16, 2 / 8, 1 / 16, 1 / 8),
    setObject(5  / 16, 5 / 8, 1 / 16, 1 / 8),
    setObject(6  / 16, 6 / 8, 1 / 16, 1 / 8),
    setObject(8  / 16, 0    , 1 / 16, 1 / 8),
    setObject(9  / 16, 1 / 8, 1 / 16, 1 / 8),
    setObject(8  / 16, 2 / 8, 1 / 16, 1 / 8),
    setObject(6  / 16, 3 / 8, 1 / 16, 1 / 8),
    setObject(7  / 16, 5 / 8, 1 / 16, 1 / 8),
    setObject(9  / 16, 4 / 8, 1 / 16, 1 / 8),
    setObject(10 / 16, 3 / 8, 1 / 16, 1 / 8),
    setObject(11 / 16, 4 / 8, 1 / 16, 1 / 8)
  ] : (stage === 11) ? [
    setObject(2 / 8, 0    , 1  / 32, 8  / 16),
    setObject(0    , 4 / 8, 6  / 32, 1  / 16),
    setObject(2 / 8, 5 / 8, 1  / 32, 6  / 16),
    setObject(4 / 8, 1 / 8, 1  / 32, 12 / 16),
    setObject(3 / 8, 4 / 8, 10 / 32, 1  / 16),
    setObject(6 / 8, 0    , 1  / 32, 6  / 16),
    setObject(6 / 8, 4 / 8, 1  / 32, 8  / 16)
  ] : (stage === 12) ? [
    setObject(5  / 16, 0    , 1 / 16, 1 / 8),
    setObject(7  / 16, 0    , 1 / 16, 1 / 8),
    setObject(5  / 16, 3 / 8, 1 / 16, 1 / 8),
    setObject(6  / 16, 2 / 8, 1 / 16, 5 / 8),
    setObject(5  / 16, 7 / 8, 3 / 16, 1 / 8),
    setObject(10 / 16, 0    , 1 / 16, 1 / 8),
    setObject(13 / 16, 0    , 1 / 16, 1 / 8),
    setObject(10 / 16, 3 / 8, 1 / 16, 1 / 8),
    setObject(11 / 16, 2 / 8, 2 / 16, 1 / 8),
    setObject(13 / 16, 3 / 8, 1 / 16, 1 / 8),
    setObject(12 / 16, 4 / 8, 1 / 16, 1 / 8),
    setObject(11 / 16, 5 / 8, 1 / 16, 1 / 8),
    setObject(10 / 16, 6 / 8, 1 / 16, 1 / 8),
    setObject(10 / 16, 7 / 8, 4 / 16, 1 / 8)
  ] : (stage === 13) ? [
    setObject(2 / 8, 0 / 8, 1  / 32, 4 / 16),
    setObject(2 / 8, 0 / 8, 5  / 32, 1 / 16),
    setObject(1 / 8, 4 / 8, 11  / 32, 1 / 16),
    setObject(1 / 8, 4 / 8, 1  / 32, 6 / 16),
    setObject(3 / 8, 2 / 8, 10 / 32, 1 / 16),
    setObject(3 / 8, 2 / 8, 1  / 32, 2 / 16),
    setObject(4 / 8, 5 / 8, 8  / 32, 1 / 16),
    setObject(4 / 8, 5 / 8, 1  / 32, 2 / 16),
    setObject(6 / 8, 0    , 1  / 32, 9 / 16),
    setObject(6 / 8, 0    , 5  / 32, 1 / 16),
    setObject(7 / 8, 5 / 8, 1  / 32, 6 / 16),
    setObject(7 / 8, 5 / 8, 2  / 32, 1 / 16)
  ] : (stage === 14) ? [
    setObject(2 / 3,       timer % 480 / 480, 1 / 16, 2 / 3),
    setObject(2 / 3, - 1 + timer % 480 / 480, 1 / 16, 2 / 3),
    setObject(1 / 3,   1 - timer % 480 / 480, 1 / 16, 3 / 4),
    setObject(1 / 3,     - timer % 480 / 480, 1 / 16, 3 / 4)
  ] : (stage === 15) ? [
    setObject(2 / 8, 0    , 1 / 16, 1 / 16),
    setObject(2 / 8, 1 / 8, 1 / 16, 1 / 16),
    setObject(2 / 8, 2 / 8, 1 / 16, 1 / 16),
    setObject(2 / 8, 3 / 8, 1 / 16, 1 / 16),
    setObject(2 / 8, 4 / 8, 1 / 16, 1 / 16),
    setObject(2 / 8, 5 / 8, 1 / 16, 1 / 16),
    setObject(2 / 8, 6 / 8, 1 / 16, 1 / 16),
    setObject(2 / 8, 7 / 8, 1 / 16, 1 / 16),
    setObject(5 / 8, 0 / 8, 1 / 16, 1 / 16),
    setObject(5 / 8, 1 / 8, 1 / 16, 1 / 16),
    setObject(5 / 8, 2 / 8, 1 / 16, 1 / 16),
    setObject(5 / 8, 3 / 8, 1 / 16, 1 / 16),
    setObject(5 / 8, 4 / 8, 1 / 16, 1 / 16),
    setObject(5 / 8, 7 / 8, 1 / 16, 1 / 16),
    setObject(6 / 8, 0 / 8, 1 / 16, 1 / 16),
    setObject(6 / 8, 3 / 8, 1 / 16, 1 / 16),
    setObject(6 / 8, 4 / 8, 1 / 16, 1 / 16),
    setObject(6 / 8, 5 / 8, 1 / 16, 1 / 16),
    setObject(6 / 8, 6 / 8, 1 / 16, 1 / 16),
    setObject(6 / 8, 7 / 8, 1 / 16, 1 / 16),
  ] : (stage === 16) ? [
    setObject(4  / 16, 0 / 8, 1 / 16, 1 / 8),
    setObject(5  / 16, 1 / 8, 1 / 16, 1 / 8),
    setObject(6  / 16, 2 / 8, 1 / 16, 1 / 8),
    setObject(4  / 16, 6 / 8, 1 / 16, 1 / 8),
    setObject(5  / 16, 5 / 8, 1 / 16, 1 / 8),
    setObject(6  / 16, 4 / 8, 1 / 16, 1 / 8),
    setObject(8  / 16, 4 / 8, 1 / 16, 1 / 8),
    setObject(9  / 16, 5 / 8, 1 / 16, 1 / 8),
    setObject(10 / 16, 6 / 8, 1 / 16, 1 / 8),
    setObject(8  / 16, 2 / 8, 1 / 16, 1 / 8),
    setObject(9  / 16, 1 / 8, 1 / 16, 1 / 8),
    setObject(10 / 16, 0 / 8, 1 / 16, 1 / 8)
  ] : (stage === 17) ? [
    setObject(2 / 8, 0    , 1 / 32, 1 / 16),
    setObject(2 / 8, 1 / 4, 1 / 32, 1 / 16),
    setObject(2 / 8, 2 / 4, 1 / 32, 1 / 16),
    setObject(2 / 8, 3 / 4, 1 / 32, 1 / 16),
    setObject(3 / 8, 0    , 1 / 32, 2 / 16),
    setObject(3 / 8, 1 / 4, 1 / 32, 2 / 16),
    setObject(3 / 8, 2 / 4, 1 / 32, 2 / 16),
    setObject(3 / 8, 3 / 4, 1 / 32, 2 / 16),
    setObject(4 / 8, 0    , 1 / 32, 3 / 16),
    setObject(4 / 8, 1 / 4, 1 / 32, 3 / 16),
    setObject(4 / 8, 2 / 4, 1 / 32, 3 / 16),
    setObject(4 / 8, 3 / 4, 1 / 32, 3 / 16),
    setObject(6 / 8, 0    , 1 / 32, 1 / 16),
    setObject(6 / 8, 1 / 4, 1 / 32, 1 / 16),
    setObject(6 / 8, 2 / 4, 1 / 32, 1 / 16),
    setObject(6 / 8, 3 / 4, 1 / 32, 1 / 16),
    setObject(5 / 8, 0    , 1 / 32, 2 / 16),
    setObject(5 / 8, 1 / 4, 1 / 32, 2 / 16),
    setObject(5 / 8, 2 / 4, 1 / 32, 2 / 16),
    setObject(5 / 8, 3 / 4, 1 / 32, 2 / 16)
  ] : (stage === 18 && (bossFlag || defeatFlag)) ? [
  ] : (stage === 18) ? [
    setObject(1/4, 0, 2/4,3/4)
  ] : (stage === 101) ? [
    setObject(4  / 16, 7  / 16, 1 / 16, 1 / 16),
    setObject(5  / 16, 8  / 16, 1 / 16, 1 / 16),
    setObject(6  / 16, 9  / 16, 1 / 16, 1 / 16),
    setObject(1  / 16, 10 / 16, 7 / 16, 1 / 16),
    setObject(4  / 16, 13 / 16, 1 / 16, 1 / 16),
    setObject(5  / 16, 12 / 16, 1 / 16, 1 / 16),
    setObject(6  / 16, 11 / 16, 1 / 16, 1 / 16),
    setObject(11 / 16, 2  / 16, 1 / 16, 1 / 16),
    setObject(12 / 16, 3  / 16, 1 / 16, 1 / 16),
    setObject(13 / 16, 4  / 16, 1 / 16, 1 / 16),
    setObject(8  / 16, 5  / 16, 7 / 16, 1 / 16),
    setObject(11 / 16, 8  / 16, 1 / 16, 1 / 16),
    setObject(12 / 16, 7  / 16, 1 / 16, 1 / 16),
    setObject(13 / 16, 6  / 16, 1 / 16, 1 / 16),
    setObject(28 / 32, 7  / 16, 1 / 32, 7 / 16)
  ] : (stage === 102) ? [
    setObject(1 / 3 - 2 / 10.675, 0      , 1 / 64, 1  / 32),
    setObject(1 / 3 - 1 / 10.675, 0      , 1 / 64, 1  / 32),
    setObject(1 / 3             , 0      , 1 / 64, 1  / 32),
    setObject(1 / 3 + 1 / 10.675, 0      , 1 / 64, 1  / 32),
    setObject(1 / 3 + 2 / 10.675, 0      , 1 / 64, 1  / 32),
    setObject(1 / 3             , 3  / 16, 1 / 64, 13 / 16),
    setObject(2 / 3 - 2 / 10.675, 31 / 32, 1 / 64, 1  / 32),
    setObject(2 / 3 - 1 / 10.675, 31 / 32, 1 / 64, 1  / 32),
    setObject(2 / 3             , 31 / 32, 1 / 64, 1  / 32),
    setObject(2 / 3 + 1 / 10.675, 31 / 32, 1 / 64, 1  / 32),
    setObject(2 / 3 + 2 / 10.675, 31 / 32, 1 / 64, 1  / 32),
    setObject(2 / 3             , 0      , 1 / 64, 5  / 6)
  ] : (stage === 103) ? [
    setObject(2 / 3,       timer % 240 / 240, 1 / 32, 2 / 3),
    setObject(2 / 3, - 1 + timer % 240 / 240, 1 / 32, 2 / 3),
    setObject(1 / 3,   1 - timer % 240 / 240, 1 / 32, 3 / 4),
    setObject(1 / 3,     - timer % 240 / 240, 1 / 32, 3 / 4)
  ] : (stage === 104) ? [
    setObject(7  / 16, 0      , 1  / 64, 15 / 32),
    setObject(7  / 16, 9  / 16, 1  / 64, 14 / 32),
    setObject(8  / 16, 0      , 1  / 64, 15 / 32),
    setObject(8  / 16, 9  / 16, 1  / 64, 14 / 32),
    setObject(3  / 64, 7  / 16, 22 / 64, 1  / 32),
    setObject(9  / 16, 7  / 16, 21 / 64, 1  / 32),
    setObject(3  / 64, 9  / 16, 22 / 64, 1  / 32),
    setObject(9  / 16, 9  / 16, 21 / 64, 1  / 32)
  ] : (stage === 105) ? [
    setObject(17 / 64, 11 / 32, 4  / 64, 1  / 32),
    setObject(20 / 64, 12 / 32, 1  / 64, 4  / 32),
    setObject(24 / 64, 2  / 32, 1  / 64, 9  / 32),
    setObject(10 / 64, 15 / 32, 1  / 64, 3  / 32),
    setObject(24 / 64, 2  / 32, 4  / 64, 1  / 32),
    setObject(3  / 64, 7  / 16, 15 / 64, 1  / 32),
    setObject(0      , 10 / 16, 7  / 64, 1  / 32),
    setObject(10 / 64, 11 / 16, 15 / 64, 1  / 32),
    setObject(24 / 64, 15 / 32, 4  / 64, 1  / 32),
    setObject(24 / 64, 15 / 32, 1  / 64, 4  / 32),
    setObject(32 / 64, 15 / 32, 1  / 64, 15 / 32),
    setObject(48 / 64, 2  / 32, 1  / 64, 28 / 32),
    setObject(59 / 64, 1  / 32, 1  / 64, 27 / 32)
  ] : (stage === 108) ? [
    setObject(3 / 8, 2 / 8, 1 / 16, 1 / 16),
    setObject(3 / 8, 3 / 8, 1 / 16, 1 / 16),
    setObject(3 / 8, 4 / 8, 1 / 16, 1 / 16),
    setObject(3 / 8, 5 / 8, 1 / 16, 1 / 16),
    setObject(3 / 8, 6 / 8, 1 / 16, 1 / 16),
    setObject(3 / 8, 7 / 8, 1 / 16, 1 / 16),
    setObject(4 / 8, 1  / 16, 1 / 16, 1 / 16),
    setObject(4 / 8, 3  / 16, 1 / 16, 1 / 16),
    setObject(4 / 8, 5  / 16, 1 / 16, 1 / 16),
    setObject(4 / 8, 7  / 16, 1 / 16, 1 / 16),
    setObject(4 / 8, 9  / 16, 1 / 16, 1 / 16),
    setObject(4 / 8, 11 / 16, 1 / 16, 1 / 16),
    setObject(4 / 8, 13 / 16, 1 / 16, 1 / 16),
    setObject(4 / 8, 15 / 16, 1 / 16, 1 / 16),
    setObject(5 / 8, 0    , 1 / 16, 1 / 16),
    setObject(5 / 8, 1 / 8, 1 / 16, 1 / 16),
    setObject(5 / 8, 2 / 8, 1 / 16, 1 / 16),
    setObject(5 / 8, 3 / 8, 1 / 16, 1 / 16),
    setObject(5 / 8, 4 / 8, 1 / 16, 1 / 16),
    setObject(5 / 8, 5 / 8, 1 / 16, 1 / 16),
    setObject(5 / 8, 6 / 8, 1 / 16, 1 / 16),
  ] : (stage === 107) ? [
    setObject(1 / 4, 0, 1 / 4, 1 / 2),
    setObject(-1/4+timer % 480 / 360, 1 / 2, 1 / 4, 1 / 2)
  ] : (stage === 106) ? [
    setObject(5  / 16, 0    , 1 / 16, 1 / 8),
    setObject(7  / 16, 0    , 1 / 16, 1 / 8),
    setObject(4  / 16, 1 / 8, 1 / 16, 1 / 8),
    setObject(12 / 16, 1 / 8, 1 / 16, 1 / 8),
    setObject(14 / 16, 1 / 8, 1 / 16, 1 / 8),
    setObject(5  / 16, 2 / 8, 1 / 16, 1 / 8),
    setObject(7  / 16, 2 / 8, 1 / 16, 1 / 8),
    setObject(10 / 16, 3 / 8, 1 / 16, 1 / 8),
    setObject(12 / 16, 3 / 8, 1 / 16, 1 / 8),
    setObject(8  / 16, 3 / 8, 1 / 16, 1 / 8),
    setObject(5  / 16, 4 / 8, 1 / 16, 1 / 8),
    setObject(7  / 16, 4 / 8, 1 / 16, 1 / 8),
    setObject(4  / 16, 5 / 8, 1 / 16, 1 / 8),
    setObject(12 / 16, 5 / 8, 1 / 16, 1 / 8),
    setObject(14 / 16, 5 / 8, 1 / 16, 1 / 8),
    setObject(5  / 16, 6 / 8, 1 / 16, 1 / 8),
    setObject(7  / 16, 6 / 8, 1 / 16, 1 / 8),
    setObject(10 / 16, 7 / 8, 1 / 16, 1 / 8),
    setObject(12 / 16, 7 / 8, 1 / 16, 1 / 8),
    setObject(14 / 16, 7 / 8, 1 / 16, 1 / 8)
  ] : [
    setObject(3  / 16, 4 / 9, 1 / 16, 5 / 9),
    setObject(4  / 16, 4 / 9, 2 / 16, 1 / 9),
    setObject(4  / 16, 6 / 9, 1 / 16, 1 / 9),
    setObject(4  / 16, 8 / 9, 2 / 16, 1 / 9),
    setObject(6  / 16, 2 / 9, 1 / 16, 5 / 9),
    setObject(7  / 16, 3 / 9, 1 / 16, 1 / 9),
    setObject(8  / 16, 4 / 9, 1 / 16, 1 / 9),
    setObject(9  / 16, 5 / 9, 1 / 16, 1 / 9),
    setObject(10 / 16, 2 / 9, 1 / 16, 5 / 9),
    setObject(11 / 16, 0 / 9, 1 / 16, 5 / 9),
    setObject(12 / 16, 0 / 9, 2 / 16, 1 / 9),
    setObject(12 / 16, 4 / 9, 2 / 16, 1 / 9),
    setObject(14 / 16, 1 / 9, 1 / 16, 3 / 9),
  ]
  object.push({
    x: 0, y: 0, w: canvas.offsetWidth, h: size / 4
  }, {
    x: 0, y: canvas.offsetHeight - size / 4, w: canvas.offsetWidth, h: size / 4
  }, {
    x: 0, y: 0, w: size / 4, h: canvas.offsetHeight
  })
}
const bossProcess = () => {
  if (!bossFlag && canvas.offsetWidth / 4 <= posY.x) {
    bossFlag = true
    bossLife = 3
  }
  if (!ball.attackFlag) {
    if (!bossFlag) {
      ball.x = canvas.offsetWidth * 1 / 6
      ball.y = canvas.offsetHeight * 5 / 8
    }
    else {
      ball.x = canvas.offsetWidth * 1 / 4
      ball.y = canvas.offsetHeight * 1 / 3
    }
    const distance = ((posX.x - ball.x) ** 2 + (posX.y - ball.y) ** 2) ** (1 / 2)
    if (distance <= ball.radius) {
      ball.attackFlag = true
      ball.direction = radX * (Math.PI / 180)
      ball.timer = ball.timerLimit
    }
  }
  if (bossFlag) {
    bossPosition = {
      x: canvas.offsetWidth * 11 / 16,
      y: canvas.offsetHeight * (.1 + ((1 - Math.sin(timer / 100)) / 2) * .8)
    }
  }
  if (ball.attackFlag) {
    ball.x = ball.x - Math.sin(ball.direction) * ball.speed
    ball.y = ball.y + Math.cos(ball.direction) * ball.speed
    if (0 < ball.timer)ball.timer -= 1
    else {
      ball.attackFlag = false
      if (firstMessage) firstMessage = false
    }
    const distance = ((bossPosition.x - ball.x) ** 2 + (bossPosition.y - ball.y) ** 2) ** (1 / 2)
    if (distance <= ball.radius * 2) {
      bossLife -= 1
      if (bossLife === 0) defeatFlag = true
      ball.x = ball.x - Math.sin(ball.direction) * ball.speed * 1e5
      ball.y = ball.y + Math.cos(ball.direction) * ball.speed * 1e5
    }
  }
}
const extraProcess = () => {
  if (posY.x <= canvas.offsetWidth * (3 / 16) && canvas.offsetHeight * (11 / 16) <= posY.y) {
    extraFlag = true
    stage += 100
  }
}
const move = () => {
  const rad = radX * (Math.PI / 180)
  const range = size * 5
  posX = {x: posY.x + Math.cos(rad) * range, y: posY.y + Math.sin(rad) * range}
  const multiple = 2
  radX = (radX === 360 - multiple) ? 0 : radX + multiple
}
const resetPosition = () => {
  posX = posY = {x: canvas.offsetWidth / 8, y: canvas.offsetHeight / 4.5}
}
const collisionDetect = () => {
  object.forEach(obj => {
    if (((
      obj.x < posX.x && posX.x < obj.x + obj.w) && (obj.y < posX.y && posX.y < obj.y + obj.h
    )) || ((
      obj.x < posY.x && posY.x < obj.x + obj.w) && (obj.y < posY.y && posY.y < obj.y + obj.h
    ))) {
      resetPosition()
      death += 1
      timer = 0
    }
  })
  const nextStage = () => {
    if (exitLine <= posX.x || exitLine <= posY.x) {
      resetPosition()
      if (stage === 18) stage = 1
      else stage += 1
      timer = 0
    }
  }
  nextStage()
}
const drawArc = (position, color) => {
  context.beginPath()
  context.arc(position.x, position.y, size / 2, 0, Math.PI * 2, false)
  context.fillStyle = context.strokeStyle = `hsl(${color}, 100%, 85%)`
  context.fill()
  context.beginPath()
  context.arc(position.x, position.y, size / 16, 0, Math.PI * 2, false)
  context.fillStyle = context.strokeStyle = `hsl(${color}, 100%, 50%)`
  context.stroke()
}
const drawBall = () => {
  context.fillStyle = 'hsl(60, 100%, 50%)'
  context.beginPath()
  context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2, false)
  context.fill()
  if (stage === firstBossStage && !bossFlag) {
    const text = (!firstMessage) ? "Let's defeat the BOSS!! ->"
    : (ball.attackFlag) ? 'That can attack the enemy and charging now...'
    : 'This is safe for you!!'
    context.fillText(text, canvas.offsetWidth * (1 / 12), canvas.offsetHeight * (13 / 16))
  }
  if (ball.attackFlag) {
    context.fillRect(
      0,
      canvas.offsetHeight - canvas.offsetHeight * ((ball.timerLimit - ball.timer) / ball.timerLimit),
      canvas.offsetWidth * (1 / 64),
      canvas.offsetHeight * ((ball.timerLimit - ball.timer) / ball.timerLimit)
    )
  }
}
const drawBoss = () => {
  for (let i = 0; i < bossLife; i++) {
    context.fillStyle = 'hsl(180, 100%, 50%)'
    context.fillRect(
      canvas.offsetWidth * (7 / 8 - i / 16),
      0,
      canvas.offsetWidth * (1 / 64),
      canvas.offsetHeight
    )
  }
  context.fillStyle = 'hsl(0, 100%, 50%)'
  context.beginPath()
  context.arc(bossPosition.x, bossPosition.y, ball.radius, 0, Math.PI * 2, false)
  context.fill()
}
const drawClearMessage = () => {
  context.save()
  context.fillStyle = 'hsl(60, 100%, 50%)'
  context.textAlign = 'center'
  context.fillText(
    'Congratulations!!',
    canvas.offsetWidth * (1/2), canvas.offsetHeight * (2/8)
  )
  context.fillText(
    'You defeat the BOSS.',
    canvas.offsetWidth * (1/2), canvas.offsetHeight * (3/8)
  )
  context.fillText(
    'But... There are more continuations.',
  canvas.offsetWidth * (1/2), canvas.offsetHeight * (4/8)
  )
  context.fillText(
    'You can enter the extra stage when you come "LEFT BOTTOM SPACE" in stage 1.',
    canvas.offsetWidth * (1/2), canvas.offsetHeight * (5/8)
  )
  context.fillText(
    'Waiting for your challenge!!',
    canvas.offsetWidth * (1/2), canvas.offsetHeight * (6/8)
  )
  context.restore()
}
const drawExit = () => {
  context.fillStyle = 'hsl(120, 100%, 50%)'
  context.fillRect(exitLine, 0, canvas.offsetWidth / size, canvas.offsetHeight)
}
const drawObject = () => {
  context.fillStyle = 'hsl(180, 100%, 50%)'
  object.forEach(obj => context.fillRect(obj.x, obj.y, obj.w, obj.h))
}
const drawIndicator = () => {
  context.font = `${size}px sans-serif`
  context.fillStyle = 'hsl(300, 100%, 50%)'
  context.fillText('stage', exitLine, size * 2, size * 3)
  context.fillText(stage, exitLine + size, size * 4, size * 2)
  context.fillText('count', exitLine, size * 8, size * 3)
  context.fillText(count, exitLine + size, size * 10, size * 2)
  context.fillText('death', exitLine, size * 14, size * 3)
  context.fillText(death, exitLine + size, size * 16, size * 2)
}
const main = () => {
  // internal process
  timer += 1
  createObject()
  if (stage === 18 && !defeatFlag) bossProcess()
  if (stage === 1 && !extraFlag) extraProcess()
  move()
  collisionDetect()
  // draw process
  context.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
  drawArc(posX, 0)
  drawArc(posY, 240)
  if (stage === 18) {
    if (defeatFlag) drawClearMessage()
    else {
      drawBall()
      drawBoss()
    }
  }
  drawExit()
  drawObject()
  drawIndicator()
  window.requestAnimationFrame(main)
}
main()

})()