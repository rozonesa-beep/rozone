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
      var waNumber = "966506753218";
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

  /* -------- معرض التكبير والتزويم / Image lightbox + zoom -------- */
  (function () {
    var box = document.createElement("div");
    box.className = "lightbox";
    box.innerHTML =
      '<button class="lightbox__btn lightbox__close" aria-label="إغلاق">&times;</button>' +
      '<div class="lightbox__stage"><img class="lightbox__img" alt="" /></div>' +
      '<div class="lightbox__zoom">' +
        '<button class="lightbox__btn" data-z="out" aria-label="تصغير">&minus;</button>' +
        '<button class="lightbox__btn" data-z="reset" aria-label="إعادة الضبط">&#9974;</button>' +
        '<button class="lightbox__btn" data-z="in" aria-label="تكبير">&plus;</button>' +
      "</div>";
    document.body.appendChild(box);

    var img = box.querySelector(".lightbox__img");
    var scale = 1, tx = 0, ty = 0;
    var dragging = false, moved = false, sx = 0, sy = 0;

    function apply() {
      img.style.transform = "translate(" + tx + "px," + ty + "px) scale(" + scale + ")";
      img.classList.toggle("zoomed", scale > 1);
    }
    function reset() { scale = 1; tx = 0; ty = 0; apply(); }
    function open(src, alt) {
      img.src = src; img.alt = alt || "";
      reset();
      box.classList.add("open");
      document.body.style.overflow = "hidden";
    }
    function close() {
      box.classList.remove("open");
      document.body.style.overflow = "";
    }
    function setScale(s) {
      scale = Math.min(5, Math.max(1, s));
      if (scale === 1) { tx = 0; ty = 0; }
      apply();
    }

    // فتح الصور القابلة للتكبير / open zoomable images
    document.addEventListener("click", function (e) {
      var z = e.target.closest("img.zoomable");
      if (z && !e.target.closest("a")) {
        e.preventDefault();
        open(z.currentSrc || z.src, z.alt);
      }
    });

    // أزرار التحكم / control buttons
    box.querySelector(".lightbox__zoom").addEventListener("click", function (e) {
      var b = e.target.closest("[data-z]"); if (!b) return;
      var z = b.getAttribute("data-z");
      if (z === "in") setScale(scale + 0.5);
      else if (z === "out") setScale(scale - 0.5);
      else reset();
    });

    box.querySelector(".lightbox__close").addEventListener("click", close);
    box.addEventListener("click", function (e) {
      if (e.target === box || e.target.classList.contains("lightbox__stage")) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && box.classList.contains("open")) close();
    });

    // عجلة الماوس للتزويم / wheel zoom
    box.addEventListener("wheel", function (e) {
      if (!box.classList.contains("open")) return;
      e.preventDefault();
      setScale(scale + (e.deltaY < 0 ? 0.3 : -0.3));
    }, { passive: false });

    // النقر على الصورة: تبديل التكبير / click image: toggle zoom
    img.addEventListener("click", function (e) {
      e.stopPropagation();
      if (moved) { moved = false; return; }
      setScale(scale > 1 ? 1 : 2);
    });

    // السحب للتحريك عند التكبير / drag to pan when zoomed
    img.addEventListener("mousedown", function (e) {
      if (scale <= 1) return;
      dragging = true; moved = false; sx = e.clientX - tx; sy = e.clientY - ty;
      e.preventDefault();
    });
    window.addEventListener("mousemove", function (e) {
      if (!dragging) return;
      tx = e.clientX - sx; ty = e.clientY - sy; moved = true; apply();
    });
    window.addEventListener("mouseup", function () { dragging = false; });

    // اللمس للجوال / basic touch pan
    img.addEventListener("touchstart", function (e) {
      if (scale <= 1 || e.touches.length !== 1) return;
      dragging = true; sx = e.touches[0].clientX - tx; sy = e.touches[0].clientY - ty;
    }, { passive: true });
    img.addEventListener("touchmove", function (e) {
      if (!dragging || e.touches.length !== 1) return;
      tx = e.touches[0].clientX - sx; ty = e.touches[0].clientY - sy; apply();
    }, { passive: true });
    img.addEventListener("touchend", function () { dragging = false; });
  })();
})();
