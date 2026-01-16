# Responsive Layout Specification

**Version:** 1.0  
**Status:** Active  
**Last Updated:** 2026-01-16

## Overview

This specification defines the platform-level responsive layout contract that ensures all games render correctly on desktop, tablet, and mobile devices without clipping, cut-off UI, or scrollbars.

All games MUST follow this specification to guarantee proper rendering across all devices and orientations.

## Goals

1. **No Clipping**: Game content must be fully visible on all screen sizes
2. **No Scrollbars**: Games should fill the viewport without requiring scrolling
3. **Orientation Support**: Games must handle portrait and landscape orientations
4. **Safe Area Support**: Games must respect device notches and safe areas (iOS, Android)
5. **Platform-Level Guarantee**: All future games automatically inherit responsive behavior

## Requirements

### 1. Viewport Meta Tag

Every game's `index.html` MUST include this viewport meta tag:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
```

**Key attributes:**
- `width=device-width` - Use device's actual width
- `initial-scale=1.0` - No initial zoom
- `viewport-fit=cover` - Extend into safe areas (for notch support)

**Do NOT use:**
- `maximum-scale=1.0` or `user-scalable=no` (accessibility issue)

### 2. Platform Responsive CSS

Every game MUST include the platform responsive CSS file:

```html
<link rel="stylesheet" href="../../platform/responsive.css">
```

This file MUST be included **before** the game's own CSS file to ensure proper cascade.

**What it provides:**
- Full viewport sizing using modern viewport units (`svh`, `dvh`)
- Safe area padding for notches using `env(safe-area-inset-*)`
- Overflow prevention
- Orientation change handling
- Touch interaction fixes for mobile
- Responsive utility classes

### 3. Game Root Container

Every game MUST render inside a single root container with one of these IDs:
- `#app` (preferred for this platform)
- `#game-root`
- `#game-container`

The platform responsive CSS automatically styles these containers to:
- Fill the viewport (100% width and height)
- Prevent overflow
- Center content
- Use flexbox for layout

**Example:**
```html
<body>
  <div id="app"></div>
  <script src="main.js"></script>
</body>
```

### 4. Game Type Specific Requirements

#### For DOM-Based Games (like yuval-birthday)

DOM-based games use HTML elements for layout (divs, images, etc.).

**Requirements:**
1. Use relative units (`%`, `rem`, `em`) instead of fixed `px` where possible
2. Use `max-width` and `max-height` instead of fixed dimensions
3. Use flexbox or grid for responsive layouts
4. Avoid fixed heights that exceed viewport
5. Use `object-fit: contain` for images/videos

**Example:**
```css
.game-asset {
    max-width: 100%;
    max-height: 50vh; /* or 50svh for mobile */
    object-fit: contain;
}

.selection-container {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    max-width: 100%;
}
```

#### For Canvas-Based Games (future)

Canvas-based games render to a `<canvas>` element.

**Requirements:**
1. Use the platform resize utility: `platform/resize.js`
2. Define a design resolution (e.g., 1280x720)
3. Let the resize utility handle scaling and device pixel ratio
4. Listen for `canvasresized` events to update game logic

**Example:**
```html
<canvas id="game-canvas" class="game-canvas"></canvas>
<script src="../../platform/resize.js"></script>
<script>
  const canvas = document.getElementById('game-canvas');
  const resizer = new CanvasResizer(canvas, {
    designWidth: 1280,
    designHeight: 720,
    maintainAspectRatio: true
  });
  
  canvas.addEventListener('canvasresized', (e) => {
    // Update game logic with new dimensions
    console.log('Canvas resized:', e.detail);
  });
</script>
```

### 5. Viewport Units

**Preferred units for height:**
- `svh` (small viewport height) - Accounts for mobile browser chrome
- `dvh` (dynamic viewport height) - Adjusts as browser chrome shows/hides
- `vh` (viewport height) - Fallback for older browsers

**Usage:**
```css
/* Good - uses modern units with fallback */
.container {
    height: 100vh;        /* Fallback */
    height: 100svh;       /* Modern browsers */
}

/* Better - let platform CSS handle it */
.container {
    height: 100%;         /* Inherit from parent */
}
```

### 6. Safe Areas (Notches)

For elements that need spacing from screen edges:

**Use platform utility classes:**
```html
<div class="safe-padding">
  <!-- Content will have safe spacing from notches -->
</div>
```

**Or use CSS directly:**
```css
.my-element {
    padding-top: max(20px, env(safe-area-inset-top));
    padding-bottom: max(20px, env(safe-area-inset-bottom));
}
```

