const GameState = {
    user: null, // { hero: string }
    score: 0,
    difficulty: 'easy',
    mode: 'sum',
    selectedHero: null,
    currentExercise: null,
    isHelping: false
};

const HEROES = [
    { id: 'yuval_batman', name: 'באטמן', img: '../../platform/images/characters/yuval_batman.png' },
    { id: 'yuval_flash', name: 'פלאש', img: '../../platform/images/characters/yuval_flash.png' },
    { id: 'or_superman', name: 'סופרמן', img: '../../platform/images/characters/Or_superman.png' },
    { id: 'or_thor', name: 'תור', img: '../../platform/images/characters/Or_thor.png' },
    { id: 'mama_wonder', name: 'וונדר וומן', img: '../../platform/images/characters/mama_wonder.png' },
    { id: 'mama_bishop', name: 'בישופ', img: '../../platform/images/characters/mama_bishop.png' },
    { id: 'papa_capitan', name: 'קפטן אמריקה', img: '../../platform/images/characters/papa_capitan.png' },
    { id: 'papa_hulk', name: 'האלק', img: '../../platform/images/characters/papa_hulk.png' }
];

function init() {
    loadProgress();
    showHeroSelection();
}

function loadProgress() {
    const saved = localStorage.getItem('math-hero-state-v2');
    if (saved) {
        const data = JSON.parse(saved);
        GameState.score = data.score || 0;
        GameState.user = data.user;
        if (GameState.user) GameState.selectedHero = GameState.user.hero;
    }
}

function saveProgress() {
    localStorage.setItem('math-hero-state-v2', JSON.stringify({
        user: GameState.user,
        score: GameState.score
    }));
    updateLeaderboard();
}

function showHeroSelection() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="scene hero-selection active">
            <h1>מי אתה היום? 🦸‍♂️</h1>
            <div class="hero-grid">
                ${HEROES.map(hero => `
                    <div class="hero-card ${GameState.selectedHero === hero.id ? 'selected' : ''}" 
                         onclick="selectHero('${hero.id}')" id="hero-${hero.id}">
                        <img src="${hero.img}" alt="${hero.name}">
                        <span>${hero.name}</span>
                    </div>
                `).join('')}
            </div>
            <div class="action-buttons" style="display: flex; gap: 15px; justify-content: center;">
                <button class="magic-btn" style="background: var(--warm-gradient);" onclick="showLeaderboard()">🏆 לוח תוצאות</button>
            </div>
            <div class="back-link" style="margin-top: 30px;">
                <a href="../../index.html" class="back-home-btn">🏠 חזרה לתפריט הראשי</a>
            </div>
        </div>
    `;
}

function selectHero(id) {
    // Load score for this specific hero from leaderboard
    const savedLeaderboard = localStorage.getItem('math-hero-leaderboard-v2');
    const leaderboard = savedLeaderboard ? JSON.parse(savedLeaderboard) : [];
    const heroEntry = leaderboard.find(e => e.hero === id);

    GameState.selectedHero = id;
    GameState.user = { hero: id };
    GameState.score = heroEntry ? heroEntry.score : 0;

    saveProgress();

    // Visual feedback then start
    document.querySelectorAll('.hero-card').forEach(card => card.classList.remove('selected'));
    const selectedCard = document.getElementById(`hero-${id}`);
    if (selectedCard) selectedCard.classList.add('selected');

    setTimeout(showMainMenu, 400);
}

function startGame() {
    if (!GameState.selectedHero) {
        alert('אנא בחר גיבור!');
        return;
    }

    GameState.user = { hero: GameState.selectedHero };
    saveProgress();
    showMainMenu();
}

function showMainMenu() {
    const app = document.getElementById('app');
    const hero = HEROES.find(h => h.id === GameState.user.hero);
    app.innerHTML = `
        <div class="scene main-menu active">
            <div class="user-stats">
                <img src="${hero.img}" class="small-hero-img" />
                <span class="stat-text">${GameState.score} ⭐</span>
            </div>
            <h1>מה נלמד היום? 📚</h1>
            <div class="menu-grid">
                <div class="menu-item" onclick="setMode('sum')">➕ חיבור</div>
                <div class="menu-item" onclick="setMode('sub')">➖ חיסור</div>
                <div class="menu-item" onclick="setMode('mix_sum_sub')">🔀 חיבור וחיסור</div>
                <div class="menu-item" onclick="setMode('mult')">✖️ כפל</div>
                <div class="menu-item" onclick="setMode('div')">➗ חילוק</div>
                <div class="menu-item" onclick="setMode('all')">🌟 הכל ביחד!</div>
            </div>
            <div class="footer-buttons" style="margin-top: 40px; display: flex; gap: 15px; justify-content: center;">
                <button class="magic-btn" style="background: var(--warm-gradient);" onclick="showLeaderboard()">🏆 לוח תוצאות</button>
                <button class="magic-btn secondary" onclick="showHeroSelection()">🔄 החלף גיבור</button>
            </div>
        </div>
    `;
}

function setMode(mode) {
    GameState.mode = mode;
    showDifficultySelection();
}

function showDifficultySelection() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="scene difficulty active">
            <h1>רמת קושי 🚦</h1>
            <div class="menu-grid">
                <div class="menu-item" onclick="startExercise('easy')">🟢 קל (0-20)</div>
                <div class="menu-item" onclick="startExercise('medium')">🟡 בינוני (0-100)</div>
                <div class="menu-item" onclick="startExercise('hard')">🔴 קשה</div>
            </div>
            <button class="magic-btn secondary" style="margin-top: 40px;" onclick="showMainMenu()">🔙 חזרה</button>
        </div>
    `;
}

