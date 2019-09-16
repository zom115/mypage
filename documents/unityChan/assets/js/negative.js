!(_ = () => {'use strict'

const canvas = document.getElementById`negative`
const context = canvas.getContext`2d`
const imagePathList = [
  '../../assets/img/Unitychan/ExtraActions/Unitychan_Negative_1.png',
  '../../assets/img/Unitychan/ExtraActions/Unitychan_Negative_2.png',
  '../../assets/img/Unitychan/ExtraActions/Unitychan_Negative_3.png',
  '../../assets/img/Unitychan/ExtraActions/Unitychan_Negative_4.png',
  '../../assets/img/Unitychan/ExtraActions/Unitychan_Negative_5.png',
  '../../assets/img/Toko/Toko_Idle_1.png',
  '../../assets/img/Toko/Toko_Negative_1.png',
  '../../assets/img/Toko/Toko_Negative_2.png',
  '../../assets/img/Toko/Toko_Negative_3.png',
  '../../assets/img/Toko/Toko_Negative_4.png',
  '../../assets/img/Holger/Holger_Idle_2.png',
  '../../assets/img/Holger/Holger_Negative_1.png',
  '../../assets/img/Holger/Holger_Negative_2.png',
  '../../assets/img/Holger/Holger_Negative_1.png',
  '../../assets/img/Holger/Holger_Negative_2.png',
  '../../assets/img/Cindy/Cindy_Idle_1.png',
  '../../assets/img/Cindy/Cindy_Negative_1.png',
  '../../assets/img/Cindy/Cindy_Negative_2.png',
  '../../assets/img/Cindy/Cindy_Negative_3.png',
  '../../assets/img/Cindy/Cindy_Negative_4.png',
  '../../assets/img/Yuko/Yuko_Idle_1.png',
  '../../assets/img/Yuko/Yuko_Negative_1.png',
  '../../assets/img/Yuko/Yuko_Negative_3.png',
  '../../assets/img/Yuko/Yuko_Negative_2.png',
  '../../assets/img/Yuko/Yuko_Negative_3.png',
  '../../assets/img/Marie/Marie_Idle_1.png',
  '../../assets/img/Marie/Marie_Negative_1.png',
  '../../assets/img/Marie/Marie_Negative_2.png',
  '../../assets/img/Marie/Marie_Negative_3.png',
  '../../assets/img/Marie/Marie_Negative_4.png',
  '../../assets/img/Misaki/Misaki_Idle_1.png',
  '../../assets/img/Misaki/Misaki_Negative_1.png',
  '../../assets/img/Misaki/Misaki_Negative_2.png',
  '../../assets/img/Misaki/Misaki_Negative_3.png',
  '../../assets/img/Misaki/Misaki_Negative_4.png',
  '../../assets/img/Yuji/Yuji_Idle_1.png',
  '../../assets/img/Yuji/Yuji_Negative_1.png',
  '../../assets/img/Yuji/Yuji_Negative_2.png',
  '../../assets/img/Yuji/Yuji_Negative_1.png',
  '../../assets/img/Yuji/Yuji_Negative_2.png',
  '../../assets/img/Jack/Jack_Idle_2.png',
  '../../assets/img/Jack/Jack_Negative_1.png',
  '../../assets/img/Jack/Jack_Negative_2.png',
  '../../assets/img/Jack/Jack_Negative_3.png',
  '../../assets/img/Jack/Jack_Negative_4.png',
  '../../assets/img/Mariabell/Mariabell_Idle_1.png',
  '../../assets/img/Mariabell/Mariabell_Negative_1.png',
  '../../assets/img/Mariabell/Mariabell_Negative_2.png',
  '../../assets/img/Mariabell/Mariabell_Negative_3.png',
  '../../assets/img/Mariabell/Mariabell_Negative_4.png'
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
  const amount = 5
  context.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
  imagePathList.forEach((path, index) => {
    if (index % amount === ss % amount) {
      context.drawImage(imgMap[path], ~~(index / amount) * 48, 0)
    }
  })
  window.requestAnimationFrame(main)
}

})()