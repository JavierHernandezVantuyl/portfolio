const root = document.documentElement;
const motion = root.classList.contains('motion');

// ── Footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ── Copy email
document.querySelectorAll('[data-copy]').forEach(btn => {
  const original = btn.textContent;
  btn.addEventListener('click', async () => {
    let label = 'Copied ✓';
    try {
      await navigator.clipboard.writeText(btn.dataset.copy);
    } catch {
      // Clipboard blocked: select the address so ⌘C / Ctrl+C works
      const target = btn.previousElementSibling;
      if (target) window.getSelection().selectAllChildren(target);
      label = 'Selected';
    }
    btn.textContent = label;
    setTimeout(() => { btn.textContent = original; }, 1800);
  });
});

// ── One-shot "in view" helper
function whenSeen(els, fn, options = { threshold: 0.25 }) {
  if (!('IntersectionObserver' in window)) { els.forEach(fn); return; }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      fn(e.target);
    });
  }, options);
  els.forEach(el => io.observe(el));
}

// ── Papers landing on the desk (stagger siblings)
(() => {
  const drops = [...document.querySelectorAll('.drop')];
  if (!motion) return;
  const counts = new Map();
  drops.forEach(el => {
    const n = counts.get(el.parentElement) || 0;
    el.style.setProperty('--i', n);
    counts.set(el.parentElement, n + 1);
  });
  whenSeen(drops, el => el.classList.add('dropped'), { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
})();

// ── Declassify redacted figures
(() => {
  const docs = [...document.querySelectorAll('.doc')];
  docs.forEach(doc => {
    doc.querySelectorAll('.redact').forEach((r, i) => r.style.setProperty('--d', 500 + i * 260));
  });
  if (!motion) return;
  whenSeen(docs, doc => doc.classList.add('declassified'), { threshold: 0.3 });
})();

// ── Decrypt "1st in Cryptography"
(() => {
  const els = [...document.querySelectorAll('.decrypt')];
  if (!motion) return;
  const glyphs = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&@$§*+=';
  const scramble = text => text.replace(/\S/g, () => glyphs[Math.random() * glyphs.length | 0]);
  els.forEach(el => {
    el.dataset.text = el.textContent;
    el.setAttribute('aria-label', el.dataset.text);
    el.textContent = scramble(el.dataset.text);
  });
  whenSeen(els, el => {
    const final = el.dataset.text;
    let step = 0;
    const id = setInterval(() => {
      const locked = Math.floor(step / 2);
      el.textContent = final.slice(0, locked) + scramble(final.slice(locked));
      if (++step > final.length * 2) { clearInterval(id); el.textContent = final; }
    }, 45);
  }, { threshold: 0.5 });
})();

// ── Red string between exhibits and their tech
(() => {
  const cork = document.querySelector('.cork');
  const svg = cork?.querySelector('.strings');
  if (!cork || !svg) return;
  const NS = 'http://www.w3.org/2000/svg';
  let strung = false;

  function draw() {
    if (getComputedStyle(svg).display === 'none') return;
    const box = cork.getBoundingClientRect();
    const ox = box.left + cork.clientLeft;
    const oy = box.top + cork.clientTop;
    const centre = el => {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2 - ox, y: r.top + r.height / 2 - oy };
    };
    svg.setAttribute('viewBox', `0 0 ${cork.clientWidth} ${cork.clientHeight}`);
    svg.replaceChildren();

    let n = 0;
    cork.querySelectorAll('.exhibit[data-links]').forEach(ex => {
      const from = centre(ex.querySelector('.pin-anchor'));
      ex.dataset.links.split(' ').forEach(tag => {
        const pin = cork.querySelector(`.tag[data-tag="${tag}"] .pin`);
        if (!pin) return;
        const to = centre(pin);
        const sag = 34 + Math.abs(to.x - from.x) * 0.09;
        const path = document.createElementNS(NS, 'path');
        path.setAttribute('d', `M${from.x} ${from.y} Q${(from.x + to.x) / 2} ${Math.max(from.y, to.y) + sag} ${to.x} ${to.y}`);
        svg.appendChild(path);
        if (motion && !strung) {
          const len = path.getTotalLength();
          path.style.strokeDasharray = len;
          path.style.strokeDashoffset = len;
          path.style.transitionDelay = `${n * 90}ms`;
        }
        n++;
      });
    });
  }

  function pull() {
    strung = true;
    svg.querySelectorAll('path').forEach(p => { p.style.strokeDashoffset = 0; });
  }

  draw();
  whenSeen([cork], () => {
    // let the papers land before measuring
    setTimeout(() => { draw(); requestAnimationFrame(() => requestAnimationFrame(pull)); }, motion ? 900 : 0);
  }, { threshold: 0.2 });

  let t;
  const redraw = () => { clearTimeout(t); t = setTimeout(() => { draw(); if (strung) pull(); }, 120); };
  if ('ResizeObserver' in window) new ResizeObserver(redraw).observe(cork);
  else window.addEventListener('resize', redraw);
  document.fonts?.ready.then(redraw);
})();

// ── Flip the concept cards
document.querySelectorAll('.flip').forEach(card => {
  const btn = card.querySelector('.flip-btn');
  btn?.addEventListener('click', () => {
    const on = card.classList.toggle('flipped');
    btn.setAttribute('aria-pressed', String(on));
  });
});

// ── Open the envelope when it comes into view
(() => {
  const env = document.querySelector('.envelope');
  if (!env) return;
  if (!motion) { env.classList.add('open'); return; }
  whenSeen([env], el => el.classList.add('open'), { threshold: 0.35 });
})();

// ── Mark the section in view on the divider tabs
(() => {
  if (!('IntersectionObserver' in window)) return;
  const links = new Map(
    [...document.querySelectorAll('.tabs a[href^="#"]')].map(a => [a.hash.slice(1), a])
  );
  const inView = new Set();
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => (e.isIntersecting ? inView.add(e.target.id) : inView.delete(e.target.id)));
    links.forEach((a, id) => {
      if (inView.has(id)) a.setAttribute('aria-current', 'location');
      else a.removeAttribute('aria-current');
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  links.forEach((_, id) => {
    const section = document.getElementById(id);
    if (section) io.observe(section);
  });
})();

// ── Printing: show everything
window.addEventListener('beforeprint', () => {
  document.querySelectorAll('.drop').forEach(el => el.classList.add('dropped'));
  document.querySelectorAll('.doc').forEach(el => el.classList.add('declassified'));
  document.querySelector('.envelope')?.classList.add('open');
});
