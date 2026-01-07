/**
 * Sound Manager for Yuval's Birthday Adventure
 * Generates sounds programmatically using Web Audio API - no files needed!
 * 
 * Features:
 * - Programmatically generated child-friendly sounds
 * - Volume controls
 * - No external dependencies or files required
 */

class SoundManager {
    constructor() {
        this.audioContext = null;
        this.sfxVolume = 0.6; // 60% volume for sound effects
        this.sfxEnabled = true;
        this.audioFiles = new Map(); // Cache for loaded audio files
        this.currentPlayingAudio = null; // Track currently playing audio
        this.soundEffectsMuted = false; // Temporarily mute all sound effects, keep audio files
        this.isAudioPlaying = false; // Track if audio is currently playing
        this.onAudioStateChange = null; // Callback for audio state changes

        // Initialize audio context (will be activated on first user interaction)
        this.initAudioContext();
    }

    /**
     * Initialize Web Audio API context
     */
    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not available');
        }
    }

    /**
     * Ensure audio context is running (required after user interaction)
     */
    async ensureAudioContext() {
        if (!this.audioContext) {
            this.initAudioContext();
        }
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }

    /**
     * Generate a simple beep sound
     * @param {number} frequency - Frequency in Hz
     * @param {number} duration - Duration in seconds
     * @param {string} type - Wave type: 'sine', 'square', 'sawtooth', 'triangle'
     * @param {number} volume - Volume 0-1
     */
    playTone(frequency, duration = 0.1, type = 'sine', volume = null) {
        if (!this.sfxEnabled || !this.audioContext) return;

        this.ensureAudioContext();

        const osc = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        osc.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        osc.frequency.value = frequency;
        osc.type = type;

        const vol = volume !== null ? volume : this.sfxVolume;
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(vol * 0.3, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + duration);
    }

    /**
     * Generate a chord (multiple frequencies)
     */
    playChord(frequencies, duration = 0.2, type = 'sine', volume = null) {
        if (!this.sfxEnabled || !this.audioContext) return;

        this.ensureAudioContext();

        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.playTone(freq, duration, type, volume);
            }, index * 0.02);
        });
    }

    /**
     * Generate a sweep sound (frequency changes over time)
     */
    playSweep(startFreq, endFreq, duration = 0.3, volume = null) {
        if (!this.sfxEnabled || !this.audioContext) return;

        this.ensureAudioContext();

        const osc = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        osc.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        osc.frequency.setValueAtTime(startFreq, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(endFreq, this.audioContext.currentTime + duration);
        osc.type = 'sine';

        const vol = volume !== null ? volume : this.sfxVolume;
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(vol * 0.3, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + duration);
    }

    /**
     * Play a sound effect by name
     */
    playSound(name, options = {}) {
        // Temporarily muted - only audio files play
        if (this.soundEffectsMuted) return;

        if (!this.sfxEnabled) return;

        this.ensureAudioContext();

        const volume = options.volume !== undefined ? options.volume : this.sfxVolume;

        switch (name) {
            case 'buttonClick':
                // Short, pleasant click
                this.playTone(800, 0.05, 'sine', volume);
                break;

            case 'buttonHover':
                // Gentle hover sound
                this.playTone(600, 0.03, 'sine', volume * 0.5);
                break;

            case 'characterSelect':
                // Upward sweep - success sound
                this.playSweep(400, 800, 0.2, volume);
                this.playTone(600, 0.1, 'sine', volume * 0.7);
                break;

            case 'teamUp':
                // Triumphant chord
                this.playChord([523, 659, 784], 0.3, 'sine', volume); // C, E, G
                break;

            case 'mathCorrect':
                // Success fanfare
                this.playTone(523, 0.1, 'sine', volume); // C
                setTimeout(() => this.playTone(659, 0.1, 'sine', volume), 50); // E
                setTimeout(() => this.playTone(784, 0.2, 'sine', volume), 100); // G
                break;

            case 'mathWrong':
                // Downward sad sound
                this.playSweep(400, 200, 0.3, volume);
                break;

            case 'mathQuestion':
                // Question mark sound
                this.playTone(600, 0.15, 'sine', volume);
                setTimeout(() => this.playTone(700, 0.15, 'sine', volume), 100);
                break;

            case 'enemyAppear':
                // Ominous but not scary
                this.playSweep(200, 300, 0.4, volume * 0.6);
                break;

            case 'enemyDefeat':
                // Victory sound
                this.playChord([523, 659, 784, 1047], 0.4, 'sine', volume);
                break;

            case 'dragonRoar':
                // Low rumble (not scary)
                this.playSweep(150, 100, 0.5, volume * 0.5);
                this.playTone(120, 0.3, 'sawtooth', volume * 0.3);
                break;

            case 'robotBeep':
                // Friendly robot beep
                this.playTone(800, 0.1, 'square', volume);
                setTimeout(() => this.playTone(1000, 0.1, 'square', volume), 100);
                break;

            case 'celebration':
                // Big celebration chord
                this.playChord([523, 659, 784, 988], 0.5, 'sine', volume);
                setTimeout(() => {
                    this.playChord([659, 784, 988, 1175], 0.4, 'sine', volume);
                }, 200);
                break;

            case 'confetti':
                // Sparkly sound
                for (let i = 0; i < 5; i++) {
                    setTimeout(() => {
                        this.playTone(800 + Math.random() * 400, 0.1, 'sine', volume * 0.4);
                    }, i * 30);
                }
                break;

            case 'firework':
                // Pop and sparkle
                this.playSweep(400, 1000, 0.1, volume);
                setTimeout(() => {
                    for (let i = 0; i < 3; i++) {
                        setTimeout(() => {
                            this.playTone(600 + Math.random() * 600, 0.15, 'sine', volume * 0.5);
                        }, i * 50);
                    }
                }, 100);
                break;

            case 'screenTransition':
                // Gentle transition
                this.playSweep(300, 500, 0.2, volume * 0.5);
                break;

            default:
                // Default beep
                this.playTone(600, 0.1, 'sine', volume);
        }
    }


    /**
     * Sets sound effects volume
     */
    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
    }

    /**
     * Enables or disables sound effects
     */
    setSfxEnabled(enabled) {
        this.sfxEnabled = enabled;
    }

    /**
     * Load an audio file from the audio directory
     * @param {number} fileNumber - The number of the audio file (1-13)
     * @returns {Promise<HTMLAudioElement>}
     */
    async loadAudioFile(fileNumber) {
        if (this.audioFiles.has(fileNumber)) {
            return this.audioFiles.get(fileNumber);
        }

        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.preload = 'auto';

            audio.addEventListener('canplaythrough', () => {
                this.audioFiles.set(fileNumber, audio);
                resolve(audio);
            }, { once: true });

            audio.addEventListener('error', () => {
                console.warn(`Audio file ${fileNumber}.m4a failed to load`);
                resolve(null);
            }, { once: true });

            audio.src = `./audio/${fileNumber}.m4a`;
            audio.load();
        });
    }

    /**
     * Stop currently playing audio file
     */
    stopCurrentAudio() {
        if (this.currentPlayingAudio) {
            try {
                this.currentPlayingAudio.pause();
                this.currentPlayingAudio.currentTime = 0;
                this.currentPlayingAudio.remove();
            } catch (e) {
                console.warn('Error stopping audio:', e);
            }
            this.currentPlayingAudio = null;
            this.isAudioPlaying = false;
            if (this.onAudioStateChange) {
                this.onAudioStateChange(false);
            }
        }
    }

    /**
     * Check if audio is currently playing
     */
    getAudioPlaying() {
        return this.isAudioPlaying;
    }

    /**
     * Set callback for audio state changes
     */
    setAudioStateChangeCallback(callback) {
        this.onAudioStateChange = callback;
    }

    /**
     * Play an audio file by number
     * @param {number} fileNumber - The number of the audio file (1-13)
     * @param {object} options - Options: volume (0-1), loop (boolean), stopPrevious (boolean, default true)
     * @returns {HTMLAudioElement|null}
     */
    async playAudioFile(fileNumber, options = {}) {
        if (!this.sfxEnabled) return null;

        // Stop previous audio if stopPrevious is true (default)
        if (options.stopPrevious !== false) {
            this.stopCurrentAudio();
        }

        await this.ensureAudioContext();

        const audio = await this.loadAudioFile(fileNumber);
        if (!audio) {
            console.warn(`Audio file ${fileNumber} not available`);
            return null;
        }

        // Clone the audio for overlapping sounds
        const audioClone = audio.cloneNode();
        audioClone.volume = (options.volume !== undefined ? options.volume : this.sfxVolume);
        audioClone.loop = options.loop || false;

        // Track this as the current playing audio
        this.currentPlayingAudio = audioClone;

        // Set up event listeners for audio state tracking
        const handlePlay = () => {
            this.isAudioPlaying = true;
            if (this.onAudioStateChange) {
                this.onAudioStateChange(true);
            }
        };

        const handleEnded = () => {
            if (this.currentPlayingAudio === audioClone) {
                this.currentPlayingAudio = null;
                this.isAudioPlaying = false;
                if (this.onAudioStateChange) {
                    this.onAudioStateChange(false);
                }
            }
            audioClone.remove();
        };

        const handlePause = () => {
            this.isAudioPlaying = false;
            if (this.onAudioStateChange) {
                this.onAudioStateChange(false);
            }
        };

        audioClone.addEventListener('play', handlePlay, { once: true });
        audioClone.addEventListener('pause', handlePause, { once: true });

        const playPromise = audioClone.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                handlePlay();
            }).catch(error => {
                console.warn(`Audio file ${fileNumber} play prevented:`, error);
            });
        }

        // Clean up when done (if not looping)
        if (!options.loop) {
            audioClone.addEventListener('ended', handleEnded, { once: true });
        } else {
            // For looping audio, track pause/stop manually
            audioClone.addEventListener('pause', handlePause);
            audioClone.addEventListener('ended', handleEnded, { once: true });
        }

        return audioClone;
    }

    /**
     * Preloads all game sounds (no-op for generated sounds, but kept for API compatibility)
     */
    async preloadAllSounds() {
        // Sounds are generated on-the-fly, so nothing to preload
        // But we ensure audio context is ready
        await this.ensureAudioContext();
        console.log('Sound system ready (programmatically generated sounds + audio files)');
    }
}

// Create global sound manager instance
window.soundManager = new SoundManager();

// Activate audio context on first user interaction (required by browsers)
document.addEventListener('click', () => {
    if (window.soundManager && window.soundManager.audioContext) {
        window.soundManager.ensureAudioContext();
    }
}, { once: true });
