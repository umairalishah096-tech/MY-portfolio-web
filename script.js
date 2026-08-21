/* ================================================================
   UMAIR ALI SHAH — PORTFOLIO
   script.js | All Interactions, Animations & Effects
   ================================================================
   Stack: GSAP 3 + ScrollTrigger + TextPlugin
          Lenis (smooth scroll)
          Three.js (WebGL particles)
          Vanilla Tilt (3D card tilt)
          EmailJS (contact form)
   ================================================================ */

'use strict';

/* ──────────────────────────────────────────────────────────────
   UTILITY HELPERS
────────────────────────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
const lerp = (a, b, t) => a + (b - a) * t;

/* ──────────────────────────────────────────────────────────────
   WAIT FOR LIBS (GSAP / Lenis / Three loaded via defer)
   THREE.js is optional — if it doesn't load, skip particles
────────────────────────────────────────────────────────────── */
function waitForLibs(cb) {
  const required = ['gsap', 'ScrollTrigger', 'Lenis'];
  const check = () => required.every(l => window[l]);
  if (check()) { cb(); return; }
  let attempts = 0;
  const timer = setInterval(() => {
    attempts++;
    if (check()) { clearInterval(timer); cb(); return; }
    // After 8s give up waiting — run without any missing lib
    if (attempts > 160) { clearInterval(timer); cb(); }
  }, 50);
}

/* ================================================================
   BOOT — entry point
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initCursor();
  initTheme();
  initNav();
  initScrollProgress();
  waitForLibs(initAll);
});

/* ================================================================
   LOADING SCREEN
   ================================================================ */
function initLoader() {
  const loader    = $('#loader');
  const fill      = $('#loaderFill');
  const percent   = $('#loaderPercent');
  if (!loader) return;

  let current = 0;
  const target  = 100;
  const dur     = 1400; // ms
  const start   = performance.now();

  function tick(now) {
    const elapsed  = now - start;
    const progress = clamp(elapsed / dur, 0, 1);
    // Ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    current = Math.round(eased * target);
    fill.style.width   = current + '%';
    percent.textContent = current + '%';
    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      hideLoader(loader);
    }
  }
  requestAnimationFrame(tick);
}

function hideLoader(loader) {
  loader.classList.add('is-hiding');
  // After panels slide away, remove loader entirely
  setTimeout(() => {
    loader.style.display = 'none';
    document.body.style.overflow = '';
    // Trigger hero entrance after loader exits
    if (window._heroTimeline) window._heroTimeline.play();
  }, 1000);
}

/* ================================================================
   CUSTOM CURSOR
   ================================================================ */
function initCursor() {
  const dot  = $('#cursorDot');
  const ring = $('#cursorRing');
  if (!dot || !ring) return;
  // Touch devices: hide
  if (window.matchMedia('(hover: none)').matches) return;

  let dotX = 0, dotY = 0;
  let ringX = 0, ringY = 0;
  let raf;

  document.addEventListener('mousemove', e => {
    dotX = e.clientX;
    dotY = e.clientY;
  });

  function animateCursor() {
    // Dot: instant
    dot.style.transform = `translate(${dotX}px, ${dotY}px) translate(-50%, -50%)`;
    // Ring: faster lerp = less perceived lag
    ringX = lerp(ringX, dotX, 0.22);
    ringY = lerp(ringY, dotY, 0.22);
    ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    raf = requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Hover states
  const hoverTargets = 'a, button, .btn, .skill-card, .project-card, .service-card, .contact__card, .timeline__card, .hero__social, .contact__social, .skills__tab, .nav__link';

  document.addEventListener('mouseover', e => {
    if (e.target.closest(hoverTargets)) {
      document.body.classList.add('cursor--hovering');
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(hoverTargets)) {
      document.body.classList.remove('cursor--hovering');
    }
  });
  document.addEventListener('mousedown', () => document.body.classList.add('cursor--clicking'));
  document.addEventListener('mouseup',   () => document.body.classList.remove('cursor--clicking'));

  // Hide when leaving window
  document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });
}

/* ================================================================
   THEME TOGGLE (dark / light)
   ================================================================ */
function initTheme() {
  const btn  = $('#themeToggle');
  const html = document.documentElement;
  const STORAGE_KEY = 'uas-theme';

  // Read persisted preference, fallback to dark
  const saved = localStorage.getItem(STORAGE_KEY) || 'dark';
  html.setAttribute('data-theme', saved);

  if (!btn) return;

  btn.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next    = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem(STORAGE_KEY, next);
  });
}

