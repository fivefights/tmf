#!/usr/bin/env python3
"""
Build the static site.

Assembles src/partials + src/pages into real HTML pages at the repo root,
one directory per URL, each with its own <title> and meta description.
Also writes sitemap.xml and a 404 page.

    python3 build.py

Links inside the partials and page fragments use a {{B}} token that expands
to the relative path back to the site root ("" on the home page, "../" one
level down), so the built site works from any subdirectory — GitHub Pages
project URLs, a staging folder, or opened straight off disk.
"""

import json
import os
import pathlib
import shutil

ROOT = pathlib.Path(__file__).parent.resolve()
SRC = ROOT / "src"
CONF = json.loads((ROOT / "site.json").read_text())
ORIGIN = CONF["site"]["origin"].rstrip("/")

HEAD = (SRC / "partials" / "head.html").read_text()
HEADER = (SRC / "partials" / "header.html").read_text()
FOOTER = (SRC / "partials" / "footer.html").read_text()

ORG_JSONLD = """<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "The Momentum Firm",
  "description": "An end-to-end management consultancy helping public sector and social impact organizations imagine more and deliver better.",
  "url": "%s/",
  "logo": "%s/assets/img/logo-navy.png",
  "email": "info@themomentumfirm.com",
  "telephone": "+1-404-895-3762",
  "founder": {"@type": "Person", "name": "Lakeisha Sesay, MPA"},
  "address": [
    {"@type": "PostalAddress", "streetAddress": "384 Northyards Blvd NW, Unit 190", "addressLocality": "Atlanta", "addressRegion": "GA", "postalCode": "30313", "addressCountry": "US"},
    {"@type": "PostalAddress", "streetAddress": "1720 I St NW", "addressLocality": "Washington", "addressRegion": "DC", "postalCode": "20006", "addressCountry": "US"},
    {"@type": "PostalAddress", "streetAddress": "611 Wilshire Blvd, Suite 900", "addressLocality": "Los Angeles", "addressRegion": "CA", "postalCode": "90017", "addressCountry": "US"}
  ]
}
</script>""" % (ORIGIN, ORIGIN)


def render(page, base, body, canonical, jsonld=""):
    head = (
        HEAD.replace("{{TITLE}}", page["title"])
        .replace("{{DESC}}", page["description"])
        .replace("{{CANONICAL}}", canonical)
        .replace("{{PAGE}}", page["page"])
        .replace("{{JSONLD}}", jsonld)
    )
    doc = "\n".join([
        head,
        HEADER,
        '<main id="main">',
        body,
        "</main>",
        FOOTER,
        '<script src="{{B}}assets/js/site.js"></script>',
        "</body>",
        "</html>",
        "",
    ])
    return doc.replace("{{B}}", base)


def build():
    written = []
    for page in CONF["pages"]:
        body = (SRC / "pages" / page["source"]).read_text()
        slug = page["slug"]

        if slug:
            out = ROOT / slug / "index.html"
            base = "../"
            canonical = "%s/%s/" % (ORIGIN, slug)
        else:
            out = ROOT / "index.html"
            base = ""
            canonical = ORIGIN + "/"

        jsonld = ORG_JSONLD if page.get("jsonld") else ""
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(render(page, base, body, canonical, jsonld))
        written.append((str(out.relative_to(ROOT)), canonical))

    # 404 — served from the site root, so it links with absolute paths
    nf = CONF["pages"][0].copy()
    nf.update({
        "title": "Page not found | The Momentum Firm",
        "description": "That page has moved or no longer exists.",
        "page": "404",
    })
    body = (
        '<section class="pagehead">\n'
        '  <div class="wrap">\n'
        '    <span class="eyebrow">404</span>\n'
        '    <h1>That page has moved.</h1>\n'
        '    <p class="lede">The link you followed no longer points anywhere. '
        'Start from the homepage, or tell us what you were looking for.</p>\n'
        '    <div class="hero-actions">\n'
        '      <a class="btn btn--red" href="/">Back to home <span class="arw">&rarr;</span></a>\n'
        '      <a class="btn btn--ghost-light" href="/contact/">Contact us</a>\n'
        "    </div>\n"
        "  </div>\n"
        "</section>\n"
    )
    (ROOT / "404.html").write_text(render(nf, "/", body, ORIGIN + "/404.html"))
    written.append(("404.html", ORIGIN + "/404.html"))

    # sitemap
    urls = "\n".join(
        "  <url><loc>%s</loc></url>" % c for _, c in written if not c.endswith("404.html")
    )
    (ROOT / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + urls
        + "\n</urlset>\n"
    )

    (ROOT / "robots.txt").write_text(
        "User-agent: *\nAllow: /\n\nSitemap: %s/sitemap.xml\n" % ORIGIN
    )

    for path, canonical in written:
        print("  %-28s %s" % (path, canonical))
    print("\n%d pages built." % len(written))


if __name__ == "__main__":
    build()
