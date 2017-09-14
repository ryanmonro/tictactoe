//
// Game model
//
var game = {
  board: [],
  players: ["O", "X"],
  currentPlayer: 0,
  size: 3,
  moves: 0,
  over: false,
  winner: null,
  player: function(){
    return game.players[game.currentPlayer];
  },
  newGame: function(){
    // clear board
    game.board = [];
    for (var y = 0; y < game.size; y++){
      var row = [];
      for (var x = 0; x < game.size; x++){
        row.push({
          player: null, 
          win: false
        });
      }
      game.board.push(row);
    }
    game.over = false;
    game.winner = null;
    game.moves = 0;
    // choose random player to start
    game.currentPlayer = Math.floor(Math.random() * 2);
  },
  spaceAvailable: function(x, y){
    return game.board[y][x].player === null;
  },
  markSquare: function(x, y){
    if (game.over || !game.spaceAvailable(x, y)) {
      return;
    }
    game.board[y][x].player = game.players[game.currentPlayer];
    game.moves++;
    game.checkForWin(x, y); 
    // if game not over, switch players
    if (game.over === false){
      game.currentPlayer = Math.abs(game.currentPlayer - 1);
    }
  },
  checkForWin: function(x, y){
    game.checkTilesMatch(game.row(y));
    game.checkTilesMatch(game.column(x));
    if (game.tileInArray(x, y, game.diagonal1())) {
      game.checkTilesMatch(game.diagonal1());
    }
    if (game.tileInArray(x, y, game.diagonal2())) {
      game.checkTilesMatch(game.diagonal2());
    }
    if (game.moves === 9) {
      game.over = true;
    }
  },
  row: function(y){
    return game.board[y];
  },
  column: function(x){
    return game.board.map(function(row, index){
      return row[x];
    });
  },
  tileInArray: function(x, y, arr){
    return arr.includes(game.board[y][x]);
  },
  diagonal1: function(){
    return [game.board[0][0], game.board[1][1], game.board[2][2]];
  },
  diagonal2: function(){
    return [game.board[2][0], game.board[1][1], game.board[0][2]];
  },
  // return true if all tiles in given array are played by same player
  checkTilesMatch: function(arr){ 
    var firstElement = arr[0];
    var allTilesMatch = arr.every(function(el){
      return firstElement.player === el.player;
    });
    if (allTilesMatch){
      game.winner = firstElement.player;
      game.over = true;
      arr.forEach(function(tile){
        tile.win = true;
      });
      return true;
    }
    return false;
  }
};

//
// Animation
// 
var drawX = function(square, callback){
  var canvas = square.firstChild;
  var ctx = canvas.getContext("2d");
  var lineWidthInitial = 8;
  var lineWidthChange = 0;
  ctx.lineWidth = lineWidthInitial;
  ctx.lineCap = 'round';
  var padding = canvas.width / 2 - 50;
  var height = canvas.height - 2 * padding;
  var width = height;
  xSound.play();
  // draw L-R stroke in 150ms
  animate(150, 0, width, function(crossWidth){
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    // ctx.lineWidth = lineWidthInitial;
    ctx.lineTo(padding + crossWidth, padding + crossWidth);  
    ctx.stroke();
  }, 
    // wait 200ms before second stroke
    function(){
      setTimeout(function(){
        ctx.lineWidth = lineWidthInitial;
        animate(150, 0, width, function(crossWidth){
          ctx.beginPath();
          ctx.moveTo(padding + width, padding);
          ctx.lineTo(padding + width - crossWidth, padding + crossWidth);  
          // ctx.lineWidth = lineWidthInitial;
          ctx.stroke();
      }, callback, easeOutExpo)}, 200);
    }, easeOutExpo 
  );
}

var drawO = function(square, callback){
  var canvas = square.firstChild;
  var ctx = canvas.getContext("2d");
  var start = Math.PI / -2;
  oSound.play();
  animate(300, start, -2 * Math.PI, function(arcLength){
    ctx.beginPath();
    var center = canvas.width / 2;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.arc(center, center, 50, start, arcLength, true);
    ctx.stroke();
  }, callback, easeInOutExpo);
}

var drawBoard = function(canvas){
  ctx = canvas.getContext("2d");
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(128,128,128, 0.1)';
  animate(600, 0, 450, function(length){
    ctx.beginPath();
    ctx.moveTo(150, 0);
    ctx.lineTo(150, length);
    ctx.stroke();
  }, function(){
    animate(600, 0, 450, function(length){
    ctx.beginPath();
    ctx.moveTo(300, 0);
    ctx.lineTo(300, length);
    ctx.stroke();
  }, function(){
    animate(600, 0, 450, function(length){
    ctx.beginPath();
    ctx.moveTo(0, 150);
    ctx.lineTo(length, 150);
    ctx.stroke();
  }, function(){
    animate(600, 0, 450, function(length){
    ctx.beginPath();
    ctx.moveTo(0, 300);
    ctx.lineTo(length, 300);
    ctx.stroke();
  }, null, easeOutExpo)
  }, easeOutExpo)
  }, easeOutExpo)}, easeOutExpo);
}

