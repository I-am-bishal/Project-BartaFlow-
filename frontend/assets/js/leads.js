// ── LEADS CAPTURE & MANAGEMENT ───────────────────────────────────────────
// Depends on: utils.js (showToast, escHtml)

let LEADS = [
  { id: 1, name: 'Priya Rathod',      email: 'priya@travelmate.in',  phone: '+91 98765 43210', company: 'TravelMate Agency',      industry: 'Travel & Tourism',       goal: 'Generate & qualify leads',      source: 'demo',    demoDate: 'Mon, 12 May 2025', demoTime: '10:00 AM IST', time: '2 hours ago',  ts: Date.now() - 7200000   },
  { id: 2, name: 'Arjun Mehta',       email: 'arjun@fashionhub.com', phone: '+91 87654 32109', company: 'FashionHub',             industry: 'E-Commerce',              goal: 'Sell products via WhatsApp',    source: 'signup',  demoDate: '',                 demoTime: '',             time: '5 hours ago',  ts: Date.now() - 18000000  },
  { id: 3, name: 'Dr. Sunita Kapoor', email: 'sunita@carepoint.in',  phone: '+91 76543 21098', company: 'CarePoint Clinics',      industry: 'Healthcare',              goal: 'Automate customer support',     source: 'demo',    demoDate: 'Wed, 14 May 2025', demoTime: '3:00 PM IST',  time: 'Yesterday',    ts: Date.now() - 86400000  },
  { id: 4, name: 'Raj Verma',         email: 'raj@brightmind.edu',   phone: '+91 65432 10987', company: 'BrightMind Coaching',    industry: 'Education & Coaching',    goal: 'Booking & appointment management', source: 'chatbot', demoDate: '',             demoTime: '',             time: 'Yesterday',    ts: Date.now() - 90000000  },
  { id: 5, name: 'Meena Sharma',      email: 'meena@spiceroute.com', phone: '',                company: 'SpiceRoute Restaurants', industry: 'Restaurant & Food',       goal: 'Automate customer support',     source: 'contact', demoDate: '',                 demoTime: '',             time: '2 days ago',   ts: Date.now() - 172800000 },
];
let nextLeadId = 6;

function saveLead(data) {
  const lead = {
    id: nextLeadId++,
    name:     data.name     || 'Unknown',
    email:    data.email    || '',
    phone:    data.phone    || '',
    company:  data.company  || '',
    industry: data.industry || '',
    goal:     data.goal     || '',
    source:   data.source   || 'contact',
    demoDate: data.demoDate || '',
    demoTime: data.demoTime || '',
    time: 'Just now',
    ts:   Date.now()
  };
  LEADS.unshift(lead);
  updateLeadsBadge();
  showToast('✓', '📋 New lead captured: ' + lead.name);
  return lead;
}
window.saveLead = saveLead;

function updateLeadsBadge() {
  const badge = document.getElementById('leads-count-badge');
  if (badge) badge.textContent = LEADS.length;
}

