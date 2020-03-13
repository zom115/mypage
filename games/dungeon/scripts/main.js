{'use strict'
let money = 0
const resourcesImageObject = {
  'Grain':     '小麦アイコン',
  'Livestock': '肉の切り身のアイコン',
  'Fruit':     'リンゴアイコン6',
  'Wool':      'ヒツジアイコン',
  'Timber':    '木アイコン',
  'Horses':    '馬アイコン4',
  'Iron':      'iron',
  'Coal':      'coal',
  'Gold':      'gold',
  'Gems':      'gems',
  'Oil':       '石油アイコン',
}
const materialsImageObject = {
  'Fabric': 'fabric',
  'Paper':  '白紙のドキュメントアイコン',
  'Lumber': '丸太アイコン',
  'Steel':  'steel',
  'Fuel':   '石油のアイコン',
}
const goodsImageObject = {
  'Cuisine':     'フォークとナイフのお食事アイコン素材',
  'Canned Food': '空き缶アイコン2',
  'Clothing':    'VネックTシャツの無料アイコン1',
  'Furniture':   'イスのアイコン9',
  'Hardware':    '金づちの無料アイコン',
  'Armaments':   '大砲アイコン2',
}
const commonImageObject = {
  'Labour':    'マッチョアイコン5',
  'Untrained': '玉子のイラスト',
  'Trained':   'ヒヨコのフリー素材',
  'Expert':    'にわとりアイコン2',
  'Money':     'コインのベクター素材',
}
const commoditiesObject = {}
Object.keys(resourcesImageObject).forEach(v => commoditiesObject[v] = 0)
Object.keys(materialsImageObject).forEach(v => commoditiesObject[v] = 0)
Object.keys(goodsImageObject).forEach(v => commoditiesObject[v] = 0)
const imagePathObject = {}
const addPathObject = obj => {
  Object.entries(obj).forEach(([k, v]) => obj[k] = `images/${v}.png`)
}
addPathObject(resourcesImageObject)
addPathObject(materialsImageObject)
addPathObject(goodsImageObject)
addPathObject(commonImageObject)
Object.entries(resourcesImageObject).forEach(([k, v]) => imagePathObject[k] = v)
Object.entries(materialsImageObject).forEach(([k, v]) => imagePathObject[k] = v)
Object.entries(goodsImageObject).forEach(([k, v]) => imagePathObject[k] = v)
Object.entries(commonImageObject).forEach(([k, v]) => imagePathObject[k] = v)
const resourcesImageDOMList = []
const materialsImageDOMList = []
const goodsImageDOMList = []
const commonImageDOMList = []
const imageLoad = async (obj, imageList) => {
  return new Promise(async resolve => {
    await Promise.all(Object.entries(obj).map(async ([name, path], i) => {
      return new Promise(async res => {
        const imgPreload = new Image()
        imgPreload.src = path
        imgPreload.alt = name
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
const labourPanel = document.createElement`div`
display.appendChild(labourPanel)
labourPanel.className = 'container'
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
  tr.appendChild(item)
  const img = new Image()
  img.src = resourcesImageObject[d]
  item.appendChild(img)
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
  Object.keys(resourcesImageObject).forEach(v => {
    resourcesTable.appendChild(createResourcesTableColumn(v, 0))
  })
}
const materialsTable = document.createElement`table`
const createMaterialsTableColumn = (d, v) => {
  const tr = document.createElement`tr`
  const item = document.createElement`td`
  tr.appendChild(item)
  const img = new Image()
  img.src = materialsImageObject[d]
  item.appendChild(img)
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
  Object.keys(materialsImageObject).forEach(v => {
    materialsTable.appendChild(createMaterialsTableColumn(v, 0))
  })
}
const goodsTable = document.createElement`table`
const createGoodsTableColumn = (d, v) => {
  const tr = document.createElement`tr`
  const item = document.createElement`td`
  tr.appendChild(item)
  const img = new Image()
  img.src = goodsImageObject[d]
  item.appendChild(img)
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
  Object.keys(goodsImageObject).forEach(v => {
    goodsTable.appendChild(createGoodsTableColumn(v, 0))
  })
  const moneyTr = document.createElement`tr`
  goodsTable.appendChild(moneyTr)
  const moneyTh = document.createElement`th`
  moneyTr.appendChild(moneyTh)
  const img = new Image()
  img.src = commonImageObject['Money']
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
  'Untrained',
  'Trained',
  'Expert',
  'Farmer',
  'Rancher',
  'Forester',
  'Miner',
  'Driller',
]
let labour = 0
const labourList = []
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
const resetJob = (worker, post) => {
  worker.location = 0
  worker.post = post
  worker.timestamp = 0
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
  if (d === 'Untrained') {
    const can = new Image()
    can.src = imagePathObject['Canned Food']
    img.push(can)
    const clothing = new Image()
    clothing.src = imagePathObject['Clothing']
    img.push(clothing)
    const furniture = new Image()
    furniture.src = imagePathObject['Furniture']
    img.push(furniture)
    const span = document.createElement`span`
    span.textContent = ' = '
    img.push(span)
    const untraining = new Image()
    untraining.src = commonImageObject['Untrained']
    img.push(untraining)
  } else if (d === 'Farmer') {
    const grain = new Image()
    grain.src = imagePathObject['Grain']
    img.push(grain)
    const fruit = new Image()
    fruit.src = imagePathObject['Fruit']
    img.push(fruit)
  } else if (d === 'Rancher') {
    const livestock = new Image()
    livestock.src = imagePathObject['Livestock']
    img.push(livestock)
    const wool = new Image()
    wool.src = imagePathObject['Wool']
    img.push(wool)
  } else if (d === 'Forester') {
    const timber = new Image()
    timber.src = imagePathObject['Timber']
    img.push(timber)
  } else if (d === 'Miner') {
    const iron = new Image()
    iron.src = imagePathObject['Iron']
    img.push(iron)
    const coal = new Image()
    coal.src = imagePathObject['Coal']
    img.push(coal)
  } else if (d === 'Driller') {
    const oil = new Image()
    oil.src = imagePathObject['Oil']
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
    jobObject['Untrained'] += 1
    workerList[workerList.findIndex(va => va.post === d)].post = 'Untrained'
    labour++
  })
  if (d !== 'Untrained') td.appendChild(minusButton)
  const valuSpan = document.createElement`span`
  valuSpan.id = d
  valuSpan.textContent = v
  td.appendChild(valuSpan)
  const plusButton = document.createElement`button`
  plusButton.id = `plus-${d}`
  plusButton.textContent = '+'
  if (d === 'Untrained') {
    plusButton.addEventListener('click', () => {
      commoditiesObject['Canned Food']--
      commoditiesObject['Clothing']--
      commoditiesObject['Furniture']--
      jobObject['Untrained']++
      labour++
      workerList.push(createWorkerFirst())
      pushPersonalTable(workerList[workerList.length - 1])
    })
  } else plusButton.addEventListener('click', () => {
    jobObject['Untrained'] -= 1
    jobObject[d] += 1
    resetJob(workerList[workerList.findIndex(va => va.post === 'Untrained')], d)
    labour--
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
  Object.entries(jobObject).forEach(([k, v]) => {
    worker.appendChild(createWorkerTableColumn(k, v))
  })
}
const convertObject = {
  'Canteen': [{
    in: {
      'Grain': 14,
      'Livestock': 7,
      'Fruit': 8,
    },
    out: {'Cuisine': 1e3},
  },], 'Food Production': [{
    in: {
      'Grain': 1,
      'Livestock': 1,
      'Fruit': 1
    }, out: {'Canned Food': 1},
  },], 'Textile Mill': [{
    in: {'Wool': 2},
    out: {'Fabric': 1},
  },], 'Clothing Factory': [{
    in: {'Fabric': 2},
    out: {'Clothing': 1},
  },], 'Lumber Mill': [{
    in: {'Timber': 2},
    out: {'Lumber': 1},
  }, {
    in: {'Timber': 2},
    out: {'Paper': 1},
  },], 'Furniture Factory': [{
    in: {'Lumber': 2},
    out: {'Furniture': 1},
  },], 'Steel Mill': [{
    in: {Coal: 1, Iron: 1},
    out: {'Steel': 1},
  },], 'Blacksmith': [{
    in: {'Steel': 2},
    out: {'Hardware': 1},
  }, {
    in: {'Steel': 2},
    out: {'Armaments': 1},
  },], 'Refinery': [{
    in: {'Oil': 2},
    out: {'Fuel': 1},
  },],
}
const recipeList = Object.values(convertObject).flat()
recipeList.forEach(v => {
  v.value = 0
  v.timestamp = 0
})
const buildingWorkTime = 1e4
const building = document.createElement`table`
const createBuildingTableColumn = (d, v, i, iC) => {
  const tr = document.createElement`tr`
  const item = document.createElement`td`
  if (iC === 0) item.textContent = d
  tr.appendChild(item)
  const leftSide = document.createElement`td`
  leftSide.className = 'value'
  tr.appendChild(leftSide)
  const rightSide = document.createElement`td`
  tr.appendChild(rightSide)
  Object.entries(recipeList[i].in).forEach(([k, vl]) => {
    const img = new Image()
    img.src = imagePathObject[k]
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
  Object.entries(recipeList[i].out).forEach(([k, vl]) => {
    const img = new Image()
    img.src = imagePathObject[k]
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
  progress.id = `building-progress-${i}`
  progress.max = buildingWorkTime
  progress.value = 0
  progressTd.appendChild(progress)
  const td = document.createElement`td`
  td.className = 'value'
  tr.appendChild(td)
  const minusButton = document.createElement`button`
  minusButton.id = `building-minus-${i}`
  minusButton.textContent = '-'
  minusButton.addEventListener('click', () => {
    const index = labourList.findIndex(va => va.id === i)
    if (recipeList[i].value !== 1) {
      labourList[labourList.findIndex((va, idx) => {
        return index < idx && va.building === d
      })].timestamp -= (Date.now() - labourList[index].timestamp) / recipeList[i].value
    }
    recipeList[i].value -= 1
    jobObject['Untrained'] += 1
    labour++
    labourList.splice(labourList.findIndex(v => v.building === 'Untrained'), 1)
  })
  td.appendChild(minusButton)
  const valueSpan = document.createElement`span`
  valueSpan.id = `building-value-${i}`
  valueSpan.textContent = v
  td.appendChild(valueSpan)
  const plusButton = document.createElement`button`
  plusButton.id = `building-plus-${i}`
  plusButton.textContent = '+'
  plusButton.addEventListener('click', () => {
    jobObject['Untrained'] -= 1
    recipeList[i].value += 1
    labour--
    labourList.push({
      building: d,
      id: i,
      timestamp: 0,
    })
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
  let index = 0
  Object.keys(convertObject).forEach(k => {
    let innerCount = 0
    convertObject[k].forEach((_v, i) => {
      building.appendChild(createBuildingTableColumn(k, recipeList[i].value, index, innerCount))
      index++
      innerCount++
    })
  })
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
    img.src = imagePathObject[terrainProductObject[d]]
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
const createLabourTableColumn = () => {
  const table = document.createElement`table`
  labourPanel.appendChild(table)
  const tr = document.createElement`tr`
  table.appendChild(tr)
  const name = document.createElement`td`
  name.textContent = 'Labour'
  tr.appendChild(name)
  const td = document.createElement`td`
  td.id = 'labour'
  td.textContent = labour
  tr.appendChild(td)
}
const updateLabourTable = () => {
  document.getElementById('labour').textContent = labour
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
    img.src = imagePathObject[k]
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
  recipeList.forEach((v, i) => {
    document.getElementById(`building-value-${i}`).textContent = v.value
  })
  Object.entries(jobObject).forEach(([k, v]) => {
    document.getElementById(k).textContent = v
  })
  document.getElementById(`money`).textContent = money
  jobNameList.forEach(v => {
    if (v === 'Untrained') {
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
    if (jobObject['Untrained'] <= workerList.reduce((acc, cur) => {
      if (cur.post === 'Untrained' && cur.state === 'return') return ++acc
      else return acc
    }, 0)) {
      document.getElementById(`plus-${v}`).disabled = true
    } else document.getElementById(`plus-${v}`).disabled = false
  })
  updateLabourTable()
  recipeList.forEach((v, i) => {
    if (v.value <= 0) {
      document.getElementById(`building-minus-${i}`).disabled = true
    } else document.getElementById(`building-minus-${i}`).disabled = false
    if (0 < labour && Object.entries(recipeList[i].in).some(([k, v]) => {
      return v <= commoditiesObject[k]})
    ) {
      document.getElementById(`building-plus-${i}`).disabled = false
    } else document.getElementById(`building-plus-${i}`).disabled = true
    const progress = document.getElementById(`building-progress-${i}`)
    if (v.value <= 0) progress.value = 0
    else {
      const job = labourList[labourList.findIndex(v => v.id === i)].building
      progress.value = labourList.reduce((acc, cur) => {
        if (cur.id === i && cur.timestamp !== 0) return acc + Date.now() - cur.timestamp
        else return acc
      }, 0) / labourList.reduce((acc, cur) => {
        if (cur.building === job) return ++acc
        else return acc
      }, 0) * Math.log2(1 + labourList.reduce((acc, cur) => {
        if (cur.building === job) return ++acc
        else return acc
      }, 0))
    }
  })
  workerList.forEach(v => personalViewUpdate(v))
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
        terrainListObject[canvas.id][v.location] === undefined || v.post === 'Untrained')
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
        if (v.post === 'Farmer') {
          n = terrainListObject[canvas.id].findIndex((va, ind) => {
            return v.location < ind && (va === 'Farm' || va === 'Orchard')
          })
        } else if (v.post === 'Rancher') {
          n = terrainListObject[canvas.id].findIndex((va, ind) => {
            return v.location < ind && (va === 'Open Range' || va === 'Fertile Hills')
          })
        } else if (v.post === 'Forester') {
          n = terrainListObject[canvas.id].findIndex((va, ind) => {
            return v.location < ind && (va === 'Forest')
          })
        } else if (v.post === 'Miner') {
          n = terrainListObject[canvas.id].findIndex((va, ind) => {
            return v.location < ind && (va === 'Iron Mines' || va === 'Coal Mines')
          })
        } else if (v.post === 'Driller') {
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
    if (
      k.timestamp === 0 &&
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
    if (k.fullness <= 0) { // death judgment
      if (jobNameList.some(v => v === k.post)) jobObject[k.post]--
      else if (Object.keys(convertObject).some(v => v === k.post)) recipeList[k.location].value--
      document.getElementById(`tr-${k.id}`).remove()
      workerList.splice(i, 1)
    }
  })
  { // building function
    labourList.forEach(k => {
      if (Object.keys(convertObject).some(ky => k.building === ky)) { // building function
        if (Object.entries(recipeList[k.id].in).every(([ky, vl]) => {
          return vl <= commoditiesObject[ky]
        })) {
          if (recipeList[k.id].timestamp === 0) recipeList[k.id].timestamp = Date.now()
          if (k.timestamp === 0) k.timestamp = Date.now()
          if (
            buildingWorkTime <= labourList.reduce((acc, cur) => {
              if (cur.building === k.building && cur.id === k.id && cur.timestamp !== 0) {
                return acc + Date.now() - cur.timestamp
              } else return acc
            }, 0) / labourList.reduce((acc, cur) => {
              if (cur.building === k.building) return ++acc
              else return acc
            }, 0) * Math.log2(1 + labourList.reduce((acc, cur) => {
              if (cur.building === k.building) return ++acc
              else return acc
            }, 0))
          ) { // task completed
            Object.entries(recipeList[k.id].in).forEach(([ky, vl]) => {
              commoditiesObject[ky] -= vl
            })
            Object.entries(recipeList[k.id].out).forEach(([ky, vl]) => {
              commoditiesObject[ky] += vl
            })
            // k.timestamp = 0
            labourList.forEach(ky => {
              if (k.id === ky.id) ky.timestamp = 0
            })
            recipeList[k.id].timestamp = 0
            const number = recipeList[k.id].value
            const rate = 10
            for (let i = 0; i < number; i++) {
              const w = workerList.filter(v => v.post === 'Untrained').reduce((acu, cur) => {
                return acu.fullness < cur.fullness ? cur : acu
              })
              w.fullness -= Math.floor(rate / number)
            }
          }
        } else {
          recipeList[k.id].timestamp = 0
          k.timestamp = 0
        }
      }
    })
  }
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
const debugBonusInit = () => {
  money += 1e4
  commoditiesObject['Paper'] += 12
  const untrained = 5
  const trained = 0
  const expert = 0
  jobNameList.forEach(v => {
    jobObject[v] = v === 'Untrained' ? untrained :
    'Trained' ? trained :
    'Expert' ? expert: 0
  })
  for (let i = 0; i < untrained; i++) {
    workerList.push(createWorkerFirst())
    labour++
  }
}
debugBonusInit()
const stream = async () => {
  await imageLoad(resourcesImageObject, resourcesImageDOMList)
  await imageLoad(materialsImageObject, materialsImageDOMList)
  await imageLoad(goodsImageObject, goodsImageDOMList)
  await imageLoad(commonImageObject, commonImageDOMList)
  appendResourcesTable()
  appendMaterialsTable()
  appendGoodsTable()
  appendTerrainTable()
  appendJobTable()
  pushCanvas()
  createLabourTableColumn()
  appendBuildingTable()
  appendTradeTable()
  appendPersonalTable()
  decreaseTime = Date.now()
  tradeTimestamp = Date.now()
  main()
}
stream()
}