/* ================================================================
   NAVIGATION — scroll spy, sticky, mobile menu
   ================================================================ */
function initNav() {
  const nav       = $('#nav');
  const toggle    = $('#navToggle');
  const mobileMenu = $('#mobileMenu');
  const navLinks  = $$('.nav__link');
  const sections  = $$('section[id]');
  if (!nav) return;

  // Nav sticky state is handled by Lenis scroll event in initLenis()
  // (avoids double-firing with window.scroll)

  // Mobile menu
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      const isOpen = toggle.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', isOpen);
      if (isOpen) {
        mobileMenu.removeAttribute('hidden');
      } else {
        mobileMenu.setAttribute('hidden', '');
      }
    });

    // Close mobile menu on link click
    $$('.nav__mobile-link').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('hidden', '');
      });
    });
  }

  // Scroll spy — highlight active nav link
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(l => {
          l.classList.toggle('is-active', l.getAttribute('data-nav') === id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => observer.observe(s));

  // Footer year
  const yearEl = $('#footerYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

/* ================================================================
   SCROLL PROGRESS BAR — updated by Lenis, not window.scroll
   (window.scrollY lags behind Lenis virtual scroll position)
   ================================================================ */
function initScrollProgress() {
  // Bare-minimum fallback for when Lenis hasn't started yet
  const bar = $('#scrollProgress');
  if (!bar) return;
  // Real update happens inside initLenis via lenis.on('scroll')
  // This is just the initial state setter
  bar.style.width = '0%';
}

/* ================================================================
   LENIS — SMOOTH SCROLL
   ================================================================ */
function initLenis() {
  const lenis = new Lenis({
    duration: 1.1,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1.1,
    touchMultiplier: 2.0,
    infinite: false,
  });

  // ── Sync scroll progress bar directly from Lenis scroll event
  const bar = $('#scrollProgress');
  const nav = $('#nav');
  lenis.on('scroll', ({ scroll, limit }) => {
    // Progress bar (GPU scaleX — zero layout reflow)
    if (bar) bar.style.transform = `scaleX(${limit > 0 ? scroll / limit : 0})`;
    // Nav sticky state
    if (nav) nav.classList.toggle('is-scrolled', scroll > 20);
  });

  // ── Sync Lenis with GSAP ticker so ScrollTrigger stays in sync
  gsap.ticker.add(time => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // ── Anchor link scrolling through Lenis (smooth + offset)
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        lenis.scrollTo(target, { offset: -72, duration: 1.1, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
      }
    });
  });

  return lenis;
}

/* ================================================================
   THREE.JS — HERO PARTICLE CANVAS (optimized)
   Fixes: reduced particle count, no per-frame line rebuild,
          pixel ratio capped at 1, render only when in viewport
   ================================================================ */
function initHeroParticles() {
  const canvas = $('#heroCanvas');
  if (!canvas || !window.THREE) return;

  // Skip on low-end / mobile devices
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  if (isMobile) return;

  const scene    = new THREE.Scene();
  const camera   = new THREE.PerspectiveCamera(60, canvas.offsetWidth / canvas.offsetHeight, 0.1, 1000);
  // antialias OFF — big GPU win
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });

  renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
  // Cap at 1x — retina doubles work for no visible gain on particles
  renderer.setPixelRatio(1);
  camera.position.z = 300;

  /* ── Particles: 80 instead of 180 ── */
  const PARTICLE_COUNT = 80;
  const positions  = new Float32Array(PARTICLE_COUNT * 3);
  const velocities = [];
  const SPREAD     = 500;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * SPREAD;
    positions[i * 3 + 1] = (Math.random() - 0.5) * SPREAD;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
    velocities.push({
      x: (Math.random() - 0.5) * 0.25,
      y: (Math.random() - 0.5) * 0.25,
    });
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0x00F5A0,
    size: 2.5,
    transparent: true,
    opacity: 0.55,
    sizeAttenuation: true,
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  /* ── Lines: build ONCE, update positions in-place ── */
  const MAX_LINES    = PARTICLE_COUNT * 4;
  const lineArray    = new Float32Array(MAX_LINES * 6); // 2 pts × 3 coords
  const lineGeo      = new THREE.BufferGeometry();
  const linePosAttr  = new THREE.BufferAttribute(lineArray, 3);
  linePosAttr.setUsage(THREE.DynamicDrawUsage);
  lineGeo.setAttribute('position', linePosAttr);

  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x00F5A0,
    transparent: true,
    opacity: 0.07,
  });
  const lineSegments = new THREE.LineSegments(lineGeo, lineMaterial);
  scene.add(lineSegments);

  /* ── Mouse: throttled, only x/y needed ── */
  let mouseNDC = { x: 9999, y: 9999 };
  let mouseThrottle = 0;
  document.addEventListener('mousemove', e => {
    const now = Date.now();
    if (now - mouseThrottle < 50) return; // 20fps mouse update max
    mouseThrottle = now;
    const rect = canvas.getBoundingClientRect();
    mouseNDC.x = ((e.clientX - rect.left) / rect.width  - 0.5) * SPREAD;
    mouseNDC.y = -((e.clientY - rect.top)  / rect.height - 0.5) * SPREAD;
  }, { passive: true });

  /* ── Pause when hidden or scrolled away ── */
  let isPaused   = false;
  let isOffscreen = false;

  document.addEventListener('visibilitychange', () => {
    isPaused = document.hidden;
  });

  const heroObs = new IntersectionObserver(entries => {
    isOffscreen = !entries[0].isIntersecting;
  }, { threshold: 0 });
  heroObs.observe(canvas.parentElement);

  /* ── Frame throttle: target 40fps instead of 60fps ── */
  const TARGET_MS  = 1000 / 40;
  let lastFrame    = 0;
  let frameCount   = 0;
  const CONNECT_DIST = 80;

  function animate(now) {
    requestAnimationFrame(animate);
    if (isPaused || isOffscreen) return;
    if (now - lastFrame < TARGET_MS) return; // throttle
    lastFrame = now;

    const pos = geometry.attributes.position.array;

    // Move particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const ix = i * 3;
      pos[ix]     += velocities[i].x;
      pos[ix + 1] += velocities[i].y;
      if (pos[ix]     >  SPREAD / 2) pos[ix]     = -SPREAD / 2;
      if (pos[ix]     < -SPREAD / 2) pos[ix]     =  SPREAD / 2;
      if (pos[ix + 1] >  SPREAD / 2) pos[ix + 1] = -SPREAD / 2;
      if (pos[ix + 1] < -SPREAD / 2) pos[ix + 1] =  SPREAD / 2;
    }

    geometry.attributes.position.needsUpdate = true;

    // Update lines every 3 frames (not every frame)
    frameCount++;
    if (frameCount % 3 === 0) {
      let lineIdx = 0;
      for (let i = 0; i < PARTICLE_COUNT && lineIdx < MAX_LINES - 1; i++) {
        for (let j = i + 1; j < PARTICLE_COUNT && lineIdx < MAX_LINES - 1; j++) {
          const dx = pos[i*3] - pos[j*3];
          const dy = pos[i*3+1] - pos[j*3+1];
          if (dx*dx + dy*dy < CONNECT_DIST * CONNECT_DIST) {
            lineArray[lineIdx*6]   = pos[i*3];
            lineArray[lineIdx*6+1] = pos[i*3+1];
            lineArray[lineIdx*6+2] = pos[i*3+2];
            lineArray[lineIdx*6+3] = pos[j*3];
            lineArray[lineIdx*6+4] = pos[j*3+1];
            lineArray[lineIdx*6+5] = pos[j*3+2];
            lineIdx++;
          }
        }
      }
      lineGeo.setDrawRange(0, lineIdx * 2);
      linePosAttr.needsUpdate = true;
    }

    particles.rotation.y += 0.0003;
    renderer.render(scene, camera);
  }
  requestAnimationFrame(animate);

  /* ── Resize (debounced) ── */
  let resizeTimer;
  const resizeObserver = new ResizeObserver(() => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }, 200);
  });
  resizeObserver.observe(canvas.parentElement);
}

