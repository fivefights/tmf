# The Momentum Firm — working notes

Marketing site for The Momentum Firm, a public-sector management consultancy.
Static HTML, no framework, no dependencies beyond Python 3. Live at
https://fivefights.github.io/tmf/ and eventually at themomentumfirm.com.

Read this before changing anything. `README.md` has the fuller tour.

---

## The one rule that matters

**Edit `src/`, then run `python3 build.py`.**

The HTML at the repo root (`index.html`, `what-we-do/index.html`, …) is
generated output. It's committed so GitHub Pages can serve it without CI, but
editing it directly is wasted work — the next build overwrites it.

| To change | Edit |
| :- | :- |
| A page's content | `src/pages/<name>.html` |
| Nav, mega menus, mobile drawer | `src/partials/header.html` |
| Footer | `src/partials/footer.html` |
| `<head>`, meta tags, fonts | `src/partials/head.html` |
| Page titles, meta descriptions | `site.json` |
| Styling | `assets/css/styles.css` (not generated — edit directly) |
| Behaviour | `assets/js/site.js` (not generated — edit directly) |

After building, `python3 preview.py` bundles the whole site into a single
`preview.html` for sharing a review link. It's gitignored; regenerate as needed.

Links in `src/` use a `{{B}}` token for the path back to the site root. The
build expands it (`""` at root, `"../"` one level down, `"../../"` for the
capability and industry pages two levels down) so the site works from
a domain root, a GitHub Pages project path, or a local folder.

---

## Brand

From the brand identity manual (Oigon Media, Dec 2024) and the firm brochure.

| Token | Value | Role |
| :- | :- | :- |
| `--navy-deep` | `#001A35` | utility strip, footer |
| `--navy` | `#00254A` | masthead, homepage hero |
| `--blue2` | `#0D3358` | mega menus, drawer, every page's closing band |
| `--cream` | `#FAF2DF` | main section grounds |
| `--cream-deep` | `#F2E6C9` | secondary cream ground |
| `--red` | `#FF0000` | buttons, eyebrow rules, active slide indicator |
| `--red-ink` | `#D10000` | red text at small sizes **on light grounds** |
| `--red-lift` | `#FF6A5C` | red text at small sizes **on navy or blue** |
| `--gold` | `#DAA520` | eyebrow rule on cream and white grounds (Deep Gold, brand secondary) |
| `--gold-lift` | `#F7D58B` | eyebrow text on navy and blue grounds (hero, blue bands, mega menus, footer headings) |

Eyebrow *text* on navy and blue is `--gold-lift`; the short rule under it stays
red there. Red text links on dark grounds still use `--accent-dark`.

The two red variants exist for contrast. Pure `#FF0000` fails WCAG AA as small
text on both cream and navy. Use `--accent-light` (resolves to `--red-ink`) on
light grounds and `--accent-dark` (`--red-lift`) on dark ones. Check any new red
text — this has been a real bug twice.

Type is **Montserrat** (display, 600/700/800 + italics) and **Rubik** (body,
400/500/600), from Google Fonts. Body copy is weight 400. Headings carry no
italics anywhere on the site — the client asked for them removed, overriding
the copy deck's italicised words. Don't wrap heading words in `<em>`.

Button labels render in all caps through CSS (`text-transform: uppercase` on
`.btn`), whatever case the source uses. Change button copy, not that style.

Buttons in main content sections are primary red (`.btn--red`). The CTA in
each page's closing blue band is the white outline (`.btn--ghost-light`).
Form submit buttons on the blue stay red.

Recurring devices: the red letterspaced eyebrow with its short rule underneath
(gold on cream and white, red on navy and blue; set by `--eyebrow-rule`),
and the numbered index used for client industries. Corner radius is 4px on
controls and cards.

### There is no dark theme, on purpose

`:root` declares `color-scheme: light` and the palette never remaps. The brand
is a committed identity and should look identical to every visitor.

An earlier version did ship a dark variant, and it remapped every cream ground
to navy — so anyone with their OS set to dark saw a fully blue site, including
all the sections that had just been changed *away* from blue. Don't reintroduce
one without first deciding what cream becomes in it.

---

## Page structure

Twenty-three pages: `/`, `/what-we-do/` (a contents list) plus one page per
capability at `/what-we-do/<capability>/`, `/who-we-serve/` (a contents list)
plus one page per industry at `/who-we-serve/<industry>/`, `/insights/`,
`/our-founder/`, `/about/` (Our Firm, with the offices list at `#offices`),
`/mission-vision-values/`, `/social-impact/`, `/careers/`, `/press/`,
`/contact/`, plus `404.html`. There is no separate offices page.

