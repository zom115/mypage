const imageLoader = (name, directory) => {
  return new Promise(resolve => {
    const image = new Image()
    image.src = directory
    image.addEventListener('load', () => resolve({[name]: image}))
  })
}
export {imageLoader}