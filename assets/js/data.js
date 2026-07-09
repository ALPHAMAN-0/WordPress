/* =========================================================================
   WordPress Mastery — guide content (single source of truth).
   Prose fields: double-quoted strings; inline code via `backticks`,
   bold via **text**, italic via *text*.
   Code fields: template literals (verbatim). Backslashes are doubled so the
   runtime string keeps them (e.g. `\\d+` -> \d+).
   ========================================================================= */
window.GUIDE = {
  title: "WordPress Mastery",
  tagline: "An interactive study companion — basics to advanced, with a checklist that tracks your progress.",
  how: [
    "Read a section's concept and code until you could re-derive it.",
    "Turn on Flashcards, cover the answers, and respond to each Q out loud.",
    "Tick “I can answer this” per question and “Mastered” per section — your progress is saved in this browser.",
    "Highest-yield topics: the four security pillars (§12), hooks (§6), and querying (§11). Be ready to write a CPT, a filter, and a secure meta-box save from memory.",
  ],

  sections: [
    /* ===================== 1 ===================== */
    {
      id: "core-architecture",
      number: 1,
      title: "Core Architecture & How WordPress Works",
      blocks: [
        { type: "p", text: "WordPress is a PHP application backed by MySQL/MariaDB. Every front-end request is routed through a single entry point and assembled dynamically — there are no static HTML pages by default." },
        { type: "subhead", text: "The request lifecycle" },
        { type: "list", ordered: true, items: [
          "A request hits `index.php`, which defines `WP_USE_THEMES` and loads `wp-blog-header.php`.",
          "`wp-load.php` loads `wp-config.php` (DB credentials, constants) and then `wp-settings.php`.",
          "`wp-settings.php` loads the core, sets up the `$wpdb` object, loads must-use plugins, active plugins, the current theme's `functions.php`, and fires the `init` hook.",
          "**`WP` class + `WP_Query`**: WordPress parses the URL, matches it against rewrite rules, and builds the main query (`$wp_query`).",
          "The **template loader** uses the template hierarchy to pick the right theme file (e.g. `single.php`).",
          "The template runs **The Loop**, outputs HTML, and the response is sent.",
        ] },
        { type: "p", text: "Understanding this order matters because it explains *why* you hook certain code to `init` vs `plugins_loaded` vs `wp_loaded`, and why `functions.php` loads after plugins." },
      ],
      qa: [
        { q: "Walk me through what happens when a WordPress page loads.", a: "The request goes to `index.php`, which loads `wp-blog-header.php` → `wp-load.php` (config + core) → `wp-settings.php` (sets up `$wpdb`, loads mu-plugins, active plugins, and the theme's `functions.php`, fires `init`). WordPress then parses the URL into query variables, runs the main `WP_Query`, and the template loader selects a template via the template hierarchy. That template runs The Loop to render HTML." },
        { q: "What's the difference between WordPress.org and WordPress.com?", a: "`.org` is the self-hosted, open-source software you download and run on your own server with full control over code, themes, plugins, and the database. `.com` is a hosting service run by Automattic where WordPress is managed for you, with restrictions on plugins/themes depending on your plan." },
        { q: "What are must-use plugins?", a: "Plugins placed in `wp-content/mu-plugins/`. They load automatically before regular plugins, can't be disabled from the admin UI, and don't need activation. Good for critical site-wide functionality on managed or multisite setups." },
      ],
    },

    /* ===================== 2 ===================== */
    {
      id: "directory-structure",
      number: 2,
      title: "Directory Structure & wp-config",
      blocks: [
        { type: "p", text: "Know where things live and why." },
        { type: "code", lang: "text", code:
`/
├── wp-admin/           # Admin dashboard core (don't edit)
├── wp-includes/        # Core functions, classes (don't edit)
├── wp-content/         # YOUR stuff lives here
│   ├── themes/
│   ├── plugins/
│   ├── mu-plugins/     # Must-use plugins
│   ├── uploads/        # Media library files
│   └── languages/      # Translation files
├── wp-config.php       # DB credentials + constants
├── index.php           # Front-end entry point
├── .htaccess           # Rewrite rules (Apache)
└── wp-load.php / wp-settings.php / wp-blog-header.php` },
        { type: "callout", variant: "warn", text: "**Golden rule:** never edit core (`wp-admin`, `wp-includes`) — updates will overwrite it. All customization goes in `wp-content`." },
        { type: "subhead", text: "Key wp-config.php constants worth memorizing" },
        { type: "code", lang: "php", code:
`define( 'DB_NAME', 'database' );
define( 'DB_USER', 'user' );
define( 'DB_PASSWORD', 'pass' );
define( 'DB_HOST', 'localhost' );
$table_prefix = 'wp_';                    // change for security / multiple installs
define( 'WP_DEBUG', true );               // enable debugging
define( 'WP_DEBUG_LOG', true );           // log to wp-content/debug.log
define( 'WP_DEBUG_DISPLAY', false );      // don't show errors on screen
define( 'DISALLOW_FILE_EDIT', true );     // disable theme/plugin editor in admin
define( 'WP_MEMORY_LIMIT', '256M' );
define( 'AUTOSAVE_INTERVAL', 120 );
define( 'WP_POST_REVISIONS', 5 );         // limit revisions` },
      ],
      qa: [
        { q: "Why shouldn't you edit core files?", a: "WordPress core updates overwrite `wp-admin` and `wp-includes`, so any changes are lost — and modifying core is a security and maintainability risk. Use hooks, child themes, and plugins instead." },
        { q: "How do you enable debugging without showing errors to visitors?", a: "Set `WP_DEBUG` true, `WP_DEBUG_LOG` true (errors go to `wp-content/debug.log`), and `WP_DEBUG_DISPLAY` false so nothing renders on the page." },
        { q: "What's the point of the table prefix?", a: "It namespaces the database tables (default `wp_`). Changing it lets you run multiple WordPress installs in one database and adds a small layer of security-through-obscurity against automated attacks targeting default table names." },
      ],
    },

    /* ===================== 3 ===================== */
    {
      id: "database-schema",
      number: 3,
      title: "The Database Schema",
      blocks: [
        { type: "p", text: "WordPress uses ~12 core tables. Interviewers love this because it reveals whether you understand the data model behind the API functions." },
        { type: "table", headers: ["Table", "Purpose"], rows: [
          ["`wp_posts`", "Posts, pages, attachments, revisions, nav menu items, and **all custom post types**"],
          ["`wp_postmeta`", "Custom fields / metadata for posts (key-value)"],
          ["`wp_options`", "Site-wide settings, plugin/theme options, transients"],
          ["`wp_users`", "User accounts"],
          ["`wp_usermeta`", "User metadata (capabilities, preferences)"],
          ["`wp_terms`", "Category/tag/custom taxonomy terms"],
          ["`wp_termmeta`", "Metadata for terms"],
          ["`wp_term_taxonomy`", "Describes which taxonomy a term belongs to"],
          ["`wp_term_relationships`", "Links posts to terms"],
          ["`wp_comments`", "Comments"],
          ["`wp_commentmeta`", "Comment metadata"],
        ] },
        { type: "subhead", text: "Critical relationships to explain" },
        { type: "list", items: [
          "One post → many rows in `wp_postmeta` (each meta key/value is its own row).",
          "The taxonomy system is three tables: a **term** (`wp_terms`) is linked to a **taxonomy** (`wp_term_taxonomy`), and posts are connected through **relationships** (`wp_term_relationships`). This normalization is why the same term name can exist across different taxonomies.",
        ] },
      ],
      qa: [
        { q: "Where are custom post types stored?", a: "In `wp_posts`, same as regular posts and pages. The `post_type` column distinguishes them. There's no separate table per post type." },
        { q: "Explain how WordPress stores a post's category.", a: "The category name lives in `wp_terms`. `wp_term_taxonomy` marks that term as belonging to the `category` taxonomy and stores the count/parent. `wp_term_relationships` links the post's ID to that term-taxonomy ID. So displaying a post's categories joins all three tables." },
        { q: "How is custom field data stored, and what's the performance implication?", a: "In `wp_postmeta` as key-value rows — one row per meta entry. Querying by meta value (a `meta_query`) can be slow at scale because it joins/filters an unindexed-by-value table. For heavy filtering, you often denormalize into a custom table or a custom taxonomy." },
      ],
    },

    /* ===================== 4 ===================== */
    {
      id: "loop-template-hierarchy",
      number: 4,
      title: "The Loop & Template Hierarchy",
      blocks: [
        { type: "subhead", text: "The Loop" },
        { type: "p", text: "The Loop is the PHP pattern that iterates over the posts returned by the main query and renders them." },
        { type: "code", lang: "php", code:
`if ( have_posts() ) :
    while ( have_posts() ) : the_post();
        the_title( '<h2>', '</h2>' );
        the_content();
    endwhile;
else :
    echo '<p>No posts found.</p>';
endif;` },
        { type: "list", items: [
          "`have_posts()` — are there posts left to display?",
          "`the_post()` — advances the pointer and sets up the global `$post` object so template tags work.",
          "**Template tags** like `the_title()`, `the_content()`, `the_permalink()` only work *inside* the loop because they rely on that global `$post`.",
          "`the_` functions **echo**; `get_the_` functions **return** (e.g. `the_title()` prints, `get_the_title()` returns a string).",
        ] },
        { type: "subhead", text: "Template Hierarchy" },
        { type: "p", text: "When a URL is requested, WordPress picks the most specific matching template file from the active theme, falling back to less specific ones, ending at `index.php`." },
        { type: "p", text: "**Single post:** `single-{post-type}-{slug}.php` → `single-{post-type}.php` → `single.php` → `singular.php` → `index.php`" },
        { type: "p", text: "**Page:** `custom-template.php` (assigned) → `page-{slug}.php` → `page-{id}.php` → `page.php` → `singular.php` → `index.php`" },
        { type: "p", text: "**Category archive:** `category-{slug}.php` → `category-{id}.php` → `category.php` → `archive.php` → `index.php`" },
        { type: "p", text: "Other key templates: `home.php` (blog posts index), `front-page.php` (static front page), `404.php`, `search.php`, `author.php`, `taxonomy-{taxonomy}.php`, `attachment.php`." },
      ],
      qa: [
        { q: "What is The Loop and why is it important?", a: "It's the core mechanism that runs through the posts from the main query. Inside it, `the_post()` sets up the global `$post`, which is what makes template tags like `the_title()` and `the_content()` work. Without the loop, those functions have no post context." },
        { q: "Difference between `the_title()` and `get_the_title()`?", a: "`the_title()` echoes the title directly; `get_the_title()` returns it as a string so you can store or manipulate it. This echo-vs-return pattern is consistent across the `the_*` / `get_the_*` template tag pairs." },
        { q: "A user visits `/blog/hello-world/` (a standard post). Which template loads?", a: "WordPress looks for `single-post-hello-world.php`, then `single-post.php`, then `single.php`, then `singular.php`, and finally `index.php` — using the first that exists." },
        { q: "What's the difference between `front-page.php` and `home.php`?", a: "`front-page.php` is used for whatever is set as the static front page. `home.php` is the template for the blog posts index (the page listing your latest posts). If a static front page is set, `front-page.php` wins for the homepage and `home.php` handles the separate posts page." },
      ],
    },

    /* ===================== 5 ===================== */
    {
      id: "themes-child-themes",
      number: 5,
      title: "Themes & Child Themes",
      blocks: [
        { type: "p", text: "A theme controls presentation. Minimum required files for a classic theme are `style.css` (with a header comment) and `index.php`. `functions.php` is the theme's “plugin” — it hooks into WordPress." },
        { type: "subhead", text: "style.css header" },
        { type: "code", lang: "css", code:
`/*
Theme Name: My Theme
Author: Jane Dev
Version: 1.0
Text Domain: my-theme
*/` },
        { type: "subhead", text: "Child themes" },
        { type: "p", text: "A child theme inherits from a parent theme so you can customize without losing changes on parent updates." },
        { type: "code", lang: "css", code:
`/*
Theme Name: My Child
Template: parent-theme-folder-name
*/` },
        { type: "p", text: "The modern way to load the parent stylesheet is by enqueuing (not `@import`):" },
        { type: "code", lang: "php", code:
`add_action( 'wp_enqueue_scripts', function() {
    wp_enqueue_style( 'parent-style', get_template_directory_uri() . '/style.css' );
} );` },
        { type: "callout", variant: "tip", text: "**Critical function distinction:** `get_template_directory_uri()` → always the **parent** theme's URL. `get_stylesheet_directory_uri()` → the **active** theme (the child, if one is active)." },
        { type: "subhead", text: "Reusable template parts" },
        { type: "code", lang: "php", code:
`get_header();          // loads header.php
get_footer();          // loads footer.php
get_sidebar();         // loads sidebar.php
get_template_part( 'template-parts/content', 'single' );  // loads content-single.php` },
      ],
      qa: [
        { q: "What is a child theme and why use one?", a: "A child theme inherits templates and functionality from a parent theme. You customize in the child, so when the parent updates you don't lose your changes. It's the correct way to modify a third-party theme." },
        { q: "`get_template_directory()` vs `get_stylesheet_directory()`?", a: "`get_template_directory()` points to the parent theme; `get_stylesheet_directory()` points to the active theme (the child when one is active). Use the stylesheet version when you want child-theme-aware paths, and the template version to reliably reference parent assets." },
        { q: "How should a child theme load the parent's styles?", a: "Enqueue the parent stylesheet via `wp_enqueue_style` on the `wp_enqueue_scripts` hook. The old `@import` method is discouraged because it blocks parallel downloading and is slower." },
        { q: "What's the difference between a theme and a plugin?", a: "A theme controls how the site looks and is presentation-focused; only one is active at a time. A plugin adds functionality and should work regardless of the active theme. Rule of thumb: if functionality should survive a theme switch (e.g. a custom post type), it belongs in a plugin, not `functions.php`." },
      ],
    },

    /* ===================== 6 ===================== */
    {
      id: "hooks",
      number: 6,
      title: "Hooks: Actions & Filters",
      blocks: [
        { type: "p", text: "**The single most important WordPress topic.** Hooks let you “hook into” core execution to run your own code without editing core. There are two types:" },
        { type: "list", items: [
          "**Actions** — do something at a specific point (side effects). They don't return anything.",
          "**Filters** — modify and **return** data as it passes through.",
        ] },
        { type: "callout", variant: "tip", text: "**Mnemonic:** *Actions act, filters filter.* A filter **must return a value**; an action doesn't." },
        { type: "subhead", text: "Actions" },
        { type: "code", lang: "php", code:
`// Register a callback on an action
add_action( 'init', 'my_setup_function' );
function my_setup_function() {
    // runs during init
}

// Core (or you) fires the action
do_action( 'init' );` },
        { type: "subhead", text: "Filters" },
        { type: "code", lang: "php", code:
`add_filter( 'the_content', 'append_note' );
function append_note( $content ) {
    return $content . '<p>Thanks for reading!</p>';  // MUST return
}

// Core fires the filter
$content = apply_filters( 'the_content', $content );` },
        { type: "subhead", text: "Priority & accepted args (3rd and 4th parameters)" },
        { type: "code", lang: "php", code:
`add_filter( 'the_content', 'my_filter', 20, 2 );
//                          callback    |   +- number of args passed to callback
//                                      +------ priority (default 10; lower = earlier)` },
        { type: "p", text: "If your callback needs more than one argument, you **must** declare the accepted-args count or the extra args won't be passed." },
        { type: "subhead", text: "Removing hooks" },
        { type: "code", lang: "php", code:
`remove_action( 'wp_head', 'wp_generator' );   // remove WP version meta tag
remove_filter( 'the_content', 'wpautop' );` },
        { type: "p", text: "To remove a hook added by a class instance, you need a reference to the same instance/callback and matching priority." },
        { type: "subhead", text: "Must-know hooks" },
        { type: "table", headers: ["Hook", "Type", "When"], rows: [
          ["`init`", "action", "Core loaded; register CPTs/taxonomies here"],
          ["`wp_enqueue_scripts`", "action", "Enqueue front-end assets"],
          ["`admin_enqueue_scripts`", "action", "Enqueue admin assets"],
          ["`wp_head` / `wp_footer`", "action", "Output in `<head>` / before `</body>`"],
          ["`the_content`", "filter", "Modify post content"],
          ["`save_post`", "action", "After a post is saved"],
          ["`pre_get_posts`", "action", "Modify the query before it runs"],
          ["`admin_menu`", "action", "Add admin menu pages"],
          ["`plugins_loaded`", "action", "All plugins loaded (earlier than `init`)"],
          ["`template_redirect`", "action", "Before template chosen; good for redirects"],
        ] },
      ],
      qa: [
        { q: "What's the difference between an action and a filter?", a: "An action lets you execute code at a certain point and returns nothing — it's for side effects like sending an email or registering a post type. A filter receives a value, modifies it, and must return it — it's for altering data like post content or a query. Actions act; filters filter and return." },
        { q: "What does the priority parameter do?", a: "It controls the order callbacks run on the same hook. Default is 10; lower numbers run earlier, higher run later. It's how you ensure your code runs before or after another callback." },
        { q: "I added a filter but my second parameter is always empty. Why?", a: "You didn't set the accepted-args count (the 4th argument of `add_filter`). WordPress only passes as many args as you declare; the default is 1, so any additional parameters come through empty until you raise it." },
        { q: "How would you remove an action that a plugin registered?", a: "Use `remove_action()` with the exact same hook name, callback, and priority the plugin used, and make sure it runs *after* the plugin registered it. If the callback is a class method on an instance you don't control, you need access to that instance (or a globally stored reference) to pass the same callable." },
        { q: "What's the difference between `do_action` and `add_action`?", a: "`add_action` registers your callback to run when a hook fires. `do_action` is what actually fires the hook, triggering all registered callbacks. You use `do_action` to create your own custom extension points in your plugin/theme." },
      ],
    },

    /* ===================== 7 ===================== */
    {
      id: "enqueuing",
      number: 7,
      title: "Enqueuing Scripts & Styles",
      blocks: [
        { type: "p", text: "Never hardcode `<script>`/`<link>` tags in your templates. Use the enqueue system so WordPress manages dependencies, ordering, versioning, and deduplication." },
        { type: "code", lang: "php", code:
`add_action( 'wp_enqueue_scripts', 'my_assets' );
function my_assets() {
    wp_enqueue_style(
        'my-style',                                   // handle
        get_stylesheet_directory_uri() . '/css/main.css', // src
        array(),                                      // dependencies
        '1.0.0'                                        // version (cache busting)
    );
    wp_enqueue_script(
        'my-script',
        get_stylesheet_directory_uri() . '/js/main.js',
        array( 'jquery' ),                            // depends on jQuery
        '1.0.0',
        true                                          // load in footer
    );
}` },
        { type: "p", text: "**Passing PHP data to JS** (the correct way to expose things like the AJAX URL or a nonce):" },
        { type: "code", lang: "php", code:
`wp_localize_script( 'my-script', 'myData', array(
    'ajaxUrl' => admin_url( 'admin-ajax.php' ),
    'nonce'   => wp_create_nonce( 'my_action' ),
) );
// In JS: myData.ajaxUrl, myData.nonce` },
      ],
      qa: [
        { q: "Why enqueue scripts instead of adding `<script>` tags?", a: "Enqueuing lets WordPress handle dependency resolution (e.g. load jQuery first), prevent the same script loading twice, add version query strings for cache busting, and control header vs footer placement. Hardcoding tags bypasses all of that and causes conflicts." },
        { q: "How do you load a script only in the admin area?", a: "Hook to `admin_enqueue_scripts` instead of `wp_enqueue_scripts`. You can inspect the passed `$hook_suffix` argument to load only on specific admin screens." },
        { q: "How do you pass a PHP value to your JavaScript file?", a: "Use `wp_localize_script()` (or `wp_add_inline_script()` for raw JS). `wp_localize_script` attaches a JS object to a registered handle, which is the standard way to pass the AJAX URL, nonces, or translated strings to front-end scripts." },
      ],
    },

    /* ===================== 8 ===================== */
    {
      id: "plugins",
      number: 8,
      title: "Plugins",
      blocks: [
        { type: "p", text: "A plugin is a PHP file (or folder with a main file) containing a plugin header comment. It extends WordPress and — unlike theme `functions.php` — persists across theme changes." },
        { type: "subhead", text: "Minimal plugin" },
        { type: "code", lang: "php", code:
`<?php
/*
Plugin Name: My Plugin
Description: Does a thing.
Version: 1.0.0
Author: Jane Dev
Text Domain: my-plugin
*/
if ( ! defined( 'ABSPATH' ) ) exit; // block direct access

add_action( 'init', function() {
    // plugin logic
} );` },
        { type: "subhead", text: "Lifecycle hooks" },
        { type: "code", lang: "php", code:
`register_activation_hook( __FILE__, 'my_plugin_activate' );
register_deactivation_hook( __FILE__, 'my_plugin_deactivate' );
// Uninstall: either register_uninstall_hook() OR an uninstall.php file in the plugin root

function my_plugin_activate() {
    // create DB tables, set default options, flush rewrite rules
    flush_rewrite_rules();
}
function my_plugin_deactivate() {
    // clean up scheduled events, flush rewrite rules
    flush_rewrite_rules();
}` },
        { type: "subhead", text: "Shortcodes" },
        { type: "code", lang: "php", code:
`add_shortcode( 'greeting', function( $atts ) {
    $atts = shortcode_atts( array( 'name' => 'friend' ), $atts );
    return 'Hello, ' . esc_html( $atts['name'] ) . '!';
} );
// Usage in content: [greeting name="Sam"]` },
        { type: "p", text: "Note: a shortcode callback must **return** its output, not echo it — echoing outputs in the wrong place." },
      ],
      qa: [
        { q: "When does functionality belong in a plugin vs `functions.php`?", a: "If it's presentational and theme-specific (styling helpers, theme setup), `functions.php` is fine. If it's site functionality that should survive a theme switch — custom post types, shortcodes, integrations — put it in a plugin. Otherwise switching themes silently breaks your content." },
        { q: "What do activation and deactivation hooks do, and when do they run?", a: "`register_activation_hook` runs once when the plugin is activated — used to create tables, set default options, and flush rewrite rules. `register_deactivation_hook` runs on deactivation for cleanup like unscheduling cron events. Neither runs on every load; they're one-time lifecycle events." },
        { q: "Difference between deactivation and uninstall?", a: "Deactivation just turns the plugin off but leaves its data. Uninstall (via `uninstall.php` or `register_uninstall_hook`) runs when the plugin is deleted and is where you permanently remove options, tables, and metadata." },
        { q: "Why check `if ( ! defined( 'ABSPATH' ) ) exit;`?", a: "It prevents the PHP file from being executed directly by a browser. `ABSPATH` is only defined when WordPress is loaded, so this blocks direct access and information disclosure." },
        { q: "Why should a shortcode return rather than echo?", a: "Shortcodes are replaced inline within content during a filter. If you echo, the output prints at the top of the page (wherever the filter runs) instead of where the shortcode sits. Returning lets WordPress insert it in the correct position." },
      ],
    },

    /* ===================== 9 ===================== */
    {
      id: "cpt-taxonomies",
      number: 9,
      title: "Custom Post Types & Taxonomies",
      blocks: [
        { type: "p", text: "Custom Post Types (CPTs) let you manage content beyond posts/pages — e.g. “Books,” “Events,” “Products.” Custom taxonomies let you categorize them — e.g. “Genre,” “Venue.”" },
        { type: "subhead", text: "Register a CPT (always on init)" },
        { type: "code", lang: "php", code:
`add_action( 'init', 'register_book_cpt' );
function register_book_cpt() {
    register_post_type( 'book', array(
        'labels'       => array(
            'name'          => 'Books',
            'singular_name' => 'Book',
        ),
        'public'       => true,
        'has_archive'  => true,
        'menu_icon'    => 'dashicons-book',
        'supports'     => array( 'title', 'editor', 'thumbnail', 'custom-fields' ),
        'rewrite'      => array( 'slug' => 'books' ),
        'show_in_rest' => true,   // enables Gutenberg + REST API
    ) );
}` },
        { type: "subhead", text: "Register a custom taxonomy" },
        { type: "code", lang: "php", code:
`add_action( 'init', 'register_genre_taxonomy' );
function register_genre_taxonomy() {
    register_taxonomy( 'genre', 'book', array(
        'labels'       => array( 'name' => 'Genres' ),
        'hierarchical' => true,      // true = category-like; false = tag-like
        'show_in_rest' => true,
        'rewrite'      => array( 'slug' => 'genre' ),
    ) );
}` },
        { type: "callout", variant: "warn", text: "**Critical gotcha — flushing rewrite rules.** After registering a CPT/taxonomy with a custom slug, permalinks 404 until rewrite rules are flushed. You flush **once** on plugin activation (not on every `init`, which is expensive)." },
        { type: "code", lang: "php", code:
`register_activation_hook( __FILE__, function() {
    register_book_cpt();   // register first
    flush_rewrite_rules(); // then flush
} );` },
      ],
      qa: [
        { q: "What hook do you register a custom post type on, and why?", a: "`init`. By then the core is loaded but WordPress hasn't parsed the request yet, so the post type exists in time for query parsing and rewrite rules. Registering later means it won't be available when needed." },
        { q: "You registered a CPT with slug `books` but visiting `/books/my-book/` gives a 404. Why?", a: "The rewrite rules haven't been flushed. New rewrite rules from a custom slug need a flush — done once on plugin activation via `flush_rewrite_rules()`, or manually by re-saving Permalinks in Settings. Never call `flush_rewrite_rules()` on every `init`; it's a heavy operation." },
        { q: "`hierarchical` true vs false in a taxonomy?", a: "`true` makes it behave like categories — terms can have parent/child relationships and show as checkboxes. `false` makes it tag-like — flat, comma-entered terms. Choose based on whether the terms have a natural hierarchy." },
        { q: "What does `show_in_rest` do?", a: "It exposes the post type or taxonomy to the REST API and — importantly — is required for it to work with the block editor (Gutenberg). Omitting it leaves the CPT on the classic editor and out of REST responses." },
      ],
    },

    /* ===================== 10 ===================== */
    {
      id: "metadata-meta-boxes",
      number: 10,
      title: "Metadata & Meta Boxes",
      blocks: [
        { type: "p", text: "Metadata is extra key-value data attached to posts (or users, terms, comments). Post meta lives in `wp_postmeta`." },
        { type: "subhead", text: "Core meta functions" },
        { type: "code", lang: "php", code:
`add_post_meta( $post_id, 'price', '19.99', true );  // true = unique
update_post_meta( $post_id, 'price', '24.99' );     // adds if missing
$price = get_post_meta( $post_id, 'price', true );   // true = single value (string)
$all   = get_post_meta( $post_id, 'price', false );  // false = array of all values
delete_post_meta( $post_id, 'price' );` },
        { type: "subhead", text: "Registering meta for REST/blocks" },
        { type: "code", lang: "php", code:
`register_post_meta( 'book', 'price', array(
    'type'         => 'string',
    'single'       => true,
    'show_in_rest' => true,
    'sanitize_callback' => 'sanitize_text_field',
) );` },
        { type: "subhead", text: "Meta boxes (classic editor UI for custom fields)" },
        { type: "code", lang: "php", code:
`add_action( 'add_meta_boxes', function() {
    add_meta_box( 'book_price_box', 'Price', 'render_price_box', 'book', 'side' );
} );

function render_price_box( $post ) {
    wp_nonce_field( 'save_price', 'price_nonce' );          // security
    $value = get_post_meta( $post->ID, 'price', true );
    echo '<input type="text" name="price" value="' . esc_attr( $value ) . '">';
}

add_action( 'save_post', function( $post_id ) {
    // 1. verify nonce
    if ( ! isset( $_POST['price_nonce'] ) ||
         ! wp_verify_nonce( $_POST['price_nonce'], 'save_price' ) ) return;
    // 2. skip autosaves
    if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) return;
    // 3. check permissions
    if ( ! current_user_can( 'edit_post', $post_id ) ) return;
    // 4. sanitize + save
    if ( isset( $_POST['price'] ) ) {
        update_post_meta( $post_id, 'price', sanitize_text_field( $_POST['price'] ) );
    }
} );` },
      ],
      qa: [
        { q: "`add_post_meta` vs `update_post_meta`?", a: "`add_post_meta` always inserts a new row (unless `unique` is true and one exists). `update_post_meta` updates the existing value and creates it if it doesn't exist — so `update_post_meta` is the safer default for single values because it won't create duplicates." },
        { q: "The third parameter of `get_post_meta` — what does it do?", a: "It's `$single`. `true` returns a single value (a string); `false` (default) returns an array of all values for that key. Forgetting it and getting back an array unexpectedly is a common bug." },
        { q: "Walk me through securely saving a meta box.", a: "In the save handler I verify the nonce with `wp_verify_nonce`, bail out on autosave (`DOING_AUTOSAVE`), confirm the user has the right capability with `current_user_can`, then sanitize the input before calling `update_post_meta`. All four checks matter — skipping the nonce or capability check is a real security hole." },
      ],
    },

    /* ===================== 11 ===================== */
    {
      id: "querying",
      number: 11,
      title: "Querying: WP_Query, $wpdb, pre_get_posts",
      blocks: [
        { type: "p", text: "`WP_Query` is the primary class for retrieving posts. It's what powers the main query and what you use for custom queries." },
        { type: "subhead", text: "Custom query with WP_Query (always reset afterward)" },
        { type: "code", lang: "php", code:
`$query = new WP_Query( array(
    'post_type'      => 'book',
    'posts_per_page' => 5,
    'meta_key'       => 'price',
    'orderby'        => 'meta_value_num',
    'order'          => 'ASC',
    'meta_query'     => array(
        array(
            'key'     => 'in_stock',
            'value'   => '1',
            'compare' => '=',
        ),
    ),
    'tax_query'      => array(
        array(
            'taxonomy' => 'genre',
            'field'    => 'slug',
            'terms'    => 'fiction',
        ),
    ),
) );

if ( $query->have_posts() ) {
    while ( $query->have_posts() ) {
        $query->the_post();
        the_title( '<h2>', '</h2>' );
    }
    wp_reset_postdata();   // ESSENTIAL after a custom loop
}` },
        { type: "p", text: "**`get_posts()`** — a lighter wrapper around `WP_Query` returning an array of post objects; good when you just need data, not a full loop." },
        { type: "callout", variant: "warn", text: "**`query_posts()` — the trap.** It **replaces the main query**, breaks pagination, and forces a second DB query. Never use it. To modify the main query, use `pre_get_posts` instead." },
        { type: "subhead", text: "pre_get_posts — the correct way to alter the main query" },
        { type: "code", lang: "php", code:
`add_action( 'pre_get_posts', function( $query ) {
    // only the main query, only on the front end, only on the blog archive
    if ( ! is_admin() && $query->is_main_query() && $query->is_home() ) {
        $query->set( 'posts_per_page', 3 );
    }
} );` },
        { type: "p", text: "The `is_admin()` and `is_main_query()` guards are essential — without them you'll also alter admin queries and every secondary query, breaking the dashboard." },
        { type: "subhead", text: "$wpdb — direct SQL when the API can't express your query" },
        { type: "code", lang: "php", code:
`global $wpdb;
$results = $wpdb->get_results(
    $wpdb->prepare(
        "SELECT * FROM {$wpdb->posts} WHERE post_status = %s AND post_type = %s",
        'publish', 'book'
    )
);` },
        { type: "p", text: "Always use `$wpdb->prepare()` for any query with variables — it prevents SQL injection. Use `{$wpdb->posts}` (property) rather than a hardcoded `wp_posts` so it respects the table prefix." },
      ],
      qa: [
        { q: "Why is `query_posts()` considered bad practice?", a: "It overwrites the global main query, which breaks pagination and conditional tags, and it runs an extra, wasteful database query. The correct approaches are a new `WP_Query` for secondary loops or the `pre_get_posts` hook to modify the main query in place." },
        { q: "Why must you call `wp_reset_postdata()` after a custom `WP_Query` loop?", a: "`the_post()` overwrites the global `$post`. `wp_reset_postdata()` restores it to the main query's current post so template tags after your loop still refer to the right post. Forgetting it causes subtle bugs where later template tags show the wrong data." },
        { q: "How do you change how many posts show on the blog homepage without a plugin?", a: "Hook into `pre_get_posts`, guard with `! is_admin()`, `is_main_query()`, and the appropriate conditional like `is_home()`, then call `$query->set( 'posts_per_page', N )`. This modifies the main query cleanly without a second query." },
        { q: "When would you use `$wpdb` directly, and what's the security concern?", a: "When the query is too complex for `WP_Query` — custom tables, aggregations, joins the API can't express. The concern is SQL injection, so every variable must go through `$wpdb->prepare()` with placeholders (`%s`, `%d`, `%f`), never string concatenation." },
        { q: "`get_posts()` vs `WP_Query`?", a: "`get_posts()` is a convenience wrapper that returns an array of post objects; it's ideal when you just need a list of posts without running The Loop. `WP_Query` gives full control and the loop methods. Under the hood `get_posts` uses `WP_Query`." },
      ],
    },

    /* ===================== 12 ===================== */
    {
      id: "security",
      number: 12,
      title: "Security: Nonces, Sanitization, Escaping, Capabilities",
      blocks: [
        { type: "p", text: "**The four pillars.** This is heavily tested. Know the distinct roles:" },
        { type: "list", ordered: true, items: [
          "**Nonces** — verify a request came from a legitimate source (CSRF protection).",
          "**Sanitization** — clean input *before saving* to the database.",
          "**Validation** — check input is the *expected format* (reject if not).",
          "**Escaping** — make output safe *right before rendering* (XSS protection).",
        ] },
        { type: "callout", variant: "tip", text: "**The rule:** Sanitize input, escape output, validate where format matters, and nonce your forms/actions." },
        { type: "subhead", text: "Nonces" },
        { type: "code", lang: "php", code:
`// In a form
wp_nonce_field( 'my_action', 'my_nonce' );

// For a URL
$url = wp_nonce_url( admin_url( 'admin-post.php?action=delete' ), 'delete_item' );

// Verify on the receiving end
if ( ! isset( $_POST['my_nonce'] ) ||
     ! wp_verify_nonce( $_POST['my_nonce'], 'my_action' ) ) {
    wp_die( 'Security check failed' );
}` },
        { type: "subhead", text: "Sanitization functions (input)" },
        { type: "code", lang: "php", code:
`sanitize_text_field( $_POST['name'] );
sanitize_email( $_POST['email'] );
sanitize_textarea_field( $_POST['bio'] );
absint( $_POST['count'] );          // non-negative integer
sanitize_key( $_POST['slug'] );
wp_kses_post( $_POST['content'] );  // allow only post-safe HTML
esc_url_raw( $_POST['url'] );       // for storing URLs` },
        { type: "subhead", text: "Escaping functions (output)" },
        { type: "code", lang: "php", code:
`esc_html( $text );            // in HTML body
esc_attr( $value );           // inside an attribute
esc_url( $link );             // in href/src
esc_js( $string );            // inside inline JS
wp_kses_post( $content );     // rich content, safe tags only

// Combined escaping + translation:
esc_html_e( 'Save', 'my-plugin' );` },
        { type: "subhead", text: "Capabilities" },
        { type: "code", lang: "php", code:
`if ( ! current_user_can( 'edit_posts' ) ) {
    wp_die( 'You are not allowed to do this.' );
}` },
      ],
      qa: [
        { q: "What is a nonce and what does it protect against?", a: "A “number used once” — a token WordPress generates and validates to confirm a request originated from a legitimate page/user, protecting against CSRF. Note WordPress nonces aren't strictly single-use; they're time-limited (default ~24 hours) and tied to the action, user, and session." },
        { q: "Difference between sanitization and escaping?", a: "Sanitization cleans data on the way *in*, before saving to the database. Escaping makes data safe on the way *out*, right before it's rendered, to prevent XSS. The mantra is “sanitize input, escape output.” They happen at different times and serve different threats." },
        { q: "Why escape output if you already sanitized on input?", a: "Because data can come from many sources — the DB, an API, another plugin, older records saved before your sanitization existed — and context matters (HTML body vs attribute vs URL). Escaping at the point of output, in the correct context, is the reliable defense regardless of how the data got there." },
        { q: "How do you prevent SQL injection in WordPress?", a: "Use the query APIs (`WP_Query`, `get_posts`) which handle it, and for raw queries always use `$wpdb->prepare()` with placeholders (`%s`, `%d`, `%f`) instead of concatenating variables into the SQL string." },
        { q: "How do you check if a user is allowed to perform an action?", a: "`current_user_can()` with the relevant capability (e.g. `edit_posts`, `manage_options`, or `edit_post` with a post ID for meta-capabilities). Always check capabilities on the server for privileged actions — hiding a button in the UI is not access control." },
        { q: "Which do you pick — `esc_html` or `esc_attr`?", a: "`esc_html` when outputting into the HTML body (between tags); `esc_attr` when outputting inside an HTML attribute value. Using the wrong one can still leave an escaping gap, e.g. quotes breaking out of an attribute." },
      ],
    },

    /* ===================== 13 ===================== */
    {
      id: "ajax",
      number: 13,
      title: "AJAX in WordPress",
      blocks: [
        { type: "p", text: "WordPress has a built-in AJAX handler at `admin-ajax.php`. You register callbacks by action name, with separate hooks for logged-in and logged-out users." },
        { type: "subhead", text: "Server side" },
        { type: "code", lang: "php", code:
`// For logged-in users
add_action( 'wp_ajax_my_action', 'handle_my_action' );
// For logged-out users (public)
add_action( 'wp_ajax_nopriv_my_action', 'handle_my_action' );

function handle_my_action() {
    check_ajax_referer( 'my_nonce_action', 'nonce' );   // verify nonce
    $value = sanitize_text_field( $_POST['value'] );
    // ... do work ...
    wp_send_json_success( array( 'message' => 'Done', 'data' => $value ) );
    // or wp_send_json_error( ... ) — both die automatically
}` },
        { type: "subhead", text: "Client side (using localized data)" },
        { type: "code", lang: "js", code:
`fetch( myData.ajaxUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
        action: 'my_action',
        nonce: myData.nonce,
        value: 'hello'
    })
})
.then( r => r.json() )
.then( res => console.log( res ) );` },
      ],
      qa: [
        { q: "What's the difference between `wp_ajax_` and `wp_ajax_nopriv_`?", a: "`wp_ajax_{action}` fires for logged-in users; `wp_ajax_nopriv_{action}` fires for logged-out (unauthenticated) visitors. If your AJAX needs to work for everyone you register both, usually pointing to the same callback. Front-end public AJAX that omits the `nopriv` version silently fails for guests." },
        { q: "How does the server know which function to call?", a: "The request must include an `action` parameter. WordPress appends its value to `wp_ajax_` / `wp_ajax_nopriv_` to build the hook name and fires the matching registered callback." },
        { q: "When would you use the REST API over admin-ajax?", a: "For structured, discoverable endpoints — especially anything consumed by external apps, mobile, or the block editor. The REST API gives you proper routes, HTTP verbs, JSON schemas, and permission callbacks. `admin-ajax` is simpler for quick, internal, one-off form handlers but is less structured and has more overhead per request." },
      ],
    },

    /* ===================== 14 ===================== */
    {
      id: "rest-api",
      number: 14,
      title: "The REST API",
      blocks: [
        { type: "p", text: "The WordPress REST API exposes site data as JSON over HTTP at `/wp-json/`. Core routes like `/wp-json/wp/v2/posts` exist out of the box; you can register custom endpoints." },
        { type: "subhead", text: "Registering a custom endpoint" },
        { type: "code", lang: "php", code:
`add_action( 'rest_api_init', function() {
    register_rest_route( 'myplugin/v1', '/books/(?P<id>\\d+)', array(
        'methods'             => 'GET',
        'callback'            => 'get_book_endpoint',
        'permission_callback' => function() {
            return current_user_can( 'read' );
        },
        'args'                => array(
            'id' => array(
                'validate_callback' => function( $param ) {
                    return is_numeric( $param );
                },
            ),
        ),
    ) );
} );

function get_book_endpoint( $request ) {
    $id = $request['id'];
    $post = get_post( $id );
    if ( ! $post ) {
        return new WP_Error( 'not_found', 'Book not found', array( 'status' => 404 ) );
    }
    return rest_ensure_response( array(
        'id'    => $post->ID,
        'title' => $post->post_title,
    ) );
}` },
      ],
      qa: [
        { q: "What's the base path of the REST API and how do you register a route?", a: "The base is `/wp-json/`. You register custom routes with `register_rest_route( $namespace, $route, $args )` on the `rest_api_init` hook, specifying methods, a callback, and — critically — a `permission_callback`." },
        { q: "Why is `permission_callback` required?", a: "It controls authorization for the endpoint. Since a version of WordPress made it mandatory, omitting it triggers a warning and is a security risk — without it your endpoint may be publicly accessible. Return `true` only for genuinely public data; otherwise gate it with a capability check." },
        { q: "How is the REST API authenticated?", a: "For logged-in users in the browser, via cookies plus a nonce (the `X-WP-Nonce` header with a `wp_rest` nonce). For external/programmatic access, Application Passwords (built into core) or OAuth/JWT via plugins. Basic cookie auth alone isn't sufficient for cross-origin app access." },
        { q: "How do you expose a custom post type or meta field to the REST API?", a: "Set `show_in_rest => true` when registering the CPT/taxonomy, and use `register_post_meta` with `show_in_rest => true` for meta fields. That's also what makes them available to the block editor." },
      ],
    },

    /* ===================== 15 ===================== */
    {
      id: "transients-caching",
      number: 15,
      title: "Transients, Caching & Performance",
      blocks: [
        { type: "p", text: "Caching avoids repeating expensive work (slow queries, remote API calls). WordPress offers several layers." },
        { type: "subhead", text: "Transients API (cache with an expiration)" },
        { type: "code", lang: "php", code:
`$data = get_transient( 'my_expensive_data' );
if ( false === $data ) {
    $data = run_expensive_query();               // cache miss
    set_transient( 'my_expensive_data', $data, HOUR_IN_SECONDS );
}
// use $data
delete_transient( 'my_expensive_data' );          // invalidate on update` },
        { type: "p", text: "**Object cache** — `wp_cache_get()` / `wp_cache_set()`. Non-persistent by default (per-request), but with Redis/Memcached it persists across requests. Transients automatically use the object cache when one is present." },
        { type: "p", text: "**Options API** — `get_option()` / `update_option()` for persistent settings. Autoloaded options load on every request, so don't store large data as autoloaded." },
        { type: "subhead", text: "Performance talking points" },
        { type: "list", items: [
          "**The N+1 problem**: querying meta inside a loop hits the DB repeatedly. Use `update_post_meta_cache` / proper query args or prime caches.",
          "Limit `posts_per_page`; avoid `posts_per_page => -1` on large datasets.",
          "Use `'no_found_rows' => true` when you don't need pagination (skips the `SQL_CALC_FOUND_ROWS` count query).",
          "Use `'fields' => 'ids'` when you only need IDs.",
          "Page caching (WP Super Cache / W3 Total Cache, or server/CDN caching) serves static HTML.",
          "Optimize images, lazy-load, minimize plugins, use a CDN.",
        ] },
      ],
      qa: [
        { q: "What's the difference between a transient and an option?", a: "A transient has an expiration and is meant for cached, regenerable data; an option is permanent settings storage. Transients also transparently use a persistent object cache (Redis/Memcached) if available, whereas options always hit the database (or the autoload cache)." },
        { q: "What happens to transients when there's no persistent object cache?", a: "They're stored in the `wp_options` table with a timeout row. With a persistent object cache (Redis/Memcached), they're stored there instead and don't bloat the database. This is why transients are “use if available” caching — behavior depends on the environment." },
        { q: "What's the N+1 query problem in WordPress and how do you avoid it?", a: "It's when a loop runs one query per item — e.g. calling `get_post_meta` for each post individually, causing many small queries. You avoid it by priming caches ahead of the loop (WordPress does this for post meta on main queries), fetching data in bulk, or restructuring the query. Watching query counts with a tool like Query Monitor surfaces it." },
        { q: "How would you speed up a slow archive page?", a: "Profile first (Query Monitor). Then: cache expensive results in transients, add `no_found_rows` if pagination isn't needed, use `fields => 'ids'` when only IDs are required, reduce `posts_per_page`, add a persistent object cache, and put full-page caching / a CDN in front. The order is measure, then target the actual bottleneck." },
      ],
    },

    /* ===================== 16 ===================== */
    {
      id: "wp-cron",
      number: 16,
      title: "WP-Cron",
      blocks: [
        { type: "p", text: "WP-Cron schedules recurring or one-off tasks (sending digests, cleanup). It is **not a real cron** — it's triggered by page visits, so a low-traffic site may run tasks late." },
        { type: "code", lang: "php", code:
`// Schedule on activation
if ( ! wp_next_scheduled( 'my_daily_task' ) ) {
    wp_schedule_event( time(), 'daily', 'my_daily_task' );
}
add_action( 'my_daily_task', 'run_my_daily_task' );

// Clear on deactivation
wp_clear_scheduled_hook( 'my_daily_task' );

// Custom interval
add_filter( 'cron_schedules', function( $schedules ) {
    $schedules['every_five_minutes'] = array(
        'interval' => 300,
        'display'  => 'Every 5 Minutes',
    );
    return $schedules;
} );` },
      ],
      qa: [
        { q: "Is WP-Cron a real cron job?", a: "No. It's a pseudo-cron triggered when someone visits the site. If no one visits, scheduled tasks don't fire on time. For reliability on low-traffic or time-critical sites, you disable WP-Cron (`define( 'DISABLE_WP_CRON', true )`) and trigger `wp-cron.php` from a real system cron." },
        { q: "How do you schedule a recurring task?", a: "Check `wp_next_scheduled()` to avoid duplicate scheduling, then `wp_schedule_event()` with an interval (`hourly`, `twicedaily`, `daily`, or a custom one added via the `cron_schedules` filter), and hook your callback to the event action. Clear it on deactivation with `wp_clear_scheduled_hook()`." },
        { q: "Why guard scheduling with `wp_next_scheduled()`?", a: "Because activation code or repeated calls could schedule the same event multiple times, causing it to run repeatedly. Checking first ensures only one instance is scheduled." },
      ],
    },

    /* ===================== 17 ===================== */
    {
      id: "roles-capabilities",
      number: 17,
      title: "Roles & Capabilities",
      blocks: [
        { type: "p", text: "WordPress access control is role-based. **Roles** are collections of **capabilities** (granular permissions)." },
        { type: "p", text: "**Default roles (most→least privileged):** Super Admin (multisite only), Administrator, Editor, Author, Contributor, Subscriber." },
        { type: "p", text: "**Example capabilities:** `manage_options`, `edit_posts`, `edit_others_posts`, `publish_posts`, `delete_posts`, `upload_files`, `edit_pages`, `install_plugins`." },
        { type: "subhead", text: "Custom roles & caps" },
        { type: "code", lang: "php", code:
`// Add on activation, not every load
add_role( 'editor_lite', 'Editor Lite', array(
    'read'         => true,
    'edit_posts'   => true,
    'upload_files' => true,
) );

// Add a capability to an existing role
$role = get_role( 'editor' );
$role->add_cap( 'manage_custom_thing' );

// Meta capabilities map to primitive ones via map_meta_cap
current_user_can( 'edit_post', $post_id );   // meta cap, resolves per-post` },
      ],
      qa: [
        { q: "Difference between a role and a capability?", a: "A capability is a single permission (e.g. `edit_posts`). A role is a named bundle of capabilities (e.g. Editor). Users are assigned roles; the role's capabilities determine what they can do. You can also grant/revoke individual caps on a role or user." },
        { q: "`edit_posts` vs `edit_post`?", a: "`edit_posts` is a primitive capability — can this user edit posts in general. `edit_post` (singular) is a meta capability checked against a specific post ID; WordPress maps it to primitive caps via `map_meta_cap`, accounting for ownership (own vs others' posts). Use the singular meta cap with an ID when checking a specific object." },
        { q: "Where should you add a custom role — and why not on every request?", a: "On plugin/theme activation. `add_role` writes to the database, so calling it on every `init` is wasteful and the change persists anyway. Add it once on activation and remove it on deactivation/uninstall." },
      ],
    },

    /* ===================== 18 ===================== */
    {
      id: "i18n",
      number: 18,
      title: "Internationalization (i18n)",
      blocks: [
        { type: "p", text: "i18n makes strings translatable. Wrap user-facing text in translation functions with a **text domain** that matches your plugin/theme." },
        { type: "code", lang: "php", code:
`__( 'Hello', 'my-plugin' );          // returns translated string
_e( 'Hello', 'my-plugin' );          // echoes it
esc_html__( 'Hello', 'my-plugin' );  // translate + escape (return)
esc_html_e( 'Hello', 'my-plugin' );  // translate + escape (echo)

// Placeholders — use printf with %s / numbered args
printf( __( 'Welcome, %s!', 'my-plugin' ), esc_html( $name ) );

// Plurals
printf(
    _n( '%d comment', '%d comments', $count, 'my-plugin' ),
    $count
);

// Context (same word, different meaning)
_x( 'Post', 'noun', 'my-plugin' );` },
      ],
      qa: [
        { q: "What's a text domain?", a: "A unique identifier that ties your strings to your plugin/theme's translation files so WordPress loads the right `.mo` file. It should match the folder/slug and the `Text Domain` header. Passing an inconsistent domain means translations won't load." },
        { q: "`__()` vs `_e()`?", a: "`__()` returns the translated string; `_e()` echoes it. Use `__()` when you need the value (concatenation, attributes) and `_e()` for direct output. The `esc_html__`/`esc_html_e` variants add escaping." },
        { q: "How do you handle plurals in translations?", a: "`_n( $singular, $plural, $number, $domain )` picks the correct form based on the count. You still pass the number to `printf` to fill the `%d`. This lets translators handle languages with more than two plural forms." },
        { q: "Why not build sentences by concatenating translated fragments?", a: "Word order differs across languages, so concatenation produces broken translations. Use a single translatable string with `printf` placeholders (`%s`, `%1$s`, `%2$s`) so translators can reorder as needed." },
      ],
    },

    /* ===================== 19 ===================== */
    {
      id: "block-editor",
      number: 19,
      title: "The Block Editor (Gutenberg)",
      blocks: [
        { type: "p", text: "Since WordPress 5.0, the default editor is block-based. Content is composed of **blocks** (paragraph, image, custom). Modern blocks are registered in PHP + JS, typically scaffolded with `@wordpress/create-block` and defined via `block.json`." },
        { type: "subhead", text: "block.json (metadata-driven registration)" },
        { type: "code", lang: "json", code:
`{
  "apiVersion": 3,
  "name": "myplugin/callout",
  "title": "Callout",
  "category": "widgets",
  "icon": "megaphone",
  "editorScript": "file:./index.js",
  "attributes": {
    "message": { "type": "string", "default": "" }
  }
}` },
        { type: "code", lang: "php", code:
`add_action( 'init', function() {
    register_block_type( __DIR__ . '/build/callout' );  // reads block.json
} );` },
        { type: "p", text: "**Key concepts to name:** `edit` (React component shown in the editor) vs `save` (the markup persisted to the DB); **static** blocks (save markup to content) vs **dynamic** blocks (render via a PHP `render_callback` at display time); block attributes; `InspectorControls` for the settings sidebar; `useBlockProps`." },
      ],
      qa: [
        { q: "Static vs dynamic block?", a: "A static block saves its final HTML into post content via the `save` function; it's fast but re-saving on format changes can cause validation errors. A dynamic block saves little or nothing and renders through a PHP `render_callback` each time it's displayed — necessary when output depends on live data (recent posts, current user)." },
        { q: "What's the difference between the block's `edit` and `save` functions?", a: "`edit` is the React component rendered inside the editor (interactive, with controls). `save` returns the static markup stored in the database for the front end. For dynamic blocks, `save` often returns `null` and PHP handles output." },
        { q: "How do you register a modern block?", a: "Define it with `block.json` metadata, build the JS (usually via `@wordpress/create-block` / `@wordpress/scripts`), and call `register_block_type()` on `init` pointing at the block's directory so WordPress reads `block.json` and enqueues the right scripts/styles." },
        { q: "What is `theme.json`?", a: "A configuration file for block themes (Full Site Editing) that centrally defines global styles, color palettes, typography, spacing, and per-block settings. It reduces custom CSS and gives users controlled design options in the Site Editor." },
      ],
    },

    /* ===================== 20 ===================== */
    {
      id: "multisite",
      number: 20,
      title: "Multisite",
      blocks: [
        { type: "p", text: "Multisite runs a network of sites from one WordPress install and shared codebase (one set of core, themes, plugins). Enabled by defining `WP_ALLOW_MULTISITE` then `MULTISITE` in `wp-config.php`." },
        { type: "list", items: [
          "Sites can be **subdomains** (`site.example.com`) or **subdirectories** (`example.com/site`).",
          "Adds tables like `wp_blogs`, `wp_site`, `wp_sitemeta`; each subsite gets its own numbered post/option tables (`wp_2_posts`, etc.).",
          "**Super Admin** manages the network; plugins can be **network-activated** (all sites) or per-site.",
        ] },
        { type: "code", lang: "php", code:
`switch_to_blog( 2 );          // operate on site ID 2
// ... queries run against site 2 ...
restore_current_blog();       // ALWAYS restore` },
      ],
      qa: [
        { q: "What is WordPress Multisite and when would you use it?", a: "A single install serving multiple sites sharing core, themes, and plugins, managed by a network admin. Good for many similar sites under one roof — university departments, franchise locations, a SaaS offering sites to customers — where centralized updates and shared code are valuable." },
        { q: "How does the database differ in multisite?", a: "Global/network tables are added (`wp_blogs`, `wp_site`, `wp_sitemeta`), and each subsite gets its own prefixed set of content tables (e.g. `wp_2_posts`, `wp_2_options`). Site 1 keeps the base prefix. Users are shared across the network in the global `wp_users`." },
        { q: "What does `switch_to_blog()` do and what's the catch?", a: "It switches the active site context so queries/options target another site in the network. The catch: you must call `restore_current_blog()` afterward (and switches stack), or subsequent code operates against the wrong site." },
      ],
    },

    /* ===================== 21 ===================== */
    {
      id: "coding-standards",
      number: 21,
      title: "Coding Standards & Best Practices",
      blocks: [
        { type: "p", text: "Interviewers check that you write maintainable, secure, update-safe code." },
        { type: "list", items: [
          "**Follow WordPress Coding Standards** (PHP, JS, CSS) — enforceable with PHPCS + the WordPress Coding Standards ruleset (`WPCS`).",
          "**Prefix everything** — functions, classes, options, hooks — to avoid collisions (`myplugin_`), or use namespaces/OOP.",
          "**Never edit core.** Use hooks, child themes, plugins.",
          "**Escape output, sanitize input, use nonces, check capabilities.**",
          "**Use the APIs**: `WP_Query`, `$wpdb->prepare`, Settings API, HTTP API (`wp_remote_get`) rather than raw cURL.",
          "**Enqueue** assets; don't hardcode tags.",
          "**i18n** all user-facing strings with a consistent text domain.",
          "**Load conditionally** — don't load admin code on the front end and vice versa.",
          "**Use `WP_DEBUG`** during development; keep it off in production display.",
        ] },
      ],
      qa: [
        { q: "How do you avoid function-name collisions with other plugins?", a: "Prefix all global functions, classes, constants, and option names with a unique plugin-specific prefix, or wrap code in a namespace/class. WordPress has a huge shared global scope, so a generic name like `get_data()` will eventually clash." },
        { q: "How should you make an external HTTP request from WordPress?", a: "Use the WordPress HTTP API — `wp_remote_get()` / `wp_remote_post()` — not raw cURL or `file_get_contents`. It abstracts the transport, respects site config/proxies, and returns a consistent response you check with `is_wp_error()` and `wp_remote_retrieve_body()`." },
        { q: "How do you keep customizations safe across updates?", a: "Never touch core files. Put presentation changes in a child theme and functionality in plugins, and use hooks/filters rather than modifying source. That way core, theme, and plugin updates don't overwrite your work." },
      ],
    },

    /* ===================== 22 ===================== */
    {
      id: "cheat-sheet",
      number: 22,
      title: "Rapid-Fire Q&A Cheat Sheet",
      blocks: [
        { type: "p", text: "Short, punchy answers for quick-round questions. Flip each card and answer before revealing." },
      ],
      qa: [
        { q: "Action vs filter?", a: "Action does something (no return); filter modifies and returns data." },
        { q: "`the_title()` vs `get_the_title()`?", a: "Echo vs return." },
        { q: "Register a CPT on which hook?", a: "`init`." },
        { q: "CPT slug 404s?", a: "Flush rewrite rules (once, on activation)." },
        { q: "Modify the main query?", a: "`pre_get_posts` (guarded by `is_admin()`/`is_main_query()`), never `query_posts()`." },
        { q: "After a custom `WP_Query` loop?", a: "`wp_reset_postdata()`." },
        { q: "Prevent SQL injection?", a: "`$wpdb->prepare()`." },
        { q: "Prevent XSS?", a: "Escape on output (`esc_html`, `esc_attr`, `esc_url`)." },
        { q: "CSRF protection?", a: "Nonces (`wp_nonce_field` / `wp_verify_nonce`)." },
        { q: "Pass PHP to JS?", a: "`wp_localize_script()`." },
        { q: "AJAX for guests?", a: "`wp_ajax_nopriv_{action}`." },
        { q: "Where are custom fields stored?", a: "`wp_postmeta`." },
        { q: "Where are CPTs stored?", a: "`wp_posts` (differentiated by `post_type`)." },
        { q: "Parent theme URL vs active theme URL?", a: "`get_template_directory_uri()` vs `get_stylesheet_directory_uri()`." },
        { q: "Cache expensive data?", a: "Transients (`set_transient` with expiry)." },
        { q: "Check permissions?", a: "`current_user_can()`." },
        { q: "Is WP-Cron real cron?", a: "No — visit-triggered; use system cron for reliability." },
        { q: "Expose CPT to Gutenberg/REST?", a: "`show_in_rest => true`." },
        { q: "Block `edit` vs `save`?", a: "Editor React component vs saved front-end markup." },
        { q: "mu-plugins?", a: "Auto-loaded, can't be disabled, no activation." },
        { q: "`update_post_meta` vs `add_post_meta`?", a: "Update won't duplicate; add always inserts." },
        { q: "HTTP requests?", a: "`wp_remote_get()`, not raw cURL." },
        { q: "Avoid name clashes?", a: "Prefix / namespace everything." },
      ],
    },
  ],
};
