!(_ = () => {'use strict'

const canvas = document.getElementById`idle`
const context = canvas.getContext`2d`
const imagePathList = [
  '../../images/Unitychan/BasicActions/Unitychan_Idle_1.png', // 0
  '../../images/Unitychan/BasicActions/Unitychan_Idle_2.png',
  '../../images/Unitychan/BasicActions/Unitychan_Idle_3.png',
  '../../images/Unitychan/BasicActions/Unitychan_Idle_4.png',
  '../../images/Toko/Toko_Idle_1.png', // 4
  '../../images/Toko/Toko_Idle_2.png',
  '../../images/Toko/Toko_Idle_3.png',
  '../../images/Toko/Toko_Idle_4.png',
  '../../images/Holger/Holger_Idle_2.png', // 8
  '../../images/Holger/Holger_Idle_3.png',
  '../../images/Holger/Holger_Idle_4.png',
  '../../images/Holger/Holger_Idle_5.png',
  '../../images/Cindy/Cindy_Idle_1.png', // 12
  '../../images/Cindy/Cindy_Idle_3.png',
  '../../images/Cindy/Cindy_Idle_1.png',
  '../../images/Cindy/Cindy_Idle_2.png',
  '../../images/Yuko/Yuko_Idle_2.png', // 16
  '../../images/Yuko/Yuko_Idle_3.png',
  '../../images/Yuko/Yuko_Idle_4.png',
  '../../images/Yuko/Yuko_Idle_1.png',
  '../../images/Marie/Marie_Idle_2.png', // 20
  '../../images/Marie/Marie_Idle_3.png',
  '../../images/Marie/Marie_Idle_4.png',
  '../../images/Marie/Marie_Idle_1.png',
  '../../images/Misaki/Misaki_Idle_2.png', // 24
  '../../images/Misaki/Misaki_Idle_3.png',
  '../../images/Misaki/Misaki_Idle_4.png',
  '../../images/Misaki/Misaki_Idle_1.png',
  '../../images/Yuji/Yuji_Idle_1.png', // 28
  '../../images/Yuji/Yuji_Idle_2.png',
  '../../images/Yuji/Yuji_Idle_3.png',
  '../../images/Yuji/Yuji_Idle_4.png',
  '../../images/Jack/Jack_Idle_2.png', // 32
  '../../images/Jack/Jack_Idle_3.png',
  '../../images/Jack/Jack_Idle_4.png',
  '../../images/Jack/Jack_Idle_1.png',
  '../../images/Mariabell/Mariabell_Idle_2.png', // 36
  '../../images/Mariabell/Mariabell_Idle_3.png',
  '../../images/Mariabell/Mariabell_Idle_4.png',
  '../../images/Mariabell/Mariabell_Idle_1.png'
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