/* ================================================================
   GSAP — HERO ENTRANCE ANIMATION
   ================================================================ */
function initHeroAnimation() {
  gsap.registerPlugin(ScrollTrigger, TextPlugin);

  const tl = gsap.timeline({ paused: true });

  tl.fromTo('.hero__badge',    { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }, 0)
    .fromTo('.hero__name',     { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6,  ease: 'power3.out' }, 0.1)
    .fromTo('.hero__typewriter',{ opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }, 0.25)
    .fromTo('.hero__bio',      { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }, 0.35)
    .fromTo('.hero__ctas',     { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4,  ease: 'power2.out' }, 0.45)
    .fromTo('.hero__socials',  { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4,  ease: 'power2.out' }, 0.55)
    .fromTo('.hero__visual',   { opacity: 0, x: 30  }, { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out' }, 0.15)
    .fromTo('.hero__scroll-hint', { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.9);

  window._heroTimeline = tl;
  return tl;
}

/* ================================================================
   TEXT SCRAMBLE EFFECT — Hero Name
   ================================================================ */
function initTextScramble() {
  const el = $('.hero__name-scramble');
  if (!el) return;

  const CHARS = '!<>-_\\/[]{}—=+*^?#ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const originalText = el.dataset.text;
  let frame = 0;
  let frameReq;
  let started = false;

  function scramble() {
    let output = '';
    const totalFrames = originalText.length * 4;

    for (let i = 0; i < originalText.length; i++) {
      if (originalText[i] === ' ') { output += ' '; continue; }
      // Character resolves at its own pace
      const resolveFrame = Math.floor((i / originalText.length) * totalFrames);
      if (frame >= resolveFrame) {
        output += originalText[i];
      } else {
        output += CHARS[Math.floor(Math.random() * CHARS.length)];
      }
    }
    el.textContent = output;
    frame++;
    if (frame < originalText.length * 4 + 10) {
      frameReq = requestAnimationFrame(scramble);
    } else {
      el.textContent = originalText;
    }
  }

  // Trigger after hero timeline plays
  const origPlay = window._heroTimeline?.play.bind(window._heroTimeline);
  if (window._heroTimeline) {
    window._heroTimeline.play = function() {
      origPlay();
      setTimeout(() => {
        if (!started) { started = true; scramble(); }
      }, 400);
    };
  } else {
    // Fallback: run immediately
    setTimeout(scramble, 800);
  }
}

/* ================================================================
   TYPEWRITER — Hero Role Cycling
   ================================================================ */
function initTypewriter() {
  const el = $('#typewriterText');
  if (!el) return;

  const roles = [
    'Full Stack MERN Developer',
    'Power BI Data Analyst',
    'UI/UX Architect',
    'Building for the World 🌍',
  ];

  let roleIndex = 0;
  let charIndex  = 0;
  let isDeleting = false;
  let typeTimer;

  function type() {
    const current = roles[roleIndex];

    if (isDeleting) {
      el.textContent = current.substring(0, charIndex - 1);
      charIndex--;
    } else {
      el.textContent = current.substring(0, charIndex + 1);
      charIndex++;
    }

    let delay = isDeleting ? 50 : 80;

    if (!isDeleting && charIndex === current.length) {
      // Pause at full word
      delay = 2000;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      delay = 400;
    }

    typeTimer = setTimeout(type, delay);
  }

  // Start after loader
  setTimeout(type, 2000);
}

/* ================================================================
   MAGNETIC BUTTONS (throttled)
   ================================================================ */
function initMagneticButtons() {
  if (window.matchMedia('(hover: none)').matches) return;

  const magnetics = $$('.magnetic');

  magnetics.forEach(btn => {
    const RANGE    = 55;
    const STRENGTH = 0.35;
    let ticking    = false;

    btn.addEventListener('mousemove', e => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const rect    = btn.getBoundingClientRect();
        const centerX = rect.left + rect.width  / 2;
        const centerY = rect.top  + rect.height / 2;
        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < RANGE) {
          gsap.to(btn, { x: dx * STRENGTH, y: dy * STRENGTH, duration: 0.25, ease: 'power1.out', overwrite: true });
        }
        ticking = false;
      });
    });

    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.4, ease: 'elastic.out(1, 0.5)', overwrite: true });
    });
  });
}

