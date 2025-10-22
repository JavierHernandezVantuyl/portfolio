// Footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Contact form mailto
function submitContact(e){
  e.preventDefault();
  const f = new FormData(e.target);
  const name = encodeURIComponent(f.get('name'));
  const email = encodeURIComponent(f.get('email'));
  const msg = encodeURIComponent(f.get('message'));
  window.location.href = `mailto:javierhernandezvantuyl@gmail.com?subject=Website%20inquiry%20from%20${name}&body=${msg}%0A%0Afrom:%20${email}`;
}
window.submitContact = submitContact;

// Read more drawers in project cards
(() => {
  const cards = Array.from(document.querySelectorAll('.project'));
  cards.forEach((card) => {
    const btn = card.querySelector('.read-more');
    const more = btn && document.getElementById(btn.getAttribute('aria-controls'));
    if (btn && more) {
      const toggleMore = () => {
        const open = btn.getAttribute('aria-expanded') === 'true';
        if (open) { btn.setAttribute('aria-expanded', 'false'); more.classList.remove('open'); }
        else { btn.setAttribute('aria-expanded', 'true'); more.classList.add('open'); }
      };
      btn.addEventListener('click', toggleMore);
      btn.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleMore(); }});
    }
  });
})();

// Nav scrolled state and dynamic background glare
(() => {
  const navEl = document.querySelector('header.nav');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const setNavScrolled = () => { if (navEl) navEl.classList.toggle('scrolled', window.scrollY > 4); };

  function updateGlare() {
    if (prefersReduced) return;
    const h = Math.max(window.innerHeight, 1);
    const y = window.scrollY || window.pageYOffset || 0;
    const t = Math.min(Math.max(y / (h * 1.2), 0), 1);
    const glareO = (0.04 + t * 0.06).toFixed(3);
    const glareY = (-10 + t * 20).toFixed(1) + '%';
    const flowO  = (0.06 + t * 0.04).toFixed(3);
    const gridX  = (-t * 20).toFixed(1) + 'px';
    const gridY  = (t * 40).toFixed(1) + 'px';
    const root = document.documentElement;
    root.style.setProperty('--glare-o', glareO);
    root.style.setProperty('--glare-y', glareY);
    root.style.setProperty('--flow-opacity', flowO);
    root.style.setProperty('--grid-x', gridX);
    root.style.setProperty('--grid-y', gridY);
  }

  const onScroll = () => {
    setNavScrolled();
    if (!onScroll._ticking) {
      onScroll._ticking = true;
      requestAnimationFrame(() => { updateGlare(); onScroll._ticking = false; });
    }
  };
  setNavScrolled();
  updateGlare();
  window.addEventListener('scroll', onScroll, { passive: true });
})();

// Scroll-reveal
(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targets = Array.from(document.querySelectorAll('.card, .timeline-item, .hero .title, .hero .lead'));
  if (!targets.length) return;
  if (prefersReduced || !('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('in'));
    return;
  }
  targets.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${Math.min(i * 40, 240)}ms`;
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach(({ isIntersecting, target }) => {
      if (isIntersecting) { target.classList.add('in'); io.unobserve(target); }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
  targets.forEach(el => io.observe(el));
})();

// Tilt micro-interaction
(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;
  const tiltCards = document.querySelectorAll('.card');
  tiltCards.forEach((card) => {
    let rafId = null;
    const onMove = (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / Math.max(r.width, 1);
      const y = (e.clientY - r.top) / Math.max(r.height, 1);
      const rx = (0.5 - y) * 4;
      const ry = (x - 0.5) * 4;
      if (!rafId) rafId = requestAnimationFrame(() => { card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`; rafId = null; });
    };
    const onLeave = () => { card.style.transform = ''; };
    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseleave', onLeave);
  });
})();