## Platform Files

### platform/responsive.css

Core responsive layout CSS. Handles:
- Viewport sizing (html, body)
- Game root containers (#app, #game-root, #game-container)
- Safe area padding
- Overflow prevention
- Responsive utilities
- Accessibility (reduced motion, focus indicators)

**All games MUST include this file.**

### platform/resize.js

Canvas resize utility for canvas-based games. Handles:
- Automatic canvas resizing on viewport changes
- Aspect ratio preservation
- Device pixel ratio (retina displays)
- Orientation changes

**Canvas-based games MUST use this utility.**

## Testing Checklist

Before deploying a game, test on:

### Desktop
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Different window sizes (resize browser)

### Tablet
- [ ] iPad (Safari) - Portrait and Landscape
- [ ] Android Tablet (Chrome) - Portrait and Landscape

### Mobile
- [ ] iPhone (Safari) - Portrait and Landscape
  - [ ] iPhone SE (small screen)
  - [ ] iPhone 14 Pro (notch)
  - [ ] iPhone 14 Pro Max (large screen)
- [ ] Android Phone (Chrome) - Portrait and Landscape
  - [ ] Small screen (360x640)
  - [ ] Large screen (412x915)

### Browser DevTools Testing

Use Chrome DevTools device emulation:

1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M / Cmd+Shift+M)
3. Test these presets:
   - iPhone SE (375x667)
   - iPhone 12 Pro (390x844)
   - iPad Air (820x1180)
   - Galaxy S20 (360x800)
4. Test both portrait and landscape
5. Check for:
   - [ ] No horizontal scrollbar
   - [ ] No vertical scrollbar
   - [ ] All UI elements visible
   - [ ] No clipped content
   - [ ] Proper spacing from edges

### Real Device Testing

**Recommended:**
- Test on at least one real iOS device
- Test on at least one real Android device
- Test orientation changes (rotate device)
- Test with different browser chrome states (address bar visible/hidden)

## Common Issues and Solutions

### Issue: Content clipped on mobile

**Cause:** Using `100vh` which doesn't account for mobile browser chrome  
**Solution:** Use `100svh` or let platform CSS handle it with `height: 100%`

### Issue: Horizontal scrollbar on mobile

**Cause:** Fixed width elements wider than viewport  
**Solution:** Use `max-width: 100%` and responsive units

### Issue: UI cut off by notch

**Cause:** Not using safe area insets  
**Solution:** Use `env(safe-area-inset-*)` or platform utility classes

### Issue: Content too small on mobile

**Cause:** Fixed pixel sizes designed for desktop  
**Solution:** Use responsive units (`rem`, `em`, `%`) and media queries

### Issue: Canvas blurry on retina displays

**Cause:** Not accounting for device pixel ratio  
**Solution:** Use `CanvasResizer` with `useDevicePixelRatio: true`

## Migration Guide

To migrate an existing game to this specification:

1. **Update HTML:**
   ```html
   <!-- Add/update viewport meta tag -->
   <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
   
   <!-- Include platform responsive CSS BEFORE game CSS -->
   <link rel="stylesheet" href="../../platform/responsive.css">
   <link rel="stylesheet" href="styles.css">
   ```

2. **Update CSS:**
   ```css
   /* Remove redundant rules now handled by platform CSS */
   /* DELETE:
   html, body {
       margin: 0;
       padding: 0;
       width: 100%;
       height: 100%;
       overflow: hidden;
   }
   */
   
   /* Keep only game-specific styling */
   html, body {
       background-color: var(--color-primary);
       font-family: var(--font-main);
   }
   ```

3. **Test thoroughly** using the testing checklist above

4. **Document any game-specific responsive behavior** in the game's README

## Future Enhancements

Potential future additions to this specification:

- Fullscreen API support
- Screen orientation locking
- PWA viewport considerations
- VR/AR viewport handling
- Multi-monitor support

## References

- [MDN: Viewport meta tag](https://developer.mozilla.org/en-US/docs/Web/HTML/Viewport_meta_tag)
- [MDN: env()](https://developer.mozilla.org/en-US/docs/Web/CSS/env)
- [CSS Viewport Units](https://developer.mozilla.org/en-US/docs/Web/CSS/length#viewport-percentage_lengths)
- [Safe Area Insets](https://webkit.org/blog/7929/designing-websites-for-iphone-x/)

## Version History

- **1.0** (2026-01-16): Initial specification
  - Platform responsive CSS
  - Canvas resize utility
  - Viewport meta tag requirements
  - Safe area support
  - Testing checklist
