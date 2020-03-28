const mapLoader = () => {
  return new Promise(resolve => {
    const requestDirectory = 'resources/main.json'
    const request = new XMLHttpRequest()
    request.open('GET', requestDirectory)
    request.responseType = 'json'
    request.send()
    request.onload = () => {
      resolve(request.response)
    }
  })
}
export {mapLoader}