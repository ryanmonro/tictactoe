//
// Game model
//
var game = {
  board: [],
  scores: [0, 0],
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
      game.scores[game.currentPlayer]++;
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

var clearBoard = function(canvas){
  ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

var drawBoard = function(canvas){
  ctx = canvas.getContext("2d");
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  //ctx.strokeStyle = 'rgba(128,128,128, 0.1)';
  lineSound.play();
  animate(400, 0, 450, function(length){
    ctx.beginPath();
    ctx.moveTo(150, 0);
    ctx.lineTo(150, length);
    ctx.stroke();
  }, function(){
    lineSound2.play();
    animate(400, 0, 450, function(length){
    ctx.beginPath();
    ctx.moveTo(300, 0);
    ctx.lineTo(300, length);
    ctx.stroke();
  }, function(){
    lineSound.play();
    animate(400, 0, 450, function(length){
    ctx.beginPath();
    ctx.moveTo(0, 150);
    ctx.lineTo(length, 150);
    ctx.stroke();
  }, function(){
    lineSound2.play();
    animate(400, 0, 450, function(length){
    ctx.beginPath();
    ctx.moveTo(0, 300);
    ctx.lineTo(length, 300);
    ctx.stroke();
  }, null, easeOutExpo)
  }, easeOutExpo)
  }, easeOutExpo)}, easeOutExpo);
}

// run fn 60 times per second, changing its parameter over time with curveFn, then perform afterfn
var animate = function(ms, start, goal, fn, afterFn, curveFn){
  var frameRate = 60;
  var waitTime = 1000 / frameRate;
  var frames = Math.ceil(ms / waitTime);
  var frame = 1;

  var animation = setInterval(function(){
    fn(curveFn(frame, start, goal, frames));
    if (frame === frames) {
      clearInterval(animation);
      if (afterFn) afterFn();
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
var xSound = new Audio("sound/x.ogg");
var oSound = new Audio("sound/o.ogg");
// two identical sounds because it was having trouble replaying them fast enough
var lineSound = new Audio("sound/line200ms.ogg");
var lineSound2 = new Audio("sound/line200ms.ogg");
var winSound = new Audio("sound/tada.mp3");
var drawSound = new Audio("sound/draw.ogg");
var applauseSound = new Audio("sound/applause.mp3");

//
// DOM 
//
var names = ["Player O", "Player X"];
var winningScore = 5;
var tournamentOver = false;
var scoreboard = document.querySelector(".winner");
var instructionsMessage = document.querySelector(".instructions");
var boardSketch = document.querySelector("#board-sketch");

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
  renderPlayer(x, y, checkGameStatus);
}

var checkGameStatus = function(){
  if (game.winner) {
    highlightWinner();
    if (game.scores[game.currentPlayer] >= winningScore) {
      applauseSound.play();
      tournamentOver = true;
      scoreboard.textContent = names[game.currentPlayer] + " wins!";
      instructionsMessage.textContent = "Click on board to start a new game.";
    } else {
      winSound.play();
      showScores();
      instructionsMessage.textContent = "Click on board to continue.";
    }
  }
  else if (game.over) {
    drawSound.play();
    scoreboard.textContent = "Draw!";
    instructionsMessage.textContent = "Click on board to start a new game.";
  }
  else {
    showPlayerInstructions();
  }
}

var handleClick = function(event){
  // if game is finished, clicking resets the game
  if (game.over){
    if (tournamentOver) {
      tournamentOver = false;
      game.scores[0] = 0;
      game.scores[1] = 0;
    }
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
      renderPlayer(x, y);
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
  clearBoard(boardSketch);
  drawBoard(boardSketch);
  updateBoard();
  showScores();
  showPlayerInstructions();
}

var showPlayerInstructions = function(){
  instructionsMessage.innerHTML = "<span class='player-name' contenteditable>" + names[game.currentPlayer] + "</span>, click  on a square to place your " + game.player();
  var playerNameEntry = instructionsMessage.querySelector("span");
  playerNameEntry.addEventListener("input", function(){
    names[game.currentPlayer] = playerNameEntry.textContent;
    showScores();
  });
  
}

var showScores = function(){
  scoreboard.textContent = 
    names[0] + ": " + game.scores[0] + ", " + 
    names[1] + ": " + game.scores[1];
}

var renderPlayer = function(x, y, callback){
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
// victory - first to 5
