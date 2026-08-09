# Project Status â€” Handoff File

> Update when switching between Cursor, Claude Code, PC, or laptop.

## Last updated

2026-08-09 — Cursor (résumé designer-texture bg, deploy kv-v53)

## Done

- [x] **Kunal résumé designer-texture bg** — removed portrait `.site-bg-scroll`; CSS-only warm paper + dot grid + column guides + teal/brass glows; solid `.dossier-sheet`; SW **kv-v53**; live https://lilkunal.github.io/resume/
- [x] **Kunal résumé full-page portrait bg** — `.site-bg-scroll` uses CSS `background-size: cover` (full viewport width, scrolls with page); removed narrow 820px img column; SW **kv-v52**; live https://lilkunal.github.io/resume/ (deploy `ef5830f`)
- [x] **Kunal résumé scrollable portrait bg** — full illustration scrolls with page (`site-bg-scroll`); semi-transparent dossier sheet; SW **kv-v51**; live https://lilkunal.github.io/resume/ (deploy `4f92dac`)
- [x] **Kunal portfolio UX pass** — section backgrounds transparent so fixed portrait shows through; How I Build section centered; CV timeline wheel only inside pin box (outside scrolls page); deploy `4f92dac`
- [x] **Kunal hero + site background redesign** — removed `#ai-lens` mood board section; illustrated portrait as full-site `.site-bg` at 7% opacity (`assets/photos/site-bg-illustration.png`); hero is text-first with large **Kunal Varshney** headline, role lines, short pitch, no hero photo; résumé page shares same bg (hero photo removed); SW **kv-v50**; live https://lilkunal.github.io/ (deploy `6954322`)
- [x] **Kunal hero photo treatment** — portrait moved to `.hero-editorial__photo-bg` (z-index 0, opacity 0.14–0.22 via CSS vars, grayscale + paper scrim); typography z-index 2+ with text-shadow; AI lens → mood board tiles (0.28–0.32 opacity + scrim captions); résumé intro uses 8% bg photo not portrait; scroll-motion/animations updated; SW **kv-v49**; live https://lilkunal.github.io/ (deploy `f16485d`)
- [x] **Kunal editorial hero + deploy** — Bazil-style `hero--editorial`, AI lens gallery, `js/scroll-motion.js` (hero typography shrink/parallax + section title scrub), theme-aware `nav--on-editorial`, résumé photo on `resume/index.html`; all download/hire links → `assets/Kunal-Varshney-Resume.pdf` (hire-me.html auto-downloads PDF); removed `milo-hero.js`; SW **kv-v48**; live https://lilkunal.github.io/ (deploy `f73f94d`)
- [x] **Shweta portfolio redesign (Noola glass × ARGOO cinematic)** — Cormorant/Instrument Serif brand name, Plus Jakarta Sans body, canvas shader atmosphere, text shimmer, clock removed, autoplay proof carousel, richer education/connect copy, hire-me + full résumé showcase, new social hero SVGs; light/dark toggle kept; live `docs/` Pages
- [x] **Shweta live URL** — https://tiwarishweta03.github.io/
- [x] **Kunal portfolio GA consent mode** — region-aware defaults in `js/analytics.js` (EEA deny all, rest grant analytics); SW **kv-v44**; live deploy `4167d10`
- [x] **Shweta Tiwari portfolio** (`projects/shweta-portfolio/`) — full HRBP job-search site: Realtime Colors tokens, Motion carousel / infinite skills slider, social thumbnails (LinkedIn/Instagram/Facebook), WhatsApp + email + CV download, Person JSON-LD; resume at `public/ShwetaTiwariResume2026.pdf`
- [x] **Shweta light/dark theme** — sun/moon toggle in nav, `localStorage` key `shweta_theme`, FOUC-safe init in `index.html`; mobile-first responsive pass (~360/768/1024+)
- [x] **Shweta anime.js v4** — hero `createTimeline` entrance, `AnimeReveal` scroll reveals, skill-chip stagger energy, `data-anime-hover` micro-interactions, theme-toggle icon spin; Motion kept for carousel/slider
- [x] **Shweta GitHub** — https://github.com/tiwarishweta03/Tiwarishweta.git (push as collaborator **lilkunal**)
- [x] Unified workspace setup (ECC, MCP, rules, extensions)
- [x] MCP live-tested: chrome-devtools, github, context7
- [x] **Imported & organized laptop folder** into `projects/`
- [x] Project index: `docs/projects/INDEX.md`
- [x] **Kunal portfolio redesign** (`projects/kunal-portfolio/`) â€” "Nocturne Studio" theme: Syne + DM Sans, glass UI, animated shader hero, services carousel (anime.js), location/IP feature removed, pixel/retro aesthetic removed
- [x] **Singularity Forge** added to portfolio work section with scroll parallax panels (`work-parallax.js`, Motion-style)
- [x] **Kunal portfolio image fix + full deploy** — all hero stickers, CV carousel, work section, and video posters bundled locally under `assets/` (no dead Unsplash URLs); service worker **`kv-v19`** precaches resume; live at https://lilkunal.github.io/
- [x] **Atul Shiv Shakti astrologer site** (`projects/atul-shiv-shakti-astrologer/`) â€” React+Vite+Tailwind template, logo, client pitch & checklist docs, local dev at http://localhost:5173
- [x] **Ace Factor Fitness site** (`projects/ace-factor-fitness/`) — React+Vite+Tailwind, **multi-page** (react-router-dom): `/`, `/plans`, `/gallery`, `/wellness`, `/contact`, `/coaches`, `/coaches/:slug`; **PageHero** banners; **3 coach profiles** scraped via instaloader; GitHub Pages config (`base: /ace-factor-fitness/`, `npm run deploy`); git repo initialized locally — **push pending auth** to https://github.com/lilkunal/ace-factor-fitness.git
- [x] **Ace Factor water reminder** — simple frosted bubble (`bg-charcoal/40` + blur), soft Web Audio pop on first show; message cycles without re-popping
- [x] **Ace Factor mobile + theme** — fixed smashed mobile nav, float overlaps, hero CTA crowding; light/dark theme toggle (sun/moon) with `localStorage` + FOUC-safe init; deployed
- [x] **Kunal job search pack** — `docs/job-search/` (LinkedIn headline/About + 3 résumé variants); printable **hire-me** at https://lilkunal.github.io/assets/hire-me.html; portfolio + résumé copy updated for **AI-assisted web design** (Claude/Cursor); SW **`kv-v23`**; deployed `e55ecad`
- [x] **Kunal portfolio corrections** — B.Tech CS · ACET · **2020** everywhere; **Singularity Forge removed** from work/projects; 3-project carousel; SW **`kv-v24`**; deployed
- [x] **Remote employers research** — `projects/kunal-portfolio/docs/job-search/remote-companies-research.md` (29 companies; top fits: ElevenLabs, GitLab, Canonical)
- [x] **ElevenLabs apply pack** — cover letter (full + short), Ashby form answers (4 Qs), top-5 apply checklist under `projects/kunal-portfolio/docs/job-search/`

