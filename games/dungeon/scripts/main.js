{'use strict'
let money = 0
const resourcesNameList = [
  'Grain',
  'Livestock',
  'Fruit',
  'Wool',
  'Timber',
  'Horses',
  'Iron',
  'Coal',
  'Gold',
  'Gems',
  'Oil',
]
const materialsNameList = [
  'Fabric',
  'Paper',
  'Lumber',
  'Steel',
  'Fuel',
]
const goodsNameList = [
  'Cuisine',
  'Canned Food',
  'Clothing',
  'Furniture',
  'Hardware',
  'Armaments',
]
const commoditiesObject = {}
resourcesNameList.forEach(v => commoditiesObject[v] = 0)
materialsNameList.forEach(v => commoditiesObject[v] = 0)
goodsNameList.forEach(v => commoditiesObject[v] = 0)
const resourcesImagePathList = [
  '小麦アイコン',
  '肉の切り身のアイコン',
  'リンゴアイコン6',
  'ヒツジアイコン',
  '木アイコン',
  '馬アイコン4',
  'iron',
  'coal',
  'gold',
  'gems',
  '石油アイコン',
]
const materialsImagePathList = [
  'fabric',
  '白紙のドキュメントアイコン',
  '丸太アイコン',
  'steel',
  '石油のアイコン',
]
const goodsImagePathList = [
  'フォークとナイフのお食事アイコン素材',
  '空き缶アイコン2',
  'VネックTシャツの無料アイコン1',
  'イスのアイコン9',
  '金づちの無料アイコン',
  '大砲アイコン2',
]
const commoditiesImagePathObject = {}
const nameList = ['people']
const imagePathList = [
  '歩くアイコン',
  'コインのベクター素材',
]
const addPathList = list => {
  list.forEach((v, i) => list[i] = `images/${v}.png`)
}
addPathList(resourcesImagePathList)
addPathList(materialsImagePathList)
addPathList(goodsImagePathList)
resourcesImagePathList.forEach((v, i) => commoditiesImagePathObject[resourcesNameList[i]] = v)
materialsImagePathList.forEach((v, i) => commoditiesImagePathObject[materialsNameList[i]] = v)
goodsImagePathList.forEach((v, i) => commoditiesImagePathObject[goodsNameList[i]] = v)
addPathList(imagePathList)
const resourcesImageList = []
const materialsImageList = []
const goodsImageList = []
const imageList = []
const imgLoad = async (pathList, nameList, imageList) => {
  return new Promise(async resolve => {
    await Promise.all(pathList.map(async (path, i) => {
      return new Promise(async res => {
        const imgPreload = new Image()
        imgPreload.src = path
        imgPreload.alt = nameList[i]
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
const firstPanel = document.createElement`div`
firstPanel.className = 'container'
display.appendChild(firstPanel)
const secondPanel = document.createElement`div`
secondPanel.className = 'container'
display.appendChild(secondPanel)
const thirdPanel = document.createElement`div`
display.appendChild(thirdPanel)
thirdPanel.className = 'container'
const fourthPanel = document.createElement`div`
fourthPanel.className = 'container'
display.appendChild(fourthPanel)
const fifthPanel = document.createElement`div`
fifthPanel.className = 'container'
display.appendChild(fifthPanel)
const resourcesTable = document.createElement`table`
const createResourcesTableColumn = (d, v) => {
  const tr = document.createElement`tr`
  const item = document.createElement`td`
  resourcesNameList.forEach(vl => {
    if (d === vl) {
      item.appendChild(resourcesImageList[resourcesImageList.findIndex(val => d === val.alt)])
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
const appendResourcesTable = () => {
  firstPanel.appendChild(resourcesTable)
  const tr = document.createElement`tr`
  resourcesTable.appendChild(tr)
  const th = document.createElement`th`
  th.textContent = 'Resources'
  tr.appendChild(th)
  const value = document.createElement`th`
  value.textContent = 'Value'
  tr.appendChild(value)
  resourcesNameList.forEach(v => {
    resourcesTable.appendChild(createResourcesTableColumn(v, 0))
  })
}
const materialsTable = document.createElement`table`
const createMaterialsTableColumn = (d, v) => {
  const tr = document.createElement`tr`
  const item = document.createElement`td`
  materialsNameList.forEach(vl => {
    if (d === vl) {
      item.appendChild(materialsImageList[materialsImageList.findIndex(val => d === val.alt)])
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
const appendMaterialsTable = () => {
  firstPanel.appendChild(materialsTable)
  const tr = document.createElement`tr`
  materialsTable.appendChild(tr)
  const th = document.createElement`th`
  th.textContent = 'Materials'
  tr.appendChild(th)
  const value = document.createElement`th`
  value.textContent = 'Value'
  tr.appendChild(value)
  materialsNameList.forEach(v => {
    materialsTable.appendChild(createMaterialsTableColumn(v, 0))
  })
}
const goodsTable = document.createElement`table`
const createGoodsTableColumn = (d, v) => {
  const tr = document.createElement`tr`
  const item = document.createElement`td`
  goodsNameList.forEach(vl => {
    if (d === vl) {
      item.appendChild(goodsImageList[goodsImageList.findIndex(val => d === val.alt)])
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
const appendGoodsTable = () => {
  firstPanel.appendChild(goodsTable)
  const tr = document.createElement`tr`
  goodsTable.appendChild(tr)
  const th = document.createElement`th`
  th.textContent = 'Goods'
  tr.appendChild(th)
  const value = document.createElement`th`
  value.textContent = 'Value'
  tr.appendChild(value)
  goodsNameList.forEach(v => {
    goodsTable.appendChild(createGoodsTableColumn(v, 0))
  })
  const moneyTr = document.createElement`tr`
  goodsTable.appendChild(moneyTr)
  const moneyTh = document.createElement`th`
  moneyTr.appendChild(moneyTh)
  const img = new Image()
  img.src = imagePathList[1]
  moneyTh.appendChild(img)
  const span = document.createElement`span`
  span.textContent = 'Money'
  moneyTh.appendChild(span)
  const moneyValue = document.createElement`td`
  moneyValue.id = 'money'
  moneyValue.className = 'value'
  moneyValue.textContent = money
  moneyTr.appendChild(moneyValue)
}
const jobObject = {}
const jobNameList = [
  'None',
  'Farmer',
  'Rancher',
  'Forester',
  'Miner',
  'Driller'
]
let population = 5
const workerList = []
const fullnessMax = 100
let workerId = -1
const createWorkerFirst = p => {
  workerId++
  return {
    fullness: fullnessMax,
    id: workerId,
    location: 0,
    post: p,
    state: null,
    timestamp: 0,
  }
}
const setJob = (worker, post) => {
  worker.location = 0
  worker.post = post
  worker.timestamp = 0
}
for (let i = 0; i < population; i++) {
  workerList.push(createWorkerFirst(jobNameList[0]))
}
const worker = document.createElement`table`
const createWorkerTableColumn = (d, v) => {
  const tr = document.createElement`tr`
  const itemTd = document.createElement`td`
  itemTd.textContent = d
  tr.appendChild(itemTd)
  const productTd = document.createElement`td`
  tr.appendChild(productTd)
  const img = []
  if (d === jobNameList[0]) {
    const can = new Image()
    can.src = goodsImagePathList[1]
    img.push(can)
    const clothing = new Image()
    clothing.src = goodsImagePathList[2]
    img.push(clothing)
    const furniture = new Image()
    furniture.src = goodsImagePathList[3]
    img.push(furniture)
    const span = document.createElement`span`
    span.textContent = ' = '
    img.push(span)
    img.push(imageList[0])
  } else if (d === jobNameList[1]) {
    const grain = new Image()
    grain.src = resourcesImagePathList[0]
    img.push(grain)
    const fruit = new Image()
    fruit.src = resourcesImagePathList[2]
    img.push(fruit)
  } else if (d === jobNameList[2]) {
    const livestock = new Image()
    livestock.src = resourcesImagePathList[1]
    img.push(livestock)
    const wool = new Image()
    wool.src = resourcesImagePathList[3]
    img.push(wool)
  } else if (d === jobNameList[3]) {
    const timber = new Image()
    timber.src = resourcesImagePathList[4]
    img.push(timber)
  } else if (d === jobNameList[4]) {
    const iron = new Image()
    iron.src = resourcesImagePathList[6]
    img.push(iron)
    const coal = new Image()
    coal.src = resourcesImagePathList[7]
    img.push(coal)
  } else if (d === jobNameList[5]) {
    const oil = new Image()
    oil.src = resourcesImagePathList[10]
    img.push(oil)
  }
  img.forEach(vl => productTd.appendChild(vl))
  const td = document.createElement`td`
  td.className = 'value'
  const minusButton = document.createElement`button`
  minusButton.id = `minus-${d}`
  minusButton.textContent = '-'
  minusButton.addEventListener('click', () => {
    jobObject[d] -= 1
    jobObject[jobNameList[0]] += 1
    workerList[workerList.findIndex(va => va.post === d)].post = 'None'
  })
  if (d !== jobNameList[0]) td.appendChild(minusButton)
  const valuSpan = document.createElement`span`
  valuSpan.id = d
  valuSpan.textContent = v
  td.appendChild(valuSpan)
  const plusButton = document.createElement`button`
  plusButton.id = `plus-${d}`
  plusButton.textContent = '+'
  if (d === jobNameList[0]) {
    plusButton.addEventListener('click', () => {
      commoditiesObject['Canned Food']--
      commoditiesObject['Clothing']--
      commoditiesObject['Furniture']--
      jobObject['None']++
      workerList.push(createWorkerFirst(jobNameList[0]))
      pushPersonalTable(workerList[workerList.length - 1])
    })
  } else plusButton.addEventListener('click', () => {
    jobObject[jobNameList[0]] -= 1
    jobObject[d] += 1
    setJob(workerList[workerList.findIndex(va => va.post === jobNameList[0])], d)
  })
  td.appendChild(plusButton)
  tr.appendChild(td)
  return tr
}
const appendJobTable = () => {
  secondPanel.appendChild(worker)
  const tr = document.createElement`tr`
  worker.appendChild(tr)
  const jobTh = document.createElement`th`
  jobTh.textContent = 'Job'
  tr.appendChild(jobTh)
  const productTh = document.createElement`th`
  productTh.textContent = 'Products'
  tr.appendChild(productTh)
  const value = document.createElement`th`
  value.textContent = 'Value'
  tr.appendChild(value)
  jobNameList.forEach(v => {
    jobObject[v] = v === jobNameList[0] ? population : 0
  })
  Object.entries(jobObject).forEach(([k, v]) => {
    worker.appendChild(createWorkerTableColumn(k, v))
  })
}
const buildingObject = {}
const convertObject = {
  'Canteen': {
    in: {
      [resourcesNameList[0]]: 14,
      [resourcesNameList[1]]: 7,
      [resourcesNameList[2]]: 8,
    },
    out: {[goodsNameList[0]]: 1e3}
  }, 'Food Production': {
    in: {
      [resourcesNameList[0]]: 1,
      [resourcesNameList[1]]: 1,
      [resourcesNameList[2]]: 1
    }, out: {[goodsNameList[1]]: 1}
  }, 'Textile Mill': {
    in: {[resourcesNameList[3]]: 2},
    out: {[materialsNameList[0]]: 1}
  }, 'Clothing Factory': {
    in: {[materialsNameList[0]]: 2},
    out: {[goodsNameList[2]]: 1}
  }, 'Lumber Mill': {
    in: {[resourcesNameList[4]]: 2},
    out: {[materialsNameList[2]]: 1}
  }, 'Furniture Factory': {
    in: {[materialsNameList[2]]: 2},
    out: {[goodsNameList[3]]: 1}
  }, 'Paper Mill': {
    in: {[resourcesNameList[4]]: 2},
    out: {[materialsNameList[1]]: 1}
  }, 'Steel Mill': {
    in: {Coal: 1, Iron: 1},
    out: {[materialsNameList[3]]: 1}
  }, 'Blacksmith': {
    in: {[materialsNameList[3]]: 2},
    out: {[goodsNameList[4]]: 1}
  }, 'Armaments Factory': {
    in: {[materialsNameList[3]]: 2},
    out: {[goodsNameList[5]]: 1}
  }, 'Refinery': {
    in: {[resourcesNameList[10]]: 2},
    out: {[materialsNameList[4]]: 1}
  },
}
const buildingWorkTime = 1e4
const building = document.createElement`table`
const createBuildingTableColumn = (d, v) => {
  const tr = document.createElement`tr`
  const item = document.createElement`td`
  item.textContent = d
  tr.appendChild(item)
  const leftSide = document.createElement`td`
  leftSide.className = 'value'
  tr.appendChild(leftSide)
  const rightSide = document.createElement`td`
  tr.appendChild(rightSide)
  Object.entries(convertObject[d].in).forEach(([k, vl]) => {
    const img = new Image()
    if (resourcesNameList.findIndex(va => va === k) !== -1) {
      img.src = resourcesImagePathList[resourcesNameList.findIndex(va => va === k)]
    } else if (materialsNameList.findIndex(va => va === k) !== -1) {
      img.src = materialsImagePathList[materialsNameList.findIndex(va => va === k)]
    } else if (goodsNameList.findIndex(va => va === k) !== -1) {
      img.src = goodsImagePathList[goodsNameList.findIndex(va => va === k)]
    }
    leftSide.appendChild(img)
    if (1 < vl) {
      const span = document.createElement`span`
      span.textContent = `*${vl}`
      leftSide.appendChild(span)
    }
  })
  const equalSpan = document.createElement`span`
  equalSpan.textContent = ' = '
  rightSide.appendChild(equalSpan)
  Object.entries(convertObject[d].out).forEach(([k, vl]) => {
    const img = new Image()
    if (resourcesNameList.findIndex(va => va === k) !== -1) {
      img.src = resourcesImagePathList[resourcesNameList.findIndex(va => va === k)]
    } else if (materialsNameList.findIndex(va => va === k) !== -1) {
      img.src = materialsImagePathList[materialsNameList.findIndex(va => va === k)]
    } else if (goodsNameList.findIndex(va => va === k) !== -1) {
      img.src = goodsImagePathList[goodsNameList.findIndex(va => va === k)]
    }
    rightSide.appendChild(img)
    if (1 < vl) {
      const span = document.createElement`span`
      span.textContent = `*${vl}`
      rightSide.appendChild(span)
    }
  })
  const progressTd = document.createElement`td`
  tr.appendChild(progressTd)
  const progress = document.createElement`progress`
  progress.id = `buildingProgress-${d}`
  progress.max = buildingWorkTime
  progress.value = 0
  progressTd.appendChild(progress)
  const td = document.createElement`td`
  td.className = 'value'
  tr.appendChild(td)
  const minusButton = document.createElement`button`
  minusButton.id = `minus-${d}`
  minusButton.textContent = '-'
  minusButton.addEventListener('click', () => {
    const i = workerList.findIndex(va => va.post === d)
    if (buildingObject[d].value !== 1) {
      workerList[workerList.findIndex((va, idx) => {
        return i < idx && va.post === d
      })].timestamp -= (Date.now() - workerList[i].timestamp) / buildingObject[d].value
    }
    buildingObject[d].value -= 1
    jobObject[jobNameList[0]] += 1
    setJob(workerList[i], jobNameList[0])
  })
  td.appendChild(minusButton)
  const valueSpan = document.createElement`span`
  valueSpan.id = d
  valueSpan.textContent = v
  td.appendChild(valueSpan)
  const plusButton = document.createElement`button`
  plusButton.id = `plus-${d}`
  plusButton.textContent = '+'
  plusButton.addEventListener('click', () => {
    jobObject[jobNameList[0]] -= 1
    buildingObject[d].value += 1
    setJob(workerList[workerList.findIndex(va => va.post === jobNameList[0])], d)
  })
  td.appendChild(plusButton)
  return tr
}
const appendBuildingTable = () => {
  fourthPanel.appendChild(building)
  const tr = document.createElement`tr`
  building.appendChild(tr)
  const buildingTh = document.createElement`th`
  buildingTh.textContent = 'Building'
  tr.appendChild(buildingTh)
  const productTh = document.createElement`th`
  productTh.textContent = 'Products'
  productTh.className = 'value'
  tr.appendChild(productTh)
  const dummyTh = document.createElement`th`
  tr.appendChild(dummyTh)
  const progressTh = document.createElement`th`
  progressTh.textContent = 'Progress'
  tr.appendChild(progressTh)
  const value = document.createElement`th`
  value.textContent = 'Value'
  tr.appendChild(value)
  Object.keys(convertObject).forEach(v => {
    buildingObject[v] = {}
    buildingObject[v].value = 0
    buildingObject[v].timestamp = 0
  })
  Object.entries(buildingObject).forEach(([k, v]) => {
    building.appendChild(createBuildingTableColumn(k, v.value))
  })
}
const buildingProgressUpdate = d => {
  const progress = document.getElementById(`buildingProgress-${d}`)
  if (buildingObject[d].value <= 0) {
    progress.value = 0
    return
  }
  progress.value = workerList.reduce((acc, cur) => {
    if (cur.post === d && cur.timestamp !== 0) return acc + Date.now() - cur.timestamp
    else return acc
  }, 0) / buildingObject[d].value * Math.log2(1 + buildingObject[d].value)
}
const terrainList = ['Town']
const terrainProductObject = {
  'Farm': 'Grain',
  'Open Range': 'Livestock',
  'Orchard': 'Fruit',
  'Fertile Hills': 'Wool',
  'Forest': 'Timber',
  'Iron Mines': 'Iron',
  'Coal Mines': 'Coal',
  'Desert': 'Oil',
}
let canvasSerector = '0'
const terrainListObject = {[canvasSerector]: terrainList}
const appendTerrainTable = () => {
  const terrainTable = document.createElement`table`
  secondPanel.appendChild(terrainTable)
  const tr = document.createElement`tr`
  terrainTable.appendChild(tr)
  const th = document.createElement`th`
  th.textContent = 'Terrain'
  tr.appendChild(th)
  const productTh = document.createElement`th`
  productTh.textContent = 'Products'
  tr.appendChild(productTh)
  const value = document.createElement`th`
  value.textContent = 'Add'
  tr.appendChild(value)
  const createTableColumn = d => {
    const tr = document.createElement`tr`
    terrainTable.appendChild(tr)
    const nameTd = document.createElement`td`
    nameTd.textContent = d
    tr.appendChild(nameTd)
    const productTd = document.createElement`td`
    tr.appendChild(productTd)
    const img = new Image()
    img.src = commoditiesImagePathObject[terrainProductObject[d]]
    productTd.appendChild(img)
    const addTd = document.createElement`td`
    addTd.className = 'value'
    tr.appendChild(addTd)
    const button = document.createElement`button`
    button.id = d
    button.textContent = '+'
    addTd.appendChild(button)
    button.addEventListener('click', () => terrainListObject[canvasSerector].push(d))
  }
  Object.keys(terrainProductObject).forEach(v => createTableColumn(v))
}
const personalTable = document.createElement`table`
const pushPersonalTable = d => {
  const tr = document.createElement`tr`
  tr.id = `tr-${d.id}`
  personalTable.appendChild(tr)
  const post = document.createElement`td`
  post.id = `post-${d.id}`
  post.textContent = d.post
  tr.appendChild(post)
  const fullness = document.createElement`td`
  fullness.className = 'value'
  tr.appendChild(fullness)
  const progress = document.createElement`progress`
  progress.id = `progress-${d.id}`
  progress.max = 100
  progress.value = d.fullness
  fullness.appendChild(progress)
}
const personalViewUpdate = d => {
  document.getElementById(`post-${d.id}`).textContent = d.post
  document.getElementById(`progress-${d.id}`).value = d.fullness
}
const appendPersonalTable = () => {
  fifthPanel.appendChild(personalTable)
  const tr = document.createElement`tr`
  personalTable.appendChild(tr)
  const post = document.createElement`th`
  post.textContent = 'Post'
  tr.appendChild(post)
  const fullness = document.createElement`th`
  fullness.textContent = 'Fullness'
  tr.appendChild(fullness)
  workerList.forEach(v => pushPersonalTable(v))
}
const tradeObject = {
  'Grain': 100,
  'Livestock': 100,
  'Fruit': 100,
  'Wool': 100,
  'Timber': 100,
  'Iron': 100,
  'Coal': 100,
  'Gold': 200,
  'Gems': 500,
  'Oil': 100,
  'Fabric': 200,
  'Paper': 200,
  'Lumber': 200,
  'Steel': 200,
  'Fuel': 200,
  'Canned Food': 400,
  'Clothing': 900,
  'Furniture': 900,
  'Hardware': 900,
}
const tradeBidObject = {}
Object.keys(tradeObject).forEach(v => tradeBidObject[v] = 0)
let payment = 0
const tradeInterval = 3e4
let tradeTimestamp = 0
const tradeTable = document.createElement`table`
const appendTradeTable = () => {
  fifthPanel.appendChild(tradeTable)
  const tr = document.createElement`tr`
  tradeTable.appendChild(tr)
  const th = document.createElement`th`
  th.textContent = 'Commodity'
  tr.appendChild(th)
  const orders = document.createElement`th`
  orders.textContent = 'Orders'
  tr.appendChild(orders)
  const price = document.createElement`th`
  price.textContent = 'Price'
  tr.appendChild(price)
  const available = document.createElement`th`
  available.textContent = 'Available'
  tr.appendChild(available)
  const quantity = document.createElement`th`
  quantity.textContent = 'Quantity to Offer'
  tr.appendChild(quantity)
  const interval = document.createElement`td`
  interval.id = 'trade-interval'
  interval.textContent = 0
  tr.appendChild(interval)
  const createTradeTr = (k, v) => {
    const tr = document.createElement`tr`
    tradeTable.appendChild(tr)
    const item = document.createElement`td`
    tr.appendChild(item)
    const img = new Image()
    img.src = commoditiesImagePathObject[k]
    item.appendChild(img)
    const name = document.createElement`span`
    name.textContent = k
    item.appendChild(name)
    const orders = document.createElement`td`
    tr.appendChild(orders)
    const toggle = document.createElement`button`
    toggle.id = `trade-orders-${k}`
    toggle.textContent = 'Offer'
    orders.appendChild(toggle)
    const price = document.createElement`td`
    price.className = 'value'
    price.textContent = v
    tr.appendChild(price)
    const available = document.createElement`td`
    available.id = `trade-available-${k}`
    available.className = 'value'
    available.textContent = commoditiesObject[k]
    tr.appendChild(available)
    const td = document.createElement`td`
    tr.appendChild(td)
    const minusButton = document.createElement`button`
    minusButton.id = `trade-minus-${k}`
    minusButton.textContent = '-'
    td.appendChild(minusButton)
    const input = document.createElement`input`
    input.id = `trade-range-${k}`
    input.type = 'range'
    input.max = 0
    input.value = 0
    td.appendChild(input)
    toggle.addEventListener('click', e => {
      if (e.target.textContent === 'Bid') {
        e.target.textContent = 'Offer'
        input.max = commoditiesObject[k]
      } else {
        e.target.textContent = 'Bid'
        input.max = tradeBidObject[k]
      }
      input.value = 0
    })
    minusButton.addEventListener('click', () => {
      if (0 < +input.value) input.value--
    })
    const inputValue = document.createElement`span`
    inputValue.id = `trade-value-${k}`
    inputValue.textContent = 0
    td.appendChild(inputValue)
    const plusButton = document.createElement`button`
    plusButton.id = `trade-plus-${k}`
    plusButton.textContent = '+'
    td.appendChild(plusButton)
    plusButton.addEventListener('click', () => {
      if (+input.value < +input.max) input.value++
    })
  }
  Object.entries(tradeObject).forEach(([k, v]) => createTradeTr(k, v))
}
const elementUpdate = () => {
  Object.entries(commoditiesObject).forEach(([k, v]) => {
    document.getElementById(k).textContent = v
  })
  Object.entries(buildingObject).forEach(([k, v]) => {
    document.getElementById(k).textContent = v.value
  })
  Object.entries(jobObject).forEach(([k, v]) => {
    document.getElementById(k).textContent = v
  })
  document.getElementById(`money`).textContent = money
  jobNameList.forEach(v => {
    if (v === 'None') {
      if (
        0 < commoditiesObject['Canned Food'] &&
        0 < commoditiesObject['Clothing'] &&
        0 < commoditiesObject['Furniture']
      ) {
        document.getElementById(`plus-${v}`).disabled = false
      } else document.getElementById(`plus-${v}`).disabled = true
      return
    }
    if (jobObject[v] <= 0) {
      document.getElementById(`minus-${v}`).disabled = true
    } else document.getElementById(`minus-${v}`).disabled = false
    if (jobObject['None'] <= workerList.reduce((acc, cur) => {
      if (cur.post === 'None' && cur.state === 'return') return ++acc
      else return acc
    }, 0)) {
      document.getElementById(`plus-${v}`).disabled = true
    } else document.getElementById(`plus-${v}`).disabled = false
  })
  workerList.forEach(v => personalViewUpdate(v))
  Object.keys(convertObject).forEach(v => {
    if (buildingObject[v].value <= 0) {
      document.getElementById(`minus-${v}`).disabled = true
    } else document.getElementById(`minus-${v}`).disabled = false
    if (jobObject['None'] <= workerList.reduce((acc, cur) => {
      if (cur.post === 'None' && cur.state === 'return') return ++acc
      else return acc
    }, 0)) {
      document.getElementById(`plus-${v}`).disabled = true
    } else document.getElementById(`plus-${v}`).disabled = false
    buildingProgressUpdate(v)
  })
  Object.keys(tradeObject).forEach(v => {
    const order = document.getElementById(`trade-orders-${v}`).textContent
    const range = document.getElementById(`trade-range-${v}`)
    const available = document.getElementById(`trade-available-${v}`)
    const value = order === 'Offer' ? commoditiesObject[v] : tradeBidObject[v]
    available.textContent = value
    range.max = value
    if (+range.value === 0) {
      document.getElementById(`trade-minus-${v}`).disabled = true
    } else document.getElementById(`trade-minus-${v}`).disabled = false
    document.getElementById(`trade-value-${v}`).textContent = range.value
    if (value === +range.value || (order === 'Bid' && money < payment + tradeObject[v])) {
      document.getElementById(`trade-plus-${v}`).disabled = true
    } else document.getElementById(`trade-plus-${v}`).disabled = false
  })
  document.getElementById('trade-interval').textContent = tradeTimestamp === 0 ? '00000' :
  ('00000' + (tradeInterval - Date.now() + tradeTimestamp)).slice(-5)
}
const size = 16
let canvasId = 0
const pushCanvas = () => {
  const canvas = document.createElement`canvas`
  canvas.id = canvasId
  canvas.width = size * 16 * 3
  canvas.height = size * 4
  const context = canvas.getContext`2d`
  thirdPanel.appendChild(canvas)
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
  })
  const moveTime = 3e3
  const workTime = 4e3
  const fn = () => {
    workerList.forEach((v, i) => {
      if (Object.keys(convertObject).some(va => {return v.post === va})) return
      if (Date.now() - v.timestamp < moveTime + workTime && (
        terrainListObject[canvas.id][v.location] === undefined || v.post === 'None')
      ) {
        v.state = 'return'
        if (Date.now() - v.timestamp < moveTime * v.location) {
          v.timestamp -= workTime + (moveTime * v.location - Date.now() + v.timestamp) * 2
        } else v.timestamp -= moveTime * v.location + workTime - Date.now() + v.timestamp
      }
      if (
        v.timestamp === 0 ||
        v.timestamp + moveTime * v.location * 2 + workTime < Date.now()
      ) {
        // get resources
        if (v.state !== 'return') {
          Object.keys(terrainProductObject).forEach(val => {
            if (terrainListObject[canvas.id][v.location] === val) {
              if (terrainProductObject[val] === 'Iron' || terrainProductObject[val] === 'Coal') {
                const goldDropRate = 1 / 2 ** 7
                const gemsDropRate = 1 / 2 ** 9
                if (1 / goldDropRate < Math.random()) commoditiesObject['Gold']++
                if (1 / gemsDropRate < Math.random()) commoditiesObject['Gems']++
              }
              commoditiesObject[terrainProductObject[val]]++
              v.fullness -= v.location
            }
          })
        } else v.state = null
        // set location
        let n
        if (v.post === jobNameList[1]) {
          n = terrainListObject[canvas.id].findIndex((va, ind) => {
            return v.location < ind && (va === 'Farm' || va === 'Orchard')
          })
        } else if (v.post === jobNameList[2]) {
          n = terrainListObject[canvas.id].findIndex((va, ind) => {
            return v.location < ind && (va === 'Open Range' || va === 'Fertile Hills')
          })
        } else if (v.post === jobNameList[3]) {
          n = terrainListObject[canvas.id].findIndex((va, ind) => {
            return v.location < ind && (va === 'Forest')
          })
        } else if (v.post === jobNameList[4]) {
          n = terrainListObject[canvas.id].findIndex((va, ind) => {
            return v.location < ind && (va === 'Iron Mines' || va === 'Coal Mines')
          })
        } else if (v.post === jobNameList[5]) {
          n = terrainListObject[canvas.id].findIndex((va, ind) => {
            return v.location < ind && (va === 'Desert')
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
      if (v.timestamp === 0 || Object.keys(convertObject).some(vl => vl === v.post) ||
        v.state === 'eat') return
      context.fillStyle = 'cyan'
      const elapsedTime = Date.now() - v.timestamp
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
let decreaseTime = 0
const main = () => {
  const hungerInterval = 6e3
  const eatInterval = 200
  if (hungerInterval <= Date.now() - decreaseTime) {
    workerList.forEach(v => v.fullness--)
    decreaseTime += hungerInterval
  }
  workerList.forEach((k, i) => {
    if (k.timestamp === 0 &&
      k.fullness < fullnessMax &&
      0 < commoditiesObject['Cuisine']
    ) {
      k.state = 'eat'
      k.timestamp = Date.now()
    }
    if (k.state === 'eat') {
      if (Date.now() - k.timestamp <= eatInterval) return
      if (k.fullness < 100 && 0 < commoditiesObject['Cuisine']) {
        commoditiesObject['Cuisine']--
        k.fullness++
        k.timestamp += eatInterval
        return
      } else {
        k.state = null
        k.timestamp = 0
      }
    }
    if (k.fullness <= 0) {
      if (jobNameList.some(v => v === k.post)) jobObject[k.post]--
      else if (Object.keys(convertObject).some(v => v === k.post)) buildingObject[k.post].value--
      document.getElementById(`tr-${k.id}`).remove()
      workerList.splice(i, 1)
    }
    if (Object.keys(convertObject).some(ky => k.post === ky)) {
      if (Object.entries(convertObject[k.post].in).every(([ky, vl]) => {
        return vl <= commoditiesObject[ky]
      })) {
        if (buildingObject[k.post].timestamp === 0) buildingObject[k.post].timestamp = Date.now()
        if (k.timestamp === 0) k.timestamp = Date.now()
        if (
          buildingWorkTime <= workerList.reduce((acc, cur) => {
            if (cur.post === k.post && cur.timestamp !== 0) return acc + Date.now() - cur.timestamp
            else return acc
          }, 0) / buildingObject[k.post].value * Math.log2(1 + buildingObject[k.post].value)
        ) { // task completed
          Object.entries(convertObject[k.post].in).forEach(([ky, vl]) => {
            commoditiesObject[ky] -= vl
          })
          Object.entries(convertObject[k.post].out).forEach(([ky, vl]) => {
            commoditiesObject[ky] += vl
          })
          k.timestamp = 0
          buildingObject[k.post].timestamp = 0
          const number = buildingObject[k.post].value
          const rate = 10
          workerList.forEach(v => {
            if (v.post === k.post) {
              v.fullness -= Math.floor(rate / number)
              v.timestamp = 0
            }
          })
        }
      } else {
        buildingObject[k.post].timestamp = 0
        k.timestamp = 0
      }
    }
  })
  { // trade
    payment = 0
    Object.entries(tradeObject).forEach(([k, v]) => {
      const range = document.getElementById(`trade-range-${k}`)
      const order = document.getElementById(`trade-orders-${k}`).textContent
      if (order === 'Bid') payment += tradeObject[k] * range.value
      if (tradeInterval <= Date.now() - tradeTimestamp) {
        if (order === 'Offer' && 0 < +range.value) {
          const number = Math.round(Math.random() * range.value)
          range.value -= number
          commoditiesObject[k] -= number
          range.max = commoditiesObject[k]
          money += v * number
        } else if (0 < +range.value) { // bid
          money -= v * range.value
          commoditiesObject[k] += +range.value
          tradeBidObject[k] -= +range.value
          range.max = tradeBidObject[k]
          range.value = 0
        }
        const number = Math.floor((Math.random() - .5) * 8) // temporary
        tradeBidObject[k] + number < 0 ? 0 : tradeBidObject[k] += number
      }
    })
    if (tradeInterval <= Date.now() - tradeTimestamp) tradeTimestamp = Date.now()
  }
  elementUpdate()
  window.requestAnimationFrame(main)
}
const debugBonus = () => {
  money += 1e4
  commoditiesObject['Paper'] += 12
}
const stream = async () => {
  await imgLoad(
    resourcesImagePathList, resourcesNameList, resourcesImageList)
  await imgLoad(
    materialsImagePathList, materialsNameList, materialsImageList)
  await imgLoad(
    goodsImagePathList, goodsNameList, goodsImageList)
  await imgLoad(imagePathList, nameList, imageList)
  appendResourcesTable()
  appendMaterialsTable()
  appendGoodsTable()
  appendTerrainTable()
  appendJobTable()
  pushCanvas()
  appendBuildingTable()
  appendTradeTable()
  appendPersonalTable()
  decreaseTime = Date.now()
  tradeTimestamp = Date.now()
  debugBonus()
  main()
}
stream()
}