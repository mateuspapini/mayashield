/* MayaShield — interacciones */
(function () {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Navegación ---------- */
  const nav = $("#nav");
  const burger = $("#burger");
  const onScrollNav = () => nav.classList.toggle("scrolled", window.scrollY > 24);
  onScrollNav();
  window.addEventListener("scroll", onScrollNav, { passive: true });
  burger.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  });
  $$("#mobileMenu a").forEach((a) => a.addEventListener("click", () => {
    nav.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
  }));

  // sección actual en el menú
  const navLinks = $$(".nav-links a");
  const sections = navLinks.map((a) => $(a.getAttribute("href"))).filter(Boolean);
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle("is-current", a.getAttribute("href") === "#" + e.target.id));
    });
  }, { rootMargin: "-40% 0px -55% 0px" });
  sections.forEach((s) => io.observe(s));

  /* ---------- Medidor de profundidad ---------- */
  const gauge = $("#gauge");
  const gaugeFill = $("#gaugeFill");
  const gaugeDepth = $("#gaugeDepth");
  const darkSections = $$(".process, .guarantee, .footer");
  const MAX_DEPTH = 40; // metros "virtuales" al final de la página
  let ticking = false;
  const updateGauge = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    gaugeFill.style.height = (p * 100).toFixed(1) + "%";
    gaugeDepth.textContent = p === 0 ? "0" : "−" + Math.round(p * MAX_DEPTH);
    gauge.classList.toggle("show", window.scrollY > 120);
    // ¿el medidor está sobre una sección oscura?
    const gy = gauge.getBoundingClientRect().top + gauge.offsetHeight / 2;
    const onDark = darkSections.some((s) => {
      const r = s.getBoundingClientRect();
      return gy >= r.top && gy <= r.bottom;
    });
    gauge.classList.toggle("on-dark", onDark);
    ticking = false;
  };
  window.addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(updateGauge); ticking = true; }
  }, { passive: true });
  updateGauge();

  /* ---------- Contadores del hero ---------- */
  const fmt = (n) => n.toLocaleString("es-MX");
  $$("[data-count]").forEach((el) => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    if (reduce) { el.textContent = fmt(target) + suffix; return; }
    const start = performance.now() + 700;
    const dur = 1600;
    const tick = (t) => {
      const k = Math.min(1, Math.max(0, (t - start) / dur));
      const eased = 1 - Math.pow(1 - k, 3);
      el.textContent = fmt(Math.round(target * eased)) + suffix;
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  /* ---------- Tabs de sistemas ---------- */
  const tabs = $$('#tabs [role="tab"]');
  const panels = $$("#tabs .tab-panel");
  const ind = $("#tabInd");
  const moveInd = (btn) => {
    ind.style.left = btn.offsetLeft + "px";
    ind.style.width = btn.offsetWidth + "px";
  };
  const selectTab = (btn) => {
    tabs.forEach((t) => {
      const on = t === btn;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
    });
    panels.forEach((p) => {
      const on = p.id === btn.getAttribute("aria-controls");
      p.hidden = !on;
      p.classList.toggle("is-active", on);
    });
    moveInd(btn);
    btn.scrollIntoView({ block: "nearest", inline: "center", behavior: reduce ? "auto" : "smooth" });
  };
  tabs.forEach((btn, i) => {
    btn.addEventListener("click", () => selectTab(btn));
    btn.addEventListener("keydown", (e) => {
      const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      const next = tabs[(i + dir + tabs.length) % tabs.length];
      selectTab(next); next.focus();
    });
  });
  const initInd = () => moveInd(tabs.find((t) => t.getAttribute("aria-selected") === "true"));
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(initInd); else initInd();
  window.addEventListener("resize", initInd);

  /* ---------- Proceso: etapa activa por scroll ---------- */
  const steps = $$("#steps .step");
  const pmFill = $("#pmFill");
  const pmNum = $("#pmNum");
  const stepIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const idx = steps.indexOf(e.target);
      steps.forEach((s, i) => s.classList.toggle("is-on", i <= idx));
      pmFill.style.width = ((idx + 1) / steps.length * 100) + "%";
      pmNum.textContent = idx + 1;
    });
  }, { rootMargin: "-45% 0px -45% 0px" });
  steps.forEach((s) => stepIO.observe(s));
  steps[0].classList.add("is-on");

  /* ---------- Comparador antes / después ---------- */
  const cmp = $("#compare");
  const after = $("#cmpAfter");
  const handle = $("#cmpHandle");
  let dragging = false;
  const setCmp = (pct) => {
    pct = Math.max(2, Math.min(98, pct));
    after.style.clipPath = `inset(0 0 0 ${pct}%)`;
    handle.style.left = pct + "%";
    handle.setAttribute("aria-valuenow", Math.round(pct));
  };
  const fromEvent = (e) => {
    const r = cmp.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
    setCmp(x / r.width * 100);
  };
  cmp.addEventListener("pointerdown", (e) => { dragging = true; cmp.setPointerCapture(e.pointerId); fromEvent(e); });
  cmp.addEventListener("pointermove", (e) => { if (dragging) fromEvent(e); });
  cmp.addEventListener("pointerup", () => { dragging = false; });
  cmp.addEventListener("pointercancel", () => { dragging = false; });
  handle.addEventListener("keydown", (e) => {
    const cur = Number(handle.getAttribute("aria-valuenow"));
    if (e.key === "ArrowLeft") { e.preventDefault(); setCmp(cur - 4); }
    if (e.key === "ArrowRight") { e.preventDefault(); setCmp(cur + 4); }
  });

  /* ---------- Proyectos: flechas del carrusel ---------- */
  const scroller = $("#scroller");
  const stepW = () => (scroller.querySelector(".proj").offsetWidth + 19);
  $("#prevP").addEventListener("click", () => scroller.scrollBy({ left: -stepW(), behavior: "smooth" }));
  $("#nextP").addEventListener("click", () => scroller.scrollBy({ left: stepW(), behavior: "smooth" }));

  /* ---------- Marquee: duplicar contenido para bucle continuo ---------- */
  const track = $("#marquee");
  if (track && !reduce) track.innerHTML += track.innerHTML;

  /* ---------- FAQ: cierre animado ---------- */
  $$("#acc details").forEach((d) => {
    const body = d.querySelector(".acc-body");
    d.querySelector("summary").addEventListener("click", (e) => {
      if (reduce || !d.open) return; // abrir: el navegador lo hace; cerrar: animamos
      e.preventDefault();
      const h = body.offsetHeight;
      const anim = body.animate([{ height: h + "px", opacity: 1 }, { height: "0px", opacity: 0 }], { duration: 260, easing: "ease" });
      anim.onfinish = () => { d.open = false; };
    });
    d.addEventListener("toggle", () => {
      if (!d.open || reduce) return;
      const h = body.offsetHeight;
      body.animate([{ height: "0px", opacity: 0 }, { height: h + "px", opacity: 1 }], { duration: 320, easing: "cubic-bezier(.22,.61,.36,1)" });
    });
  });

  /* ---------- Aparición por scroll ---------- */
  const revealTargets = $$(".problem-grid > *, .bento .card, .tabs, .compare, .proj, .g-copy, .g-list li, .acc, .c-copy, .c-form");
  revealTargets.forEach((el, i) => { el.classList.add("reveal"); el.style.transitionDelay = (i % 6) * 60 + "ms"; });
  const rIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); rIO.unobserve(e.target); } });
  }, { threshold: 0, rootMargin: "0px 0px -4% 0px" });
  revealTargets.forEach((el) => rIO.observe(el));
  // respaldo: cualquier elemento ya visible se muestra aunque el observer no haya disparado
  const revealFallback = () => revealTargets.forEach((el) => {
    if (!el.classList.contains("in") && el.getBoundingClientRect().top < window.innerHeight * 1.05) el.classList.add("in");
  });
  window.addEventListener("scroll", revealFallback, { passive: true });
  window.addEventListener("resize", revealFallback);
  setTimeout(revealFallback, 400);

  /* ---------- Formulario (mailto) ---------- */
  const form = $("#form");
  const note = $("#formNote");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let ok = true;
    $$("[required]", form).forEach((f) => {
      const bad = !f.value.trim() || (f.type === "email" && !/^\S+@\S+\.\S+$/.test(f.value));
      f.classList.toggle("is-invalid", bad);
      if (bad) ok = false;
    });
    if (!ok) { note.textContent = "Revisa los campos marcados antes de enviar."; note.classList.remove("ok"); return; }
    const d = Object.fromEntries(new FormData(form).entries());
    const body = [
      `Nombre: ${d.nombre}`, `Teléfono: ${d.telefono}`, `Correo: ${d.correo}`,
      `Estructura: ${d.estructura}`, `Ubicación: ${d.ubicacion || "-"}`, "", d.mensaje || ""
    ].join("\n");
    window.location.href = "mailto:contacto@mayashield.mx?subject=" + encodeURIComponent("Solicitud de evaluación técnica — " + d.nombre) + "&body=" + encodeURIComponent(body);
    note.textContent = "Solicitud lista. Si tu correo no se abrió, escríbenos a contacto@mayashield.mx.";
    note.classList.add("ok");
  });

  $("#year").textContent = new Date().getFullYear();
})();
