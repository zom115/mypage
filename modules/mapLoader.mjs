const mapLoader = (name, directory) => {
  return new Promise(resolve => {
    const requestDirectory = directory
    const request = new XMLHttpRequest()
    request.open('GET', requestDirectory)
    request.responseType = 'json'
    request.send()
    request.onload = () => resolve({[name]: request.response})
  })
}
export {mapLoader}