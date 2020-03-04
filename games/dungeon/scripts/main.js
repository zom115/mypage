{'use strict'
const display = document.getElementById`display`
const size = 16
let canvasId = 0
const commodities = document.createElement`table`
const tr = document.createElement`tr`
const th = document.createElement`th`
th.textContent = 'Commodities'
const value = document.createElement`th`
value.textContent = 'value'
display.appendChild(commodities)
commodities.appendChild(tr)
tr.appendChild(th)
tr.appendChild(value)
const generateTableColumn = (d, v) => {
  const tr = document.createElement`tr`
  const item = document.createElement`td`
  const value = document.createElement`td`
  item.textContent = d
  value.textContent = v
  value.className = 'value'
  commodities.appendChild(tr)
  tr.appendChild(item)
  tr.appendChild(value)
}
comoditiesList = []
comoditiesNameList = ['Grain', 'Livestock', 'Fruit', 'Wool', 'Timber']
comoditiesNameList.forEach(v => {
  comoditiesList.push({name: v, value: 0})
})
comoditiesList.forEach(v => generateTableColumn(v.name, v.value))
const pushCanvas = () => {
  const canvas = document.createElement`canvas`
  canvas.id = canvasId
  canvas.width = size * 16 * 3
  canvas.height = size * 9
  const context = canvas.getContext`2d`
  display.appendChild(canvas)
  const rect = canvas.getBoundingClientRect()
  canvasId++
  let x = 0
  let y = 0
  canvas.addEventListener('mousemove', e => {
    x = e.clientX - rect.left
    y = e.clientY - rect.top
  }, false)
  canvas.addEventListener('mousedown', e => {
    if (canvas.offsetWidth - size * 3 < x && x < canvas.offsetWidth - size &&
      size < y && y < size * 3) {
      pushCanvas()
    }
  })
  canvas.addEventListener('mouseup', e => {
    console.log(e)
  })
  const main = () => {
    context.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
    context.save()
    context.font = `normal ${size}px sans-serif`
    context.fillText(`id: ${canvas.id}`, size * 2, size * 2)
    context.fillText(`x: ${x}`, size * 2, size * 3)
    context.fillText(`y: ${y}`, size * 2, size * 4)
    context.textAlign = 'center'
    context.fillStyle = 'lightgray'
    context.fillRect(canvas.offsetWidth - size * 3, size, size * 2, size * 2)
    if (canvas.offsetWidth - size * 3 < x && x < canvas.offsetWidth - size &&
      size < y && y < size * 3) {
      context.font = `bold ${size}px sans-serif`
    }
    context.fillStyle = 'black'
    context.fillText('+', canvas.offsetWidth - size * 2, size * 2.25)
    context.restore()
    window.requestAnimationFrame(main)
  }
  main()
}
pushCanvas()
}