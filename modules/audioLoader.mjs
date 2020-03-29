const audioLoader = (name, directory) => {
  return new Promise(resolve => {
    const audio = new Audio()
    audio.src = directory
    audio.addEventListener('canplaythrough', () => resolve({[name]: audio}))
  })
}
export {audioLoader}