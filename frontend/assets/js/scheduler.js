// ── SCHEDULE DEMO MODAL ───────────────────────────────────────────────────
// Depends on: utils.js (showToast), leads.js (saveLead)

let dsSelectedDate = null, dsSelectedTime = null, dsCurrentMonth, dsCurrentYear;

const TIME_SLOTS = ['9:00 AM','9:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','12:00 PM','2:00 PM','2:30 PM','3:00 PM','3:30 PM','4:00 PM','4:30 PM','5:00 PM'];
const UNAVAIL    = ['9:30 AM','11:30 AM','2:30 PM','4:30 PM'];
const MONTHS_AR  = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function openDemoSched() {
  document.getElementById('demo-sched-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  const now = new Date();
  dsCurrentMonth = now.getMonth();
  dsCurrentYear  = now.getFullYear();
  renderCal(); renderSlots(); goToStep(1, true);
}

function closeDemoSched() {
  document.getElementById('demo-sched-overlay').classList.remove('open');
  document.body.style.overflow = '';
  dsSelectedDate = null; dsSelectedTime = null;
  const n = document.getElementById('ds-next1');
  if (n) { n.disabled = true; n.style.opacity = '.4'; }
  const si = document.querySelector('.ds-step-indicator');
  if (si) si.style.display = '';
}

function handleDemoOverlayClick(e) { if (e.target.id === 'demo-sched-overlay') closeDemoSched(); }

function renderCal() {
  document.getElementById('cal-month-label').textContent = MONTHS_AR[dsCurrentMonth] + ' ' + dsCurrentYear;
  const grid = document.getElementById('cal-days');
  grid.innerHTML = '';
  const firstDay = new Date(dsCurrentYear, dsCurrentMonth, 1).getDay();
  const days     = new Date(dsCurrentYear, dsCurrentMonth + 1, 0).getDate();
  const today    = new Date(); today.setHours(0, 0, 0, 0);

  for (let i = 0; i < firstDay; i++) {
    const d = document.createElement('button');
    d.className = 'cal-day empty'; d.disabled = true;
    grid.appendChild(d);
  }
  for (let i = 1; i <= days; i++) {
    const d        = document.createElement('button');
    const thisDate = new Date(dsCurrentYear, dsCurrentMonth, i);
    const isPast   = thisDate < today;
    const isWknd   = thisDate.getDay() === 0 || thisDate.getDay() === 6;
    d.className    = 'cal-day' + (isPast || isWknd ? ' past' : ' has-slots');
    if (thisDate.toDateString() === today.toDateString()) d.classList.add('today');
    d.textContent = i; d.disabled = isPast || isWknd;
    if (!isPast && !isWknd) d.onclick = () => selectDay(d, thisDate);
    if (dsSelectedDate && thisDate.toDateString() === dsSelectedDate.toDateString()) d.classList.add('selected');
    grid.appendChild(d);
  }
}

function changeMonth(dir) {
  dsCurrentMonth += dir;
  if (dsCurrentMonth > 11) { dsCurrentMonth = 0; dsCurrentYear++; }
  if (dsCurrentMonth < 0)  { dsCurrentMonth = 11; dsCurrentYear--; }
  renderCal();
}

function selectDay(btn, date) {
  document.querySelectorAll('.cal-day').forEach(d => d.classList.remove('selected'));
  btn.classList.add('selected'); dsSelectedDate = date; dsSelectedTime = null;
  document.getElementById('slots-label').textContent = 'Available slots — ' + date.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
  renderSlots(); checkStep1();
}

function renderSlots() {
  const grid = document.getElementById('time-slots');
  grid.innerHTML = '';
  TIME_SLOTS.forEach(slot => {
    const btn     = document.createElement('button');
    const unavail = UNAVAIL.includes(slot);
    btn.className = 'time-slot' + (unavail ? ' unavailable' : '');
    btn.textContent = slot;
    btn.disabled    = unavail;
    if (dsSelectedTime === slot) btn.classList.add('selected');
    if (!unavail) btn.onclick = () => {
      document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
      btn.classList.add('selected');
      dsSelectedTime = slot;
      checkStep1();
    };
    grid.appendChild(btn);
  });
}

function checkStep1() {
  const ok = dsSelectedDate && dsSelectedTime;
  const n  = document.getElementById('ds-next1');
  n.disabled    = !ok;
  n.style.opacity = ok ? '1' : '.4';
}

function goToStep(n, init) {
  if (n === 3) {
    const fname    = document.getElementById('ds-fname').value.trim();
    const email    = document.getElementById('ds-email').value.trim();
    const industry = document.getElementById('ds-industry').value;
    const errEl    = document.getElementById('ds-error');
    errEl.classList.remove('show');
    if (!fname || !email || !industry) { errEl.textContent = 'Please fill in name, email, and business type.'; errEl.classList.add('show'); return; }
    if (!/\S+@\S+\.\S+/.test(email))   { errEl.textContent = 'Please enter a valid email address.'; errEl.classList.add('show'); return; }
    const lname = document.getElementById('ds-lname').value.trim();
    document.getElementById('cf-date').textContent     = dsSelectedDate.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('cf-time').textContent     = dsSelectedTime + ' IST';
    document.getElementById('cf-name').textContent     = fname + (lname ? ' ' + lname : '');
    document.getElementById('cf-email').textContent    = email;
    document.getElementById('cf-industry').textContent = industry;
  }
  for (let i = 1; i <= 3; i++) {
    const s = document.getElementById('dstep' + i);
    const l = document.getElementById('dsline' + i);
    if (i < n)       { s.classList.add('done'); s.classList.remove('active'); s.textContent = '✓'; if (l) l.classList.add('done'); }
    else if (i === n){ s.classList.add('active'); s.classList.remove('done'); s.textContent = i; }
    else             { s.classList.remove('active', 'done'); s.textContent = i; if (l) l.classList.remove('done'); }
  }
  document.querySelectorAll('.ds-panel').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById('ds-panel-' + n);
  if (panel) panel.classList.add('active');
}

function confirmDemo() {
  const btn = document.getElementById('confirm-btn-text');
  btn.textContent = 'Booking...';
  setTimeout(() => {
    const fname    = document.getElementById('ds-fname').value.trim();
    const lname    = document.getElementById('ds-lname').value.trim();
    const email    = document.getElementById('ds-email').value.trim();
    const phone    = document.getElementById('ds-phone').value.trim();
    const industry = document.getElementById('ds-industry').value;
    const goal     = document.getElementById('ds-goal').value;
    const dateStr  = dsSelectedDate.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    saveLead({ name: fname + (lname ? ' ' + lname : ''), email, phone, industry, goal, source: 'demo', demoDate: dateStr, demoTime: dsSelectedTime + ' IST' });
    document.getElementById('ds-success-detail').innerHTML =
      '📅 ' + dateStr + '\n🕐 ' + dsSelectedTime + ' IST · 30 minutes\n📧 Invite sent to: ' + email + '\n🔗 Google Meet link included\n👤 Host: Rahul · BartaFlow Team';
    document.querySelectorAll('.ds-panel').forEach(p => p.classList.remove('active'));
    document.getElementById('ds-panel-success').classList.add('active');
    const si = document.querySelector('.ds-step-indicator');
    if (si) si.style.display = 'none';
  }, 1500);
}

window.openDemoSched         = openDemoSched;
window.closeDemoSched        = closeDemoSched;
window.handleDemoOverlayClick = handleDemoOverlayClick;
window.changeMonth           = changeMonth;
window.goToStep              = goToStep;
window.confirmDemo           = confirmDemo;
