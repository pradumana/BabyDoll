/* ============================================================
   BABYDOLL $BDOLL — main.js
   ============================================================ */

'use strict';

/* ─────────────────────────────────────────────────────────────
   CONFIG  — edit these values before going live
   ───────────────────────────────────────────────────────────── */
const CONFIG = {
  // Pre-sale window end (ISO string). Default: 30 days from page load.
  presaleEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),

  // Simulated supply ticker — starts here and slowly counts down
  // to make scarcity feel real while the real contract isn't live yet.
  simulatedSupply: 1_000_000_000,

  // How many tokens to "burn" per tick (visual only, NOT on-chain)
  burnPerTick: Math.floor(Math.random() * 800 + 200), // 200–1000 per tick
  burnInterval: 4200, // ms between ticks
};

/* ─────────────────────────────────────────────────────────────
   1. NAV — scroll shadow + active link highlight
   ───────────────────────────────────────────────────────────── */
(function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  // Shadow on scroll
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 24);
  }, { passive: true });

  // Active link on scroll using IntersectionObserver
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-links a[href^="#"]');

  const setActive = (id) => {
    links.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + id);
    });
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) setActive(entry.target.id);
    });
  }, { threshold: 0.35 });

  sections.forEach(s => observer.observe(s));
})();

/* ─────────────────────────────────────────────────────────────
   2. SCROLL REVEAL — adds .visible to .reveal elements
   ───────────────────────────────────────────────────────────── */
(function initReveal() {
  // Mark all target elements
  const targets = document.querySelectorAll(
    '.why-card, .burn-step, .burn-callout, .toki-table, .toki-visual, ' +
    '.no-bs-item, .presale-card, .timeline-card, .countdown-card, ' +
    '.ct-row, .road-item, .faq-item, .compare-table'
  );

  targets.forEach((el, i) => {
    el.classList.add('reveal');
    // Stagger cards in the same grid slightly
    el.style.transitionDelay = `${(i % 4) * 0.07}s`;
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });

  targets.forEach(el => observer.observe(el));
})();

/* ─────────────────────────────────────────────────────────────
   3. COUNTDOWN TIMER
   ───────────────────────────────────────────────────────────── */
(function initCountdown() {
  const els = {
    days:  document.getElementById('cd-days'),
    hours: document.getElementById('cd-hours'),
    mins:  document.getElementById('cd-mins'),
    secs:  document.getElementById('cd-secs'),
  };

  // All elements must exist
  if (!els.days) return;

  const pad = n => String(Math.max(0, n)).padStart(2, '0');

  let prevSecs = null;

  function tick() {
    const diff = CONFIG.presaleEnd - Date.now();

    if (diff <= 0) {
      Object.values(els).forEach(el => { el.textContent = '00'; });
      return;
    }

    const days  = Math.floor(diff / 864e5);
    const hours = Math.floor((diff % 864e5) / 36e5);
    const mins  = Math.floor((diff % 36e5)  / 6e4);
    const secs  = Math.floor((diff % 6e4)   / 1e3);

    els.days.textContent  = pad(days);
    els.hours.textContent = pad(hours);
    els.mins.textContent  = pad(mins);
    els.secs.textContent  = pad(secs);

    // Pulse the seconds box on each change
    if (secs !== prevSecs) {
      const box = els.secs.closest('.cd-unit');
      if (box) {
        box.style.transform = 'scale(1.1)';
        setTimeout(() => { box.style.transform = ''; }, 200);
      }
      prevSecs = secs;
    }
  }

  // Add CSS transition to cd-unit for the pulse
  document.querySelectorAll('.cd-unit').forEach(u => {
    u.style.transition = 'transform .15s ease';
  });

  tick();
  setInterval(tick, 1000);
})();

/* ─────────────────────────────────────────────────────────────
   4. SIMULATED BURN SUPPLY TICKER
      Animates the "Current Total Supply" number slowly
      counting down to make scarcity feel tangible.
      Purely visual — replace with a real contract call
      (ethers.js totalSupply()) after mainnet deployment.
   ───────────────────────────────────────────────────────────── */
