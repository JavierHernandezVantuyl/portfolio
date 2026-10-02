// ── Footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ── Copy email
document.querySelectorAll('[data-copy]').forEach(btn => {
  btn.addEventListener('click', async () => {
    let label = 'Copied';
    try {
      await navigator.clipboard.writeText(btn.dataset.copy);
    } catch {
      // Clipboard blocked: select the address so ⌘C / Ctrl+C works
      const link = btn.previousElementSibling;
      if (link) window.getSelection().selectAllChildren(link);
      label = 'Selected';
    }
    btn.textContent = label;
    setTimeout(() => { btn.textContent = 'Copy'; }, 1800);
  });
});

// ── Mark the section in view in the masthead
(() => {
  if (!window.IntersectionObserver) return;
  const links = new Map(
    [...document.querySelectorAll('.masthead nav a[href^="#"]')].map(a => [a.hash.slice(1), a])
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

// ── Print the whole file, notebook included
window.addEventListener('beforeprint', () => {
  document.querySelectorAll('details').forEach(d => { d.open = true; });
});
