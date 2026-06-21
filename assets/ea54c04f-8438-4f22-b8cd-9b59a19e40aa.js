/* ============================================================
   NOCTIS — Waitlist landing (live backend)
   ============================================================ */
(function () {
  "use strict";

  var wform      = document.getElementById("wform");
  var pending    = document.getElementById("pending");
  var success    = document.getElementById("success");
  var emailEl    = document.getElementById("email");
  var emailField = document.getElementById("emailField");

  /* ---------- URL params ---------- */
  var params        = new URLSearchParams(window.location.search);
  var confirmedCode = params.get("code");
  var errorParam    = params.get("error");
  var refParam      = params.get("ref");
  var unsubParam    = params.get("unsubscribed");

  /* Referral-Code aus URL merken (für späteren Submit) */
  if (refParam) sessionStorage.setItem("noctis_ref", refParam);
  var storedRef = sessionStorage.getItem("noctis_ref");

  /* ---------- Direkt nach Bestätigung ---------- */
  if (params.get("confirmed") === "true" && confirmedCode) {
    showSuccess(confirmedCode);
  }

  /* ---------- Abmeldung bestätigen ---------- */
  if (unsubParam === "true") {
    showFormMsg("Du wurdest erfolgreich von der Warteliste abgemeldet.", false);
  }

  /* ---------- Fehlermeldungen ---------- */
  if (errorParam) {
    var msgs = {
      invalid_token: "Der Bestätigungslink ist ungültig.",
      token_expired: "Der Bestätigungslink ist abgelaufen — bitte trage dich erneut ein.",
      server_error:  "Ein Fehler ist aufgetreten. Bitte versuche es gleich noch einmal."
    };
    showFormMsg(msgs[errorParam] || "Unbekannter Fehler.", true);
  }

  function showFormMsg(text, isErr) {
    var el = document.getElementById("formError");
    if (!el) return;
    el.textContent = text;
    el.style.color = isErr ? "#ff7a7a" : "#a6ffa6";
    el.style.display = "block";
  }

  /* ---------- Form submit → API ---------- */
  wform.addEventListener("submit", function (e) {
    e.preventDefault();
    var val = emailEl.value.trim();
    var ok  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    if (!ok) {
      emailField.classList.add("err");
      emailEl.focus();
      return;
    }
    emailField.classList.remove("err");

    var btn  = wform.querySelector("[type=submit]");
    var orig = btn.innerHTML;
    btn.disabled  = true;
    btn.innerHTML = "Wird gesendet…";

    fetch("/.netlify/functions/signup", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email: val, ref: storedRef || null })
    })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (data.status === "confirmation_sent" || data.status === "already_confirmed") {
        showPending();
      } else {
        btn.disabled  = false;
        btn.innerHTML = orig;
        showFormMsg(data.error === "invalid_email"
          ? "Bitte gib eine gültige E-Mail-Adresse ein."
          : "Ein Fehler ist aufgetreten. Bitte versuche es erneut.", true);
      }
    })
    .catch(function () {
      btn.disabled  = false;
      btn.innerHTML = orig;
      showFormMsg("Verbindungsfehler. Bitte prüfe deine Internetverbindung.", true);
    });
  });
  emailEl.addEventListener("input", function () { emailField.classList.remove("err"); });

  /* ---------- Pending state (E-Mail verschickt) ---------- */
  function showPending() {
    wform.classList.add("hide");
    if (pending) pending.classList.add("active");
  }

  /* ---------- Success state (nach Bestätigung) ---------- */
  function showSuccess(code) {
    wform.classList.add("hide");
    if (pending) pending.classList.remove("active");
    success.classList.add("active");

    var wlEmailBox = document.getElementById("wlEmail");
    if (wlEmailBox) wlEmailBox.style.display = "none";

    var simBtn = document.getElementById("simInvite");
    if (simBtn) simBtn.closest && simBtn.closest(".demo-note") && (simBtn.closest(".demo-note").style.display = "none");

    fetch("/.netlify/functions/position?code=" + encodeURIComponent(code))
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (!data.position) return;
      var posEl = document.getElementById("posNum");
      animateCount(posEl, data.position + 40, data.position);

      var refLink = data.referral_link || ("https://noctis-racing.com/?ref=" + code);
      document.getElementById("refLink").value = refLink;

      var f = data.referrals || 0;
      document.getElementById("friendCount").textContent = f;
      document.getElementById("tierFill").style.width = Math.min(100, (f / 5) * 100) + "%";
      document.querySelectorAll(".tier").forEach(function (t) {
        t.classList.toggle("reached", f >= parseInt(t.getAttribute("data-tier"), 10));
      });

      /* Share-URLs auf echten Link setzen */
      document.querySelectorAll("[data-share]").forEach(function (btn) {
        btn._refUrl = refLink;
      });
    })
    .catch(function () {
      document.getElementById("posNum").textContent = "#—";
    });

    openReferral(true);
  }

  function animateCount(el, from, to) {
    var t0 = performance.now();
    (function step(now) {
      var k    = Math.min(1, (now - t0) / 700);
      var ease = 1 - Math.pow(1 - k, 3);
      el.textContent = "#" + Math.round(from + (to - from) * ease);
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  }

  /* ---------- Live counter (cosmetic upward drift) ---------- */
  var liveCount = document.getElementById("liveCount");
  if (liveCount) {
    var base  = 2487;
    var drift = parseInt(sessionStorage.getItem("noctis_live") || "0", 10);
    function fmt(n) { return n.toLocaleString("de-DE"); }
    liveCount.textContent = fmt(base + drift);
    setInterval(function () {
      if (Math.random() < 0.5) {
        drift++;
        sessionStorage.setItem("noctis_live", String(drift));
        liveCount.textContent = fmt(base + drift);
      }
    }, 4000);
  }

  /* ---------- Copy link ---------- */
  var copyBtn = document.getElementById("copyBtn");
  var toast   = document.getElementById("toast");
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () { toast.classList.remove("show"); }, 1900);
  }
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var link = document.getElementById("refLink");
      var text = link.value;
      var done = function () {
        copyBtn.textContent = "Kopiert ✓";
        copyBtn.classList.add("done");
        showToast("Link kopiert ✦");
        setTimeout(function () { copyBtn.textContent = "Link kopieren"; copyBtn.classList.remove("done"); }, 2200);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(link); done(); });
      } else { fallbackCopy(link); done(); }
    });
  }
  function fallbackCopy(input) {
    input.removeAttribute("readonly");
    input.select();
    try { document.execCommand("copy"); } catch (e) {}
    input.setAttribute("readonly", "");
  }

  /* ---------- Share buttons ---------- */
  document.querySelectorAll("[data-share]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var url = btn._refUrl || "https://noctis-racing.com";
      var msg = "NOCTIS dropt bald — Premium Custom Sticker für Rider. Sichere dir 40% Rabatt auf der Warteliste:";
      var type   = btn.getAttribute("data-share");
      var target = "";
      if      (type === "whatsapp") target = "https://wa.me/?text=" + encodeURIComponent(msg + " " + url);
      else if (type === "telegram") target = "https://t.me/share/url?url=" + encodeURIComponent(url) + "&text=" + encodeURIComponent(msg);
      else if (type === "x")        target = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(msg) + "&url=" + encodeURIComponent(url);
      if (target) window.open(target, "_blank", "noopener,noreferrer");
    });
  });

  /* ---------- Open referral link group ---------- */
  var reflinkGroup = document.querySelector(".reflink-group");
  function openReferral(animate) {
    if (!reflinkGroup) return;
    if (!animate) {
      var prev = reflinkGroup.style.transition;
      reflinkGroup.style.transition = "none";
      reflinkGroup.classList.add("referral-open");
      void reflinkGroup.offsetHeight;
      reflinkGroup.style.transition = prev;
    } else {
      reflinkGroup.classList.add("referral-open");
    }
  }

  /* ---------- Final CTA → focus form ---------- */
  var ctaScroll = document.getElementById("ctaScroll");
  if (ctaScroll) {
    ctaScroll.addEventListener("click", function () {
      var card = document.getElementById("wcard");
      var y    = card.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top: y, behavior: "smooth" });
      if (!success.classList.contains("active")) {
        setTimeout(function () { emailEl.focus({ preventScroll: true }); }, 500);
      }
    });
  }

  /* ---------- Countdown ---------- */
  var KEY    = "noctis_release";
  var cdTarget = parseInt(sessionStorage.getItem(KEY), 10);
  var now    = Date.now();
  if (!cdTarget || isNaN(cdTarget) || cdTarget < now) {
    cdTarget = now + (18 * 86400000) + (6 * 3600000) + (42 * 60000);
    sessionStorage.setItem(KEY, String(cdTarget));
  }
  var cd = document.getElementById("countdown");
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function tick() {
    if (!cd) return;
    var diff = Math.max(0, cdTarget - Date.now());
    var s    = Math.floor(diff / 1000);
    var d    = Math.floor(s / 86400); s -= d * 86400;
    var h    = Math.floor(s / 3600);  s -= h * 3600;
    var m    = Math.floor(s / 60);    s -= m * 60;
    cd.querySelector("[data-d]").textContent = pad(d);
    cd.querySelector("[data-h]").textContent = pad(h);
    cd.querySelector("[data-m]").textContent = pad(m);
    cd.querySelector("[data-s]").textContent = pad(s);
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var q = item.querySelector(".faq-q");
    var a = item.querySelector(".faq-a");
    q.addEventListener("click", function () {
      var open = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach(function (o) {
        if (o !== item) { o.classList.remove("open"); o.querySelector(".faq-a").style.maxHeight = null; }
      });
      if (open) { item.classList.remove("open"); a.style.maxHeight = null; }
      else      { item.classList.add("open");    a.style.maxHeight = a.scrollHeight + "px"; }
    });
  });

  /* ---------- Scroll reveal ---------- */
  var reveals = [].slice.call(document.querySelectorAll(".reveal"));
  function revealInView() {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    reveals.forEach(function (el) {
      if (el.classList.contains("in")) return;
      var r = el.getBoundingClientRect();
      if (r.top < vh * 0.92 && r.bottom > 0) el.classList.add("in");
    });
  }
  revealInView();
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });
    reveals.forEach(function (el) { if (!el.classList.contains("in")) io.observe(el); });
  }
  window.addEventListener("scroll", revealInView, { passive: true });
  setTimeout(revealInView, 400);
})();
