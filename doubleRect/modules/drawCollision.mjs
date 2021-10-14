// 表示したいときはあっちのdraw()を切るという雑module
const drawCollision = terrainObject => {
  const context = canvas.getContext`2d`
  const size = 16
  const leftMargin = 1
  let topMargin = 1
  const indent = 12
  context.fillStyle = 'hsl(180, 100%, 50%)'
  context.strokeStyle = 'hsl(180, 100%, 50%)'
  context.lineWidth = 1
  const draw = () => {
    context.fillRect(0, 0, size, size)
    Object.values(terrainObject).forEach((v, i) => {
      if (v.length === 1) return
      const blank = i === 0 ? 0 : 11
      const relativeCooldinates = {
        x: ((i + blank) % indent + leftMargin) * size,
        y: (((i + blank) / indent|0) + topMargin) * size,
        // x: leftMargin * size + i % indent * size,
        // y: topMargin * size + ((i-1) / indent|0) * size,
      }
      const m = {x: 0, y: 0}
      if (v.length === 2) {
        m.x = v[0] === 0 ? 1 : v[0] === 1 ? -1 : 0
        m.y = v[1] === 0 ? 1 : v[1] === 1 ? -1 : 0
      }
      context.beginPath()
      v.forEach((vl, ix) => {
        ix === 0 ?
        context.moveTo(
          relativeCooldinates.x + vl[0] * size + m.x, relativeCooldinates.y + vl[1] * size + m.y) :
        context.lineTo(
          relativeCooldinates.x + vl[0] * size + m.x, relativeCooldinates.y + vl[1] * size + m.y)
        if (v.length === 2) {
          context.closePath()
          context.stroke()
        } else context.fill()
      })
    })
  }
  draw()
}
export {drawCollision}