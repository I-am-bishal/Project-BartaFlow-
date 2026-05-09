// ── VOICE AGENT (Real AI call with Web Speech API) ────────────────────────
// Depends on: utils.js (showToast)

(function () {
  let vaState = {
    lang: 'en-IN', langName: 'English', gender: 'male', topic: 'sales',
    callActive: false, muted: false, speakerOn: true,
    callSeconds: 0, callTimer: null, currentUtterance: null,
    recognition: null, agentSpeaking: false, userSpeaking: false
  };

  // ── Conversation scripts ──────────────────────────────────────────────
  const SCRIPTS = {
    'en-IN': {
      greeting: "Hello! I'm Aria, your BartaFlow AI assistant. How can I help you today?",
      sales:      [["I'm interested in a 3BHK property.","Wonderful! May I know your preferred area — New Town, Salt Lake, or Rajarhat? And your budget range?"],["New Town, around 70 lakhs.","Perfect! We have a 1,380 sqft east-facing flat in New Town for ₹72 lakh — RERA approved, ready to move. Would you like a site visit?"],["Yes, book a site visit.","Excellent! Can I have your name and preferred day — Saturday or Sunday works best?"]],
      travel:     [["I want to book a Maldives trip.","Wonderful! Our 5 night 6 day Maldives package is ₹65,000 per person with flights and water villa. When would you like to travel?"],["December 15th, for 2 people.","Perfect! Total is ₹1,30,000 for 2. Shall I block the dates and send the itinerary on WhatsApp?"],["Yes please.","Done! You'll receive the itinerary and payment link within 10 minutes. Is there anything else?"]],
      health:     [["I need to see a cardiologist.","Of course. Dr. Sharma is available Monday at 10 AM or Wednesday at 3 PM. Which works for you?"],["Monday 10 AM.","Confirmed! Appointment booked for Monday at 10 AM. You'll receive a WhatsApp confirmation. Shall I share your previous reports with Dr. Sharma?"],["Yes please.","Done! Records shared securely. Please arrive 15 minutes early. Anything else I can help with?"]],
      ecom:       [["Where is my order?","Sure! Please share your order number and I'll track it right away."],["Order BF-2847.","Found it! Your order left our Delhi warehouse this morning and will be delivered by 6 PM today. Shall I send the live tracking link on WhatsApp?"],["Yes.","Sent! Your tracking link is on WhatsApp. Anything else I can help with?"]],
      edu:        [["Tell me about your UPSC coaching.","We offer a 12-month UPSC program with 200+ live class hours, weekly tests and personal mentorship for ₹35,000. Would you like a free demo class?"],["Yes, when is the next one?","This Saturday at 11 AM. May I have your name and mobile number to register you?"],["Arjun, 9876543210.","Registered! Reminder and joining link will be sent to 9876543210. Is there anything else?"]],
      bartaflow:  [["Tell me about BartaFlow.","BartaFlow automates your WhatsApp business with AI — handling leads, bookings, sales and support 24/7 in 12+ languages. What industry is your business in?"],["I run a travel agency.","Our travel package starts at ₹2,499/month — GPT-4 chatbot, automated booking, lead capture and broadcast. Live in 48 hours. Would you like a free demo?"],["Yes, book a demo.","Excellent! May I have your name and email? We'll send a Google Meet invite right away."]],
    },
    'hi-IN': {
      greeting: "नमस्ते! मैं आरिया हूँ, BartaFlow की AI असिस्टेंट। आज मैं आपकी कैसे मदद कर सकती हूँ?",
      sales:     [["मुझे एक 3BHK फ्लैट चाहिए।","बहुत बढ़िया! आप किस इलाके में ढूंढ रहे हैं — न्यू टाउन, साल्ट लेक, या राजारहाट? बजट क्या है?"],["न्यू टाउन में, लगभग 70 लाख।","शानदार! न्यू टाउन में 1,380 वर्ग फुट का पूर्वमुखी फ्लैट है 72 लाख में। RERA अप्रूव्ड। साइट विजिट बुक करूँ?"],["हाँ।","बिल्कुल! आपका नाम और पसंदीदा दिन बताएं — शनिवार या रविवार?"]],
      travel:    [["मुझे मालदीव जाना है।","बहुत खूब! 5 रात 6 दिन का पैकेज ₹65,000 प्रति व्यक्ति है, फ्लाइट और वाटर विला सहित। कब जाना चाहते हैं?"],["15 दिसंबर, 2 लोगों के लिए।","बढ़िया! कुल ₹1,30,000। तारीखें ब्लॉक करूँ और WhatsApp पर itinerary भेजूँ?"],["हाँ।","हो गया! 10 मिनट में payment link और itinerary मिलेगा।"]],
      health:    [["कार्डियोलॉजिस्ट से मिलना है।","बिल्कुल। डॉ. शर्मा सोमवार 10 बजे या बुधवार 3 बजे उपलब्ध हैं।"],["सोमवार 10 बजे।","कन्फर्म! अपॉइंटमेंट बुक हो गई।"],["धन्यवाद।","स्वागत है! 15 मिनट पहले पहुँचें।"]],
      ecom:      [["मेरा ऑर्डर कहाँ है?","ज़रूर! ऑर्डर नंबर बताएं।"],["BF-2847।","मिल गया! आज शाम 6 बजे तक डिलीवरी होगी।"],["हाँ।","WhatsApp पर tracking link भेज दिया!"]],
      edu:       [["UPSC कोचिंग के बारे में बताएं।","12 महीने का प्रोग्राम ₹35,000 में — 200+ घंटे live classes। Free demo?"],["हाँ।","शनिवार 11 बजे। नाम और मोबाइल नंबर दें।"],["अर्जुन, 9876543210।","रजिस्टर हो गए!"]],
      bartaflow: [["BartaFlow क्या है?","WhatsApp AI platform — 24/7, 12+ भाषाओं में। आपका business किस industry में है?"],["Travel agency।","₹2,499/month से शुरू। 48 घंटे में live। Free demo?"],["हाँ।","नाम और email दें।"]],
    },
    'bn-IN': {
      greeting: "নমস্কার! আমি আরিয়া, BartaFlow-এর AI সহকারী। আজ কীভাবে সাহায্য করতে পারি?",
      sales:     [["3BHK ফ্ল্যাট দরকার।","চমৎকার! কোন এলাকায়? বাজেট কত?"],["নিউ টাউন, ৭০ লাখে।","দারুণ! ৭২ লাখে RERA অনুমোদিত ফ্ল্যাট আছে। সাইট ভিজিট?"],["হ্যাঁ।","অবশ্যই! নাম ও দিন বলুন।"]],
      travel:    [["মালদ্বীপ যেতে চাই।","অসাধারণ! ৬৫,০০০/জন, ফ্লাইটসহ। কখন?"],["১৫ ডিসেম্বর, ২ জন।","মোট ১,৩০,০০০। তারিখ ব্লক করব?"],["হ্যাঁ।","হয়েছে!"]],
      health:    [["কার্ডিওলজিস্ট দরকার।","সোমবার ১০টা বা বুধবার ৩টা।"],["সোমবার।","বুক হয়েছে!"],["ধন্যবাদ।","স্বাগতম!"]],
      ecom:      [["অর্ডার কোথায়?","নম্বর বলুন।"],["BF-2847।","আজ ৬টায় ডেলিভারি।"],["হ্যাঁ।","ট্র্যাকিং লিংক পাঠানো হলো!"]],
      edu:       [["কোচিং সম্পর্কে বলুন।","১২ মাস, ৩৫,০০০ টাকা। ডেমো?"],["হ্যাঁ।","শনিবার ১১টায়। নাম ও নম্বর?"],["অর্জুন, ৯৮৭৬৫৪৩২১০।","নিবন্ধন হলো!"]],
      bartaflow: [["BartaFlow কী?","WhatsApp AI platform — ২৪/৭। কোন শিল্পে?"],["ট্র্যাভেল এজেন্সি।","২,৪৯৯ টাকা/মাস। ডেমো?"],["হ্যাঁ।","নাম ও ইমেইল দিন।"]],
    },
  };

  const getGreeting = lang  => SCRIPTS[lang]?.greeting || SCRIPTS['en-IN'].greeting;
  const getScript   = (lang, topic) => SCRIPTS[lang]?.[topic] || SCRIPTS['en-IN'][topic] || SCRIPTS['en-IN'].bartaflow;

  const synth = window.speechSynthesis;
  let voices  = [];
  const loadVoices = () => { voices = synth ? synth.getVoices() : []; };
  if (synth) { loadVoices(); if (speechSynthesis.onvoiceschanged !== undefined) speechSynthesis.onvoiceschanged = loadVoices; }

  function pickVoice(lang, gender) {
    if (!voices.length) loadVoices();
    let pool = voices.filter(v => v.lang.startsWith(lang.split('-')[0]));
    if (!pool.length) pool = voices.filter(v => v.lang.startsWith('en'));
    if (!pool.length) return null;
    const fKeys = ['female','woman','girl','zira','susan','karen','samantha','victoria','moira','fiona','tessa','veena','heera','lekha','raveena'];
    const mKeys = ['male','man','david','mark','daniel','alex','fred','rishi','google','thomas'];
    if (gender === 'female') { const f = pool.find(v => fKeys.some(k => v.name.toLowerCase().includes(k))); return f || pool[pool.length - 1]; }
    return pool.find(v => mKeys.some(k => v.name.toLowerCase().includes(k))) || pool[0];
  }

  function speak(text, onEnd) {
    if (!synth) { if (onEnd) onEnd(); return; }
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = vaState.lang; u.rate = 0.93; u.pitch = vaState.gender === 'female' ? 1.12 : 0.87;
    u.volume = vaState.speakerOn && !vaState.muted ? 1 : 0;
    const v = pickVoice(vaState.lang, vaState.gender); if (v) u.voice = v;
    u.onstart = () => { vaState.agentSpeaking = true;  document.getElementById('va-agent-av')?.classList.add('speaking'); };
    u.onend = u.onerror = () => { vaState.agentSpeaking = false; document.getElementById('va-agent-av')?.classList.remove('speaking'); if (onEnd) onEnd(); };
    synth.speak(u); vaState.currentUtterance = u;
  }

  function buildWave(id, color, n) {
    const c = document.getElementById(id); if (!c) return; c.innerHTML = '';
    for (var i = 0; i < n; i++) { var b = document.createElement('div'); b.className = 'va-bar'; b.style.cssText = 'background:' + color + ';width:3px;height:4px;border-radius:3px'; c.appendChild(b); }
  }
  function animateWave(id, active, max) {
    document.querySelectorAll('#' + id + ' .va-bar').forEach(b => { b.style.height = active ? (4 + Math.random() * (max || 32)) + 'px' : '4px'; });
  }
  function addMsg(role, text) {
    const tr = document.getElementById('va-transcript'); if (!tr) return;
    const d  = document.createElement('div'); d.className = 'va-msg ' + (role === 'agent' ? 'agent' : 'user');
    d.innerHTML = '<div class="va-msg-role">' + (role === 'agent' ? 'AI AGENT' : 'YOU') + '</div><div class="va-msg-text">' + text + '</div>';
    tr.appendChild(d); tr.scrollTop = tr.scrollHeight;
  }
  function showTyping() { const tr = document.getElementById('va-transcript'); if (!tr) return; const d = document.createElement('div'); d.className = 'va-typing-msg'; d.id = 'va-typing'; d.innerHTML = '<div class="va-typing-dot"></div><div class="va-typing-dot"></div><div class="va-typing-dot"></div>'; tr.appendChild(d); tr.scrollTop = tr.scrollHeight; }
  function hideTyping() { document.getElementById('va-typing')?.remove(); }
  function setStatus(s) { const p = document.getElementById('va-status-pill'), t = document.getElementById('va-status-text'); if (!p||!t) return; p.className = 'va-call-status-pill ' + s; t.textContent = s.toUpperCase(); }
  function showStep(s) { ['setup','topic','call'].forEach(n => { document.getElementById('va-step-' + n).style.display = n === s ? 'block' : 'none'; }); }

  window.openVoiceAgent  = () => { document.getElementById('va-overlay').classList.add('open'); document.body.style.overflow = 'hidden'; showStep('setup'); loadVoices(); };
  window.closeVoiceAgent = () => { endVoiceCall(); document.getElementById('va-overlay').classList.remove('open'); document.body.style.overflow = ''; };
  window.backToSetup     = () => showStep('setup');
  window.goToTopicSelect = () => showStep('topic');

  window.selectLang  = function (btn) { document.querySelectorAll('.va-lang-btn').forEach(b => b.classList.remove('selected')); btn.classList.add('selected'); vaState.lang = btn.dataset.lang; vaState.langName = btn.dataset.name; };
  window.selectVoice = function (g) {
    vaState.gender = g;
    const mc = document.getElementById('va-card-male'), fc = document.getElementById('va-card-female');
    mc.className = 'va-voice-card male'   + (g === 'male'   ? ' selected' : '');
    fc.className = 'va-voice-card female' + (g === 'female' ? ' selected' : '');
    const mck = mc.querySelector('.va-voice-check'), fck = fc.querySelector('.va-voice-check');
    if (mck) mck.textContent = g === 'male'   ? '✓' : '';
    if (fck) fck.textContent = g === 'female' ? '✓' : '';
  };
  window.selectTopic = function (card) { document.querySelectorAll('.va-topic-card').forEach(c => c.classList.remove('selected')); card.classList.add('selected'); vaState.topic = card.dataset.topic; };

  let convStep = 0, convScript = [];
  window.startAICall = function () {
    showStep('call'); convStep = 0; convScript = getScript(vaState.lang, vaState.topic);
    const av = document.getElementById('va-agent-av');
    av.className = 'va-agent-av ' + vaState.gender;
    document.getElementById('va-agent-emoji').textContent       = vaState.gender === 'female' ? '👩' : '👨';
    document.getElementById('va-agent-name').textContent        = vaState.gender === 'female' ? 'Aria (BartaFlow AI)' : 'Aryan (BartaFlow AI)';
    document.getElementById('va-agent-lang-display').textContent = vaState.langName + ' · ' + (vaState.gender === 'female' ? 'Female' : 'Male') + ' Voice';
    buildWave('va-agent-wave', 'var(--gold)', 36); buildWave('va-user-wave', '#60a5fa', 36);
    vaState.callActive = true; vaState.callSeconds = 0;
    document.getElementById('va-transcript').innerHTML = '';
    setStatus('connecting');
    vaState.callTimer = setInterval(() => {
      vaState.callSeconds++;
      const m = String(Math.floor(vaState.callSeconds / 60)).padStart(2,'0'), s = String(vaState.callSeconds % 60).padStart(2,'0');
      const el = document.getElementById('va-call-timer'); if (el) el.textContent = m + ':' + s;
      if (vaState.agentSpeaking) animateWave('va-agent-wave', true, 36); else animateWave('va-agent-wave', false);
      if (vaState.userSpeaking)  animateWave('va-user-wave',  true, 28); else animateWave('va-user-wave',  false);
    }, 100);
    setTimeout(() => {
      setStatus('active');
      const greeting = getGreeting(vaState.lang);
      showTyping();
      setTimeout(() => { hideTyping(); addMsg('agent', greeting); speak(greeting); }, 800);
    }, 1200);
  };

  function processInput(text) {
    if (!text.trim() || !vaState.callActive) return;
    vaState.userSpeaking = true; addMsg('user', text); setTimeout(() => vaState.userSpeaking = false, 600);
    const step  = convScript[convStep];
    const reply = step ? step[1] : (vaState.lang === 'hi-IN' ? 'मैं समझ गई। क्या और कुछ जानना चाहते हैं?' : vaState.lang === 'bn-IN' ? 'বুঝেছি। আর কিছু জানতে চান?' : 'I understand. Is there anything else I can help you with?');
    if (step) convStep++;
    showTyping(); setTimeout(() => { hideTyping(); addMsg('agent', reply); speak(reply); }, 900 + Math.random() * 400);
  }

  window.sendVoiceMsg = function () { const inp = document.getElementById('va-text-input'); if (!inp||!inp.value.trim()) return; const t = inp.value.trim(); inp.value = ''; processInput(t); };

  let micOn = false;
  window.toggleMic = function () {
    if (!vaState.callActive) return;
    const SR  = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { showToast('⚠️', 'Speech recognition not supported. Please type your message.'); return; }
    const btn = document.getElementById('va-mic-btn');
    if (micOn) { vaState.recognition?.stop(); micOn = false; btn.classList.remove('listening'); btn.textContent = '🎙️'; return; }
    micOn = true; btn.classList.add('listening'); btn.textContent = '🔴';
    const rec = new SR(); vaState.recognition = rec; rec.lang = vaState.lang; rec.interimResults = false;
    rec.onresult = e => { const t = e.results[0][0].transcript; document.getElementById('va-text-input').value = t; micOn = false; btn.classList.remove('listening'); btn.textContent = '🎙️'; vaState.userSpeaking = true; setTimeout(() => { sendVoiceMsg(); vaState.userSpeaking = false; }, 200); };
    rec.onerror = rec.onend = () => { micOn = false; btn.classList.remove('listening'); btn.textContent = '🎙️'; };
    rec.start(); showToast('🎙️', 'Listening... speak now');
  };

  window.toggleMute    = function () { vaState.muted = !vaState.muted; const c = document.getElementById('va-mute-circle'); if (c) { c.textContent = vaState.muted ? '🔕' : '🔇'; c.classList.toggle('active', vaState.muted); } showToast(vaState.muted ? '🔕' : '🔇', vaState.muted ? 'Microphone muted' : 'Microphone unmuted'); };
  window.toggleSpeaker = function () { vaState.speakerOn = !vaState.speakerOn; const c = document.getElementById('va-spk-circle'); if (c) c.textContent = vaState.speakerOn ? '🔊' : '🔈'; showToast(vaState.speakerOn ? '🔊' : '🔈', vaState.speakerOn ? 'Speaker on' : 'Speaker off'); };

  window.endVoiceCall = function () {
    synth?.cancel(); vaState.recognition?.stop();
    if (vaState.callTimer) clearInterval(vaState.callTimer);
    vaState.callActive = vaState.agentSpeaking = vaState.userSpeaking = false; micOn = false;
    setStatus('ended');
    const bye = vaState.lang === 'hi-IN' ? 'धन्यवाद! BartaFlow को call करने के लिए शुक्रिया। आपका दिन शुभ हो!' : vaState.lang === 'bn-IN' ? 'ধন্যবাদ! BartaFlow-কে call করার জন্য কৃতজ্ঞ। শুভ দিন!' : 'Thank you for calling BartaFlow! Have a wonderful day. Goodbye!';
    addMsg('agent', bye);
    animateWave('va-agent-wave', false); animateWave('va-user-wave', false);
    const mic = document.getElementById('va-mic-btn'); if (mic) { mic.classList.remove('listening'); mic.textContent = '🎙️'; }
    setTimeout(() => { closeVoiceAgent(); showStep('setup'); convStep = 0; }, 2200);
    showToast('📵', 'Call ended. Thank you!');
  };

  document.addEventListener('keydown', e => { if (e.key === 'Escape' && document.getElementById('va-overlay')?.classList.contains('open')) closeVoiceAgent(); });
  selectVoice('male');

  // ── Waveform & Call timer for the static call simulator ─────────────────
  (function () {
    const wf = document.getElementById('waveform');
    if (wf) {
      for (let i = 0; i < 36; i++) {
        const bar = document.createElement('div');
        bar.className  = 'wbar' + (i % 5 === 2 ? ' ai-wave' : '');
        bar.style.height            = (8 + Math.random() * 24) + 'px';
        bar.style.animationDuration = (0.7 + Math.random() * 0.8) + 's';
        bar.style.animationDelay   = (Math.random() * 0.5) + 's';
        wf.appendChild(bar);
      }
    }

    const timerEl = document.getElementById('cs-timer');
    if (timerEl) {
      let s = 154;
      setInterval(() => {
        s++;
        const m = Math.floor(s / 60), sec = s % 60;
        timerEl.textContent = `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')} · AI handling call`;
      }, 1000);
    }
  })();
})();

// ── Simulate new call on hangup ───────────────────────────────────────────
function simulateNewCall() {
  const t = document.getElementById('cs-transcript');
  if (t) t.innerHTML = '<div class="ct-line ct-ai" style="color:rgba(255,165,0,.8);font-size:10px;font-family:\'DM Mono\',monospace;padding:8px;text-align:center">Connecting new call...</div>';
  setTimeout(() => {
    if (t) t.innerHTML = `
<div class="ct-line ct-user"><span class="ct-speaker">CALLER</span>Hi, I'm looking for a coaching class for my daughter — Class 12 Science.</div>
<div class="ct-line ct-ai"><span class="ct-speaker">AI AGENT</span>Hello! We have excellent Class 12 Science batches starting this week. Is she targeting JEE, NEET, or boards only?</div>
<div class="ct-line ct-user"><span class="ct-speaker">CALLER</span>NEET — she wants to be a doctor.</div>
<div class="ct-line ct-ai"><span class="ct-speaker">AI AGENT</span>Great! Our NEET batch has a 94% success rate last year. Next demo class is Saturday 10 AM. Shall I register her?</div>`;
  }, 1500);
}
window.simulateNewCall = simulateNewCall;
