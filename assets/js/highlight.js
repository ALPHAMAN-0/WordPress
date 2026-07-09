/* =========================================================================
   Tiny dependency-free syntax highlighter.
   highlight(code, lang) -> HTML-escaped string with <span class="tok-*">.
   Tokenizer approach: one combined regex per language, matched left-to-right,
   so we never re-highlight inside an already-emitted span. Text is always
   HTML-escaped, so output is safe to inject.
   ========================================================================= */
(function (global) {
  function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // Each spec: { cls, re }. Order matters — earlier wins at a given position.
  // Patterns must use only NON-capturing groups (?:...) so group indexing
  // stays 1:1 with specs.
  var KW = {
    php:
      "abstract|and|array|as|bool|break|callable|case|catch|class|clone|const|continue|declare|" +
      "default|die|do|echo|else|elseif|empty|endfor|endforeach|endif|endswitch|endwhile|enum|exit|" +
      "extends|final|finally|float|fn|for|foreach|function|global|goto|if|implements|include|" +
      "include_once|instanceof|insteadof|int|interface|isset|list|match|namespace|new|null|or|print|" +
      "private|protected|public|readonly|require|require_once|return|self|static|string|switch|throw|" +
      "trait|true|false|try|unset|use|var|void|while|xor|yield",
    js:
      "async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|export|" +
      "extends|false|finally|for|from|function|if|import|in|instanceof|let|new|null|of|return|super|" +
      "switch|this|throw|true|try|typeof|undefined|var|void|while|yield",
    sql:
      "SELECT|FROM|WHERE|AND|OR|NOT|INSERT|INTO|VALUES|UPDATE|SET|DELETE|JOIN|LEFT|RIGHT|INNER|OUTER|" +
      "ON|AS|ORDER|BY|GROUP|LIMIT|OFFSET|DESC|ASC|LIKE|IN|IS|NULL|COUNT|DISTINCT|CREATE|TABLE|PRIMARY|KEY",
    css: "",
    json: "",
    bash:
      "if|then|else|fi|for|in|do|done|while|case|esac|function|return|export|local|echo|cd|sudo",
  };

  function words(list) {
    return "\\b(?:" + list + ")\\b";
  }

  var SPECS = {
    php: [
      { cls: "comment", re: /\/\*[\s\S]*?\*\/|\/\/[^\n]*|#[^\n]*/ },
      { cls: "string", re: /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/ },
      { cls: "variable", re: /\$[A-Za-z_]\w*/ },
      { cls: "keyword", re: new RegExp(words(KW.php), "i") },
      { cls: "number", re: /\b\d[\d.]*\b/ },
      { cls: "function", re: /[A-Za-z_]\w*(?=\s*\()/ },
    ],
    js: [
      { cls: "comment", re: /\/\*[\s\S]*?\*\/|\/\/[^\n]*/ },
      { cls: "string", re: /`(?:\\.|[^`\\])*`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/ },
      { cls: "keyword", re: new RegExp(words(KW.js)) },
      { cls: "number", re: /\b\d[\d.]*\b/ },
      { cls: "function", re: /[A-Za-z_$][\w$]*(?=\s*\()/ },
    ],
    sql: [
      { cls: "comment", re: /--[^\n]*|\/\*[\s\S]*?\*\// },
      { cls: "string", re: /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/ },
      { cls: "keyword", re: new RegExp(words(KW.sql), "i") },
      { cls: "variable", re: /%[sdf]|\{\$[^}]*\}/ },
      { cls: "number", re: /\b\d[\d.]*\b/ },
    ],
    css: [
      { cls: "comment", re: /\/\*[\s\S]*?\*\// },
      { cls: "string", re: /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/ },
      { cls: "number", re: /#[0-9a-fA-F]{3,8}\b|\b\d[\d.]*(?:px|em|rem|%|s|ms|vh|vw|fr|deg)?\b/ },
      { cls: "keyword", re: /@[\w-]+|![\w-]+/ },
      { cls: "property", re: /[A-Za-z-]+(?=\s*:)/ },
    ],
    json: [
      { cls: "property", re: /"(?:\\.|[^"\\])*"(?=\s*:)/ },
      { cls: "string", re: /"(?:\\.|[^"\\])*"/ },
      { cls: "keyword", re: /\b(?:true|false|null)\b/ },
      { cls: "number", re: /-?\b\d[\d.eE+-]*\b/ },
    ],
    bash: [
      { cls: "comment", re: /#[^\n]*/ },
      { cls: "string", re: /"(?:\\.|[^"\\])*"|'[^']*'/ },
      { cls: "variable", re: /\$[A-Za-z_]\w*|\$\{[^}]*\}/ },
      { cls: "keyword", re: new RegExp(words(KW.bash)) },
      { cls: "number", re: /\b\d[\d.]*\b/ },
    ],
  };

  function combined(specs) {
    return new RegExp(
      specs
        .map(function (s) {
          return "(" + s.re.source + ")";
        })
        .join("|"),
      specs.some(function (s) {
        return s.re.flags.indexOf("i") >= 0;
      })
        ? "gi"
        : "g"
    );
  }

  // pre-build combined regexes
  var COMBINED = {};
  Object.keys(SPECS).forEach(function (lang) {
    COMBINED[lang] = combined(SPECS[lang]);
  });

  function highlight(code, lang) {
    var specs = SPECS[lang];
    if (!specs) return esc(code);
    var re = COMBINED[lang];
    re.lastIndex = 0;
    var out = "";
    var last = 0;
    var m;
    while ((m = re.exec(code)) !== null) {
      if (m.index > last) out += esc(code.slice(last, m.index));
      var cls = null;
      for (var i = 0; i < specs.length; i++) {
        if (m[i + 1] !== undefined) {
          cls = specs[i].cls;
          break;
        }
      }
      out += '<span class="tok-' + cls + '">' + esc(m[0]) + "</span>";
      last = m.index + m[0].length;
      if (m[0].length === 0) re.lastIndex++; // guard against zero-width loop
    }
    out += esc(code.slice(last));
    return out;
  }

  global.WPHighlight = { highlight: highlight, escapeHtml: esc };
})(window);
