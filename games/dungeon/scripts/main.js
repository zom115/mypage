{'use strict'
const display = document.getElementById`display`
const indicateView = document.createElement`div`
const canvasView = document.createElement`div`
const menuView = document.createElement`div`
indicateView.className = 'container'
menuView.className = 'container'
display.appendChild(indicateView)
display.appendChild(canvasView)
display.appendChild(menuView)
const generateTableColumn = (d, v) => {
  const tr = document.createElement`tr`
  const item = document.createElement`td`
  const value = document.createElement`td`
  item.textContent = d
  value.id = d
  value.className = 'value'
  value.textContent = v
  tr.appendChild(item)
  tr.appendChild(value)
  return tr
}
const buildingObject = {}
const buildingNameList = [
  'Textile Mill',
  'Clothing Factory',
  'Lumber Mill',
  'Furniture Factory',
  'Steel Mill',
  'Metal Works',
  'Refinery',
  'Food Production'
]
{
const building = document.createElement`table`
const tr = document.createElement`tr`
const th = document.createElement`th`
th.textContent = 'Building'
const value = document.createElement`th`
value.textContent = 'value'
indicateView.appendChild(building)
building.appendChild(tr)
tr.appendChild(th)
tr.appendChild(value)
buildingNameList.forEach(v => {
  buildingObject[v] = 0
})
Object.entries(buildingObject).forEach(([k, v]) => {
  building.appendChild(generateTableColumn(k, v))
})
}
const workerObject = []
const workerNameList = [
  'None',
  'Farmer',
  'Rancher',
  'Forester',
  'Miner',
  'Driller'
]
{
const worker = document.createElement`table`
const tr = document.createElement`tr`
const th = document.createElement`th`
th.textContent = 'Worker'
const value = document.createElement`th`
value.textContent = 'value'
indicateView.appendChild(worker)
worker.appendChild(tr)
tr.appendChild(th)
tr.appendChild(value)
workerNameList.forEach(v => {
  workerObject[v] = 0
})
Object.entries(workerObject).forEach(([k, v]) => {
  worker.appendChild(generateTableColumn(k, v))
})
}
const commoditiesObject = []
const commoditiesNameList = [
  'Grain',
  'Livestock',
  'Fruit',
  'Wool',
  'Timber'
]
{
const commodities = document.createElement`table`
const tr = document.createElement`tr`
const th = document.createElement`th`
th.textContent = 'Commodities'
const value = document.createElement`th`
value.textContent = 'value'
indicateView.appendChild(commodities)
commodities.appendChild(tr)
tr.appendChild(th)
tr.appendChild(value)
commoditiesNameList.forEach(v => {
  commoditiesObject[v] = 0
})
Object.entries(commoditiesObject).forEach(([k, v]) => {
  commodities.appendChild(generateTableColumn(k, v))
})
}
const elementUpdate = () => {
  Object.entries(buildingObject).forEach(([k, v]) => {
    document.getElementById(k).textContent = v
  })
  Object.entries(workerObject).forEach(([k, v]) => {
    document.getElementById(k).textContent = v
  })
  Object.entries(commoditiesObject).forEach(([k, v]) => {
    document.getElementById(k).textContent = v
  })
}
const terrainList = ['Town']
const terrainNameList = [
  'Open Range',
  'Farm',
  'Orchard',
  'Fertile Hills',
  'Forest'
]
{
const terrain = document.createElement`table`
const tr = document.createElement`tr`
const th = document.createElement`th`
th.textContent = 'Add Terrain'
const value = document.createElement`th`
value.textContent = 'value'
menuView.appendChild(terrain)
terrain.appendChild(tr)
tr.appendChild(th)
tr.appendChild(value)
const generateTableColumn = (d, v) => {
  const tr = document.createElement`tr`
  const item = document.createElement`td`
  const td = document.createElement`td`
  const button = document.createElement`button`
  item.textContent = d
  td.className = 'value'
  button.id = d
  button.textContent = '+'
  tr.appendChild(item)
  tr.appendChild(td)
  td.appendChild(button)
  button.addEventListener('click', e => {
    console.log(e.target.id)
  })
  return tr
}
terrainNameList.forEach(v => {
  terrain.appendChild(generateTableColumn(v))
})
}
let canvasSerector = '0'
const size = 16
let canvasId = 0
const pushCanvas = () => {
  const canvas = document.createElement`canvas`
  canvas.id = canvasId
  canvas.width = size * 16 * 3
  canvas.height = size * 4
  const context = canvas.getContext`2d`
  canvasView.appendChild(canvas)
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
    canvasSerector = canvas.id
    buildingObject[buildingNameList[0]]++
    workerObject[workerNameList[0]]++
    commoditiesObject[commoditiesNameList[0]]++
    console.log (e)
    elementUpdate()
  })
  const main = () => {
    context.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
    context.save()
    context.font = `normal ${size}px sans-serif`
    context.textAlign = 'center'
    terrainList.forEach((v, i) => {
      if (size * 1.5 + i * size * 6 <= x && x <= size * 4.5 + i * size * 6) {
        context.font = `bold ${size}px sans-serif`
      }
      context.fillStyle = 'black'
      context.fillText(v, size * 3 + i * size * 6, size)
      context.font = `normal ${size}px sans-serif`
      context.fillStyle = 'gray'
      context.fillRect(size * 1.5 + i * size * 6, size, size * 3, size * 3)
    })
    context.fillStyle = 'black'
    if (canvasSerector === canvas.id) {
      context.fillRect(0, 0, size / 2, size / 2)
    }
    context.fillText(`id: ${canvas.id}`, size * 2, size * 2)
    context.fillText(`x: ${x}`, size * 2, size * 3)
    context.fillText(`y: ${y}`, size * 2, size * 4)
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