# Moving the portfolio to kunalvarshney.com

Planned for 15–19 November 2026. About 20 minutes, most of it waiting for GitHub.
DNS at Spaceship already points at GitHub, so there is nothing to change there.

**The order matters.** GitHub won't let two repos claim the same domain, and right now the
`coming-soon` repo holds it.

1. **Free the domain from the robot game.**
   github.com/lilkunal/coming-soon → Settings → Pages → Custom domain → **Remove**.
   The game then lives on at `kunalvarshney.com/coming-soon/` once step 4 is done.

2. **Rewrite the site and rebuild the PDFs.** In this repo:
   ```
   git pull
   python scripts/move-to-domain.py          # dry run: read the list
   python scripts/move-to-domain.py --apply  # rewrites URLs + QR codes, writes CNAME, bumps the cache, rebuilds both PDFs
   npm run test:hire-site                    # must pass
   ```

3. **Commit and push.**
   ```
   git add -A . ":!node_modules" && git commit -m "Move to kunalvarshney.com" && git push
   ```

4. **Point the portfolio repo at the domain.**
   github.com/lilkunal/lilkunal.github.io → Settings → Pages → Custom domain →
   `kunalvarshney.com` → Save. Wait for the DNS check to go green, then tick **Enforce HTTPS**
   (the certificate usually takes a few minutes).

5. **Check, on your phone:**
   - `https://kunalvarshney.com/` opens the portfolio
   - `https://lilkunal.github.io/` redirects to it (old links keep working)
   - the six demos open: `/bhagwan/` `/thook/` `/Bkc/` `/Atulshivshakti/` `/Daftar-The-office/` `/ace-factor-fitness/`
   - the résumé PDF and the business card show kunalvarshney.com, and the card's QR opens it

6. **Tell Google.**
   - Search Console → add a property for `kunalvarshney.com` (Domain or URL prefix), verify it,
     submit `https://kunalvarshney.com/sitemap.xml`.
   - In the old `lilkunal.github.io` property: Settings → **Change of address** → kunalvarshney.com.
   - Google Analytics needs nothing; the same tag keeps reporting.

7. **Everywhere else:** LinkedIn (Website, Featured), GitHub profile, Instagram bio, email signature.

If something goes wrong: in the portfolio repo, delete `CNAME` and push. GitHub falls back to
lilkunal.github.io within minutes.
