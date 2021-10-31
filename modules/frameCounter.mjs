/*
  In:: Array
  Usage::
    Array.length - 1:: Frame Per Second
*/

const frameCounter = array => {
  const now = Date.now()
  array.push(now)
  let flag = true
  do {
    if (array[0] + 1e3 < now) array.shift()
    else flag = false
  } while (flag)
}
export {frameCounter}