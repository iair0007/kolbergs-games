document.addEventListener('DOMContentLoaded', () => {
    // Assets
    const CHARACTERS = [
        'Or_superman.png',
        'Or_thor.png',
        'mama_bishop.png',
        'mama_wonder.png',
        'papa_capitan.png',
        'papa_hulk.png',
        'yuval_batman.png',
        'yuval_flash.png'
    ];

    const BACKGROUND_VARIANTS = [
        '#FFFFFF', // White (Default)
        '#FFF5BA', // Light Yellow
        '#E0F7FA', // Light Cyan
        '#F3E5F5'  // Light Purple
    ];

    // Game State
    let gameState = {
        cards: [],
        flippedCards: [],
        matchedPairs: 0,
        totalPairs: 0,
        moves: 0,
        timer: 0,
        timerInterval: null,
        isLocked: false,
        difficulty: null
    };

    // DOM Elements
    const screens = {
        welcome: document.getElementById('welcome-screen'),
        game: document.getElementById('game-screen'),
        victory: document.getElementById('victory-screen')
    };

    const ui = {
        grid: document.getElementById('game-grid'),
        moveCount: document.getElementById('move-count'),
        timer: document.getElementById('timer'),
        finalMoves: document.getElementById('final-moves'),
        finalTime: document.getElementById('final-time'),
        btns: document.querySelectorAll('.btn-difficulty'),
        restartBtn: document.getElementById('restart-btn'),
        playAgainBtn: document.getElementById('play-again-btn')
    };

    // Initialize
    function init() {
        ui.btns.forEach(btn => {
            btn.addEventListener('click', () => {
                const gridSize = parseInt(btn.dataset.grid);
                startGame(gridSize);
            });
        });

        ui.restartBtn.addEventListener('click', () => {
            if (confirm('Restart game?')) {
                resetGame();
            }
        });

        ui.playAgainBtn.addEventListener('click', resetGame);

        // Handle Home Button
        const homeBtn = document.querySelector('.home-button');
        homeBtn.addEventListener('click', (e) => {
            // If we are NOT in the welcome screen, we want to go back to the welcome screen
            if (!screens.welcome.classList.contains('active')) {
                e.preventDefault(); // Stop navigation to ../../index.html
                if (confirm('Quit current game?')) {
                    resetGame();
                }
            }
            // If we ARE in the welcome screen, let the default href link take us to Platform Home
        });
    }

    function switchScreen(screenName) {
        Object.values(screens).forEach(s => {
            s.classList.add('hidden');
            s.classList.remove('active');
        });
        screens[screenName].classList.remove('hidden');
        screens[screenName].classList.add('active');
    }

    function startGame(gridSize) {
        // Reset State
        gameState.moves = 0;
        gameState.timer = 0;
        gameState.matchedPairs = 0;
        gameState.totalPairs = (gridSize * gridSize) / 2;
        gameState.flippedCards = [];
        gameState.isLocked = false;
        gameState.difficulty = gridSize;

        // Update UI
        ui.moveCount.textContent = '0';
        ui.timer.textContent = '00:00';

        // Generate Deck
        const deck = generateDeck(gridSize);
        renderGrid(deck, gridSize);

        // Start Timer
        startTimer();

        // Show Game Screen
        switchScreen('game');
    }

    // Variant Definitions
    const VARIANTS = [
        { id: 'normal', icon: '', class: 'var-normal' },
        { id: 'fire', icon: '🔥', class: 'var-fire' },
        { id: 'ice', icon: '❄️', class: 'var-ice' },
        { id: 'storm', icon: '⚡', class: 'var-storm' }
    ];

    function generateDeck(gridSize) {
        const totalCards = gridSize * gridSize;
        const numPairs = totalCards / 2;

        let deck = [];

        // Logic for distributing variants
        // 2x2 (2 pairs): 2 unique characters (Normal)
        // 4x4 (8 pairs): 8 unique characters (Normal)
        // 6x6 (18 pairs): 8 Normal + 8 Fire + 2 Ice
        // 8x8 (32 pairs): 8 Normal + 8 Fire + 8 Ice + 8 Storm

        let pairsGenerated = 0;

        // Strategy: Iterate through variants
        for (let v = 0; v < VARIANTS.length; v++) {
            if (pairsGenerated >= numPairs) break;

            const variant = VARIANTS[v];
            // Shuffle characters for this variant batch
            const shuffledChars = [...CHARACTERS].sort(() => Math.random() - 0.5);

            for (let char of shuffledChars) {
                if (pairsGenerated >= numPairs) break;

                const cardData = {
                    id: pairsGenerated,
                    image: char,
                    variant: variant,
                    pairUniqueId: `${char}-${variant.id}` // Unique ID for matching logic
                };

                deck.push({ ...cardData });
                deck.push({ ...cardData });

                pairsGenerated++;
            }
        }

        return deck.sort(() => Math.random() - 0.5);
    }

    function renderGrid(deck, gridSize) {
        ui.grid.innerHTML = '';
        ui.grid.className = `grid-container grid-${gridSize}`;

        deck.forEach((cardData, index) => {
            const card = document.createElement('div');
            card.className = `card ${cardData.variant.class}`; // Add variant class
            card.dataset.index = index;
            card.dataset.pairId = cardData.pairUniqueId;

            const cardInner = document.createElement('div');
            cardInner.className = 'card-inner';

            const cardFront = document.createElement('div');
            cardFront.className = 'card-front';
            cardFront.innerHTML = '<span class="card-icon">❓</span>';

            const cardBack = document.createElement('div');
            cardBack.className = 'card-back';

            // Image
            const img = document.createElement('img');
            img.src = `../../platform/images/characters/${cardData.image}`;
            img.alt = 'Superhero';

            // Variant Icon overlay
            if (cardData.variant.icon) {
                const badge = document.createElement('span');
                badge.className = 'card-badge';
                badge.textContent = cardData.variant.icon;
                cardBack.appendChild(badge);
            }

            cardBack.appendChild(img);
            cardInner.appendChild(cardFront);
            cardInner.appendChild(cardBack);
            card.appendChild(cardInner);

            card.addEventListener('click', () => handleCardClick(card));

            ui.grid.appendChild(card);
            gameState.cards.push(card);
        });
    }

    function handleCardClick(card) {
        if (gameState.isLocked) return;
        if (card.classList.contains('flipped')) return;
        if (card.classList.contains('matched')) return;

        // Flip Card
        card.classList.add('flipped');
        gameState.flippedCards.push(card);

        if (gameState.flippedCards.length === 2) {
            gameState.moves++;
            ui.moveCount.textContent = gameState.moves;
            checkForMatch();
        }
    }

    function checkForMatch() {
        gameState.isLocked = true;
        const [card1, card2] = gameState.flippedCards;
        const match1 = card1.dataset.pairId;
        const match2 = card2.dataset.pairId;

        if (match1 === match2) {
            // Match Found
            setTimeout(() => {
                card1.classList.add('matched');
                card2.classList.add('matched');
                gameState.flippedCards = [];
                gameState.matchedPairs++;
                gameState.isLocked = false;

                // Add celebration sound or effect here if desired

                if (gameState.matchedPairs === gameState.totalPairs) {
                    gameComplete();
                }
            }, 500);
        } else {
            // No Match
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                gameState.flippedCards = [];
                gameState.isLocked = false;
            }, 1000);
        }
    }

    function startTimer() {
        if (gameState.timerInterval) clearInterval(gameState.timerInterval);
        gameState.timerInterval = setInterval(() => {
            gameState.timer++;
            const mins = Math.floor(gameState.timer / 60).toString().padStart(2, '0');
            const secs = (gameState.timer % 60).toString().padStart(2, '0');
            ui.timer.textContent = `${mins}:${secs}`;
        }, 1000);
    }

    function gameComplete() {
        clearInterval(gameState.timerInterval);

        // Update Victory Stats
        ui.finalMoves.textContent = gameState.moves;
        ui.finalTime.textContent = ui.timer.textContent;

        // Confetti Effect (Simple Emoji based for now)
        createConfetti();

        setTimeout(() => {
            switchScreen('victory');
        }, 800);
    }

    function resetGame() {
        clearInterval(gameState.timerInterval);
        switchScreen('welcome');
    }

    function createConfetti() {
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.top = '-10px';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = ['#FFD700', '#FF4D4D', '#4D94FF', '#2ECC71'][Math.floor(Math.random() * 4)];
            confetti.style.zIndex = '1000';
            confetti.style.animation = `fall ${Math.random() * 3 + 2}s linear forwards`;
            document.body.appendChild(confetti);

            // Cleanup
            setTimeout(() => confetti.remove(), 5000);
        }

        // Add styles for confetti dynamically if not in CSS
        if (!document.getElementById('confetti-style')) {
            const style = document.createElement('style');
            style.id = 'confetti-style';
            style.innerHTML = `
                @keyframes fall {
                    to {
                        transform: translateY(100vh) rotate(720deg);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    init();
});
