// ── AUTH SYSTEM ───────────────────────────────────────────────────────────
// Gmail-only sign in/up, confirm password, OTP password reset, auto-redirect

// ── User store (localStorage) ─────────────────────────────────────────────
function getUsers() { try { return JSON.parse(localStorage.getItem('bf_users') || '[]'); } catch (e) { return []; } }
function saveUsers(u) { localStorage.setItem('bf_users', JSON.stringify(u)); }

// Seed demo accounts once
(function () {
  if (getUsers().length === 0) {
    saveUsers([
      { email: 'demo@gmail.com',  password: hashPw('Demo@1234'), name: 'Demo User', company: 'BartaFlow Demo' },
      { email: 'admin@gmail.com', password: hashPw('Admin@123'),  name: 'Admin',     company: 'BartaFlow' },
    ]);
  }
})();

// Simple XOR-fold hash (front-end simulation only — not cryptographic)
function hashPw(pw) {
  let h = 5381;
  for (let i = 0; i < pw.length; i++) h = (h * 33) ^ pw.charCodeAt(i);
  return (h >>> 0).toString(16);
}

// ── Validation ────────────────────────────────────────────────────────────
const GMAIL_RE    = /^[a-zA-Z0-9._%+\-]+@gmail\.com$/;
const PW_STRONG_RE = /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/;
const PW_MIN_RE   = /^.{6,}$/;

function isGmail(email)   { return GMAIL_RE.test(email.trim()); }
function isPwStrong(pw)   { return PW_STRONG_RE.test(pw); }

window.validateField = function (input, type) {
  const id   = input.id;
  const hint = document.getElementById('hint-' + id);
  const icon = document.getElementById('icon-' + id);
  const val  = input.value.trim();

  const setOk      = (msg) => { input.classList.remove('invalid'); input.classList.add('valid');    if (hint) { hint.textContent = msg || ''; hint.className = 'field-hint ok';      } if (icon) icon.textContent = '✓'; };
  const setErr     = (msg) => { input.classList.remove('valid');   input.classList.add('invalid');  if (hint) { hint.textContent = msg;      hint.className = 'field-hint err';     } if (icon) icon.textContent = '✕'; };
  const setNeutral = (msg) => { input.classList.remove('valid', 'invalid');                         if (hint) { hint.textContent = msg || ''; hint.className = 'field-hint neutral'; } if (icon) icon.textContent = ''; };

  if (!val) { setNeutral(type === 'gmail' ? 'Must be a valid Gmail address (@gmail.com)' : ''); return; }

  if (type === 'gmail') {
    if (!val.includes('@'))  setNeutral('Keep typing...');
    else if (!isGmail(val)) setErr('Please enter a valid Gmail address (must end in @gmail.com)');
    else                    setOk('Valid Gmail address ✓');
  } else if (type === 'password') {
    updatePwStrength(input, id);
  } else if (type === 'required') {
    if (val.length < 2) setErr('This field is required'); else setOk('');
  } else if (type === 'name') {
    if (val.length < 2) setErr('Enter at least 2 characters'); else setOk('');
  }
};

function updatePwStrength(input, baseId) {
  const val    = input.value;
  const fillId = baseId === 'su-password' ? 'pw-strength-fill' : 'fp-pw-fill';
  const hintId = baseId === 'su-password' ? 'pw-strength-hint' : null;
  const fill   = document.getElementById(fillId);
  const hint   = hintId ? document.getElementById(hintId) : null;
  let score = 0, msg = '', color = '';
  if (val.length >= 6) score++;
  if (val.length >= 8) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[^a-zA-Z0-9]/.test(val)) score++;
  if (score <= 1) { color = '#ef4444'; msg = 'Too weak — add more characters'; }
  else if (score === 2) { color = '#f97316'; msg = 'Weak — add a number'; }
  else if (score === 3) { color = '#eab308'; msg = 'Fair — add uppercase for more strength'; }
  else if (score === 4) { color = '#22c55e'; msg = 'Good password ✓'; }
  else                  { color = '#10b981'; msg = '✓ Strong password!'; }
  if (fill) { fill.style.width = (score / 5 * 100) + '%'; fill.style.background = color; }
  if (hint) { hint.textContent = msg; hint.style.color = color; }
  if (val.length === 0) {
    if (fill) fill.style.width = '0';
    if (hint) { hint.textContent = 'Use 8+ characters with at least one number'; hint.style.color = ''; }
    input.classList.remove('valid', 'invalid'); return;
  }
  if (score >= 3) input.classList.add('valid'),   input.classList.remove('invalid');
  else            input.classList.add('invalid'), input.classList.remove('valid');
}