Section grounds alternate cream and white, and **every page closes on
`--blue2`** before the navy footer. Careers, Contact and Social Impact put their form section
on the blue instead of adding a redundant CTA after a form.
Our Firm (`/about/`) and Our Mission, Vision, & Values are the exceptions:
below their cream header, the content sections are all white, separated by
hairline rules (`.band--ruled`), at the client's request.

The homepage hero is a four-slide carousel (positioning, Beyond the Strategy,
Success Measured by Impact, Talent Network). Slides share one grid cell so the
hero takes the height of the tallest and never jumps. Auto-advance stops on
hover and focus and ends for the session once a visitor touches a control; it
never starts under `prefers-reduced-motion`.

Navigation: What We Do, Who We Serve, Insights (Mindful Momentum + Press), About
(Our Founder, Our Firm, Our Mission, Vision, & Values, Social Impact),
Careers, plus a red Contact Us button. All nav labels and form dropdown options are title case.
Buttons carry no arrow and centre their labels; arrows stay on text links,
index rows, and the carousel controls, where they indicate direction.

---

## Draft copy

Unsourced copy is marked with a red asterisk (`<span class="draft">*</span>`)
and a `.draftnote` explaining it at the foot of its section. Keep that
convention for anything written as a placeholder — it's how the client spots
what still needs their words.

Currently flagged: the capability overviews and all 21 service descriptions on
What We Do (initial drafts from the v8 brochure), the industry
descriptions and industry pages, the Social Impact page's descriptions, the whitepaper summaries,
and one press release with no named recipient.

Source documents, if copy questions come up: the firm brochure (v8 is current;
the final capability and service list came from the client with it), the
website plan (v2 is current: practices, services, offices, Social Impact), and
"The Momentum Firm Website Copy V1". The copy doc covers the
homepage only; where it offered two options, option 2 was chosen for both.

---

## Gotchas that have already bitten

- **`img` needs `height: auto`.** Images carry `width`/`height` attributes so
  the browser reserves space. Without `height: auto` the attribute wins over the
  CSS width and the image renders distorted. This silently stretched the founder
  portrait and squashed the footer logo.
- **`ch` units resolve against the element's own font size.** A `max-width` in
  `ch` on a wrapper around a display heading resolves at the wrapper's 16px, not
  the heading's 53px. Size display text with the grid column instead.
- **`404.html` uses absolute paths.** Correct for a domain root, wrong on the
  `/tmf/` project path, where that page renders unstyled. Known, unfixed.
- **Two unrelated roots once got merged**, committing ~540 lines of conflict
  markers to `main`. The history is clean now. If a push is ever refused, don't
  resolve it by re-committing a conflicted tree — check `git log --graph` first.

---

## Deploying

GitHub Pages serves `main` at the repo root. The built pages are committed, so a
push is a deploy. Pages caches HTML and CSS for about ten minutes — check in a
private window before concluding something didn't deploy.

For a custom domain: add a `CNAME` file with `www.themomentumfirm.com`, point
DNS at GitHub, and the absolute paths in `404.html` start working too.

---

## Not built yet

- Form submission. Three forms (`#contact-form`, `#talent-form`, and
  `#support-form` on Social Impact) validate in the browser (every field
  required, email format, 500-character message boxes with a live counter),
  then confirm in the UI and send nothing. All go to info@themomentumfirm.com;
  a hidden `category` field (General Inquiry, Talent Network Inquiry, Request
  for Community Support) becomes the subject. Wire the `submission` object in
  `site.js`'s success branch to a form service or endpoint.
- Individual insight articles and service detail pages. Each capability has its
  own page with prev/next pagination (capability 05 hands off to Who We Serve);
  service cards carry ids (`#strategic-planning`, …) ready for future pages.
  Capability page sources live in `src/pages/what-we-do/`. Industry pages
  follow the same pattern in `src/pages/who-we-serve/` (industry 07 hands off
  to Insights).
  Each industry hero photo lives at `assets/img/industry-<industry>.jpg`
  (4:3, 1200x900); to change one, replace that file under the same name.
  `.pagehead-img--pending` (the rising-bars motif) is the fallback styling
  for a hero with no photo yet.
- Analytics.
