// ── COOKIE CONSENT BANNER ─────────────────────────────────────────────────
(function () {
  const COOKIE_KEY = 'bf_cookie_consent';
  const PREFS_KEY  = 'bf_cookie_prefs';
  const banner     = document.getElementById('cookie-banner');
  const prefsOverlay = document.getElementById('cookie-overlay');
  
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
    
    // Save all prefs as true
    const prefs = { analytics: true, marketing: true };
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    
    banner.classList.remove('show');
    if (prefsOverlay) prefsOverlay.classList.remove('open');
    
    if (typeof showToast === 'function') {
      showToast('🍪', 'All cookies accepted. Thank you!');
    }
  };

  window.declineCookies = function () {
    setCookie(COOKIE_KEY, 'declined', 365);
    localStorage.setItem(COOKIE_KEY, 'declined');
    
    // Save all prefs as false
    const prefs = { analytics: false, marketing: false };
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    
    banner.classList.remove('show');
    if (prefsOverlay) prefsOverlay.classList.remove('open');
    
    if (typeof showToast === 'function') {
      showToast('✓', 'Non-essential cookies declined.');
    }
  };

  window.openCookiePrefs = function() {
    if (prefsOverlay) {
      // Load current preferences if any
      try {
        const savedPrefs = JSON.parse(localStorage.getItem(PREFS_KEY));
        if (savedPrefs) {
          const analyticsCb = document.getElementById('cp-analytics');
          const marketingCb = document.getElementById('cp-marketing');
          if (analyticsCb) analyticsCb.checked = savedPrefs.analytics;
          if (marketingCb) marketingCb.checked = savedPrefs.marketing;
        }
      } catch (e) {}
      
      prefsOverlay.classList.add('open');
    }
  };

  window.closeCookiePrefs = function() {
    if (prefsOverlay) {
      prefsOverlay.classList.remove('open');
    }
  };

  window.saveCookiePrefs = function() {
    const analyticsCb = document.getElementById('cp-analytics');
    const marketingCb = document.getElementById('cp-marketing');
    
    const prefs = {
      analytics: analyticsCb ? analyticsCb.checked : false,
      marketing: marketingCb ? marketingCb.checked : false
    };
    
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    
    // Mark general consent as saved
    setCookie(COOKIE_KEY, 'custom', 365);
    localStorage.setItem(COOKIE_KEY, 'custom');
    
    banner.classList.remove('show');
    closeCookiePrefs();
    
    if (typeof showToast === 'function') {
      showToast('🍪', 'Cookie preferences saved successfully!');
    }
  };

})();
