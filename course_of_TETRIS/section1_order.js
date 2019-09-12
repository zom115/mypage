var canvas = document.getElementById(("myCanvas"));
var context = canvas.getContext("2d");
var currentTetrimino = [];
var nextNumber = 3;

function makeArray(num){
  var candidate = [];
  for(var i = 0; i < num; i++){
    candidate.push(i)
  }
  return candidate;
}

function shuffle(arr){
  for (var i = arr.length - 1; i > 0; i--){
    var r = Math.floor(Math.random() * (i + 1));
    var tmp = arr[i];
    arr[i] = arr[r];
    arr[r] = tmp;
  }
  return arr;
}
// クリックするたびにツモる
function onDown(e) {
  if (currentTetrimino.length < nextNumber) {
    Array.prototype.push.apply(currentTetrimino, shuffle(makeArray(7)))
  };
  console.log("length:" + currentTetrimino.length);
  console.log(currentTetrimino);
  console.log("extract: " + currentTetrimino[0]);
  currentTetrimino.shift();
}
canvas.addEventListener('mousedown', onDown, false);