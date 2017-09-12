gameSize = 3;

var game = {
  board: [],
  players: ["O", "X"],
  currentPlayer: 0,
  size: 3,
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
        row.push(null);
      }
      game.board.push(row);
    }
    game.over = false;
    game.winner = null;
    // choose random player to start
    game.currentPlayer = Math.floor(Math.random() * 2);
  },
  spaceAvailable: function(x, y){
    if (game.board[y][x] === null)
      return true;
    else {
      return false;
    }
  },
  markSquare: function(x, y){
    if (game.over || !game.spaceAvailable(x, y)) {
      return;
    }
    game.board[y][x] = game.players[game.currentPlayer];
    game.checkForWin();
    // if game not over, switch players
    if (game.over === false){
      game.currentPlayer = Math.abs(game.currentPlayer - 1);
    }
  },
  checkForWin: function(){
    // check rows and columns
    for (var idx = 0; idx < game.size; idx++){
      // check row at idx
      var row = game.board[idx];
      if (row[0] !== null &&
        row[0] === row[1] && 
        row[0] === row[2]) {
        game.win(row[0]);
      }
      // check column at idx
      if (game.board[0][idx] !== null &&
        game.board[0][idx] === game.board[1][idx] &&
        game.board[0][idx] === game.board[2][idx]) {
        game.win(game.board[0][idx]);
      }      
    }
    // check diagonals: top left to bottom right or top right to bottom 
    // left all match, middle square is winner
    if (game.board[1][1] !== null &&
        ((  game.board[0][0] === game.board[1][1] &&
            game.board[1][1] === game.board[2][2]
          ) || (
            game.board[0][2] === game.board[1][1] &&
            game.board[1][1] === game.board[2][0]
          ) ) ) 
    {
      game.win(game.board[1][1]);
    }
  },
  win: function(player){
    game.winner = player;
    game.over = true;
  }
};


// DOM 

var winnerMessage = document.querySelector(".winner");
var instructionsMessage = document.querySelector(".instructions");
// an array of divs for the game board
var board = [];
for (var y = 0; y < gameSize; y++){
  var row = [];
  for (var x = 0; x < gameSize; x++){
    row.push(document.querySelector("#square" + y + x));
  }
  board.push(row);
};


var play = function(x, y){
  game.markSquare(x, y);  
  updateBoard();
  checkGameStatus();
}

var checkGameStatus = function(){
  if (game.winner) {
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

// positions of x and y coords in div id names
var xPos = 7;
var yPos = 6;

var main = document.querySelector("main");
main.addEventListener('click', function(event){
  // if game is finished, clicking resets the game
  if (game.over){
    // otherwise, make move in clicked square
    newGame();
  } else {
    var clickId = event.target.id;
    var x = clickId.charAt(xPos);
    var y = clickId.charAt(yPos);
    play(x, y);
  }

})

var updateBoard = function(){
  var gb = game.board;
  for (var y = 0; y < 3; y++){
    for (var x = 0; x < 3; x++){
      // if square is not null, it's been played, show in DOM
      if (gb[y][x]){
        board[y][x].textContent = gb[y][x];
      } else {
        board[y][x].textContent = "";
      }
    }
  }
}

var newGame = function(){
  game.newGame();
  updateBoard();
  winnerMessage.textContent = "";
  instructionsMessage.textContent = "Player " + game.player() + ", click  on a square to make your move";
}


//
// program flow starts here
//
newGame();

// add styling to boxes with winning moves
// add styling! 
