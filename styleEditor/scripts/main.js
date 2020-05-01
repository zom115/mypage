{'use strict'
let dragged

/* events fired on the draggable target */
document.addEventListener("drag", event => {
  console.log('drag')
}, false)

document.addEventListener("dragstart", event => {
  console.log('drag start')
  // store a ref. on the dragged elem
  dragged = event.target
  // make it half transparent
  event.target.style.opacity = .5
}, false)

document.addEventListener("dragend", event => {
  console.log('drag end')
  // reset the transparency
  event.target.style.opacity = ""
}, false)

/* events fired on the drop targets */
document.addEventListener("dragover", event => {
  console.log('drag over')
  // prevent default to allow drop
  event.preventDefault()
}, false)

document.addEventListener("dragenter", event => {
  console.log('drag enter')
  // highlight potential drop target when the draggable element enters it
  if (event.target.className == "dropzone") {
    event.target.style.background = "purple"
  }

}, false)

document.addEventListener("dragleave", event => {
  console.log('drag leave')
  // reset background of potential drop target when the draggable element leaves it
  if (event.target.className == "dropzone") {
    event.target.style.background = ""
  }

}, false)

document.addEventListener("drop", event => {
  console.log('drop')
  // prevent default action (open as link for some elements)
  event.preventDefault()
  // move dragged elem to the selected drop target
  if (event.target.className == "dropzone") {
    event.target.style.background = ""
    dragged.parentNode.removeChild( dragged )
    event.target.appendChild( dragged )
  }
}, false)
}