/* ================================================================
   GSAP SCROLL ANIMATIONS — Section Reveals (lightweight)
   ================================================================ */
function initScrollAnimations() {
  // Helper — batch reveal with single ScrollTrigger per group
  function revealGroup(selector, vars = {}) {
    const els = $$(selector);
    if (!els.length) return;
    gsap.fromTo(els,
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0,
        duration: 0.55,
        stagger: 0.07,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: els[0].closest('section') || els[0],
          start: 'top 82%',
          toggleActions: 'play none none none', // no reverse = less work
        },
        ...vars,
      }
    );
  }

  // Section headers
  $$('.section__header').forEach(header => {
    gsap.fromTo(header.children,
      { opacity: 0, y: 25 },
      {
        opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out',
        scrollTrigger: { trigger: header, start: 'top 85%', toggleActions: 'play none none none' },
      }
    );
  });

  // About columns
  gsap.fromTo('.about__left',
    { opacity: 0, x: -40 },
    { opacity: 1, x: 0, duration: 0.7, ease: 'power2.out',
      scrollTrigger: { trigger: '.about__grid', start: 'top 75%', toggleActions: 'play none none none' } }
  );
  gsap.fromTo('.about__right',
    { opacity: 0, x: 40 },
    { opacity: 1, x: 0, duration: 0.7, ease: 'power2.out',
      scrollTrigger: { trigger: '.about__grid', start: 'top 75%', toggleActions: 'play none none none' } }
  );

  // Cards — one trigger per group, not per element
  revealGroup('.skill-card',       { stagger: 0.04 });
  revealGroup('.service-card',     { stagger: 0.06 });
  revealGroup('.project-card',     { stagger: 0.08 });
  revealGroup('.about__stat',      { stagger: 0.08 });
  revealGroup('.contact__card',    { stagger: 0.07 });

  // Featured projects
  $$('.project-featured').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 82%', toggleActions: 'play none none none' } }
    );
  });

  // Timeline — simplified, no per-dot animation
  $$('.timeline__item').forEach(item => {
    const isRight = item.classList.contains('timeline__item--right');
    const card    = item.querySelector('.timeline__card');
    if (!card) return;
    gsap.fromTo(card,
      { opacity: 0, x: isRight ? 40 : -40 },
      { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out',
        scrollTrigger: { trigger: item, start: 'top 82%', toggleActions: 'play none none none' } }
    );
  });

  // Contact grid
  gsap.fromTo('.contact__info',
    { opacity: 0, x: -30 },
    { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out',
      scrollTrigger: { trigger: '.contact__grid', start: 'top 78%', toggleActions: 'play none none none' } }
  );
  gsap.fromTo('.contact__form-wrap',
    { opacity: 0, x: 30 },
    { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out',
      scrollTrigger: { trigger: '.contact__grid', start: 'top 78%', toggleActions: 'play none none none' } }
  );
}

