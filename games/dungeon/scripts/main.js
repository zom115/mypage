{'use strict'
const commoditiesNameList = [
  'Grain',
  'Livestock',
  'Fruit',
  'Wool',
  'Timber',
  'Coal',
  'Iron',
  'Gold',
  'Gems',
  'Oil',
  'Canned Food',
  'Fabric',
  'Paper',
  'Lumber',
  'Steel',
  'Fuel',
  'Clothing',
  'Furniture',
  'Hardware'
]
const imagePathList = [
  '小麦アイコン.png',
  '肉の切り身のアイコン.png',
  'リンゴアイコン6.png',
  'ヒツジアイコン.png',
  '木アイコン.png',
  'coal.png',
  'iron.png',
  'gold.png',
  'gems.png',
  '石油アイコン.png',
  '空き缶アイコン2.png',
  'fabric.png',
  '白紙のドキュメントアイコン.png',
  '丸太アイコン.png',
  'steel.png',
  '石油のアイコン.png',
  'VネックTシャツの無料アイコン1.png',
  'イスのアイコン9.png',
  '金づちの無料アイコン.png',
]
imagePathList.forEach((v, i) => {imagePathList[i] = 'images/' + v})
const imageList = []
const imgLoad = async () => {
  return new Promise(async resolve => {
    await Promise.all(imagePathList.map(async (path, i) => {
      return new Promise(async res => {
        const imgPreload = new Image()
        imgPreload.src = path
        imgPreload.alt = commoditiesNameList[i]
        imgPreload.addEventListener('load', async e => {
          imageList.push(e.path[0])
          res()
        })
      })
    }))
    resolve()
  })
}
const display = document.getElementById`display`
const indicateView = document.createElement`div`
indicateView.className = 'container'
display.appendChild(indicateView)
const canvasView = document.createElement`div`
display.appendChild(canvasView)
const menuView = document.createElement`div`
menuView.className = 'container'
display.appendChild(menuView)
const workerObject = {}
const workerNameList = [
  'None',
  'Farmer',
  'Rancher',
  'Forester',
  'Miner',
  'Driller'
]
let population = 5
const workerList = []
for (let i = 0; i < population; i++) {
  workerList.push({
    post: workerNameList[0],
    location: 0,
    timestamp: 0
  })
}
const worker = document.createElement`table`
const generateWorkerTableColumn = (d, v) => {
  const tr = document.createElement`tr`
  const item = document.createElement`td`
  const itemSpan = document.createElement`span`
  tr.appendChild(item)
  itemSpan.textContent = d
  item.appendChild(itemSpan)
  const space = document.createElement`span`
  space.textContent = ' '
  item.appendChild(space)
  const img = []
  if (d === workerNameList[1]) {
    const grain = new Image()
    grain.src = imagePathList[0]
    img.push(grain)
    const fruit = new Image()
    fruit.src = imagePathList[2]
    img.push(fruit)
  } else if (d === workerNameList[2]) {
    const livestock = new Image()
    livestock.src = imagePathList[1]
    img.push(livestock)
    const wool = new Image()
    wool.src = imagePathList[3]
    img.push(wool)
  } else if (d === workerNameList[3]) {
    const timber = new Image()
    timber.src = imagePathList[4]
    img.push(timber)
  }
  img.forEach(vl => item.appendChild(vl))
  const td = document.createElement`td`
  const minusButton = document.createElement`button`
  minusButton.textContent = '-'
  minusButton.addEventListener('click', () => {
    if (0 < workerObject[d]) {
      workerObject[d] -= 1
      workerObject[workerNameList[0]] += 1
      workerList[workerList.findIndex(va => va.post === d)] = {
        post: workerNameList[0],
        location: 0,
        timestamp: 0
      }
      elementUpdate()
    }
  })
  if (d !== workerNameList[0]) td.appendChild(minusButton)
  const valuSpan = document.createElement`span`
  valuSpan.id = d
  valuSpan.textContent = v
  td.appendChild(valuSpan)
  const plusButton = document.createElement`button`
  plusButton.textContent = '+'
  plusButton.addEventListener('click', () => {
    if (0 < workerObject[workerNameList[0]]) {
      workerObject[workerNameList[0]] -= 1
      workerObject[d] += 1
      workerList[workerList.findIndex(va => va.post === workerNameList[0])] = {
        post: d,
        location: 0,
        timestamp: 0
      }
      elementUpdate()
    }
  })
  td.className = 'value'
  td.appendChild(plusButton)
  tr.appendChild(td)
  return tr
}
const appendWorkerTable = () => {
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
    workerObject[v] = v === workerNameList[0] ? population : 0
  })
  Object.entries(workerObject).forEach(([k, v]) => {
    worker.appendChild(generateWorkerTableColumn(k, v))
  })
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
const convertObject = {
  [buildingNameList[0]]: {
    in: {[commoditiesNameList[3]]: 2},
    out: {Fabric: 1}
  }, [buildingNameList[1]]: {
    in: {Fabric: 2},
    out: {Clothing: 1}
  }, [buildingNameList[2]]: {
    in: {[commoditiesNameList[4]]: 2},
    out: {Lumber: 1}
  }, [buildingNameList[3]]: {
    in: {Lumber: 2},
    out: {Furniture: 1}
  }, [buildingNameList[4]]: {
    in: {Coal: 1, Iron: 1},
    out: {Steel: 1}
  }, [buildingNameList[5]]: {
    in: {Steel: 2},
    out: {Hardware: 1}
  }, [buildingNameList[6]]: {
    in: {Oil: 2},
    out: {Fuel: 1}
  }, [buildingNameList[7]]: {
    in: {
      [commoditiesNameList[0]]: 1,
      [commoditiesNameList[1]]: 1,
      [commoditiesNameList[2]]: 1
    }, out: {'Canned Food': 1}
  }
}
const building = document.createElement`table`
const generateBuildingTableColumn = (d, v) => {
  const tr = document.createElement`tr`
  const item = document.createElement`td`
  tr.appendChild(item)
  const itemSpan = document.createElement`span`
  itemSpan.textContent = d
  item.appendChild(itemSpan)
  const space = document.createElement`span`
  space.textContent = ' '
  item.appendChild(space)
  const imgSpan = document.createElement`span`
  item.appendChild(imgSpan)
  Object.entries(convertObject[d].in).forEach(([k, vl]) => {
    if (commoditiesNameList.findIndex(va => va === k) !== -1) {
      const img = new Image()
      img.src = imagePathList[commoditiesNameList.findIndex(va => va === k)]
      imgSpan.appendChild(img)
    }
    if (1 < vl) {
      const span = document.createElement`span`
      span.textContent = `*${vl}`
      imgSpan.appendChild(span)
    }
  })
  const equalSpan = document.createElement`span`
  equalSpan.textContent = ' = '
  imgSpan.appendChild(equalSpan)
  Object.entries(convertObject[d].out).forEach(([k, vl]) => {
    if (commoditiesNameList.findIndex(va => va === k) !== -1) {
      const img = new Image()
      img.src = imagePathList[commoditiesNameList.findIndex(va => va === k)]
      imgSpan.appendChild(img)
    }
    if (1 < vl) {
      const span = document.createElement`span`
      span.textContent = `*${vl}`
      imgSpan.appendChild(span)
    }
  })
  const td = document.createElement`td`
  td.className = 'value'
  tr.appendChild(td)
  const minusButton = document.createElement`button`
  minusButton.textContent = '-'
  minusButton.addEventListener('click', () => {
    if (0 < buildingObject[d]) {
      buildingObject[d] -= 1
      workerObject[workerNameList[0]] += 1
      workerList[workerList.findIndex(va => va.post === d)] = {
        post: workerNameList[0],
        location: 0,
        timestamp: 0
      }
      elementUpdate()
    }
  })
  td.appendChild(minusButton)
  const valueSpan = document.createElement`span`
  valueSpan.id = d
  valueSpan.textContent = v
  td.appendChild(valueSpan)
  const plusButton = document.createElement`button`
  plusButton.textContent = '+'
  plusButton.addEventListener('click', () => {
    if (0 < workerObject[workerNameList[0]]) {
      workerObject[workerNameList[0]] -= 1
      buildingObject[d] += 1
      workerList[workerList.findIndex(va => va.post === workerNameList[0])] = {
        post: d,
        location: 0,
        timestamp: 0
      }
      elementUpdate()
    }
  })
  td.appendChild(plusButton)
  return tr
}
const appendBuildingTable = () => {
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
    building.appendChild(generateBuildingTableColumn(k, v))
  })
}
const commoditiesObject = {}
const commodities = document.createElement`table`
const generateCommoditiesTableColumn = (d, v) => {
  const tr = document.createElement`tr`
  const item = document.createElement`td`
  commoditiesNameList.forEach(vl => {
    if (d === vl) {
      item.appendChild(imageList[imageList.findIndex(val => d === val.alt)])
    }
  })
  tr.appendChild(item)
  const span = document.createElement`span`
  span.textContent = d
  item.appendChild(span)
  const value = document.createElement`td`
  value.id = d
  value.className = 'value'
  value.textContent = v
  tr.appendChild(value)
  return tr
}
const appendCommoditiesTable = () => {
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
    commodities.appendChild(generateCommoditiesTableColumn(k, v))
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
  'Farm',
  'Open Range',
  'Orchard',
  'Fertile Hills',
  'Forest'
]
let canvasSerector = '0'
const terrainListObject = {[canvasSerector]: terrainList}
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
const generateTableColumn = d => {
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
  button.addEventListener('click', () => terrainListObject[canvasSerector].push(d))
  return tr
}
terrainNameList.forEach(v => {
  terrain.appendChild(generateTableColumn(v))
})
}
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
      // pushCanvas()
    }
  })
  canvas.addEventListener('mouseup', e => {
    canvasSerector = canvas.id
    let value = ((x - size * 1.5) / (size * 6))
    value = .5 < value % 1 ? 0 : Math.floor(value)
    if (value !== 0 && value < terrainListObject[canvas.id].length) {
      terrainListObject[canvas.id].splice(value, 1)
    }
    elementUpdate()
  })
  const moveTime = 3e3
  const workTime = 4e3
  const fn = () => {
    workerList.forEach((v, i) => {
      if (buildingNameList.some(va => {return v.post === va})) return
      if (
        v.timestamp === 0 ||
        v.timestamp + moveTime * v.location * 2 + workTime < Date.now()
      ) {
        // get commodities
        terrainNameList.forEach((val, ind) => {
          if (terrainListObject[canvas.id][v.location] === val) {
            commoditiesObject[commoditiesNameList[ind]]++
            elementUpdate()
          }
        })
        // set location
        let n
        if (v.post === workerNameList[1]) {
          n = terrainListObject[canvas.id].findIndex((va, ind) => {
            return v.location < ind && (va === terrainNameList[0] || va === terrainNameList[2])
          })
        } else if (v.post === workerNameList[2]) {
          n = terrainListObject[canvas.id].findIndex((va, ind) => {
            return v.location < ind && (va === terrainNameList[1] || va === terrainNameList[3])
          })
        } else if (v.post === workerNameList[3]) {
          n = terrainListObject[canvas.id].findIndex((va, ind) => {
            return v.location < ind && (va === terrainNameList[4])
          })
        }
        if (n === undefined || n === -1) {
          workerList[i].location = 0
          workerList[i].timestamp = 0
        } else {
          workerList[i].location = n
          workerList[i].timestamp = Date.now()
        }
      }
    })
  }
  const draw = () => {
    context.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
    context.save()
    context.font = `normal ${size}px sans-serif`
    context.textAlign = 'center'
    terrainListObject[canvas.id].forEach((v, i) => {
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
    workerList.forEach(v => {
      if (v.timestamp === 0) return
      context.fillStyle = 'cyan'
      let elapsedTime = Date.now() - v.timestamp
      const rate = elapsedTime < moveTime * v.location ?
      elapsedTime / moveTime :
      moveTime * v.location <= elapsedTime &&
      elapsedTime < moveTime * v.location + workTime ?
      v.location :
      (moveTime * v.location * 2 + workTime - elapsedTime) / moveTime
      const progress = rate * size * 6
      context.fillRect(size * 2.5 + progress, size * 3, size, size)
    })
    context.restore()
  }
  const camvasMain = () => {
    fn()
    draw()
    window.requestAnimationFrame(camvasMain)
  }
  camvasMain()
}
const main = () => {
  const workingTime = 1e4
  workerList.forEach(k => {
    if (Object.keys(convertObject).some(ky => k.post === ky)) {
      if (Object.entries(convertObject[k.post].in).every(([ky, vl]) => {
        return vl <= commoditiesObject[ky]
      })) {
        if (k.timestamp === 0) {
          k.timestamp = Date.now()
        }
        if (k.timestamp + workingTime <= Date.now()) { // completed task
          Object.entries(convertObject[k.post].in).forEach(([ky, vl]) => {
            commoditiesObject[ky] -= vl
          })
          Object.entries(convertObject[k.post].out).forEach(([ky, vl]) => {
            if (commoditiesObject[ky] === undefined) {
              commoditiesObject[ky] = 0
              commodities.appendChild(generateCommoditiesTableColumn(ky, 0))
            }
            commoditiesObject[ky] += vl
          })
          k.timestamp = 0
          elementUpdate()
        }
      } else k.timestamp = 0
    }
  })
  window.requestAnimationFrame(main)
}
const stream = async () => {
  await imgLoad()
  appendWorkerTable()
  appendBuildingTable()
  appendCommoditiesTable()
  pushCanvas()
  main()
}
stream()
}