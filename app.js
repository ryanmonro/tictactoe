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
// DOM 
//
var winnerMessage = document.querySelector(".winner");
var instructionsMessage = document.querySelector(".instructions");

// an array of divs for the game board
var getDomSquares = function(){
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
  console.log(player);
  if (player === "X") {
    drawX(square, callback);
  } else if (player === "O") {
    drawO(square, callback);
  } else if (player === null) {
    resetSquare(square);
  }
  
}

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

  animate(150, width, lineWidthChange, function(distance1, distance2){
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineWidth = lineWidthInitial + distance2;
    ctx.lineTo(padding + distance1, padding + distance1);  
    ctx.stroke();
  }, 
    function(){
      ctx.lineWidth = lineWidthInitial;
      animate(150, width, lineWidthChange, function(distance1, distance2){
        ctx.beginPath();
        ctx.moveTo(padding + width, padding);
        ctx.lineTo(padding + width - distance1, padding + distance1);  
        ctx.lineWidth = lineWidthInitial + distance2;
        ctx.stroke();
      }, callback);
    } 
  );

  
  
}

var drawO = function(square, callback){
  var canvas = square.firstChild;
  var ctx = canvas.getContext("2d");
  var start = Math.PI / -2;
  animate(300, -2 * Math.PI, 0, function(arcChange, distance2){
    ctx.beginPath();
    var center = canvas.width / 2;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.arc(center, center, 50, start, start + arcChange, true);
    ctx.stroke();
  }, callback);
}

// animate a canvas drawing (fn) over time, then perform afterfn
var animate = function(ms, totalDistance1, totalDistance2, fn, afterfn){
  var frameRate = 60;
  var waitTime = 1000 / frameRate;
  var frames = Math.ceil(ms / waitTime);
  var frame = 1;

  var animation = setInterval(function(){
    fn(frame * totalDistance1 / frames, frame * totalDistance2 / frames);
    if (frame === frames) {
      clearInterval(animation);
      if (afterfn) afterfn();
    }
    frame++;
  }, waitTime);
}

var easeOutQuad = function (t, b, c, d) {
  t /= d;
  return -c * t*(t-2) + b;
};


var resetSquare = function(square){
  var canvas = square.firstChild;
  var ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

//
// program flow starts here
//
newGame();

// todo:
// animate should take array of distances, then you can use however many the function needs
// curves for ease-out?
// hidpi
// draw the board