const mapLoader = () => {
  return new Promise(resolve => {
    const requestDirectory = 'untitled.json'
    const request = new XMLHttpRequest()
    request.open('GET', requestDirectory)
    request.responseType = 'json'
    request.send()
    request.onload = () => {
      resolve(request.response)
    }
  })
  // const getJSON = () => {

    // request.onreadystatechange = () => {
    //   if (request.readyState === 4 &&)
    // }
  // }
  // const input = document.createElement`input`
  // input.type = 'file'
  // input.addEventListener('change', e => {
  //   const result = e.target.files[0]
  //   const reader = new FileReader()
  //   reader.readAsText(result)
  //   reader.addEventListener('load', () => {
  //     const title = result.name.match(/(.*)\.json$/)[1]
  //     originalData = JOS.parse(reader.result)
  //     const json = '{"result":true, "count":42}'
  //     const obj = JSON.parse(json)
  //     console.log(obj.count)
  //     console.log(obj.result)
  //     return obj
  //   })
  // })
  // input.click()
}
export {mapLoader}