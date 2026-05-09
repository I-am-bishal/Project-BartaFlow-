// ── PRELOADER ─────────────────────────────────────────────────────────────
// Bulletproof — never hangs the page
(function () {
  // Immediately ensure body is scrollable (guards against previous session lock)
  document.body.style.overflow = '';
  document.documentElement.style.overflow = '';

  const pl = document.getElementById('preloader');
  if (!pl) return;

  let hidden = false;
  const hide = function () {
    if (hidden) return;
    hidden = true;
    pl.classList.add('hidden');
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    setTimeout(function () { if (pl.parentNode) pl.parentNode.removeChild(pl); }, 600);
  };

  // Hide after animation duration once page is ready
  if (document.readyState === 'complete') {
    setTimeout(hide, 1150);
  } else {
    window.addEventListener('load', function () { setTimeout(hide, 1150); }, { once: true });
  }

  // Hard failsafe — always hidden by 2s
  setTimeout(hide, 2000);

  // Early hide on any user interaction
  const earlyHide = function () { if (!hidden) setTimeout(hide, 100); };
  document.addEventListener('scroll',     earlyHide, { once: true, passive: true });
  document.addEventListener('keydown',    earlyHide, { once: true });
  document.addEventListener('pointerdown',earlyHide, { once: true });
})();

// ── GLOBAL OVERFLOW SAFETY NET ────────────────────────────────────────────
// Guarantees body scroll is never permanently locked by modal open/close bugs
(function () {
  const anyOpen = () => document.querySelector(
    '.auth-overlay.open,.demo-sched-overlay.open,.leads-overlay.open,.csv-overlay.open,.va-overlay.open,.modal-overlay.open'
  );

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible' && !anyOpen()) {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
  });

  window.addEventListener('pagehide', function () {
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  });

  window.addEventListener('pageshow', function () {
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  });

  // Periodic check every 3s
  setInterval(function () {
    if (!anyOpen() && document.body.style.overflow === 'hidden') {
      document.body.style.overflow = '';
    }
  }, 3000);
})();
