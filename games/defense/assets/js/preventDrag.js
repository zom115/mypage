!(x = x => {'use strict'

document.addEventListener('drop dragover', e => {
  e.stopPropagation()
  e.preventDefault()
})

})()