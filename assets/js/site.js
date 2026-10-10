/* The Momentum Firm — site behaviour
   Mega-menu navigation, mobile drawer, and prototype form handling.
   No dependencies. */
(function () {
  "use strict";

  /* ----------------------------------------------------------
     Current-section highlight
     Some pages live under a nav heading that isn't their own
     slug — press and offices both sit under About.
     ---------------------------------------------------------- */
  var NAV_FOR = {
    "what-we-do": "what",
    "who-we-serve": "who",
    "insights": "insights",
    "press": "about",
    "about": "about",
    "offices": "about",
    "careers": "careers"
  };

  var page = document.body.getAttribute("data-page") || "home";
  var current = NAV_FOR[page];
  if (current) {
    document.querySelectorAll(".navbtn").forEach(function (b) {
      var key = b.getAttribute("data-menu") ||
                (b.getAttribute("href") || "").replace(/\//g, "");
      if (key === current || key === page) {
        b.classList.add("is-current");
        b.setAttribute("aria-current", "page");
      }
    });
  }

  /* ----------------------------------------------------------
     Mega menus
     ---------------------------------------------------------- */
  var openKey = null;

  function closeMenus() {
    document.querySelectorAll(".mega").forEach(function (m) { m.hidden = true; });
    document.querySelectorAll(".navbtn[data-menu]").forEach(function (b) {
      b.setAttribute("aria-expanded", "false");
    });
    openKey = null;
  }

  function openMenu(key) {
    closeMenus();
    var m = document.getElementById("mega-" + key);
    var b = document.querySelector('.navbtn[data-menu="' + key + '"]');
    if (!m || !b) return;
    m.hidden = false;
    b.setAttribute("aria-expanded", "true");
    openKey = key;
  }

  document.querySelectorAll(".navbtn[data-menu]").forEach(function (btn) {
    var key = btn.getAttribute("data-menu");
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (openKey === key) closeMenus(); else openMenu(key);
    });
    btn.addEventListener("mouseenter", function () { openMenu(key); });
  });

  var head = document.querySelector(".masthead");
  if (head) head.addEventListener("mouseleave", closeMenus);

  document.addEventListener("click", function (e) {
    if (openKey && !e.target.closest(".masthead")) closeMenus();
  });

  /* ----------------------------------------------------------
     Mobile drawer
     ---------------------------------------------------------- */
  var burger = document.getElementById("burger");
  var drawer = document.getElementById("drawer");

  function closeDrawer() {
    if (!drawer || !burger) return;
    drawer.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Open menu");
  }

  if (burger && drawer) {
    burger.addEventListener("click", function () {
      var open = drawer.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeMenus(); closeDrawer(); }
  });

  /* ----------------------------------------------------------
     Forms
     Prototype behaviour only — no endpoint is wired up yet.
     Replace the submit handler with a real POST (or point the
     <form> at a form service) when the backend is chosen.
     ---------------------------------------------------------- */
  [["talent-form", "talent-done"], ["contact-form", "contact-done"]].forEach(function (pair) {
    var f = document.getElementById(pair[0]);
    var d = document.getElementById(pair[1]);
    if (!f || !d) return;
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      d.classList.add("show");
      d.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
  });
})();