// ── Leads panel ──────────────────────────────────────────────────────────
function openLeadsPanel() {
  renderLeads();
  document.getElementById('leads-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLeadsPanel() {
  document.getElementById('leads-overlay').classList.remove('open');
  document.body.style.overflow = '';
}
window.openLeadsPanel  = openLeadsPanel;
window.closeLeadsPanel = closeLeadsPanel;
window.handleLeadsOverlayClick = function (e) { if (e.target.id === 'leads-overlay') closeLeadsPanel(); };

function renderLeads() {
  const search = (document.getElementById('leads-search')?.value || '').toLowerCase();
  const filter = document.getElementById('leads-filter')?.value || '';
  let filtered = LEADS.filter(l => {
    const matchSearch = !search || (l.name + l.email + l.company + l.industry).toLowerCase().includes(search);
    const matchFilter = !filter || l.source === filter;
    return matchSearch && matchFilter;
  });

  const today = new Date(); today.setHours(0, 0, 0, 0);
  document.getElementById('ls-total').textContent   = LEADS.length;
  document.getElementById('ls-demo').textContent    = LEADS.filter(l => l.source === 'demo').length;
  document.getElementById('ls-signup').textContent  = LEADS.filter(l => l.source === 'signup').length;
  document.getElementById('ls-today').textContent   = LEADS.filter(l => l.ts >= today.getTime()).length;
  document.getElementById('lp-sub-text').textContent = filtered.length + ' of ' + LEADS.length + ' leads';

  const list = document.getElementById('leads-list');
  if (!list) return;

  if (filtered.length === 0) {
    list.innerHTML = '<div class="lp-empty"><div class="lp-empty-icon">🔍</div><div class="lp-empty-text">No leads match your search.<br>Try a different filter or keyword.</div></div>';
    return;
  }

  const sourceLabel = { demo: 'Demo Booked', signup: 'Signed Up', chatbot: 'Chatbot', contact: 'Contact Form' };
  const sourceClass = { demo: 'lb-demo',     signup: 'lb-signup',  chatbot: 'lb-chatbot', contact: 'lb-contact' };

  list.innerHTML = filtered.map(l => {
    const initials = l.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const hasDemo  = l.demoDate && l.demoTime;
    return `
<div class="lead-card" id="lead-${l.id}">
  <div class="lead-card-top">
    <div class="lead-av">${initials}</div>
    <div class="lead-info">
      <div class="lead-name">${escHtml(l.name)}</div>
      <div class="lead-email">${escHtml(l.email)}</div>
    </div>
    <div class="lead-time">${escHtml(l.time)}</div>
  </div>
  <div class="lead-badges">
    <span class="lead-badge ${sourceClass[l.source] || 'lb-contact'}">${sourceLabel[l.source] || 'Contact'}</span>
    ${l.industry ? `<span class="lead-badge" style="background:var(--smoke2);color:var(--text2);border:1px solid var(--border)">${escHtml(l.industry)}</span>` : ''}
  </div>
  <div class="lead-meta">
    ${l.phone   ? `<div class="lead-meta-item"><div class="lead-meta-label">Phone</div><div class="lead-meta-val">${escHtml(l.phone)}</div></div>` : ''}
    ${l.company ? `<div class="lead-meta-item"><div class="lead-meta-label">Company</div><div class="lead-meta-val">${escHtml(l.company)}</div></div>` : ''}
    ${l.goal    ? `<div class="lead-meta-item" style="grid-column:span 2"><div class="lead-meta-label">Goal</div><div class="lead-meta-val">${escHtml(l.goal)}</div></div>` : ''}
    ${hasDemo   ? `<div class="lead-meta-item" style="grid-column:span 2"><div class="lead-meta-label">Demo Scheduled</div><div class="lead-meta-val" style="color:var(--navy);font-weight:500">📅 ${escHtml(l.demoDate)} · ${escHtml(l.demoTime)}</div></div>` : ''}
  </div>
  <div class="lead-actions">
    <button class="lead-act-btn primary" onclick="copyEmail('${escHtml(l.email)}')">📧 Copy Email</button>
    ${l.phone ? `<button class="lead-act-btn" onclick="copyPhone('${escHtml(l.phone)}')">📞 Copy Phone</button>` : ''}
    <button class="lead-act-btn" onclick="whatsappLead('${escHtml(l.phone)}','${escHtml(l.name)}')">💬 WhatsApp</button>
    <button class="lead-act-btn" onclick="deleteLead(${l.id})" style="color:var(--rose);margin-left:auto" title="Remove lead">🗑</button>
  </div>
</div>`;
  }).join('');
}
window.renderLeads = renderLeads;

function copyEmail(email) {
  navigator.clipboard.writeText(email).then(() => showToast('📧', 'Email copied: ' + email)).catch(() => showToast('❌', 'Could not copy'));
}
function copyPhone(phone) {
  navigator.clipboard.writeText(phone).then(() => showToast('📞', 'Phone copied: ' + phone)).catch(() => showToast('❌', 'Could not copy'));
}
function whatsappLead(phone, name) {
  if (!phone) { showToast('⚠️', 'No phone number for ' + name); return; }
  const cleaned = phone.replace(/\D/g, '');
  const msg     = encodeURIComponent('Hi ' + name + ', this is the BartaFlow team following up on your interest. How can we help?');
  window.open('https://wa.me/' + cleaned + '?text=' + msg, '_blank');
}
function deleteLead(id) {
  if (!confirm('Remove this lead from your list?')) return;
  LEADS = LEADS.filter(l => l.id !== id);
  updateLeadsBadge();
  renderLeads();
  showToast('🗑', 'Lead removed');
}
function exportLeadsCSV() {
  if (LEADS.length === 0) { showToast('⚠️', 'No leads to export yet'); return; }
  const headers = ['Name','Email','Phone','Company','Industry','Goal','Source','Demo Date','Demo Time','Captured'];
  const rows    = LEADS.map(l => [l.name,l.email,l.phone,l.company,l.industry,l.goal,l.source,l.demoDate,l.demoTime,l.time].map(v => '"' + (v||'').replace(/"/g,'""') + '"').join(','));
  const csv     = [headers.join(','), ...rows].join('\n');
  const blob    = new Blob([csv], { type: 'text/csv' });
  const url     = URL.createObjectURL(blob);
  const a       = document.createElement('a');
  a.href = url; a.download = 'bartaflow-leads-' + new Date().toISOString().slice(0,10) + '.csv'; a.click();
  URL.revokeObjectURL(url);
  showToast('⬇', 'Exported ' + LEADS.length + ' leads as CSV');
}

window.copyEmail       = copyEmail;
window.copyPhone       = copyPhone;
window.whatsappLead    = whatsappLead;
window.deleteLead      = deleteLead;
window.exportLeadsCSV  = exportLeadsCSV;

// Initialise badge on load
updateLeadsBadge();
