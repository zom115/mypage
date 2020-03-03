{'use strict'
const display = document.getElementById`display`
const canvas = document.createElement`canvas`
const size = 16
canvas.width = size * 16 * 3
canvas.height = size * 9
const context = canvas.getContext`2d`
display.appendChild(canvas)
let gX = 0
let gY = 0
document.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect()
  gX = e.clientX - rect.left
  gY = e.clientY - rect.top
}, false)
const drawIndicator = () => {
  context.fillText('test', size * 2, size * 2)
  context.fillText(`${gX} ${gY}`, size * 2, size * 3)
}
const main = () => {
  context.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
  drawIndicator()
  window.requestAnimationFrame(main)
}
main()
}