/* The Momentum Firm — site behaviour
   Mega-menu navigation, mobile drawer, and prototype form handling.
   No dependencies. */
(function () {
  "use strict";

  /* ----------------------------------------------------------
     Current-section highlight
     Some pages live under a nav heading that isn't their own
     slug — press sits under Insights; the founder, mission and
     social impact pages sit under About.
     ---------------------------------------------------------- */
  var NAV_FOR = {
    "what-we-do": "what",
    "who-we-serve": "who",
    "insights": "insights",
    "press": "insights",
    "our-founder": "about",
    "about": "about",
    "mission-vision-values": "about",
    "social-impact": "about",
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
      root.setAttribute("data-slide", at); // lets CSS swap the art beside slide 1
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
     Forms
     Every field is required; email fields must look like an
     address. Errors show under each field and clear as the
     visitor fixes them. Message boxes count toward 500 characters.
     All three forms go to one inbox; each carries a hidden
     "category" field (General Inquiry, Talent Network Inquiry,
     Request for Community Support) that becomes the subject.
     Prototype behaviour only — no endpoint is wired up yet.
     Send `submission` from the success branch to a form service
     or endpoint when the backend is chosen.
     ---------------------------------------------------------- */
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var INBOX = "info@themomentumfirm.com";

  function problem(el) {
    var v = (el.value || "").trim();
    if (!v) return el.tagName === "SELECT" ? "Please choose an option." : "Please fill in this field.";
    if (el.type === "email" && !EMAIL.test(v)) return "Enter a valid email address, like name@example.com.";
    if (el.maxLength > 0 && v.length > el.maxLength) return "Keep this under " + el.maxLength + " characters.";
    return "";
  }

  function setError(el, msg) {
    var id = el.id + "-error";
    var box = document.getElementById(id);
    var described = (el.getAttribute("aria-describedby") || "").split(" ").filter(function (x) { return x && x !== id; });
    if (msg) {
      if (!box) {
        box = document.createElement("p");
        box.className = "field-error";
        box.id = id;
        el.closest(".field").appendChild(box);
      }
      box.textContent = msg;
      el.setAttribute("aria-invalid", "true");
      described.push(id);
    } else {
      if (box) box.remove();
      el.removeAttribute("aria-invalid");
    }
    if (described.length) el.setAttribute("aria-describedby", described.join(" "));
    else el.removeAttribute("aria-describedby");
  }

  [["talent-form", "talent-done"], ["contact-form", "contact-done"], ["support-form", "support-done"]].forEach(function (pair) {
    var f = document.getElementById(pair[0]);
    var d = document.getElementById(pair[1]);
    if (!f || !d) return;
    var fields = Array.prototype.slice.call(f.querySelectorAll("input:not([type=hidden]), select, textarea"));

    fields.forEach(function (el) {
      var count = el.maxLength > 0 && document.getElementById(el.id + "-count");
      function update() {
        if (count) count.textContent = el.value.length + " / " + el.maxLength + " characters";
        if (el.getAttribute("aria-invalid") === "true") setError(el, problem(el));
      }
      el.addEventListener("input", update);
      el.addEventListener("change", update);
    });

    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var first = null;
      fields.forEach(function (el) {
        var msg = problem(el);
        setError(el, msg);
        if (msg && !first) first = el;
      });
      if (first) {
        d.classList.remove("show");
        first.focus();
        return;
      }
      var data = new FormData(f);
      var submission = { to: INBOX, subject: data.get("category"), fields: {} };
      data.forEach(function (value, key) { if (key !== "category") submission.fields[key] = value; });
      // TODO: send `submission` to the chosen form service or endpoint.
      d.classList.add("show");
      d.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
  });
})();
