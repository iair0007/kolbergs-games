// ===================================
// TIC TAC TOE GAME LOGIC
// ===================================

// Game State
const gameState = {
  mode: null, // 'computer' or 'player'
  player1Character: null,
  player2Character: null,
  currentPlayer: 1,
  board: Array(9).fill(null),
  gameOver: false,
  winner: null
};

// Character list
const characters = [
  'yuval_batman.png',
  'yuval_flash.png',
  'Or_superman.png',
  'Or_thor.png',
  'mama_bishop.png',
  'mama_wonder.png',
  'papa_capitan.png',
  'papa_hulk.png'
];

// DOM Elements
const screens = {
  welcome: document.getElementById('welcome-screen'),
  character: document.getElementById('character-screen'),
  game: document.getElementById('game-screen'),
  result: document.getElementById('result-screen')
};

// ===================================
// SCREEN MANAGEMENT
// ===================================

function showScreen(screenName) {
  Object.values(screens).forEach(screen => screen.classList.remove('active'));
  screens[screenName].classList.add('active');
}

// ===================================
// WELCOME SCREEN
// ===================================

document.querySelectorAll('.mode-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    gameState.mode = btn.dataset.mode;
    showCharacterSelection(1);
  });
});

// ===================================
// CHARACTER SELECTION
// ===================================

function showCharacterSelection(playerNum) {
  const title = document.querySelector('.selection-title');
  const indicator = document.querySelector('.player-indicator');
  const grid = document.querySelector('.character-grid');

  if (gameState.mode === 'computer') {
    title.textContent = 'Choose Your Character';
    indicator.textContent = 'Pick your hero!';
  } else {
    title.textContent = 'Choose Your Character';
    indicator.textContent = `Player ${playerNum}, pick your hero!`;
  }

  // Clear and populate grid
  grid.innerHTML = '';
  characters.forEach(char => {
    const card = document.createElement('div');
    card.className = 'character-card';
    card.innerHTML = `<img src="../../platform/images/characters/${char}" alt="${char}">`;

    card.addEventListener('click', () => {
      if (playerNum === 1) {
        gameState.player1Character = char;

        if (gameState.mode === 'computer') {
          // AI picks a random different character
          const availableChars = characters.filter(c => c !== char);
          gameState.player2Character = availableChars[Math.floor(Math.random() * availableChars.length)];
          startGame();
        } else {
          // Show character selection for player 2
          showCharacterSelection(2);
        }
      } else {
        gameState.player2Character = char;
        startGame();
      }
    });

    grid.appendChild(card);
  });

  showScreen('character');
}

// Back buttons in character selection
document.querySelectorAll('.back-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.classList.contains('game-back-btn')) {
      resetGame();
      showScreen('welcome');
    } else {
      showScreen('welcome');
    }
  });
});

// ===================================
// GAME BOARD
// ===================================

function startGame() {
  // Reset game state
  gameState.board = Array(9).fill(null);
  gameState.currentPlayer = 1;
  gameState.gameOver = false;
  gameState.winner = null;

  // Set player avatars
  document.querySelector('.player1-info .player-avatar').src = `../../platform/images/characters/${gameState.player1Character}`;
  document.querySelector('.player2-info .player-avatar').src = `../../platform/images/characters/${gameState.player2Character}`;

  // Update labels
  document.querySelector('.player1-info .player-label').textContent = 'Player 1';
  document.querySelector('.player2-info .player-label').textContent = gameState.mode === 'computer' ? 'Computer' : 'Player 2';

  // Clear board
  document.querySelectorAll('.cell').forEach(cell => {
    cell.innerHTML = '';
    cell.classList.remove('filled', 'winning');
  });

  // Update turn indicator
  updateTurnIndicator();

  // Add click handlers to cells
  document.querySelectorAll('.cell').forEach(cell => {
    const newCell = cell.cloneNode(true); // Remove old listeners
    cell.parentNode.replaceChild(newCell, cell);

    newCell.addEventListener('click', () => handleCellClick(parseInt(newCell.dataset.index)));
  });

  showScreen('game');
}

function handleCellClick(index) {
  // Validate move
  if (gameState.gameOver || gameState.board[index] !== null) {
    return;
  }

  // In computer mode, only allow player 1 to click
  if (gameState.mode === 'computer' && gameState.currentPlayer === 2) {
    return;
  }

  // Make move
  makeMove(index, gameState.currentPlayer);
}

function makeMove(index, player) {
  // Update board state
  gameState.board[index] = player;

  // Update UI
  const cell = document.querySelector(`.cell[data-index="${index}"]`);
  cell.classList.add('filled');

  const img = document.createElement('img');
  img.src = `../../platform/images/characters/${player === 1 ? gameState.player1Character : gameState.player2Character}`;
  img.alt = `Player ${player}`;
  cell.appendChild(img);

  // Check for winner or draw
  const winner = checkWinner();
  if (winner) {
    endGame(winner);
    return;
  }

  if (checkDraw()) {
    endGame(null);
    return;
  }

  // Switch turn
  gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
  updateTurnIndicator();

  // If computer mode and now computer's turn
  if (gameState.mode === 'computer' && gameState.currentPlayer === 2) {
    setTimeout(() => {
      makeComputerMove();
    }, 600);
  }
}

