!(_ = () => {'use strict'

const canvas = document.getElementById`walk`
const context = canvas.getContext`2d`
const imagePathList = [
  'img/Unitychan/BasicActions/Unitychan_walk_1.png',
  'img/Unitychan/BasicActions/Unitychan_walk_2.png',
  'img/Unitychan/BasicActions/Unitychan_walk_3.png',
  'img/Unitychan/BasicActions/Unitychan_walk_4.png',
  'img/Unitychan/BasicActions/Unitychan_walk_5.png',
  'img/Unitychan/BasicActions/Unitychan_walk_6.png',
  'img/Toko/Toko_walk_1.png',
  'img/Toko/Toko_walk_2.png',
  'img/Toko/Toko_walk_3.png',
  'img/Toko/Toko_walk_4.png',
  'img/Toko/Toko_walk_5.png',
  'img/Toko/Toko_walk_6.png',
  'img/Holger/Holger_walk_1.png',
  'img/Holger/Holger_walk_2.png',
  'img/Holger/Holger_walk_3.png',
  'img/Holger/Holger_walk_4.png',
  'img/Holger/Holger_walk_5.png',
  'img/Holger/Holger_walk_6.png',
  'img/Cindy/Cindy_walk_1.png',
  'img/Cindy/Cindy_walk_2.png',
  'img/Cindy/Cindy_walk_3.png',
  'img/Cindy/Cindy_walk_4.png',
  'img/Cindy/Cindy_walk_5.png',
  'img/Cindy/Cindy_walk_6.png',
  'img/Yuko/Yuko_walk_6.png',
  'img/Yuko/Yuko_walk_1.png',
  'img/Yuko/Yuko_walk_2.png',
  'img/Yuko/Yuko_walk_3.png',
  'img/Yuko/Yuko_walk_4.png',
  'img/Yuko/Yuko_walk_5.png',
  'img/Marie/Marie_walk_1.png',
  'img/Marie/Marie_walk_2.png',
  'img/Marie/Marie_walk_3.png',
  'img/Marie/Marie_walk_4.png',
  'img/Marie/Marie_walk_5.png',
  'img/Marie/Marie_walk_6.png',
  'img/Misaki/Misaki_walk_1.png',
  'img/Misaki/Misaki_walk_2.png',
  'img/Misaki/Misaki_walk_3.png',
  'img/Misaki/Misaki_walk_4.png',
  'img/Misaki/Misaki_walk_5.png',
  'img/Misaki/Misaki_walk_6.png',
  'img/Yuji/Yuji_walk_9.png',
  'img/Yuji/Yuji_walk_1.png',
  'img/Yuji/Yuji_walk_2.png',
  'img/Yuji/Yuji_walk_3.png',
  'img/Yuji/Yuji_walk_7.png',
  'img/Yuji/Yuji_walk_8.png',
  'img/Jack/Jack_walk_3.png',
  'img/Jack/Jack_walk_4.png',
  'img/Jack/Jack_walk_5.png',
  'img/Jack/Jack_walk_6.png',
  'img/Jack/Jack_walk_1.png',
  'img/Jack/Jack_walk_2.png',
  'img/Mariabell/Mariabell_walk_4.png',
  'img/Mariabell/Mariabell_walk_5.png',
  'img/Mariabell/Mariabell_walk_6.png',
  'img/Mariabell/Mariabell_walk_1.png',
  'img/Mariabell/Mariabell_walk_2.png',
  'img/Mariabell/Mariabell_walk_3.png',
]
let imgList = []
let imgMap = []
imagePathList.forEach(path => {
  const img = new Image()
  img.src = path
  img.addEventListener('load', () => {
    imgList.push(path)
    imgMap[path] = img
  })
})
const timerId = setInterval(() => { // loading monitoring
  if (imgList.length === imagePathList.length) { // untrustworthy length in assosiative
    clearInterval(timerId)
    main()
  }
}, 100)
const main = () => {
  let nowTime = Date.now()
  let ss = ('0' + ~~(nowTime % 6e4 / 1e3)).slice(-2)
  let ms = ('0' + ~~(nowTime % 1e3)).slice(-3)
  let id = ((ss % 3) * 1e3 + ms * 1) / 500|0
  const amount = 6
  context.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
  imagePathList.forEach((path, index) => {
    if (index % amount === id) {
      context.drawImage(imgMap[path], ~~(index / amount) * 48, 0)
    }
  })
  window.requestAnimationFrame(main)
}

})()