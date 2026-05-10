// ── SHARED UTILITIES ─────────────────────────────────────────────────────
// Used by: auth.js, leads.js, csv.js, scheduler.js, payment.js, email.js

/** HTML-escape a string to prevent XSS in dynamically-built HTML */
function escHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── TOAST ────────────────────────────────────────────────────────────────
let _toastTimer;
function showToast(icon, msg) {
  const t  = document.getElementById('toast');
  const ti = document.getElementById('toast-icon');
  const tm = document.getElementById('toast-msg');
  if (!t) return;
  ti.textContent = icon;
  tm.textContent = msg;
  t.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove('show'), 3500);
}

// Make both available globally (required by inline onclick handlers in HTML)
window.escHtml   = escHtml;
window.showToast = showToast;
