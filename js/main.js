/* ===========================================================
   مؤسسة روز وان للمقاولات — Rose One Contracting
   الوظائف الرئيسية: تبديل اللغة، القائمة، الحركات، النموذج
   Main scripts: language toggle, menu, reveal, form
   =========================================================== */

(function () {
  "use strict";

  /* -------- تبديل اللغة / Language toggle -------- */
  var STORAGE_KEY = "roseone-lang";

  function applyLang(lang) {
    var html = document.documentElement;
    html.setAttribute("lang", lang);
    html.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");

    // إظهار/إخفاء النصوص حسب اللغة
    // العناصر التي تحمل data-ar و data-en تعرض النص المناسب
    document.querySelectorAll("[data-ar][data-en]").forEach(function (el) {
      var txt = el.getAttribute("data-" + lang);
      if (txt !== null) {
        // نتجاهل العناصر التي تحتوي عناصر فرعية مترجمة
        if (!el.querySelector("[data-ar][data-en]")) {
          el.textContent = txt;
        }
      }
    });

    // العناصر النائبة في الحقول / placeholders
    document.querySelectorAll("[data-ar-ph][data-en-ph]").forEach(function (el) {
      el.setAttribute("placeholder", el.getAttribute("data-" + lang + "-ph"));
    });

    // تحديث زر التبديل
    var toggleLabel = document.querySelector(".lang-toggle .lang-label");
    if (toggleLabel) toggleLabel.textContent = lang === "ar" ? "English" : "عربي";

    // تحديث عنوان الصفحة
    var titleEl = document.querySelector("title[data-ar][data-en]");
    if (titleEl) document.title = titleEl.getAttribute("data-" + lang);

    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
  }

  function currentLang() {
    var saved;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    return saved || "ar";
  }

  // تطبيق اللغة المحفوظة عند التحميل
  applyLang(currentLang());

  document.addEventListener("click", function (e) {
    var toggle = e.target.closest(".lang-toggle");
    if (toggle) {
      var next = currentLang() === "ar" ? "en" : "ar";
      applyLang(next);
    }
  });

  /* -------- قائمة الجوال / Mobile menu -------- */
  var menuBtn = document.querySelector(".menu-btn");
  var nav = document.querySelector(".nav");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      menuBtn.classList.toggle("open");
      nav.classList.toggle("open");
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        menuBtn.classList.remove("open");
        nav.classList.remove("open");
      });
    });
  }

  /* -------- حركات الظهور / Reveal on scroll -------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  /* -------- عدّاد الأرقام / Stats counter -------- */
  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window && counters.length) {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseInt(el.getAttribute("data-count"), 10);
        var suffix = el.getAttribute("data-suffix") || "";
        var dur = 1400, start = 0, t0 = null;
        function step(ts) {
          if (!t0) t0 = ts;
          var p = Math.min((ts - t0) / dur, 1);
          el.textContent = Math.floor(p * (target - start) + start) + suffix;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        countObserver.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { countObserver.observe(el); });
  }

  /* -------- نموذج التواصل / Contact form -------- */
  var form = document.querySelector(".contact-form form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var lang = currentLang();
      var data = new FormData(form);
      var name = data.get("name") || "";
      var phone = data.get("phone") || "";
      var service = data.get("service") || "";
      var message = data.get("message") || "";

      // إرسال عبر واتساب / Send via WhatsApp
      var waNumber = "966581329955";
      var lines = lang === "ar"
        ? ["مرحباً، طلب جديد من الموقع:", "الاسم: " + name, "الجوال: " + phone, "الخدمة: " + service, "الرسالة: " + message]
        : ["Hello, new request from the website:", "Name: " + name, "Phone: " + phone, "Service: " + service, "Message: " + message];
      var text = encodeURIComponent(lines.join("\n"));
      window.open("https://wa.me/" + waNumber + "?text=" + text, "_blank");
      form.reset();
    });
  }

  /* -------- سنة الفوتر / Footer year -------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