function startExercise(diff) {
    GameState.difficulty = diff;
    nextExercise();
}

function nextExercise() {
    const exercise = generateExercise();
    GameState.currentExercise = exercise;
    GameState.isHelping = false;
    renderExercise();
}

function generateExercise() {
    let mode = GameState.mode;
    if (mode === 'all') {
        const modes = ['sum', 'sub', 'mult', 'div'];
        mode = modes[Math.floor(Math.random() * modes.length)];
    } else if (mode === 'mix_sum_sub') {
        mode = Math.random() > 0.5 ? 'sum' : 'sub';
    }

    let num1, num2, num3 = null, op, result;
    const diff = GameState.difficulty;

    if (mode === 'sum' || mode === 'sub') {
        const max = diff === 'easy' ? 20 : 100;
        num1 = Math.floor(Math.random() * max);
        num2 = Math.floor(Math.random() * (max - (mode === 'sub' ? 0 : num1)));

        if (mode === 'sub' && num1 < num2) [num1, num2] = [num2, num1];

        if (diff === 'medium' && Math.random() > 0.7) {
            num3 = Math.floor(Math.random() * 20);
            op = mode === 'sum' ? '+' : '-';
            result = mode === 'sum' ? num1 + num2 + num3 : num1 - num2 - num3;
            if (result < 0) { num3 = null; result = num1 - num2; }
        } else {
            op = mode === 'sum' ? '+' : '-';
            result = mode === 'sum' ? num1 + num2 : num1 - num2;
        }
    } else if (mode === 'mult') {
        num1 = Math.floor(Math.random() * (diff === 'hard' ? 12 : 6)) + 1;
        num2 = Math.floor(Math.random() * (diff === 'hard' ? 10 : 5)) + 1;
        op = '×';
        result = num1 * num2;
    } else if (mode === 'div') {
        num2 = Math.floor(Math.random() * (diff === 'hard' ? 10 : 5)) + 1;
        result = Math.floor(Math.random() * (diff === 'hard' ? 10 : 5)) + 1;
        num1 = num2 * result;
        op = '÷';
    }

    return { num1, num2, num3, op, result, mode };
}

