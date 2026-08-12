/** Render converted grids (JSON) to a PNG contact sheet for eyeballing. */
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'fs';

const OUT = '/tmp/claude-0/-home-user-kolbergs-games/fa7e2146-2df9-50f3-882a-e3267a47c66f/scratchpad';
const names = process.argv.slice(2);
const grids = names.map(n => ({ name: n, ...JSON.parse(fs.readFileSync(`${OUT}/${n}.json`, 'utf8')) }));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: Math.min(1500, 40 + grids.length * 460), height: 560 }, deviceScaleFactor: 2 });
await page.setContent('<body style="margin:0;background:#16213e;display:flex;gap:16px;padding:16px;font-family:system-ui"></body>');

await page.evaluate((grids) => {
    const CHARS = '0123456789abcdefghijklmnopqrstuvwxyz';
    for (const g of grids) {
        const box = document.createElement('div');
        box.style.cssText = 'display:flex;flex-direction:column;gap:8px;color:#fff';
        const cv = document.createElement('canvas');
        const SIZE = 430;
        cv.width = cv.height = SIZE;
        cv.style.cssText = 'image-rendering:pixelated;border-radius:8px;background:#fff';
        const ctx = cv.getContext('2d');
        const cell = SIZE / g.n;
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, SIZE, SIZE);
        for (let r = 0; r < g.n; r++) {
            for (let c = 0; c < g.n; c++) {
                const ch = g.rows[r][c];
                if (ch === '.') continue;
                ctx.fillStyle = g.palette[CHARS.indexOf(ch)];
                ctx.fillRect(Math.round(c * cell), Math.round(r * cell), Math.ceil(cell), Math.ceil(cell));
            }
        }
        const label = document.createElement('div');
        label.style.cssText = 'font-size:13px;font-weight:600';
        const painted = g.rows.join('').split('').filter(ch => ch !== '.').length;
        label.textContent = `${g.name} — ${g.n}×${g.n}, ${g.palette.length} colors, ${painted} squares`;
        const sw = document.createElement('div');
        sw.style.cssText = 'display:flex;gap:3px;flex-wrap:wrap';
        g.palette.forEach(h => {
            const s = document.createElement('span');
            s.style.cssText = `width:20px;height:20px;border-radius:50%;background:${h};border:1px solid rgba(255,255,255,.3)`;
            sw.appendChild(s);
        });
        box.append(cv, label, sw);
        document.body.appendChild(box);
    }
}, grids);

await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/preview-${names.join('-')}.png` });
await browser.close();
console.log('wrote', `preview-${names.join('-')}.png`);
