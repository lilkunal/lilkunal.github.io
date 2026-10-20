# Pixel Pull — Kunal Varshney

Loose pixels drawn into one finished block: raw material in, a built thing out.

## Colours

| | Hex |
|---|---|
| Orange (gradient start) | `#FF7A3D` |
| Pink (gradient end) | `#E02F6B` |
| Ink | `#15161A` |

Gradient runs top-left to bottom-right, 135°.

## Which file to use

| Use | File |
|---|---|
| Anything **above 40 px** | `mark.svg` |
| Anything **below 40 px** — favicon, tab, small avatar | `mark-compact.svg` |
| One ink — stamp, embroidery, carbon copy | `mark-black.svg` / `mark-white.svg` |
| Browser icon | `favicon.ico` (16, 32, 48 in one file) |
| Social / app icon | `pixel-pull-compact-180.png` |
| Print or large screen | `pixel-pull-512.png` |

**The 40 px rule matters.** The full mark has a three-step trail of pixels. Below roughly
40 px those three steps collapse into a smudge, so the compact variant drops to one
satellite and a larger core. Using the full mark as a favicon is the one way to make this
identity look broken.

## Clear space

Keep empty space equal to the small satellite (one eighth of the mark's width) on all
four sides. Nothing crosses it.

## Animation

The three satellites fly in and settle, on loop. It is CSS on the same SVG, so the
printed and animated versions are the same artwork. It must stop under
`prefers-reduced-motion: reduce` — that is already handled in `index.html`.

## Don't

- Don't use the full mark below 40 px.
- Don't recolour the gradient. One ink is black or white, nothing else.
- Don't rotate it. The diagonal only reads as movement running top-left to bottom-right.
- Don't add a stroke, a glow, or a drop shadow to the pixels.
- Don't put the gradient mark on an orange or pink background; use the white version.

## Source

`index.html` in this folder is the living sheet: every variant, the size ladder, the
lockups and the in-use mockups. Open it at `/brand/` on a local server.
