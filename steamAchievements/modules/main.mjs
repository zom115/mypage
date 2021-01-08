const div = document.getElementById`div`
div.textContent = 'a'
console.log('hello')
let key = '20689F67085593FF34262A093673DFEA'
key = `?key=${key}`
let steamid = '76561198271332918'
steamid = `&steamid=${steamid}`
let appid = '18700'
appid = `&appid=${appid}`
const base = 'http://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2'
// ?key=20689F67085593FF34262A093673DFEA&steamid=76561198271332918&appid=18700
const GUSFG = 'https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v2/'
let option = `${key}${steamid}${appid}`
let test = new URL(option, GUSFG)
console.log(test)

let httpRequest = new XMLHttpRequest()
if (!httpRequest) {
  alert('なんか失敗したっぽい。XMLHTTP インスタンスが作れなかったって。')
}
const alertContents = () => {  
  if (httpRequest.readyState === XMLHttpRequest.DONE) {
    if (httpRequest.status === 200) alert(httpRequest.responseText)
    else alert('リクエストに問題が発生したよ。')
  }
}
httpRequest.onreadystatechange = alertContents
httpRequest.open('GET', `${GUSFG}${option}`)
httpRequest.send()
