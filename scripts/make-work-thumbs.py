"""Compose 16:10 work thumbs from each site image — fill the card, keep the identity."""
from __future__ import annotations

import os
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "assets", "work")
OUT_W, OUT_H = 1600, 1000

JOBS = [
    {
        "src": "padma-gate-light.jpg",
        "out": "thumb-padma.jpg",
        "title": "PADMA",
        "line": "Outdoor lighting",
        "fx": 0.58,
        "fy": 0.42,
        "zoom": 1.15,
        "bar": (26, 22, 18, 210),
        "ink": (244, 236, 228),
        "gold": (212, 168, 83),
    },
    {
        "src": "bkc.png",
        "out": "thumb-bkc.jpg",
        "title": "BKC",
        "line": "Hinglish streetwear",
        "fx": 0.18,
        "fy": 0.36,
        "zoom": 2.05,
        "bar": (243, 238, 230, 220),
        "ink": (17, 17, 17),
        "gold": (245, 208, 0),
    },
    {
        "src": "daftar.png",
        "out": "thumb-daftar.jpg",
        "title": "DAFTAR",
        "line": "Government, made simple",
        "fx": 0.86,
        "fy": 0.52,
        "zoom": 1.85,
        "bar": (14, 26, 36, 215),
        "ink": (244, 247, 246),
        "gold": (125, 211, 199),
    },
    {
        "src": "atul-shiv-shakti.png",
        "out": "thumb-atul.jpg",
        "title": "ATUL SHIV SHAKTI",
        "line": "Vedic astrology",
        "fx": 0.22,
        "fy": 0.38,
        "zoom": 1.75,
        "bar": (12, 10, 22, 220),
        "ink": (247, 239, 228),
        "gold": (232, 192, 120),
    },
    {
        "src": "jai-home-care.jpg",
        "out": "thumb-jai.jpg",
        "title": "JAI",
        "line": "Home care",
        "fx": 0.32,
        "fy": 0.48,
        "zoom": 1.2,
        "bar": (244, 247, 251, 220),
        "ink": (26, 54, 93),
        "gold": (43, 108, 176),
    },
    {
        "src": "ace-factor-fitness.png",
        "out": "thumb-ace.jpg",
        "title": "ACE FACTOR",
        "line": "Fitness",
        "fx": 0.50,
        "fy": 0.38,
        "zoom": 1.2,
        "bar": (10, 10, 10, 220),
        "ink": (255, 255, 255),
        "gold": (225, 29, 72),
    },
    {
        "src": "portfolio.jpg",
        "out": "thumb-portfolio.jpg",
        "title": "KUNAL",
        "line": "Hire site",
        "fx": 0.55,
        "fy": 0.45,
        "zoom": 1.25,
        "bar": (22, 20, 16, 215),
        "ink": (244, 236, 228),
        "gold": (212, 168, 83),
    },
]


def font(size: int, bold: bool = True) -> ImageFont.ImageFont:
    candidates = [
        r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf",
        r"C:\Windows\Fonts\segoeuib.ttf" if bold else r"C:\Windows\Fonts\segoeui.ttf",
        r"C:\Windows\Fonts\calibrib.ttf" if bold else r"C:\Windows\Fonts\calibri.ttf",
    ]
    for path in candidates:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def cover_crop(im: Image.Image, fx: float, fy: float, zoom: float = 1.0) -> Image.Image:
    sw, sh = im.size
    scale = max(OUT_W / sw, OUT_H / sh) * max(1.0, zoom)
    nw, nh = int(sw * scale + 0.5), int(sh * scale + 0.5)
    im = im.resize((nw, nh), Image.Resampling.LANCZOS)
    cx = int(nw * fx - OUT_W / 2)
    cy = int(nh * fy - OUT_H / 2)
    cx = max(0, min(cx, nw - OUT_W))
    cy = max(0, min(cy, nh - OUT_H))
    return im.crop((cx, cy, cx + OUT_W, cy + OUT_H))


def plate(draw: ImageDraw.ImageDraw, job: dict) -> None:
    bar_h = 210
    y0 = OUT_H - bar_h
    draw.rectangle((0, y0, OUT_W, OUT_H), fill=job["bar"])
    draw.rectangle((0, y0, 14, OUT_H), fill=job["gold"])
    title_f = font(72, True)
    line_f = font(32, False)
    draw.text((48, y0 + 42), job["title"], font=title_f, fill=job["ink"])
    draw.text((48, y0 + 132), job["line"], font=line_f, fill=job["gold"])


def run() -> None:
    for job in JOBS:
        src = os.path.join(SRC, job["src"])
        dest = os.path.join(SRC, job["out"])
        im = Image.open(src).convert("RGB")
        frame = cover_crop(im, job["fx"], job["fy"], job.get("zoom", 1.0))
        overlay = Image.new("RGBA", frame.size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)
        plate(draw, job)
        out = Image.alpha_composite(frame.convert("RGBA"), overlay).convert("RGB")
        out = out.filter(ImageFilter.UnsharpMask(radius=1.2, percent=80, threshold=3))
        out.save(dest, "JPEG", quality=88, optimize=True)
        print("wrote", job["out"], out.size)


if __name__ == "__main__":
    run()