window.checkConfirmPw = function () {
  const pw   = document.getElementById('su-password');
  const cpw  = document.getElementById('su-confirm-pw');
  const hint = document.getElementById('hint-su-confirm-pw');
  if (!pw || !cpw || !hint) return;
  if (!cpw.value) { hint.textContent = ''; hint.className = 'field-hint'; cpw.classList.remove('valid', 'invalid'); return; }
  if (pw.value === cpw.value) { hint.textContent = 'Passwords match ✓'; hint.className = 'field-hint ok';  cpw.classList.add('valid');   cpw.classList.remove('invalid'); }
  else                        { hint.textContent = 'Passwords do not match'; hint.className = 'field-hint err'; cpw.classList.add('invalid'); cpw.classList.remove('valid'); }
};

window.checkFpConfirm = function () {
  const pw   = document.getElementById('fp-newpw');
  const cpw  = document.getElementById('fp-confirmpw');
  const hint = document.getElementById('hint-fp-confirmpw');
  if (!pw || !cpw || !hint) return;
  if (!cpw.value) { hint.textContent = ''; cpw.classList.remove('valid', 'invalid'); return; }
  if (pw.value === cpw.value) { hint.textContent = 'Passwords match ✓'; hint.className = 'field-hint ok';  cpw.classList.add('valid');   cpw.classList.remove('invalid'); }
  else                        { hint.textContent = 'Passwords do not match'; hint.className = 'field-hint err'; cpw.classList.add('invalid'); cpw.classList.remove('valid'); }
};

// ── Modal open/close ──────────────────────────────────────────────────────
window.openAuth = function (tab) {
  tab = tab || 'signin';
  document.getElementById('auth-overlay').classList.add('open');
  switchAuthTab(tab);
  document.body.style.overflow = 'hidden';
};
window.closeAuth = function () {
  document.getElementById('auth-overlay').classList.remove('open');
  document.body.style.overflow = '';
  document.getElementById('signin-error').classList.remove('show');
  document.getElementById('signup-error').classList.remove('show');
};
window.handleAuthOverlayClick = function (e) { if (e.target.id === 'auth-overlay') closeAuth(); };

window.switchAuthTab = function (tab) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.auth-panel').forEach(p => p.classList.remove('active'));
  const tabEl   = document.getElementById('tab-'   + tab);
  const panelEl = document.getElementById('panel-' + tab);
  if (tabEl)   tabEl.classList.add('active');
  if (panelEl) panelEl.classList.add('active');
  if (tab === 'signin') {
    document.getElementById('auth-title').textContent = 'Welcome back';
    document.getElementById('auth-sub').textContent   = 'Sign in to your BartaFlow dashboard';
  } else {
    document.getElementById('auth-title').textContent = 'Create your account';
    document.getElementById('auth-sub').textContent   = 'Start your 14-day free trial — Gmail required';
  }
};

window.togglePw = function (id, btn) {
  const inp = document.getElementById(id);
  inp.type  = inp.type === 'password' ? 'text' : 'password';
  btn.textContent = inp.type === 'password' ? '👁' : '🙈';
};

function setAuthLoading(btnId, textId, loading, def, showSpinner) {
  const btn = document.getElementById(btnId);
  const txt = document.getElementById(textId);
  if (!btn || !txt) return;
  if (loading) { btn.classList.add('loading'); btn.disabled = true;  txt.innerHTML = showSpinner ? '<span class="spinner"></span> Please wait...' : 'Please wait...'; }
  else         { btn.classList.remove('loading'); btn.disabled = false; txt.innerHTML = def; }
}

