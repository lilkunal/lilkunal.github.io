# Project Status — Kunal Varshney site

> Personal site + résumé PWA. Live: https://lilkunal.github.io/  
> GitHub: https://github.com/lilkunal/lilkunal.github.io

## Last updated

2026-09-20 — Claude Code (still background, shorter home page, animated work reel, portfolios in the nav)

## Done

- [x] `/portfolios/` rebuilt as a proper page: a short "Why someone else's name is on my site" answer (the site is Kunal's work, live, shown with permission), then the three hire sites in a grid — no carousel, no nav dropdown
- [x] Hero drops the proof strip (live client · three portfolios · four years in support); the hero is eyebrow, name, role, pitch, two buttons
- [x] Home has no hire-portfolios section and no "All website work"/"Portfolios I made" buttons; both pages are reached from the nav, where "Portfolios" is a plain link again
- [x] Work reel rebuilt: autoplay (4.5 s, pauses on hover/focus/off-screen/reduced motion and for 6 s after any interaction), progress dots, drag with a mouse, arrow keys, looping arrows, and edge fades so cards are not sliced
- [x] Home background is a still image (`.site-bg`, 16% dark / 9% light): the WebGL portrait, its hover reveal and its scroll pan are gone, and `js/portrait-scroll.js` is deleted — three.js no longer loads on the home page
- [x] Home trimmed to hero → work + portfolios → contact → footer: the "Why hire me" cards (folded into hero proof lines), the four-step "How I work" section, the contact form, the duplicate contact chips and the social bubbles are gone; nav/hero name no longer flips
- [x] Light theme: the background drawing (home portrait canvas, Work/Portfolios `.site-bg`) now stays at 15% opacity on hover instead of 100%, so dark text stays readable; dark theme keeps its charcoal veil
- [x] Résumé intro (≥ 700px): a three.js dragon chases a glowing pearl through the intro paragraph (`resume/js/resume-flow.js`); Pretext 0.0.9 (`js/vendor/pretext/`, MIT) re-lays every line each frame so text flows on both sides of them. Hovering leads the pearl. Original `<p>` stays for screen readers; print/PDF shows it unchanged; reduced motion gets a still frame; phones skip it and never download three.js
- [x] Home hero uses Three.js (r186 from `js/vendor/three.module.js`) so scroll pans the portrait; rest opacity 6%, hover to full
- [x] Background timeline (`#experience`) and hiring FAQ (`#ask`) removed from home
- [x] Home Selected work + Portfolios I made are carousels of all 8 sites and 3 hire portfolios
- [x] Nav mark wrap is light paper so the glasses chibi reads; SW **kv-v97**
- [x] Home contact no longer has a Copy number pill; tel + WhatsApp stay
- [x] Résumé experience trimmed on Kunal's instruction: the J&Z Commercial internship entry is off the site (résumé + home structured data), and the Padma marketing entry is folded into the single Freelance Web Designer entry (Jan 2025 – Present)
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
