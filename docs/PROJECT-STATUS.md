# Project Status — Kunal Varshney site

> Personal site + résumé PWA. Live: https://lilkunal.github.io/  
> GitHub: https://github.com/lilkunal/lilkunal.github.io

## Last updated

2026-09-03 — Cursor (THOOK back on /work/)

## Done

- [x] Slimmed the hire site: dropped decorative layers (Three.js, ludo, blobs, runner, cursor-water, anime/Motion, hidden services/process, unused assets)
- [x] Home no longer lists projects in accordion cards — **See the work** goes to `/work/`
- [x] Hire rewrite: hero is one identity + See work / Get in touch; why-hire then a path to work (no project dump)
- [x] Home featured work is Padma, JAI, Daftar. THOOK is a full card on `/work/` (07 · Live)
- [x] Work/FAQ sections sit on paper; the portrait texture stays on the first screen
- [x] `/portfolios/` heading is hire-site language; nav includes Résumé + Contact
- [x] Résumé no longer calls demo sites “clients”; contact is adult
- [x] Device fit: phone/tablet overflow, stacked nav logo, 44px menu, safe-area, stacked CTAs, iPad gets desktop nav
- [x] FAQ answers stay closed until a question is clicked (native `<details>`, hidden until open)
- [x] SW **kv-v81**
- [x] ElevenLabs apply blocked (90-day domain limit)

## In progress

- [ ] Nothing blocking — live should match this commit after GitHub Pages builds

## Next

1. Hard-refresh https://lilkunal.github.io/ once if the old THOOK card is cached
2. Optional: GitLab Customer Success Engineer, India
3. Revisit ElevenLabs after the 90-day window
4. Kunal should read hero / why-hire / FAQ copy and swap anything that doesn’t sound like him

## Decisions

- Keep: home, work, portfolios, résumé, case studies, hire-me, hidden game, short films
- Home sells the person. Work and portfolios live on their own pages
- THOOK is on `/work/` as a live site card — not on the home featured row
- Live vs demo stays explicit — Padma is the client proof; JAI and the rest are demos
- Remove: leftover effects, unused CSS/JS, `_fetch/` dump, unused photos/stickers/thumbs