(function initBurnTicker() {
  const el = document.getElementById('total-supply');
  if (!el) return;

  let current = CONFIG.simulatedSupply;

  // Format number with commas
  const fmt = n => Math.round(n).toLocaleString('en-US');

  el.textContent = fmt(current);

  // Flash red briefly to signal a "burn" happened
  function flashBurn() {
    el.style.transition  = 'color .15s, text-shadow .15s';
    el.style.color       = '#ff2d9b';
    el.style.textShadow  = '0 0 18px rgba(255,45,155,.8)';
    setTimeout(() => {
      el.style.color      = '';
      el.style.textShadow = '';
    }, 600);
  }

  // Animate the number rolling down
  function burnTick() {
    const drop   = CONFIG.burnPerTick + Math.floor(Math.random() * 400);
    const target = Math.max(0, current - drop);

    // Animate over ~800ms
    const steps    = 20;
    const stepSize = (current - target) / steps;
    let   step     = 0;

    const roll = setInterval(() => {
      step++;
      current -= stepSize;
      el.textContent = fmt(current);
      if (step >= steps) {
        current = target;
        el.textContent = fmt(current);
        clearInterval(roll);
      }
    }, 40);

    flashBurn();

    // Randomise next tick slightly so it doesn't feel mechanical
    CONFIG.burnPerTick = Math.floor(Math.random() * 800 + 200);
    setTimeout(burnTick, CONFIG.burnInterval + Math.random() * 3000);
  }

  // Start after a short delay
  setTimeout(burnTick, 2800);
})();

/* ─────────────────────────────────────────────────────────────
   5. BURN SECTION — particle burst on scroll into view
   ───────────────────────────────────────────────────────────── */
(function initBurnParticles() {
  const burnSection = document.getElementById('burn');
  if (!burnSection) return;

  let fired = false;

  const particles = ['🔥','💀','✨','🌸','💎'];

  function spawnParticle() {
    const el = document.createElement('span');
    el.textContent = particles[Math.floor(Math.random() * particles.length)];
    el.style.cssText = `
      position: fixed;
      left: ${Math.random() * 100}vw;
      top: 110vh;
      font-size: ${Math.random() * 1.5 + 0.8}rem;
      opacity: 0.7;
      pointer-events: none;
      z-index: 9999;
      animation: particleRise ${Math.random() * 1.5 + 1.5}s ease-out forwards;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  }

  // Inject the keyframe once
  if (!document.getElementById('particle-style')) {
    const style = document.createElement('style');
    style.id = 'particle-style';
    style.textContent = `
      @keyframes particleRise {
        0%   { transform: translateY(0) scale(1) rotate(0deg);   opacity: .8; }
        100% { transform: translateY(-90vh) scale(.4) rotate(${Math.random() > .5 ? '' : '-'}180deg); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !fired) {
      fired = true;
      for (let i = 0; i < 14; i++) {
        setTimeout(spawnParticle, i * 120);
      }
    }
  }, { threshold: 0.3 });

  observer.observe(burnSection);
})();

/* ─────────────────────────────────────────────────────────────
   6. MASCOT — doll eyes follow cursor (desktop only)
   ───────────────────────────────────────────────────────────── */
(function initEyeTracking() {
  if (window.matchMedia('(pointer: coarse)').matches) return; // skip touch devices

  const eyes = document.querySelectorAll('.eye');
  if (!eyes.length) return;

  document.addEventListener('mousemove', e => {
    eyes.forEach(eye => {
      const rect   = eye.getBoundingClientRect();
      const eyeCX  = rect.left + rect.width  / 2;
      const eyeCY  = rect.top  + rect.height / 2;
      const angle  = Math.atan2(e.clientY - eyeCY, e.clientX - eyeCX);
      const dist   = Math.min(3, Math.hypot(e.clientX - eyeCX, e.clientY - eyeCY) * .04);
      const x = Math.cos(angle) * dist;
      const y = Math.sin(angle) * dist;
      // Move the ::after highlight — use a CSS variable instead
      eye.style.setProperty('--ex', `${x}px`);
      eye.style.setProperty('--ey', `${y}px`);
    });
  }, { passive: true });
})();

/* ─────────────────────────────────────────────────────────────
   7. HAMBURGER MENU
   ───────────────────────────────────────────────────────────── */
(function initHamburger() {
  const btn  = document.getElementById('hamburger');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;

  function toggle(open) {
    btn.classList.toggle('open', open);
    menu.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
  }

  btn.addEventListener('click', () => toggle(!btn.classList.contains('open')));

  // Close on any menu link click
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => toggle(false));
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (btn.classList.contains('open') && !btn.contains(e.target) && !menu.contains(e.target)) {
      toggle(false);
    }
  });

  // Close on resize back to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 860) toggle(false);
  }, { passive: true });
})();

/* ─────────────────────────────────────────────────────────────
   8. SMOOTH ANCHOR SCROLL — offset for fixed nav height
   ───────────────────────────────────────────────────────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const offset = 76; // nav height + breathing room
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ─────────────────────────────────────────────────────────────
   9. COPY CONTRACT ADDRESS (post-launch — wires up any
      element with data-copy="contract" once you add one)
   ───────────────────────────────────────────────────────────── */
(function initCopyAddress() {
  document.querySelectorAll('[data-copy="contract"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const addr = btn.dataset.address || '';
      if (!addr) return;
      navigator.clipboard.writeText(addr).then(() => {
        const orig = btn.textContent;
        btn.textContent = '✅ Copied!';
        setTimeout(() => { btn.textContent = orig; }, 2000);
      });
    });
  });
})();