function renderExercise() {
    const app = document.getElementById('app');
    const { num1, num2, num3, op } = GameState.currentExercise;
    const hero = HEROES.find(h => h.id === GameState.user.hero);

    app.innerHTML = `
        <div class="scene game active">
            <div class="top-left-actions">
                <button class="back-btn-small" onclick="quitGame()">🔙 סיום</button>
            </div>

            <div class="user-stats">
                <img src="${hero.img}" class="small-hero-img" />
                <span class="stat-text">⭐ <span id="current-score">${GameState.score}</span></span>
                <div id="score-popup-container"></div>
            </div>
            
            <div class="exercise-wrapper">
                <div class="exercise-container">
                    ${num1} ${op} ${num2} ${num3 !== null ? `${op} ${num3}` : ''} = ?
                </div>
                <button class="magic-btn help circle-btn" id="help-btn" onclick="showHelp()">❓</button>
            </div>
            
            <div id="visual-aid-container"></div>
            <div id="help-container"></div>

            <div class="answer-box">
                <input type="number" id="answer-input" class="answer-input" autofocus placeholder="?" />
            </div>
            
            <div id="feedback" class="feedback"></div>
            
            <div class="action-buttons" style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                <button class="magic-btn" onclick="checkAnswer()">בדיקה ✅</button>
            </div>
        </div>
    `;

    if (GameState.currentExercise.mode === 'mult' || GameState.currentExercise.mode === 'div') {
        renderVisualAid();
    }

    const input = document.getElementById('answer-input');
    input.focus();
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkAnswer();
    });
}

function showHelp() {
    if (GameState.isHelping) return;
    GameState.isHelping = true;

    document.getElementById('help-btn').style.opacity = '0.5';
    document.getElementById('help-btn').disabled = true;

    const result = GameState.currentExercise.result;
    const options = [result];

    while (options.length < 4) {
        let wrong = result + Math.floor(Math.random() * 11) - 5;
        if (wrong !== result && wrong >= 0 && !options.includes(wrong)) {
            options.push(wrong);
        }
    }

    // Shuffle
    options.sort(() => Math.random() - 0.5);

    const helpContainer = document.getElementById('help-container');
    helpContainer.innerHTML = `
        <div class="help-grid">
            ${options.map(opt => `
                <div class="help-option" onclick="selectOption(${opt})">${opt}</div>
            `).join('')}
        </div>
    `;

    document.querySelector('.answer-box').style.display = 'none';
}

function selectOption(val) {
    document.getElementById('answer-input').value = val;
    checkAnswer();
}

function renderVisualAid() {
    const container = document.getElementById('visual-aid-container');
    const { num1, num2, result, mode } = GameState.currentExercise;

    if (mode === 'mult') {
        let html = '<div class="visual-aid">';
        for (let i = 0; i < num1; i++) {
            html += '<div class="visual-group">';
            for (let j = 0; j < num2; j++) html += '<div class="dot"></div>';
            html += '</div>';
        }
        html += '</div>';
        container.innerHTML = html;
    } else if (mode === 'div') {
        // Pie Chart for Division
        // num1 is total, num2 is number of slices, result is value per slice
        const total = num1;
        const slices = num2;
        const sliceValue = result;

        let html = `
            <div class="pie-container">
                <div class="pie-total-badge">סך הכל: ${total}</div>
                <div class="pie-chart-wrapper">
                    <svg viewBox="0 0 100 100" class="pie-chart">
        `;

        const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#1A535C', '#F7FFF7', '#FF9F1C', '#2EC4B6', '#E71D36'];

        for (let i = 0; i < slices; i++) {
            const startAngle = (i * 360) / slices;
            const endAngle = ((i + 1) * 360) / slices;
            const x1 = 50 + 45 * Math.cos((Math.PI * (startAngle - 90)) / 180);
            const y1 = 50 + 45 * Math.sin((Math.PI * (startAngle - 90)) / 180);
            const x2 = 50 + 45 * Math.cos((Math.PI * (endAngle - 90)) / 180);
            const y2 = 50 + 45 * Math.sin((Math.PI * (endAngle - 90)) / 180);
            const largeArc = 0;

            html += `
                <path d="M 50 50 L ${x1} ${y1} A 45 45 0 ${largeArc} 1 ${x2} ${y2} Z" 
                      fill="${colors[i % colors.length]}" stroke="white" stroke-width="0.5">
                      <title>חלק ${i + 1}: ${sliceValue} נקודות</title>
                </path>
                <text x="${50 + 30 * Math.cos((Math.PI * ((startAngle + endAngle) / 2 - 90)) / 180)}" 
                      y="${50 + 30 * Math.sin((Math.PI * ((startAngle + endAngle) / 2 - 90)) / 180)}" 
                      fill="black" font-size="6" font-weight="bold" text-anchor="middle" dominant-baseline="middle">
                      ${sliceValue}
                </text>
            `;
        }

        html += `
                    </svg>
                </div>
                <div class="pie-info">חילקנו את ה-${total} ל-${slices} חלקים שווים!</div>
            </div>
        `;
        container.innerHTML = html;
    }
}

