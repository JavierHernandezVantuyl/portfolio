// ── Footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ── Contact form mailto
function submitContact(e) {
  e.preventDefault();
  const f = new FormData(e.target);
  const name = encodeURIComponent(f.get('name'));
  const email = encodeURIComponent(f.get('email'));
  const msg = encodeURIComponent(f.get('message'));
  window.location.href = `mailto:javierhernandezvantuyl@gmail.com?subject=Website%20inquiry%20from%20${name}&body=${msg}%0A%0Afrom:%20${email}`;
}
window.submitContact = submitContact;

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Lenis smooth scroll
let lenis = null;
if (!reducedMotion && window.Lenis) {
  lenis = new window.Lenis({
    duration: 1.1,
    smoothWheel: true,
    easing: t => 1 - Math.pow(1 - t, 3),
  });
  function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
  window.lenis = lenis;

  // Anchor links route through Lenis
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    const href = a.getAttribute('href');
    if (!href || href === '#') return;
    a.addEventListener('click', e => {
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -70 });
    });
  });
}

// Single scroll subscription — drives nav, progress, parallax
const navEl = document.querySelector('header.nav');
const progressEl = document.querySelector('.nav-progress');
const root = document.documentElement;

function syncScroll(scroll) {
  root.style.setProperty('--scroll', scroll);
  if (navEl) navEl.classList.toggle('scrolled', scroll > 24);
  if (progressEl) {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    progressEl.style.transform = `scaleX(${Math.min(1, scroll / max)})`;
  }
}

if (lenis) {
  lenis.on('scroll', ({ scroll }) => syncScroll(scroll));
  syncScroll(window.scrollY || 0);
} else {
  // Fallback for reduced motion / no Lenis
  const onScroll = () => syncScroll(window.scrollY || window.pageYOffset || 0);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

// ── Refined staggered reveals
(() => {
  if (reducedMotion || !window.IntersectionObserver) return;
  const groups = [
    document.querySelectorAll('.hero-status, .hero .title, .hero .lead, .hero .btns'),
    document.querySelectorAll('.split > .card'),
    document.querySelectorAll('.info-stack > *'),
    document.querySelectorAll('.exp-card'),
    document.querySelectorAll('.timeline-item'),
    document.querySelectorAll('.project-card'),
    document.querySelectorAll('.skill-grid > div'),
    document.querySelectorAll('.contact .card'),
  ];
  const all = new Set();
  groups.forEach(g => {
    g.forEach((el, i) => {
      el.classList.add('reveal');
      el.style.setProperty('--i', String(i));
      all.add(el);
    });
  });
  if (!all.size) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(({ isIntersecting, target }) => {
      if (isIntersecting) { target.classList.add('in'); io.unobserve(target); }
    });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });
  all.forEach(el => io.observe(el));
})();

// ── Mouse-follow cursor glow
(() => {
  if (reducedMotion) return;
  const isCoarse = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  if (isCoarse) return;
  const glow = document.querySelector('.cursor-glow');
  if (!glow) return;

  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let curX = targetX;
  let curY = targetY;
  let rafId = null;

  function tick() {
    curX += (targetX - curX) * 0.18;
    curY += (targetY - curY) * 0.18;
    glow.style.transform = `translate3d(${curX}px, ${curY}px, 0) translate(-50%, -50%)`;
    rafId = requestAnimationFrame(tick);
  }

  let started = false;
  window.addEventListener('mousemove', e => {
    targetX = e.clientX;
    targetY = e.clientY;
    if (!started) {
      started = true;
      document.body.classList.add('has-cursor');
      tick();
    }
  });

  // Hot state over interactives
  const hot = sel => {
    document.querySelectorAll(sel).forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hot'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hot'));
    });
  };
  hot('.btn, .project-card, .card, .exp-card, a.pill, .nav a, .rail-btn');
})();

