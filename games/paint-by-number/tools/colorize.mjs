/**
 * Line art → colored illustration → paint-by-number grid.
 *
 * The coloring-book pages are black outlines on white, so quantizing them
 * directly just yields greys. Instead:
 *   1. threshold the ink,
 *   2. flood-fill every enclosed white region,
 *   3. give each region the color of the nearest seed point (a Voronoi over
 *      seeds, but respecting the drawn outlines),
 *   4. render the colored art, downsample, and snap to the seed palette.
 *
 *   node colorize.mjs <spec.json> [--diag]
 */
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'fs';

/* ── Project limits (CLAUDE.md) ─────────────────────────────
   A child picks from this palette and paints every square, so both caps
   are hard: 12 colors, 1024 squares. Refuse rather than ship past them. */
const MAX_COLORS = 12;
const MAX_SQUARES = 1024;

function enforceLimits(name, n, colorCount) {
    const squares = n * n;
    const problems = [];
    if (colorCount > MAX_COLORS) problems.push(`${colorCount} colors (max ${MAX_COLORS})`);
    if (squares > MAX_SQUARES)   problems.push(`${squares} squares (max ${MAX_SQUARES}, i.e. 32x32)`);
    if (problems.length) {
        console.error(`\n${name} exceeds the project limits: ${problems.join(', ')}`);
        console.error('Reduce the color count or the grid size and run again.\n');
        process.exit(1);
    }
}


const OUT = '/tmp/claude-0/-home-user-kolbergs-games/fa7e2146-2df9-50f3-882a-e3267a47c66f/scratchpad';
const spec = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const diag = process.argv.includes('--diag');

const b64 = fs.readFileSync(spec.image).toString('base64');
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent('<body style="margin:0"></body>');

