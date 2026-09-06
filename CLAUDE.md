## Commands
- No build/test/lint tooling — static HTML/CSS/JS, no dependencies, no build step (README.md).
- Local dev: `python3 -m http.server 8000` from repo root, then open `http://localhost:8000/` (README.md).

## Rules
- No build step, no dependencies, no external CDNs — keep it plain HTML/CSS/JS (README.md).
- Do not remove `.nojekyll` — it lets GitHub Pages serve `assets/` untouched (README.md).
- All guide content goes in `assets/js/data.js` as section objects with `blocks`/`qa`; adding a section there is enough to get TOC, checkboxes, progress, and search — "no other changes needed" (README.md).

## Read first
- README.md
- index.html
- assets/js/app.js

Architecture: see ARCHITECTURE.md — read before structural changes
