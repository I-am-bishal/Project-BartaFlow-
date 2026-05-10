// ── DARK THEME TOGGLE ────────────────────────────────────────────────────
// Safe — no flash on load, no layout block
(function () {
  const btn = document.getElementById('theme-toggle');

  // Restore saved theme instantly — NO transition class yet (prevents flash)
  const saved = localStorage.getItem('bf-theme');
  if (saved === 'dark') {
    document.body.setAttribute('data-theme', 'dark');
    if (btn) btn.textContent = '🌙';
  } else {
    if (btn) btn.textContent = '☀️';
  }

  // Enable smooth transitions AFTER initial render (next frame)
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      document.body.classList.add('theme-ready');
    });
  });

  window.toggleTheme = function () {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.body.removeAttribute('data-theme');
      localStorage.setItem('bf-theme', 'light');
      if (btn) btn.textContent = '☀️';
    } else {
      document.body.setAttribute('data-theme', 'dark');
      localStorage.setItem('bf-theme', 'dark');
      if (btn) btn.textContent = '🌙';
    }
  };
})();