- [x] **Kunal portfolio mobile pass** — hero deck 48px nav row + swipe hint, deck-wrap z-index/touch fixes, reduced sticker clutter, light/dark section handoff, carousel/contact mobile polish; SW **`kv-v34`**; live https://lilkunal.github.io/ (deploy `56f1e2c`)

- [x] **Kunal portfolio GSC verification** — `google21590d7e6e6957f0.html` at site root (HTML file upload method; `gscVerification` in `site-config.js` not needed); live https://lilkunal.github.io/google21590d7e6e6957f0.html (deploy `927b505`)
- [x] **Kunal portfolio Ace Factor in Work** — row 03 linking to https://lilkunal.github.io/ace-factor-fitness/; live client sites count 4; SW **kv-v43**; deploy `81ffaa3`
- [x] **Kunal portfolio 9/10 free upgrades (deployed)** - work/padma.html case study; css/upgrade-sections.css (availability badge, AI process, testimonials, site tour); js/site-tour.js (60s guided tour); index.html (nav availability, trimmed stickers, proof section, AI process, site tour, metrics strip); js/animations.js inView for new sections; SW **kv-v41**; sitemap.xml includes Padma case study; live https://lilkunal.github.io/ (deploy ce48801)
- [x] **Kunal portfolio sync from live** — pulled `lilkunal.github.io` commits `95f84a3` (Instagram contact section + `js/instagram.js`) and `ec6fd26` (scroll-driven work image stretch + `js/stretch-reveal.js`); SW **`kv-v37`**; local `projects/kunal-portfolio/` mirrored