// ── Project drawer
(() => {
  const drawer = document.getElementById('drawer');
  if (!drawer) return;
  const panel = drawer.querySelector('.drawer-panel');
  const titleEl = drawer.querySelector('.drawer-title');
  const eyebrowEl = drawer.querySelector('.drawer-eyebrow');
  const summaryEl = drawer.querySelector('.drawer-summary');
  const tagsEl = drawer.querySelector('.drawer-tags');
  const bulletsEl = drawer.querySelector('.drawer-bullets');
  const linkEl = drawer.querySelector('.drawer-link');
  let lastFocused = null;

  function open(card) {
    const slug = card.dataset.project;
    const tpl = document.getElementById(`tpl-${slug}`);
    if (!tpl) return;
    const data = tpl.content;

    titleEl.textContent = data.querySelector('[data-title]')?.textContent || '';
    eyebrowEl.textContent = data.querySelector('[data-eyebrow]')?.textContent || '';
    summaryEl.textContent = data.querySelector('[data-summary]')?.textContent || '';

    tagsEl.innerHTML = '';
    data.querySelectorAll('[data-tag]').forEach(t => {
      const span = document.createElement('span');
      span.className = 'tech-tag';
      span.textContent = t.textContent;
      tagsEl.appendChild(span);
    });

    bulletsEl.innerHTML = '';
    data.querySelectorAll('[data-bullet]').forEach(b => {
      const li = document.createElement('li');
      li.innerHTML = b.innerHTML;
      bulletsEl.appendChild(li);
    });

    const ghEl = data.querySelector('[data-github]');
    if (ghEl) {
      linkEl.href = ghEl.textContent;
      linkEl.textContent = 'View on GitHub →';
      linkEl.hidden = false;
    } else {
      linkEl.hidden = true;
    }

    lastFocused = card;
    drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('drawer-open');
    if (window.lenis) window.lenis.stop();
    requestAnimationFrame(() => panel.focus());
  }

  function close() {
    drawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('drawer-open');
    if (window.lenis) window.lenis.start();
    if (lastFocused) lastFocused.focus();
  }

  // Click cards
  document.querySelectorAll('.project-card[data-project]').forEach(card => {
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.addEventListener('click', e => {
      if (e.target.closest('.project-link')) return; // GitHub link goes through
      open(card);
    });
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        if (e.target.closest('.project-link')) return;
        e.preventDefault();
        open(card);
      }
    });
  });

  // Close listeners
  drawer.querySelectorAll('[data-drawer-close]').forEach(el => {
    el.addEventListener('click', close);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && drawer.getAttribute('aria-hidden') === 'false') close();
    if (e.key === 'Tab' && drawer.getAttribute('aria-hidden') === 'false') {
      // tiny focus trap
      const focusables = drawer.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])');
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
})();

// ── Project rail controls
(() => {
  const rail = document.querySelector('.project-rail');
  if (!rail) return;
  const prev = document.querySelector('.rail-btn[data-dir="-1"]');
  const next = document.querySelector('.rail-btn[data-dir="1"]');
  const progress = document.querySelector('.rail-progress span');

  function step(dir) {
    const card = rail.querySelector('.project-card');
    if (!card) return;
    const w = card.getBoundingClientRect().width + 16;
    rail.scrollBy({ left: dir * w, behavior: 'smooth' });
  }

  function sync() {
    const max = rail.scrollWidth - rail.clientWidth;
    const pct = max <= 0 ? 1 : Math.min(1, Math.max(0, rail.scrollLeft / max));
    if (progress) progress.style.transform = `scaleX(${pct})`;
    if (prev) prev.disabled = rail.scrollLeft <= 2;
    if (next) next.disabled = rail.scrollLeft >= max - 2;
  }

  prev?.addEventListener('click', () => step(-1));
  next?.addEventListener('click', () => step(1));
  rail.addEventListener('scroll', sync, { passive: true });
  window.addEventListener('resize', sync);
  sync();
})();