// animate a canvas drawing (fn) over time, then perform afterfn
var animate = function(ms, start, goal, fn, afterfn, curveFn){
  var frameRate = 60;
  var waitTime = 1000 / frameRate;
  var frames = Math.ceil(ms / waitTime);
  var frame = 1;

  var animation = setInterval(function(){
    fn(curveFn(frame, start, goal, frames));
    if (frame === frames) {
      clearInterval(animation);
      if (afterfn) afterfn();
    }
    frame++;
  }, waitTime);
}

// Ease In/Out Equations from http://gizma.com/easing/
// t: frame, b:start, c: goal, d: frames
var linearTween = function (t, b, c, d) {
  return c*t/d + b;
};

var easeOutExpo = function (t, b, c, d) {
  return c * ( -Math.pow( 2, -10 * t/d ) + 1 ) + b;
};

var easeInOutExpo = function (t, b, c, d) {
  t /= d/2;
  if (t < 1) return c/2 * Math.pow( 2, 10 * (t - 1) ) + b;
  t--;
  return c/2 * ( -Math.pow( 2, -10 * t) + 2 ) + b;
};

var resetSquare = function(square){
  var canvas = square.firstChild;
  var ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

//
// Audio
//
var xSound = new Audio("x.ogg");
var oSound = new Audio("o.ogg");
var winSound = new Audio("tada.mp3");

//
// DOM 
//
var winnerMessage = document.querySelector(".winner");
var instructionsMessage = document.querySelector(".instructions");
var boardSketch = document.querySelector("#board-sketch");

drawBoard(boardSketch);
// an array of divs for the game board
var getDomSquares = function(){
  // var boardCanvas = document.querySelector('#board');
  var squares = document.querySelectorAll(".square");
  var sq = 0;
  var board = [];
  for (var y = 0; y < game.size; y++){
    var row = [];
    for (var x = 0; x < game.size; x++){
      row.push(squares[sq++]);
    }
    board.push(row);
  };
  return board;
};

var board = getDomSquares();

var play = function(x, y){
  game.markSquare(x, y);  
  // check game status after we draw the player on the board
  drawPlayer(x, y, checkGameStatus);
  // checkGameStatus();
}

var checkGameStatus = function(){
  if (game.winner) {
    winSound.play();
    highlightWinner();
    winnerMessage.textContent = game.winner + " wins!";
    instructionsMessage.textContent = "Click on board to start a new game.";
  }
  else if (game.over) {
    winnerMessage.textContent = "Draw!";
    instructionsMessage.textContent = "Click on board to start a new game.";
  }
  else {
    instructionsMessage.textContent = "Player " + game.player() + ", click  on a square to make your move";
  }
}

var handleClick = function(event){
  // if game is finished, clicking resets the game
  if (game.over){
    newGame();
    // otherwise, make move in clicked square
  } else if (event.target.className === "square-canvas" ){
    var row = Number(event.target.dataset.row);
    var column = Number(event.target.dataset.column);
    play(column, row);
  }
};

var main = document.querySelector("main");
main.addEventListener('click', handleClick);

var highlightWinner = function(){
  for (var y = 0; y < 3; y++){
    for (var x = 0; x < 3; x++){
      setSquareHighlight(game.board[y][x], board[y][x]);
    }
  }
}

var updateBoard = function(){
  for (var y = 0; y < 3; y++){
    for (var x = 0; x < 3; x++){
      drawPlayer(x, y);
      setSquareHighlight(game.board[y][x], board[y][x]);
    }
  }
};

var setSquareHighlight = function(square, target){
  if (square.win) {
    target.classList.add('winning-square');
  } else {
    target.className = 'square';
  }
}

var newGame = function(){
  game.newGame();
  updateBoard();
  winnerMessage.textContent = "";
  instructionsMessage.textContent = "Player " + game.player() + ", click  on a square to make your move";
}

var drawPlayer = function(x, y, callback){
  var square = board[y][x];
  var player = game.board[y][x].player;
  if (player === "X") {
    drawX(square, callback);
  } else if (player === "O") {
    drawO(square, callback);
  } else if (player === null) {
    resetSquare(square);
  }
  
}

//
// program flow starts here
//
newGame();


// todo:
// animate should take array of distances, then you can use however many the function needs
// hidpi
// draw the board