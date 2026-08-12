/**
 * Render a generated grid with square coordinates on top, so feature stamps
 * can be placed by reading them off rather than by guessing.
 *
 *   node gridview.mjs <name> [<name> ...]
 */
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'fs';

const OUT = process.env.PBN_OUT || '/tmp/claude-0/-home-user-kolbergs-games/fa7e2146-2df9-50f3-882a-e3267a47c66f/scratchpad';
const names = process.argv.slice(2);
const grids = names.map(n => ({ name: n, ...JSON.parse(fs.readFileSync(`${OUT}/${n}.json`, 'utf8')) }));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 40 + grids.length * 700, height: 760 }, deviceScaleFactor: 2 });
await page.setContent('<body style="margin:0;background:#16213e;display:flex;gap:16px;padding:16px;font-family:system-ui"></body>');

await page.evaluate((grids) => {
    const CHARS = '0123456789abcdefghijklmnopqrstuvwxyz';
    for (const g of grids) {
        const SIZE = 672, cell = SIZE / g.n;
        const cv = document.createElement('canvas');
        cv.width = cv.height = SIZE;
        const ctx = cv.getContext('2d');
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, SIZE, SIZE);
        for (let r = 0; r < g.n; r++) {
            for (let c = 0; c < g.n; c++) {
                const ch = g.rows[r][c];
                if (ch === '.') continue;
                ctx.fillStyle = g.palette[CHARS.indexOf(ch)];
                ctx.fillRect(Math.round(c * cell), Math.round(r * cell), Math.ceil(cell), Math.ceil(cell));
            }
        }
        ctx.strokeStyle = 'rgba(0,0,0,0.18)';
        ctx.lineWidth = 1;
        ctx.font = '9px monospace';
        for (let i = 0; i <= g.n; i++) {
            ctx.beginPath(); ctx.moveTo(i * cell, 0); ctx.lineTo(i * cell, SIZE); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, i * cell); ctx.lineTo(SIZE, i * cell); ctx.stroke();
        }
        ctx.fillStyle = '#e000e0';
        ctx.font = 'bold 10px monospace';
        for (let i = 0; i < g.n; i += 2) {
            ctx.fillText(String(i), i * cell + 2, 10);
            ctx.fillText(String(i), 2, i * cell + 11);
        }
        const box = document.createElement('div');
        box.style.cssText = 'color:#fff;display:flex;flex-direction:column;gap:6px';
        const label = document.createElement('div');
        label.style.cssText = 'font-size:13px;font-weight:600';
        label.textContent = `${g.name} — ${g.n}×${g.n}, ${g.palette.length} colors`;
        box.append(cv, label);
        document.body.appendChild(box);
    }
}, grids);

await page.waitForTimeout(250);
await page.screenshot({ path: `${OUT}/gridview-${names.join('-')}.png` });
await browser.close();
console.log('wrote', `gridview-${names.join('-')}.png`);
