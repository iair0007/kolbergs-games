/**
 * Author a 32x32 picture from shapes and freeze it into the scenes format.
 *
 * A detailed illustration does not survive mechanical reduction to a grid a
 * child can finish — faces flatten to blank ovals. These are drawn FOR the
 * grid instead, using the source art as reference for hair, palette, emblem
 * and pose, so every square is placed on purpose.
 */
import fs from 'fs';

const OUT = '/tmp/claude-0/-home-user-kolbergs-games/fa7e2146-2df9-50f3-882a-e3267a47c66f/scratchpad';
let N = Number(process.env.PBN_N || 32);
export const setN = (n) => { N = n; };

/* ── geometry ─────────────────────────────────────────── */
const inPoly = (pts, x, y) => {
    let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const xi = pts[i][0], yi = pts[i][1], xj = pts[j][0], yj = pts[j][1];
        if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) inside = !inside;
    }
    return inside;
};
function hit(s, x, y) {
    switch (s.t) {
        case 'r': return x >= s.x && x < s.x + s.w && y >= s.y && y < s.y + s.h;
        case 'e': { const dx = (x - s.cx) / s.rx, dy = (y - s.cy) / s.ry; return dx * dx + dy * dy <= 1; }
        case 'p': return inPoly(s.pts, x, y);
    }
    return false;
}

/* Grid-space helper: g(col,row,w,h) → a rect of whole squares. */
const g = (col, row, w = 1, h = 1, c) => ({ t: 'r', x: col / N, y: row / N, w: w / N, h: h / N, c });

export function build(pic) {
    const cells = new Int16Array(N * N).fill(-1);
    for (let row = 0; row < N; row++) {
        for (let col = 0; col < N; col++) {
            const x = (col + 0.5) / N, y = (row + 0.5) / N;
            let v = -1;
            for (const s of pic.shapes) if (hit(s, x, y)) v = s.c;
            cells[row * N + col] = v;
        }
    }
    return cells;
}

export function emit(pic) {
    const cells = build(pic);
    const counts = new Map();
    cells.forEach(v => { if (v >= 0) counts.set(v, (counts.get(v) || 0) + 1); });
    const used = [...counts.keys()].sort((a, b) => a - b);
    const remap = new Map(used.map((old, i) => [old, i]));
    const CHARS = '0123456789abcdefghijklmnopqrstuvwxyz';
    const rows = [];
    for (let r = 0; r < N; r++) {
        let line = '';
        for (let c = 0; c < N; c++) {
            const v = cells[r * N + c];
            line += v < 0 ? '.' : CHARS[remap.get(v)];
        }
        rows.push(line);
    }
    const out = {
        n: N,
        palette: used.map(i => pic.palette[i]),
        counts: used.map(i => counts.get(i)),
        rows
    };
    fs.writeFileSync(`${OUT}/${pic.id}.json`, JSON.stringify(out, null, 1));
    console.log(`${pic.id}: ${out.palette.length} colors, ${out.counts.reduce((a, b) => a + b, 0)} squares`);
    return out;
}

export { g };
