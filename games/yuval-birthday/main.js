/**
 * Yuval's Birthday Adventure - Main Logic
 * 
 * Simple Screen Manager to handle navigation between game states.
 * No frameworks, just Vanilla JS.
 */

const SCREENS = [
    'welcome',
    'yuval-selection',
    'or-selection',
    'mama-selection',
    'papa-selection',
    'team-reveal',
    'attraction',
    'restaurant',
    'dessert',
    'final-celebration'
];

// Enemy-related timing constants
const ENEMY_OVERLAY_DELAY = 1500; // Delay before showing enemy math challenge overlay (ms)
const ENEMY_DEFEAT_ANIMATION_DURATION = 1500; // Duration to wait for enemy defeat animation (ms)

class GameApp {
    /**
     * Utility: Generate a random addition question for the math overlay
     * @returns {object} { question: string, correct: number, choices: number[] }
     */
    static generateMathQuestion() {
        const a = Math.floor(Math.random() * 10);
        const b = Math.floor(Math.random() * 10);
        const correct = a + b;
        // Build up to 3 wrong answers, unique, near the correct result
        const choices = new Set([correct]);
        while (choices.size < 4) {
            let wrong = correct + Math.floor(Math.random() * 7) - 3; // nearby
            if (wrong < 0) wrong = 0;
            if (wrong > 18) wrong = 18;
            choices.add(wrong);
        }
        // Randomize order
        const shuffled = Array.from(choices).sort(() => Math.random() - 0.5);
        return {
            question: `${a} + ${b} = ?`,
            correct: correct,
            choices: shuffled
        };
    }

    /**
     * Utility: Create the math overlay HTML and attach to container
     * @param {HTMLElement} container
     * @param {HTMLElement} enemyAsset
     * @param {function} onSuccess Called if child answers correctly
     * @returns {function} detachOverlay (cleanup function)
     */
    static showMathChallengeOverlay(container, enemyAsset, onSuccess) {
        // Ensure all selection cards remain disabled during math challenge
        const allCards = container.querySelectorAll('.selection-card');
        allCards.forEach(card => {
            // Add disabled-no-visual if not already disabled
            if (!card.classList.contains('disabled') && !card.classList.contains('disabled-no-visual')) {
                card.classList.add('disabled-no-visual');
            }
        });

        // Dim everything, lock selection cards
        const overlay = document.createElement('div');
        overlay.className = 'math-challenge-overlay';
        overlay.style.position = 'absolute';
        overlay.style.inset = '0';
        overlay.style.background = 'rgba(255,255,255,0.3)';
        overlay.style.display = 'flex';
        overlay.style.flexDirection = 'column';
        overlay.style.justifyContent = 'flex-start';
        overlay.style.alignItems = 'center';
        overlay.style.paddingTop = '10vh';
        overlay.style.paddingBottom = '20px';
        overlay.style.overflowY = 'auto';
        overlay.style.zIndex = 50;
        overlay.style.pointerEvents = 'auto';

        // Wrap/position enemy (enemyAsset may be reused)
        const enemyWrap = document.createElement('div');
        enemyWrap.className = 'math-enemy-wrap';
        enemyWrap.style.position = 'relative';
        enemyWrap.style.display = 'flex';
        enemyWrap.style.flexDirection = 'column';
        enemyWrap.style.alignItems = 'center';
        enemyWrap.style.justifyContent = 'center';
        enemyWrap.style.marginBottom = '1rem';
        //  enemyWrap.style.maxHeight = '30vh';
        enemyWrap.appendChild(enemyAsset);

        // Limit enemy asset size
        if (enemyAsset.tagName === 'IMG' || enemyAsset.tagName === 'VIDEO') {
            enemyAsset.style.maxHeight = '70vh';
            enemyAsset.style.maxWidth = '80%';
            enemyAsset.style.objectFit = 'contain';
        }

        // Math question and answer buttons
        const { question, correct, choices } = GameApp.generateMathQuestion();
        // Question
        const questionEl = document.createElement('div');
        questionEl.className = 'math-question-text';
        questionEl.textContent = question;
        questionEl.style.fontSize = '3.4rem';
        questionEl.style.color = '#b105f6';
        questionEl.style.fontWeight = '900';
        //  questionEl.style.textShadow = '2px 2px 0px #FFF, 3px 3px 8px #ffe4fb';
        questionEl.style.margin = '0.8rem 0';
        questionEl.style.textAlign = 'center';
        questionEl.style.flexShrink = '0';

        // Answer buttons
        const btnRow = document.createElement('div');
        btnRow.className = 'math-answer-row';
        btnRow.style.display = 'flex';
        btnRow.style.gap = '1.2rem';
        btnRow.style.flexWrap = 'wrap';
        btnRow.style.justifyContent = 'center';
        btnRow.style.flexShrink = '0';
        for (const ans of choices) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = ans;
            btn.className = 'math-answer-btn';
            btn.style.fontSize = '2rem';
            btn.style.minWidth = '70px';
            btn.style.padding = '15px 25px';
            btn.style.background = '#FADA00';
            btn.style.border = '7px solid #8424d3';
            btn.style.borderRadius = '30px';
            btn.style.fontFamily = 'Fredoka, Comic Sans MS, sans-serif';
            btn.style.fontWeight = 'bold';
            btn.style.color = '#8424d3';
            btn.style.transition = 'transform 0.1s, box-shadow 0.1s';
            btn.style.cursor = 'pointer';
            btn.style.marginBottom = '1rem';

            btn.onclick = () => {
                // Animation/feedback: green if correct, shake if not
                if (ans === correct) {
                    // Play correct answer sound
                    if (window.soundManager) {
                        window.soundManager.playSound('mathCorrect');
                    }
                    btn.style.background = '#32cd32';
                    btn.style.borderColor = '#fff';
                    btnRow.style.pointerEvents = 'none';

                    // Ensure all selection cards remain disabled during defeat sequence
                    const allCards = container.querySelectorAll('.selection-card');
                    allCards.forEach(card => {
                        if (!card.classList.contains('disabled') && !card.classList.contains('disabled-no-visual')) {
                            card.classList.add('disabled-no-visual');
                        }
                    });

                    // Hide math question and buttons, but keep enemy visible
                    questionEl.style.display = 'none';
                    btnRow.style.display = 'none';
                    // Immediately fade out and remove overlay
                    overlay.style.transition = 'opacity 0.3s ease-out';
                    overlay.style.opacity = '0';
                    setTimeout(() => {
                        if (overlay.parentElement) {
                            overlay.remove();
                        }
                    }, 300);
                    // Pass the enemy asset to onSuccess callback
                    setTimeout(() => {
                        if (onSuccess) onSuccess(enemyAsset, overlay);
                    }, 450);
                } else {
                    // Play wrong answer sound
                    if (window.soundManager) {
                        window.soundManager.playSound('mathWrong');
                    }
                    btn.style.background = '#ff4444';
                    btn.style.borderColor = '#fff';
                    btn.style.transform = 'scale(1.08)';
                    btn.animate([
                        { transform: 'translateX(0)' },
                        { transform: 'translateX(-10px)' },
                        { transform: 'translateX(10px)' },
                        { transform: 'translateX(0)' },
                    ], { duration: 250, iterations: 2 });
                }
            };
            btnRow.appendChild(btn);
        }
        // Initially hide question and buttons - show only enemy
        questionEl.style.display = 'none';
        btnRow.style.display = 'none';
        // Disable buttons initially
        const buttons = btnRow.querySelectorAll('.math-answer-btn');
        buttons.forEach(btn => {
            btn.style.pointerEvents = 'none';
        });

