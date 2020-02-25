{'use strict'
const canvas = document.getElementById`canvas`
const context = canvas.getContext`2d`
const size = 16
const ownPositionObject = {x: canvas.offsetWidth / 8, y: canvas.offsetHeight / 4.5}
const drawOwn = (position) => {
  context.fillStyle = context.strokeStyle = 'white'
  const offset = {x: position.x - size, y: position.y - size / 2}
  context.beginPath()
  context.moveTo(offset.x, offset.y)
  context.lineTo(offset.x + size / 5, offset.y)
  context.lineTo(offset.x + size * (4 / 5), offset.y + size * (1 / 3))
  context.lineTo(offset.x + size * (6 / 5), offset.y + size * (1 / 3))
  context.lineTo(offset.x + size * 2, offset.y + size * (1 / 2))
  context.lineTo(offset.x + size * (1 / 2), offset.y + size * (5 / 7))
  context.lineTo(offset.x + size * (1 / 3), offset.y + size * (5 / 7))
  context.lineTo(offset.x + size * (1 / 3), offset.y + size * (4 / 6))
  context.lineTo(offset.x + size * (1 / 8), offset.y + size * (4 / 6))
  context.lineTo(offset.x + size * (1 / 8), offset.y + size * (3 / 6))
  context.lineTo(offset.x + size * (1 / 5), offset.y + size * (3 / 6))
  context.lineTo(offset.x + size * (1 / 3), offset.y + size * (1 / 3))
  context.fill()
  context.beginPath()
  context.arc(position.x, position.y, size / 8, 0, Math.PI * 2, false)
  context.fillStyle = context.strokeStyle = 'red'
  context.fill()
}
const main = () => {
  // draw process
  context.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
  drawOwn(ownPositionObject)
  window.requestAnimationFrame(main)
}
main()
}