# The Momentum Firm — website

Static marketing site for The Momentum Firm. No framework, no build dependencies
beyond Python 3 — the whole thing is HTML, one stylesheet, and one script.

**Status: first draft.** The structure and design are real; some copy is
placeholder and is marked as such both in the pages and in this file.

---

## Structure

```
.
├── index.html              ← built pages (committed, so GitHub Pages serves them directly)
├── what-we-do/index.html
├── who-we-serve/index.html
├── insights/index.html
├── about/index.html
├── offices/index.html
├── careers/index.html
├── press/index.html
├── contact/index.html
├── 404.html
├── sitemap.xml             ← generated
├── robots.txt              ← generated
│
├── assets/
│   ├── css/styles.css      ← the whole design system
│   ├── js/site.js          ← mega menus, mobile drawer, forms
│   └── img/                ← logos, founder portrait, favicon
│
├── src/
│   ├── partials/           ← head, header (nav + mega menus + drawer), footer
│   └── pages/              ← the body content of each page
│
├── site.json               ← page list, titles, meta descriptions
└── build.py                ← assembles src/ into the pages above
```

**Edit `src/`, not the built pages at the root.** Running the build overwrites them.

## Building

```bash
python3 build.py
```

That assembles every page, regenerates `sitemap.xml` and `robots.txt`, and
prints what it wrote. There is nothing to install.

To preview locally:

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

### How links work

Partials and page fragments use a `{{B}}` token for the path back to the site
root — empty on the homepage, `../` one level down. That means the built site
works from a custom domain, a GitHub Pages project URL, or a subfolder without
any configuration.

### Changing page titles and descriptions

All of them live in `site.json`. Each page gets its own `<title>`, meta
description, canonical URL, and Open Graph tags. The homepage additionally
emits `ProfessionalService` JSON-LD with the three office addresses.

## Deploying

**GitHub Pages:** Settings → Pages → Deploy from branch → `main` / root. The
built pages are committed, so nothing else is required. For a custom domain,
add a `CNAME` file containing `www.themomentumfirm.com` and point DNS at
GitHub.

**Anywhere else** (Netlify, Cloudflare Pages, S3, a normal web server): serve
the repository root as-is. There is no build step to configure.

If the site is ever served from a project path rather than a domain root, note
that `404.html` links with absolute paths — GitHub Pages serves it from the
project root, so that is the correct behaviour there.

## Design system

Everything is tokenized at the top of `assets/css/styles.css`, from the brand
identity manual:

| Token | Value | Use |
| --- | --- | --- |
| `--navy` | `#00254A` | primary ground and ink |
| `--cream` | `#FAF2DF` | secondary ground |
| `--cream-deep` | `#F2E6C9` | the closing band, for a step before the footer |
| `--red` | `#FF0000` | rules, markers, primary buttons |
| `--red-ink` | `#D10000` | red at small sizes on light grounds (contrast) |
| `--red-lift` | `#FF6A5C` | red at small sizes on navy (contrast) |

Type is **Montserrat** for display and **Rubik** for text, loaded from Google
Fonts, per the brand manual. Semantic tokens (`--soft-bg`, `--strong-fg`, and
friends) are redefined for dark mode, so the palette shifts as a set rather
than per-component.

Recurring devices carried over from the brochure: the red letterspaced eyebrow
with its short rule, the numbered index used for client industries, and the
offset red corner bracket on the founder portrait.

## Known placeholders

Draft copy is marked in the pages with a red asterisk and a note at the bottom
of the relevant section.

- **Sub-capabilities** under Change Management, Data Analytics, Innovation & CX,
  and one slot under Organizational Design were `XXX` in the website plan.
  Draft names are in place so the structure could be reviewed.
- **Industry descriptions** on `/who-we-serve/` — the source documents list
  industry names only.
- **Whitepaper summaries** on `/insights/` — titles are real, summaries are
  drafted. The whitepapers themselves aren't linked to files yet.
- **Press releases** have no dates in the source, so the list is unsorted.
  Adding dates turns it into a reverse-chronological archive.
- **`TMF Donates $5K to [recipient TBC]`** — placeholder in the website plan.

## Not built yet

- Form submission. Both forms (`#contact-form`, `#talent-form`) confirm in the
  UI and send nothing. Point them at a form service or an endpoint in
  `assets/js/site.js`.
- Individual insight article pages and capability detail pages — right now
  those links land on the index pages.
- Analytics.