/* ================================================================
   STAT COUNTERS — count up on scroll enter
   ================================================================ */
function initStatCounters() {
  $$('.about__stat-number').forEach(el => {
    const target = parseInt(el.dataset.count, 10);
    let triggered = false;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !triggered) {
          triggered = true;
          // Use a proxy object — correct GSAP pattern
          const proxy = { val: 0 };
          gsap.to(proxy, {
            val: target,
            duration: 1.6,
            ease: 'power2.out',
            onUpdate: () => { el.textContent = Math.round(proxy.val); },
          });
        }
      });
    }, { threshold: 0.4 });

    observer.observe(el);
  });
}

/* ================================================================
   SKILL BARS — fill on scroll enter
   ================================================================ */
function initSkillBars() {
  $$('.skill-card__fill').forEach(fill => {
    const width = fill.dataset.width;
    let triggered = false;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !triggered) {
          triggered = true;
          // Small delay for visual delight
          setTimeout(() => {
            fill.style.width = width + '%';
          }, 200);
        }
      });
    }, { threshold: 0.5 });

    observer.observe(fill.parentElement);
  });
}

/* ================================================================
   SKILL TABS — filter
   ================================================================ */
function initSkillTabs() {
  const tabs  = $$('.skills__tab');
  const cards = $$('.skill-card');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const filter = tab.dataset.filter;

      // Update tab active state
      tabs.forEach(t => {
        t.classList.remove('skills__tab--active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('skills__tab--active');
      tab.setAttribute('aria-selected', 'true');

      // Filter cards
      cards.forEach((card, i) => {
        const category = card.dataset.category;
        const show = filter === 'all' || category === filter;

        if (show) {
          card.classList.remove('is-hidden');
          gsap.fromTo(card,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.4, delay: i * 0.03, ease: 'power3.out' }
          );
        } else {
          card.classList.add('is-hidden');
        }
      });
    });
  });
}

/* ================================================================
   VANILLA TILT — 3D card tilt
   ================================================================ */
function initTiltCards() {
  if (!window.VanillaTilt) return;
  if (window.matchMedia('(hover: none)').matches) return;

  VanillaTilt.init($$('.tilt-card'), {
    max: 10,
    speed: 400,
    glare: true,
    'max-glare': 0.12,
    perspective: 800,
    gyroscope: false,
  });
}

/* ================================================================
   CURSOR SPOTLIGHT / GLOW on hero section
   ================================================================ */
function initCursorGlow() {
  const hero = $('.hero');
  if (!hero) return;

  hero.addEventListener('mousemove', e => {
    const rect = hero.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    hero.style.setProperty('--mouse-x', x + 'px');
    hero.style.setProperty('--mouse-y', y + 'px');
  });
}