const result = await page.evaluate(async ({ dataUrl, spec, diag }) => {
    const img = new Image();
    img.src = dataUrl;
    await img.decode();

    const W = img.naturalWidth, H = img.naturalHeight;
    const full = document.createElement('canvas');
    full.width = W; full.height = H;
    const fctx = full.getContext('2d');
    fctx.drawImage(img, 0, 0);
    const src = fctx.getImageData(0, 0, W, H).data;

    /* ── 1. ink mask ───────────────────────────────────────── */
    const inkT = spec.inkThreshold ?? 118;
    let ink = new Uint8Array(W * H);
    for (let i = 0; i < W * H; i++) {
        const lum = 0.299 * src[i * 4] + 0.587 * src[i * 4 + 1] + 0.114 * src[i * 4 + 2];
        ink[i] = lum < inkT ? 1 : 0;
    }

    /* Dilate the ink so hairline gaps close — otherwise a fill escapes an
       outline and swallows half the drawing. */
    for (let pass = 0; pass < (spec.dilate ?? 1); pass++) {
        const grown = new Uint8Array(W * H);
        for (let y = 0; y < H; y++) {
            for (let x = 0; x < W; x++) {
                const i = y * W + x;
                if (ink[i] ||
                    (x > 0 && ink[i - 1]) || (x < W - 1 && ink[i + 1]) ||
                    (y > 0 && ink[i - W]) || (y < H - 1 && ink[i + W])) grown[i] = 1;
            }
        }
        ink = grown;
    }

    /* ── 2. flood-fill regions over non-ink pixels ─────────── */
    const region = new Int32Array(W * H).fill(-1);
    const cx = [], cy = [], area = [];
    const stack = new Int32Array(W * H);
    let nRegions = 0;
    for (let start = 0; start < W * H; start++) {
        if (ink[start] || region[start] !== -1) continue;
        const id = nRegions++;
        let sp = 0, sx = 0, sy = 0, n = 0;
        stack[sp++] = start;
        region[start] = id;
        while (sp > 0) {
            const p = stack[--sp];
            const px = p % W, py = (p / W) | 0;
            sx += px; sy += py; n++;
            if (px > 0     && !ink[p - 1] && region[p - 1] === -1) { region[p - 1] = id; stack[sp++] = p - 1; }
            if (px < W - 1 && !ink[p + 1] && region[p + 1] === -1) { region[p + 1] = id; stack[sp++] = p + 1; }
            if (py > 0     && !ink[p - W] && region[p - W] === -1) { region[p - W] = id; stack[sp++] = p - W; }
            if (py < H - 1 && !ink[p + W] && region[p + W] === -1) { region[p + W] = id; stack[sp++] = p + W; }
        }
        cx.push(sx / n); cy.push(sy / n); area.push(n);
    }

    /* ── 3. each region takes the nearest seed's color ─────── */
    const seeds = spec.seeds.map(s => ({ x: Math.round(s[0] * W), y: Math.round(s[1] * H), hex: s[2], label: s[3] || '' }));

    /* Thickened outlines make it easy to drop a seed onto a line. Nudge any
       such seed to the nearest open pixel instead of silently losing it. */
    const nudged = [];
    seeds.forEach((s, i) => {
        if (!ink[s.y * W + s.x]) return;
        const maxR = Math.round(Math.max(W, H) * 0.02);
        let found = false;
        for (let r = 1; r <= maxR && !found; r++) {
            for (let dy = -r; dy <= r && !found; dy++) {
                for (let dx = -r; dx <= r && !found; dx++) {
                    if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
                    const nx = s.x + dx, ny = s.y + dy;
                    if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
                    if (ink[ny * W + nx]) continue;
                    s.x = nx; s.y = ny; found = true;
                    nudged.push(`#${i} ${s.label} → (${(nx / W).toFixed(3)}, ${(ny / H).toFixed(3)})`);
                }
            }
        }
        if (!found) nudged.push(`#${i} ${s.label} — STUCK ON INK`);
    });

    /* A seed owns the region its own pixel sits in — centroids lie about big
       wrap-around regions (the background's centre lands on a character). */
    const regionHex = new Array(nRegions).fill(null);
    const claimedBy = new Array(nRegions).fill(null);
    const report = [];
    seeds.forEach((s, i) => {
        /* Bounded seeds paint locally in pass 3b — they must never claim a
           whole region, or a horn ends up owning the sky. */
        if (spec.seeds[i][4]) { report.push({ i, label: s.label, status: 'ok', area: 0 }); return; }
        const p = s.y * W + s.x;
        const r = region[p];
        if (r < 0) { report.push({ i, label: s.label, status: 'ON INK' }); return; }
        if (regionHex[r] !== null) {
            report.push({ i, label: s.label, status: 'taken by "' + claimedBy[r] + '"', area: area[r] });
            return;
        }
        regionHex[r] = s.hex;
        claimedBy[r] = s.label;
        report.push({ i, label: s.label, status: 'ok', area: area[r] });
    });
    /* Everything the seeds did not name — scale plates, folds, small gaps —
       takes the nearest seed by distance. */
    for (let r = 0; r < nRegions; r++) {
        if (regionHex[r] !== null) continue;
        /* A large unseeded region is background almost every time — the
           drawing's open outlines split the sky into several pieces. */
        if (spec.bigDefault && area[r] > (spec.bigArea ?? 2500)) { regionHex[r] = spec.bigDefault; continue; }
        let best = 0, bd = Infinity;
        for (let s = 0; s < seeds.length; s++) {
            const dx = cx[r] - seeds[s].x, dy = cy[r] - seeds[s].y;
            const d = dx * dx + dy * dy;
            if (d < bd) { bd = d; best = s; }
        }
        regionHex[r] = seeds[best].hex;
    }

    /* Bounded seeds: where the artist left an outline open (hair strands,
       flame tips), the area is fused to the background and no whole-region
       claim can separate it. A seed with a radius fills outward from its own
       pixel, stopping at ink and at the radius — a local override. */
    const overrideHex = new Array(W * H).fill(null);
    seeds.forEach((s, i) => {
        const radius = spec.seeds[i][4];
        if (!radius) return;
        const R = radius * Math.max(W, H);
        const R2 = R * R;
        const start = s.y * W + s.x;
        if (ink[start]) return;
        const seen = new Uint8Array(W * H);
        const q = [start];
        seen[start] = 1;
        let filled = 0;
        for (let head = 0; head < q.length; head++) {
            const p = q[head];
            const px = p % W, py = (p / W) | 0;
            overrideHex[p] = s.hex;
            filled++;
            const nb = [px > 0 ? p - 1 : -1, px < W - 1 ? p + 1 : -1,
                        py > 0 ? p - W : -1, py < H - 1 ? p + W : -1];
            for (const np of nb) {
                if (np < 0 || seen[np] || ink[np]) continue;
                const nx = np % W, ny = (np / W) | 0;
                const dx = nx - s.x, dy = ny - s.y;
                if (dx * dx + dy * dy > R2) continue;
                seen[np] = 1;
                q.push(np);
            }
        }
        report[i].bounded = filled;
    });

    /* ── 4. paint the full-res image ───────────────────────── */
    const hexToRgb = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    const inkRgb = hexToRgb(spec.inkColor || '#2b2b33');
    const regionRgb = regionHex.map(hexToRgb);
    const overrideRgb = overrideHex.map(h => h && hexToRgb(h));

    const outImg = fctx.createImageData(W, H);
    for (let i = 0; i < W * H; i++) {
        const c = ink[i] ? inkRgb : (overrideRgb[i] || regionRgb[region[i]]);
        outImg.data[i * 4] = c[0];
        outImg.data[i * 4 + 1] = c[1];
        outImg.data[i * 4 + 2] = c[2];
        outImg.data[i * 4 + 3] = 255;
    }
    fctx.putImageData(outImg, 0, 0);

    if (diag) {
        /* mark the seeds so misplaced ones are obvious */
        fctx.lineWidth = 3;
        seeds.forEach((s, i) => {
            fctx.strokeStyle = '#ff00ff';
            fctx.beginPath(); fctx.arc(s.x, s.y, 9, 0, Math.PI * 2); fctx.stroke();
            fctx.fillStyle = '#ff00ff';
            fctx.font = 'bold 15px sans-serif';
            fctx.fillText(String(i), s.x + 11, s.y + 5);
        });
    }
    const colorizedUrl = full.toDataURL('image/png');

    /* ── 5. downsample by MAJORITY VOTE ────────────────────
       Averaging is wrong for line art: a black outline blended with blue
       averages to a purple that snaps to some unrelated palette entry, and
       at 44 squares the linework swamps the picture. Each output square
       instead takes the color most of its source pixels actually are, with
       the outlines abstaining unless they dominate the square outright. */
    const N = spec.n;
    const palette = [];
    const pushHex = h => { if (!palette.includes(h)) palette.push(h); };
    pushHex(spec.inkColor || '#2b2b33');
    spec.seeds.forEach(s => pushHex(s[2]));
    if (spec.bigDefault) pushHex(spec.bigDefault);
    const idxOf = new Map(palette.map((h, i) => [h, i]));

    const side = Math.min(W, H);
    const ox = (W - side) / 2, oy = (H - side) / 2;
    const inkVote = spec.inkVote ?? 0.62;

    const cells = [];
    for (let ry = 0; ry < N; ry++) {
        for (let rx = 0; rx < N; rx++) {
            const x0 = Math.floor(ox + (rx * side) / N), x1 = Math.floor(ox + ((rx + 1) * side) / N);
            const y0 = Math.floor(oy + (ry * side) / N), y1 = Math.floor(oy + ((ry + 1) * side) / N);
            const tally = new Map();
            let inked = 0, total = 0;
            for (let y = y0; y < y1; y++) {
                for (let x = x0; x < x1; x++) {
                    const p = y * W + x;
                    total++;
                    if (ink[p]) { inked++; continue; }
                    const hex = overrideHex[p] || regionHex[region[p]];
                    tally.set(hex, (tally.get(hex) || 0) + 1);
                }
            }
            if (total > 0 && inked / total >= inkVote) { cells.push(idxOf.get(spec.inkColor || '#2b2b33')); continue; }
            let bestHex = spec.bigDefault || palette[1], bestN = -1;
            for (const [hex, n] of tally) if (n > bestN) { bestN = n; bestHex = hex; }
            cells.push(idxOf.get(bestHex) ?? 0);
        }
    }

    /* biggest regions nobody seeded — these are where color goes wrong */
    const unclaimed = [];
    for (let r = 0; r < nRegions; r++) {
        if (claimedBy[r] === null && area[r] > 700) {
            unclaimed.push({ area: area[r], x: +(cx[r] / W).toFixed(3), y: +(cy[r] / H).toFixed(3), got: regionHex[r] });
        }
    }
    unclaimed.sort((a, b) => b.area - a.area);
    return { palette, cells, nRegions, colorizedUrl, W, H, report, nudged,
             unclaimed: unclaimed.slice(0, 18) };
}, { dataUrl: `data:image/png;base64,${b64}`, spec, diag });

