/**
 * Platform Resize Utility
 * 
 * This utility provides automatic canvas resizing for canvas-based games.
 * It ensures the canvas scales to fit the viewport while preserving aspect ratio
 * and maintaining crisp rendering on retina displays.
 * 
 * Usage:
 * 
 * For canvas-based games:
 * 
 * ```javascript
 * // Import this script in your HTML
 * // <script src="../../platform/resize.js"></script>
 * 
 * // Get your canvas element
 * const canvas = document.getElementById('game-canvas');
 * 
 * // Initialize auto-resize with your design resolution
 * const resizer = new CanvasResizer(canvas, {
 *   designWidth: 1280,
 *   designHeight: 720,
 *   maintainAspectRatio: true
 * });
 * 
 * // The resizer will automatically handle:
 * // - Window resize events
 * // - Orientation changes
 * // - Device pixel ratio (retina displays)
 * 
 * // To manually trigger a resize:
 * resizer.resize();
 * 
 * // To stop auto-resizing:
 * resizer.destroy();
 * ```
 * 
 * See specs/responsive-layout.md for full documentation.
 */

class CanvasResizer {
    /**
     * Create a new CanvasResizer
     * @param {HTMLCanvasElement} canvas - The canvas element to resize
     * @param {Object} options - Configuration options
     * @param {number} options.designWidth - Design resolution width (default: 1280)
     * @param {number} options.designHeight - Design resolution height (default: 720)
     * @param {boolean} options.maintainAspectRatio - Whether to maintain aspect ratio (default: true)
     * @param {boolean} options.useDevicePixelRatio - Whether to use device pixel ratio for crisp rendering (default: true)
     */
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.options = {
            designWidth: options.designWidth || 1280,
            designHeight: options.designHeight || 720,
            maintainAspectRatio: options.maintainAspectRatio !== false,
            useDevicePixelRatio: options.useDevicePixelRatio !== false
        };

        // Calculate design aspect ratio
        this.designAspectRatio = this.options.designWidth / this.options.designHeight;

        // Bind event handlers
        this.handleResize = this.resize.bind(this);
        this.handleOrientationChange = this.resize.bind(this);

        // Set up event listeners
        this.setupEventListeners();

        // Initial resize
        this.resize();
    }

    /**
     * Set up event listeners for resize and orientation change
     */
    setupEventListeners() {
        window.addEventListener('resize', this.handleResize);
        window.addEventListener('orientationchange', this.handleOrientationChange);
        
        // Also listen for fullscreen changes
        document.addEventListener('fullscreenchange', this.handleResize);
        document.addEventListener('webkitfullscreenchange', this.handleResize);
    }

    /**
     * Calculate the optimal canvas size based on viewport and design resolution
     */
    calculateSize() {
        // Get viewport size (accounting for safe areas if possible)
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let canvasWidth, canvasHeight;

        if (this.options.maintainAspectRatio) {
            // Calculate aspect ratio of viewport
            const viewportAspectRatio = viewportWidth / viewportHeight;

            if (viewportAspectRatio > this.designAspectRatio) {
                // Viewport is wider than design - fit to height
                canvasHeight = viewportHeight;
                canvasWidth = canvasHeight * this.designAspectRatio;
            } else {
                // Viewport is taller than design - fit to width
                canvasWidth = viewportWidth;
                canvasHeight = canvasWidth / this.designAspectRatio;
            }
        } else {
            // Fill viewport completely
            canvasWidth = viewportWidth;
            canvasHeight = viewportHeight;
        }

        return {
            displayWidth: Math.floor(canvasWidth),
            displayHeight: Math.floor(canvasHeight)
        };
    }

    /**
     * Resize the canvas to fit the viewport
     */
    resize() {
        const { displayWidth, displayHeight } = this.calculateSize();

        // Get device pixel ratio for crisp rendering on retina displays
        const dpr = this.options.useDevicePixelRatio ? (window.devicePixelRatio || 1) : 1;

        // Set canvas CSS size (what the user sees)
        this.canvas.style.width = `${displayWidth}px`;
        this.canvas.style.height = `${displayHeight}px`;

        // Set canvas internal size (accounting for device pixel ratio)
        this.canvas.width = displayWidth * dpr;
        this.canvas.height = displayHeight * dpr;

        // Scale the canvas context to account for device pixel ratio
        const ctx = this.canvas.getContext('2d');
        if (ctx) {
            ctx.scale(dpr, dpr);
        }

        // Dispatch custom event for game logic to respond to resize
        const event = new CustomEvent('canvasresized', {
            detail: {
                displayWidth,
                displayHeight,
                canvasWidth: this.canvas.width,
                canvasHeight: this.canvas.height,
                devicePixelRatio: dpr
            }
        });
        this.canvas.dispatchEvent(event);
    }

    /**
     * Clean up event listeners
     */
    destroy() {
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('orientationchange', this.handleOrientationChange);
        document.removeEventListener('fullscreenchange', this.handleResize);
        document.removeEventListener('webkitfullscreenchange', this.handleResize);
    }
}

/**
 * Helper function to create and initialize a canvas resizer
 * @param {string|HTMLCanvasElement} canvasSelector - Canvas element or selector
 * @param {Object} options - Configuration options (see CanvasResizer constructor)
 * @returns {CanvasResizer} The created resizer instance
 */
function createCanvasResizer(canvasSelector, options = {}) {
    const canvas = typeof canvasSelector === 'string' 
        ? document.querySelector(canvasSelector)
        : canvasSelector;

    if (!canvas) {
        throw new Error(`Canvas not found: ${canvasSelector}`);
    }

    if (!(canvas instanceof HTMLCanvasElement)) {
        throw new Error('Provided element is not a canvas');
    }

    return new CanvasResizer(canvas, options);
}

// Export for use in modules (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CanvasResizer, createCanvasResizer };
}

// Make available globally
window.CanvasResizer = CanvasResizer;
window.createCanvasResizer = createCanvasResizer;
