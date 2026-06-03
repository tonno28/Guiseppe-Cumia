/* Cumia Putzwerk – Cookie-/Einwilligungs-Banner (DSGVO, Opt-in)
   Lädt externe Inhalte (Google Maps) erst nach aktiver Zustimmung.
   Speichert die Entscheidung lokal im Browser (localStorage), setzt keine Tracking-Cookies. */
(function () {
  "use strict";
  var KEY = "cumia_consent_v1";

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; }
  }
  function write(consent) {
    consent.ts = Date.now();
    try { localStorage.setItem(KEY, JSON.stringify(consent)); } catch (e) {}
    applyConsent();
  }

  /* Externe Karten laden, sobald Einwilligung vorliegt */
  function loadEmbed(box) {
    if (box.dataset.loaded === "1") return;
    var src = box.getAttribute("data-map-src");
    if (!src) return;
    var iframe = document.createElement("iframe");
    iframe.src = src;
    iframe.className = "w-full h-full";
    iframe.loading = "lazy";
    iframe.setAttribute("referrerpolicy", "no-referrer-when-downgrade");
    iframe.setAttribute("allowfullscreen", "");
    iframe.title = box.getAttribute("data-map-title") || "Karte";
    box.innerHTML = "";
    box.appendChild(iframe);
    box.dataset.loaded = "1";
  }

  function applyConsent() {
    var c = read();
    if (c && c.maps) {
      document.querySelectorAll('[data-consent="maps"]').forEach(loadEmbed);
    }
  }

  /* Banner */
  function buildBanner() {
    if (document.getElementById("ccBanner")) return document.getElementById("ccBanner");
    var b = document.createElement("div");
    b.id = "ccBanner";
    b.className = "cc-banner";
    b.setAttribute("role", "dialog");
    b.setAttribute("aria-label", "Hinweis zu Cookies und externen Diensten");
    b.innerHTML =
      '<span class="cc-accent">Cookies &amp; externe Dienste</span>' +
      '<div class="cc-title">Kurz, bevor wir loslegen.</div>' +
      '<p class="cc-text">Technisch notwendige Funktionen nutzen wir immer. Externe Inhalte wie die ' +
      '<strong>Google-Maps-Karte</strong> und eingebundene Schriftarten laden wir nur mit Ihrer Zustimmung – ' +
      'dabei werden Daten an die Anbieter übertragen. Mehr dazu in der ' +
      '<a href="datenschutz.html">Datenschutzerklärung</a>.</p>' +
      '<div class="cc-actions">' +
        '<button type="button" class="cc-btn cc-btn--decline" data-cc="necessary">Nur notwendige</button>' +
        '<button type="button" class="cc-btn cc-btn--accept" data-cc="all">Alle akzeptieren</button>' +
      '</div>';
    document.body.appendChild(b);
    b.querySelector('[data-cc="all"]').addEventListener("click", function () {
      write({ necessary: true, maps: true }); hideBanner();
    });
    b.querySelector('[data-cc="necessary"]').addEventListener("click", function () {
      write({ necessary: true, maps: false }); hideBanner();
    });
    return b;
  }
  function showBanner() {
    var b = buildBanner();
    requestAnimationFrame(function () { b.classList.add("cc-show"); });
  }
  function hideBanner() {
    var b = document.getElementById("ccBanner");
    if (b) b.classList.remove("cc-show");
  }

  /* "Karte mit Standort laden" – aktive Nutzeraktion = Einwilligung für Karten */
  function wireMapButtons() {
    document.querySelectorAll("[data-map-load]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var c = read() || { necessary: true };
        c.maps = true;
        write(c);
        hideBanner();
      });
    });
  }

  /* Footer-Link "Cookie-Einstellungen" */
  function wireSettings() {
    document.querySelectorAll("[data-cookie-settings]").forEach(function (el) {
      el.addEventListener("click", function (e) { e.preventDefault(); showBanner(); });
    });
  }

  function init() {
    wireMapButtons();
    wireSettings();
    applyConsent();
    if (!read()) showBanner();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
