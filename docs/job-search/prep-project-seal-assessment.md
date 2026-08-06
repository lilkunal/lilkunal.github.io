# Project Seal — Annotator Screening Cheat Sheet

**Pass:** 80% (12/15) · **Attempts:** 1 · **Time:** ~45–60 min · **No save** — one sitting only  
**Before Start:** Read the project instructions on the page carefully. Then start only when you have a full hour free.

This is a **search / research QA** annotator test (not visual design). You judge prompts, submissions, and model answers for research tasks.

---

## Golden rules (use every question)

1. **Follow their rubric** over your personal taste.  
2. A good research question has **one clear, checkable answer**.  
3. Prefer **specific + dated** facts over vague / “current” without an anchor.  
4. **Justify briefly** — name the defect category, then one sentence why.  
5. When stuck between two labels, pick the **primary** failure (the one that breaks the task first).

---

## Section 1 — Prompt Evaluation  
*Is this prompt valid for a research / search task?*

| Issue | Meaning | Quick test |
|-------|---------|------------|
| **Timelessness failure** | Answer will go stale; “current / now / latest” with no date | “Who is the CEO of X?” without “as of DATE” → often timelessness fail |
| **Binary answers** | Yes/No only; too shallow for research | “Did Apple release iPhone 15?” → usually bad for this project |
| **Process instructions** | Asks how to do steps / write a tutorial, not a fact to look up | “Explain how to file taxes in India” → process, not search fact |
| **Underconstrained** | Many answers could fit; not unique | “Name a large US tech company” → underconstrained |

**Valid prompt pattern:**  
> “As of 31 Dec 2024, what was the closing share price of [TICKER] on the NYSE according to [source type]?”

One person / one number / one date / verifiable.

---

## Section 2 — Submission Review  
*Someone submitted a search question — is it OK?*

| Issue | Meaning |
|-------|---------|
| **False premise** | Assumes something false or unverifiable (“the secret CEO of a private co. who must disclose…”) |
| **Self-containment failure** | Needs missing context (who is “he”? which “Q3”? which country?) |
| **URL verification issues** | Relies on a dead / private / unverifiable link as the only proof |
| **Doesn’t require research** | Answerable from common knowledge with no need to search (trivia everyone knows, pure math) |

Ask: *Could a stranger answer this from the text alone using web research?* If no → self-containment or underconstrained.

---

## Section 3 — Written Evaluation  
*Grade a written analysis of a submission.*

Look for:
- **Wrong defect label** (called it timelessness when it’s underconstrained)
- **Missing a clear factual error** in the write-up
- **Bad sourcing** (no source, blog rumor, can’t verify)
- **Overclaiming** (says “pass” when a real defect exists)

Your job: spot whether the **evaluator’s write-up** is accurate — not rewrite the whole essay.

---

## Section 4 — Construct Your Own  
*Write one valid search question from scratch.*

Checklist before you submit:
- [ ] Single, unambiguous answer (name, number, date, or short fact)
- [ ] Time-anchored if the fact can change (`as of YYYY-MM-DD`)
- [ ] Self-contained (no “this company” without naming it)
- [ ] Needs real research (not “what is 2+2”)
- [ ] Not a how-to / tutorial / opinion piece
- [ ] Not yes/no only
- [ ] Premise is true / checkable

**Safe template:**  
> As of [DATE], what was [specific metric] for [named entity], according to [official-style source type]?

Example shape (invent your own real-looking but follow their rules):  
> “As of January 1, 2024, how many member countries did the United Nations have?”

---

## Section 5 — Model Response Evaluation  
*Did the model fail, pass, or is the prompt broken?*

| Label | When to use |
|-------|-------------|
| **Valid failure** | Prompt was fine; model got the fact wrong, hallucinated, or ignored constraints |
| **Pass** | Prompt fine; model answer correct and supported |
| **Prompt defect** | Model “failed” because the **prompt** was bad (underconstrained, false premise, not timeless, etc.) — don’t blame the model |

**Rule of thumb:** If two experts would disagree on the “right” answer → often **prompt defect**, not model failure.

---

## Justifications (keep short)

Pattern:  
> **[Category]** — [one concrete reason].

Examples:
- `Timelessness failure — asks for the “current” CEO with no as-of date.`
- `Underconstrained — many cities satisfy “large coastal city.”`
- `Self-containment failure — “the acquisition” is never named.`
- `Valid failure — prompt asks for 2023 revenue; model invents a number with no source.`
- `Prompt defect — question is yes/no and needs no research.`

---

## Day-of setup

1. Phone silent · charger in · 60 free minutes  
2. Read **project instructions** first (even if you skimmed this sheet)  
3. Start assessment — **do not refresh / leave**  
4. ~3 minutes per question; don’t overthink  
5. Bonus task only if time remains after the 15  

---

## Mindset

You’re a **strict QA reviewer**, not a creative writer.  
Find the bug in the prompt/submission/model. Name it. Move on.

Good luck — you need **12/15**. Stay consistent.
