Regenerate the QR (needs: pip install qrcode)

python - <<'PY'
import qrcode
qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, border=0)
qr.add_data("https://lilkunal.github.io/")        # <- change the URL here
qr.make(fit=True)
m = qr.get_matrix(); n = len(m); parts = []
for y, row in enumerate(m):
    x = 0
    while x < n:
        if row[x]:
            run = 1
            while x + run < n and row[x + run]: run += 1
            parts.append(f"M{x} {y}h{run}v1h-{run}z"); x += run
        else: x += 1
print(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {n} {n}" shape-rendering="crispEdges" '
      f'role="img" aria-label="QR code to lilkunal.github.io"><path fill="currentColor" d="{"".join(parts)}"/></svg>')
PY

Paste the output over the existing <svg> inside <span class="qr-plate"> in card/index.html,
then run: npm run card:pdf