/* ================================================================
   PROJECT MODAL
   ================================================================ */
const MODAL_DATA = {
  erp: {
    title: 'Watan Tobacco ERP',
    label: 'Full Stack ERP System',
    description: `
      <p>A production-grade Enterprise Resource Planning system built from scratch for Watan Tobacco, a tobacco
      distribution company in Swabi, Pakistan. Before this system, every operation — inventory, sales, supplier
      management, and finance — was tracked manually on paper.</p>
      <p>This ERP replaced their entire manual workflow with a real-time, multi-user digital system accessible
      from any browser.</p>
    `,
    problem: 'The company had zero digital infrastructure. Stock reconciliation took days, sales data was unreliable, and financial reporting was a guess. Manual errors were costing money.',
    solution: 'A custom MERN-stack ERP with 5 user roles, real-time inventory tracking, automated sales recording, supplier relationship management, and integrated Power BI dashboards for instant business intelligence.',
    impact: [
      '40% faster reporting — from days to hours',
      '100% digital workflow, eliminating paper records',
      '5 user roles: Admin, Manager, Sales, Warehouse, Finance',
      'Real-time stock levels, preventing oversell',
      'Power BI integration for monthly & annual analytics',
    ],
    stack: ['React', 'Node.js', 'Express.js', 'MongoDB', 'JWT Auth', 'Power BI', 'Tailwind CSS', 'REST API'],
  }
};

function initModals() {
  const modal    = $('#projectModal');
  const content  = $('#modalContent');
  const backdrop = $('#modalBackdrop');
  const closeBtn = $('#modalClose');
  if (!modal) return;

  function openModal(id) {
    const data = MODAL_DATA[id];
    if (!data) return;

    content.innerHTML = `
      <p class="project-featured__label">${data.label}</p>
      <h2 id="modalTitle" style="font-family:var(--font-display);font-size:1.75rem;font-weight:700;letter-spacing:-1px;margin-bottom:1.5rem;">${data.title}</h2>
      <div style="color:var(--text-2);line-height:1.8;margin-bottom:1.5rem;">${data.description}</div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin-bottom:1.5rem;">
        <div style="background:var(--surface-3);border-radius:12px;padding:1.25rem;">
          <p style="font-family:var(--font-mono);font-size:11px;color:var(--neon-pink);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:.75rem;">The Problem</p>
          <p style="font-size:.9375rem;color:var(--text-2);line-height:1.7;">${data.problem}</p>
        </div>
        <div style="background:var(--surface-3);border-radius:12px;padding:1.25rem;">
          <p style="font-family:var(--font-mono);font-size:11px;color:var(--neon-green);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:.75rem;">The Solution</p>
          <p style="font-size:.9375rem;color:var(--text-2);line-height:1.7;">${data.solution}</p>
        </div>
      </div>

      <div style="margin-bottom:1.5rem;">
        <p style="font-family:var(--font-mono);font-size:11px;color:var(--neon-cyan);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:.75rem;">Impact</p>
        <ul style="display:flex;flex-direction:column;gap:.5rem;">
          ${data.impact.map(i => `<li style="display:flex;gap:.75rem;align-items:flex-start;font-size:.9375rem;color:var(--text-2);">
            <span style="color:var(--neon-green);margin-top:2px;flex-shrink:0;">✓</span>${i}
          </li>`).join('')}
        </ul>
      </div>

      <div class="project__tags">${data.stack.map(t => `<span class="tag">${t}</span>`).join('')}</div>
    `;

    modal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';

    gsap.fromTo('.modal__container',
      { opacity: 0, y: 30, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'power3.out' }
    );
  }

  function closeModal() {
    gsap.to('.modal__container', {
      opacity: 0, y: 20, scale: 0.96, duration: 0.25, ease: 'power2.in',
      onComplete: () => {
        modal.setAttribute('hidden', '');
        document.body.style.overflow = '';
      }
    });
  }

  // Open triggers
  $$('[data-modal]').forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.dataset.modal));
  });

  // Close triggers
  closeBtn?.addEventListener('click', closeModal);
  backdrop?.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !modal.hasAttribute('hidden')) closeModal();
  });
}

/* ================================================================
   CONTACT FORM — EmailJS
   ================================================================ */
