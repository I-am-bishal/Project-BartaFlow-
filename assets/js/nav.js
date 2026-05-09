// ── NAVIGATION ───────────────────────────────────────────────────────────

// Nav shadow on scroll
window.addEventListener('scroll', () => {
  document.getElementById('nav')?.classList.toggle('scrolled', scrollY > 50);
});

// ── MOBILE MENU ──────────────────────────────────────────────────────────
window.toggleMobileMenu = function () {
  const menu   = document.getElementById('mobile-menu');
  const burger = document.getElementById('hamburger');
  if (!menu || !burger) return;
  const isOpen = menu.classList.contains('open');
  menu.classList.toggle('open', !isOpen);
  burger.classList.toggle('open', !isOpen);
  burger.setAttribute('aria-expanded', String(!isOpen));
};

window.closeMobileMenu = function () {
  const menu   = document.getElementById('mobile-menu');
  const burger = document.getElementById('hamburger');
  if (menu)   menu.classList.remove('open');
  if (burger) { burger.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }
};

// Close mobile menu on outside click
document.addEventListener('click', e => {
  const menu   = document.getElementById('mobile-menu');
  const burger = document.getElementById('hamburger');
  if (menu && menu.classList.contains('open') &&
      !menu.contains(e.target) && burger && !burger.contains(e.target)) {
    closeMobileMenu();
  }
});

// ── SMOOTH SCROLL for anchor clicks ──────────────────────────────────────
document.addEventListener('click', function (e) {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href');
  if (!id || id === '#' || id.length < 2) return;
  const target = document.querySelector(id);
  if (!target) return;
  e.preventDefault();
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (typeof closeMobileMenu === 'function') closeMobileMenu();
});
