// ── LEGAL MODAL (Terms of Service + Privacy Policy) ───────────────────────
var LEGAL_CONTENT = {
  tos: {
    title: 'Terms of Service',
    html:
      '<h2>Terms of Service</h2><div class="legal-date">Effective Date: 1 January 2025 · Last Updated: 1 April 2025</div>' +
      '<h3>1. Acceptance of Terms</h3><p>By accessing or using BartaFlow ("the Platform"), operated by BartaFlow Technologies Pvt. Ltd. ("we", "our", "us"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Platform.</p>' +
      '<h3>2. Description of Service</h3><p>BartaFlow provides an AI-powered WhatsApp Business automation platform including chatbot deployment, lead management, broadcast messaging, booking systems, and analytics. Services are offered on monthly or annual subscription basis.</p>' +
      '<h3>3. Eligibility</h3><p>You must be at least 18 years old and a registered business entity to use BartaFlow. By registering, you represent that all information provided is accurate and complete.</p>' +
      '<h3>4. Account Responsibilities</h3><ul><li>You are responsible for maintaining the security of your account credentials.</li><li>You must not share your login details with unauthorised persons.</li><li>You are responsible for all activity that occurs under your account.</li><li>Notify us immediately at security@bartaflow.in if you suspect unauthorised access.</li></ul>' +
      '<h3>5. Acceptable Use</h3><p>You agree not to use BartaFlow to:</p><ul><li>Send spam, unsolicited messages, or bulk messages without recipient consent</li><li>Violate WhatsApp Business API policies or Meta platform guidelines</li><li>Distribute illegal, defamatory, or harmful content</li><li>Reverse engineer, copy, or resell our software without written permission</li><li>Violate any applicable Indian or international law</li></ul>' +
      '<h3>6. WhatsApp API Compliance</h3><p>BartaFlow uses Meta\'s official WhatsApp Cloud API. You are solely responsible for ensuring all messaging complies with WhatsApp\'s Business and Commerce Policies. Violations may result in account suspension by Meta.</p>' +
      '<h3>7. Payment & Billing</h3><p>Subscription fees are billed monthly in advance. Setup fees are one-time and non-refundable. All prices are in Indian Rupees (INR) and exclusive of GST (18%). Failed payments may result in service suspension after 7 days.</p>' +
      '<h3>8. Refund Policy</h3><p>Monthly subscriptions may be cancelled anytime but are non-refundable for the current billing period. Setup fees are non-refundable. Free trial users may cancel without charge before the trial ends.</p>' +
      '<h3>9. Intellectual Property</h3><p>All platform code, design, AI models, and content remain the exclusive property of BartaFlow Technologies Pvt. Ltd. White-label clients receive a limited licence to use the Platform under their own branding.</p>' +
      '<h3>10. Limitation of Liability</h3><p>BartaFlow\'s total liability shall not exceed the fees paid in the 3 months preceding the claim. We are not liable for indirect, incidental, or consequential damages including lost revenue or data loss.</p>' +
      '<h3>11. Governing Law</h3><p>These terms are governed by Indian law. Disputes shall be subject to the exclusive jurisdiction of courts in Kolkata, West Bengal, India.</p>' +
      '<h3>12. Contact</h3><p>Questions about these Terms: legal@bartaflow.in · BartaFlow Technologies Pvt. Ltd., Kolkata, West Bengal 700001, India.</p>'
  },
  privacy: {
    title: 'Privacy Policy',
    html:
      '<h2>Privacy Policy</h2><div class="legal-date">Effective Date: 1 January 2025 · Last Updated: 1 April 2025</div>' +
      '<h3>1. Introduction</h3><p>BartaFlow Technologies Pvt. Ltd. is committed to protecting your privacy. This Policy explains how we collect, use, and protect your personal data in accordance with India\'s Digital Personal Data Protection (DPDP) Act 2023 and GDPR where applicable.</p>' +
      '<h3>2. Data We Collect</h3><ul><li><strong>Account data:</strong> Name, email, phone number, company name, GST number</li><li><strong>Usage data:</strong> Login times, features used, chatbot conversations, lead data</li><li><strong>Payment data:</strong> Billing details (card data processed by Razorpay — we do not store card numbers)</li><li><strong>Technical data:</strong> IP address, browser type, device information, cookies</li></ul>' +
      '<h3>3. How We Use Your Data</h3><ul><li>To provide and improve our services</li><li>To process payments and send invoices</li><li>To send transactional emails (OTP, receipts, onboarding)</li><li>To send marketing communications (with your consent)</li><li>To comply with legal obligations</li></ul>' +
      '<h3>4. Cookies</h3><p>We use essential cookies (required for the platform to function), analytics cookies (to understand usage patterns), and marketing cookies (to personalise your experience). You can manage your cookie preferences via the banner or by contacting us.</p>' +
      '<h3>5. Data Storage & Security</h3><p>Your data is stored on AWS servers located in India (ap-south-1 Mumbai region). We use AES-256 encryption at rest and TLS 1.3 in transit. Access is restricted to authorised personnel only.</p>' +
      '<h3>6. Data Sharing</h3><p>We do not sell your personal data. We may share data with:</p><ul><li>Razorpay (payment processing)</li><li>SendGrid (transactional email delivery)</li><li>OpenAI (AI processing — no personal data sent)</li><li>Meta / WhatsApp (message delivery)</li><li>Legal authorities when required by law</li></ul>' +
      '<h3>7. Your Rights</h3><p>Under DPDP Act 2023 and GDPR you have the right to: access your data, correct inaccurate data, delete your data, export your data (data portability), withdraw consent at any time, and lodge a complaint with the Data Protection Board of India.</p>' +
      '<h3>8. Data Retention</h3><p>Account data is retained while your subscription is active and for 2 years after cancellation. Payment records are retained for 7 years as required by Indian tax law. You may request earlier deletion at privacy@bartaflow.in.</p>' +
      '<h3>9. Children\'s Privacy</h3><p>BartaFlow is not intended for persons under 18. We do not knowingly collect data from minors.</p>' +
      '<h3>10. Contact Our DPO</h3><p>Data Protection Officer: privacy@bartaflow.in · BartaFlow Technologies Pvt. Ltd., Kolkata, West Bengal 700001, India. We respond to all privacy requests within 72 hours.</p>'
  }
};

var currentLegalTab = 'tos';

window.openLegal  = function (tab) { currentLegalTab = tab || 'tos'; renderLegalContent(currentLegalTab); document.getElementById('legal-overlay').classList.add('open'); document.body.style.overflow = 'hidden'; };
window.closeLegal = function ()    { document.getElementById('legal-overlay').classList.remove('open'); document.body.style.overflow = ''; };
window.switchLegal = function (tab) { currentLegalTab = tab; renderLegalContent(tab); };

function renderLegalContent(tab) {
  var content = LEGAL_CONTENT[tab];
  if (!content) return;
  document.getElementById('legal-title').textContent  = content.title;
  document.getElementById('legal-body').innerHTML     = content.html;
  document.getElementById('ltab-tos').classList.toggle('active',     tab === 'tos');
  document.getElementById('ltab-privacy').classList.toggle('active', tab === 'privacy');
}
