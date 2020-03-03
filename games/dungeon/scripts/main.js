{'use strict'
const display = document.getElementById`display`
const size = 16
let gX = 0
let gY = 0
let canvasId = 0
const pushCanvas = () => {
  const canvas = document.createElement`canvas`
  canvas.id = canvasId
  canvas.width = size * 16 * 3
  canvas.height = size * 9
  const context = canvas.getContext`2d`
  // const rect = document.getElementById(canvas.Id).getBoundingClientRect()
  display.appendChild(canvas)
  const rect = canvas.getBoundingClientRect()
  canvasId++
  canvas.addEventListener('mousemove', e => {
    gX = e.clientX - rect.left
    gY = e.clientY - rect.top
    drawIndicator(canvas, context)
  }, false)
}
const button = document.createElement`button`
button.textContent = 'Push Canvas'
button.addEventListener('click', () => {
  pushCanvas()
}, false)
display.appendChild(button)
// pushCanvas()
const drawIndicator = (canvas, context) => {
  context.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
  context.fillText(`id: ${canvas.id}`, size * 2, size * 2)
  context.fillText(`x: ${gX}`, size * 2, size * 3)
  context.fillText(`y: ${gY}`, size * 2, size * 4)
}
const main = () => {
  window.requestAnimationFrame(main)
}
main()
}