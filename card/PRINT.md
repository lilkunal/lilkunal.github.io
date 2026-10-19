# Business card — what to send the printer

`assets/Kunal-Varshney-Card.pdf` — 2 pages: page 1 is the front, page 2 is the back.

| | |
|---|---|
| Trim size | **90 × 54 mm** (the common Indian/EU card) |
| Page size | **96 × 60 mm** — includes **3 mm bleed** on all four sides |
| Safe margin | 4 mm inside the trim; nothing important sits closer |
| Colour | RGB. Ask the printer to convert; the teal `#0f766e` and the dark `#141210` both reproduce fine in CMYK |
| Stock | 300–350 gsm. Matte or soft-touch suits the dark back better than gloss, which shows fingerprints |

## Say this when ordering

> Double-sided, 90 × 54 mm trim, 3 mm bleed included, 300 gsm matte.

## Regenerating

```bash
npm run card:pdf
```

Edit `card/index.html` and re-run. The QR is inlined as vector, so it stays crisp at any size.

## If the phone number or URL changes

The QR encodes `https://lilkunal.github.io/`. To change it, re-run the generator in
`card/README-qr.txt` and paste the new `<svg>` over the one in `card/index.html`.
