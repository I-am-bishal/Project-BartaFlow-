// ── EMAIL SIMULATION SYSTEM (SendGrid-style preview) ──────────────────────
// Depends on: utils.js (showToast)

var EMAIL_TEMPLATES = {
  welcome: function (name, email) {
    return {
      to: email,
      subject: 'Welcome to BartaFlow — Your account is ready! 🎉',
      body:
        '<strong>Hello, ' + name + '!</strong><br><br>' +
        'Your BartaFlow account has been successfully created. You\'re now on your <strong>14-day free trial</strong> of the Professional plan.<br><br>' +
        'Here\'s what happens next:<br>' +
        '✅ Our onboarding team will contact you within 24 hours<br>' +
        '✅ Your WhatsApp Business API setup begins immediately<br>' +
        '✅ You\'ll be live and taking leads in 48 hours<br><br>' +
        '<strong>Your login credentials:</strong><br>' +
        '📧 Email: ' + email + '<br>' +
        '🔗 Dashboard: <span style="color:var(--navy)">dashboard.bartaflow.in</span><br><br>' +
        'If you need help, reply to this email or WhatsApp us at +91 98765 43210.',
      btnText: 'Access Your Dashboard →',
      note: 'Triggered by: User Registration · Provider: SendGrid · Template ID: tmpl_welcome_001'
    };
  },
  otp: function (name, email, otp) {
    return {
      to: email,
      subject: 'BartaFlow — Your password reset OTP: ' + otp,
      body:
        '<strong>Hello, ' + name + '!</strong><br><br>' +
        'You requested a password reset for your BartaFlow account.<br><br>' +
        'Your One-Time Password is:<br><br>' +
        '<span style="font-size:28px;font-family:\'DM Mono\',monospace;font-weight:700;letter-spacing:6px;color:var(--navy)">' + otp + '</span><br><br>' +
        'This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.<br><br>' +
        'If you did not request this reset, please ignore this email or contact security@bartaflow.in immediately.',
      btnText: 'Reset My Password →',
      note: 'Triggered by: Forgot Password · Provider: SendGrid · Expires in: 10 minutes'
    };
  },
  payment: function (name, email, plan, amount, ref) {
    return {
      to: email,
      subject: 'BartaFlow — Payment Confirmed! Your ' + plan + ' plan is active 🚀',
      body:
        '<strong>Hello, ' + name + '!</strong><br><br>' +
        'Your payment has been received and your BartaFlow <strong>' + plan + ' Plan</strong> is now active.<br><br>' +
        '<strong>Payment Details:</strong><br>' +
        '🧾 Reference: <span style="font-family:\'DM Mono\',monospace">' + ref + '</span><br>' +
        '💰 Amount Paid: <strong>' + amount + '</strong><br>' +
        '📅 Next Billing: ' + getNextBillingDate() + '<br><br>' +
        'Your GST invoice has been attached to this email. Our onboarding team will contact you within 2 hours to begin your setup.',
      btnText: 'View Your Invoice →',
      note: 'Triggered by: Payment Success · Provider: SendGrid · Gateway: Razorpay · Invoice attached'
    };
  },
  demo: function (name, email, date, time) {
    return {
      to: email,
      subject: 'Demo Confirmed — ' + date + ' at ' + time + ' IST 📅',
      body:
        '<strong>Hello, ' + name + '!</strong><br><br>' +
        'Your BartaFlow product demo is confirmed!<br><br>' +
        '📅 <strong>Date:</strong> ' + date + '<br>' +
        '🕐 <strong>Time:</strong> ' + time + ' IST (30 minutes)<br>' +
        '🎥 <strong>Format:</strong> Google Meet<br>' +
        '👤 <strong>Host:</strong> Rahul — BartaFlow Team<br><br>' +
        'Your Google Meet link: <span style="font-family:\'DM Mono\',monospace;color:var(--navy)">meet.google.com/xxx-xxxx-xxx</span><br><br>' +
        'We\'ll send you a reminder 30 minutes before. See you then!',
      btnText: 'Add to Calendar →',
      note: 'Triggered by: Demo Booking · Provider: SendGrid + Google Calendar API · Reminder scheduled'
    };
  }
};

function getNextBillingDate() {
  var d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

window.showEmailPreview = function (type, params) {
  var tmpl = EMAIL_TEMPLATES[type];
  if (!tmpl) return;
  var data = tmpl.apply(null, params);
  var now  = new Date();
  document.getElementById('em-to').textContent      = data.to;
  document.getElementById('em-date').textContent    = now.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  document.getElementById('em-subject').textContent = data.subject;
  document.getElementById('em-preview-body').innerHTML = data.body + '<br><a class="em-preview-btn">' + (data.btnText || 'Open Dashboard →') + '</a>';
  document.getElementById('em-note').textContent    = '📌 Demo mode: ' + (data.note || '');
  document.getElementById('email-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
};

window.closeEmailModal = function () {
  document.getElementById('email-overlay').classList.remove('open');
  document.body.style.overflow = '';
};

// ── Hook: show welcome email after signup ─────────────────────────────────
var _origShowAuthSuccess = window.showAuthSuccess;
window.showAuthSuccess = function (title, sub) {
  if (_origShowAuthSuccess) _origShowAuthSuccess(title, sub);
  if (title && (title.indexOf('Account') !== -1 || title.indexOf('Welcome,') !== -1)) {
    var emailEl = document.getElementById('su-email');
    var fnameEl = document.getElementById('su-fname');
    if (emailEl && emailEl.value) {
      var name = (fnameEl && fnameEl.value) ? fnameEl.value : 'User';
      setTimeout(function () { showEmailPreview('welcome', [name, emailEl.value.trim()]); }, 2800);
    }
  }
};

// ── Hook: show OTP email on forgot password ───────────────────────────────
var _origDoForgotPassword = window.doForgotPassword;
window.doForgotPassword = function () {
  if (_origDoForgotPassword) _origDoForgotPassword();
  setTimeout(function () {
    var emailEl  = document.getElementById('fp-email');
    var otpHint  = document.getElementById('demo-otp-hint');
    if (emailEl && emailEl.value && otpHint && otpHint.textContent) {
      showEmailPreview('otp', ['User', emailEl.value.trim(), otpHint.textContent]);
    }
  }, 1600);
};

// ── Hook: show confirmation email on demo booking ─────────────────────────
var _origConfirmDemo = window.confirmDemo;
window.confirmDemo = function () {
  if (_origConfirmDemo) _origConfirmDemo();
  setTimeout(function () {
    var emailEl = document.getElementById('ds-email');
    var fnameEl = document.getElementById('ds-fname');
    var cfDate  = document.getElementById('cf-date');
    var cfTime  = document.getElementById('cf-time');
    if (emailEl && emailEl.value && cfDate) {
      var name = (fnameEl && fnameEl.value) ? fnameEl.value : 'User';
      showEmailPreview('demo', [name, emailEl.value.trim(), cfDate.textContent, cfTime ? cfTime.textContent : '10:00 AM IST']);
    }
  }, 1600);
};
