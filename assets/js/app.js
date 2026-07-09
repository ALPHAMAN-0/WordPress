/* =========================================================================
   WordPress Mastery — app logic
   Renders GUIDE into the DOM and wires the checklist, progress, search,
   theme, flashcard mode, copy buttons, and scroll-spy.
   ========================================================================= */
(function () {
  "use strict";

  var G = window.GUIDE;
  var HL = window.WPHighlight;
  var esc = HL.escapeHtml;

  var KEY = "wp-mastery:v1";

  // ---- DOM refs ----
  var $ = function (id) { return document.getElementById(id); };
  var tocEl = $("toc");
  var sectionsEl = $("sections");
  var introEl = $("intro");
  var progressFill = $("progressFill");
  var progressBar = $("progressBar");
  var progressPct = $("progressPct");
  var sectionCount = $("sectionCount");
  var tierBadge = $("tierBadge");
  var searchInput = $("search");
  var clearSearchBtn = $("clearSearch");
  var themeBtn = $("themeBtn");
  var flashcardBtn = $("flashcardBtn");
  var resetBtn = $("resetBtn");
  var noResults = $("noResults");
  var menuBtn = $("menuBtn");
  var scrim = $("scrim");
  var toastEl = $("toast");

  // ---- state ----
  var state = { checks: {}, theme: null, flashcard: false };
  (function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          state.checks = parsed.checks || {};
          state.theme = parsed.theme || null;
          state.flashcard = !!parsed.flashcard;
        }
      }
    } catch (e) { /* storage unavailable — run in-memory */ }
  })();
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }
  function setCheck(id, val) {
    if (val) state.checks[id] = true; else delete state.checks[id];
    save();
  }

  // ---- inline markdown-ish formatter (escape first, then bold/italic/code) ----
  function fmt(s) {
    var out = esc(String(s));
    out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    out = out.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    out = out.replace(/`([^`]+)`/g, function (_, c) { return '<code class="inline">' + c + "</code>"; });
    return out;
  }

  // ---- id helpers ----
  function secId(sec) { return "sec:" + sec.id; }
  function qaId(sec, i) { return "qa:" + sec.id + ":" + i; }

  var ALL_IDS = [];
  G.sections.forEach(function (sec) {
    ALL_IDS.push(secId(sec));
    (sec.qa || []).forEach(function (_, i) { ALL_IDS.push(qaId(sec, i)); });
  });

  // ---- search haystacks ----
  G.sections.forEach(function (sec) {
    var parts = [sec.title];
    sec.blocks.forEach(function (b) {
      if (b.text) parts.push(b.text);
      if (b.items) parts.push(b.items.join(" "));
      if (b.code) parts.push(b.code);
      if (b.headers) parts.push(b.headers.join(" "));
      if (b.rows) b.rows.forEach(function (r) { parts.push(r.join(" ")); });
    });
    (sec.qa || []).forEach(function (item) { parts.push(item.q, item.a); });
    sec._hay = parts.join(" ").toLowerCase();
  });

  // ---- renderers ----
  function renderCode(b) {
    var lang = b.lang || "text";
    var html = HL.highlight(b.code, lang);
    return (
      '<figure class="code">' +
      '<div class="code-bar"><span class="code-lang">' + esc(lang) + "</span>" +
      '<button class="copy-btn" type="button">Copy</button></div>' +
      '<pre><code class="lang-' + esc(lang) + '">' + html + "</code></pre>" +
      "</figure>"
    );
  }

  function renderBlock(b) {
    switch (b.type) {
      case "p": return "<p>" + fmt(b.text) + "</p>";
      case "subhead": return '<h3 class="subhead">' + fmt(b.text) + "</h3>";
      case "list": {
        var tag = b.ordered ? "ol" : "ul";
        return "<" + tag + ">" + b.items.map(function (it) { return "<li>" + fmt(it) + "</li>"; }).join("") + "</" + tag + ">";
      }
      case "code": return renderCode(b);
      case "callout": return '<div class="callout callout-' + (b.variant || "tip") + '">' + fmt(b.text) + "</div>";
      case "table": {
        var thead = "<thead><tr>" + b.headers.map(function (h) { return "<th>" + fmt(h) + "</th>"; }).join("") + "</tr></thead>";
        var tbody = "<tbody>" + b.rows.map(function (r) {
          return "<tr>" + r.map(function (c) { return "<td>" + fmt(c) + "</td>"; }).join("") + "</tr>";
        }).join("") + "</tbody>";
        return '<div class="table-wrap"><table>' + thead + tbody + "</table></div>";
      }
      default: return "";
    }
  }

  function renderQA(sec) {
    if (!sec.qa || !sec.qa.length) return "";
    var cards = sec.qa.map(function (item, i) {
      var id = qaId(sec, i);
      var known = !!state.checks[id];
      return (
        '<div class="qa' + (known ? " known" : "") + '" data-id="' + id + '">' +
        '<div class="qa-row">' +
        '<input type="checkbox" class="qa-check" ' + (known ? "checked" : "") + ' aria-label="Mark: I can answer this" />' +
        '<button class="qa-toggle" type="button" aria-expanded="false">' +
        '<span class="chev" aria-hidden="true">▸</span>' +
        '<span><span class="qa-q-label">Q:</span> ' + fmt(item.q) + "</span></button>" +
        "</div>" +
        '<div class="qa-answer"><span class="a-label">A:</span>' + fmt(item.a) +
        '<div><button class="knew-btn" type="button">✓ I knew this</button></div></div>' +
        "</div>"
      );
    }).join("");
    var label = sec.id === "cheat-sheet" ? "Flip cards" : "Interview Q&amp;A";
    return '<div class="qa-block"><div class="qa-block-title">' + label +
      ' <span class="qa-progress"></span></div>' + cards + "</div>";
  }

  function renderSection(sec) {
    var mastered = !!state.checks[secId(sec)];
    var body = sec.blocks.map(renderBlock).join("") + renderQA(sec);
    return (
      '<section class="section' + (mastered ? " mastered" : "") + '" id="' + sec.id + '" data-id="' + sec.id + '">' +
      '<div class="section-head">' +
      '<span class="section-num">' + String(sec.number).padStart(2, "0") + "</span>" +
      "<h2>" + esc(sec.title) + "</h2>" +
      '<span class="section-mini"></span>' +
      '<label class="master-toggle"><input type="checkbox" class="sec-check" ' +
      (mastered ? "checked" : "") + ' /> Mastered</label>' +
      "</div>" +
      '<div class="section-body">' + body + "</div>" +
      "</section>"
    );
  }

  function renderTOC() {
    var links = G.sections.map(function (sec) {
      var done = !!state.checks[secId(sec)];
      return (
        '<a class="toc-link' + (done ? " done" : "") + '" href="#' + sec.id + '" data-target="' + sec.id + '">' +
        '<span class="toc-num">' + sec.number + "</span>" +
        '<span class="toc-title">' + esc(sec.title) + "</span>" +
        '<span class="toc-state" aria-hidden="true"></span></a>'
      );
    }).join("");
    tocEl.innerHTML = '<div class="toc-heading">Contents</div>' + links;
  }

  function renderIntro() {
    introEl.innerHTML =
      "<h1>" + esc(G.title) + "</h1>" +
      "<p>" + esc(G.tagline) + "</p>" +
      '<div class="how"><h3>How to use this guide</h3><ol>' +
      G.how.map(function (s) { return "<li>" + fmt(s) + "</li>"; }).join("") +
      "</ol></div>";
  }

  // ---- progress ----
  function tierFor(pct) {
    if (pct >= 100) return { label: "WordPress Master 🏆", cls: "tier-master" };
    if (pct >= 75) return { label: "Advanced", cls: "tier-advanced" };
    if (pct >= 50) return { label: "Intermediate", cls: "" };
    if (pct >= 25) return { label: "Apprentice", cls: "" };
    return { label: "Novice", cls: "" };
  }

  function updateSectionMeta(sec) {
    var qa = sec.qa || [];
    var known = 0;
    for (var i = 0; i < qa.length; i++) if (state.checks[qaId(sec, i)]) known++;
    var el = document.getElementById(sec.id);
    if (el) {
      var mini = el.querySelector(".section-mini");
      if (mini) mini.textContent = qa.length ? ("Q&A " + known + "/" + qa.length) : "";
      var qp = el.querySelector(".qa-progress");
      if (qp) qp.textContent = qa.length ? (known + "/" + qa.length) : "";
      el.classList.toggle("mastered", !!state.checks[secId(sec)]);
    }
    var link = tocEl.querySelector('.toc-link[data-target="' + sec.id + '"]');
    if (link) link.classList.toggle("done", !!state.checks[secId(sec)]);
  }

  function updateProgress() {
    var total = ALL_IDS.length;
    var checked = 0;
    for (var i = 0; i < ALL_IDS.length; i++) if (state.checks[ALL_IDS[i]]) checked++;
    var pct = total ? Math.round((checked / total) * 100) : 0;

    var secTotal = G.sections.length;
    var secDone = 0;
    G.sections.forEach(function (sec) { if (state.checks[secId(sec)]) secDone++; });

    progressFill.style.width = pct + "%";
    progressBar.setAttribute("aria-valuenow", String(pct));
    progressPct.textContent = pct + "%";
    sectionCount.textContent = secDone + " / " + secTotal + " sections mastered";

    var tier = tierFor(pct);
    tierBadge.textContent = tier.label;
    tierBadge.className = "tier-badge " + tier.cls;

    G.sections.forEach(updateSectionMeta);
  }

  // ---- theme ----
  function applyTheme() {
    document.documentElement.setAttribute("data-theme", state.theme);
    themeBtn.textContent = state.theme === "dark" ? "☀️" : "🌙";
    themeBtn.setAttribute("aria-label", state.theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
  }
  themeBtn.addEventListener("click", function () {
    state.theme = state.theme === "dark" ? "light" : "dark";
    applyTheme(); save();
  });

  // ---- flashcard mode ----
  function applyFlashcard() {
    document.body.classList.toggle("flashcard-mode", state.flashcard);
    flashcardBtn.setAttribute("aria-pressed", state.flashcard ? "true" : "false");
    if (state.flashcard) {
      Array.prototype.forEach.call(document.querySelectorAll(".qa.open, .qa.revealed"), function (q) {
        q.classList.remove("open", "revealed");
        var t = q.querySelector(".qa-toggle");
        if (t) t.setAttribute("aria-expanded", "false");
      });
    }
  }
  flashcardBtn.addEventListener("click", function () {
    state.flashcard = !state.flashcard;
    applyFlashcard(); save();
    toast(state.flashcard ? "Flashcard mode: answers hidden" : "Reading mode");
  });

  // ---- copy ----
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.hidden = false;
    // force reflow so the transition runs
    void toastEl.offsetWidth;
    toastEl.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(function () {
      toastEl.classList.remove("show");
      setTimeout(function () { toastEl.hidden = true; }, 250);
    }, 1600);
  }
  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta);
  }
  function handleCopy(btn) {
    var fig = btn.closest("figure.code");
    var code = fig ? fig.querySelector("code") : null;
    if (!code) return;
    var text = code.textContent;
    var done = function () {
      btn.textContent = "Copied!";
      btn.classList.add("copied");
      setTimeout(function () { btn.textContent = "Copy"; btn.classList.remove("copied"); }, 1400);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); done(); });
    } else {
      fallbackCopy(text); done();
    }
  }

  // ---- delegated events on the sections container ----
  sectionsEl.addEventListener("click", function (e) {
    var copyBtn = e.target.closest(".copy-btn");
    if (copyBtn) { handleCopy(copyBtn); return; }

    var knew = e.target.closest(".knew-btn");
    if (knew) {
      var qaK = knew.closest(".qa");
      setCheck(qaK.dataset.id, true);
      var cb = qaK.querySelector(".qa-check");
      if (cb) cb.checked = true;
      qaK.classList.add("known");
      updateProgress();
      return;
    }

    var toggle = e.target.closest(".qa-toggle");
    if (toggle) {
      var qaEl = toggle.closest(".qa");
      var open = qaEl.classList.toggle("open");
      qaEl.classList.toggle("revealed", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      return;
    }
  });

  sectionsEl.addEventListener("change", function (e) {
    var t = e.target;
    if (t.classList.contains("sec-check")) {
      var sec = t.closest(".section");
      setCheck("sec:" + sec.dataset.id, t.checked);
      updateProgress();
    } else if (t.classList.contains("qa-check")) {
      var qa = t.closest(".qa");
      setCheck(qa.dataset.id, t.checked);
      qa.classList.toggle("known", t.checked);
      updateProgress();
    }
  });

  // ---- search ----
  function runSearch() {
    var q = searchInput.value.trim().toLowerCase();
    clearSearchBtn.hidden = !q;
    var anyVisible = false;

    G.sections.forEach(function (sec) {
      var secEl = document.getElementById(sec.id);
      var link = tocEl.querySelector('.toc-link[data-target="' + sec.id + '"]');
      var qaEls = secEl.querySelectorAll(".qa");

      if (!q) {
        secEl.classList.remove("filtered-out");
        if (link) link.classList.remove("filtered-out");
        Array.prototype.forEach.call(qaEls, function (el) { el.classList.remove("filtered-out"); });
        anyVisible = true;
        return;
      }

      var secMatch = sec._hay.indexOf(q) >= 0;
      var qaVisible = 0;
      (sec.qa || []).forEach(function (item, i) {
        var hit = secMatch || (item.q + " " + item.a).toLowerCase().indexOf(q) >= 0;
        if (qaEls[i]) qaEls[i].classList.toggle("filtered-out", !hit);
        if (hit) qaVisible++;
      });

      var visible = secMatch || qaVisible > 0;
      secEl.classList.toggle("filtered-out", !visible);
      if (link) link.classList.toggle("filtered-out", !visible);
      if (visible) anyVisible = true;
    });

    noResults.hidden = anyVisible;
  }
  searchInput.addEventListener("input", runSearch);
  clearSearchBtn.addEventListener("click", function () {
    searchInput.value = "";
    runSearch();
    searchInput.focus();
  });

  // ---- reset ----
  resetBtn.addEventListener("click", function () {
    if (!window.confirm("Reset all progress? This clears every checkmark saved in this browser.")) return;
    state.checks = {};
    save();
    Array.prototype.forEach.call(document.querySelectorAll(".sec-check, .qa-check"), function (c) { c.checked = false; });
    Array.prototype.forEach.call(document.querySelectorAll(".qa.known"), function (q) { q.classList.remove("known"); });
    updateProgress();
    toast("Progress reset");
  });

  // ---- mobile nav ----
  function closeNav() { document.body.classList.remove("nav-open"); menuBtn.setAttribute("aria-expanded", "false"); }
  menuBtn.addEventListener("click", function () {
    var open = document.body.classList.toggle("nav-open");
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
  });
  scrim.addEventListener("click", closeNav);
  tocEl.addEventListener("click", function (e) {
    if (e.target.closest(".toc-link")) closeNav();
  });

  // ---- scroll-spy ----
  function setActive(id) {
    Array.prototype.forEach.call(tocEl.querySelectorAll(".toc-link"), function (l) {
      l.classList.toggle("active", l.dataset.target === id);
    });
  }

  // ---- boot ----
  renderIntro();
  renderTOC();
  sectionsEl.innerHTML = G.sections.map(renderSection).join("");

  if (!state.theme) {
    state.theme = (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light";
  }
  applyTheme();
  applyFlashcard();
  updateProgress();

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: "-130px 0px -72% 0px", threshold: 0 });
    Array.prototype.forEach.call(sectionsEl.querySelectorAll(".section"), function (s) { observer.observe(s); });
  }

  // expose a tiny hook for debugging/verification
  window.__WPM = { state: state, allIds: ALL_IDS };
})();
