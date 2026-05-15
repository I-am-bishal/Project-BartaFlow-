// ── COOKIE CONSENT BANNER ─────────────────────────────────────────────────
(function () {
  const COOKIE_KEY = 'bf_cookie_consent';
  const banner     = document.getElementById('cookie-banner');
  if (!banner) return;

  // Real cookie implementation
  function setCookie(name, value, days) {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
  }

  function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  // Check both cookie and legacy localStorage
  if (!getCookie(COOKIE_KEY) && !localStorage.getItem(COOKIE_KEY)) {
    setTimeout(() => banner.classList.add('show'), 1800);
  }

  window.acceptCookies = function () {
    setCookie(COOKIE_KEY, 'accepted', 365);
    localStorage.setItem(COOKIE_KEY, 'accepted');
    banner.classList.remove('show');
    if (typeof showToast === 'function') {
      showToast('🍪', 'Preferences saved. Thank you!');
    }
  };

  window.declineCookies = function () {
    setCookie(COOKIE_KEY, 'declined', 365);
    localStorage.setItem(COOKIE_KEY, 'declined');
    banner.classList.remove('show');
    if (typeof showToast === 'function') {
      showToast('✓', 'Non-essential cookies declined.');
    }
  };
})();