- [x] **Padma theme picker** — Light/Warm/Dark icon buttons (desktop nav + mobile drawer); softer dark mode
- [x] **Padma currency switch** — `#curSelect` visible in desktop nav; mobile in drawer; saves `padma_cur` → full page reload; all prices via `Store.money()`; cache **v=62**
- [x] **Padma Vercel prod deploy** — theme work live on https://padmalights.com; currency v62 **not yet deployed** (local only until push/deploy)

- [x] **Padma ERP Phase 1** (`projects/padma-erp/`) — FastAPI + React dashboard; 201 products / 270 variants seeded from `padmalights/js/data.js`; modules: Products, Inventory, Orders, Customers
- [x] **BVP Aligarh certificates v2** — rebuilt from the supplied reference at `projects/bvp-certificates/v2/delivery/`; 5 print PNGs (3072×2193), browser-rendered Hindi, exact header/footer artwork, photos a→1 … e→5

## Projects organized

| Folder | Claude chat | Site |
|--------|-------------|------|
| `projects/padmalights/` | PADMA CODE | padmalights.com |
| `projects/padma-cat-ecommerce/` | cat + ecommerce | Padma + Telegram bot |
| `projects/jai-home-care/` | Jaishiv medical | Home care landing |
| `projects/kunal-portfolio/` | Kunal portfolio | Personal site |
| `projects/padma-erp/` | Padma ERP | Internal ERP (Phase 1) |
| `projects/padma-business-assets/` | AI photography, nightly report | Business assets |
| `projects/padma-website-pricing/` | â€” | Price lists |
| `projects/aakash-study-notes/` | Computer networking | PDF notes |
| `projects/vcf-portraits/` | â€” | VCF photos |
| `projects/need-fix-photos/` | â€” | Photos to retouch |
| `projects/ace-factor-fitness/` | Ace Factor gym | Gym landing page |
| `projects/shweta-portfolio/` | Shweta HR portfolio | Job-search portfolio |

**Not found in import:** yogi-2011-enchanted-plaza (may be laptop-only chat)

## In progress

- [x] **BVP Aligarh certificates v2** (`projects/bvp-certificates/v2/delivery/`) — 5 print-ready PNGs (3072×2193), rebuilt after rejecting the first draft
- [x] **Padma Vercel Git** — `padma-enterprises` connected to `padmalights/Padma-website` (auto-deploy on push)
- [ ] **Padma ERP Phase 2** — import `New Weight and Rate 2026.xlsx`, proforma PDF, order create UI
- [ ] **Padma CRM** — separate app; UAE + India dealer leads
- [ ] Revoke exposed GitHub token, create fresh one
- [ ] Delete empty `laptop/` folder after verify
- [ ] Find yogi-2011-enchanted-plaza files if they exist elsewhere
- [x] **Ace Factor Fitness GitHub push** — repo https://github.com/lilkunal/ace-factor-fitness.git on `main` (`feeb2f9`); GitHub Pages live at https://lilkunal.github.io/ace-factor-fitness/
- [ ] Deploy **jai-home-care** to GitHub Pages (add live URL to portfolio work panel)

## Next

1. **Kunal:** Submit ElevenLabs Website Designer application using `elevenlabs-application-answers.md` + cover letter
2. **Kunal:** Apply GitLab Customer Success Engineer, India (Greenhouse) if pursuing support path
3. **Padma:** Deploy currency v62 — `vercel deploy --prod` from `projects/padmalights/` (or push to `padmalights/Padma-website`)
4. **Padma:** `gh auth login` as **padmalights** → `git push origin main` from `projects/padmalights/`
5. Optional: delete unused https://github.com/lilkunal/Padma--Website if no longer needed

## Decisions

- **Project layout:** `projects/<slug>/` per Claude chat / business
- **Sync:** Git + this file (not Claude chat history)
- **padmalights.com** = primary business site in `projects/padmalights/`
- **Padma stack:** GitHub **padmalights** + Vercel **padmaenterprises55@gmail.com** (not lilkunal — personal account is separate)

