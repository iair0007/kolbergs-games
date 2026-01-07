/**
 * Asset Loader Utility
 * Handles robust loading of game assets (Images/Videos) with fallbacks.
 * 
 * Strategy:
 * 1. Try to find .mp4 version (preferred)
 * 2. Try to find .png version
 * 3. Handle casing issues (try Capitalized if lowercase fails)
 * 4. Fallback to safe placeholder element
 */
class AssetLoader {

    /**
     * Checks if a URL is reachable via a HEAD request.
     * @param {string} url 
     * @returns {Promise<boolean>}
     */
    /**
     * Checks if a URL is reachable.
     * Strategies:
     * 1. API Fetch (HEAD) - Fast, works on HTTP.
     * 2. Image Object Preload - Works on file:// for images.
     * 3. Video Element Preload - Works on file:// for videos.
     * @param {string} url 
     * @returns {Promise<boolean>}
     */
    static async mediaExists(url) {
        // Method 1: Fetch (Preferred for HTTP)
        if (location.protocol.startsWith('http')) {
            try {
                const response = await fetch(url, { method: 'HEAD' });
                if (response.ok) return true;
                // If 404, specifically return false immediately, don't try DOM
                if (response.status === 404) return false;
            } catch (error) {
                // If fetch fails (e.g. CORS), fall through to DOM methods
            }
        }

        // Method 2: DOM Probe (Works on file:// and for strict CORS)
        return new Promise((resolve) => {
            if (url.match(/\.(jpeg|jpg|gif|png)$/i)) {
                const img = new Image();
                img.onload = () => resolve(true);
                img.onerror = () => resolve(false);
                img.src = url;
            } else if (url.match(/\.(mp4|webm|ogg)$/i)) {
                const video = document.createElement('video');
                // For file://, we must be careful not to trigger full download, just metadata
                video.preload = 'metadata';
                video.onloadedmetadata = () => resolve(true);
                video.onerror = () => resolve(false);
                video.src = url;
            } else {
                resolve(false);
            }
        });
    }

    /**
     * Loads media for a given directory and base filename.
     * Returns a DOM element (Video, Image, or Div Placeholder).
     * 
     * @param {string} directory - e.g. "characters" or "./characters"
     * @param {string} baseName - e.g. "yuval_flash"
     * @returns {Promise<HTMLElement>}
     */
    static async loadMedia(directory, baseName) {
        // Normalize directory (remove trailing slash)
        const dir = directory.replace(/\/$/, "");

        // Generate potential file paths
        // We handle exact match and common casing variations (lower vs Capitalized)
        // explicitly to be resilient against file system casing differences.
        const candidates = [
            { path: `${dir}/${baseName}.mp4`, type: 'video' },
            { path: `${dir}/${baseName}.png`, type: 'image' },
            // Casing fallbacks (e.g. Or_superman vs or_superman)
            { path: `${dir}/${this.capitalize(baseName)}.mp4`, type: 'video' },
            { path: `${dir}/${this.capitalize(baseName)}.png`, type: 'image' }
        ];

        // Known typo fix (specific to this project's constraints)
        // If we are looking for something with 'flash' and it fails, we might want to try 'falsh'
        // But doing this generically is risky. Let's stick to the specific "falsh" case if we see "flash"
        if (baseName.includes('flash')) {
            const typoName = baseName.replace('flash', 'falsh');
            candidates.push({ path: `${dir}/${typoName}.mp4`, type: 'video' });
            candidates.push({ path: `${dir}/${typoName}.png`, type: 'image' });
        }

        // Iterate and find first existing asset
        for (const candidate of candidates) {
            if (await this.mediaExists(candidate.path)) {
                if (candidate.type === 'video') {
                    return this.createVideo(candidate.path);
                } else {
                    return this.createImage(candidate.path);
                }
            }
        }

        // Check if we have a "corrected" path for specific known issues not caught above
        // (Currently covered by the simple casing/typo check above)

        // If all fail, return placeholder
        return this.createPlaceholder(baseName);
    }

    // --- DOM Element Creators ---

    static createVideo(src) {
        const video = document.createElement('video');
        video.src = src;
        video.autoplay = true;
        video.loop = true;
        video.muted = true; // Essential for autoplay
        video.playsInline = true; // Essential for iOS
        video.className = 'game-asset video-asset';

        // Error handling as a second layer of defense
        video.onerror = () => {
            console.error(`Video failed to play: ${src}`);
            video.replaceWith(this.createPlaceholder(src));
        };

        return video;
    }

    static createImage(src) {
        const img = document.createElement('img');
        img.src = src;
        img.alt = `Game Asset: ${src}`;
        img.className = 'game-asset image-asset';

        img.onerror = () => {
            console.error(`Image failed to load: ${src}`);
            img.replaceWith(this.createPlaceholder(src));
        };

        return img;
    }

    static createPlaceholder(text) {
        const div = document.createElement('div');
        div.className = 'game-asset placeholder-asset';
        div.innerHTML = `
            <div class="placeholder-icon">?</div>
            <div class="placeholder-text">${text}</div>
        `;
        return div;
    }

    // --- Helpers ---

    static capitalize(str) {
        // Capitalize first letter of the string (e.g. "or_superman" -> "Or_superman")
        // Just a simple heuristic for the directory names we saw
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}