function checkAnswer() {
    const input = document.getElementById('answer-input');
    const playerAnswer = parseInt(input.value);
    const feedback = document.getElementById('feedback');

    if (isNaN(playerAnswer)) return;

    if (playerAnswer === GameState.currentExercise.result) {
        GameState.score += 4;
        feedback.innerHTML = '<span class="correct">קוסם! נכון מאוד! ✨ 🪄</span>';

        // Add score animation
        const popup = document.createElement('div');
        popup.className = 'score-popup';
        popup.textContent = '+4 ✨';
        document.getElementById('score-popup-container').appendChild(popup);

        // Update score text immediately
        document.getElementById('current-score').textContent = GameState.score;

        saveProgress();
        setTimeout(nextExercise, 1500);
    } else {
        GameState.score = Math.max(0, GameState.score - 1);
        feedback.innerHTML = '<span class="wrong">כמעט... נסה שוב! 🪄</span>';
        if (!GameState.isHelping) {
            input.value = '';
            input.focus();
        }
    }
}

function quitGame() {
    saveProgress();
    showMainMenu();
}

function showLeaderboard() {
    const app = document.getElementById('app');
    const saved = localStorage.getItem('math-hero-leaderboard-v2');
    let leaderboard = saved ? JSON.parse(saved) : [];
    leaderboard.sort((a, b) => b.score - a.score);

    app.innerHTML = `
        <div class="scene leaderboard active">
            <h1>הגיבורים החזקים 🏆</h1>
            <div class="leaderboard-list">
                ${leaderboard.map((entry, index) => {
        const hero = HEROES.find(h => h.id === entry.hero) || HEROES[0];
        return `
                        <div class="leader-entry ${GameState.user && entry.hero === GameState.user.hero ? 'current-user' : ''}">
                            <span class="rank">${index + 1}</span>
                            <img src="${hero.img}" class="leader-img" />
                            <span class="leader-score">${entry.score} נקודות</span>
                        </div>
                    `;
    }).join('')}
                ${leaderboard.length === 0 ? '<p>עדיין אין שיאים!</p>' : ''}
            </div>
            <button class="magic-btn" style="margin-top: 40px;" onclick="showMainMenu()">🔙 חזרה</button>
        </div>
    `;
}

function updateLeaderboard() {
    const saved = localStorage.getItem('math-hero-leaderboard-v2');
    let leaderboard = saved ? JSON.parse(saved) : [];

    const index = leaderboard.findIndex(e => e.hero === GameState.user.hero);
    if (index !== -1) {
        leaderboard[index].score = Math.max(leaderboard[index].score, GameState.score);
    } else {
        leaderboard.push({
            hero: GameState.user.hero,
            score: GameState.score
        });
    }

    localStorage.setItem('math-hero-leaderboard-v2', JSON.stringify(leaderboard));
}

window.onload = init;
