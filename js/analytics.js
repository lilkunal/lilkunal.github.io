/* Google Analytics 4 — loads only when gaMeasurementId is set in site-config.js */
(function () {
  "use strict";

  var cfg = window.KV_SITE || {};
  var id = (cfg.gaMeasurementId || "").trim();
  if (!id || !/^G-[A-Z0-9]+$/i.test(id)) return;

  /* EEA/GDPR ISO 3166-2 — no consent banner; deny all storage in these regions. */
  var GDPR_REGIONS = [
    "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
    "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK",
    "SI", "ES", "SE", "GB", "IS", "LI", "NO", "CH"
  ];

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;

  /* Consent defaults MUST run before gtag("config", …). */
  gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "granted"
  });
  gtag("consent", "default", {
    region: GDPR_REGIONS,
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied"
  });

  gtag("js", new Date());
  gtag("config", id, {
    anonymize_ip: true,
    send_page_view: true
  });

  var s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
  document.head.appendChild(s);

  /* Track outbound hire-intent clicks (contact, résumé, live work) */
  document.addEventListener(
    "click",
    function (e) {
      var a = e.target.closest("a[href]");
      if (!a || typeof gtag !== "function") return;
      var href = a.getAttribute("href") || "";
      if (
        href.indexOf("mailto:") === 0 ||
        href.indexOf("tel:") === 0 ||
        href.indexOf("wa.me") !== -1 ||
        href.indexOf("linkedin.com") !== -1 ||
        href.indexOf("github.com") !== -1 ||
        a.classList.contains("nav__cta") ||
        a.classList.contains("work-stack__cta")
      ) {
        gtag("event", "hire_intent_click", {
          link_url: href,
          link_text: (a.textContent || "").trim().slice(0, 80)
        });
      }
    },
    true
  );
})();
