!(_ = () => {'use strict'

const canvas = document.getElementById`positive`
const context = canvas.getContext`2d`
const imagePathList = [
  '../../assets/img/Unitychan/ExtraActions/Unitychan_Positive_1.png',
  '../../assets/img/Unitychan/ExtraActions/Unitychan_Positive_2.png',
  '../../assets/img/Unitychan/ExtraActions/Unitychan_Positive_3.png',
  '../../assets/img/Unitychan/ExtraActions/Unitychan_Positive_4.png',
  '../../assets/img/Unitychan/ExtraActions/Unitychan_Positive_5.png',
  '../../assets/img/Unitychan/ExtraActions/Unitychan_Positive_6.png',
  '../../assets/img/Toko/Toko_Positive_1.png',
  '../../assets/img/Toko/Toko_Positive_2.png',
  '../../assets/img/Toko/Toko_Positive_1.png',
  '../../assets/img/Toko/Toko_Positive_2.png',
  '../../assets/img/Toko/Toko_Positive_1.png',
  '../../assets/img/Toko/Toko_Positive_2.png',
  '../../assets/img/Holger/Holger_Positive_1.png',
  '../../assets/img/Holger/Holger_Positive_2.png',
  '../../assets/img/Holger/Holger_Positive_1.png',
  '../../assets/img/Holger/Holger_Positive_2.png',
  '../../assets/img/Holger/Holger_Positive_1.png',
  '../../assets/img/Holger/Holger_Positive_2.png',
  '../../assets/img/Cindy/Cindy_Positive_1.png',
  '../../assets/img/Cindy/Cindy_Positive_2.png',
  '../../assets/img/Cindy/Cindy_Positive_3.png',
  '../../assets/img/Cindy/Cindy_Positive_1.png',
  '../../assets/img/Cindy/Cindy_Positive_2.png',
  '../../assets/img/Cindy/Cindy_Positive_3.png',
  '../../assets/img/Yuko/Yuko_Positive_1.png',
  '../../assets/img/Yuko/Yuko_Positive_2.png',
  '../../assets/img/Yuko/Yuko_Positive_1.png',
  '../../assets/img/Yuko/Yuko_Positive_2.png',
  '../../assets/img/Yuko/Yuko_Positive_1.png',
  '../../assets/img/Yuko/Yuko_Positive_2.png',
  '../../assets/img/Marie/Marie_Positive_1.png',
  '../../assets/img/Marie/Marie_Positive_2.png',
  '../../assets/img/Marie/Marie_Positive_3.png',
  '../../assets/img/Marie/Marie_Positive_1.png',
  '../../assets/img/Marie/Marie_Positive_2.png',
  '../../assets/img/Marie/Marie_Positive_3.png',
  '../../assets/img/Misaki/Misaki_Positive_1.png',
  '../../assets/img/Misaki/Misaki_Positive_2.png',
  '../../assets/img/Misaki/Misaki_Positive_3.png',
  '../../assets/img/Misaki/Misaki_Positive_1.png',
  '../../assets/img/Misaki/Misaki_Positive_2.png',
  '../../assets/img/Misaki/Misaki_Positive_3.png',
  '../../assets/img/Yuji/Yuji_Positive_1.png',
  '../../assets/img/Yuji/Yuji_Positive_2.png',
  '../../assets/img/Yuji/Yuji_Positive_1.png',
  '../../assets/img/Yuji/Yuji_Positive_2.png',
  '../../assets/img/Yuji/Yuji_Positive_1.png',
  '../../assets/img/Yuji/Yuji_Positive_2.png',
  '../../assets/img/Jack/Jack_Positive_1.png',
  '../../assets/img/Jack/Jack_Positive_2.png',
  '../../assets/img/Jack/Jack_Positive_3.png',
  '../../assets/img/Jack/Jack_Positive_1.png',
  '../../assets/img/Jack/Jack_Positive_2.png',
  '../../assets/img/Jack/Jack_Positive_3.png',
  '../../assets/img/Mariabell/Mariabell_Positive_1.png',
  '../../assets/img/Mariabell/Mariabell_Positive_2.png',
  '../../assets/img/Mariabell/Mariabell_Positive_1.png',
  '../../assets/img/Mariabell/Mariabell_Positive_2.png',
  '../../assets/img/Mariabell/Mariabell_Positive_1.png',
  '../../assets/img/Mariabell/Mariabell_Positive_2.png'
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
  const amount = 6
  context.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
  imagePathList.forEach((path, index) => {
    if (index % amount === ss % amount) {
      context.drawImage(imgMap[path], ~~(index / amount) * 48, 0)
    }
  })
  window.requestAnimationFrame(main)
}

})()