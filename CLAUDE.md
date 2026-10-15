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
build expands it (`""` at root, `"../"` one level down) so the site works from
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

Recurring devices: the red letterspaced eyebrow with its short rule underneath,
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

Ten pages: `/`, `/what-we-do/`, `/social-impact/`, `/who-we-serve/`, `/insights/`, `/about/`,
`/offices/`, `/careers/`, `/press/`, `/contact/`, plus `404.html`.

Section grounds alternate cream and white, and **every page closes on
`--blue2`** before the navy footer. Careers and Contact put their form section
on the blue instead of adding a redundant CTA after a form.

The homepage hero is a four-slide carousel (positioning, Beyond the Strategy,
Success Measured by Impact, Talent Network). Slides share one grid cell so the
hero takes the height of the tallest and never jumps. Auto-advance stops on
hover and focus and ends for the session once a visitor touches a control; it
never starts under `prefers-reduced-motion`.

Navigation: What We Do, Who We Serve, Insights (Mindful Momentum + Press),
About, Careers, plus a red Contact Us button. All nav labels are title case.
Buttons carry no arrow and centre their labels; arrows stay on text links,
index rows, and the carousel controls, where they indicate direction.

---

## Draft copy

Unsourced copy is marked with a red asterisk (`<span class="draft">*</span>`)
and a `.draftnote` explaining it at the foot of its section. Keep that
convention for anything written as a placeholder — it's how the client spots
what still needs their words.

Currently flagged: sub-service names under four of the five practices, the
industry descriptions, the whitepaper summaries, and one press release with no
named recipient. Testimonials are empty placeholder cards awaiting real quotes.

Source documents, if copy questions come up: the firm brochure (v6.5), the
website plan, and "The Momentum Firm Website Copy V1". The copy doc covers the
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

- Form submission. Both forms (`#contact-form`, `#talent-form`) confirm in the
  UI and send nothing. Wire them to a form service or an endpoint in `site.js`.
- Individual insight articles and capability detail pages — those links
  currently land on the index pages.
- Analytics.
