// ── FAQ ACCORDION ─────────────────────────────────────────────────────────
(function () {
  let openIndex = null;

  window.toggleFaq = function (index) {
    const items = document.querySelectorAll('.faq-item');
    items.forEach((item, i) => {
      const isTarget      = i === index;
      const isCurrentOpen = item.classList.contains('open');
      if (!isTarget) return;
      if (isCurrentOpen) {
        item.classList.remove('open');
        openIndex = null;
      } else {
        items.forEach(it => it.classList.remove('open'));
        item.classList.add('open');
        openIndex = index;
        setTimeout(() => {
          const rect = item.getBoundingClientRect();
          if (rect.top < 80 || rect.bottom > window.innerHeight - 40) {
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 80);
      }
    });
  };

  // Open first item after a short delay
  setTimeout(() => {
    const first = document.querySelector('.faq-item[data-index="0"]');
    if (first && !first.classList.contains('open')) { first.classList.add('open'); openIndex = 0; }
  }, 800);

  // Staggered scroll-reveal for FAQ items
  const faqObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const items = e.target.querySelectorAll('.faq-item');
      items.forEach((item, i) => {
        item.style.opacity   = '0';
        item.style.transform = 'translateY(16px)';
        item.style.transition = `opacity .5s ease ${i * 0.06}s, transform .5s ease ${i * 0.06}s`;
        setTimeout(() => { item.style.opacity = '1'; item.style.transform = 'translateY(0)'; }, i * 60 + 100);
      });
      faqObserver.unobserve(e.target);
    });
  }, { threshold: 0.1 });

  const faqList = document.getElementById('faq-list');
  if (faqList) faqObserver.observe(faqList);
})();

// ── CHAT WIDGET ───────────────────────────────────────────────────────────
(function () {
  let chatOpen = false;
  const AI_REPLIES = {
    "What's the pricing?": "We have 3 plans: Starter ₹999/mo, Professional ₹2,499/mo, and Enterprise ₹4,999/mo. All include a 14-day free trial! Want me to open the pricing section?",
    "Book a demo":         "I'll open our demo scheduler for you right now! You can pick a date and time that works. 📅",
    "How does it work?":   "BartaFlow connects to your WhatsApp Business number via Meta's official API. You configure the AI with your products/services, and it handles all customer conversations 24/7 — leads, bookings, sales, support. Setup takes 48 hours!",
  };
  const DEFAULT_REPLIES = [
    "Great question! Our team would love to help. Would you like to schedule a quick 30-min demo?",
    "Thanks for reaching out! I can help with pricing, features, or booking a demo. What would you like to know?",
    "That's something our sales team specialises in. Shall I connect you with them? Or I can book a demo for you right now.",
    "Happy to help! For detailed answers, I'd recommend booking a free demo — our team will walk you through everything personally.",
  ];
  let replyIndex = 0;

  window.toggleFloatChat = function () {
    const box   = document.getElementById('float-chat-box');
    const btn   = document.getElementById('float-chat-btn');
    const notif = document.getElementById('fch-notif');
    if (!box || !btn) return;
    chatOpen = !chatOpen;
    box.style.display = chatOpen ? 'block' : 'none';
    btn.classList.toggle('open', chatOpen);
    if (chatOpen && notif) notif.style.display = 'none';
  };

  window.fchQuickReply = function (text) {
    const qrBar = document.getElementById('fch-qr');
    if (qrBar) qrBar.style.display = 'none';
    fchAddMsg(text, true);
    const reply = AI_REPLIES[text] || DEFAULT_REPLIES[replyIndex++ % DEFAULT_REPLIES.length];
    fchShowTyping(reply);
    if (text === 'Book a demo') setTimeout(() => openDemoSched(), 1800);
  };

  window.fchSend = function () {
    const inp = document.getElementById('fch-input');
    if (!inp) return;
    const text = inp.value.trim();
    if (!text) return;
    inp.value = '';
    const qrBar = document.getElementById('fch-qr');
    if (qrBar) qrBar.style.display = 'none';
    fchAddMsg(text, true);
    fchShowTyping(DEFAULT_REPLIES[replyIndex++ % DEFAULT_REPLIES.length]);
  };

  function fchAddMsg(text, isUser) {
    const body = document.getElementById('fch-body');
    if (!body) return;
    const div = document.createElement('div');
    div.className = 'fch-msg ' + (isUser ? 'fch-msg-out' : 'fch-msg-in');
    if (!isUser) div.innerHTML = '<span class="fch-msg-ai-tag">BOTFLOW AI</span>' + text;
    else         div.textContent = text;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }

  function fchShowTyping(reply) {
    const body = document.getElementById('fch-body');
    if (!body) return;
    const typing = document.createElement('div');
    typing.className = 'fch-typing';
    typing.innerHTML = '<div class="fch-typing-dot"></div><div class="fch-typing-dot"></div><div class="fch-typing-dot"></div>';
    body.appendChild(typing);
    body.scrollTop = body.scrollHeight;
    setTimeout(() => { if (typing.parentNode) typing.parentNode.removeChild(typing); fchAddMsg(reply, false); }, 1200 + Math.random() * 400);
  }

  // Show notification badge after 3s
  setTimeout(() => {
    const notif = document.getElementById('fch-notif');
    if (notif && !chatOpen) notif.style.display = 'flex';
  }, 3000);
})();

// ── COOKIE CONSENT BANNER ─────────────────────────────────────────────────
(function () {
  const COOKIE_KEY = 'bf_cookie_consent';
  const banner     = document.getElementById('cookie-banner');
  if (!banner) return;
  if (!localStorage.getItem(COOKIE_KEY)) {
    setTimeout(() => banner.classList.add('show'), 1800);
  }
  window.acceptCookies = function () {
    localStorage.setItem(COOKIE_KEY, 'accepted');
    banner.classList.remove('show');
    showToast('🍪', 'Preferences saved. Thank you!');
  };
  window.declineCookies = function () {
    localStorage.setItem(COOKIE_KEY, 'declined');
    banner.classList.remove('show');
    showToast('✓', 'Non-essential cookies declined.');
  };
})();

// ── SCROLL REVEAL & ANALYTICS BAR ANIMATION ───────────────────────────────
const _revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('up'); });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal, .feat-card').forEach((el, i) => {
  if (el.classList.contains('feat-card')) el.style.transitionDelay = (i % 3) * 0.12 + 's';
  _revealObserver.observe(el);
});

const _barObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.ma-fill').forEach(bar => { bar.style.width = bar.dataset.w + '%'; });
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('.feat-card').forEach(c => _barObserver.observe(c));

// ── GLOBAL ESC KEY HANDLER ────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (typeof closeAuth         === 'function') closeAuth();
    if (typeof closeDemoSched    === 'function') closeDemoSched();
    if (typeof closeModalDirect  === 'function') closeModalDirect();
    if (typeof closeLeadsPanel   === 'function') closeLeadsPanel();
    if (typeof closeCsvViewer    === 'function') closeCsvViewer();
    if (typeof closeLegal        === 'function') closeLegal();
    if (typeof closePayment      === 'function') closePayment();
    if (typeof closeEmailModal   === 'function') closeEmailModal();
  }
});
