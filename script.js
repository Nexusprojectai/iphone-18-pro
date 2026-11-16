/* iPhone 18 Pro — launch page interactions */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  const COLORWAYS = {
    burgundy: { hex: '#7c2430', name: 'Burgundy', stage: ['#3a1018', '#100608'] },
    glacier: { hex: '#c6cdd2', name: 'Glacier', stage: ['#2b3a41', '#0a1013'] },
    silver: { hex: '#d6d5d1', name: 'Silver', stage: ['#3c3c3a', '#0f0f0f'] },
    black: { hex: '#3a3b3d', name: 'Black', stage: ['#232426', '#08090a'] }
  };

  const state = {
    model: 'pro',
    color: 'burgundy',
    storage: 256
  };

  const MODELS = {
    pro: { label: 'Pro', base: 1199, sizes: [256, 512, 1024], extra: { 256: 0, 512: 200, 1024: 400 } },
    promax: { label: 'Pro Max', base: 1299, sizes: [256, 512, 1024, 2048], extra: { 256: 0, 512: 200, 1024: 400, 2048: 800 } }
  };

  /* ---------- nav on scroll ---------- */
  const nav = $('#nav');
  const onScroll = () => {
    if (nav) nav.classList.toggle('solid', window.scrollY > 32);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- hero parallax + stage light ---------- */
  const heroStage = $('.hero-stage');
  if (heroStage && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      heroStage.style.setProperty('--parallax', `${clamp(y * 0.12, 0, 90)}px`);
    }, { passive: true });
  }

  /* ---------- showcase scrub (design section) ---------- */
  const studio = $('.studio');
  const studioPin = $('.studio-pin');
  const chapters = $$('.studio-chapters .chapter');
  const studioCopy = $('#studioCopy');
  const studioStage = $('#studioStage');
  const studioGlow = $('#studioGlow');
  const studioPhone = $('#studioPhone');
  const chapterCopy = {
    0: 'A micro&#8209;island cut 22% narrower than last year. The display flows to the edges, so the only thing between you and a 6.3&#8209;inch frame is glass.',
    1: 'A machined unibody with heat spread through the frame, not trapped against it. 211 g in the hand, and it still disappears in a pocket.',
    2: 'The first iPhone aperture that moves. f/1.4 for depth at dusk, f/4.0 for edge&#8209;to&#8209;edge sharpness at noon. You hear the ring settle.',
    3: 'A20 Pro pads and the vapor chamber share one floorplan. Metal keeps its clock; the phone stays warm, never hot.'
  };

  let chapterIndex = -1;
  const setChapter = (i) => {
    if (i === chapterIndex) return;
    chapterIndex = i;
    chapters.forEach((c, n) => c.classList.toggle('active', n === i));
  };

  if (studio && studioPin) {
    const design = $('#design');
    const update = () => {
      if (!design) return;
      const rect = design.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const p = clamp(-rect.top / Math.max(total, 1), 0, 1);
      studioPhone?.style.setProperty('--scrub', String(p * 4));
      const glow = studioGlow;
      if (glow) {
        const angle = `${-p * 220 + 160}deg`;
        glow.style.setProperty('--angle', angle);
      }
      if (studioCopy) {
        const idx = clamp(Math.floor(p * 4), 0, 3);
        setChapter(idx);
      }
      // subtle model tilt
      if (studioStage) studioStage.style.setProperty('--tilt', `${(p - 0.5) * 16}deg`);
      const b = Math.floor(p * 4);
      if (studio) studio.dataset.active = String(b);
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
    if (studioCopy) studioCopy.innerHTML = chapterCopy[0];
    $$('.studio-chapters .chapter').forEach((c) => c.classList.add('clickable'));
    $$('.studio-chapters .chapter').forEach((c) => {
      c.addEventListener('click', () => {
        const i = $$('.studio-chapters .chapter').indexOf(c);
        const design2 = $('#design');
        if (!design2) return;
        const top = design2.offsetTop + ((design2.offsetHeight - window.innerHeight) * (i / 4));
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  }


  /* ---------- mobile nav ---------- */
  const navToggle = $('.nav-toggle');
  const navLinks = $('.nav-links');
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
    if (navLinks) navLinks.addEventListener('click', (e) => {
      if (e.target.closest('a')) { nav.classList.remove('open'); navToggle.setAttribute('aria-expanded', 'false'); }
    });
  }

  /* ---------- configurator model styling ---------- */
  const buyStage = $('#buyStage');
  const paintModel = () => { if (buyStage) buyStage.dataset.model = state.model; };

  /* ---------- colorway apply anywhere ---------- */
  const applyColor = (key) => {
    const c = COLORWAYS[key] || COLORWAYS.burgundy;
    document.documentElement.style.setProperty('--stage-a', c.stage[0]);
    document.documentElement.style.setProperty('--stage-b', c.stage[1]);
    document.documentElement.style.setProperty('--frame', c.hex);
    document.documentElement.style.setProperty('--frame-2', shade(c.hex, -18));
    const name = $('#colorName');
    if (name) name.textContent = c.name;
    const sumColor = $('#sumColor');
    if (sumColor) sumColor.textContent = c.name;
    const lifeSum = $('#sumColorLife');
    if (lifeSum) lifeSum.textContent = c.name;
    $$('.swatch').forEach((s) => s.classList.toggle('active', s.dataset.color === key));
  };

  // derive a darker edge from a hex color
  function shade(hex, amt) {
    const h = hex.replace('#', '');
    const n = parseInt(h.length === 3 ? h.split('').map((x) => x + x).join('') : h, 16);
    const r = clamp(((n >> 16) & 255) + amt, 0, 255);
    const g = clamp(((n >> 8) & 255) + amt, 0, 255);
    const b = clamp((n & 255) + amt, 0, 255);
    return `rgb(${r}, ${g}, ${b})`;
  }

  /* ---------- aperture slider ---------- */
  const apSlider = $('#apSlider');
  const apValue = $('#apValue');
  const apPreview = $('#apPreview');
  if (apSlider) {
    const updateAp = () => {
      const f = clamp(Number(apSlider.value) || 1.4, 1.4, 4);
      if (apValue) apValue.textContent = `f/${f.toFixed(1)}`;
      const norm = (f - 1.4) / (4.0 - 1.4);
      const blur = $('.ap-blur');
      if (blur) {
        blur.style.filter = `blur(${((1 - norm) * 9).toFixed(1)}px)`;
        blur.style.opacity = String(0.35 + norm * 0.5);
      }
      const subject = $('.ap-subject');
      if (subject) {
        subject.style.boxShadow = `0 0 ${(18 + norm * 40).toFixed(0)}px rgba(214,196,166,${(0.25 + norm * 0.2).toFixed(2)})`;
      }
      const ring = $('#apRing');
      if (ring) {
        ring.style.width = `${30 + norm * 46}%`;
        ring.style.height = `${30 + norm * 46}%`;
        ring.style.opacity = String(0.85 - norm * 0.45);
      }
    };
    apSlider.addEventListener('input', updateAp);
    updateAp();
  }

  /* ---------- benchmark bars animate in ---------- */
  const bars = $$('.bars .bar');
  const animateBars = () => {
    bars.forEach((b, i) => {
      const fill = $('.bar-fill', b);
      const num = $('.bar-num', b);
      if (!fill) return;
      const target = Number(fill.style.getPropertyValue('--w').replace('%', '')) || 0;
      fill.style.width = `${target}%`;
      if (!num) return;
      const label = num.textContent;
      const start = performance.now() + i * 90;
      const dur = 900;
      const step = (t) => {
        const p = clamp((t - start) / dur, 0, 1);
        num.textContent = `${p < 1 ? '+' : label.replace(/^\+?/, '+')}${Math.round(target * (1 - Math.pow(1 - p, 3)))}%`;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  };

  /* ---------- configure / buy ---------- */
  const reserveMsg = $('#reserveMsg');

  const renderPrice = () => {
    const m = MODELS[state.model];
    const extra = m.extra[state.storage] || 0;
    const total = m.base + extra;
    const totalEl = $('#totalPrice');
    if (totalEl) totalEl.textContent = total.toLocaleString('en-US');
    const note = $('#priceNote');
    if (note) {
      note.textContent = extra ? `Includes +$${extra} for ${formatGB(state.storage)}` : 'Base configuration, unlocked, contract-free';
    }
    const sumModel = $('#sumModel');
    if (sumModel) sumModel.textContent = `iPhone 18 ${m.label}`;
    const sumStorage = $('#sumStorage');
    if (sumStorage) sumStorage.textContent = formatGB(state.storage);
    // 2TB is Pro Max only — enforced via data-promax-only
  $$('#optStorage .chip[data-promax-only]').forEach((c) => {
    c.dataset.promaxOnly = 'true';
  });

  $$('#optStorage .chip').forEach((c) => {
      const gb = Number(c.dataset.gb);
      const disabled = !m.sizes.includes(gb);
      c.disabled = disabled;
      c.classList.toggle('active', gb === state.storage);
    });
    const sumPrice = $('#sumPrice');
    if (sumPrice) sumPrice.textContent = `$${total.toLocaleString('en-US')}`;
  };

  function formatGB(gb) {
    return gb >= 1024 ? `${gb / 1024} TB` : `${gb} GB`;
  }

  paintModel();

  $$('#optModel .chip').forEach((c) => {
    c.addEventListener('click', () => {
      state.model = c.dataset.model;
      const m = MODELS[state.model];
      if (!m.sizes.includes(state.storage)) state.storage = 256;
      $$('#optModel .chip').forEach((x) => x.classList.toggle('active', x === c));
      paintModel();
      renderPrice();
    });
  });

  $$('#optStorage .chip').forEach((c) => {
    c.addEventListener('click', () => {
      if (c.disabled) return;
      state.storage = Number(c.dataset.gb);
      renderPrice();
    });
  });

  $$('#optColor .swatch').forEach((s) => {
    s.addEventListener('click', () => {
      state.color = s.dataset.color;
      applyColor(state.color);
    });
  });

  applyColor(state.color);
  renderPrice();

  if (reserveMsg) {
    $('#reserveBtn')?.addEventListener('click', () => {
      const m = MODELS[state.model];
      const total = m.base + (m.extra[state.storage] || 0);
      reserveMsg.innerHTML = `Reserved: <strong>iPhone 18 ${m.label}</strong> · ${COLORWAYS[state.color].name} · ${formatGB(state.storage)} · $${total.toLocaleString('en-US')}. This demo confirms nothing — no order is placed.`;
      reserveMsg.classList.add('show');
    });
  }

  /* ---------- reveal on scroll ---------- */
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in'));
  }

  // fire bars when the benchmark section first appears
  const barsWrap = $('.bars');
  if (barsWrap && 'IntersectionObserver' in window) {
    const bio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          animateBars();
          bio.disconnect();
        }
      });
    }, { threshold: 0.35 });
    bio.observe(barsWrap);
  } else {
    animateBars();
  }

  /* ---------- keyboard model switcher (subtle easter egg) ---------- */
  document.addEventListener('keydown', (ev) => {
    if (ev.target instanceof HTMLInputElement || ev.target instanceof HTMLTextAreaElement) return;
    if (ev.key === 'ArrowRight' || ev.key === 'ArrowLeft') {
      const keys = Object.keys(COLORWAYS);
      const i = keys.indexOf(state.color);
      const next = ev.key === 'ArrowRight' ? (i + 1) % keys.length : (i - 1 + keys.length) % keys.length;
      state.color = keys[next];
      applyColor(state.color);
    }
  });
})();
