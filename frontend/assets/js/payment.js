// ── PAYMENT MODAL (Razorpay-style simulation) ────────────────────────────
// Depends on: utils.js (showToast), leads.js (saveLead), email.js (showEmailPreview)

var currentPlan      = {};
var currentPayMethod = 'card';

window.openPayment = function (planName, planDesc, monthlyAmt, setupAmt) {
  // Check current cycle from the UI
  const grid = document.getElementById('pricing-grid');
  const isYearly = grid && grid.classList.contains('yearly');
  
  let finalAmt = monthlyAmt;
  let finalDesc = planDesc;

  if (isYearly) {
    // If yearly, calculate the yearly total (with discount applied in the UI amounts)
    // We get the data-yearly from the card
    const card = Array.from(document.querySelectorAll('.price-card')).find(c => c.querySelector('.price-tier').textContent === planName);
    if (card) {
      const amtEl = card.querySelector('.price-amt');
      finalAmt = parseInt(amtEl.dataset.yearly.replace(/,/g, ''));
      finalDesc = "Yearly Plan (Discounted)";
    }
  }

  currentPlan = { 
    name: planName, 
    desc: finalDesc, 
    monthly: finalAmt, 
    setup: setupAmt, 
    isYearly: isYearly,
    subtotal: subtotal,
    total: total
  };

  document.getElementById('pay-plan-name').textContent  = planName + ' ' + (isYearly ? 'Yearly' : 'Monthly') + ' Plan';
  document.getElementById('pay-monthly-val').textContent = '₹' + subtotal.toLocaleString('en-IN') + (isYearly ? ' (12 months)' : '');
  document.getElementById('pay-setup-val').textContent   = '₹' + setupAmt.toLocaleString('en-IN');
  document.getElementById('pay-gst-val').textContent     = '₹' + gst.toLocaleString('en-IN');
  document.getElementById('pay-total-val').textContent   = '₹' + total.toLocaleString('en-IN');
  document.getElementById('pay-submit-text').textContent = 'Pay ₹' + total.toLocaleString('en-IN') + ' →';
  document.getElementById('pay-error').classList.remove('show');
  document.getElementById('pay-body').style.display    = 'block';
  document.getElementById('pay-success').style.display = 'none';
  selectPayMethod(document.querySelector('.pay-method'), 'card');

  document.getElementById('pay-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
};

window.closePayment = function () {
  document.getElementById('pay-overlay').classList.remove('open');
  document.body.style.overflow = '';
};

window.selectPayMethod = function (el, method) {
  currentPayMethod = method;
  document.querySelectorAll('.pay-method').forEach(function (m) { m.classList.remove('selected'); });
  if (el) el.classList.add('selected');
  document.getElementById('pay-card-form').style.display = method === 'card' ? 'block' : 'none';
  document.getElementById('pay-upi-form').style.display  = method === 'upi'  ? 'block' : 'none';
};

window.formatCard   = function (inp) { var v = inp.value.replace(/\D/g,'').substring(0,16); inp.value = v.replace(/(.{4})/g,'$1 ').trim(); };
window.formatExpiry = function (inp) { var v = inp.value.replace(/\D/g,''); if (v.length >= 2) v = v.substring(0,2) + ' / ' + v.substring(2,4); inp.value = v; };

window.processPayment = function () {
  var errEl = document.getElementById('pay-error');
  errEl.classList.remove('show');

  var name    = document.getElementById('bill-name').value.trim();
  var phone   = document.getElementById('bill-phone').value.trim();
  var email   = document.getElementById('bill-email').value.trim();
  var company = document.getElementById('bill-company').value.trim();

  if (!name || !phone || !email || !company) { errEl.textContent = 'Please fill in all billing information fields.'; errEl.classList.add('show'); return; }
  if (!/\S+@\S+\.\S+/.test(email))           { errEl.textContent = 'Please enter a valid email address.'; errEl.classList.add('show'); return; }

  if (currentPayMethod === 'card') {
    var cardNum  = document.getElementById('card-number').value.replace(/\s/g,'');
    var expiry   = document.getElementById('card-expiry').value;
    var cvv      = document.getElementById('card-cvv').value;
    var cardName = document.getElementById('card-name').value.trim();
    if (cardNum.length < 16 || !expiry || cvv.length < 3 || !cardName) { errEl.textContent = 'Please enter valid card details.'; errEl.classList.add('show'); return; }
  } else if (currentPayMethod === 'upi') {
    var upiId = document.getElementById('upi-id').value.trim();
    if (!upiId || !upiId.includes('@')) { errEl.textContent = 'Please enter a valid UPI ID (e.g. name@upi).'; errEl.classList.add('show'); return; }
  }

  var btn     = document.getElementById('pay-submit-btn');
  var btnText = document.getElementById('pay-submit-text');
  btn.disabled    = true;
  btnText.innerHTML = '<span class="spinner"></span> Processing...';

  setTimeout(function () {
    var ref   = 'BF' + Date.now().toString().slice(-8).toUpperCase();
    var total = currentPlan.total;
    var now   = new Date();

    saveLead({ name: name, email: email, phone: phone, company: company, source: 'payment', industry: currentPlan.name, goal: 'Purchased ' + currentPlan.name + ' plan' });

    document.getElementById('pay-body').style.display    = 'none';
    document.getElementById('pay-success').style.display = 'block';
    document.getElementById('pay-success-ref').innerHTML =
      '✅ Payment Reference: ' + ref + '\n' +
      '📦 Plan: BartaFlow ' + currentPlan.name + '\n' +
      '💰 Amount Paid: ₹' + total.toLocaleString('en-IN') + ' (incl. GST)\n' +
      '📅 Date: ' + now.toLocaleDateString('en-IN', { dateStyle: 'medium' }) + '\n' +
      '📧 Confirmation sent to: ' + email + '\n' +
      '⏱ Setup begins: Within 24 hours';

    showToast('✓', 'Payment successful! Welcome to BartaFlow ' + currentPlan.name + '!');

    setTimeout(function () {
      showEmailPreview('payment', [name, email, currentPlan.name, '₹' + total.toLocaleString('en-IN'), ref]);
    }, 1800);

    var pill = document.getElementById('admin-pill');
    if (pill) pill.classList.add('show');
  }, 2200);
};
