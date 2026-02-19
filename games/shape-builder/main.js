/**
 * Shape Builder - Main Game Logic
 */

// ==========================================
// AUDIO CONTEXT
// ==========================================
let audioContext = null;
let audioUnlocked = false;

function initAudioContext() {
    if (audioContext) return audioContext;
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        console.log('AudioContext created');
    } catch (e) {
        console.warn('Could not create AudioContext:', e);
    }
    return audioContext;
}

function unlockAudio() {
    if (audioUnlocked) return Promise.resolve();

    initAudioContext();

    return new Promise((resolve) => {
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume().then(() => {
                console.log('AudioContext resumed');
                audioUnlocked = true;
                resolve();
            });
        } else {
            audioUnlocked = true;
            resolve();
        }
    });
}

// ==========================================
// GAME STATE
// ==========================================
const GameState = {
    mode: 'freeform',
    canvasManager: null,
    currentPattern: null,
    currentChallenge: null,
    timeLeft: 60,
    timerInterval: null,
    score: 0
};

// ==========================================
// INITIALIZATION
// ==========================================
function init() {
    setupEventListeners();
    initializeShapePalette();
    initializeColorPicker();
    initializePatternSelector();
}

function addTouchHandler(el, fn) {
    el.addEventListener('touchstart', (e) => {
        e.preventDefault();
        e.stopPropagation();
        fn();
    }, { passive: false });
    el.addEventListener('click', fn);
}

function setupEventListeners() {
    // Mode selection buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
        addTouchHandler(btn, () => selectMode(btn.dataset.mode));
    });

    // Tool buttons
    addTouchHandler(document.getElementById('rotate-btn'), rotateTool);
    addTouchHandler(document.getElementById('color-btn'), colorTool);
    addTouchHandler(document.getElementById('delete-btn'), deleteTool);
    addTouchHandler(document.getElementById('clear-btn'), clearAll);

    // Complete screen buttons
    addTouchHandler(document.getElementById('play-again'), playAgain);
    addTouchHandler(document.getElementById('back-to-menu'), backToMenu);
}

// ==========================================
// SHAPE PALETTE
// ==========================================
function initializeShapePalette() {
    const paletteContainer = document.getElementById('palette-shapes');

    Object.keys(SHAPES).forEach((shapeType, index) => {
        const shapeData = SHAPES[shapeType];
        const color = COLORS[index % COLORS.length].hex;

        const shapeItem = document.createElement('div');
        shapeItem.className = 'shape-item';
        shapeItem.dataset.shape = shapeType;
        shapeItem.title = shapeData.name;

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 100 100');

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', shapeData.path);
        path.setAttribute('fill', color);
        path.setAttribute('stroke', 'rgba(0,0,0,0.2)');
        path.setAttribute('stroke-width', '2');

        svg.appendChild(path);
        shapeItem.appendChild(svg);

        // Click to add shape to canvas
        shapeItem.addEventListener('click', () => addShapeToCanvas(shapeType, color));
        shapeItem.addEventListener('touchstart', (e) => {
            e.preventDefault();
            addShapeToCanvas(shapeType, color);
        }, { passive: false });

        paletteContainer.appendChild(shapeItem);
    });
}

function addShapeToCanvas(shapeType, color) {
    if (!GameState.canvasManager) return;

    // Add shape to center of canvas
    const centerX = 200;
    const centerY = 200;

    GameState.canvasManager.addShape(shapeType, centerX, centerY, color);
}

// ==========================================
// COLOR PICKER
// ==========================================
function initializeColorPicker() {
    const colorGrid = document.getElementById('color-grid');

    COLORS.forEach(colorData => {
        const colorItem = document.createElement('div');
        colorItem.className = 'color-item';
        colorItem.style.backgroundColor = colorData.hex;
        colorItem.title = colorData.name;

        const applyColor = () => {
            if (GameState.canvasManager) {
                GameState.canvasManager.changeSelectedColor(colorData.hex);
                hideColorPicker();
            }
        };
        addTouchHandler(colorItem, applyColor);

        colorGrid.appendChild(colorItem);
    });
}

function showColorPicker() {
    document.getElementById('color-picker').style.display = 'block';
}

function hideColorPicker() {
    document.getElementById('color-picker').style.display = 'none';
}

// ==========================================
// PATTERN SELECTOR
// ==========================================
function initializePatternSelector() {
    const patternGrid = document.getElementById('pattern-grid');

    PATTERNS.forEach(pattern => {
        const patternItem = document.createElement('div');
        patternItem.className = 'pattern-item';

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 400 400');

        // Render pattern shapes
        pattern.shapes.forEach(shapeData => {
            const shapeInfo = SHAPES[shapeData.type];
            const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            group.setAttribute('transform', `translate(${shapeData.x}, ${shapeData.y}) rotate(${shapeData.rotation || 0})`);

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', shapeInfo.path);
            path.setAttribute('fill', shapeData.color);
            path.setAttribute('stroke', 'rgba(0,0,0,0.2)');
            path.setAttribute('stroke-width', '2');

            const scale = (shapeData.size || 80) / 100;
            path.setAttribute('transform', `translate(-50, -50) scale(${scale}) translate(50, 50)`);

            group.appendChild(path);
            svg.appendChild(group);
        });

        patternItem.appendChild(svg);

        const patternName = document.createElement('div');
        patternName.className = 'pattern-item-name';
        patternName.textContent = pattern.name;
        patternItem.appendChild(patternName);

        patternItem.addEventListener('click', () => {
            selectPattern(pattern);
            hidePatternSelector();
        });

        patternGrid.appendChild(patternItem);
    });
}

