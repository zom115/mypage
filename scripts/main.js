'use strict'
const details = document.getElementsByTagName('details')[0]
let flag
details.addEventListener('mouseleave', () => {flag = false})
details.addEventListener('mouseenter', () => {flag = true})
document.addEventListener('mousedown', () => {
  if (!flag) details.removeAttribute('open')
})
// corsorて。cursorでしょ