function initContactForm() {
  const form      = $('#contactForm');
  const submitBtn = $('#submitBtn');
  const success   = $('#formSuccess');
  if (!form) return;

  // Initialize EmailJS — replace with your public key
  if (window.emailjs) {
    emailjs.init('YOUR_EMAILJS_PUBLIC_KEY');
  }

  // Real-time validation
  const validators = {
    contactName:    v => v.trim().length >= 2  ? '' : 'Please enter your name (min 2 chars)',
    contactEmail:   v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Please enter a valid email address',
    contactMessage: v => v.trim().length >= 10 ? '' : 'Message must be at least 10 characters',
  };

  Object.keys(validators).forEach(id => {
    const input  = $(`#${id}`);
    const errorEl = $(`#${id.replace('contact', '').toLowerCase()}Error`) ||
                    $(`.form__error`, input?.parentElement);
    if (!input) return;

    input.addEventListener('blur', () => {
      const msg = validators[id](input.value);
      if (errorEl) errorEl.textContent = msg;
      input.classList.toggle('is-invalid', !!msg);
    });

    input.addEventListener('input', () => {
      if (input.classList.contains('is-invalid')) {
        const msg = validators[id](input.value);
        if (errorEl) errorEl.textContent = msg;
        input.classList.toggle('is-invalid', !!msg);
      }
    });
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();

    // Validate all
    let valid = true;
    Object.keys(validators).forEach(id => {
      const input   = $(`#${id}`);
      const errorEl = $(`#${id.replace('contact', '').toLowerCase()}Error`) ||
                      $(`.form__error`, input?.parentElement);
      if (!input) return;
      const msg = validators[id](input.value);
      if (errorEl) errorEl.textContent = msg;
      input.classList.toggle('is-invalid', !!msg);
      if (msg) valid = false;
    });

    if (!valid) return;

    submitBtn.classList.add('is-loading');
    submitBtn.disabled = true;

    try {
      if (window.emailjs) {
        await emailjs.sendForm('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', form);
      } else {
        // Fallback — simulate send
        await new Promise(r => setTimeout(r, 1200));
      }

      form.reset();
      success.removeAttribute('hidden');
      gsap.fromTo(success, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4 });
      setTimeout(() => {
        gsap.to(success, { opacity: 0, duration: 0.3, onComplete: () => success.setAttribute('hidden', '') });
      }, 5000);

    } catch (err) {
      console.error('EmailJS error:', err);
      alert('There was an error sending your message. Please try emailing directly at umairalishah.dev@gmail.com');
    } finally {
      submitBtn.classList.remove('is-loading');
      submitBtn.disabled = false;
    }
  });
}

/* ================================================================
   KONAMI CODE — EASTER EGG
   ================================================================ */
function initKonamiCode() {
  const KONAMI = [
    'ArrowUp','ArrowUp','ArrowDown','ArrowDown',
    'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight',
    'b','a'
  ];
  let idx = 0;
  let hideTimer;

  document.addEventListener('keydown', e => {
    if (e.key === KONAMI[idx]) {
      idx++;
      if (idx === KONAMI.length) {
        idx = 0;
        showEasterEgg();
      }
    } else {
      idx = 0;
    }
  });

  function showEasterEgg() {
    const egg = $('#easterEgg');
    if (!egg) return;
    egg.removeAttribute('hidden');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      gsap.to(egg, {
        opacity: 0, y: 20, duration: 0.4,
        onComplete: () => {
          egg.setAttribute('hidden', '');
          egg.style.opacity = '';
        }
      });
    }, 4000);
  }
}

/* ================================================================
   TERMINAL TYPING ANIMATION — About section
   ================================================================ */
function initTerminalAnimation() {
  const body = $('#terminalBody');
  if (!body) return;

  const lines = $$('.terminal__cmd');
  const outputs = $$('.terminal__output');

  // Initially hide all outputs
  outputs.forEach(o => { o.style.opacity = '0'; });
  lines.forEach(l => { l.textContent = ''; });

  const sequence = [
    { cmd: lines[0], output: outputs[0], text: 'whoami' },
    { cmd: lines[1], output: outputs[1], text: 'cat about.txt' },
    { cmd: lines[2], output: outputs[2], text: 'cat goals.txt' },
    { cmd: lines[3], output: outputs[3], text: 'cat stack.txt' },
  ];

  let triggered = false;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !triggered) {
        triggered = true;
        runTerminalSequence(sequence);
      }
    });
  }, { threshold: 0.4 });

  observer.observe(body);
}

function typeText(el, text, speed = 60) {
  return new Promise(resolve => {
    let i = 0;
    const interval = setInterval(() => {
      el.textContent += text[i];
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        resolve();
      }
    }, speed);
  });
}

