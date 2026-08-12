# Picture conversion tools

Build-time only — the game itself never runs these, and the repo keeps its
no-build-step rule. They turn a source image into the fixed grids in
`scenes.js`. Chromium (via Playwright) does the image decoding, so there are
no image libraries to install.

## Full-color artwork → grid

    node convert.mjs <image> <gridSize> <colors> <outName>

Downsamples the image and reduces it to `<colors>` with k-means. Right for
photos and painted illustrations.

## Line art → grid

    node colorize.mjs <spec.json> [--diag]

Coloring-book pages are outlines on white — quantizing them directly yields
nothing but greys. This instead:

1. thresholds the ink and dilates it slightly to close hairline gaps,
2. flood-fills every enclosed region,
3. colors each region from the seed points in the spec,
4. downsamples by majority vote per square, so outlines never average into mud.

Seeds are `[x, y, hex, label]` in 0..1 coordinates. A fifth number makes the
seed *bounded* — it fills outward from its own pixel and stops at that radius,
which is how you color an area the artist left open to the background (hair
strands, flame tips). Seeds landing on a line are nudged to the nearest open
pixel automatically.

Run with `--diag` to write `<out>-full.png` with numbered seed markers, and
read the console report: seeds that hit ink, seeds whose region was already
taken, and the largest regions nobody seeded (with coordinates to seed them).

## Preview

    node preview.mjs <name> [<name> ...]

Renders the generated JSON grids to a contact sheet.
