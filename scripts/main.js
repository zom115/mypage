'use strict'
const details = document.getElementsByTagName('details')[0]
const nav = document.getElementsByTagName`nav`[0]
let flag
details.addEventListener('mouseenter', () => {flag = true})
details.addEventListener('mouseleave', () => {flag = false})
nav.addEventListener('mouseenter', () => {flag = true})
nav.addEventListener('mouseleave', () => {flag = false})
document.addEventListener('mousedown', () => {
  if (!flag) details.removeAttribute('open')
})