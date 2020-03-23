{'use strict'
const canvas = document.getElementById`canvas`
const context = canvas.getContext`2d`
const input = () => {}
const draw = () => {
  context.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
}
const main = () => {
  window.requestAnimationFrame(main)
  input()
  draw()
}
main()
}