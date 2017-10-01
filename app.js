//
// Game model
//
var game = {
  board: [],
  scores: [0, 0],
  players: ["O", "X"],
  currentPlayer: 0,
  lastPlay: [],
  hard: true,
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
    // game.currentPlayer = Math.floor(Math.random() * 2);
    game.currentPlayer = 0;
  },
  spaceAvailable: function(x, y){
    return game.board[y][x].player === null;
  },
  markSquare: function(x, y){
    if (game.over || !game.spaceAvailable(x, y)) {
      return false;
    }
    game.board[y][x].player = game.players[game.currentPlayer];
    game.lastPlay = [x, y];
    game.moves++;
    game.checkForWin(x, y); 
    // if game not over, switch players
    if (game.over === false){
      game.switchPlayers();
    }
    return true;
  },
  findAvailableMoves: function(){
    // will always return at least one possible move
    var coordChoices = [];
    // get all winnable directions on the board (rows, cols, diags)
    var all = game.allWinnableArrays();
    // check players in squares on each array
    for (var i = 0; i < all.length; i++){
      var arr = all[i];
      // tally how many of each player in this array
      var xCount = 0;
      var oCount = 0;
      var empties = []; // coords of empty squares in array
      for (var sqIndex = 0; sqIndex < arr.length; sqIndex++){
        sq = arr[sqIndex];
        if (game.board[sq.y][sq.x].player === "X") {
          xCount++;
        } else if (game.board[sq.y][sq.x].player === "O") {
          oCount++;
        } else {
          empties.push({x:sq.x, y:sq.y});
        }
      }
      // first: if CPU has two, play the third sq to win.
      // rank: 5
      if (xCount == 2 && oCount == 0){
        coordChoices.push({rank: 5, coords: empties[0]});
        // coords = empties[0];
        // break;
      }
      // if opponent has two, play third to block them
      // rank: 4
      else if (oCount == 2 && xCount == 0){
        coordChoices.push({rank: 4, coords: empties[0]});
        // coords = empties[0] ;
        // break;
      }
      // if CPU has one, play a second square
      else if (xCount == 1 && oCount == 0) {
        coordChoices.push({rank: 3, coords:empties[0]});
        coordChoices.push({rank: 3, coords:empties[1]});
      }
      // if opponent has one, play a square to block them
      else if (oCount == 1 && xCount == 0) {
        coordChoices.push({rank: 2, coords:empties[0]});
        coordChoices.push({rank: 2, coords:empties[1]});
      }
    }
    // play center first if available
    if (game.spaceAvailable(1, 1)){
      coordChoices.push({rank: 7, coords:{x: 1, y: 1}});
    }
    return coordChoices;
  },
  cpuMove: function(){
    var coordChoices = game.findAvailableMoves();
    // find best move in available choices
    var bestMove = coordChoices[0];
    coordChoices.forEach(function(choice){
      if (choice.rank > bestMove.rank) {
        bestMove = choice;
      }
    });
    game.markSquare(bestMove.coords.x, bestMove.coords.y);
  },
  switchPlayers: function(){
    game.currentPlayer = Math.abs(game.currentPlayer - 1);
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
  allWinnableArrays: function(){
    // return [game.row(0), game.row(1), game.row(2), 
    //   game.column(0), game.column(1), game.column(2),
    //   game.diagonal1(), game.diagonal2()];
    return [[{x:0,y:0},{x:1,y:0},{x:2,y:0}],
      [{x:0,y:1},{x:1,y:1},{x:2,y:1}],
      [{x:0,y:2},{x:1,y:2},{x:2,y:2}],
      [{x:0,y:0},{x:0,y:1},{x:0,y:2}],
      [{x:1,y:0},{x:1,y:1},{x:1,y:2}],
      [{x:2,y:0},{x:2,y:1},{x:2,y:2}],
      [{x:0,y:0},{x:1,y:1},{x:2,y:2}],
      [{x:2,y:0},{x:1,y:1},{x:0,y:2}]];
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
var squareSize = 150;

var drawX = function(canvas, x, y, callback){
  // var canvas = square.firstChild;
  var ctx = canvas.getContext("2d");
  var lineWidthInitial = 8;
  var lineWidthChange = 0;
  ctx.lineWidth = lineWidthInitial;
  ctx.lineCap = 'round';
  var padding = squareSize / 2 - 50;
  var height = squareSize - 2 * padding;
  var width = height;
  var xStart = x * 150;
  var yStart = y * 150;
  xSound.play();
  // draw L-R stroke in 150ms
  animate(150, 0, width, function(crossWidth){
    ctx.beginPath();
    ctx.moveTo(xStart + padding, yStart + padding);
    // ctx.lineWidth = lineWidthInitial;
    ctx.lineTo(xStart + padding + crossWidth, yStart + padding + crossWidth);  
    ctx.stroke();
  }, 
    // wait 200ms before second stroke
    function(){
      setTimeout(function(){
        ctx.lineWidth = lineWidthInitial;
        animate(150, 0, width, function(crossWidth){
          ctx.beginPath();
          ctx.moveTo(xStart + padding + width, yStart + padding);
          ctx.lineTo(xStart + padding + width - crossWidth, yStart + padding + crossWidth);  
          ctx.stroke();
      }, callback, easeOutExpo)}, 200);
    }, easeOutExpo 
  );
}

var drawO = function(canvas, x, y, callback){
  var ctx = canvas.getContext("2d");
  var start = Math.PI / -2;
  var xStart = x * 150;
  var yStart = y * 150;
  oSound.play();
  animate(300, start, -2 * Math.PI, function(arcLength){
    ctx.beginPath();
    var center = squareSize / 2;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.arc(xStart + center, yStart + center, 50, start, arcLength, true);
    ctx.stroke();
  }, callback, easeInOutExpo);
}

var clearBoard = function(canvas){
  ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

var drawBoard = function(canvas){
  drawing = true;
  ctx = canvas.getContext("2d");
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
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
  }, function(){
    drawing = false;
  }, easeOutExpo)
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

var highlightSquare = function(canvas, x, y){
  var ctx = canvas.getContext("2d");
  var padding = squareSize / 2 - 50;
  var height = 150;
  var width = height;
  var xStart = x * 150;
  var yStart = y * 150;
  ctx.fillStyle = "rgba(127,255,0,0.4)";
  ctx.fillRect(xStart, yStart, width, height);
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
var names = ["Player O", "CPU"];
var drawing = false;
var winningScore = 5;
var tournamentOver = false;
var scoreboard = document.querySelector(".winner");
var instructionsMessage = document.querySelector(".instructions");
var boardCanvas = document.querySelector("#board-sketch");

var play = function(x, y){
  // only render player if mark square is succesful
  if (game.markSquare(x, y)){
  // check game status after we draw the player on the board
    renderPlayer(x, y, checkGameStatus);  
  } 
}

var autoPlay = function(){
  game.cpuMove();
  var x = game.lastPlay[0];
  var y = game.lastPlay[1];
  // check game status after we draw the player on the board
  renderPlayer(x, y, checkGameStatus);  
}

var checkGameStatus = function(){
  if (game.winner) {
    highlightBoard();
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
    // showPlayerInstructions();
    if (game.currentPlayer == 1) {
      autoPlay();
    }
  }
}

var handleClick = function(event){
  // if game is finished, clicking resets the game
  if (drawing) {
    return;
  }
  if (game.over){
    if (tournamentOver) {
      tournamentOver = false;
      game.scores[0] = 0;
      game.scores[1] = 0;
    }
    newGame();
    // otherwise, make move in clicked square
  } else {
    var row = Math.floor(event.offsetY / 150);
    var column = Math.floor(event.offsetX / 150);
    play(column, row);
  }
};

boardCanvas.addEventListener('click', handleClick);

var highlightBoard = function(){
  for (var y = 0; y < 3; y++){
    for (var x = 0; x < 3; x++){
      var square = game.board[y][x];
      if (square.win) {
        highlightSquare(boardCanvas, x, y);
      }
    }
  }
}

var newGame = function(){
  game.newGame();
  clearBoard(boardCanvas);
  drawBoard(boardCanvas);
  showScores();
  showPlayerInstructions();
}

var showPlayerInstructions = function(){
  instructionsMessage.innerHTML = 
  "<span class='player-name' contenteditable>" + names[game.currentPlayer] +
   "</span>, click  on a square to place your " + game.player();
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
  var player = game.board[y][x].player;
  if (player === "X") {
    drawX(boardCanvas, x, y, callback);
  } else if (player === "O") {
    drawO(boardCanvas, x, y, callback);
  }  
}

//
// program flow starts here
//
newGame();

// Todo:
// single player mode

