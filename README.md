# WordPress Mastery — Interactive Study Guide

A self-contained, static study site that turns a full **WordPress developer interview
guide** (22 sections — architecture, hooks, querying, security, REST, Gutenberg, and more)
into an interactive **checklist you can tick off as you learn**. Built to run on GitHub Pages.

**Live site:** https://alphaman-0.github.io/WordPress/ *(after enabling Pages — see below)*

## What it does

- 📚 **All 22 sections** on one page — concepts, code samples, tables, and interview Q&A.
- ✅ **Checklist / todo** — mark each **section** "Mastered" and each **Q&A** "I can answer this".
- 📈 **Progress tracking** — one overall %, a "sections mastered X / 22" counter, and a mastery
  tier badge that climbs **Novice → Apprentice → Intermediate → Advanced → WordPress Master 🏆**.
- 🎴 **Flashcard mode** — hide every answer and self-test; reveal + "I knew this" to grade yourself.
- 🔎 **Live search** over concepts, code, and questions.
- 🌙 **Dark / light mode**, syntax-highlighted code, one-click **copy**, responsive layout, print-friendly.
- 💾 **Progress is saved in your browser** (localStorage) — it persists across visits on that device.
  A **Reset progress** button clears it.

No build step, no dependencies, no external CDNs — plain HTML/CSS/JS.

## Files

```
index.html              # page shell
assets/css/styles.css   # design system (light + dark), layout, components
assets/js/data.js       # the full guide content (single source of truth)
assets/js/highlight.js  # tiny self-contained syntax highlighter
assets/js/app.js        # rendering + checklist/progress/search/theme/flashcards
.nojekyll               # let GitHub Pages serve assets/ untouched
```

## Run locally

Any static server works. From the repo root:

```bash
python3 -m http.server 8000
# then open http://localhost:8000/
```

(You can also just double-click `index.html` — content is inlined, so it works via `file://` too.)

## Deploy to GitHub Pages

1. Commit and push these files to the `main` branch.
2. On GitHub: **Settings → Pages → Build and deployment → Deploy from a branch**.
3. Set **Branch: `main`**, **Folder: `/ (root)`**, then **Save**.
4. Wait ~1 minute; the site goes live at `https://alphaman-0.github.io/WordPress/`.

The `.nojekyll` file ensures the `assets/` folder is served as-is.

## Editing the content

All content lives in [`assets/js/data.js`](assets/js/data.js). Each section is an object with
`blocks` (prose, code, tables, callouts) and `qa` (question/answer cards). Prose supports
`` `inline code` ``, `**bold**`, and `*italic*`. Add a section and it automatically gets a
table-of-contents entry, checkboxes, progress, and search — no other changes needed.
