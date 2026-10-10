/* The Momentum Firm — site behaviour
   Mega-menu navigation, mobile drawer, and prototype form handling.
   No dependencies. */
(function () {
  "use strict";

  /* ----------------------------------------------------------
     Current-section highlight
     Some pages live under a nav heading that isn't their own
     slug — press sits under Insights, offices sits under About.
     ---------------------------------------------------------- */
  var NAV_FOR = {
    "what-we-do": "what",
    "who-we-serve": "who",
    "insights": "insights",
    "press": "insights",
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
<<<<<<< HEAD
     Hero carousel
     Auto-advances, but stops on hover, on keyboard focus, and
     for good once the visitor takes control of it. Honours
     prefers-reduced-motion by never starting.
     ---------------------------------------------------------- */
  (function () {
    var root = document.querySelector("[data-carousel]");
    if (!root) return;

    var slides = Array.prototype.slice.call(root.querySelectorAll(".hslide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-go]"));
    if (slides.length < 2) return;

    var count = root.querySelector("[data-count]");
    var pauseBtn = root.querySelector("[data-pause]");
    var DELAY = 7000;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var at = 0;
    var timer = null;
    var playing = false;
    var surrendered = reduce; // visitor took over, or motion is unwelcome

    var ICON_PAUSE = "M9 5v14M15 5v14";
    var ICON_PLAY = "M8 5l11 7-11 7z";

    function show(n) {
      at = (n + slides.length) % slides.length;
      slides.forEach(function (s, k) {
        var on = k === at;
        s.classList.toggle("is-on", on);
        s.setAttribute("aria-hidden", on ? "false" : "true");
      });
      dots.forEach(function (d, k) {
        d.setAttribute("aria-current", k === at ? "true" : "false");
      });
      if (count) count.textContent = (at + 1) + " / " + slides.length;
    }

    function syncButton() {
      if (!pauseBtn) return;
      var path = pauseBtn.querySelector("path");
      if (path) path.setAttribute("d", playing ? ICON_PAUSE : ICON_PLAY);
      pauseBtn.setAttribute("aria-label", playing ? "Pause slideshow" : "Play slideshow");
    }

    function tick() {
      timer = window.setTimeout(function () {
        show(at + 1);
        tick();
      }, DELAY);
    }

    function play() {
      if (surrendered || timer) return;
      playing = true;
      tick();
      syncButton();
    }

    function halt() {
      if (timer) { window.clearTimeout(timer); timer = null; }
    }

    function pause() {
      halt();
      playing = false;
      syncButton();
    }

    /* Any deliberate move by the visitor ends auto-advance for the session —
       nothing is more irritating than a slide changing while you read it. */
    function takeOver(n) {
      surrendered = true;
      halt();
      playing = false;
      syncButton();
      show(n);
    }

    dots.forEach(function (d) {
      d.addEventListener("click", function () {
        takeOver(parseInt(d.getAttribute("data-go"), 10));
      });
    });
    var prevBtn = root.querySelector("[data-prev]");
    var nextBtn = root.querySelector("[data-next]");
    if (prevBtn) prevBtn.addEventListener("click", function () { takeOver(at - 1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { takeOver(at + 1); });

    if (pauseBtn) {
      pauseBtn.addEventListener("click", function () {
        if (playing) { surrendered = true; pause(); }
        else { surrendered = false; play(); }
      });
    }

    root.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); takeOver(at - 1); }
      if (e.key === "ArrowRight") { e.preventDefault(); takeOver(at + 1); }
    });

    root.addEventListener("mouseenter", halt);
    root.addEventListener("mouseleave", function () { if (playing) tick(); });
    root.addEventListener("focusin", halt);
    root.addEventListener("focusout", function () {
      if (playing && !root.contains(document.activeElement)) tick();
    });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) halt();
      else if (playing) tick();
    });

    show(0);
    syncButton();
    play();
  })();

  /* ----------------------------------------------------------
=======
>>>>>>> 3b60dfebe1bb1108554604c135a7295dbec93255
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
