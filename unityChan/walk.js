!(_ = () => {'use strict'

const canvas = document.getElementById`walk`
const context = canvas.getContext`2d`
const imagePathList = [
  'img/Unitychan/BasicActions/Unitychan_Walk_1.png',
  'img/Unitychan/BasicActions/Unitychan_Walk_2.png',
  'img/Unitychan/BasicActions/Unitychan_Walk_3.png',
  'img/Unitychan/BasicActions/Unitychan_Walk_4.png',
  'img/Unitychan/BasicActions/Unitychan_Walk_5.png',
  'img/Unitychan/BasicActions/Unitychan_Walk_6.png',
  'img/Toko/Toko_Walk_1.png',
  'img/Toko/Toko_Walk_2.png',
  'img/Toko/Toko_Walk_3.png',
  'img/Toko/Toko_Walk_4.png',
  'img/Toko/Toko_Walk_5.png',
  'img/Toko/Toko_Walk_6.png',
  'img/Holger/Holger_Walk_1.png',
  'img/Holger/Holger_Walk_2.png',
  'img/Holger/Holger_Walk_3.png',
  'img/Holger/Holger_Walk_4.png',
  'img/Holger/Holger_Walk_5.png',
  'img/Holger/Holger_Walk_6.png',
  'img/Cindy/Cindy_Walk_1.png',
  'img/Cindy/Cindy_Walk_2.png',
  'img/Cindy/Cindy_Walk_3.png',
  'img/Cindy/Cindy_Walk_4.png',
  'img/Cindy/Cindy_Walk_5.png',
  'img/Cindy/Cindy_Walk_6.png',
  'img/Yuko/Yuko_Walk_6.png',
  'img/Yuko/Yuko_Walk_1.png',
  'img/Yuko/Yuko_Walk_2.png',
  'img/Yuko/Yuko_Walk_3.png',
  'img/Yuko/Yuko_Walk_4.png',
  'img/Yuko/Yuko_Walk_5.png',
  'img/Marie/Marie_Walk_1.png',
  'img/Marie/Marie_Walk_2.png',
  'img/Marie/Marie_Walk_3.png',
  'img/Marie/Marie_Walk_4.png',
  'img/Marie/Marie_Walk_5.png',
  'img/Marie/Marie_Walk_6.png',
  'img/Misaki/Misaki_Walk_1.png',
  'img/Misaki/Misaki_Walk_2.png',
  'img/Misaki/Misaki_Walk_3.png',
  'img/Misaki/Misaki_Walk_4.png',
  'img/Misaki/Misaki_Walk_5.png',
  'img/Misaki/Misaki_Walk_6.png',
  'img/Yuji/Yuji_Walk_9.png',
  'img/Yuji/Yuji_Walk_1.png',
  'img/Yuji/Yuji_Walk_2.png',
  'img/Yuji/Yuji_Walk_3.png',
  'img/Yuji/Yuji_Walk_7.png',
  'img/Yuji/Yuji_Walk_8.png',
  'img/Jack/Jack_Walk_3.png',
  'img/Jack/Jack_Walk_4.png',
  'img/Jack/Jack_Walk_5.png',
  'img/Jack/Jack_Walk_6.png',
  'img/Jack/Jack_Walk_1.png',
  'img/Jack/Jack_Walk_2.png',
  'img/Mariabell/Mariabell_Walk_4.png',
  'img/Mariabell/Mariabell_Walk_5.png',
  'img/Mariabell/Mariabell_Walk_6.png',
  'img/Mariabell/Mariabell_Walk_1.png',
  'img/Mariabell/Mariabell_Walk_2.png',
  'img/Mariabell/Mariabell_Walk_3.png'
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