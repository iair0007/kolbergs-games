/**
 * Image → paint-by-number grid.
 *
 * Chromium does the decoding and the high-quality downsample; k-means then
 * reduces the result to a kid-sized palette. Output is a compact row-string
 * grid ready to paste into data.js.
 *
 *   node convert.mjs <image> <gridSize> <colors> [outName]
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


const [imgPath, nArg, kArg, outName, cropArg] = process.argv.slice(2);
const crop = cropArg ? cropArg.split(',').map(Number) : null;
const N = Number(nArg || 40);
const K = Number(kArg || 12);

/* Remove one-square specks: a square whose color matches none of its four
   neighbours is line-junction noise, not picture. It reads as dirt and it
   makes a child hunt across the grid for a single square of some color. */
function despeckle(cells, n, passes = 2) {
    for (let pass = 0; pass < passes; pass++) {
        const out = cells.slice();
        for (let y = 0; y < n; y++) {
            for (let x = 0; x < n; x++) {
                const i = y * n + x;
                const nb = [];
                if (x > 0)     nb.push(cells[i - 1]);
                if (x < n - 1) nb.push(cells[i + 1]);
                if (y > 0)     nb.push(cells[i - n]);
                if (y < n - 1) nb.push(cells[i + n]);
                if (nb.some(v => v === cells[i])) continue;
                const tally = new Map();
                nb.forEach(v => tally.set(v, (tally.get(v) || 0) + 1));
                let best = cells[i], bestN = 0;
                for (const [v, c] of tally) if (c > bestN) { bestN = c; best = v; }
                out[i] = best;
            }
        }
        cells = out;
    }
    return cells;
}

const OUT = '/tmp/claude-0/-home-user-kolbergs-games/fa7e2146-2df9-50f3-882a-e3267a47c66f/scratchpad';

const b64 = fs.readFileSync(imgPath).toString('base64');
const mime = imgPath.endsWith('.jpeg') || imgPath.endsWith('.jpg') ? 'image/jpeg' : 'image/png';

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent('<body style="margin:0"></body>');

const result = await page.evaluate(async ({ dataUrl, N, K, crop }) => {
    /* ── decode + downsample ───────────────────────────────── */
    const img = new Image();
    img.src = dataUrl;
    await img.decode();

    /* Two-step downscale keeps detail cleaner than one big jump. */
    let sw = img.naturalWidth, sh = img.naturalHeight;
    let src = document.createElement('canvas');
    src.width = sw; src.height = sh;
    let sctx = src.getContext('2d');
    sctx.drawImage(img, 0, 0);
    while (Math.min(sw, sh) > N * 3 / (crop ? Math.min(crop[2], crop[3]) : 1)) {
        const nw = Math.max(N, Math.round(sw / 2)), nh = Math.max(N, Math.round(sh / 2));
        const tmp = document.createElement('canvas');
        tmp.width = nw; tmp.height = nh;
        const tctx = tmp.getContext('2d');
        tctx.imageSmoothingEnabled = true;
        tctx.imageSmoothingQuality = 'high';
        tctx.drawImage(src, 0, 0, nw, nh);
        src = tmp; sw = nw; sh = nh;
    }

    /* Crop to one subject when asked, else a square from the centre. */
    let cropX = 0, cropY = 0, cropW = sw, cropH = sh;
    if (crop) {
        cropX = Math.round(crop[0] * sw); cropY = Math.round(crop[1] * sh);
        cropW = Math.round(crop[2] * sw); cropH = Math.round(crop[3] * sh);
    }
    const side = Math.min(cropW, cropH);
    const cv = document.createElement('canvas');
    cv.width = cv.height = N;
    const ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(src, cropX + (cropW - side) / 2, cropY + (cropH - side) / 2,
                  side, side, 0, 0, N, N);
    const data = ctx.getImageData(0, 0, N, N).data;

    const px = [];
    for (let i = 0; i < N * N; i++) {
        px.push([data[i * 4], data[i * 4 + 1], data[i * 4 + 2]]);
    }

    /* ── k-means (k-means++ seeding, fixed iterations) ─────── */
    const dist2 = (a, b) => {
        const dr = a[0] - b[0], dg = a[1] - b[1], db = a[2] - b[2];
        return dr * dr + dg * dg + db * db;
    };
    let rng = 12345;
    const rand = () => (rng = (rng * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;

    const centroids = [px[Math.floor(rand() * px.length)].slice()];
    while (centroids.length < K) {
        const d = px.map(p => Math.min(...centroids.map(c => dist2(p, c))));
        const sum = d.reduce((a, v) => a + v, 0);
        if (sum === 0) break;
        let r = rand() * sum, idx = 0;
        while (r > 0 && idx < d.length - 1) r -= d[idx++];
        centroids.push(px[idx].slice());
    }

    let assign = new Array(px.length).fill(0);
    for (let iter = 0; iter < 30; iter++) {
        let moved = false;
        for (let i = 0; i < px.length; i++) {
            let best = 0, bd = Infinity;
            for (let c = 0; c < centroids.length; c++) {
                const dd = dist2(px[i], centroids[c]);
                if (dd < bd) { bd = dd; best = c; }
            }
            if (assign[i] !== best) { assign[i] = best; moved = true; }
        }
        const sums = centroids.map(() => [0, 0, 0, 0]);
        for (let i = 0; i < px.length; i++) {
            const s = sums[assign[i]];
            s[0] += px[i][0]; s[1] += px[i][1]; s[2] += px[i][2]; s[3]++;
        }
        for (let c = 0; c < centroids.length; c++) {
            if (sums[c][3] > 0) {
                centroids[c] = [
                    Math.round(sums[c][0] / sums[c][3]),
                    Math.round(sums[c][1] / sums[c][3]),
                    Math.round(sums[c][2] / sums[c][3])
                ];
            }
        }
        if (!moved) break;
    }

    /* ── order palette dark → light, drop unused ───────────── */
    const counts = centroids.map(() => 0);
    assign.forEach(a => counts[a]++);
    const lum = c => 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2];
    const order = centroids.map((c, i) => i)
        .filter(i => counts[i] > 0)
        .sort((a, b) => lum(centroids[a]) - lum(centroids[b]));
    const remap = new Map(order.map((old, ni) => [old, ni]));

    const hex = n => '#' + n.map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('');
    const palette = order.map(i => hex(centroids[i]));
    const cells = assign.map(a => remap.get(a));

    return { palette, cells, counts: order.map(i => counts[i]) };
}, { dataUrl: `data:${mime};base64,${b64}`, N, K, crop });

await browser.close();

/* ── emit ──────────────────────────────────────────────────── */
const CHARS = '0123456789abcdefghijklmnopqrstuvwxyz';
result.cells = despeckle(result.cells, N, 2);
const rows = [];
for (let r = 0; r < N; r++) {
    let line = '';
    for (let c = 0; c < N; c++) line += CHARS[result.cells[r * N + c]];
    rows.push(line);
}

const name = outName || 'out';
enforceLimits(name, N, result.palette.length);
fs.writeFileSync(`${OUT}/${name}.json`, JSON.stringify({
    n: N, palette: result.palette, counts: result.counts, rows
}, null, 1));

console.log(`${name}: ${N}×${N}, ${result.palette.length} colors, ${N * N} cells`);
console.log('palette:', result.palette.join(' '));
console.log('counts :', result.counts.join(' '));