async function runTerminalSequence(sequence) {
  for (let i = 0; i < sequence.length; i++) {
    const { cmd, output, text } = sequence[i];
    await new Promise(r => setTimeout(r, 300));
    await typeText(cmd, text, 55);
    await new Promise(r => setTimeout(r, 200));
    gsap.fromTo(output,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
    );
    await new Promise(r => setTimeout(r, 500));
  }
}

/* ================================================================
   SECTION TAG REVEAL (simplified — CSS only)
   ================================================================ */
function initClipPathReveal() {
  // Handled by initScrollAnimations section headers — no extra triggers needed
}

/* ================================================================
   FOOTER ANIMATION (lightweight)
   ================================================================ */
function initFooter() {
  gsap.fromTo('.footer__inner > *',
    { opacity: 0, y: 15 },
    {
      opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out',
      scrollTrigger: { trigger: '.footer', start: 'top 95%', toggleActions: 'play none none none' }
    }
  );
}

/* ================================================================
   PERFORMANCE — pause Three.js when not in viewport
   ================================================================ */
function initVisibilityOptimization() {
  // Three.js already handles document.hidden, but also pause
  // ScrollTrigger when user is not on the page
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      ScrollTrigger.getAll().forEach(st => st.disable());
    } else {
      ScrollTrigger.getAll().forEach(st => st.enable());
    }
  });
}

/* ================================================================
   CURSOR GLOW BACKGROUND (dynamic radial gradient behind cursor)
   ================================================================ */
function initMouseGlow() {
  const body = document.body;

  document.addEventListener('mousemove', e => {
    body.style.setProperty('--mouse-x', e.clientX + 'px');
    body.style.setProperty('--mouse-y', e.clientY + 'px');
  });
}

/* ================================================================
   HERO BACKGROUND GRADIENT — subtle color shift on mouse move
   ================================================================ */
function initHeroMouseBackground() {
  const hero = $('.hero');
  const glow = $('.hero__glow');
  if (!hero || !glow) return;

  hero.addEventListener('mousemove', e => {
    const rect = hero.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width;
    const yPct = (e.clientY - rect.top)  / rect.height;

    glow.style.background = `
      radial-gradient(
        ellipse 80% 60% at ${xPct * 100}% ${yPct * 100}%,
        rgba(0, 245, 160, 0.05) 0%,
        transparent 60%
      )
    `;
  });

  hero.addEventListener('mouseleave', () => {
    glow.style.background = '';
  });
}

/* ================================================================
   NAV LINK HOVER — underline slide
   (already handled in CSS, but keep for future JS enhancements)
   ================================================================ */

/* ================================================================
   FLOATING PILLS PAUSE ON HOVER
   ================================================================ */
function initFloatingPills() {
  $$('.hero__pill').forEach(pill => {
    pill.addEventListener('mouseenter', () => {
      pill.style.animationPlayState = 'paused';
    });
    pill.addEventListener('mouseleave', () => {
      pill.style.animationPlayState = 'running';
    });
  });
}

/* ================================================================
   SMOOTH SCROLL TO TOP on logo click
   ================================================================ */
function initScrollToTop() {
  $$('.footer__logo, .nav__logo').forEach(logo => {
    logo.addEventListener('click', e => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

/* ================================================================
   MAIN INIT — called once libs are ready
   ================================================================ */
function initAll() {
  // Register GSAP plugins
  gsap.registerPlugin(ScrollTrigger, TextPlugin);

  // Core
  initLenis();
  initHeroAnimation();
  initTextScramble();
  initTypewriter();

  // Three.js WebGL
  initHeroParticles();

  // Interactions
  initMagneticButtons();
  initCursorGlow();
  initHeroMouseBackground();
  initMouseGlow();
  initFloatingPills();

  // GSAP Scroll Animations
  initScrollAnimations();
  initClipPathReveal();
  initFooter();

  // Components
  initStatCounters();
  initSkillBars();
  initSkillTabs();
  initTiltCards();
  initTerminalAnimation();
  initModals();
  initContactForm();
  initKonamiCode();
  initScrollToTop();
  initVisibilityOptimization();

  // Refresh ScrollTrigger after all animations set up
  ScrollTrigger.refresh();

  console.log('%c ⚡ Umair Ali Shah — Portfolio Loaded', 'color: #00F5A0; font-size: 14px; font-weight: 600;');
  console.log('%c Built with GSAP + Three.js + Lenis', 'color: #00D9FF; font-size: 12px;');
}
