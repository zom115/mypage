{'use strict'
let intervalTime = 1e4
const fullnessMax = 90
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
  'Rail':      'SLのアイコン',
}
const entityObject = {}
Object.keys(resourcesImageObject).forEach(v => entityObject[v] = 0)
Object.keys(materialsImageObject).forEach(v => entityObject[v] = 0)
Object.keys(goodsImageObject).forEach(v => entityObject[v] = 0)
const labourObject = {
  'Untrained': 1,
  'Trained': 2,
  'Expert': 4,
}
const unitList = [
  'Prospector',
  'Engineer',
  'Farmer',
  'Rancher',
  'Forester',
  'Miner',
  'Driller',
  'Railyard',
]
const commonList = [
  'Money',
  'Labour',
]
Object.keys(labourObject).forEach(v => entityObject[v] = 0)
unitList.forEach(v => entityObject[v] = 0)
commonList.forEach(v => entityObject[v] = 0)
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
const resourcesImageDOMObject = {}
const materialsImageDOMObject = {}
const goodsImageDOMObject = {}
const commonImageDOMObject = {}
const imageLoad = async (obj, imageObject) => {
  return new Promise(async resolve => {
    await Promise.all(Object.entries(obj).map(async ([name, path]) => {
      return new Promise(async res => {
        const imgPreload = new Image()
        imgPreload.src = path
        imgPreload.alt = name
        imgPreload.addEventListener('load', async e => {
          imageObject[name] = e.path[0]
          res()
        })
      })
    }))
    resolve()
  })
}
const display = document.getElementById`display`
display.className = 'grid-container'
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
  display.appendChild(resourcesTable)
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
  display.appendChild(materialsTable)
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
  display.appendChild(goodsTable)
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
  moneyValue.id = 'Money'
  moneyValue.className = 'value'
  moneyValue.textContent = entityObject['Money']
  moneyTr.appendChild(moneyValue)
}
const jobObject = {
  'Untrained': {
    product: {'Labour': 1,},
    requirement: {
      'Canned Food': 5,
      'Clothing': 5,
      'Furniture': 5,
    },
  }, 'Trained': {
    product: {'Labour': 2,},
    requirement: {
      'Untrained': 1,
      'Paper': 5,
      'Money': 100,
    },
  }, 'Expert': {
    product: {'Labour': 4,},
    requirement: {
      'Trained': 1,
      'Paper': 10,
      'Money': 1000,
    },
  }, 'Prospector': {
    product: {
      'Iron': 1,
      'Coal': 1,
      'Gold': 1,
      'Gems': 1,
      'Oil': 1,
    },
    requirement: {
      'Expert': 1,
      'Paper': 10,
      'Money': 500,
    },
  }, 'Engineer': {
    product: {'Rail': 1,},
    requirement: {
      'Expert': 1,
      'Paper': 10,
      'Money': 2000,
    },
  }, 'Farmer': {
    product: {
      'Grain': 1,
      'Fruit': 1,
    },
    requirement: {
      'Expert': 1,
      'Paper': 10,
      'Money': 1000,
    },
  }, 'Rancher': {
    product: {
      'Livestock': 1,
      'Wool': 1,
    },
    requirement: {
      'Expert': 1,
      'Paper': 10,
      'Money': 1000,
    },
  }, 'Forester': {
    product: {'Timber': 1,},
    requirement: {
      'Expert': 1,
      'Paper': 10,
      'Money': 1000,
    },
  }, 'Miner': {
    product: {
      'Iron': 1,
      'Coal': 1,
    },
    requirement: {
      'Expert': 1,
      'Paper': 10,
      'Money': 1500,
    },
  }, 'Driller': {
    product: {'Oil': 1,},
    requirement: {
      'Expert': 1,
      'Paper': 10,
      'Money': 1500,
    },
  }, 'Railyard': {
    product: {'Rail': 1,},
    requirement: {
      'Steel': 5,
      'Lumber': 5,
    },
  },
}
Object.keys(jobObject).forEach(v => {
  jobObject[v].value = 0
  jobObject[v].timestamp = 0
  jobObject[v].max = intervalTime * 5
})
const workerList = []
const labourList = []
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
const worker = document.createElement`table`
worker.className = 'wide-column'
const createWorkerTableColumn = (d, v) => {
  const tr = document.createElement`tr`
  const itemTd = document.createElement`td`
  itemTd.className = 'nowrap'
  tr.appendChild(itemTd)
  if (Object.keys(labourObject).some(v => v === d)) {
    const img = new Image()
    img.src = imagePathObject[d]
    itemTd.appendChild(img)
    const span = document.createElement`span`
    span.textContent = d
    itemTd.appendChild(span)
  } else itemTd.textContent = d
  const productTd = document.createElement`td`
  tr.appendChild(productTd)
  Object.entries(jobObject[d].product).forEach(([k, v]) => {
    const img = new Image()
    img.src = imagePathObject[k]
    productTd.appendChild(img)
    if (1 < v) {
      const span = document.createElement`span`
      span.textContent = `*${v}`
      productTd.appendChild(span)
    }
  })
  const requirementTd = document.createElement`td`
  Object.entries(jobObject[d].requirement).forEach(([k, v]) => {
    const img = new Image()
    img.src = imagePathObject[k]
    requirementTd.appendChild(img)
    if (1 < v) {
      const span = document.createElement`span`
      span.textContent = `*${v}`
      requirementTd.appendChild(span)
    }
  })
  tr.appendChild(requirementTd)
  const progressTd = document.createElement`td`
  progressTd.className = 'nowrap'
  tr.appendChild(progressTd)
  const progressValue = document.createElement`span`
  progressValue.id = `job-progress-value-${d}`
  progressValue.textContent = jobObject[d].value
  progressTd.appendChild(progressValue)
  const progress = document.createElement`progress`
  progress.id = `job-progress-${d}`
  progress.max = intervalTime * 5
  progress.value = 0
  progressTd.appendChild(progress)
  const td = document.createElement`td`
  td.classList.add('nowrap', 'value')
  const minusButton = document.createElement`button`
  minusButton.id = `minus-${d}`
  minusButton.textContent = '-'
  minusButton.addEventListener('click', () => {
    entityObject[d]--
    entityObject['Expert']++
    workerList[workerList.findIndex(va => va.post === d)].post = 'Expert'
    entityObject['Labour'] += 4
  })
  if (Object.keys(labourObject).every(v => v !== d)) td.appendChild(minusButton)
  const valuSpan = document.createElement`span`
  valuSpan.id = d
  valuSpan.textContent = v
  td.appendChild(valuSpan)
  const plusButton = document.createElement`button`
  plusButton.id = `plus-${d}`
  plusButton.textContent = '+'
  plusButton.addEventListener('click', () => {
    jobObject[d].value++
    if (jobObject[d].timestamp === 0) jobObject[d].timestamp = Date.now()
    Object.entries(jobObject[d].requirement).forEach(([k, v]) => {
      entityObject[k] -= v
    })
  })
  td.appendChild(plusButton)
  tr.appendChild(td)
  return tr
}
const appendJobTable = () => {
  display.appendChild(worker)
  const tr = document.createElement`tr`
  worker.appendChild(tr)
  const name = document.createElement`th`
  name.textContent = 'Job'
  tr.appendChild(name)
  const product = document.createElement`th`
  product.textContent = 'Products'
  tr.appendChild(product)
  const requirement = document.createElement`th`
  requirement.textContent = 'Requirements'
  tr.appendChild(requirement)
  const progress = document.createElement`th`
  progress.textContent = 'Progress'
  tr.appendChild(progress)
  const value = document.createElement`th`
  value.textContent = 'Value'
  tr.appendChild(value)
  Object.entries(entityObject).filter(([k, _v]) => {
    return Object.keys(jobObject).some(vl => k === vl)
  }).forEach(([k, v]) => worker.appendChild(createWorkerTableColumn(k, v)))
}
const buildingObject = {
  'Canteen': [{
    in: {
      'Grain': 14,
      'Livestock': 7,
      'Fruit': 8,
    },
    out: {'Cuisine': 500},
    expand: {
      'Lumber': 5,
      'Steel': 5,
    },
  },], 'Food Production': [{
    in: {
      'Grain': 2,
      'Livestock': 1,
      'Fruit': 1,
    }, out: {'Canned Food': 2},
    expand: {
      'Lumber': 5,
      'Steel': 5,
    },
  },], 'Textile Mill': [{
    in: {'Wool': 2},
    out: {'Fabric': 1},
    expand: {
      'Lumber': 10,
      'Steel': 10,
    },
  },], 'Clothing Factory': [{
    in: {'Fabric': 2},
    out: {'Clothing': 1},
    expand: {
      'Lumber': 5,
      'Steel': 5,
    },
  },], 'Lumber Mill': [{
    in: {'Timber': 2},
    out: {'Lumber': 1},
    expand: {
      'Lumber': 10,
      'Steel': 10,
    },
  }, {
    in: {'Timber': 2},
    out: {'Paper': 1},
  },], 'Furniture Factory': [{
    in: {'Lumber': 2},
    out: {'Furniture': 1},
    expand: {
      'Lumber': 5,
      'Steel': 5,
    },
  },], 'Steel Mill': [{
    in: {
      'Coal': 1,
      'Iron': 1,
    }, out: {'Steel': 1},
    expand: {
      'Lumber': 10,
      'Steel': 10,
    },
  },], 'Metalworks': [{
    in: {'Steel': 2},
    out: {'Hardware': 1},
    expand: {
      'Lumber': 5,
      'Steel': 5,
    },
  }, {
    in: {'Steel': 2},
    out: {'Armaments': 1},
  },], 'Refinery': [{
    in: {'Oil': 2},
    out: {'Fuel': 1},
    expand: {
      'Lumber': 10,
      'Steel': 10,
    },
  },],
}
const builtList = [
  'Canteen',
  'Food Production',
]
Object.keys(buildingObject).forEach(v => {
  buildingObject[v].level = builtList.some(vl => v === vl) ? 1 : 0
  buildingObject[v].timestamp = 0
})
const recipeList = Object.values(buildingObject).flat()
recipeList.forEach((v, i) => {
  v.id = i
  v.value = 0
  v.timestamp = 0
})
const building = document.createElement`table`
building.className = 'max-wide-column'
const rewriteExpandButton = (name, element) => {
  element.textContent = null
  Object.entries(buildingObject[name][0].expand).forEach(([ky, vl]) => {
    const img = new Image()
    img.src = imagePathObject[ky]
    element.appendChild(img)
    const amount = vl * (1 + buildingObject[name].level)
    if (1 < amount) {
      const span = document.createElement`span`
      span.textContent = `*${amount}`
      element.appendChild(span)
    }
  })
}
const createBuildingTableColumn = (k, v, i, iC) => {
  const tr = document.createElement`tr`
  const item = document.createElement`td`
  item.className = 'nowrap'
  if (iC === 0) item.textContent = k
  tr.appendChild(item)
  const level = document.createElement`td`
  level.id = `building-level-${k}`
  level.className = 'value'
  if (iC === 0) level.textContent = buildingObject[k].level
  tr.appendChild(level)
  const upgradeTd = document.createElement`td`
  upgradeTd.className = 'nowrap'
  tr.appendChild(upgradeTd)
  if (iC === 0) {
    const upgradeButton = document.createElement`button`
    upgradeButton.id = `building-upgrade-${k}`
    upgradeTd.appendChild(upgradeButton)
    rewriteExpandButton(k, upgradeButton)
    upgradeButton.addEventListener('click', () => {
      buildingObject[k].timestamp = Date.now()
    })
  }
  const leftSide = document.createElement`td`
  leftSide.classList.add('value', 'nowrap')
  tr.appendChild(leftSide)
  const rightSide = document.createElement`td`
  rightSide.className = 'nowrap'
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
  progress.max = Math.floor(intervalTime * .9)
  progress.value = 0
  progressTd.appendChild(progress)
  const td = document.createElement`td`
  td.classList.add('value', 'wide-column')
  tr.appendChild(td)
  const minusButton = document.createElement`button`
  minusButton.id = `building-minus-${i}`
  minusButton.textContent = '-'
  minusButton.addEventListener('click', () => {
    const index = labourList.findIndex(va => va.id === i)
    if (recipeList[i].value !== 1) {
      labourList[labourList.findIndex((va, idx) => {
        return index < idx && va.building === k
      })].timestamp -= (Date.now() - labourList[index].timestamp) / recipeList[i].value
    }
    recipeList[i].value -= 1
    entityObject['Labour']++
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
    recipeList[i].value += 1
    entityObject['Labour']--
    labourList.push({
      building: k,
      id: i,
      timestamp: 0,
    })
  })
  td.appendChild(plusButton)
  return tr
}
const appendBuildingTable = () => {
  display.appendChild(building)
  const tr = document.createElement`tr`
  building.appendChild(tr)
  const buildingTh = document.createElement`th`
  buildingTh.textContent = 'Building'
  tr.appendChild(buildingTh)
  const level = document.createElement`th`
  level.textContent = 'Level'
  tr.appendChild(level)
  const upgrade = document.createElement`th`
  upgrade.textContent = 'Upgrade'
  tr.appendChild(upgrade)
  const product = document.createElement`th`
  product.textContent = 'Products'
  tr.appendChild(product)
  const dummy = document.createElement`th`
  tr.appendChild(dummy)
  const progress = document.createElement`th`
  progress.textContent = 'Progress'
  tr.appendChild(progress)
  const value = document.createElement`th`
  value.textContent = 'Value'
  tr.appendChild(value)
  let index = 0
  Object.keys(buildingObject).forEach(k => {
    let innerCount = 0
    buildingObject[k].forEach((_v, i) => {
      building.appendChild(createBuildingTableColumn(k, recipeList[i].value, index, innerCount))
      index++
      innerCount++
    })
  })
}
const terrainList = ['Town']
const terrainProductObject = {
  'Farm': ['Grain'],
  'Open Range': ['Livestock'],
  'Orchard': ['Fruit'],
  'Fertile Hills': ['Wool'],
  'Forest': ['Timber'],
  'Mountains': ['Iron', 'Coal', 'Gold', 'Gems', 'Oil'],
  'Desert': ['Oil', 'Gold', 'Gems'],
}
let canvasSerector = '0'
const terrainListObject = {[canvasSerector]: [{terrain: terrainList[0]}]}
const appendTerrainTable = () => {
  const terrainTable = document.createElement`table`
  display.appendChild(terrainTable)
  const tr = document.createElement`tr`
  terrainTable.appendChild(tr)
  const th = document.createElement`th`
  th.textContent = 'Terrain'
  tr.appendChild(th)
  const product = document.createElement`th`
  product.textContent = 'Products'
  tr.appendChild(product)
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
    terrainProductObject[d].forEach(v => {
      const img = new Image()
      img.src = imagePathObject[v]
      productTd.appendChild(img)
    })
    const addTd = document.createElement`td`
    addTd.className = 'value'
    tr.appendChild(addTd)
    const button = document.createElement`button`
    button.id = d
    button.textContent = '+'
    addTd.appendChild(button)
    button.addEventListener('click', () => terrainListObject[canvasSerector].push({terrain: d}))
  }
  Object.keys(terrainProductObject).forEach(v => createTableColumn(v))
}
const createLabourTableColumn = () => {
  const table = document.createElement`table`
  table.className = 'max-wide-column'
  display.appendChild(table)
  const tr = document.createElement`tr`
  table.appendChild(tr)
  const name = document.createElement`td`
  tr.appendChild(name)
  const img = new Image()
  img.src = imagePathObject['Labour']
  name.appendChild(img)
  const span = document.createElement`span`
  span.textContent = 'Labour'
  name.appendChild(span)
  const td = document.createElement`td`
  td.id = 'Labour'
  td.textContent = entityObject['Labour']
  tr.appendChild(td)
}
const updateLabourTable = () => {
  document.getElementById('Labour').textContent = entityObject['Labour']
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
  progress.max = fullnessMax
  progress.value = d.fullness
  fullness.appendChild(progress)
}
const personalViewUpdate = d => {
  document.getElementById(`post-${d.id}`).textContent = d.post
  document.getElementById(`progress-${d.id}`).value = d.fullness
}
const appendPersonalTable = () => {
  display.appendChild(personalTable)
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
  'Wool':        100 / 5,
  'Timber':      100 / 5,
  'Iron':        100 / 5,
  'Coal':        100 / 5,
  'Gold':        200 / 5,
  'Gems':        500 / 5,
  'Oil':         100 / 5,
  'Fabric':      300 / 5,
  'Paper':       300 / 5,
  'Lumber':      300 / 5,
  'Steel':       300 / 5,
  'Fuel':        300 / 5,
  'Canned Food': 100 / 5,
  'Clothing':    900 / 5,
  'Furniture':   900 / 5,
  'Hardware':    900 / 5,
  'Armaments':   900 / 5,
}
const tradeBidObject = {}
Object.keys(tradeObject).forEach(v => tradeBidObject[v] = 0)
let payment = 0
let tradeTimestamp = 0
const tradeTable = document.createElement`table`
tradeTable.className = 'wide-column'
const appendTradeTable = () => {
  display.appendChild(tradeTable)
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
    available.textContent = entityObject[k]
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
        input.max = entityObject[k]
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
  Object.entries(entityObject).forEach(([k, v]) => {
    document.getElementById(k).textContent = v
  })
  recipeList.forEach((v, i) => {
    document.getElementById(`building-value-${i}`).textContent = v.value
  })
  Object.entries(jobObject).forEach(([k, v]) => { // job
    document.getElementById(`job-progress-value-${k}`).textContent = v.value
    const progress = document.getElementById(`job-progress-${k}`)
    progress.max = v.max
    progress.value = v.timestamp === 0 ? 0 : Date.now() - v.timestamp
    if (Object.entries(jobObject[k].requirement).every(([ky, vl]) => vl <= entityObject[ky]) && (
      Object.keys(labourObject).every(v => v !== k) ||
      labourObject[k] <= entityObject['Labour'])
    ) {
      document.getElementById(`plus-${k}`).disabled = false
    } else document.getElementById(`plus-${k}`).disabled = true
    if (Object.keys(labourObject).every(v => v !== k)) {
      if (entityObject[k] <= 0) {
        document.getElementById(`minus-${k}`).disabled = true
      } else document.getElementById(`minus-${k}`).disabled = false
    }
  })
  updateLabourTable()
  Object.entries(buildingObject).forEach(([ky, vl]) => {
    document.getElementById(`building-level-${ky}`).textContent = vl.level
    const button = document.getElementById(`building-upgrade-${ky}`)
    if (vl.timestamp === 0 && Object.entries(vl[0].expand).every(([k, v]) => {
      return v * (1 + vl.level) <= entityObject[k]
    })) button.disabled = false
    else button.disabled = true
    vl.forEach(v => {
      if (v.value <= 0) {
        document.getElementById(`building-minus-${v.id}`).disabled = true
      } else document.getElementById(`building-minus-${v.id}`).disabled = false
      if (0 < entityObject['Labour'] && Object.entries(recipeList[v.id].in).some(([k, v]) => {
        return v <= entityObject[k]}) && 0 < vl.level
      ) {
        document.getElementById(`building-plus-${v.id}`).disabled = false
      } else document.getElementById(`building-plus-${v.id}`).disabled = true
      const progress = document.getElementById(`building-progress-${v.id}`)
      if (v.value <= 0) progress.value = 0
      else {
        const job = labourList[labourList.findIndex(v => v.id === v.id)].building
        progress.value = labourList.reduce((acc, cur) => {
          if (cur.id === v.id && cur.timestamp !== 0) return acc + Date.now() - cur.timestamp
          else return acc
        }, 0) / labourList.reduce((acc, cur) => {
          if (cur.building === job) return ++acc
          else return acc
        }, 0) * Math.log2(1 + labourList.reduce((acc, cur) => {
          if (cur.building === job) return ++acc
          else return acc
        }, 0) * vl.level)
      }
    })
  })
  workerList.forEach(v => personalViewUpdate(v))
  Object.keys(tradeObject).forEach(v => {
    const order = document.getElementById(`trade-orders-${v}`).textContent
    const range = document.getElementById(`trade-range-${v}`)
    const available = document.getElementById(`trade-available-${v}`)
    const value = order === 'Offer' ? entityObject[v] : tradeBidObject[v]
    available.textContent = value
    range.max = value
    if (+range.value === 0) {
      document.getElementById(`trade-minus-${v}`).disabled = true
    } else document.getElementById(`trade-minus-${v}`).disabled = false
    document.getElementById(`trade-value-${v}`).textContent = range.value
    if (value === +range.value || (order === 'Bid' && entityObject['Money'] < payment + tradeObject[v])) {
      document.getElementById(`trade-plus-${v}`).disabled = true
    } else document.getElementById(`trade-plus-${v}`).disabled = false
  })
  document.getElementById('trade-interval').textContent = tradeTimestamp === 0 ? '00000' :
  ('00000' + (intervalTime - Date.now() + tradeTimestamp)).slice(-5)
}
const size = 16
let canvasId = 0
const pushCanvas = () => {
  const canvas = document.createElement`canvas`
  canvas.id = canvasId
  canvas.className = 'max-wide-column'
  canvas.width = size * 16 * 3
  canvas.height = size * 6
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
  canvas.addEventListener('mousedown', () => {
    if (canvas.offsetWidth - size * 3 < x && x < canvas.offsetWidth - size &&
      size < y && y < size * 3) {
      // pushCanvas()
    }
  })
  canvas.addEventListener('mouseup', () => {
    canvasSerector = canvas.id
    let value = ((x - size * 1.5) / (size * 6))
    value = .5 < value % 1 ? 0 : Math.floor(value)
    if (value !== 0 && value < terrainListObject[canvas.id].length) {
      terrainListObject[canvas.id].splice(value, 1)
    }
  })
  const moveTime = intervalTime * 3 / 10
  const workTime = intervalTime * 2 / 5
  const fn = () => {
    workerList.forEach((v, i) => {
      if (Object.keys(buildingObject).some(va => {return v.post === va})) return
      const locate = terrainListObject[canvas.id][v.location]
      if (v.timestamp === 0) { // set location
        let n
        if (v.post === 'Prospector') {
          n = terrainListObject[canvas.id].findIndex((va, ind) => {
            return v.location < ind && (
              va.terrain === 'Mountains' || va.terrain === 'Desert') && (
              va.progress === undefined || va.progress < 1
            )
          })
        } else if (v.post === 'Engineer') {
          n = terrainListObject[canvas.id].findIndex((va, ind) => {
            return v.location < ind && (
              va.rail === undefined || va.rail < 1) &&
            0 < jobObject['Railyard'].value
          })
        } else if (v.post === 'Farmer') {
          n = terrainListObject[canvas.id].findIndex((va, ind) => {
            return v.location < ind && (
              va.terrain === 'Farm' || va.terrain === 'Orchard')
          })
        } else if (v.post === 'Rancher') {
          n = terrainListObject[canvas.id].findIndex((va, ind) => {
            return v.location < ind && (
              va.terrain === 'Open Range' || va.terrain === 'Fertile Hills')
          })
        } else if (v.post === 'Forester') {
          n = terrainListObject[canvas.id].findIndex((va, ind) => {
            return v.location < ind && (va.terrain === 'Forest')
          })
        } else if (v.post === 'Miner') {
          n = terrainListObject[canvas.id].findIndex((va, ind) => {
            return v.location < ind && (va.terrain === 'Mountains')
          })
        } else if (v.post === 'Driller') {
          n = terrainListObject[canvas.id].findIndex((va, ind) => {
            return v.location < ind && (va.terrain === 'Desert')
          })
        }
        if (n === undefined || n === -1) {
          workerList[i].location = 0
          workerList[i].timestamp = 0
        } else {
          workerList[i].location = n
          workerList[i].timestamp = Date.now()
        }
      } else if (Date.now() - v.timestamp < moveTime + workTime && locate === undefined) {
        v.state = 'return'
        if (Date.now() - v.timestamp < moveTime * v.location) {
          v.timestamp -= workTime + (moveTime * v.location - Date.now() + v.timestamp) * 2
        } else v.timestamp -= moveTime * v.location + workTime - Date.now() + v.timestamp
      } else if (
        v.post === 'Engineer' && v.state !== 'return'
      ) {
        if (0 < jobObject['Railyard'].value) {
          const layingIndex = terrainListObject[canvas.id].findIndex(vl => {
            return terrainList.some(val => val !== vl.terrain) && (
              vl.rail === undefined || vl.rail < 1)
          })
          console.log(layingIndex)
          if (layingIndex === -1) return // temporary
          const layingLocate = terrainListObject[canvas.id][layingIndex]
          if (layingLocate.rail === undefined) layingLocate.rail = 0
          const elapsedTime = Date.now() - v.timestamp
          const progress = moveTime * (layingIndex - 1) < elapsedTime ?
          (elapsedTime - moveTime * (layingIndex - 1)) / (moveTime + workTime) : 0
          layingLocate.rail = progress
          if (1 <= layingLocate.rail) {
            layingLocate.rail = 1
            jobObject['Railyard'].value--
            jobObject['Railyard'].timestamp = 0
            workerList.filter(v => v.post === 'Engineer').forEach(v => {
              v.state = 'return'})
          }
        }
      } else if (
        v.timestamp !== 0 &&
        v.timestamp + moveTime * v.location * 2 + workTime < Date.now()
      ) {
        if (v.state !== 'return') {
          const resource = terrainProductObject[locate.terrain]
          if (1 < resource.length) { // get resources
            if (v.post === 'Prospector') {
              const rateObject = locate.terrain === 'Mountains' ? {
                'Iron': 4,
                'Coal': 4,
                'Gold': 1,
                'Gems': .25,
                'Oil': .5,
              } : {
                'Oil': 4,
                'Gold': .5,
                'Gems': .25,
              }
              resource.forEach(vl => {
                if (locate[vl] === undefined) locate[vl] = 0
                locate[vl] += Math.round(rateObject[vl] * (1.5 - Math.random()))
              })
              if (locate.progress === undefined) locate.progress = 0
              locate.progress += .25 - .15 * Math.random()
            }
          } else if (resource.length === 1) {
            entityObject[resource[0]]++
          }
          v.fullness -= v.location
        } else v.state = null
        v.timestamp = 0
      }
    })
  }
  const draw = () => {
    context.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
    context.save()
    context.fillStyle = 'gray'
    context.fillRect(0, size * 4, canvas.offsetWidth, 1)
    terrainListObject[canvas.id].forEach((v, i) => {
      context.font = size * 1.5 + i * size * 6 <= x && x <= size * 4.5 + i * size * 6 ?
      `bold ${size}px sans-serif` : `normal ${size}px sans-serif`
      context.textAlign = 'center'
      context.fillStyle = 'black'
      context.fillText(v.terrain, size * 3 + i * size * 6, size)
      context.font = `normal ${size}px sans-serif`
      context.fillStyle = 'gray'
      context.fillRect(size * 1.5 + i * size * 6, size, size * 3, size * 3)
      context.fillStyle = 'black'
      const rail = v.rail === undefined ? 0 : 1 < v.rail ? 1 : v.rail
      context.fillRect(-size * 3 + i * size * 6, size * 4, size * 6 * rail, size / 8)
      const progress = v.progress === undefined ? 0 : 1 < v.progress ? 1 : v.progress
      context.fillRect(size * 1.5 + i * size * 6, size, 1, size * 3 * progress)
      context.textAlign = 'left'
      Object.entries(v).filter(([ky, _vl]) => {
        return Object.keys(entityObject).some(key => key === ky)}
      ).forEach(([ky, vl], idx) => {
        context.drawImage(
          resourcesImageDOMObject[ky], size * 4.5 + i * size * 6, size + size * idx)
        context.fillText(`*${vl}`, size * 5.5 + i * size * 6, size * 2 + size * idx)
      })
    })
    context.fillStyle = 'black'
    if (canvasSerector === canvas.id) {
      context.fillRect(0, 0, size / 2, size / 2)
    }
    workerList.forEach(v => {
      if (v.timestamp === 0 || Object.keys(buildingObject).some(vl => vl === v.post) ||
        v.state === 'eat') return
      context.fillStyle = 'cyan'
      const elapsedTime = Date.now() - v.timestamp
      // const progress = moveTime * (layingIndex - 1) < elapsedTime ?
      //   (elapsedTime - moveTime * (layingIndex - 1)) / (moveTime + workTime) : 0
      const rate = v.post === 'Engineer' &&
        moveTime * (v.location - 1) < elapsedTime &&
        elapsedTime < moveTime * v.location + workTime ?
        v.location - 1 + (elapsedTime - moveTime * (v.location - 1)) / (moveTime + workTime) :
        elapsedTime < moveTime * v.location ?
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
  const hungerInterval = Math.floor(intervalTime * .1)
  const eatInterval = intervalTime / 50
  if (hungerInterval <= Date.now() - decreaseTime) {
    workerList.forEach(v => v.fullness--)
    decreaseTime += hungerInterval
  }
  workerList.forEach((k, i) => {
    if (
      k.timestamp === 0 &&
      k.fullness < fullnessMax &&
      0 < entityObject['Cuisine']
    ) {
      k.state = 'eat'
      k.timestamp = Date.now()
    }
    if (k.state === 'eat') {
      if (Date.now() - k.timestamp <= eatInterval) return
      if (k.fullness < fullnessMax && 0 < entityObject['Cuisine']) {
        entityObject['Cuisine']--
        k.fullness++
        k.timestamp += eatInterval
        return
      } else {
        k.state = null
        k.timestamp = 0
      }
    }
    if (k.fullness <= 0) { // death judgment
      if (Object.keys(jobObject).some(v => v === k.post)) entityObject[k.post]--
      else if (Object.keys(buildingObject).some(v => v === k.post)) recipeList[k.location].value--
      document.getElementById(`tr-${k.id}`).remove()
      workerList.splice(i, 1)
    }
  })
  { // job function
    Object.entries(jobObject).forEach(([k, v]) => {
      if (k === 'Railyard') return
      const population = Object.entries(entityObject).filter(([ky, _vl]) => {
        return Object.keys(labourObject).some(key => ky === key)
      }).reduce((acu, [_ck, cv]) => acu + cv, 0)
      const possible = Object.entries(v.requirement).reduce((acu, [ck, cv]) => {
        const divide = entityObject[ck] / cv
        return divide < acu ? divide : acu
      }, Infinity)
      v.max = k === 'Untrained' && 0 < population ? intervalTime * 5 / Math.ceil(population / 4) :
      possible !== 0 ? intervalTime * 5 / possible : intervalTime * 5
      if (0 < v.value && v.timestamp + v.max <= Date.now()) {
        if (k === 'Untrained') {
          entityObject['Labour']++
          pushPersonalTable(workerList[workerList.length - 1])
        } else {
          let worker
          if (k === 'Trained') {
            entityObject['Labour']++
            worker = workerList[workerList.findIndex(va => va.post === 'Untrained')]
          } else if (k === 'Expert') {
            entityObject['Labour'] += 2
            worker = workerList[workerList.findIndex(va => va.post === 'Trained')]
          } else {
            entityObject['Labour'] -= 4
            worker = workerList[workerList.findIndex(va => va.post === 'Expert')]
          }
          worker.location = 0
          worker.post = k
          worker.timestamp = 0
        }
        entityObject[k]++
        v.value--
        v.timestamp = 0 < v.value ? Date.now() : 0
      }
    })
  }
  { // building function
    Object.entries(buildingObject).forEach(([k, v]) => {
      if (v.timestamp !==0 && v.timestamp + Math.floor(intervalTime * .9) <= Date.now()) {
        Object.entries(v[0].expand).forEach(([ky, vl]) => {
          entityObject[ky] -= vl * (1 + v.level)
        })
        v.level++
        v.timestamp = 0
        rewriteExpandButton(k, document.getElementById(`building-upgrade-${k}`))
      }
    })
    labourList.forEach(k => {
      if (Object.keys(buildingObject).some(ky => k.building === ky)) {
        if (Object.entries(recipeList[k.id].in).every(([ky, vl]) => {
          return vl <= entityObject[ky]
        })) {
          if (recipeList[k.id].timestamp === 0) recipeList[k.id].timestamp = Date.now()
          if (k.timestamp === 0) k.timestamp = Date.now()
          if (
            Math.floor(intervalTime * .9) <= labourList.reduce((acc, cur) => {
              if (cur.building === k.building && cur.id === k.id && cur.timestamp !== 0) {
                return acc + Date.now() - cur.timestamp
              } else return acc
            }, 0) / labourList.reduce((acc, cur) => {
              if (cur.building === k.building) return ++acc
              else return acc
            }, 0) * Math.log2(1 + labourList.reduce((acc, cur) => {
              if (cur.building === k.building) return ++acc
              else return acc
            }, 0) * buildingObject[k.building].level)
          ) { // task completed
            Object.entries(recipeList[k.id].in).forEach(([ky, vl]) => {
              entityObject[ky] -= vl
            })
            Object.entries(recipeList[k.id].out).forEach(([ky, vl]) => {
              entityObject[ky] += vl
            })
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
      if (intervalTime <= Date.now() - tradeTimestamp) {
        if (order === 'Offer' && 0 < +range.value) {
          const number = Math.round(Math.random() * range.value)
          range.value -= number
          entityObject[k] -= number
          range.max = entityObject[k]
          entityObject['Money'] += v * number
        } else if (0 < +range.value) { // bid
          entityObject['Money'] -= v * range.value
          entityObject[k] += +range.value
          tradeBidObject[k] -= +range.value
          range.max = tradeBidObject[k]
          range.value = 0
        }
        const number = Math.floor((Math.random() - .5) * 8) // temporary
        tradeBidObject[k] + number < 0 ? 0 : tradeBidObject[k] += number
      }
    })
    if (intervalTime <= Date.now() - tradeTimestamp) tradeTimestamp = Date.now()
  }
  elementUpdate()
  window.requestAnimationFrame(main)
}
const debugBonusInit = () => {
  intervalTime = 1e4
  entityObject['Money'] += 1e4
  entityObject['Paper'] += 8 * 5
  entityObject['Lumber'] += 24 * 5
  entityObject['Steel'] += 19 * 5
  entityObject['Cuisine'] += 1e3
  entityObject['Canned Food'] += 20 * 5
  entityObject['Clothing'] += 5 * 5
  entityObject['Furniture'] += 5 * 5
  entityObject['Untrained'] += 4
  entityObject['Trained'] += 2
  entityObject['Expert'] += 1
  entityObject['Prospector'] += 1
  entityObject['Engineer'] += 1
  Object.entries(labourObject).forEach(([k, v]) => {
    for (let i = 0; i < entityObject[k]; i++) {
      workerList.push(createWorkerFirst(k))
      entityObject['Labour'] += v
    }
  })
  unitList.forEach(v => {
    for (let i = 0; i < entityObject[v]; i++) {
      workerList.push(createWorkerFirst(v))
    }
  })
}
debugBonusInit()
const stream = async () => {
  await imageLoad(resourcesImageObject, resourcesImageDOMObject)
  await imageLoad(materialsImageObject, materialsImageDOMObject)
  await imageLoad(goodsImageObject, goodsImageDOMObject)
  await imageLoad(commonImageObject, commonImageDOMObject)
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