// ── Sign In ───────────────────────────────────────────────────────────────
function showAuthSuccess(title, sub) {
  document.querySelectorAll('.auth-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('auth-title').textContent       = '🎉 Success!';
  document.getElementById('auth-sub').textContent         = '';
  document.getElementById('auth-success-title').textContent = title;
  document.getElementById('auth-success-sub').textContent   = sub;
  document.getElementById('panel-success').classList.add('active');
  document.querySelector('.auth-tabs').style.display = 'none';
  const pill = document.getElementById('admin-pill');
  if (pill) pill.classList.add('show');
  setTimeout(closeAuth, 2600);
  setTimeout(() => { document.querySelector('.auth-tabs').style.display = ''; }, 2800);
}
window.showAuthSuccess = showAuthSuccess;

window.doSignIn = function () {
  const email  = document.getElementById('si-email').value.trim().toLowerCase();
  const pwd    = document.getElementById('si-password').value;
  const errEl  = document.getElementById('signin-error');
  errEl.classList.remove('show');
  if (!email || !pwd) { errEl.textContent = 'Please enter your email and password.'; errEl.classList.add('show'); return; }
  setAuthLoading('signin-btn', 'signin-btn-text', true, 'Sign In to Dashboard', true);
  setTimeout(() => {
    const users = getUsers();
    const user  = users.find(u => u.email === email && u.password === hashPw(pwd));
    setAuthLoading('signin-btn', 'signin-btn-text', false, 'Sign In to Dashboard');
    if (user) {
      showAuthSuccess('Welcome back, ' + user.name + '!', 'You are now signed in. Redirecting to your dashboard...');
    } else {
      errEl.textContent = 'Incorrect email or password. Try: demo@gmail.com / Demo@1234';
      errEl.classList.add('show');
      document.getElementById('si-password').value = '';
    }
  }, 1200);
};

// ── Sign Up ───────────────────────────────────────────────────────────────
window.doSignUp = function () {
  const fname   = document.getElementById('su-fname').value.trim();
  const lname   = document.getElementById('su-lname')?.value.trim() || '';
  const email   = document.getElementById('su-email').value.trim().toLowerCase();
  const company = document.getElementById('su-company').value.trim();
  const pwd     = document.getElementById('su-password').value;
  const cpwd    = document.getElementById('su-confirm-pw').value;
  const agreed  = document.getElementById('agree-terms').checked;
  const errEl   = document.getElementById('signup-error');
  errEl.classList.remove('show');

  if (!fname)              { errEl.textContent = 'Please enter your first name.'; errEl.classList.add('show'); return; }
  if (!email)              { errEl.textContent = 'Please enter your Gmail address.'; errEl.classList.add('show'); return; }
  if (!isGmail(email))     { errEl.textContent = 'Please enter a valid Gmail address (must end in @gmail.com).'; errEl.classList.add('show'); return; }
  if (!company)            { errEl.textContent = 'Please enter your company name.'; errEl.classList.add('show'); return; }
  if (!pwd)                { errEl.textContent = 'Please choose a password.'; errEl.classList.add('show'); return; }
  if (pwd.length < 6)      { errEl.textContent = 'Password must be at least 6 characters.'; errEl.classList.add('show'); return; }
  if (!/[0-9]/.test(pwd)) { errEl.textContent = 'Password must contain at least one number (e.g. Password1).'; errEl.classList.add('show'); return; }
  if (pwd !== cpwd)        { errEl.textContent = 'Passwords do not match. Please re-enter.'; errEl.classList.add('show'); return; }
  if (!agreed)             { errEl.textContent = 'Please agree to the Terms of Service to continue.'; errEl.classList.add('show'); return; }

  const users = getUsers();
  if (users.find(u => u.email === email)) { errEl.textContent = 'An account with this Gmail already exists. Please sign in.'; errEl.classList.add('show'); return; }

  setAuthLoading('signup-btn', 'signup-btn-text', true, 'Create Free Account', true);
  setTimeout(() => {
    users.push({ email, password: hashPw(pwd), name: fname + (lname ? ' ' + lname : ''), company });
    saveUsers(users);
    saveLead({ name: fname + (lname ? ' ' + lname : ''), email, company, source: 'signup' });
    setAuthLoading('signup-btn', 'signup-btn-text', false, 'Create Free Account');

    document.querySelectorAll('.auth-panel').forEach(p => p.classList.remove('active'));
    document.getElementById('auth-title').textContent         = '🎉 Account Created!';
    document.getElementById('auth-sub').textContent           = '';
    document.getElementById('auth-success-title').textContent = 'Account created successfully!';
    document.getElementById('auth-success-sub').textContent   = 'Please log in with your new credentials.';
    document.getElementById('panel-success').classList.add('active');
    document.querySelector('.auth-tabs').style.display = 'none';
    showToast('✓', 'Account created! Please sign in to continue.');

    setTimeout(() => {
      document.querySelector('.auth-tabs').style.display = '';
      switchAuthTab('signin');
      document.getElementById('si-email').value           = email;
      document.getElementById('auth-title').textContent   = 'Welcome back';
      document.getElementById('auth-sub').textContent     = 'Account created! Please sign in.';
    }, 2200);
  }, 1600);
};

// Social login
window.socialLogin = function (provider) {
  setAuthLoading('signin-btn', 'signin-btn-text', true, 'Sign In', true);
  setTimeout(() => {
    setAuthLoading('signin-btn', 'signin-btn-text', false, 'Sign In to Dashboard');
    showAuthSuccess('Signed in via ' + provider + '!', 'Welcome to BartaFlow. Redirecting to your dashboard...');
  }, 1200);
};

// ── Forgot Password (Gmail + OTP + new password) ──────────────────────────
let fpCurrentEmail = '';
let fpGeneratedOtp = '';

window.showForgotPassword = function (e) {
  e.preventDefault();
  document.querySelectorAll('.auth-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('panel-forgot').classList.add('active');
  document.getElementById('auth-title').textContent = 'Reset Password';
  document.getElementById('auth-sub').textContent   = 'Enter your Gmail to receive a reset code';
  document.getElementById('fp-step-a').style.display = 'block';
  document.getElementById('fp-step-b').style.display = 'none';
  document.getElementById('fp-step-c').style.display = 'none';
};

window.doForgotPassword = function () {
  const emailEl = document.getElementById('fp-email');
  const email   = emailEl.value.trim().toLowerCase();
  const hint    = document.getElementById('hint-fp-email');
  if (!email)          { hint.textContent = 'Please enter your Gmail address'; hint.className = 'field-hint err'; return; }
  if (!isGmail(email)) { hint.textContent = 'Please enter a valid Gmail address (@gmail.com)'; hint.className = 'field-hint err'; emailEl.classList.add('invalid'); return; }
  setAuthLoading('fp-send-btn', 'fp-send-text', true, 'Send Reset OTP', true);
  const users = getUsers();
  setTimeout(() => {
    setAuthLoading('fp-send-btn', 'fp-send-text', false, 'Send Reset OTP');
    const exists = users.find(u => u.email === email);
    if (!exists) { hint.textContent = 'No account found for this Gmail. Did you mean to sign up?'; hint.className = 'field-hint err'; emailEl.classList.add('invalid'); return; }
    fpCurrentEmail  = email;
    fpGeneratedOtp  = String(Math.floor(100000 + Math.random() * 900000));
    document.getElementById('fp-email-display').textContent = email;
    document.getElementById('demo-otp-hint').textContent    = fpGeneratedOtp;
    document.getElementById('fp-step-a').style.display = 'none';
    document.getElementById('fp-step-b').style.display = 'block';
    document.querySelectorAll('.otp-box').forEach(b => { b.value = ''; b.classList.remove('filled'); });
    setTimeout(() => document.querySelector('.otp-box')?.focus(), 100);
    showToast('📧', 'OTP sent to ' + email + ' (demo OTP shown below)');
  }, 1400);
};

window.otpNext = function (input, index) {
  input.value = input.value.replace(/[^0-9]/g, '').slice(-1);
  if (input.value) input.classList.add('filled'); else input.classList.remove('filled');
  const boxes = document.querySelectorAll('.otp-box');
  if (input.value && index < 5) boxes[index + 1].focus();
};
document.addEventListener('keydown', e => {
  if (e.key === 'Backspace' && e.target.classList.contains('otp-box')) {
    const boxes = [...document.querySelectorAll('.otp-box')];
    const idx   = boxes.indexOf(e.target);
    if (!e.target.value && idx > 0) { boxes[idx - 1].focus(); boxes[idx - 1].value = ''; boxes[idx - 1].classList.remove('filled'); }
  }
});

window.verifyOtp = function () {
  const boxes   = document.querySelectorAll('.otp-box');
  const entered = [...boxes].map(b => b.value).join('');
  const errEl   = document.getElementById('otp-error');
  errEl.classList.remove('show');
  if (entered.length < 6) { errEl.textContent = 'Please enter all 6 digits.'; errEl.classList.add('show'); return; }
  if (entered !== fpGeneratedOtp) { errEl.textContent = 'Incorrect OTP. Please check the code and try again.'; errEl.classList.add('show'); boxes.forEach(b => b.classList.add('invalid')); return; }
  boxes.forEach(b => { b.classList.remove('invalid'); b.classList.add('filled'); });
  setTimeout(() => { document.getElementById('fp-step-b').style.display = 'none'; document.getElementById('fp-step-c').style.display = 'block'; }, 400);
};

window.doSetNewPassword = function () {
  const pw    = document.getElementById('fp-newpw').value;
  const cpw   = document.getElementById('fp-confirmpw').value;
  const errEl = document.getElementById('newpw-error');
  errEl.classList.remove('show');
  if (!pw)              { errEl.textContent = 'Please enter a new password.'; errEl.classList.add('show'); return; }
  if (pw.length < 6)    { errEl.textContent = 'Password must be at least 6 characters.'; errEl.classList.add('show'); return; }
  if (!/[0-9]/.test(pw)) { errEl.textContent = 'Password must contain at least one number.'; errEl.classList.add('show'); return; }
  if (pw !== cpw)       { errEl.textContent = 'Passwords do not match.'; errEl.classList.add('show'); return; }
  const users = getUsers();
  const idx   = users.findIndex(u => u.email === fpCurrentEmail);
  if (idx > -1) { users[idx].password = hashPw(pw); saveUsers(users); }
  showAuthSuccess('Password Updated!', 'Your password has been changed. Please sign in with your new password.');
  setTimeout(() => switchAuthTab('signin'), 2700);
};

// Attach live confirm-pw listener after DOM ready
(function () {
  const pw = document.getElementById('su-password');
  if (pw) { pw.addEventListener('input', function () { updatePwStrength(this, 'su-password'); window.checkConfirmPw(); }); }
})();