await browser.close();

/* ── emit ──────────────────────────────────────────────────── */
const N = spec.n;
const CHARS = '0123456789abcdefghijklmnopqrstuvwxyz';

/* drop palette entries that ended up unused, then renumber */
const used = new Map();
result.cells.forEach(c => used.set(c, (used.get(c) || 0) + 1));
const keep = [...used.keys()].sort((a, b) => a - b);
const remap = new Map(keep.map((old, i) => [old, i]));
const palette = keep.map(i => result.palette[i]);
const counts = keep.map(i => used.get(i));

const rows = [];
for (let r = 0; r < N; r++) {
    let line = '';
    for (let c = 0; c < N; c++) line += CHARS[remap.get(result.cells[r * N + c])];
    rows.push(line);
}

enforceLimits(spec.out, N, palette.length);
fs.writeFileSync(`${OUT}/${spec.out}.json`, JSON.stringify({ n: N, palette, counts, rows }, null, 1));
fs.writeFileSync(`${OUT}/${spec.out}-full.png`,
    Buffer.from(result.colorizedUrl.split(',')[1], 'base64'));

console.log(`${spec.out}: ${N}×${N}, ${palette.length} colors, ${result.nRegions} regions found`);
if (result.nudged.length) console.log('NUDGED OFF INK:\n  ' + result.nudged.join('\n  '));
const bounded = new Set(spec.seeds.map((s, i) => s[4] ? i : -1).filter(i => i >= 0));
const bad = result.report.filter(r => r.status !== 'ok' && !bounded.has(r.i));
if (bad.length) console.log('PROBLEM SEEDS (unbounded):\n  ' + bad.map(r => `#${r.i} ${r.label} — ${r.status}`).join('\n  '));
const weak = result.report.filter(r => bounded.has(r.i) && (r.bounded || 0) < 60);
if (weak.length) console.log('BOUNDED SEEDS THAT BARELY FILLED:\n  ' + weak.map(r => `#${r.i} ${r.label} — ${r.bounded || 0}px`).join('\n  '));
const big = result.report.filter(r => r.status === 'ok' && r.area > 12000);
if (big.length) console.log('SUSPICIOUSLY LARGE CLAIMS:\n  ' + big.map(r => `#${r.i} ${r.label} — ${r.area}px`).join('\n  '));
console.log('LARGEST UNSEEDED REGIONS:\n  ' + result.unclaimed.map(u => `(${u.x}, ${u.y}) ${u.area}px → ${u.got}`).join('\n  '));
console.log('palette:', palette.join(' '));
console.log('counts :', counts.join(' '));
