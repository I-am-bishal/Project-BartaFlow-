// ── BOTS DEMO MODAL ───────────────────────────────────────────────────────
// Depends on: utils.js

let currentBotConversation = [];
let currentBotName         = '';

function openDemo(name, icon, industry, features, conversation) {
  document.getElementById('m-name').textContent     = name;
  document.getElementById('m-icon').textContent     = icon;
  document.getElementById('m-industry').textContent = industry.toUpperCase() + ' · INTERACTIVE DEMO';
  currentBotName         = name;
  currentBotConversation = conversation;

  const chat = document.getElementById('demo-chat');
  chat.innerHTML = '';

  const msgs = conversation.slice(1);
  let delay = 0;
  for (let i = 0; i < msgs.length; i++) {
    const isUser = i % 2 === 0;
    delay += isUser ? 300 : 600;
    (function (msg, user, d) {
      setTimeout(() => appendDemoMsg(msg, user), d);
    })(msgs[i], isUser, delay);
  }

  document.getElementById('demo-input').value = '';
  document.getElementById('modal').classList.add('open');
}

function appendDemoMsg(text, isUser) {
  const chat = document.getElementById('demo-chat');
  const div  = document.createElement('div');
  div.className = 'dc-msg ' + (isUser ? 'dc-in' : 'dc-out');
  if (!isUser) div.innerHTML = '<span class="dc-ai">AI RESPONSE</span>' + text;
  else         div.textContent = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

function sendDemoMsg() {
  const inp = document.getElementById('demo-input');
  const txt = inp.value.trim();
  if (!txt) return;
  appendDemoMsg(txt, true);
  inp.value = '';

  const replies = [
    'Great question! I can help you with that right away.',
    'Absolutely! Let me check that for you and get back in just a moment.',
    "Thank you for sharing that. Based on what you've told me, I have a perfect solution for you.",
    "Noted! I'll process your request now. Is there anything else you'd like to know?",
    "That's a popular choice! I'll arrange the details and send you a confirmation shortly.",
    'Understood. Let me connect you with the right information. Just a moment please!',
  ];
  const reply = replies[Math.floor(Math.random() * replies.length)];
  setTimeout(() => appendDemoMsg(reply, false), 900);
}

function closeModal(e)     { if (e.target.id === 'modal') closeModalDirect(); }
function closeModalDirect() { document.getElementById('modal').classList.remove('open'); }

// ── Bot card scroll-in stagger ────────────────────────────────────────────
document.querySelectorAll('.bot-card').forEach((card, i) => {
  card.style.opacity   = '0';
  card.style.transform = 'translateY(20px)';
  card.style.transition = 'opacity .5s ease, transform .5s ease, box-shadow .3s, border-color .3s';
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        setTimeout(() => { card.style.opacity = '1'; card.style.transform = 'translateY(0)'; }, (i % 5) * 80);
        obs.unobserve(card);
      }
    });
  }, { threshold: 0.1 });
  obs.observe(card);
});

window.openDemo        = openDemo;
window.sendDemoMsg     = sendDemoMsg;
window.closeModal      = closeModal;
window.closeModalDirect = closeModalDirect;

window.openIndustryDemo = function(id) {
  const container = document.getElementById(id);
  if (!container) return;
  
  // 1. Scroll to the section first
  container.scrollIntoView({ behavior: 'smooth', block: 'center' });
  
  // 2. Find the card and trigger the demo
  const card = container.querySelector('.bot-card');
  if (card) {
    // Add a slight delay so the scroll starts before the modal pops up
    setTimeout(() => {
      card.click();
    }, 400);
  }
};
