#!/usr/bin/env python3
"""
Build a single-file preview of the whole site.

Assembles every page into one self-contained HTML file with a hash router
and all CSS, JS and images inlined, so the site can be shared as one link
for review without hosting anything.

    python3 preview.py        # writes preview.html

This is a review artifact only — it is not what ships. `build.py` produces
the real multi-page site. preview.html is gitignored.
"""

import base64
import json
import mimetypes
import pathlib
import re

ROOT = pathlib.Path(__file__).parent.resolve()
SRC = ROOT / "src"
CONF = json.loads((ROOT / "site.json").read_text())

PAGES = [(p["slug"] or "home", p["source"]) for p in CONF["pages"]]
SLUGS = [s for s, _ in PAGES]


def data_uri(rel):
    path = ROOT / rel
    mime = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
    return "data:%s;base64,%s" % (mime, base64.b64encode(path.read_bytes()).decode())


def inline_images(html):
    """assets/img/x.png → data: URI"""
    return re.sub(
        r'(src=")(assets/img/[^"]+)(")',
        lambda m: m.group(1) + data_uri(m.group(2)) + m.group(3),
        html,
    )


def to_hash_links(html):
    """Real URLs become hash routes so one file can serve every page."""
    html = re.sub(r'href="([a-z0-9\-]+)/"', r'href="#/\1"', html)
    html = re.sub(r'href=""', 'href="#/home"', html)
    return html


def prep(html):
    return to_hash_links(inline_images(html.replace("{{B}}", "")))


ROUTER = """
(function(){
  "use strict";
  var PAGES = %s;
  var NAV_FOR = {"what-we-do":"what","who-we-serve":"who","insights":"insights",
                 "press":"insights","about":"about","offices":"about","careers":"careers"};
  function route(){
    var id = (location.hash || "#/home").replace("#/","").split("?")[0];
    if (PAGES.indexOf(id) === -1) id = "home";
    PAGES.forEach(function(p){
      var el = document.getElementById("page-" + p);
      if (el) el.classList.toggle("active", p === id);
    });
    document.body.setAttribute("data-page", id);
    document.querySelectorAll(".navbtn").forEach(function(b){
      var key = b.getAttribute("data-menu") || (b.getAttribute("href")||"").replace("#/","");
      var on = (key === NAV_FOR[id] || key === id);
      b.classList.toggle("is-current", on);
      if (on) b.setAttribute("aria-current","page"); else b.removeAttribute("aria-current");
    });
    document.querySelectorAll(".mega").forEach(function(m){ m.hidden = true; });
    var dr = document.getElementById("drawer");
    if (dr) dr.classList.remove("open");
    window.scrollTo(0,0);
  }
  window.addEventListener("hashchange", route);
  route();
})();
""" % json.dumps(SLUGS)


def build():
    css = (ROOT / "assets" / "css" / "styles.css").read_text()
    css += "\n.page{display:none}\n.page.active{display:block}\n"
    js = (ROOT / "assets" / "js" / "site.js").read_text()

    header = prep((SRC / "partials" / "header.html").read_text())
    footer = prep((SRC / "partials" / "footer.html").read_text())

    body = []
    for slug, source in PAGES:
        frag = prep((SRC / "pages" / source).read_text())
        body.append('<div class="page" id="page-%s">\n%s\n</div>' % (slug, frag))

    doc = "\n".join([
        "<title>The Momentum Firm</title>",
        '<link rel="preconnect" href="https://fonts.googleapis.com">',
        '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
        '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?'
        "family=Montserrat:ital,wght@0,600;0,700;0,800;1,700;1,800"
        '&family=Rubik:ital,wght@0,400;0,500;0,600;1,400&display=swap">',
        "<style>\n" + css + "\n</style>",
        header,
        '<main id="main">',
        "\n".join(body),
        "</main>",
        footer,
        "<script>\n" + js + "\n" + ROUTER + "\n</script>",
        "",
    ])

    out = ROOT / "preview.html"
    out.write_text(doc)
    print("preview.html — %d pages, %.0f KB" % (len(PAGES), len(doc) / 1024))


if __name__ == "__main__":
    build()
