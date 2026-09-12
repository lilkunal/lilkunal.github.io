# Project Status — Kunal Varshney site

> Personal site + résumé PWA. Live: https://lilkunal.github.io/  
> GitHub: https://github.com/lilkunal/lilkunal.github.io

## Last updated

2026-09-12 — Cursor (home face + carousels; visible nav mark; no copy-number pill)

## Done

- [x] Home hero uses Three.js (r186 from `js/vendor/three.module.js`) so scroll pans the portrait; rest opacity 6%, hover to full
- [x] Background timeline (`#experience`) and hiring FAQ (`#ask`) removed from home
- [x] Home Selected work + Portfolios I made are carousels of all 8 sites and 3 hire portfolios
- [x] Nav mark wrap is light paper so the glasses chibi reads; SW **kv-v96**
- [x] Home contact no longer has a Copy number pill; tel + WhatsApp stay
- [x] Résumé: Web Developer & UI/UX Designer (Intern) at J&Z Commercial Pvt. Ltd. since Sep 2026 — MyCompassToday and a sister brand; Padma and freelance stay Present
- [x] Grammar pass across home, résumé, portfolios, and every case study ("labelled" spelling, missing articles, awkward phrasing)
- [x] `assets/hire-me.html` re-saved as UTF-8; résumé PDF regenerated from `/resume/`

- [x] `/portfolios/` lists three hire sites: Shweta Tiwari, Antriksh Upadhyay, and Anamika Rajput (https://r-anamika.github.io/)
- [x] Home why-hire / meta and résumé copy name all three; no third featured work card on home
- [x] `people-card--anamika` sage accent (distinct from Shweta paper and Antriksh gold-on-dark)
- [x] `/work/` lists Padma, JAI, Atul, Ace Factor, BKC, Daftar, THOOK, and **Bhagwan** (08 · Live at https://lilkunal.github.io/bhagwan/)
- [x] Slimmed the hire site: dropped leftover effects (ludo, blobs, runner, cursor-water, unused assets)
- [x] Home no longer lists projects in accordion cards — **See the work** goes to `/work/`
- [x] Hire rewrite: hero is one identity + See work / Get in touch; why-hire then a path to work (no project dump)
- [x] Home featured work is Padma, JAI, Daftar. THOOK and Bhagwan are full cards on `/work/` (live personal products)
- [x] Work/why-hire sit on paper; the portrait is a scroll-pinned Three.js stage, then paper takes over
- [x] `/portfolios/` heading is hire-site language; nav includes Résumé + Contact
- [x] Résumé no longer calls demo sites “clients”; contact is adult
- [x] Device fit: phone/tablet overflow, stacked nav logo, 44px menu, safe-area, stacked CTAs, iPad gets desktop nav
- [x] FAQ answers stay closed until a question is clicked (native `<details>`, hidden until open)
- [x] THOOK work card uses the spit-take drawing as the thumbnail
- [x] Hero nickname no longer paints over the name on first load
- [x] ElevenLabs apply blocked (90-day domain limit)

## In progress

- [ ] Nothing blocking — live should match this commit after GitHub Pages builds

## Next

1. Hard-refresh https://lilkunal.github.io/portfolios/ once so the Anamika card is not masked by the old SW
2. Optional: GitLab Customer Success Engineer, India
3. Revisit ElevenLabs after the 90-day window
4. Kunal should read hero / why-hire / FAQ copy and swap anything that doesn’t sound like him

## Decisions

- Keep: home, work, portfolios, résumé, case studies, hire-me, hidden game, short films
- Home sells the person. Work and portfolios live on their own pages
- THOOK and Bhagwan are on `/work/` as live site cards — not on the home featured row
- Live vs demo stays explicit — Padma is the client proof; JAI and the rest are demos
- Remove: leftover effects, unused CSS/JS, `_fetch/` dump, unused photos/stickers/thumbs