function showPatternSelector() {
    document.getElementById('pattern-selector').style.display = 'block';
}

function hidePatternSelector() {
    document.getElementById('pattern-selector').style.display = 'none';
}

function selectPattern(pattern) {
    GameState.currentPattern = pattern;

    // Show pattern preview
    const patternPreview = document.getElementById('pattern-preview');
    patternPreview.style.display = 'block';

    const patternCanvas = document.getElementById('pattern-canvas');
    patternCanvas.innerHTML = '<rect width="400" height="400" fill="url(#grid)"/>';

    // Render pattern
    pattern.shapes.forEach(shapeData => {
        const shapeInfo = SHAPES[shapeData.type];
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('transform', `translate(${shapeData.x}, ${shapeData.y}) rotate(${shapeData.rotation || 0})`);

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', shapeInfo.path);
        path.setAttribute('fill', shapeData.color);
        path.setAttribute('stroke', 'rgba(0,0,0,0.2)');
        path.setAttribute('stroke-width', '2');

        const scale = (shapeData.size || 80) / 100;
        path.setAttribute('transform', `translate(-50, -50) scale(${scale}) translate(50, 50)`);

        group.appendChild(path);
        patternCanvas.appendChild(group);
    });
}

// ==========================================
// MODE SELECTION
// ==========================================
function selectMode(mode) {
    unlockAudio().then(() => {
        GameState.mode = mode;
        showScreen('game-screen');
        startGame(mode);
    });
}

function startGame(mode) {
    // Initialize canvas manager
    const canvas = document.getElementById('canvas');
    GameState.canvasManager = new CanvasManager(canvas);

    // Update mode indicator
    const modeNames = {
        'freeform': 'יצירה חופשית',
        'pattern': 'התאמת דפוס',
        'timed': 'אתגר זמן'
    };
    document.getElementById('mode-indicator').textContent = modeNames[mode];

    // Hide pattern preview and timer by default
    document.getElementById('pattern-preview').style.display = 'none';
    document.getElementById('timer-display').style.display = 'none';

    if (mode === 'freeform') {
        // Freeform mode - just let them create
    } else if (mode === 'pattern') {
        // Pattern Match mode - show pattern selector
        showPatternSelector();
    } else if (mode === 'timed') {
        // Timed Challenge mode - start timer
        startTimer();
        document.getElementById('timer-display').style.display = 'flex';
    }
}

// ==========================================
// TOOLS
// ==========================================
function rotateTool() {
    if (GameState.canvasManager) {
        GameState.canvasManager.rotateSelected(45);
    }
}

function colorTool() {
    if (GameState.canvasManager && GameState.canvasManager.selectedShape) {
        showColorPicker();
    }
}

function deleteTool() {
    if (GameState.canvasManager) {
        GameState.canvasManager.deleteSelected();
    }
}

function clearAll() {
    if (GameState.canvasManager) {
        if (confirm('האם אתה בטוח שברצונך למחוק הכל?')) {
            GameState.canvasManager.clearAll();
        }
    }
}

// ==========================================
// TIMER
// ==========================================
function startTimer() {
    GameState.timeLeft = 60;
    updateTimerDisplay();

    if (GameState.timerInterval) {
        clearInterval(GameState.timerInterval);
    }

    GameState.timerInterval = setInterval(() => {
        GameState.timeLeft--;
        updateTimerDisplay();

        if (GameState.timeLeft <= 0) {
            clearInterval(GameState.timerInterval);
            endGame();
        }
    }, 1000);
}

function updateTimerDisplay() {
    document.getElementById('timer-value').textContent = GameState.timeLeft;
}

function endGame() {
    showCompleteScreen();
}

// ==========================================
// SCREEN NAVIGATION
// ==========================================
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function showCompleteScreen() {
    const statsContainer = document.getElementById('complete-stats');

    if (GameState.mode === 'timed') {
        const shapesCreated = GameState.canvasManager ? GameState.canvasManager.shapes.length : 0;
        statsContainer.innerHTML = `
            <div>צורות שנוצרו: ${shapesCreated}</div>
            <div>זמן: ${60 - GameState.timeLeft} שניות</div>
        `;
    } else if (GameState.mode === 'pattern') {
        statsContainer.innerHTML = `
            <div>דפוס הושלם!</div>
        `;
    } else {
        statsContainer.innerHTML = `
            <div>יצירה מדהימה!</div>
        `;
    }

    showScreen('complete-screen');
}

function playAgain() {
    // Clear timer if exists
    if (GameState.timerInterval) {
        clearInterval(GameState.timerInterval);
    }

    // Restart the same mode
    showScreen('game-screen');
    startGame(GameState.mode);
}

function backToMenu() {
    // Clear timer if exists
    if (GameState.timerInterval) {
        clearInterval(GameState.timerInterval);
    }

    // Clear canvas
    if (GameState.canvasManager) {
        GameState.canvasManager.clearAll();
    }

    // Hide color picker and pattern selector
    hideColorPicker();
    hidePatternSelector();

    showScreen('welcome-screen');
}

// ==========================================
// CLICK OUTSIDE TO CLOSE
// ==========================================
document.addEventListener('click', (e) => {
    const colorPicker = document.getElementById('color-picker');
    const colorBtn = document.getElementById('color-btn');

    if (colorPicker.style.display === 'block' &&
        !colorPicker.contains(e.target) &&
        !colorBtn.contains(e.target)) {
        hideColorPicker();
    }
});

// ==========================================
// START
// ==========================================
document.addEventListener('DOMContentLoaded', init);
