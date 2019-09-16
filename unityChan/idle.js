!(_ = () => {'use strict'

const canvas = document.getElementById`idle`
const context = canvas.getContext`2d`
const imagePathList = [
  'img/Unitychan/BasicActions/Unitychan_Idle_1.png', // 0
  'img/Unitychan/BasicActions/Unitychan_Idle_2.png',
  'img/Unitychan/BasicActions/Unitychan_Idle_3.png',
  'img/Unitychan/BasicActions/Unitychan_Idle_4.png',
  'img/Toko/Toko_Idle_1.png', // 4
  'img/Toko/Toko_Idle_2.png',
  'img/Toko/Toko_Idle_3.png',
  'img/Toko/Toko_Idle_4.png',
  'img/Holger/Holger_Idle_2.png', // 8
  'img/Holger/Holger_Idle_3.png',
  'img/Holger/Holger_Idle_4.png',
  'img/Holger/Holger_Idle_5.png',
  'img/Cindy/Cindy_Idle_1.png', // 12
  'img/Cindy/Cindy_Idle_3.png',
  'img/Cindy/Cindy_Idle_1.png',
  'img/Cindy/Cindy_Idle_2.png',
  'img/Yuko/Yuko_Idle_2.png', // 16
  'img/Yuko/Yuko_Idle_3.png',
  'img/Yuko/Yuko_Idle_4.png',
  'img/Yuko/Yuko_Idle_1.png',
  'img/Marie/Marie_Idle_2.png', // 20
  'img/Marie/Marie_Idle_3.png',
  'img/Marie/Marie_Idle_4.png',
  'img/Marie/Marie_Idle_1.png',
  'img/Misaki/Misaki_Idle_2.png', // 24
  'img/Misaki/Misaki_Idle_3.png',
  'img/Misaki/Misaki_Idle_4.png',
  'img/Misaki/Misaki_Idle_1.png',
  'img/Yuji/Yuji_Idle_1.png', // 28
  'img/Yuji/Yuji_Idle_2.png',
  'img/Yuji/Yuji_Idle_3.png',
  'img/Yuji/Yuji_Idle_4.png',
  'img/Jack/Jack_Idle_2.png', // 32
  'img/Jack/Jack_Idle_3.png',
  'img/Jack/Jack_Idle_4.png',
  'img/Jack/Jack_Idle_1.png',
  'img/Mariabell/Mariabell_Idle_2.png', // 36
  'img/Mariabell/Mariabell_Idle_3.png',
  'img/Mariabell/Mariabell_Idle_4.png',
  'img/Mariabell/Mariabell_Idle_1.png'
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
  const amount = 4
  context.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
  imagePathList.forEach((path, index) => {
    if (index % amount === ss % amount) {
      context.drawImage(imgMap[path], ~~(index / amount) * 48, 0)
    }
  })
  window.requestAnimationFrame(main)
}

})()