function updateTurnIndicator() {
  // Update active player highlight
  document.querySelector('.player1-info').classList.toggle('active', gameState.currentPlayer === 1);
  document.querySelector('.player2-info').classList.toggle('active', gameState.currentPlayer === 2);

  // Update current turn indicator
  const turnIndicator = document.querySelector('.current-turn');
  turnIndicator.innerHTML = `<img src="../../platform/images/characters/${gameState.currentPlayer === 1 ? gameState.player1Character : gameState.player2Character}" alt="Current turn">`;
}

// ===================================
// GAME LOGIC
// ===================================

function checkWinner() {
  const winPatterns = [
    [0, 1, 2], // Top row
    [3, 4, 5], // Middle row
    [6, 7, 8], // Bottom row
    [0, 3, 6], // Left column
    [1, 4, 7], // Middle column
    [2, 5, 8], // Right column
    [0, 4, 8], // Diagonal \
    [2, 4, 6]  // Diagonal /
  ];

  for (const pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (gameState.board[a] &&
      gameState.board[a] === gameState.board[b] &&
      gameState.board[a] === gameState.board[c]) {
      // Highlight winning cells
      pattern.forEach(index => {
        document.querySelector(`.cell[data-index="${index}"]`).classList.add('winning');
      });
      return gameState.board[a];
    }
  }

  return null;
}

function checkDraw() {
  return gameState.board.every(cell => cell !== null) && !checkWinner();
}

// ===================================
// AI LOGIC (SMART BUT BEATABLE)
// ===================================

function makeComputerMove() {
  if (gameState.gameOver) return;

  const move = getBestMove();
  makeMove(move, 2);
}

function getBestMove() {
  // Strategy priority:
  // 1. Win if possible
  // 2. Block opponent from winning
  // 3. Take center if available
  // 4. Take corner
  // 5. Take any available

  // Check if AI can win
  const winMove = findWinningMove(2);
  if (winMove !== null) return winMove;

  // Check if need to block player
  const blockMove = findWinningMove(1);
  if (blockMove !== null) return blockMove;

  // Take center if available
  if (gameState.board[4] === null) {
    return Math.random() < 0.7 ? 4 : getRandomMove(); // 70% take center, 30% random for variety
  }

  // Take a corner
  const corners = [0, 2, 6, 8];
  const availableCorners = corners.filter(i => gameState.board[i] === null);
  if (availableCorners.length > 0) {
    return availableCorners[Math.floor(Math.random() * availableCorners.length)];
  }

  // Take any available
  return getRandomMove();
}

function findWinningMove(player) {
  for (let i = 0; i < 9; i++) {
    if (gameState.board[i] === null) {
      // Try this move
      gameState.board[i] = player;
      const isWinning = checkWinner() === player;
      gameState.board[i] = null; // Undo

      if (isWinning) return i;
    }
  }
  return null;
}

function getRandomMove() {
  const available = gameState.board
    .map((cell, index) => cell === null ? index : null)
    .filter(index => index !== null);

  return available[Math.floor(Math.random() * available.length)];
}

// ===================================
// GAME END
// ===================================

function endGame(winner) {
  gameState.gameOver = true;
  gameState.winner = winner;

  setTimeout(() => {
    showResultScreen();
  }, 1000);
}

function showResultScreen() {
  const title = document.querySelector('.result-title');
  const winnerDisplay = document.querySelector('.winner-display');
  const winnerAvatar = document.querySelector('.winner-avatar');
  const message = document.querySelector('.result-message');

  if (gameState.winner === null) {
    // Draw
    title.textContent = "🤝 IT'S A DRAW!";
    winnerDisplay.classList.add('hidden');
    message.textContent = "Great game! Want to play again?";
  } else {
    // Winner
    const winnerName = gameState.winner === 1 ? 'Player 1' :
      (gameState.mode === 'computer' ? 'Computer' : 'Player 2');
    title.textContent = `🎉 ${winnerName} WINS!`;
    winnerDisplay.classList.remove('hidden');
    winnerAvatar.src = `../../platform/images/characters/${gameState.winner === 1 ? gameState.player1Character : gameState.player2Character}`;
    message.textContent = "Awesome job! Play again?";
  }

  showScreen('result');
}

// Result screen buttons
document.querySelector('.play-again-btn').addEventListener('click', () => {
  startGame();
});

document.querySelector('.menu-btn').addEventListener('click', () => {
  resetGame();
  showScreen('welcome');
});

function resetGame() {
  gameState.mode = null;
  gameState.player1Character = null;
  gameState.player2Character = null;
  gameState.currentPlayer = 1;
  gameState.board = Array(9).fill(null);
  gameState.gameOver = false;
  gameState.winner = null;
}

// ===================================
// INITIALIZE
// ===================================

// Show welcome screen on load
showScreen('welcome');