        overlay.appendChild(enemyWrap);
        overlay.appendChild(questionEl);
        overlay.appendChild(btnRow);
        container.appendChild(overlay);

        // Show question and buttons after 2 seconds
        setTimeout(() => {
            // Play math question sound when question appears
            if (window.soundManager) {
                window.soundManager.playSound('mathQuestion');
            }

            questionEl.style.display = 'block';
            btnRow.style.display = 'flex';
            // Add entrance animation
            questionEl.style.animation = 'fadeInScale 0.5s ease-out';
            btnRow.style.animation = 'fadeInScale 0.5s ease-out';
            // Enable buttons
            buttons.forEach(btn => {
                btn.style.pointerEvents = 'auto';
            });
        }, 3000);

        // Disable pointer events for the options underlay
        // ... style for .selection-card.disabled already exists ...
        return () => overlay.remove(); // simple detach
    }

    constructor() {
        this.appContainer = document.getElementById('app');
        this.currentScreenIndex = 0
        this.isTransitioning = false;

        // Game State to store user choices
        this.gameState = {
            yuval: null,
            or: null,
            mama: null,
            papa: null,
            restaurant: null,
            attraction: null,
            dessert: null
        };

        // Initialize sounds (non-blocking)
        this.initSounds();

        // Set up audio state change callback to disable/enable interactions
        this.setupAudioInteractionLock();

        // Initial render
        this.init();
    }

    /**
     * Setup callback to disable/enable interactions based on audio playback
     */
    setupAudioInteractionLock() {
        if (window.soundManager) {
            window.soundManager.setAudioStateChangeCallback((isPlaying) => {
                this.setInteractionsEnabled(!isPlaying);
            });
        }
    }

    /**
     * Enable or disable all interactive elements
     */
    setInteractionsEnabled(enabled) {
        const currentScreen = this.appContainer.querySelector('.screen.active');
        if (!currentScreen) return;

        // Disable/enable all buttons
        const buttons = currentScreen.querySelectorAll('button, .btn-next, .restart-btn, .reveal-btn');
        buttons.forEach(btn => {
            if (enabled) {
                btn.style.pointerEvents = 'auto';
                btn.style.opacity = '1';
            } else {
                btn.style.pointerEvents = 'none';
                btn.style.opacity = '0.6';
            }
        });

        // Disable/enable all selection cards
        const cards = currentScreen.querySelectorAll('.selection-card');
        cards.forEach(card => {
            // Don't enable cards that have disabled-no-visual class (they should stay disabled)
            const hasDisabledNoVisual = card.classList.contains('disabled-no-visual');

            if (enabled && !hasDisabledNoVisual) {
                card.style.pointerEvents = 'auto';
            } else {
                card.style.pointerEvents = 'none';
            }
            // Don't add disabled class if it's already disabled for other reasons
            // Just prevent pointer events
        });

        // Disable/enable math answer buttons
        const mathButtons = currentScreen.querySelectorAll('.math-answer-btn');
        mathButtons.forEach(btn => {
            if (enabled) {
                btn.style.pointerEvents = 'auto';
            } else {
                btn.style.pointerEvents = 'none';
            }
        });
    }

    /**
     * Initialize sound system
     */
    async initSounds() {
        if (window.soundManager) {
            try {
                await window.soundManager.preloadAllSounds();
            } catch (error) {
                console.warn('Sound initialization failed:', error);
            }
        }
    }

    init() {
        // Create DOM elements for all screens initially (or we could do it lazily)
        // For simplicity, we can render just the current one or handle them dynamically.
        // Let's go with dynamically rendering the current one to clear previous DOM.
        this.showScreen(SCREENS[this.currentScreenIndex]);
    }

    /**
     * Creates the HTML structure for a given screen name
     */
    async createScreenElement(screenName) {
        const div = document.createElement('div');
        div.className = 'screen';
        div.dataset.screen = screenName;

        // Handle specific screens
        if (screenName === 'welcome') {
            await this.renderWelcome(div);
            return div;
        }

        if (screenName === 'yuval-selection') {
            await this.renderYuvalSelection(div);
            return div;
        }

        if (screenName === 'or-selection') {
            await this.renderOrSelection(div);
            return div;
        }

        if (screenName === 'mama-selection') {
            await this.renderMamaSelection(div);
            return div;
        }

        if (screenName === 'papa-selection') {
            await this.renderPapaSelection(div);
            return div;
        }

        if (screenName === 'team-reveal') {
            await this.renderTeamReveal(div);
            return div;
        }

        if (screenName === 'restaurant') {
            await this.renderRestaurant(div);
            return div;
        }

        if (screenName === 'attraction') {
            await this.renderAttraction(div);
            return div;
        }

        if (screenName === 'dessert') {
            await this.renderDessert(div);
            return div;
        }

        if (screenName === 'final-celebration') {
            await this.renderFinalCelebration(div);
            return div;
        }

        // Format title for display (replace hyphens with spaces and capitalize)
        const displayTitle = screenName.replace(/-/g, ' ').toUpperCase();

        div.innerHTML = `
            <h1>${displayTitle}</h1>
            <button class="btn-next">START!</button>
        `;

        // Customize button text based on flow
        const btn = div.querySelector('.btn-next');
        if (screenName === 'final-celebration') {
            btn.textContent = 'PLAY AGAIN';
            btn.onclick = () => {
                if (window.soundManager) {
                    window.soundManager.playSound('buttonClick');
                }
                this.restartGame();
            };
        } else {
            btn.textContent = 'NEXT >';
            btn.onclick = () => {
                if (window.soundManager) {
                    window.soundManager.playSound('buttonClick');
                }
                this.nextScreen();
            };
        }

        return div;
    }

    /**
     * Render Logic for Welcome Screen
     */
    async renderWelcome(container) {
        container.classList.add('welcome-screen');

        // Build enhanced welcome layout
        container.innerHTML = `
            <div class="welcome-background-effects"></div>
            
            <div class="welcome-content">
                <div class="welcome-header">
                    <h1 class="welcome-title">
                        <span class="title-line">🎉 Yuval's</span>
                        <span class="title-line">Birthday</span>
                        <span class="title-line">Adventure! 🎂</span>
                    </h1>
                    <div class="welcome-subtitle">Ready for an amazing day?</div>
                </div>

                <div class="welcome-illustration">
                    <div class="floating-emoji">🦸</div>
                    <div class="floating-emoji">🎈</div>
                    <div class="floating-emoji">🎁</div>
                    <div class="floating-emoji">⭐</div>
                    <div class="floating-emoji">🎊</div>
                </div>

                <div class="welcome-footer">
                    <button class="btn-next welcome-btn">
                        <span class="btn-text">LET'S GO!</span>
                        <span class="btn-sparkle">✨</span>
                    </button>
                </div>
            </div>
        `;

        // Add entrance animations
        setTimeout(() => {
            const titleLines = container.querySelectorAll('.title-line');
            titleLines.forEach((line, index) => {
                setTimeout(() => {
                    line.style.animation = 'titleLineEntrance 0.6s ease-out forwards';
                }, index * 200);
            });
        }, 100);

        setTimeout(() => {
            const subtitle = container.querySelector('.welcome-subtitle');
            if (subtitle) {
                subtitle.style.animation = 'fadeInUp 0.8s ease-out forwards';
            }
        }, 800);

        setTimeout(() => {
            const btn = container.querySelector('.welcome-btn');
            if (btn) {
                btn.style.animation = 'buttonEntrance 0.6s ease-out forwards';
            }
        }, 1200);

        // Start floating emojis animation
        this.startWelcomeEmojis(container);

        // Start background particles
        this.startWelcomeParticles(container);

        // Button interaction
        container.querySelector('.welcome-btn').onclick = () => {
            if (window.soundManager) {
                window.soundManager.playSound('buttonClick');
            }
            this.nextScreen();
        };
    }

    startWelcomeEmojis(container) {
        const illustration = container.querySelector('.welcome-illustration');
        if (!illustration) return;

        const emojis = illustration.querySelectorAll('.floating-emoji');
        emojis.forEach((emoji, index) => {
            emoji.style.animationDelay = `${index * 0.3}s`;
            emoji.style.animation = 'welcomeEmojiFloat 3s ease-in-out infinite';
        });
    }

    startWelcomeParticles(container) {
        const effectsLayer = container.querySelector('.welcome-background-effects');
        if (!effectsLayer) return;

        const particles = ['✨', '⭐', '💫', '🌟', '🎉'];
        const createParticle = () => {
            if (!document.body.contains(container)) return;

            const particle = document.createElement('div');
            particle.className = 'welcome-particle';
            particle.textContent = particles[Math.floor(Math.random() * particles.length)];
            particle.style.left = Math.random() * 100 + '%';
            particle.style.fontSize = (20 + Math.random() * 15) + 'px';
            particle.style.opacity = 0.7 + Math.random() * 0.3;

            const duration = 4 + Math.random() * 3;
            particle.style.animationDuration = duration + 's';
            particle.style.animationDelay = Math.random() * 2 + 's';

            effectsLayer.appendChild(particle);
            setTimeout(() => particle.remove(), duration * 1000);

            setTimeout(createParticle, 500 + Math.random() * 1000);
        };

        // Start with some particles
        for (let i = 0; i < 10; i++) {
            setTimeout(createParticle, i * 200);
        }
    }

    /**
     * Render Logic for Restaurant Screen (Dragon Encounter)
     */
    async renderRestaurant(container) {
        container.className += ' restaurant-screen'; // Add specific class for styling

        // Layout Structure
        container.innerHTML = `
            <h1>What do you want to eat?</h1>
            <div class="dragon-container"></div>
            <div class="restaurant-options-container"></div>
        `;

        const dragonContainer = container.querySelector('.dragon-container');
        const optionsContainer = container.querySelector('.restaurant-options-container');

        // 1. Load Dragon Enemy (but do NOT attach to DOM yet)
        const dragonAsset = await AssetLoader.loadMedia('./enemies', 'Dragon');
        dragonAsset.classList.add('dragon-asset', 'dragon-entry-anim');

        // 2. Load Restaurant Options
        const options = ['pizza', 'hamburger', 'steak', 'wok'];
        const cards = [];
        for (const option of options) {
            const card = document.createElement('div');
            card.className = 'selection-card restaurant-card';
            card.dataset.id = option;
            // Load Asset
            const asset = await AssetLoader.loadMedia('./restaurant', option);
            card.appendChild(asset);
            // Interaction
            card.onclick = () => this.handleRestaurantSelection(option, card, container, dragonAsset);
            cards.push(card);
            optionsContainer.appendChild(card);
        }

        // Disable options initially (but don't grey them out)
        for (const c of cards) c.classList.add('disabled-no-visual');

        // 3. After 3 seconds, show dragon+math overlay
        setTimeout(() => {
            // Play enemy appear sound
            if (window.soundManager) {
                window.soundManager.playSound('enemyAppear');
                window.soundManager.playSound('dragonRoar');
            }

            const detach = GameApp.showMathChallengeOverlay(container, dragonAsset, async (mathEnemyAsset, overlay) => {
                // Attach enemy if not already
                if (!dragonAsset.parentElement || dragonAsset.parentElement !== dragonContainer) {
                    dragonContainer.innerHTML = '';
                    dragonContainer.appendChild(dragonAsset);
                }
                // Play defeat (enemy "dies") - pass the enemy asset and overlay
                await this.playDragonDefeatSequence(container, dragonAsset, mathEnemyAsset, overlay);
                // Re-enable options 0.5s after defeat and play audio 10
                setTimeout(() => {
                    for (const c of cards) {
                        c.classList.remove('disabled-no-visual');
                    }
                    // Play audio 10 when options become available
                    if (window.soundManager) {
                        this.setInteractionsEnabled(false);
                        window.soundManager.playAudioFile(10).catch(err => {
                            console.warn(`Failed to play audio 10:`, err);
                            this.setInteractionsEnabled(true);
                        });
                    }
                }, 500);
            });
        }, 3000); // Changed from 1000ms to 3000ms (3 seconds)
    }

    async handleRestaurantSelection(selectedId, selectedCard, container, dragonAsset) {
        if (this.isTransitioning) return;
        this.isTransitioning = true;

        // Play selection sound
        if (window.soundManager) {
            window.soundManager.playSound('buttonClick');
        }

        // 1. Save State
        this.gameState.restaurant = selectedId;
        // 2. Visual Feedback (Selection)
        const allCards = container.querySelectorAll('.restaurant-card');
        allCards.forEach(card => {
            if (card === selectedCard) {
                card.classList.add('selected');
                card.classList.add('explosion-active');
            } else {
                card.classList.add('disabled');
            }
        });
        // 3. Wait for the selection register visually
        await new Promise(r => setTimeout(r, 600));
        // 4. Transition Forward
        this.isTransitioning = false;
        this.nextScreen();
    }


    async playDragonDefeatSequence(container, aliveDragonAsset, mathOverlayEnemyAsset, overlay) {
        // Play enemy defeat sound
        if (window.soundManager) {
            window.soundManager.playSound('enemyDefeat');
        }

        const dragonContainer = container.querySelector('.dragon-container');
        let videoPlayPromise = null;

        // Apply defeat keyframes to the enemy asset shown in math overlay
        if (mathOverlayEnemyAsset && mathOverlayEnemyAsset.parentElement) {
            // Swap to defeated asset and apply defeat animation
            const defeatedAsset = await AssetLoader.loadMedia('./enemies', 'dragon_defeated');
            const parent = mathOverlayEnemyAsset.parentElement;

            defeatedAsset.classList.add('dragon-asset', 'dragon-defeated-anim');

            // Video handling if it's a video
            if (defeatedAsset.tagName === 'VIDEO') {
                defeatedAsset.muted = true;
                defeatedAsset.loop = false;
            }

            parent.replaceChild(defeatedAsset, mathOverlayEnemyAsset);

            // Play video if applicable and wait for it to complete
            if (defeatedAsset.tagName === 'VIDEO') {
                try {
                    await defeatedAsset.play();
                    // Wait for video to end
                    videoPlayPromise = new Promise((resolve) => {
                        defeatedAsset.addEventListener('ended', resolve, { once: true });
                        // Fallback timeout in case 'ended' event doesn't fire (5 seconds max)
                        setTimeout(resolve, 5000);
                    });
                } catch (e) {
                    console.warn('Defeat video play failed', e);
                    videoPlayPromise = Promise.resolve();
                }
            } else {
                videoPlayPromise = Promise.resolve();
            }
        } else {
            videoPlayPromise = Promise.resolve();
        }

        // Visual effects for the hit
        aliveDragonAsset.classList.add('dragon-hit');

        // Wait for hit "flash"
        await new Promise(r => setTimeout(r, 600));

        // Swap to Defeated Asset in container
        const defeatedAssetContainer = await AssetLoader.loadMedia('./enemies', 'dragon_defeated');
        defeatedAssetContainer.classList.add('dragon-asset', 'dragon-defeated-anim');

        // Video handling if it's a video
        if (defeatedAssetContainer.tagName === 'VIDEO') {
            defeatedAssetContainer.muted = true;
            defeatedAssetContainer.loop = false;
        }

        // Swap elements
        dragonContainer.innerHTML = '';
        dragonContainer.appendChild(defeatedAssetContainer);

        // Play video if applicable
        if (defeatedAssetContainer.tagName === 'VIDEO') {
            try {
                await defeatedAssetContainer.play();
            } catch (e) { console.warn('Defeat video play failed', e); }
        }

        // Wait for video to complete (or fallback timeout)
        await videoPlayPromise;

        // Additional small delay for smooth transition
        await new Promise(r => setTimeout(r, 300));

        // Remove overlay after animation completes with fade out
        if (overlay && overlay.parentElement) {
            overlay.style.transition = 'opacity 0.5s ease-out';
            overlay.style.opacity = '0';
            setTimeout(() => {
                if (overlay.parentElement) {
                    overlay.remove();
                }
            }, 500);
        }

        // Hide the enemy container and give more space to options
        dragonContainer.classList.add('enemy-container-defeated');
        container.classList.add('enemy-defeated');
    }

    /**
     * Render Logic for Attraction Screen (Robot Encounter)
     */
    async renderAttraction(container) {
        container.classList.add('attraction-screen');

        // Layout Structure
        container.innerHTML = `
             <h1>What do you want to do?</h1>
             <div class="robot-container"></div>
             <div class="attraction-options-container"></div>
         `;

        const robotContainer = container.querySelector('.robot-container');
        const optionsContainer = container.querySelector('.attraction-options-container');

        // 1. Load Robot Enemy (do NOT attach yet)
        const robotAsset = await AssetLoader.loadMedia('./enemies', 'robot');
        robotAsset.classList.add('robot-asset', 'robot-entry-anim');

        // 2. Load Attraction Options
        const options = ['theater', 'video_games', 'obstacle_game', 'safari'];
        const cards = [];
        for (const option of options) {
            const card = document.createElement('div');
            card.className = 'selection-card attraction-card';
            card.dataset.id = option;
            // Load Asset
            const asset = await AssetLoader.loadMedia('./Attraction', option);
            card.appendChild(asset);
            // Interaction
            card.onclick = () => this.handleAttractionSelection(option, card, container, robotAsset);
            cards.push(card);
            optionsContainer.appendChild(card);
        }

        // Disable options initially (but don't grey them out)
        for (const c of cards) c.classList.add('disabled-no-visual');

        // 3. After 4 seconds, show robot+math overlay
        setTimeout(() => {
            // Play enemy appear sound
            if (window.soundManager) {
                window.soundManager.playSound('enemyAppear');
                window.soundManager.playSound('robotBeep');
            }

            const detach = GameApp.showMathChallengeOverlay(container, robotAsset, async (mathEnemyAsset, overlay) => {
                if (!robotAsset.parentElement || robotAsset.parentElement !== robotContainer) {
                    robotContainer.innerHTML = '';
                    robotContainer.appendChild(robotAsset);
                }
                await this.playRobotDefeatSequence(container, robotAsset, mathEnemyAsset, overlay);
                // Re-enable options 0.5s after defeat and play audio 8
                setTimeout(() => {
                    for (const c of cards) {
                        c.classList.remove('disabled-no-visual');
                    }
                    // Play audio 8 when options become available
                    if (window.soundManager) {
                        this.setInteractionsEnabled(false);
                        window.soundManager.playAudioFile(8).catch(err => {
                            console.warn(`Failed to play audio 8:`, err);
                            this.setInteractionsEnabled(true);
                        });
                    }
                }, 600);
            });
        }, 3300); // Changed from 1000ms to 4000ms (4 seconds)
    }

    async handleAttractionSelection(selectedId, selectedCard, container, robotAsset) {
        if (this.isTransitioning) return;
        this.isTransitioning = true;

        // Play selection sound
        if (window.soundManager) {
            window.soundManager.playSound('buttonClick');
        }

        // 1. Save State
        this.gameState.attraction = selectedId;
        console.log('Attraction selected:', selectedId);

        // 2. Visual Feedback
        const allCards = container.querySelectorAll('.attraction-card');
        allCards.forEach(card => {
            if (card === selectedCard) {
                card.classList.add('selected');
            } else {
                card.classList.add('disabled');
            }
        });

        // 3. Initiate Defeat Sequence
        await new Promise(r => setTimeout(r, 600));

        // 4. Transition Forward
        setTimeout(() => {
            this.isTransitioning = false;
            this.nextScreen();
        }, 1000);
    }

    /**
     * Render Logic for Dessert Screen (Robot Encounter)
     */
    async renderDessert(container) {
        container.classList.add('dessert-screen');

        // Layout Structure
        container.innerHTML = `
             <h1>And </h1>
             <div class="robot-container"></div>
             <div class="dessert-options-container"></div>
         `;

        const robotContainer = container.querySelector('.robot-container');
        const optionsContainer = container.querySelector('.dessert-options-container');

        // 1. Load Robot Enemy (Dessert specific, do NOT attach yet)
        const robotAsset = await AssetLoader.loadMedia('./enemies', 'dessert_enemy');
        robotAsset.classList.add('dessert-enemy-asset', 'dessert-enemy-entry-anim');

        // 2. Load Dessert Options
        const options = ['ice_cream', 'candies', 'bakery', 'strawberries'];
        const cards = [];
        for (const option of options) {
            const card = document.createElement('div');
            card.className = 'selection-card dessert-card';
            card.dataset.id = option;
            // Load Asset
            const asset = await AssetLoader.loadMedia('./Dessert', option);
            card.appendChild(asset);
            // Interaction
            card.onclick = () => this.handleDessertSelection(option, card, container, robotAsset);
            cards.push(card);
            optionsContainer.appendChild(card);
        }

        // Disable options initially (but don't grey them out)
        for (const c of cards) c.classList.add('disabled-no-visual');

        // 3. After 3 seconds, show robot+math overlay
        setTimeout(() => {
            // Play enemy appear sound
            if (window.soundManager) {
                window.soundManager.playSound('enemyAppear');
                window.soundManager.playSound('robotBeep');
            }

            const detach = GameApp.showMathChallengeOverlay(container, robotAsset, async (mathEnemyAsset, overlay) => {
                if (!robotAsset.parentElement || robotAsset.parentElement !== robotContainer) {
                    robotContainer.innerHTML = '';
                    robotContainer.appendChild(robotAsset);
                }
                await this.playRobotDefeatSequence(container, robotAsset, mathEnemyAsset, overlay, 'dessert_enemy_defeated', 'dessert-enemy-asset', 'dessert-enemy-defeated-anim');
                // Re-enable options 0.5s after defeat and play audio 12
                setTimeout(() => {
                    for (const c of cards) c.classList.remove('disabled-no-visual');
                    // Play audio 12 when options become available
                    if (window.soundManager) {
                        this.setInteractionsEnabled(false);
                        window.soundManager.playAudioFile(12).catch(err => {
                            console.warn(`Failed to play audio 12:`, err);
                            this.setInteractionsEnabled(true);
                        });
                    }
                }, 500);
            });
        }, 3000); // Changed to 3000ms (3 seconds)
    }

    async handleDessertSelection(selectedId, selectedCard, container, robotAsset) {
        if (this.isTransitioning) return;
        this.isTransitioning = true;

        // Play selection sound
        if (window.soundManager) {
            window.soundManager.playSound('buttonClick');
        }

        // 1. Save State
        this.gameState.dessert = selectedId;
        // 2. Visual Feedback (Selection)
        const allCards = container.querySelectorAll('.dessert-card');
        allCards.forEach(card => {
            if (card === selectedCard) {
                card.classList.add('selected');
            } else {
                card.classList.add('disabled');
            }
        });
        // 3. Wait for the selection register visually
        await new Promise(r => setTimeout(r, 600));
        // 4. Transition Forward
        this.isTransitioning = false;
        this.nextScreen();
    }


    async playRobotDefeatSequence(container, aliveRobotAsset, mathOverlayEnemyAsset, overlay, defeatedAssetName = 'robot_defeated', defeatedAssetClass = 'robot-asset', defeatedAnimClass = 'robot-defeated-anim') {
        // Play enemy defeat sound
        if (window.soundManager) {
            window.soundManager.playSound('enemyDefeat');
        }

        const robotContainer = container.querySelector('.robot-container');
        let videoPlayPromise = null;

        // Apply defeat keyframes to the enemy asset shown in math overlay
        if (mathOverlayEnemyAsset && mathOverlayEnemyAsset.parentElement) {
            // Swap to defeated asset and apply defeat animation
            const defeatedAsset = await AssetLoader.loadMedia('./enemies', defeatedAssetName);
            const parent = mathOverlayEnemyAsset.parentElement;

            defeatedAsset.classList.add(defeatedAssetClass, defeatedAnimClass);

            // Video handling
            if (defeatedAsset.tagName === 'VIDEO') {
                defeatedAsset.muted = true;
                defeatedAsset.loop = false;
            }

            parent.replaceChild(defeatedAsset, mathOverlayEnemyAsset);

            // Play video if applicable and wait for it to complete
            if (defeatedAsset.tagName === 'VIDEO') {
                try {
                    await defeatedAsset.play();
                    // Wait for video to end
                    videoPlayPromise = new Promise((resolve) => {
                        defeatedAsset.addEventListener('ended', resolve, { once: true });
                        // Fallback timeout in case 'ended' event doesn't fire (5 seconds max)
                        setTimeout(resolve, 5000);
                    });
                } catch (e) {
                    console.warn('Robot defeat video play warning', e);
                    videoPlayPromise = Promise.resolve();
                }
            } else {
                videoPlayPromise = Promise.resolve();
            }
        } else {
            videoPlayPromise = Promise.resolve();
        }

        // If we have a dedicated defeated video/image, let's try to use it.
        const defeatedAssetContainer = await AssetLoader.loadMedia('./enemies', defeatedAssetName);
        defeatedAssetContainer.classList.add(defeatedAssetClass, defeatedAnimClass);

        // Video handling
        if (defeatedAssetContainer.tagName === 'VIDEO') {
            defeatedAssetContainer.muted = false;
            defeatedAssetContainer.loop = false;
        }

        // Swap elements
        robotContainer.innerHTML = '';
        robotContainer.appendChild(defeatedAssetContainer);

        if (defeatedAssetContainer.tagName === 'VIDEO') {
            try {
                await defeatedAssetContainer.play();
            } catch (e) { console.warn('Robot defeat video play warning', e); }
        }

        // Wait for video to complete (or fallback timeout)
        await videoPlayPromise;

        // Additional small delay for smooth transition
        await new Promise(r => setTimeout(r, 300));

        // Remove overlay after animation completes with fade out
        if (overlay && overlay.parentElement) {
            overlay.style.transition = 'opacity 0.5s ease-out';
            overlay.style.opacity = '0';
            setTimeout(() => {
                if (overlay.parentElement) {
                    overlay.remove();
                }
            }, 500);
        }

        // Hide the enemy container and give more space to options
        robotContainer.classList.add('enemy-container-defeated');
        container.classList.add('enemy-defeated');
    }

    /**
     * Render Logic for Final Celebration Screen
     */
    async renderFinalCelebration(container) {
        container.classList.add('final-celebration-screen');

        // 1. Load Team Asset
        const { yuval, or, mama, papa } = this.gameState;
        const directory = yuval === 'flash' ? 'flash_all_team' : 'batman_all_team';
        const fileName = `${yuval}_${or}_${mama}_${papa}`;

        const teamAsset = await AssetLoader.loadMedia(`./${directory}`, fileName);
        teamAsset.classList.add('celebration-team-asset');

        // Ensure video plays
        if (teamAsset.tagName === 'VIDEO') {
            teamAsset.muted = false;
            teamAsset.loop = true;
            teamAsset.play().catch(e => console.warn('Team video play error', e));
        }

        // 2. Load Choices Assets
        const restaurantAsset = await AssetLoader.loadMedia('./restaurant', this.gameState.restaurant || 'pizza');
        const attractionAsset = await AssetLoader.loadMedia('./Attraction', this.gameState.attraction || 'video_games');
        const dessertAsset = await AssetLoader.loadMedia('./Dessert', this.gameState.dessert || 'ice_cream');

        // 3. Build Layout with enhanced celebration
        container.innerHTML = `
            <div class="celebration-header">
                <h1 class="celebration-title">🎉 BEST BIRTHDAY EVER! 🎉</h1>
                <div class="celebration-subtitle">You Did It!</div>
            </div>
            
            <div class="celebration-content">
                <div class="team-container-wrapper">
                    <div class="team-container"></div>
                </div>
                
                <div class="choices-recap">
                    <div class="recap-label">Your Amazing Choices:</div>
                    <div class="choices-grid">
                        <div class="choice-item-wrapper">
                            <div class="choice-label">🍽️ Food</div>
                            <div class="choice-item" title="Restaurant"></div>
                        </div>
                        <div class="choice-item-wrapper">
                            <div class="choice-label">🎮 Fun</div>
                            <div class="choice-item" title="Attraction"></div>
                        </div>
                        <div class="choice-item-wrapper">
                            <div class="choice-label">🍰 Dessert</div>
                            <div class="choice-item" title="Dessert"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="celebration-footer">
                <button class="btn-next restart-btn">
                    <span class="restart-icon">↺</span> PLAY AGAIN
                </button>
            </div>
        `;

        // Inject Assets with animations
        const teamContainer = container.querySelector('.team-container');
        teamContainer.appendChild(teamAsset);

        // Add entrance animation to team asset
        setTimeout(() => {
            teamAsset.style.animation = 'teamEntrance 1s ease-out';
        }, 300);

        const choices = container.querySelectorAll('.choice-item');
        choices[0].appendChild(restaurantAsset);
        choices[1].appendChild(attractionAsset);
        choices[2].appendChild(dessertAsset);

        // Add staggered entrance animations to choices
        choices.forEach((choice, index) => {
            setTimeout(() => {
                choice.style.animation = 'choiceEntrance 0.6s ease-out';
            }, 800 + (index * 200));
        });

        // 4. Restart Interaction
        container.querySelector('.restart-btn').onclick = () => {
            if (window.soundManager) {
                window.soundManager.playSound('buttonClick');
            }
            this.restartGame();
        };

        // 5. Celebration Effects
        this.startCelebrationEffects(container);

        // 6. Play celebration sounds
        if (window.soundManager) {
            window.soundManager.playSound('celebration');
        }

        // 7. Big confetti burst on load
        setTimeout(() => {
            this.triggerCelebration();
            setTimeout(() => this.triggerCelebration(), 300);
            setTimeout(() => this.triggerCelebration(), 600);
        }, 500);
    }

    startCelebrationEffects(container) {
        // Create specialized layers
        const layers = ['fireworks-layer', 'dust-layer', 'confetti-layer', 'balloons-layer'];
        layers.forEach(cls => {
            const layer = document.createElement('div');
            layer.className = `magic-layer ${cls}`;
            container.appendChild(layer);
        });

        // 1. Spawning Balloons (Foreground, once or occasional)
        this.spawnBalloonsLoop(container);

        // 2. Fireworks (Background, punchier)
        this.startFireworksLoop(container);

        // 3. Confetti (Continuous rain)
        this.startConfettiLoop(container);

        // 4. Magic Dust (Sparkles)
        this.startMagicDustLoop(container);

        // 5. Floating Icons (Emojis)
        this.startFloatingIconsLoop(container);

        // Initial Big Fireworks burst! (More intense)
        for (let i = 0; i < 10; i++) {
            setTimeout(() => this.createFirework(container.querySelector('.fireworks-layer')), i * 150);
        }

        // Additional celebration bursts at intervals
        setTimeout(() => {
            for (let i = 0; i < 8; i++) {
                setTimeout(() => this.createFirework(container.querySelector('.fireworks-layer')), i * 100);
            }
        }, 2000);

        setTimeout(() => {
            for (let i = 0; i < 6; i++) {
                setTimeout(() => this.createFirework(container.querySelector('.fireworks-layer')), i * 120);
            }
        }, 4000);
    }

    spawnBalloonsLoop(container) {
        const layer = container.querySelector('.balloons-layer');
        if (!layer) return;

        const colors = ['#FF69B4', '#FFD700', '#00BFFF', '#32CD32', '#FF4500', '#9370DB', '#697dffff'];
        const spawn = () => {
            if (!document.body.contains(container)) return;
            const balloon = document.createElement('div');
            balloon.className = 'balloon';
            balloon.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            balloon.style.left = (Math.random() * 90 + 5) + '%';

            const duration = 10 + Math.random() * 5;
            balloon.style.animationDuration = duration + 's';
            balloon.style.setProperty('--drift-x', (Math.random() - 0.5) * 150 + 'px');
            balloon.style.setProperty('--rot', (Math.random() - 0.5) * 30 + 'deg');

            layer.appendChild(balloon);
            setTimeout(() => balloon.remove(), duration * 1000);

            // Next balloon
            setTimeout(spawn, 2000 + Math.random() * 3000);
        };
        spawn();
    }

    startFireworksLoop(container) {
        const layer = container.querySelector('.fireworks-layer');
        if (!layer) return;

        const loop = () => {
            if (!document.body.contains(container)) return;
            this.createFirework(layer);
            setTimeout(loop, 800 + Math.random() * 1500);
        };
        loop();
    }

    createFirework(layer) {
        // Occasionally play firework sound (not every time to avoid noise)
        if (window.soundManager && Math.random() < 0.3) {
            window.soundManager.playSound('firework', { volume: 0.5 });
        }

        const fw = document.createElement('div');
        fw.className = 'firework-pop';
        fw.style.left = (Math.random() * 90 + 5) + '%';
        fw.style.top = (Math.random() * 60 + 5) + '%';

        const colors = ['#FFD700', '#FF4500', '#FF1493', '#00BFFF', '#ADFF2F', '#FFFFFF'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        fw.style.background = `radial-gradient(circle, #fff 0%, ${color} 40%, transparent 80%)`;
        fw.style.boxShadow = `0 0 20px ${color}`;

        layer.appendChild(fw);
        setTimeout(() => fw.remove(), 2000);
    }

    startConfettiLoop(container) {
        const layer = container.querySelector('.confetti-layer');
        if (!layer) return;

        const loop = () => {
            if (!document.body.contains(container)) return;
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';
            piece.style.left = (Math.random() * 100) + '%';
            piece.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
            piece.style.width = (5 + Math.random() * 10) + 'px';
            piece.style.height = (5 + Math.random() * 10) + 'px';
            piece.style.animationDuration = (3 + Math.random() * 2) + 's';

            layer.appendChild(piece);
            setTimeout(() => piece.remove(), 5000);

            setTimeout(loop, 100); // Dense confetti
        };
        loop();
    }

    startMagicDustLoop(container) {
        const layer = container.querySelector('.dust-layer');
        if (!layer) return;

        const loop = () => {
            if (!document.body.contains(container)) return;
            const sparkle = document.createElement('div');
            sparkle.className = 'dust-sparkle';
            sparkle.style.left = (Math.random() * 100) + '%';
            sparkle.style.top = (Math.random() * 100) + '%';
            sparkle.style.animationDelay = (Math.random() * 2) + 's';

            layer.appendChild(sparkle);
            setTimeout(() => sparkle.remove(), 4000);

            setTimeout(loop, 200);
        };
        for (let i = 0; i < 20; i++) loop(); // Start with some dust
    }

    startFloatingIconsLoop(container) {
        const emojis = ['🎂', '🎉', '🎈', '🎁', '⭐', '🦖', '🦁', '🦸', '🍭', '🎊', '🎯', '🏆', '💫', '✨', '🌟', '🎪'];
        const loop = () => {
            if (!document.body.contains(container)) return;
            const icon = document.createElement('div');
            icon.className = 'floating-icon';
            icon.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            icon.style.left = (Math.random() * 90 + 5) + '%';
            icon.style.fontSize = (30 + Math.random() * 20) + 'px';

            const duration = 4 + Math.random() * 3;
            icon.style.animationDuration = duration + 's';

            container.appendChild(icon);
            setTimeout(() => icon.remove(), duration * 1000);

            setTimeout(loop, 800 + Math.random() * 1200); // More frequent icons
        };
        // Start with multiple icons immediately
        for (let i = 0; i < 5; i++) {
            setTimeout(() => loop(), i * 300);
        }
    }


    /**
     * Render Logic for Yuval Selection Screen
     */
    async renderYuvalSelection(container) {
        container.innerHTML = `<h1>Yuval Choose your superhero</h1>`;

        const selectionContainer = document.createElement('div');
        selectionContainer.className = 'selection-container';

        // Define options
        const options = [
            { id: 'flash', name: 'yuval_flash' },
            { id: 'batman', name: 'yuval_batman' }
        ];

        for (const option of options) {
            const card = document.createElement('div');
            card.className = 'selection-card';
            card.dataset.id = option.id;

            // Load Asset
            const asset = await AssetLoader.loadMedia('./characters', option.name);
            card.appendChild(asset);

            // Interaction
            card.onclick = () => this.handleYuvalSelection(option.id, card, selectionContainer);

            selectionContainer.appendChild(card);
        }

        container.appendChild(selectionContainer);
    }

    handleYuvalSelection(selectedId, selectedCard, container) {
        if (this.isTransitioning) return;

        // Play character selection sound
        if (window.soundManager) {
            window.soundManager.playSound('characterSelect');
        }

        // 1. Update State
        this.gameState.yuval = selectedId;
        console.log('Yuval selected:', selectedId);

        // 2. UI Feedback
        const allCards = container.querySelectorAll('.selection-card');
        allCards.forEach(card => {
            if (card === selectedCard) {
                card.classList.add('selected');
                this.triggerCelebration(); // Confetti pop!
            } else {
                card.classList.add('disabled');
            }
        });

        // 3. Delay then transition
        this.isTransitioning = true; // Block extra clicks
        setTimeout(() => {
            this.isTransitioning = false; // Reset for next screen
            this.nextScreen();
        }, 1500); // 1.5s delay to enjoy the animation
    }

    /**
     * Render Logic for Or (Brother) Selection Screen
     */
    async renderOrSelection(container) {
        container.innerHTML = `<h1>Or now your time</h1>`;

        const selectionContainer = document.createElement('div');
        selectionContainer.className = 'selection-container';

        // Define options (using filenames from directory listing)
        const options = [
            { id: 'superman', name: 'Or_superman' },
            { id: 'thor', name: 'Or_thor' }
        ];

        for (const option of options) {
            const card = document.createElement('div');
            card.className = 'selection-card';
            card.dataset.id = option.id;

            // Ensure touch events work on mobile
            card.style.touchAction = 'manipulation';

            // Load Asset
            const asset = await AssetLoader.loadMedia('./characters', option.name);
            card.appendChild(asset);

            // Interaction - use both click and touchend for better mobile support
            const handleSelection = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleOrSelection(option.id, card, selectionContainer);
            };

            card.addEventListener('click', handleSelection);
            card.addEventListener('touchend', handleSelection);

            selectionContainer.appendChild(card);
        }

        container.appendChild(selectionContainer);
    }

    async handleOrSelection(selectedId, selectedCard, container) {
        if (this.isTransitioning) return;

        // Play character selection sound
        if (window.soundManager) {
            window.soundManager.playSound('characterSelect');
        }

        // 1. Update State
        this.gameState.or = selectedId;
        console.log('Or selected:', selectedId);

        // 2. UI Feedback
        const allCards = container.querySelectorAll('.selection-card');
        allCards.forEach(card => {
            if (card === selectedCard) {
                card.classList.add('selected');
            } else {
                card.classList.add('disabled');
            }
        });

        this.isTransitioning = true;
        this.triggerCelebration();

        // 3. Show Team-Up Preview (Yuval + Or)
        const yuvalChar = this.gameState.yuval; // 'flash' or 'batman'
        const orChar = selectedId;              // 'superman' or 'thor'

        // Construct filename: e.g. flash_superman
        const teamUpBaseName = `${yuvalChar}_${orChar}`;

        // Slight delay before preview for impact
        setTimeout(async () => {
            await this.showTeamUpPreview(teamUpBaseName, 'Yuval_Or');
        }, 1000);
    }

    /**
     * Render Logic for Mama Selection Screen
     */
    async renderMamaSelection(container) {
        container.innerHTML = `<h1>Choose mama superhero</h1>`;

        const selectionContainer = document.createElement('div');
        selectionContainer.className = 'selection-container';

        // Define options
        const options = [
            { id: 'wonder', name: 'mama_wonder' },
            { id: 'bishop', name: 'mama_bishop' }
        ];

        for (const option of options) {
            const card = document.createElement('div');
            card.className = 'selection-card';
            card.dataset.id = option.id;

            // Load Asset
            const asset = await AssetLoader.loadMedia('./characters', option.name);
            card.appendChild(asset);

            // Interaction
            card.onclick = () => this.handleMamaSelection(option.id, card, selectionContainer);

            selectionContainer.appendChild(card);
        }

        container.appendChild(selectionContainer);
    }

    async handleMamaSelection(selectedId, selectedCard, container) {
        if (this.isTransitioning) return;

        // Play character selection sound
        if (window.soundManager) {
            window.soundManager.playSound('characterSelect');
        }

        // 1. Update State
        this.gameState.mama = selectedId;
        console.log('Mama selected:', selectedId);

        // 2. UI Feedback
        const allCards = container.querySelectorAll('.selection-card');
        allCards.forEach(card => {
            if (card === selectedCard) {
                card.classList.add('selected');
            } else {
                card.classList.add('disabled');
            }
        });

        this.isTransitioning = true;
        this.triggerCelebration();

        // 3. Show Team-Up Preview (Yuval + Mama)
        const yuvalChar = this.gameState.yuval; // 'flash' or 'batman'
        const mamaChar = selectedId;            // 'wonder' or 'bishop'

        // Construct filename: e.g. flash_wonder
        const teamUpBaseName = `${yuvalChar}_${mamaChar}`;

        // Slight delay before preview for impact
        setTimeout(async () => {
            await this.showTeamUpPreview(teamUpBaseName, 'Yuval_mama');
        }, 1000);
    }

    /**
     * Render Logic for Papa Selection Screen
     */
    async renderPapaSelection(container) {
        container.innerHTML = `<h1>Choose papa superhero</h1>`;

        const selectionContainer = document.createElement('div');
        selectionContainer.className = 'selection-container';

        // Define options
        const options = [
            { id: 'hulk', name: 'papa_hulk' },
            { id: 'capitan', name: 'papa_capitan' }
        ];

        for (const option of options) {
            const card = document.createElement('div');
            card.className = 'selection-card';
            card.dataset.id = option.id;

            // Load Asset
            const asset = await AssetLoader.loadMedia('./characters', option.name);
            card.appendChild(asset);

            // Interaction
            card.onclick = () => this.handlePapaSelection(option.id, card, selectionContainer);

            selectionContainer.appendChild(card);
        }

        container.appendChild(selectionContainer);
    }

    async handlePapaSelection(selectedId, selectedCard, container) {
        if (this.isTransitioning) return;

        // Play character selection sound
        if (window.soundManager) {
            window.soundManager.playSound('characterSelect');
        }

        // 1. Update State
        this.gameState.papa = selectedId;
        console.log('Papa selected:', selectedId);

        // 2. UI Feedback
        const allCards = container.querySelectorAll('.selection-card');
        allCards.forEach(card => {
            if (card === selectedCard) {
                card.classList.add('selected');
            } else {
                card.classList.add('disabled');
            }
        });

        this.isTransitioning = true;
        this.triggerCelebration();

        // 3. Show Team-Up Preview (Yuval + Papa)
        const yuvalChar = this.gameState.yuval; // 'flash' or 'batman'
        const papaChar = selectedId;            // 'hulk' or 'capitan'

        // Construct filename: e.g. flash_hulk
        const teamUpBaseName = `${yuvalChar}_${papaChar}`;

        // Slight delay before preview for impact
        setTimeout(async () => {
            await this.showTeamUpPreview(teamUpBaseName, 'Yuval_papa');
        }, 1000);
    }

    /**
     * Render Logic for Team Reveal Screen
     */
    async renderTeamReveal(container) {
        // 1. Get Selections
        const { yuval, or, mama, papa } = this.gameState;

        // 2. Determine Directory & Filename
        // Directory based on Yuval's choice: 'flash_all_team' or 'batman_all_team'
        const directory = yuval === 'flash' ? 'flash_all_team' : 'batman_all_team';

        // Filename: {yuval}_{or}_{mama}_{papa}
        const fileName = `${yuval}_${or}_${mama}_${papa}`;

        console.log(`Loading Team Reveal: ${directory}/${fileName}`);

        // 3. Load Asset
        const asset = await AssetLoader.loadMedia(`./${directory}`, fileName);
        asset.classList.add('team-reveal-asset'); // For specific styling/animation

        // 4. Build Layout
        container.innerHTML = `
            <div class="team-reveal-container">
                <h1 class="reveal-title">Yey we have the team ready!!!</h1>
                <div class="reveal-content"></div>
                <button class="btn-next reveal-btn">BEGIN ADVENTURE</button>
            </div>
        `;

        const contentDiv = container.querySelector('.reveal-content');
        contentDiv.appendChild(asset);

        // 5. Button Interaction
        const btn = container.querySelector('.reveal-btn');
        btn.onclick = () => {
            if (window.soundManager) {
                window.soundManager.playSound('buttonClick');
            }
            this.nextScreen();
        };

        // 6. Magic Effects on Load
        // Ensure video plays
        if (asset.tagName === 'VIDEO') {
            asset.muted = false;
            asset.play().catch(e => console.warn("Video play error", e));
        }

        // Trigger big celebration
        setTimeout(() => {
            this.triggerCelebration();
            // Play celebration sound
            if (window.soundManager) {
                window.soundManager.playSound('celebration');
            }
            // Optional: Secondary burst
            setTimeout(() => this.triggerCelebration(), 500);
        }, 300);
    }

    /**
     * Displays a full-screen team-up preview overlay
     */
    async showTeamUpPreview(baseName, directory) {
        // Play team-up sound
        if (window.soundManager) {
            window.soundManager.playSound('teamUp');
        }

        // Create Overlay
        const overlay = document.createElement('div');
        overlay.className = 'team-preview-overlay';

        const content = document.createElement('div');
        content.className = 'team-preview-content';

        // Load Team-up Asset
        const asset = await AssetLoader.loadMedia(`./${directory}`, baseName);

        // If it's a video, ensure it plays
        if (asset.tagName === 'VIDEO') {
            asset.muted = false; // Optional: Unmute if browsers allow (usually requires interaction)
            // But let's keep muted for safety or try unmuted if we had user interaction
            asset.play().catch(e => console.warn("Video play failed", e));
        }

        content.appendChild(asset);
        overlay.appendChild(content);

        // "Continue" Button (to make it interactive/clear how to proceed)
        const continueBtn = document.createElement('button');
        continueBtn.className = 'btn-next';
        continueBtn.textContent = 'AWESOME!';
        continueBtn.style.marginTop = '20px';
        continueBtn.onclick = () => {
            // Play button click sound
            if (window.soundManager) {
                window.soundManager.playSound('buttonClick');
            }
            // Remove overlay and go next
            overlay.style.opacity = '0';
            setTimeout(() => {
                if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
                this.isTransitioning = false;
                this.nextScreen();
            }, 500);
        };

        overlay.appendChild(continueBtn);
        this.appContainer.appendChild(overlay);

        this.triggerCelebration(); // More confetti for the team up!
    }

    /**
     * Transition to the specified screen
     */
    async showScreen(screenName) {
        if (this.isTransitioning) return;
        this.isTransitioning = true;

        const newScreen = await this.createScreenElement(screenName);
        this.appContainer.appendChild(newScreen);

        // Force reflow to enable transition
        newScreen.offsetHeight;

        // Animate In
        newScreen.classList.add('active');

        // Stop any currently playing audio before playing new screen audio
        if (window.soundManager) {
            window.soundManager.stopCurrentAudio();
        }

        // Play screen-specific audio (screens 1-10)
        const screenAudioMap = {
            'welcome': 1,
            'yuval-selection': 2,
            'or-selection': 3,
            'mama-selection': 4,
            'papa-selection': 5,
            'team-reveal': 6,
            'attraction': 7,
            'restaurant': 9,
            'dessert': 11,
            'final-celebration': 13
        };

        if (screenAudioMap[screenName] && window.soundManager) {
            const audioNumber = screenAudioMap[screenName];
            // Small delay to ensure screen transition is visible before audio starts
            setTimeout(() => {
                // Disable interactions before audio starts
                this.setInteractionsEnabled(false);
                window.soundManager.playAudioFile(audioNumber).catch(err => {
                    console.warn(`Failed to play audio ${audioNumber} for screen ${screenName}:`, err);
                    // Re-enable interactions if audio fails to play
                    this.setInteractionsEnabled(true);
                });
            }, 100);
        } else {
            // If no audio for this screen, ensure interactions are enabled
            this.setInteractionsEnabled(true);
        }

        // Handle Old Screen Removal
        const oldScreen = this.appContainer.querySelector('.screen:not(.active)');

        // If there's an old screen (e.g. we are navigating)
        // Note: The selector above might grab the NEW one if we aren't careful, 
        // so we can keep track of the old one explicitly or assume the one we just added is the only "new" one.
        // Better logic:
        const screens = Array.from(this.appContainer.querySelectorAll('.screen'));
        const previousScreen = screens.find(el => el !== newScreen);

        if (previousScreen) {
            previousScreen.classList.remove('active');
            previousScreen.classList.add('exit');

            // Wait for transition to finish before removing from DOM
            setTimeout(() => {
                if (previousScreen.parentNode) {
                    previousScreen.parentNode.removeChild(previousScreen);
                }
                this.isTransitioning = false;
            }, 500); // Matches CSS transition time
        } else {
            // First load, no transition wait needed
            this.isTransitioning = false;
        }
    }

    nextScreen() {
        if (this.currentScreenIndex < SCREENS.length - 1) {
            this.currentScreenIndex++;
            this.showScreen(SCREENS[this.currentScreenIndex]);
        }
    }

    restartGame() {
        this.currentScreenIndex = 0;
        this.gameState = {
            yuval: null,
            or: null,
            mama: null,
            papa: null,
            restaurant: null,
            attraction: null,
            dessert: null
        };
        this.showScreen(SCREENS[0]);
    }

    /**
     * Trigger a fun confetti explosion!
     */
    triggerCelebration() {
        if (!window.confetti) return;

        // Play confetti sound
        if (window.soundManager) {
            window.soundManager.playSound('confetti');
        }

        // A quick burst of confetti
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#FFD700', '#FF4500', '#00BFFF', '#FFFFFF'], // Matching our theme
            disableForReducedMotion: true
        });
    }
}

// Start the game when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new GameApp();
});



