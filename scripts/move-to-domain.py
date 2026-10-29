"""Move the portfolio from lilkunal.github.io to kunalvarshney.com in one go.

    python scripts/move-to-domain.py            # dry run: shows what would change
    python scripts/move-to-domain.py --apply    # does it

--apply rewrites every https://lilkunal.github.io URL in the site's own files, writes CNAME,
bumps the service-worker cache and rebuilds the résumé and card PDFs. It does not commit or
push, and it does not touch GitHub settings: see scripts/MOVE-TO-DOMAIN.md for the order.

docs/ is left alone on purpose: it holds letters and notes that were already sent.
"""
import re
import subprocess
import sys
from pathlib import Path

OLD, NEW, DOMAIN = "https://lilkunal.github.io", "https://kunalvarshney.com", "kunalvarshney.com"
ROOT = Path(__file__).resolve().parent.parent
TEXT = {".html", ".js", ".css", ".xml", ".txt", ".json", ".py", ".webmanifest", ".md"}
SKIP = {"docs", "node_modules", "test-results", ".git"}
APPLY = "--apply" in sys.argv
PDFS = "--no-pdf" not in sys.argv   # --no-pdf: for a rehearsal in a scratch copy


def site_files():
    for p in ROOT.rglob("*"):
        rel = p.relative_to(ROOT)
        if p.is_file() and p.suffix in TEXT and not SKIP & set(rel.parts) and p.name != "move-to-domain.py":
            yield p


BARE = re.compile(rb"(?<![/\w.-])lilkunal\.github\.io(?![\w-])")   # the address as printed text, not inside a repo path
QR = re.compile(rb'<svg [^>]*aria-label="QR code to lilkunal\.github\.io".*?</svg>', re.S)


def qr_svg(url):
    import qrcode   # pip install qrcode
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, border=0)
    qr.add_data(url); qr.make(fit=True)
    m = qr.get_matrix(); n = len(m); parts = []
    for y, row in enumerate(m):
        x = 0
        while x < n:
            if row[x]:
                run = 1
                while x + run < n and row[x + run]: run += 1
                parts.append(f"M{x} {y}h{run}v1h-{run}z"); x += run
            else: x += 1
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {n} {n}" shape-rendering="crispEdges" '
            f'role="img" aria-label="QR code to {DOMAIN}"><path fill="currentColor" d="{"".join(parts)}"/></svg>').encode()


total = 0
for p in sorted(site_files()):
    raw = p.read_bytes()
    qrs = len(QR.findall(raw))
    n = raw.count(OLD.encode())
    bare = len(BARE.findall(raw.replace(OLD.encode(), b"")))
    if not (n or bare or qrs):
        continue
    total += n + bare
    print(f"{n:4} url  {bare:3} text  {qrs} qr   {p.relative_to(ROOT)}")
    if APPLY:
        new = QR.sub(lambda _: qr_svg(NEW + "/"), raw) if qrs else raw
        new = BARE.sub(DOMAIN.encode(), new.replace(OLD.encode(), NEW.encode()))
        p.write_bytes(new)   # bytes, so line endings and BOMs survive
print(f"{total} mention(s) {'rewritten' if APPLY else 'would be rewritten'}")

cname = ROOT / "CNAME"
print(f"CNAME -> {DOMAIN}" + ("" if APPLY else " (would write)"))

sw = ROOT / "sw.js"
m = re.search(r'CACHE_VERSION = "kv-v(\d+)"', sw.read_text(encoding="utf-8"))
nxt = f"kv-v{int(m.group(1)) + 1}"
print(f"sw.js CACHE_VERSION -> {nxt}" + ("" if APPLY else " (would bump)"))

if not APPLY:
    print("\nDry run only. Run again with --apply.")
    sys.exit(0)

cname.write_text(DOMAIN + "\n", encoding="utf-8")
s = sw.read_bytes().decode("utf-8")
sw.write_bytes(s.replace(m.group(0), f'CACHE_VERSION = "{nxt}"').encode("utf-8"))

npm = "npm.cmd" if sys.platform == "win32" else "npm"
for script in ("resume:pdf", "card:pdf") if PDFS else ():
    print(f"\n$ npm run {script}")
    subprocess.run([npm, "run", script], cwd=ROOT, check=True)

left = [str(p.relative_to(ROOT)) for p in site_files() if OLD.encode() in p.read_bytes() or BARE.search(p.read_bytes())]
assert not left, f"old URL still in: {left}"
print("\nDone. Now run the tests, then follow scripts/MOVE-TO-DOMAIN.md from step 3.")
