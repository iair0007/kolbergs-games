# Picture tools

**Every picture must respect the project limits in CLAUDE.md — at most 12
colors and at most 1024 squares (a 32 x 32 grid).** A child paints every
square by hand; these caps keep a picture finishable in one sitting.

Build-time only. The game never runs these, and the repo keeps its
no-build-step rule.

## Drawing a picture — `pics.mjs` (the one to use)

    node pics.mjs          # writes one JSON per picture

Pictures are drawn square by square with `g(col, row, w, h, colorIndex)`,
using the source artwork as reference for hair, suit, cape, emblem and
palette. `author.mjs` rasterizes them and freezes the result into the
`scenes.js` format.

**Why drawn and not converted.** A detailed A4 illustration reduced to a grid
a child can finish loses exactly what makes the subject recognisable: eyes
and mouths are drawn with strokes thinner than one square, so a face arrives
as a blank oval no matter how the reduction is tuned. Keeping the outlines
instead fills the grid with black speckle. Both were tried at 32, 44, 56 and
64 squares and at every ink threshold — the information simply does not fit.
Drawing for the grid keeps every feature, at the cost of simplifying the pose.

Inspect what you drew:

    node preview.mjs <name> [<name> ...]   # contact sheet
    node gridview.mjs <name>               # with square coordinates

## Converting an image — `convert.mjs`, `colorize.mjs`

Kept for source art that is already flat and bold, where a mechanical
reduction does hold up. Neither is a good route for a detailed illustration.

    node convert.mjs <image> <gridSize> <colors> <outName> [x,y,w,h]

Downsamples and reduces by k-means. A dim, largely monochrome photo will not
survive 12 colors; it turns to mud.

    node colorize.mjs <spec.json> [--diag]

For line art, which quantizes to nothing but greys on its own. Thresholds the
ink, dilates it to close hairline gaps, flood-fills the enclosed regions, and
colors each from seed points; downsamples by majority vote per square so
outlines never average into mud.

Seeds are `[x, y, hex, label]` in 0..1 image coordinates. A fifth number makes
the seed *bounded* — it fills outward from its own pixel and stops at that
radius, which is how you color an area the artist left open to the background.
Seeds landing on a line are nudged to the nearest open pixel. `crop`
(`[x, y, w, h]`, 0..1) picks one subject out of the artwork; `stamps` paints
individual squares after the fact.

`--diag` writes `<out>-full.png` with numbered seed markers, and the console
reports seeds that hit ink, seeds whose region was already taken, and the
largest unseeded regions with coordinates.
