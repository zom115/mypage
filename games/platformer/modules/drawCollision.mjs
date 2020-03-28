// 表示したいときはあっちのdraw()を切るという雑module
const context = canvas.getContext`2d`
const size = 16
const testObject = {
  data: [],
  height: 1,
  width: 16,
}
const drawCollision = terrainObject => {
  Object.keys(terrainObject).forEach((v, i) => {
    if (i % 8 === 1) {
      for (let index = 0; index < 8; index++) testObject.data.push('0')
      testObject.height += 1
    }
    if (i === 0) for (let index = 0; index < 16; index++) testObject.data.push('0')
    else testObject.data.push(v)
  })
  const draw = () => {
    window.requestAnimationFrame(draw)
    context.fillStyle = 'hsl(180, 100%, 50%)'
    for (let x = 0; x < testObject.width; x++) {
      for (let y = 0; y < testObject.height; y++) {
        const relativeCooldinates = {x: x * size, y: y * size}
        const n = +testObject.data[testObject.width * y + x]
        if (n === 0) continue
        context.beginPath()
        terrainObject[n].forEach((v, i) => {
          i === 0 ?
          context.moveTo(
            relativeCooldinates.x + v[0] * size, relativeCooldinates.y + v[1] * size) :
          context.lineTo(
            relativeCooldinates.x + v[0] * size, relativeCooldinates.y + v[1] * size)
          if (terrainObject[n].length === 2) {
          context.lineTo(
            relativeCooldinates.x + v[0] * size - 2, relativeCooldinates.y + v[1] * size + 2)
          }
        })
        context.fill()
      }
    }
  }
  draw()
}
export {drawCollision}