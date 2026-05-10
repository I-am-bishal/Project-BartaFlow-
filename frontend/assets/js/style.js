// ── THREE.JS HERO — deferred so it never blocks initial page paint ─────
      (function () {
        // Use requestIdleCallback if available, else short setTimeout
        var initThree = function () {
          const c = document.getElementById('hero-canvas');
          if (!c || typeof THREE === 'undefined') return;
          const W = c.offsetWidth || 600, H = c.offsetHeight || 520;
          const renderer = new THREE.WebGLRenderer({ canvas: c, antialias: true, alpha: true });
          renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
          renderer.setSize(W, H);
          const scene = new THREE.Scene();
          const cam = new THREE.PerspectiveCamera(55, W / H, 0.1, 100);
          cam.position.z = 6;

          // Central AI sphere — wireframe icosahedron
          const sGeo = new THREE.IcosahedronGeometry(1.5, 3);
          const sEdge = new THREE.EdgesGeometry(sGeo);
          const sMat = new THREE.LineBasicMaterial({ color: 0xc9a84c, transparent: true, opacity: 0.25 });
          const sphere = new THREE.LineSegments(sEdge, sMat);
          scene.add(sphere);

          // Inner glow sphere
          const igSphere = new THREE.Mesh(
            new THREE.SphereGeometry(1.3, 32, 32),
            new THREE.MeshBasicMaterial({ color: 0xc9a84c, transparent: true, opacity: 0.04 })
          );
          scene.add(igSphere);

          // Orbital rings (navy = light color for dark bg)
          const ringData = [
            { r: 2.2, op: 0.2, color: 0x4a8cf7, rx: Math.PI / 2.5, speed: 0.005 },
            { r: 2.8, op: 0.15, color: 0xc9a84c, rx: Math.PI / 4, speed: -0.003 },
            { r: 3.4, op: 0.1, color: 0x6ee7b7, rx: Math.PI / 6, speed: 0.002 },
            { r: 4.0, op: 0.07, color: 0xfbbf24, rx: Math.PI / 8, speed: -0.0015 },
          ];
          const rings = ringData.map(d => {
            const mesh = new THREE.Mesh(
              new THREE.TorusGeometry(d.r, 0.015, 8, 120),
              new THREE.MeshBasicMaterial({ color: d.color, transparent: true, opacity: d.op })
            );
            mesh.rotation.x = d.rx;
            mesh.userData.speed = d.speed;
            scene.add(mesh);
            return mesh;
          });

          // Orbiting dots
          const dotColors = [0xc9a84c, 0x4a8cf7, 0x6ee7b7, 0xf43f5e, 0x8b5cf6];
          const dots = dotColors.map((col, i) => {
            const m = new THREE.Mesh(
              new THREE.SphereGeometry(0.05, 8, 8),
              new THREE.MeshBasicMaterial({ color: col })
            );
            m.userData = { r: 2.2 + (i % 4) * 0.6, speed: 0.5 + i * 0.15, offset: (i / 5) * Math.PI * 2, ring: i % 4 };
            scene.add(m);
            return m;
          });

          // Floating particles
          const pGeo = new THREE.BufferGeometry();
          const pPos = new Float32Array(400 * 3);
          for (let i = 0; i < 400; i++) {
            pPos[i * 3] = (Math.random() - 0.5) * 14;
            pPos[i * 3 + 1] = (Math.random() - 0.5) * 10;
            pPos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;
          }
          pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
          scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({ size: 0.04, color: 0xffffff, transparent: true, opacity: 0.18 })));

          // Mouse
          let mx = 0, my = 0;
          document.addEventListener('mousemove', e => {
            mx = (e.clientX / innerWidth - 0.5) * 2;
            my = (e.clientY / innerHeight - 0.5) * 2;
          });

          let t = 0;
          (function tick() {
            requestAnimationFrame(tick);
            t += 0.01;
            sphere.rotation.y += 0.004;
            sphere.rotation.x += 0.001;
            igSphere.rotation.y += 0.004;
            rings.forEach(r => r.rotation.z += r.userData.speed);
            dots.forEach(d => {
              const rData = ringData[d.userData.ring];
              const angle = t * d.userData.speed + d.userData.offset;
              const ry = rData.rx;
              d.position.x = d.userData.r * Math.cos(angle);
              d.position.y = d.userData.r * Math.sin(angle) * Math.cos(ry);
              d.position.z = d.userData.r * Math.sin(angle) * Math.sin(ry);
            });
            cam.position.x += (mx * 0.4 - cam.position.x) * 0.04;
            cam.position.y += (-my * 0.3 - cam.position.y) * 0.04;
            cam.lookAt(0, 0, 0);
            renderer.render(scene, cam);
          })();

          window.addEventListener('resize', () => {
            const W2 = c.offsetWidth, H2 = c.offsetHeight;
            cam.aspect = W2 / H2;
            cam.updateProjectionMatrix();
            renderer.setSize(W2, H2);
          });
        }; // end initThree
        if (window.requestIdleCallback) { requestIdleCallback(initThree, { timeout: 2000 }); }
        else { setTimeout(initThree, 200); }
      })();

    // ── COUNTERS ──────────────────────────────────────────────────────────
    function animCount(id, target, suffix = '') {
      const el = document.getElementById(id);
      if (!el) return;
      let v = 0;
      const iv = setInterval(() => {
        v += target / 70;
        if (v >= target) { el.textContent = target.toLocaleString() + suffix; clearInterval(iv); return; }
        el.textContent = Math.floor(v).toLocaleString() + suffix;
      }, 28);
    }
    setTimeout(() => {
      animCount('h1', 50000, '+');
      animCount('h2', 500, '+');
      animCount('hmetric', 127);
    }, 600);

    // ── WAVEFORM ──────────────────────────────────────────────────────────
    (function () {
      const wf = document.getElementById('waveform');
      if (!wf) return;
      for (let i = 0; i < 36; i++) {
        const bar = document.createElement('div');
        bar.className = 'wbar' + (i % 5 === 2 ? ' ai-wave' : '');
        bar.style.height = (8 + Math.random() * 24) + 'px';
        bar.style.animationDuration = (0.7 + Math.random() * 0.8) + 's';
        bar.style.animationDelay = (Math.random() * 0.5) + 's';
        wf.appendChild(bar);
      }
    })();

    // ── CALL TIMER ────────────────────────────────────────────────────────
    (function () {
      const el = document.getElementById('cs-timer');
      if (!el) return;
      let s = 154;
      setInterval(() => {
        s++;
        const m = Math.floor(s / 60), sec = s % 60;
        el.textContent = `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')} · AI handling call`;
      }, 1000);
    })();

    function simulateNewCall() {
      const t = document.getElementById('cs-transcript');
      if (t) { t.innerHTML = '<div class="ct-line ct-ai" style="color:rgba(255,165,0,.8);font-size:10px;font-family:\'DM Mono\',monospace;padding:8px;text-align:center">Connecting new call...</div>'; }
      setTimeout(() => {
        if (t) {
          t.innerHTML = `
      <div class="ct-line ct-user"><span class="ct-speaker">CALLER</span>Hi, I'm looking for a coaching class for my daughter — Class 12 Science.</div>
      <div class="ct-line ct-ai"><span class="ct-speaker">AI AGENT</span>Hello! We have excellent Class 12 Science batches starting this week. Is she targeting JEE, NEET, or boards only?</div>
      <div class="ct-line ct-user"><span class="ct-speaker">CALLER</span>NEET — she wants to be a doctor.</div>
      <div class="ct-line ct-ai"><span class="ct-speaker">AI AGENT</span>Great! Our NEET batch has a 94% success rate last year. Next demo class is Saturday 10 AM. Shall I register her?</div>
    `;
        }
      }, 1500);
    }

    // ── DEMO MODAL ────────────────────────────────────────────────────────
    let currentBotConversation = [];
    let currentBotName = '';

    function openDemo(name, icon, industry, features, conversation) {
      document.getElementById('m-name').textContent = name;
      document.getElementById('m-icon').textContent = icon;
      document.getElementById('m-industry').textContent = industry.toUpperCase() + ' · INTERACTIVE DEMO';
      currentBotName = name;
      currentBotConversation = conversation;

      const chat = document.getElementById('demo-chat');
      chat.innerHTML = '';

      // Replay initial conversation
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
      const div = document.createElement('div');
      div.className = 'dc-msg ' + (isUser ? 'dc-in' : 'dc-out');
      if (!isUser) div.innerHTML = '<span class="dc-ai">AI RESPONSE</span>' + text;
      else div.textContent = text;
      chat.appendChild(div);
      chat.scrollTop = chat.scrollHeight;
    }

    function sendDemoMsg() {
      const inp = document.getElementById('demo-input');
      const txt = inp.value.trim();
      if (!txt) return;
      appendDemoMsg(txt, true);
      inp.value = '';

      // AI reply simulation
      const replies = [
        "Great question! I can help you with that right away.",
        "Absolutely! Let me check that for you and get back in just a moment.",
        "Thank you for sharing that. Based on what you've told me, I have a perfect solution for you.",
        "Noted! I'll process your request now. Is there anything else you'd like to know?",
        "That's a popular choice! I'll arrange the details and send you a confirmation shortly.",
        "Understood. Let me connect you with the right information. Just a moment please!"
      ];
      const reply = replies[Math.floor(Math.random() * replies.length)];
      setTimeout(() => appendDemoMsg(reply, false), 900);
    }

    function closeModal(e) { if (e.target.id === 'modal') closeModalDirect(); }
    function closeModalDirect() { document.getElementById('modal').classList.remove('open'); }

    // ════════════════════════════════════════
    // UPGRADE v2 · AUTH SYSTEM (Gmail-only, confirm pw, OTP reset, auto-redirect)
    // ════════════════════════════════════════

    /* ── In-memory user store (localStorage persisted) ── */
    function getUsers() { try { return JSON.parse(localStorage.getItem('bf_users') || '[]'); } catch (e) { return []; } }
    function saveUsers(u) { localStorage.setItem('bf_users', JSON.stringify(u)); }

    /* Seed demo users if store empty */
    (function () {
      if (getUsers().length === 0) {
        saveUsers([
          { email: 'demo@gmail.com', password: hashPw('Demo@1234'), name: 'Demo User', company: 'BartaFlow Demo' },
          { email: 'admin@gmail.com', password: hashPw('Admin@123'), name: 'Admin', company: 'BartaFlow' }
        ]);
      }
    })();

    /* Simple hash (XOR fold — not cryptographic, purely front-end simulation) */
    function hashPw(pw) {
      let h = 5381;
      for (let i = 0; i < pw.length; i++) h = (h * 33) ^ pw.charCodeAt(i);
      return (h >>> 0).toString(16);
    }

    /* ── Validation helpers ── */
    const GMAIL_RE = /^[a-zA-Z0-9._%+\-]+@gmail\.com$/;
    const PW_STRONG_RE = /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/;
    const PW_MIN_RE = /^.{6,}$/;

    function isGmail(email) { return GMAIL_RE.test(email.trim()); }
    function isPwStrong(pw) { return PW_STRONG_RE.test(pw); }

    /* Real-time field validator — called oninput */
    window.validateField = function (input, type) {
      const id = input.id;
      const hint = document.getElementById('hint-' + id);
      const icon = document.getElementById('icon-' + id);
      const val = input.value.trim();

      const setOk = (msg) => {
        input.classList.remove('invalid'); input.classList.add('valid');
        if (hint) { hint.textContent = msg || ''; hint.className = 'field-hint ok'; }
        if (icon) icon.textContent = '✓';
      };
      const setErr = (msg) => {
        input.classList.remove('valid'); input.classList.add('invalid');
        if (hint) { hint.textContent = msg; hint.className = 'field-hint err'; }
        if (icon) icon.textContent = '✕';
      };
      const setNeutral = (msg) => {
        input.classList.remove('valid', 'invalid');
        if (hint) { hint.textContent = msg || ''; hint.className = 'field-hint neutral'; }
        if (icon) icon.textContent = '';
      };

      if (!val) { setNeutral(type === 'gmail' ? 'Must be a valid Gmail address (@gmail.com)' : ''); return; }

      if (type === 'gmail') {
        if (!val.includes('@')) { setNeutral('Keep typing...'); }
        else if (!isGmail(val)) { setErr('Please enter a valid Gmail address (must end in @gmail.com)'); }
        else { setOk('Valid Gmail address ✓'); }
      } else if (type === 'password') {
        updatePwStrength(input, id);
      } else if (type === 'required') {
        if (val.length < 2) setErr('This field is required');
        else setOk('');
      } else if (type === 'name') {
        if (val.length < 2) setErr('Enter at least 2 characters');
        else setOk('');
      }
    };

    function updatePwStrength(input, baseId) {
      const val = input.value;
      const fillId = baseId === 'su-password' ? 'pw-strength-fill' : 'fp-pw-fill';
      const hintId = baseId === 'su-password' ? 'pw-strength-hint' : null;
      const fill = document.getElementById(fillId);
      const hint = hintId ? document.getElementById(hintId) : null;
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
      else { color = '#10b981'; msg = '✓ Strong password!'; }
      if (fill) { fill.style.width = (score / 5 * 100) + '%'; fill.style.background = color; }
      if (hint) { hint.textContent = msg; hint.style.color = color; }
      if (val.length === 0) {
        if (fill) { fill.style.width = '0'; } if (hint) { hint.textContent = 'Use 8+ characters with at least one number'; hint.style.color = ''; }
        input.classList.remove('valid', 'invalid'); return;
      }
      if (score >= 3) input.classList.add('valid'), input.classList.remove('invalid');
      else input.classList.add('invalid'), input.classList.remove('valid');
    }

    /* Confirm password live check */
    window.checkConfirmPw = function () {
      const pw = document.getElementById('su-password');
      const cpw = document.getElementById('su-confirm-pw');
      const hint = document.getElementById('hint-su-confirm-pw');
      if (!pw || !cpw || !hint) return;
      if (!cpw.value) { hint.textContent = ''; hint.className = 'field-hint'; cpw.classList.remove('valid', 'invalid'); return; }
      if (pw.value === cpw.value) { hint.textContent = 'Passwords match ✓'; hint.className = 'field-hint ok'; cpw.classList.add('valid'); cpw.classList.remove('invalid'); }
      else { hint.textContent = 'Passwords do not match'; hint.className = 'field-hint err'; cpw.classList.add('invalid'); cpw.classList.remove('valid'); }
    };

    window.checkFpConfirm = function () {
      const pw = document.getElementById('fp-newpw');
      const cpw = document.getElementById('fp-confirmpw');
      const hint = document.getElementById('hint-fp-confirmpw');
      if (!pw || !cpw || !hint) return;
      if (!cpw.value) { hint.textContent = ''; cpw.classList.remove('valid', 'invalid'); return; }
      if (pw.value === cpw.value) { hint.textContent = 'Passwords match ✓'; hint.className = 'field-hint ok'; cpw.classList.add('valid'); cpw.classList.remove('invalid'); }
      else { hint.textContent = 'Passwords do not match'; hint.className = 'field-hint err'; cpw.classList.add('invalid'); cpw.classList.remove('valid'); }
    };

    /* ── Modal open/close (unchanged API) ── */
    window.openAuth = function (tab = 'signin') {
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
      const tabEl = document.getElementById('tab-' + tab);
      const panelEl = document.getElementById('panel-' + tab);
      if (tabEl) tabEl.classList.add('active');
      if (panelEl) panelEl.classList.add('active');
      if (tab === 'signin') { document.getElementById('auth-title').textContent = 'Welcome back'; document.getElementById('auth-sub').textContent = 'Sign in to your BartaFlow dashboard'; }
      else { document.getElementById('auth-title').textContent = 'Create your account'; document.getElementById('auth-sub').textContent = 'Start your 14-day free trial — Gmail required'; }
    };

    window.togglePw = function (id, btn) {
      const inp = document.getElementById(id);
      inp.type = inp.type === 'password' ? 'text' : 'password';
      btn.textContent = inp.type === 'password' ? '👁' : '🙈';
    };

    function setAuthLoading(btnId, textId, loading, def, showSpinner) {
      const btn = document.getElementById(btnId); const txt = document.getElementById(textId);
      if (!btn || !txt) return;
      if (loading) {
        btn.classList.add('loading'); btn.disabled = true;
        txt.innerHTML = showSpinner ? '<span class="spinner"></span> Please wait...' : 'Please wait...';
      } else {
        btn.classList.remove('loading'); btn.disabled = false;
        txt.innerHTML = def;
      }
    }

    /* ── Sign In ── */
    function showAuthSuccess(title, sub) {
      document.querySelectorAll('.auth-panel').forEach(p => p.classList.remove('active'));
      document.getElementById('auth-title').textContent = '🎉 Success!';
      document.getElementById('auth-sub').textContent = '';
      document.getElementById('auth-success-title').textContent = title;
      document.getElementById('auth-success-sub').textContent = sub;
      document.getElementById('panel-success').classList.add('active');
      document.querySelector('.auth-tabs').style.display = 'none';
      const pill = document.getElementById('admin-pill');
      if (pill) pill.classList.add('show');
      setTimeout(closeAuth, 2600);
      setTimeout(() => { document.querySelector('.auth-tabs').style.display = ''; }, 2800);
    }

    window.doSignIn = function () {
      const email = document.getElementById('si-email').value.trim().toLowerCase();
      const pwd = document.getElementById('si-password').value;
      const errEl = document.getElementById('signin-error');
      errEl.classList.remove('show');
      if (!email || !pwd) { errEl.textContent = 'Please enter your email and password.'; errEl.classList.add('show'); return; }
      setAuthLoading('signin-btn', 'signin-btn-text', true, 'Sign In to Dashboard', true);
      setTimeout(() => {
        const users = getUsers();
        const user = users.find(u => u.email === email && u.password === hashPw(pwd));
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

    /* ── Sign Up (Gmail-only, confirm pw, auto-redirect to Sign In) ── */
    window.doSignUp = function () {
      const fname = document.getElementById('su-fname').value.trim();
      const lname = document.getElementById('su-lname')?.value.trim() || '';
      const email = document.getElementById('su-email').value.trim().toLowerCase();
      const company = document.getElementById('su-company').value.trim();
      const pwd = document.getElementById('su-password').value;
      const cpwd = document.getElementById('su-confirm-pw').value;
      const agreed = document.getElementById('agree-terms').checked;
      const errEl = document.getElementById('signup-error');
      errEl.classList.remove('show');

      /* Validate all fields */
      if (!fname) { errEl.textContent = 'Please enter your first name.'; errEl.classList.add('show'); return; }
      if (!email) { errEl.textContent = 'Please enter your Gmail address.'; errEl.classList.add('show'); return; }
      if (!isGmail(email)) { errEl.textContent = 'Please enter a valid Gmail address (must end in @gmail.com).'; errEl.classList.add('show'); return; }
      if (!company) { errEl.textContent = 'Please enter your company name.'; errEl.classList.add('show'); return; }
      if (!pwd) { errEl.textContent = 'Please choose a password.'; errEl.classList.add('show'); return; }
      if (pwd.length < 6) { errEl.textContent = 'Password must be at least 6 characters.'; errEl.classList.add('show'); return; }
      if (!PW_MIN_RE.test(pwd)) { errEl.textContent = 'Password too short — minimum 6 characters.'; errEl.classList.add('show'); return; }
      if (!/[0-9]/.test(pwd)) { errEl.textContent = 'Password must contain at least one number (e.g. Password1).'; errEl.classList.add('show'); return; }
      if (pwd !== cpwd) { errEl.textContent = 'Passwords do not match. Please re-enter.'; errEl.classList.add('show'); return; }
      if (!agreed) { errEl.textContent = 'Please agree to the Terms of Service to continue.'; errEl.classList.add('show'); return; }

      /* Check duplicate */
      const users = getUsers();
      if (users.find(u => u.email === email)) { errEl.textContent = 'An account with this Gmail already exists. Please sign in.'; errEl.classList.add('show'); return; }

      setAuthLoading('signup-btn', 'signup-btn-text', true, 'Create Free Account', true);
      setTimeout(() => {
        /* Store user */
        users.push({ email, password: hashPw(pwd), name: fname + (lname ? ' ' + lname : ''), company });
        saveUsers(users);
        saveLead({ name: fname + (lname ? ' ' + lname : ''), email, company, source: 'signup' });
        setAuthLoading('signup-btn', 'signup-btn-text', false, 'Create Free Account');

        /* Show success then AUTO-REDIRECT to Sign In (per spec: do NOT keep logged in) */
        document.querySelectorAll('.auth-panel').forEach(p => p.classList.remove('active'));
        document.getElementById('auth-title').textContent = '🎉 Account Created!';
        document.getElementById('auth-sub').textContent = '';
        document.getElementById('auth-success-title').textContent = 'Account created successfully!';
        document.getElementById('auth-success-sub').textContent = 'Please log in with your new credentials.';
        document.getElementById('panel-success').classList.add('active');
        document.querySelector('.auth-tabs').style.display = 'none';
        showToast('✓', 'Account created! Please sign in to continue.');

        /* After 2s → switch to Sign In tab */
        setTimeout(() => {
          document.querySelector('.auth-tabs').style.display = '';
          switchAuthTab('signin');
          document.getElementById('si-email').value = email;
          document.getElementById('auth-title').textContent = 'Welcome back';
          document.getElementById('auth-sub').textContent = 'Account created! Please sign in.';
        }, 2200);
      }, 1600);
    };

    /* Social login */
    window.socialLogin = function (provider) {
      setAuthLoading('signin-btn', 'signin-btn-text', true, 'Sign In', true);
      setTimeout(() => {
        setAuthLoading('signin-btn', 'signin-btn-text', false, 'Sign In to Dashboard');
        showAuthSuccess('Signed in via ' + provider + '!', 'Welcome to BartaFlow. Redirecting to your dashboard...');
      }, 1200);
    };

    /* ── Forgot Password (Gmail + OTP + new password) ── */
    let fpCurrentEmail = '';
    let fpGeneratedOtp = '';

    window.showForgotPassword = function (e) {
      e.preventDefault();
      document.querySelectorAll('.auth-panel').forEach(p => p.classList.remove('active'));
      document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
      document.getElementById('panel-forgot').classList.add('active');
      document.getElementById('auth-title').textContent = 'Reset Password';
      document.getElementById('auth-sub').textContent = 'Enter your Gmail to receive a reset code';
      /* Reset steps */
      document.getElementById('fp-step-a').style.display = 'block';
      document.getElementById('fp-step-b').style.display = 'none';
      document.getElementById('fp-step-c').style.display = 'none';
    };

    window.doForgotPassword = function () {
      const emailEl = document.getElementById('fp-email');
      const email = emailEl.value.trim().toLowerCase();
      const hint = document.getElementById('hint-fp-email');
      if (!email) { hint.textContent = 'Please enter your Gmail address'; hint.className = 'field-hint err'; return; }
      if (!isGmail(email)) { hint.textContent = 'Please enter a valid Gmail address (@gmail.com)'; hint.className = 'field-hint err'; emailEl.classList.add('invalid'); return; }
      const users = getUsers();
      setAuthLoading('fp-send-btn', 'fp-send-text', true, 'Send Reset OTP', true);
      setTimeout(() => {
        setAuthLoading('fp-send-btn', 'fp-send-text', false, 'Send Reset OTP');
        const exists = users.find(u => u.email === email);
        if (!exists) {
          hint.textContent = 'No account found for this Gmail. Did you mean to sign up?';
          hint.className = 'field-hint err'; emailEl.classList.add('invalid'); return;
        }
        fpCurrentEmail = email;
        fpGeneratedOtp = String(Math.floor(100000 + Math.random() * 900000));
        document.getElementById('fp-email-display').textContent = email;
        document.getElementById('demo-otp-hint').textContent = fpGeneratedOtp;
        document.getElementById('fp-step-a').style.display = 'none';
        document.getElementById('fp-step-b').style.display = 'block';
        /* Clear OTP boxes */
        document.querySelectorAll('.otp-box').forEach(b => { b.value = ''; b.classList.remove('filled'); });
        setTimeout(() => document.querySelector('.otp-box')?.focus(), 100);
        showToast('📧', 'OTP sent to ' + email + ' (demo OTP shown below)');
      }, 1400);
    };

    /* OTP auto-advance */
    window.otpNext = function (input, index) {
      input.value = input.value.replace(/[^0-9]/g, '').slice(-1);
      if (input.value) { input.classList.add('filled'); }
      else { input.classList.remove('filled'); }
      const boxes = document.querySelectorAll('.otp-box');
      if (input.value && index < 5) boxes[index + 1].focus();
      /* Backspace support via keydown */
    };
    document.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && e.target.classList.contains('otp-box')) {
        const boxes = [...document.querySelectorAll('.otp-box')];
        const idx = boxes.indexOf(e.target);
        if (!e.target.value && idx > 0) { boxes[idx - 1].focus(); boxes[idx - 1].value = ''; boxes[idx - 1].classList.remove('filled'); }
      }
    });

    window.verifyOtp = function () {
      const boxes = document.querySelectorAll('.otp-box');
      const entered = [...boxes].map(b => b.value).join('');
      const errEl = document.getElementById('otp-error');
      errEl.classList.remove('show');
      if (entered.length < 6) { errEl.textContent = 'Please enter all 6 digits.'; errEl.classList.add('show'); return; }
      if (entered !== fpGeneratedOtp) { errEl.textContent = 'Incorrect OTP. Please check the code and try again.'; errEl.classList.add('show'); boxes.forEach(b => b.classList.add('invalid')); return; }
      boxes.forEach(b => { b.classList.remove('invalid'); b.classList.add('filled'); });
      setTimeout(() => {
        document.getElementById('fp-step-b').style.display = 'none';
        document.getElementById('fp-step-c').style.display = 'block';
      }, 400);
    };

    window.doSetNewPassword = function () {
      const pw = document.getElementById('fp-newpw').value;
      const cpw = document.getElementById('fp-confirmpw').value;
      const errEl = document.getElementById('newpw-error');
      errEl.classList.remove('show');
      if (!pw) { errEl.textContent = 'Please enter a new password.'; errEl.classList.add('show'); return; }
      if (pw.length < 6) { errEl.textContent = 'Password must be at least 6 characters.'; errEl.classList.add('show'); return; }
      if (!/[0-9]/.test(pw)) { errEl.textContent = 'Password must contain at least one number.'; errEl.classList.add('show'); return; }
      if (pw !== cpw) { errEl.textContent = 'Passwords do not match.'; errEl.classList.add('show'); return; }
      const users = getUsers();
      const idx = users.findIndex(u => u.email === fpCurrentEmail);
      if (idx > -1) { users[idx].password = hashPw(pw); saveUsers(users); }
      showAuthSuccess('Password Updated!', 'Your password has been changed. Please sign in with your new password.');
      setTimeout(() => switchAuthTab('signin'), 2700);
    };

    // ════════════════════════════════════════
    // UPGRADE v2 · DATA.CSV VIEWER
    // ════════════════════════════════════════
    let csvData = { headers: [], rows: [], filename: '' };
    let csvSortCol = -1, csvSortAsc = true;

    window.openCsvViewer = function () {
      document.getElementById('csv-overlay').classList.add('open');
      document.body.style.overflow = 'hidden';
    };
    window.closeCsvViewer = function () {
      document.getElementById('csv-overlay').classList.remove('open');
      document.body.style.overflow = '';
    };

    window.handleCsvDrop = function (e) {
      e.preventDefault();
      document.getElementById('csv-upload-area').classList.remove('drag');
      const file = e.dataTransfer.files[0];
      if (file) handleCsvFile(file);
    };
    window.handleCsvFile = function (file) {
      if (!file) { showCsvError('No file selected.'); return; }
      if (!file.name.match(/\.(csv|txt)$/i)) { showCsvError('Invalid file type. Please upload a .csv or .txt file.'); return; }
      if (file.size === 0) { showCsvError('The file is empty. Please upload a CSV with data.'); return; }
      if (file.size > 5 * 1024 * 1024) { showCsvError('File too large (max 5MB). Please upload a smaller CSV.'); return; }
      const reader = new FileReader();
      reader.onload = e => parseCsv(e.target.result, file.name);
      reader.onerror = () => showCsvError('Could not read file. Please try again.');
      reader.readAsText(file);
    };

    function parseCsv(text, filename) {
      try {
        const lines = text.trim().split(/\r?\n/).filter(l => l.trim());
        if (!lines.length) { showCsvError('The file is empty or has no readable rows.'); return; }
        /* Parse with quote handling */
        const parseRow = row => {
          const cells = []; let cur = '', inQ = false;
          for (let i = 0; i < row.length; i++) {
            const c = row[i];
            if (c === '"') { if (inQ && row[i + 1] === '"') { cur += '"'; i++; } else inQ = !inQ; }
            else if (c === ',' && !inQ) { cells.push(cur.trim()); cur = ''; }
            else cur += c;
          }
          cells.push(cur.trim());
          return cells;
        };
        const headers = parseRow(lines[0]);
        if (headers.length < 1) { showCsvError('Could not detect column headers in the first row.'); return; }
        const rows = lines.slice(1).map(l => parseRow(l));
        if (!rows.length) { showCsvError('The CSV has headers but no data rows.'); return; }
        csvData = { headers, rows, filename: filename || 'data.csv' };
        renderCsvTable(csvData.rows);
        showToast('📊', 'Loaded ' + rows.length + ' rows from ' + csvData.filename);
      } catch (err) {
        showCsvError('Invalid CSV format: ' + err.message);
      }
    }

    window.loadSampleCsv = function () {
      const sample = `Name,Email,Company,Industry,Plan,Status,Revenue
Priya Rathod,priya@gmail.com,TravelMate Agency,Travel & Tourism,Professional,Active,₹2499
Arjun Mehta,arjun@gmail.com,FashionHub,E-Commerce,Enterprise,Active,₹4999
Sunita Kapoor,sunita@gmail.com,CarePoint Clinics,Healthcare,Professional,Active,₹2499
Raj Verma,raj@gmail.com,BrightMind Coaching,Education,Starter,Trial,₹999
Meena Sharma,meena@gmail.com,SpiceRoute Restaurant,Restaurant,Starter,Active,₹999
Karan Patel,karan@gmail.com,PropFirst Realty,Real Estate,Enterprise,Active,₹4999
Divya Singh,divya@gmail.com,FinEdge Advisors,Finance,Professional,Active,₹2499
Rohit Das,rohit@gmail.com,AutoDrive Motors,Automotive,Professional,Active,₹2499
Neha Joshi,neha@gmail.com,TalentFlow HR,HR & Recruitment,Starter,Active,₹999
Amit Kumar,amit@gmail.com,SwiftShip Logistics,Logistics,Enterprise,Paused,₹4999`;
      parseCsv(sample, 'sample-data.csv');
    };

    function renderCsvTable(rows, filter = '') {
      const main = document.getElementById('csv-main-content');
      if (!main) return;
      const h = csvData.headers; const filename = csvData.filename;
      let filtered = filter
        ? rows.filter(r => r.some(c => (c || '').toLowerCase().includes(filter.toLowerCase())))
        : rows;

      /* Sort */
      if (csvSortCol >= 0) {
        filtered = [...filtered].sort((a, b) => {
          const av = a[csvSortCol] || '', bv = b[csvSortCol] || '';
          const n = parseFloat(av.replace(/[^0-9.]/g, '')), m = parseFloat(bv.replace(/[^0-9.]/g, ''));
          if (!isNaN(n) && !isNaN(m)) return csvSortAsc ? n - m : m - n;
          return csvSortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
        });
      }

      document.getElementById('csv-subtitle').textContent = filename + ' · ' + csvData.rows.length + ' rows · ' + h.length + ' columns';
      main.innerHTML = `
    <div class="csv-toolbar">
      <input class="csv-search-box" placeholder="🔍 Search in data..." oninput="renderCsvTable(csvData.rows,this.value)" value="${escHtml(filter)}">
      <div class="csv-info-pill">${filtered.length} / ${csvData.rows.length} rows</div>
      <button class="csv-export-btn" onclick="exportCsvData()">⬇ Export CSV</button>
      <button class="csv-export-btn" style="background:var(--text3)" onclick="resetCsvViewer()">↺ Load New</button>
    </div>
    <div class="csv-body">
      ${filtered.length === 0 ? `<div class="csv-empty"><div class="csv-empty-icon">🔍</div>No rows match your search.</div>` : `
      <table class="csv-table">
        <thead><tr>${h.map((col, i) => `<th onclick="sortCsvCol(${i})" class="${csvSortCol === i ? 'sorted' : ''}">${escHtml(col)}<span class="sort-arrow">${csvSortCol === i ? (csvSortAsc ? '↑' : '↓') : '↕'}</span></th>`).join('')}</tr></thead>
        <tbody>${filtered.map(row => `<tr>${h.map((_, i) => `<td title="${escHtml(row[i] || '')}">${escHtml(row[i] || '—')}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>`}
    </div>`;
    }

    window.sortCsvCol = function (col) {
      if (csvSortCol === col) csvSortAsc = !csvSortAsc;
      else { csvSortCol = col; csvSortAsc = true; }
      renderCsvTable(csvData.rows, document.querySelector('.csv-search-box')?.value || '');
    };
    window.exportCsvData = function () {
      if (!csvData.rows.length) { showToast('⚠️', 'No data to export'); return; }
      const lines = [csvData.headers.join(','), ...csvData.rows.map(r => r.map(c => '"' + (c || '').replace(/"/g, '""') + '"').join(','))];
      const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'bartaflow-export-' + Date.now() + '.csv'; a.click();
      URL.revokeObjectURL(url);
      showToast('⬇', 'Exported ' + csvData.rows.length + ' rows');
    };
    window.resetCsvViewer = function () {
      csvData = { headers: [], rows: [], filename: '' };
      csvSortCol = -1; csvSortAsc = true;
      document.getElementById('csv-subtitle').textContent = 'Upload or load data.csv';
      const main = document.getElementById('csv-main-content');
      main.innerHTML = `<div class="csv-upload-area" id="csv-upload-area" ondragover="event.preventDefault();this.classList.add('drag')" ondragleave="this.classList.remove('drag')" ondrop="handleCsvDrop(event)">
    <div class="csv-upload-icon">📁</div><div class="csv-upload-title">Load your data.csv file</div>
    <div class="csv-upload-sub">Drag & drop a CSV file here, or click to browse.<br>Supports any CSV with headers in the first row.</div>
    <input type="file" id="csv-file-input" accept=".csv,.txt" style="display:none" onchange="handleCsvFile(this.files[0])">
    <button class="csv-upload-btn" onclick="document.getElementById('csv-file-input').click()">📂 Browse File</button>
    <button class="csv-sample-btn" onclick="loadSampleCsv()">Load Sample Data</button>
  </div>`;
    };
    function showCsvError(msg) {
      const main = document.getElementById('csv-main-content');
      const esc = escHtml(msg);
      main.innerHTML = `<div class="csv-error-box"><span style="font-size:18px;flex-shrink:0">⚠️</span><div><strong>Error loading file</strong><br>${esc}</div></div>
    <div class="csv-upload-area" id="csv-upload-area" ondragover="event.preventDefault();this.classList.add('drag')" ondragleave="this.classList.remove('drag')" ondrop="handleCsvDrop(event)">
    <div class="csv-upload-icon">📁</div><div class="csv-upload-title">Try another file</div>
    <div class="csv-upload-sub">Please check the file and try again, or load sample data.</div>
    <input type="file" id="csv-file-input" accept=".csv,.txt" style="display:none" onchange="handleCsvFile(this.files[0])">
    <button class="csv-upload-btn" onclick="document.getElementById('csv-file-input').click()">📂 Browse File</button>
    <button class="csv-sample-btn" onclick="loadSampleCsv()">Load Sample Data</button>
  </div>`;
    }

    // Keep old password strength listener for compatibility
    (function () {
      const pw = document.getElementById('su-password');
      if (pw) {
        pw.addEventListener('input', function () { updatePwStrength(this, 'su-password'); checkConfirmPw(); });
      }
    })();


    // ════════════════════════════════════════
    // SCHEDULE DEMO MODAL
    // ════════════════════════════════════════
    let dsSelectedDate = null, dsSelectedTime = null, dsCurrentMonth, dsCurrentYear;
    const TIME_SLOTS = ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM'];
    const UNAVAIL = ['9:30 AM', '11:30 AM', '2:30 PM', '4:30 PM'];
    const MONTHS_AR = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    function openDemoSched() {
      document.getElementById('demo-sched-overlay').classList.add('open');
      document.body.style.overflow = 'hidden';
      const now = new Date(); dsCurrentMonth = now.getMonth(); dsCurrentYear = now.getFullYear();
      renderCal(); renderSlots(); goToStep(1, true);
    }
    function closeDemoSched() {
      document.getElementById('demo-sched-overlay').classList.remove('open');
      document.body.style.overflow = '';
      dsSelectedDate = null; dsSelectedTime = null;
      const n = document.getElementById('ds-next1'); if (n) { n.disabled = true; n.style.opacity = '.4'; }
      const si = document.querySelector('.ds-step-indicator'); if (si) si.style.display = '';
    }
    function handleDemoOverlayClick(e) { if (e.target.id === 'demo-sched-overlay') closeDemoSched(); }
    function renderCal() {
      document.getElementById('cal-month-label').textContent = MONTHS_AR[dsCurrentMonth] + ' ' + dsCurrentYear;
      const grid = document.getElementById('cal-days'); grid.innerHTML = '';
      const firstDay = new Date(dsCurrentYear, dsCurrentMonth, 1).getDay();
      const days = new Date(dsCurrentYear, dsCurrentMonth + 1, 0).getDate();
      const today = new Date(); today.setHours(0, 0, 0, 0);
      for (let i = 0; i < firstDay; i++) { const d = document.createElement('button'); d.className = 'cal-day empty'; d.disabled = true; grid.appendChild(d); }
      for (let i = 1; i <= days; i++) {
        const d = document.createElement('button');
        const thisDate = new Date(dsCurrentYear, dsCurrentMonth, i);
        const isPast = thisDate < today; const isWknd = thisDate.getDay() === 0 || thisDate.getDay() === 6;
        d.className = 'cal-day' + (isPast || isWknd ? ' past' : ' has-slots');
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
      if (dsCurrentMonth < 0) { dsCurrentMonth = 11; dsCurrentYear--; }
      renderCal();
    }
    function selectDay(btn, date) {
      document.querySelectorAll('.cal-day').forEach(d => d.classList.remove('selected'));
      btn.classList.add('selected'); dsSelectedDate = date; dsSelectedTime = null;
      document.getElementById('slots-label').textContent = 'Available slots — ' + date.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
      renderSlots(); checkStep1();
    }
    function renderSlots() {
      const grid = document.getElementById('time-slots'); grid.innerHTML = '';
      TIME_SLOTS.forEach(slot => {
        const btn = document.createElement('button');
        btn.className = 'time-slot' + (UNAVAIL.includes(slot) ? ' unavailable' : '');
        btn.textContent = slot; btn.disabled = UNAVAIL.includes(slot);
        if (dsSelectedTime === slot) btn.classList.add('selected');
        if (!UNAVAIL.includes(slot)) btn.onclick = () => { document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected')); btn.classList.add('selected'); dsSelectedTime = slot; checkStep1(); };
        grid.appendChild(btn);
      });
    }
    function checkStep1() { const ok = dsSelectedDate && dsSelectedTime; const n = document.getElementById('ds-next1'); n.disabled = !ok; n.style.opacity = ok ? '1' : '.4'; }
    function goToStep(n, init) {
      if (n === 3) {
        const fname = document.getElementById('ds-fname').value.trim();
        const email = document.getElementById('ds-email').value.trim();
        const industry = document.getElementById('ds-industry').value;
        const errEl = document.getElementById('ds-error'); errEl.classList.remove('show');
        if (!fname || !email || !industry) { errEl.textContent = 'Please fill in name, email, and business type.'; errEl.classList.add('show'); return; }
        if (!/\S+@\S+\.\S+/.test(email)) { errEl.textContent = 'Please enter a valid email address.'; errEl.classList.add('show'); return; }
        const lname = document.getElementById('ds-lname').value.trim();
        document.getElementById('cf-date').textContent = dsSelectedDate.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        document.getElementById('cf-time').textContent = dsSelectedTime + ' IST';
        document.getElementById('cf-name').textContent = fname + (lname ? ' ' + lname : '');
        document.getElementById('cf-email').textContent = email;
        document.getElementById('cf-industry').textContent = industry;
      }
      for (let i = 1; i <= 3; i++) {
        const s = document.getElementById('dstep' + i); const l = document.getElementById('dsline' + i);
        if (i < n) { s.classList.add('done'); s.classList.remove('active'); s.textContent = '✓'; if (l) l.classList.add('done'); }
        else if (i === n) { s.classList.add('active'); s.classList.remove('done'); s.textContent = i; }
        else { s.classList.remove('active', 'done'); s.textContent = i; if (l) l.classList.remove('done'); }
      }
      document.querySelectorAll('.ds-panel').forEach(p => p.classList.remove('active'));
      const panel = document.getElementById('ds-panel-' + n); if (panel) panel.classList.add('active');
    }
    function confirmDemo() {
      const btn = document.getElementById('confirm-btn-text'); btn.textContent = 'Booking...';
      setTimeout(() => {
        const fname = document.getElementById('ds-fname').value.trim();
        const lname = document.getElementById('ds-lname').value.trim();
        const email = document.getElementById('ds-email').value.trim();
        const phone = document.getElementById('ds-phone').value.trim();
        const industry = document.getElementById('ds-industry').value;
        const goal = document.getElementById('ds-goal').value;
        const dateStr = dsSelectedDate.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
        // SAVE LEAD
        saveLead({
          name: fname + (lname ? ' ' + lname : ''),
          email, phone, industry, goal,
          source: 'demo',
          demoDate: dateStr,
          demoTime: dsSelectedTime + ' IST'
        });
        document.getElementById('ds-success-detail').innerHTML = '📅 ' + dateStr + '\n🕐 ' + dsSelectedTime + ' IST · 30 minutes\n📧 Invite sent to: ' + email + '\n🔗 Google Meet link included\n👤 Host: Rahul · BartaFlow Team';
        document.querySelectorAll('.ds-panel').forEach(p => p.classList.remove('active'));
        document.getElementById('ds-panel-success').classList.add('active');
        const si = document.querySelector('.ds-step-indicator'); if (si) si.style.display = 'none';
      }, 1500);
    }


    // ════════════════════════════════════════
    // CUSTOMER LEADS CAPTURE & MANAGEMENT
    // ════════════════════════════════════════

    // In-memory lead store (persists for session; replace with API/DB for production)
    let LEADS = [
      // Seed with sample data so panel looks populated from the start
      { id: 1, name: 'Priya Rathod', email: 'priya@travelmate.in', phone: '+91 98765 43210', company: 'TravelMate Agency', industry: 'Travel & Tourism', goal: 'Generate & qualify leads', source: 'demo', demoDate: 'Mon, 12 May 2025', demoTime: '10:00 AM IST', time: '2 hours ago', ts: Date.now() - 7200000 },
      { id: 2, name: 'Arjun Mehta', email: 'arjun@fashionhub.com', phone: '+91 87654 32109', company: 'FashionHub', industry: 'E-Commerce', goal: 'Sell products via WhatsApp', source: 'signup', time: '5 hours ago', ts: Date.now() - 18000000 },
      { id: 3, name: 'Dr. Sunita Kapoor', email: 'sunita@carepoint.in', phone: '+91 76543 21098', company: 'CarePoint Clinics', industry: 'Healthcare', goal: 'Automate customer support', source: 'demo', demoDate: 'Wed, 14 May 2025', demoTime: '3:00 PM IST', time: 'Yesterday', ts: Date.now() - 86400000 },
      { id: 4, name: 'Raj Verma', email: 'raj@brightmind.edu', phone: '+91 65432 10987', company: 'BrightMind Coaching', industry: 'Education & Coaching', goal: 'Booking & appointment management', source: 'chatbot', time: 'Yesterday', ts: Date.now() - 90000000 },
      { id: 5, name: 'Meena Sharma', email: 'meena@spiceroute.com', phone: '', company: 'SpiceRoute Restaurants', industry: 'Restaurant & Food', goal: 'Automate customer support', source: 'contact', time: '2 days ago', ts: Date.now() - 172800000 },
    ];
    let nextLeadId = 6;

    function saveLead(data) {
      const lead = {
        id: nextLeadId++,
        name: data.name || 'Unknown',
        email: data.email || '',
        phone: data.phone || '',
        company: data.company || '',
        industry: data.industry || '',
        goal: data.goal || '',
        source: data.source || 'contact',
        demoDate: data.demoDate || '',
        demoTime: data.demoTime || '',
        time: 'Just now',
        ts: Date.now()
      };
      LEADS.unshift(lead);
      updateLeadsBadge();
      showToast('✓', '📋 New lead captured: ' + lead.name);
      // In production, POST to your API here:
      // fetch('/api/leads', {method:'POST', body: JSON.stringify(lead), headers:{'Content-Type':'application/json'}});
      // Or send to Google Sheets via Apps Script webhook:
      // fetch('YOUR_GOOGLE_APPS_SCRIPT_URL', {method:'POST', body: JSON.stringify(lead)});
      return lead;
    }

    function updateLeadsBadge() {
      const badge = document.getElementById('leads-count-badge');
      if (badge) badge.textContent = LEADS.length;
    }

    // ── LEADS PANEL ─────────────────────────────────────────────────────────
    function openLeadsPanel() {
      renderLeads();
      document.getElementById('leads-overlay').classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeLeadsPanel() {
      document.getElementById('leads-overlay').classList.remove('open');
      document.body.style.overflow = '';
    }
    function handleLeadsOverlayClick(e) { if (e.target.id === 'leads-overlay') closeLeadsPanel(); }

    function renderLeads() {
      const search = (document.getElementById('leads-search')?.value || '').toLowerCase();
      const filter = document.getElementById('leads-filter')?.value || '';
      let filtered = LEADS.filter(l => {
        const matchSearch = !search || (l.name + l.email + l.company + l.industry).toLowerCase().includes(search);
        const matchFilter = !filter || l.source === filter;
        return matchSearch && matchFilter;
      });

      // Update stats
      const today = new Date(); today.setHours(0, 0, 0, 0);
      document.getElementById('ls-total').textContent = LEADS.length;
      document.getElementById('ls-demo').textContent = LEADS.filter(l => l.source === 'demo').length;
      document.getElementById('ls-signup').textContent = LEADS.filter(l => l.source === 'signup').length;
      document.getElementById('ls-today').textContent = LEADS.filter(l => l.ts >= today.getTime()).length;
      document.getElementById('lp-sub-text').textContent = filtered.length + ' of ' + LEADS.length + ' leads';

      const list = document.getElementById('leads-list');
      if (!list) return;

      if (filtered.length === 0) {
        list.innerHTML = '<div class="lp-empty"><div class="lp-empty-icon">🔍</div><div class="lp-empty-text">No leads match your search.<br>Try a different filter or keyword.</div></div>';
        return;
      }

      const sourceLabel = { demo: 'Demo Booked', signup: 'Signed Up', chatbot: 'Chatbot', contact: 'Contact Form' };
      const sourceClass = { demo: 'lb-demo', signup: 'lb-signup', chatbot: 'lb-chatbot', contact: 'lb-contact' };

      list.innerHTML = filtered.map(l => {
        const initials = l.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
        const hasDemo = l.demoDate && l.demoTime;
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
        ${l.phone ? `<div class="lead-meta-item"><div class="lead-meta-label">Phone</div><div class="lead-meta-val">${escHtml(l.phone)}</div></div>` : ''}
        ${l.company ? `<div class="lead-meta-item"><div class="lead-meta-label">Company</div><div class="lead-meta-val">${escHtml(l.company)}</div></div>` : ''}
        ${l.goal ? `<div class="lead-meta-item" style="grid-column:span 2"><div class="lead-meta-label">Goal</div><div class="lead-meta-val">${escHtml(l.goal)}</div></div>` : ''}
        ${hasDemo ? `<div class="lead-meta-item" style="grid-column:span 2"><div class="lead-meta-label">Demo Scheduled</div><div class="lead-meta-val" style="color:var(--navy);font-weight:500">📅 ${escHtml(l.demoDate)} · ${escHtml(l.demoTime)}</div></div>` : ''}
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

    function escHtml(str) { return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

    function copyEmail(email) {
      navigator.clipboard.writeText(email).then(() => showToast('📧', 'Email copied: ' + email)).catch(() => showToast('❌', 'Could not copy'));
    }
    function copyPhone(phone) {
      navigator.clipboard.writeText(phone).then(() => showToast('📞', 'Phone copied: ' + phone)).catch(() => showToast('❌', 'Could not copy'));
    }
    function whatsappLead(phone, name) {
      if (!phone) { showToast('⚠️', 'No phone number for ' + name); return; }
      const cleaned = phone.replace(/\D/g, '');
      const msg = encodeURIComponent('Hi ' + name + ', this is the BartaFlow team following up on your interest. How can we help?');
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
      const headers = ['Name', 'Email', 'Phone', 'Company', 'Industry', 'Goal', 'Source', 'Demo Date', 'Demo Time', 'Captured'];
      const rows = LEADS.map(l => [l.name, l.email, l.phone, l.company, l.industry, l.goal, l.source, l.demoDate, l.demoTime, l.time].map(v => '"' + (v || '').replace(/"/g, '""') + '"').join(','));
      const csv = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'bartaflow-leads-' + new Date().toISOString().slice(0, 10) + '.csv'; a.click();
      URL.revokeObjectURL(url);
      showToast('⬇', 'Exported ' + LEADS.length + ' leads as CSV');
    }

    // ── TOAST ────────────────────────────────────────────────────────────────
    let toastTimer;
    function showToast(icon, msg) {
      const t = document.getElementById('toast');
      const ti = document.getElementById('toast-icon');
      const tm = document.getElementById('toast-msg');
      if (!t) return;
      ti.textContent = icon; tm.textContent = msg;
      t.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => t.classList.remove('show'), 3500);
    }

    // Initialize badge
    updateLeadsBadge();



    // ── SCROLL REVEAL ─────────────────────────────────────────────────────
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('up'); });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal, .feat-card').forEach((el, i) => {
      if (el.classList.contains('feat-card')) el.style.transitionDelay = (i % 3) * 0.12 + 's';
      observer.observe(el);
    });

    // ── ANALYTICS BAR ANIMATION ───────────────────────────────────────────
    const barObserver = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.querySelectorAll('.ma-fill').forEach(bar => {
            bar.style.width = bar.dataset.w + '%';
          });
        }
      });
    }, { threshold: 0.3 });
    document.querySelectorAll('.feat-card').forEach(c => barObserver.observe(c));

    // ── NAV SCROLL ────────────────────────────────────────────────────────
    window.addEventListener('scroll', () => {
      document.getElementById('nav').classList.toggle('scrolled', scrollY > 50);
    });

    // ── BOT CARD STAGGER ──────────────────────────────────────────────────
    document.querySelectorAll('.bot-card').forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      card.style.transition = 'opacity .5s ease, transform .5s ease, box-shadow .3s, border-color .3s';
      const cardObserver = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, (i % 5) * 80);
            cardObserver.unobserve(card);
          }
        });
      }, { threshold: 0.1 });
      cardObserver.observe(card);
    });


    document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeAuth(); closeDemoSched(); closeModalDirect(); closeLeadsPanel(); closeCsvViewer(); } });

    // ════════════════════════════════════════
    // GLOBAL OVERFLOW SAFETY NET
    // Guarantees body scroll is never permanently locked
    // ════════════════════════════════════════
    (function () {
      // Unlock scroll whenever the tab becomes visible again
      document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'visible') {
          // Only unlock if no modal is currently open
          var anyOpen = document.querySelector(
            '.auth-overlay.open, .demo-sched-overlay.open, .leads-overlay.open, .csv-overlay.open, .va-overlay.open, .modal-overlay.open'
          );
          if (!anyOpen) {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
          }
        }
      });

      // Unlock before page is hidden/refreshed
      window.addEventListener('pagehide', function () {
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
      });

      // Unlock on back/forward navigation
      window.addEventListener('pageshow', function () {
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
      });

      // Periodic check every 3s — catch any edge case
      setInterval(function () {
        var anyOpen = document.querySelector(
          '.auth-overlay.open, .demo-sched-overlay.open, .leads-overlay.open, .csv-overlay.open, .va-overlay.open, .modal-overlay.open'
        );
        if (!anyOpen && document.body.style.overflow === 'hidden') {
          document.body.style.overflow = '';
        }
      }, 3000);
    })();


    // ════════════════════════════════════════
    // REAL AI VOICE AGENT ENGINE
    // Uses: Web Speech API (SpeechSynthesis + SpeechRecognition)
    // ════════════════════════════════════════
    (function () {
      let vaState = { lang: 'en-IN', langName: 'English', gender: 'male', topic: 'sales', callActive: false, muted: false, speakerOn: true, callSeconds: 0, callTimer: null, currentUtterance: null, recognition: null, agentSpeaking: false, userSpeaking: false };

      const SCRIPTS = {
        'en-IN': {
          greeting: "Hello! I'm Aria, your BartaFlow AI assistant. How can I help you today?",
          sales: [["I'm interested in a 3BHK property.", "Wonderful! May I know your preferred area — New Town, Salt Lake, or Rajarhat? And your budget range?"], ["New Town, around 70 lakhs.", "Perfect! We have a 1,380 sqft east-facing flat in New Town for ₹72 lakh — RERA approved, ready to move. Would you like a site visit?"], ["Yes, book a site visit.", "Excellent! Can I have your name and preferred day — Saturday or Sunday works best?"]],
          travel: [["I want to book a Maldives trip.", "Wonderful! Our 5 night 6 day Maldives package is ₹65,000 per person with flights and water villa. When would you like to travel?"], ["December 15th, for 2 people.", "Perfect! Total is ₹1,30,000 for 2. Shall I block the dates and send the itinerary on WhatsApp?"], ["Yes please.", "Done! You'll receive the itinerary and payment link within 10 minutes. Is there anything else?"]],
          health: [["I need to see a cardiologist.", "Of course. Dr. Sharma is available Monday at 10 AM or Wednesday at 3 PM. Which works for you?"], ["Monday 10 AM.", "Confirmed! Appointment booked for Monday at 10 AM. You'll receive a WhatsApp confirmation. Shall I share your previous reports with Dr. Sharma?"], ["Yes please.", "Done! Records shared securely. Please arrive 15 minutes early. Anything else I can help with?"]],
          ecom: [["Where is my order?", "Sure! Please share your order number and I'll track it right away."], ["Order BF-2847.", "Found it! Your order left our Delhi warehouse this morning and will be delivered by 6 PM today. Shall I send the live tracking link on WhatsApp?"], ["Yes.", "Sent! Your tracking link is on WhatsApp. Anything else I can help with?"]],
          edu: [["Tell me about your UPSC coaching.", "We offer a 12-month UPSC program with 200+ live class hours, weekly tests and personal mentorship for ₹35,000. Would you like a free demo class?"], ["Yes, when is the next one?", "This Saturday at 11 AM. May I have your name and mobile number to register you?"], ["Arjun, 9876543210.", "Registered! Reminder and joining link will be sent to 9876543210. Is there anything else?"]],
          bartaflow: [["Tell me about BartaFlow.", "BartaFlow automates your WhatsApp business with AI — handling leads, bookings, sales and support 24/7 in 12+ languages. What industry is your business in?"], ["I run a travel agency.", "Our travel package starts at ₹2,499/month — GPT-4 chatbot, automated booking, lead capture and broadcast. Live in 48 hours. Would you like a free demo?"], ["Yes, book a demo.", "Excellent! May I have your name and email? We'll send a Google Meet invite right away."]],
        },
        'hi-IN': {
          greeting: "नमस्ते! मैं आरिया हूँ, BartaFlow की AI असिस्टेंट। आज मैं आपकी कैसे मदद कर सकती हूँ?",
          sales: [["मुझे एक 3BHK फ्लैट चाहिए।", "बहुत बढ़िया! आप किस इलाके में ढूंढ रहे हैं — न्यू टाउन, साल्ट लेक, या राजारहाट? बजट क्या है?"], ["न्यू टाउन में, लगभग 70 लाख।", "शानदार! न्यू टाउन में 1,380 वर्ग फुट का पूर्वमुखी फ्लैट है 72 लाख में। RERA अप्रूव्ड। साइट विजिट बुक करूँ?"], ["हाँ।", "बिल्कुल! आपका नाम और पसंदीदा दिन बताएं — शनिवार या रविवार?"]],
          travel: [["मुझे मालदीव जाना है।", "बहुत खूब! 5 रात 6 दिन का पैकेज ₹65,000 प्रति व्यक्ति है, फ्लाइट और वाटर विला सहित। कब जाना चाहते हैं?"], ["15 दिसंबर, 2 लोगों के लिए।", "बढ़िया! कुल ₹1,30,000। तारीखें ब्लॉक करूँ और WhatsApp पर itinerary भेजूँ?"], ["हाँ।", "हो गया! 10 मिनट में payment link और itinerary मिलेगा।"]],
          health: [["कार्डियोलॉजिस्ट से मिलना है।", "बिल्कुल। डॉ. शर्मा सोमवार 10 बजे या बुधवार 3 बजे उपलब्ध हैं।"], ["सोमवार 10 बजे।", "कन्फर्म! अपॉइंटमेंट बुक हो गई। WhatsApp पर पुष्टि आएगी।"], ["धन्यवाद।", "स्वागत है! 15 मिनट पहले पहुँचें।"]],
          ecom: [["मेरा ऑर्डर कहाँ है?", "ज़रूर! ऑर्डर नंबर बताएं।"], ["BF-2847।", "मिल गया! आज शाम 6 बजे तक डिलीवरी होगी। WhatsApp पर live tracking link भेजूँ?"], ["हाँ।", "भेज दिया!"]],
          edu: [["UPSC कोचिंग के बारे में बताएं।", "12 महीने का प्रोग्राम ₹35,000 में — 200+ घंटे live classes, weekly tests, mentorship। Free demo चाहिए?"], ["हाँ।", "शनिवार 11 बजे है। नाम और मोबाइल नंबर दें।"], ["अर्जुन, 9876543210।", "रजिस्टर हो गए! reminder और joining link 9876543210 पर जाएगा।"]],
          bartaflow: [["BartaFlow क्या है?", "BartaFlow एक AI platform है जो WhatsApp business को automate करता है। 24/7, 12+ भाषाओं में। आपका business किस industry में है?"], ["Travel agency।", "शानदार! ₹2,499/month से शुरू। GPT-4 chatbot, booking, leads सब। 48 घंटे में live। Free demo?"], ["हाँ।", "नाम और email दें, Google Meet invite भेजूँगी।"]],
        },
        'bn-IN': {
          greeting: "নমস্কার! আমি আরিয়া, BartaFlow-এর AI সহকারী। আজ কীভাবে সাহায্য করতে পারি?",
          sales: [["3BHK ফ্ল্যাট দরকার।", "চমৎকার! কোন এলাকায়? বাজেট কত?"], ["নিউ টাউন, ৭০ লাখে।", "দারুণ! ৭২ লাখে RERA অনুমোদিত ফ্ল্যাট আছে। সাইট ভিজিট?"], ["হ্যাঁ।", "অবশ্যই! নাম ও দিন বলুন।"]],
          travel: [["মালদ্বীপ যেতে চাই।", "অসাধারণ! ৬৫,০০০/জন, ফ্লাইটসহ। কখন?"], ["১৫ ডিসেম্বর, ২ জন।", "মোট ১,৩০,০০০। তারিখ ব্লক করব?"], ["হ্যাঁ।", "হয়েছে! WhatsApp-এ itinerary যাবে।"]],
          health: [["কার্ডিওলজিস্ট দরকার।", "সোমবার ১০টা বা বুধবার ৩টা।"], ["সোমবার।", "বুক হয়েছে!"], ["ধন্যবাদ।", "স্বাগতম!"]],
          ecom: [["অর্ডার কোথায়?", "নম্বর বলুন।"], ["BF-2847।", "আজ ৬টায় ডেলিভারি। ট্র্যাকিং লিংক?"], ["হ্যাঁ।", "পাঠানো হলো!"]],
          edu: [["কোচিং সম্পর্কে বলুন।", "১২ মাস, ৩৫,০০০ টাকা। ডেমো?"], ["হ্যাঁ।", "শনিবার ১১টায়। নাম ও নম্বর?"], ["অর্জুন, ৯৮৭৬৫৪৩২১০।", "নিবন্ধন হলো!"]],
          bartaflow: [["BartaFlow কী?", "WhatsApp AI platform — ২৪/৭, ১২+ ভাষায়। কোন শিল্পে?"], ["ট্র্যাভেল এজেন্সি।", "২,৪৯৯ টাকা/মাস। ৪৮ ঘণ্টায় লাইভ। ডেমো?"], ["হ্যাঁ।", "নাম ও ইমেইল দিন।"]],
        },
      };

      const getGreeting = (lang) => (SCRIPTS[lang]?.greeting) || SCRIPTS['en-IN'].greeting;
      const getScript = (lang, topic) => (SCRIPTS[lang]?.[topic]) || SCRIPTS['en-IN'][topic] || SCRIPTS['en-IN'].bartaflow;

      const synth = window.speechSynthesis;
      let voices = [];
      const loadVoices = () => { voices = synth ? synth.getVoices() : []; };
      if (synth) { loadVoices(); if (speechSynthesis.onvoiceschanged !== undefined) speechSynthesis.onvoiceschanged = loadVoices; }

      function pickVoice(lang, gender) {
        if (!voices.length) loadVoices();
        let pool = voices.filter(v => v.lang.startsWith(lang.split('-')[0]));
        if (!pool.length) pool = voices.filter(v => v.lang.startsWith('en'));
        if (!pool.length) return null;
        const fKeys = ['female', 'woman', 'girl', 'zira', 'susan', 'karen', 'samantha', 'victoria', 'moira', 'fiona', 'tessa', 'veena', 'heera', 'lekha', 'raveena'];
        const mKeys = ['male', 'man', 'david', 'mark', 'daniel', 'alex', 'fred', 'rishi', 'google', 'thomas'];
        if (gender === 'female') { const f = pool.find(v => fKeys.some(k => v.name.toLowerCase().includes(k))); if (f) return f; return pool[pool.length - 1]; }
        const m = pool.find(v => mKeys.some(k => v.name.toLowerCase().includes(k)));
        return m || pool[0];
      }

      function speak(text, onEnd) {
        if (!synth) { if (onEnd) onEnd(); return; }
        synth.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = vaState.lang; u.rate = 0.93; u.pitch = vaState.gender === 'female' ? 1.12 : 0.87;
        u.volume = vaState.speakerOn && !vaState.muted ? 1 : 0;
        const v = pickVoice(vaState.lang, vaState.gender); if (v) u.voice = v;
        u.onstart = () => { vaState.agentSpeaking = true; document.getElementById('va-agent-av')?.classList.add('speaking'); };
        u.onend = u.onerror = () => { vaState.agentSpeaking = false; document.getElementById('va-agent-av')?.classList.remove('speaking'); if (onEnd) onEnd(); };
        synth.speak(u); vaState.currentUtterance = u;
      }

      function buildWave(id, color, n) {
        const c = document.getElementById(id); if (!c) return; c.innerHTML = '';
        for (var i = 0; i < n; i++) { var b = document.createElement('div'); b.className = 'va-bar'; b.style.background = color; b.style.width = '3px'; b.style.height = '4px'; b.style.borderRadius = '3px'; c.appendChild(b); }
      }
      function animateWave(id, active, max) {
        document.querySelectorAll('#' + id + ' .va-bar').forEach(function (b) { b.style.height = active ? (4 + Math.random() * (max || 32)) + 'px' : '4px'; });
      }
      function addMsg(role, text) {
        const tr = document.getElementById('va-transcript'); if (!tr) return;
        const d = document.createElement('div'); d.className = 'va-msg ' + (role === 'agent' ? 'agent' : 'user');
        d.innerHTML = '<div class="va-msg-role">' + (role === 'agent' ? 'AI AGENT' : 'YOU') + '</div><div class="va-msg-text">' + text + '</div>';
        tr.appendChild(d); tr.scrollTop = tr.scrollHeight;
      }
      function showTyping() { const tr = document.getElementById('va-transcript'); if (!tr) return; const d = document.createElement('div'); d.className = 'va-typing-msg'; d.id = 'va-typing'; d.innerHTML = '<div class="va-typing-dot"></div><div class="va-typing-dot"></div><div class="va-typing-dot"></div>'; tr.appendChild(d); tr.scrollTop = tr.scrollHeight; }
      function hideTyping() { document.getElementById('va-typing')?.remove(); }
      function setStatus(s) { const p = document.getElementById('va-status-pill'), t = document.getElementById('va-status-text'); if (!p || !t) return; p.className = 'va-call-status-pill ' + s; t.textContent = s.toUpperCase(); }
      function showStep(s) { ['setup', 'topic', 'call'].forEach(n => { document.getElementById('va-step-' + n).style.display = n === s ? 'block' : 'none'; }); }

      window.openVoiceAgent = () => { document.getElementById('va-overlay').classList.add('open'); document.body.style.overflow = 'hidden'; showStep('setup'); loadVoices(); };
      window.closeVoiceAgent = () => { endVoiceCall(); document.getElementById('va-overlay').classList.remove('open'); document.body.style.overflow = ''; };
      window.backToSetup = () => showStep('setup');
      window.goToTopicSelect = () => showStep('topic');

      window.selectLang = function (btn) { document.querySelectorAll('.va-lang-btn').forEach(b => b.classList.remove('selected')); btn.classList.add('selected'); vaState.lang = btn.dataset.lang; vaState.langName = btn.dataset.name; };
      window.selectVoice = function (g) {
        vaState.gender = g;
        const mc = document.getElementById('va-card-male'), fc = document.getElementById('va-card-female');
        mc.className = 'va-voice-card male' + (g === 'male' ? ' selected' : '');
        fc.className = 'va-voice-card female' + (g === 'female' ? ' selected' : '');
        const mck = mc.querySelector('.va-voice-check'), fck = fc.querySelector('.va-voice-check');
        if (mck) mck.textContent = g === 'male' ? '✓' : '';
        if (fck) fck.textContent = g === 'female' ? '✓' : '';
      };
      window.selectTopic = function (card) { document.querySelectorAll('.va-topic-card').forEach(c => c.classList.remove('selected')); card.classList.add('selected'); vaState.topic = card.dataset.topic; };

      let convStep = 0, convScript = [];
      window.startAICall = function () {
        showStep('call'); convStep = 0; convScript = getScript(vaState.lang, vaState.topic);
        const av = document.getElementById('va-agent-av');
        av.className = 'va-agent-av ' + vaState.gender;
        document.getElementById('va-agent-emoji').textContent = vaState.gender === 'female' ? '👩' : '👨';
        document.getElementById('va-agent-name').textContent = vaState.gender === 'female' ? 'Aria (BartaFlow AI)' : 'Aryan (BartaFlow AI)';
        document.getElementById('va-agent-lang-display').textContent = vaState.langName + ' · ' + (vaState.gender === 'female' ? 'Female' : 'Male') + ' Voice';
        buildWave('va-agent-wave', 'var(--gold)', 36); buildWave('va-user-wave', '#60a5fa', 36);
        vaState.callActive = true; vaState.callSeconds = 0;
        document.getElementById('va-transcript').innerHTML = '';
        setStatus('connecting');
        vaState.callTimer = setInterval(() => {
          vaState.callSeconds++;
          const m = String(Math.floor(vaState.callSeconds / 60)).padStart(2, '0'), s = String(vaState.callSeconds % 60).padStart(2, '0');
          const el = document.getElementById('va-call-timer'); if (el) el.textContent = m + ':' + s;
          if (vaState.agentSpeaking) animateWave('va-agent-wave', true, 36); else animateWave('va-agent-wave', false);
          if (vaState.userSpeaking) animateWave('va-user-wave', true, 28); else animateWave('va-user-wave', false);
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
        const step = convScript[convStep];
        const reply = step ? step[1] : (vaState.lang === 'hi-IN' ? 'मैं समझ गई। क्या और कुछ जानना चाहते हैं?' : vaState.lang === 'bn-IN' ? 'বুঝেছি। আর কিছু জানতে চান?' : 'I understand. Is there anything else I can help you with?');
        if (step) convStep++;
        showTyping(); setTimeout(() => { hideTyping(); addMsg('agent', reply); speak(reply); }, 900 + Math.random() * 400);
      }

      window.sendVoiceMsg = function () { const inp = document.getElementById('va-text-input'); if (!inp || !inp.value.trim()) return; const t = inp.value.trim(); inp.value = ''; processInput(t); };

      let micOn = false;
      window.toggleMic = function () {
        if (!vaState.callActive) return;
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) { showToast('⚠️', 'Speech recognition not supported. Please type your message.'); return; }
        const btn = document.getElementById('va-mic-btn');
        if (micOn) { vaState.recognition?.stop(); micOn = false; btn.classList.remove('listening'); btn.textContent = '🎙️'; return; }
        micOn = true; btn.classList.add('listening'); btn.textContent = '🔴';
        const rec = new SR(); vaState.recognition = rec; rec.lang = vaState.lang; rec.interimResults = false;
        rec.onresult = e => { const t = e.results[0][0].transcript; document.getElementById('va-text-input').value = t; micOn = false; btn.classList.remove('listening'); btn.textContent = '🎙️'; vaState.userSpeaking = true; setTimeout(() => { sendVoiceMsg(); vaState.userSpeaking = false; }, 200); };
        rec.onerror = rec.onend = () => { micOn = false; btn.classList.remove('listening'); btn.textContent = '🎙️'; };
        rec.start(); showToast('🎙️', 'Listening... speak now');
      };

      window.toggleMute = function () { vaState.muted = !vaState.muted; const c = document.getElementById('va-mute-circle'); if (c) { c.textContent = vaState.muted ? '🔕' : '🔇'; c.classList.toggle('active', vaState.muted); } showToast(vaState.muted ? '🔕' : '🔇', vaState.muted ? 'Microphone muted' : 'Microphone unmuted'); };
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
    })();

    // ════════════════════════════════════════
    // FAQ ACCORDION
    // ════════════════════════════════════════
    (function () {
      let openIndex = null;

      window.toggleFaq = function (index) {
        const items = document.querySelectorAll('.faq-item');
        items.forEach((item, i) => {
          const isTarget = i === index;
          const isCurrentlyOpen = item.classList.contains('open');
          if (isTarget) {
            if (isCurrentlyOpen) {
              // Close it
              item.classList.remove('open');
              openIndex = null;
            } else {
              // Close any other open item first
              items.forEach(it => it.classList.remove('open'));
              item.classList.add('open');
              openIndex = index;
              // Smooth scroll into view if needed
              setTimeout(() => {
                const rect = item.getBoundingClientRect();
                if (rect.top < 80 || rect.bottom > window.innerHeight - 40) {
                  item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
              }, 80);
            }
          }
        });
      };

      // Open first item by default after a short delay for elegance
      setTimeout(() => {
        const first = document.querySelector('.faq-item[data-index="0"]');
        if (first && !first.classList.contains('open')) {
          first.classList.add('open');
          openIndex = 0;
        }
      }, 800);

      // Scroll-reveal for FAQ items with stagger
      const faqObserver = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const items = e.target.querySelectorAll('.faq-item');
            items.forEach((item, i) => {
              item.style.opacity = '0';
              item.style.transform = 'translateY(16px)';
              item.style.transition = `opacity .5s ease ${i * 0.06}s, transform .5s ease ${i * 0.06}s`;
              setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
              }, i * 60 + 100);
            });
            faqObserver.unobserve(e.target);
          }
        });
      }, { threshold: 0.1 });

      const faqList = document.getElementById('faq-list');
      if (faqList) faqObserver.observe(faqList);
    })();

    // ── Smooth scroll for anchor clicks only (not on reload) ──────────────
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute('href');
      if (!id || id === '#' || id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (typeof closeMobileMenu === 'function') closeMobileMenu();
    });

    /* ══ PRELOADER — bulletproof, never hangs ══ */
    (function () {
      // Immediately ensure body is scrollable (in case previous session left it locked)
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';

      const pl = document.getElementById('preloader');
      if (!pl) { return; }

      let hidden = false;
      const hide = function () {
        if (hidden) return;
        hidden = true;
        pl.classList.add('hidden');
        // Guarantee body scroll is restored
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        // Remove from DOM completely after fade-out to free memory
        setTimeout(function () { if (pl.parentNode) pl.parentNode.removeChild(pl); }, 600);
      };

      // Hide after 1.15s minimum (animation duration) once page is ready
      if (document.readyState === 'complete') {
        setTimeout(hide, 1150);
      } else {
        window.addEventListener('load', function () { setTimeout(hide, 1150); }, { once: true });
      }

      // Hard failsafe: always hide by 2s no matter what
      setTimeout(hide, 2000);

      // Extra failsafe: hide if user interacts (scroll/click/key)
      var earlyHide = function () { if (!hidden) setTimeout(hide, 100); };
      document.addEventListener('scroll', earlyHide, { once: true, passive: true });
      document.addEventListener('keydown', earlyHide, { once: true });
      document.addEventListener('pointerdown', earlyHide, { once: true });
    })();


    // ════════════════════════════════════════
    // FEATURE 2 · DARK THEME TOGGLE (safe — no flash, no load block)
    // ════════════════════════════════════════
    (function () {
      const btn = document.getElementById('theme-toggle');

      // Restore saved theme instantly — NO transition class yet (prevents flash on load)
      const saved = localStorage.getItem('bf-theme');
      if (saved === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        if (btn) btn.textContent = '🌙';
      } else {
        if (btn) btn.textContent = '☀️';
      }

      // Enable smooth transitions AFTER initial render (next frame)
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          document.body.classList.add('theme-ready');
        });
      });

      window.toggleTheme = function () {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        if (isDark) {
          document.body.removeAttribute('data-theme');
          localStorage.setItem('bf-theme', 'light');
          if (btn) btn.textContent = '☀️';
        } else {
          document.body.setAttribute('data-theme', 'dark');
          localStorage.setItem('bf-theme', 'dark');
          if (btn) btn.textContent = '🌙';
        }
      };
    })();

    // ════════════════════════════════════════
    // FEATURE 3 · HAMBURGER MOBILE MENU
    // ════════════════════════════════════════
    window.toggleMobileMenu = function () {
      const menu = document.getElementById('mobile-menu');
      const burger = document.getElementById('hamburger');
      if (!menu || !burger) return;
      const isOpen = menu.classList.contains('open');
      menu.classList.toggle('open', !isOpen);
      burger.classList.toggle('open', !isOpen);
      burger.setAttribute('aria-expanded', String(!isOpen));
    };
    window.closeMobileMenu = function () {
      const menu = document.getElementById('mobile-menu');
      const burger = document.getElementById('hamburger');
      if (menu) menu.classList.remove('open');
      if (burger) { burger.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }
    };
    // Close mobile menu on outside click
    document.addEventListener('click', e => {
      const menu = document.getElementById('mobile-menu');
      const burger = document.getElementById('hamburger');
      if (menu && menu.classList.contains('open') && !menu.contains(e.target) && !burger.contains(e.target)) {
        closeMobileMenu();
      }
    });

    // ════════════════════════════════════════
    // FEATURE 4 · FLOATING CHAT WIDGET
    // ════════════════════════════════════════
    (function () {
      let chatOpen = false;
      const AI_REPLIES = {
        "What's the pricing?": "We have 3 plans: Starter ₹999/mo, Professional ₹2,499/mo, and Enterprise ₹4,999/mo. All include a 14-day free trial! Want me to open the pricing section?",
        "Book a demo": "I'll open our demo scheduler for you right now! You can pick a date and time that works. 📅",
        "How does it work?": "BartaFlow connects to your WhatsApp Business number via Meta's official API. You configure the AI with your products/services, and it handles all customer conversations 24/7 — leads, bookings, sales, support. Setup takes 48 hours!",
      };
      const DEFAULT_REPLIES = [
        "Great question! Our team would love to help. Would you like to schedule a quick 30-min demo?",
        "Thanks for reaching out! I can help with pricing, features, or booking a demo. What would you like to know?",
        "That's something our sales team specialises in. Shall I connect you with them? Or I can book a demo for you right now.",
        "Happy to help! For detailed answers, I'd recommend booking a free demo — our team will walk you through everything personally.",
      ];
      let replyIndex = 0;

      window.toggleFloatChat = function () {
        const box = document.getElementById('float-chat-box');
        const btn = document.getElementById('float-chat-btn');
        const notif = document.getElementById('fch-notif');
        if (!box || !btn) return;
        chatOpen = !chatOpen;
        box.style.display = chatOpen ? 'block' : 'none';
        btn.classList.toggle('open', chatOpen);
        if (chatOpen && notif) notif.style.display = 'none';
      };

      window.fchQuickReply = function (text) {
        // Remove quick reply bar after first use
        const qrBar = document.getElementById('fch-qr');
        if (qrBar) qrBar.style.display = 'none';
        fchAddMsg(text, true);
        const reply = AI_REPLIES[text] || DEFAULT_REPLIES[replyIndex++ % DEFAULT_REPLIES.length];
        fchShowTyping(reply);
        // Special action for demo booking
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
        const reply = DEFAULT_REPLIES[replyIndex++ % DEFAULT_REPLIES.length];
        fchShowTyping(reply);
      };

      function fchAddMsg(text, isUser) {
        const body = document.getElementById('fch-body');
        if (!body) return;
        const div = document.createElement('div');
        div.className = 'fch-msg ' + (isUser ? 'fch-msg-out' : 'fch-msg-in');
        if (!isUser) div.innerHTML = '<span class="fch-msg-ai-tag">BOTFLOW AI</span>' + text;
        else div.textContent = text;
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
        setTimeout(() => {
          if (typing.parentNode) typing.parentNode.removeChild(typing);
          fchAddMsg(reply, false);
        }, 1200 + Math.random() * 400);
      }

      // Show notif badge after 3s to draw attention
      setTimeout(() => {
        const notif = document.getElementById('fch-notif');
        if (notif && !chatOpen) notif.style.display = 'flex';
      }, 3000);
    })();

    // ════════════════════════════════════════
    // COOKIE CONSENT BANNER
    // ════════════════════════════════════════
    (function () {
      var COOKIE_KEY = 'bf_cookie_consent';
      var banner = document.getElementById('cookie-banner');
      if (!banner) return;

      // Show banner if no saved preference
      var saved = localStorage.getItem(COOKIE_KEY);
      if (!saved) {
        setTimeout(function () { banner.classList.add('show'); }, 1800);
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

    // ════════════════════════════════════════
    // LEGAL MODAL — Terms of Service + Privacy Policy
    // ════════════════════════════════════════
    var LEGAL_CONTENT = {
      tos: {
        title: 'Terms of Service',
        html: '<h2>Terms of Service</h2><div class="legal-date">Effective Date: 1 January 2025 · Last Updated: 1 April 2025</div>' +
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
        html: '<h2>Privacy Policy</h2><div class="legal-date">Effective Date: 1 January 2025 · Last Updated: 1 April 2025</div>' +
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

    window.openLegal = function (tab) {
      currentLegalTab = tab || 'tos';
      renderLegalContent(currentLegalTab);
      document.getElementById('legal-overlay').classList.add('open');
      document.body.style.overflow = 'hidden';
    };
    window.closeLegal = function () {
      document.getElementById('legal-overlay').classList.remove('open');
      document.body.style.overflow = '';
    };
    window.switchLegal = function (tab) {
      currentLegalTab = tab;
      renderLegalContent(tab);
    };
    function renderLegalContent(tab) {
      var content = LEGAL_CONTENT[tab];
      if (!content) return;
      document.getElementById('legal-title').textContent = content.title;
      document.getElementById('legal-body').innerHTML = content.html;
      document.getElementById('ltab-tos').classList.toggle('active', tab === 'tos');
      document.getElementById('ltab-privacy').classList.toggle('active', tab === 'privacy');
    }

    // ════════════════════════════════════════
    // EMAIL SIMULATION SYSTEM (SendGrid-style)
    // ════════════════════════════════════════
    var EMAIL_TEMPLATES = {
      welcome: function (name, email) {
        return {
          to: email,
          subject: 'Welcome to BartaFlow — Your account is ready! 🎉',
          body: '<strong>Hello, ' + name + '!</strong><br><br>' +
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
          body: '<strong>Hello, ' + name + '!</strong><br><br>' +
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
          body: '<strong>Hello, ' + name + '!</strong><br><br>' +
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
          body: '<strong>Hello, ' + name + '!</strong><br><br>' +
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
      var now = new Date();

      document.getElementById('em-to').textContent = data.to;
      document.getElementById('em-date').textContent = now.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
      document.getElementById('em-subject').textContent = data.subject;
      document.getElementById('em-preview-body').innerHTML =
        data.body +
        '<br><a class="em-preview-btn">' + (data.btnText || 'Open Dashboard →') + '</a>';
      document.getElementById('em-note').textContent = '📌 Demo mode: ' + (data.note || '');

      document.getElementById('email-overlay').classList.add('open');
      document.body.style.overflow = 'hidden';
    };
    window.closeEmailModal = function () {
      document.getElementById('email-overlay').classList.remove('open');
      document.body.style.overflow = '';
    };

    // Hook into existing auth signup — show welcome email after account creation
    var _origShowAuthSuccess = window.showAuthSuccess;
    window.showAuthSuccess = function (title, sub) {
      if (_origShowAuthSuccess) _origShowAuthSuccess(title, sub);
      // If this was a signup (title contains "Account created" or "Welcome")
      if (title && (title.indexOf('Account') !== -1 || title.indexOf('Welcome,') !== -1)) {
        var emailEl = document.getElementById('su-email');
        var fnameEl = document.getElementById('su-fname');
        if (emailEl && emailEl.value) {
          var name = (fnameEl && fnameEl.value) ? fnameEl.value : 'User';
          setTimeout(function () {
            showEmailPreview('welcome', [name, emailEl.value.trim()]);
          }, 2800);
        }
      }
    };

    // Hook into forgot password OTP — show OTP email
    var _origDoForgotPassword = window.doForgotPassword;
    window.doForgotPassword = function () {
      if (_origDoForgotPassword) _origDoForgotPassword();
      // Show OTP email after short delay (after OTP is generated)
      setTimeout(function () {
        var emailEl = document.getElementById('fp-email');
        var otpHint = document.getElementById('demo-otp-hint');
        if (emailEl && emailEl.value && otpHint && otpHint.textContent) {
          showEmailPreview('otp', ['User', emailEl.value.trim(), otpHint.textContent]);
        }
      }, 1600);
    };

    // Hook into demo booking — show confirmation email
    var _origConfirmDemo = window.confirmDemo;
    window.confirmDemo = function () {
      if (_origConfirmDemo) _origConfirmDemo();
      setTimeout(function () {
        var emailEl = document.getElementById('ds-email');
        var fnameEl = document.getElementById('ds-fname');
        var cfDate = document.getElementById('cf-date');
        var cfTime = document.getElementById('cf-time');
        if (emailEl && emailEl.value && cfDate) {
          var name = (fnameEl && fnameEl.value) ? fnameEl.value : 'User';
          showEmailPreview('demo', [name, emailEl.value.trim(), cfDate.textContent, cfTime ? cfTime.textContent : '10:00 AM IST']);
        }
      }, 1600);
    };

    // ════════════════════════════════════════
    // PAYMENT MODAL (Razorpay-style simulation)
    // ════════════════════════════════════════
    var currentPlan = {};
    var currentPayMethod = 'card';

    window.openPayment = function (planName, planDesc, monthlyAmt, setupAmt) {
      currentPlan = { name: planName, desc: planDesc, monthly: monthlyAmt, setup: setupAmt };
      var gst = Math.round((monthlyAmt + setupAmt) * 0.18);
      var total = monthlyAmt + setupAmt + gst;

      document.getElementById('pay-plan-name').textContent = planName + ' Plan';
      document.getElementById('pay-monthly-val').textContent = '₹' + monthlyAmt.toLocaleString('en-IN');
      document.getElementById('pay-setup-val').textContent = '₹' + setupAmt.toLocaleString('en-IN');
      document.getElementById('pay-gst-val').textContent = '₹' + gst.toLocaleString('en-IN');
      document.getElementById('pay-total-val').textContent = '₹' + total.toLocaleString('en-IN');
      document.getElementById('pay-submit-text').textContent = 'Pay ₹' + total.toLocaleString('en-IN') + ' →';
      document.getElementById('pay-error').classList.remove('show');
      document.getElementById('pay-body').style.display = 'block';
      document.getElementById('pay-success').style.display = 'none';
      // Reset method to card
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
      document.getElementById('pay-card-form').style.display = (method === 'card') ? 'block' : 'none';
      document.getElementById('pay-upi-form').style.display = (method === 'upi') ? 'block' : 'none';
    };

    window.formatCard = function (inp) {
      var v = inp.value.replace(/\D/g, '').substring(0, 16);
      inp.value = v.replace(/(.{4})/g, '$1 ').trim();
    };
    window.formatExpiry = function (inp) {
      var v = inp.value.replace(/\D/g, '');
      if (v.length >= 2) v = v.substring(0, 2) + ' / ' + v.substring(2, 4);
      inp.value = v;
    };

    window.processPayment = function () {
      var errEl = document.getElementById('pay-error');
      errEl.classList.remove('show');

      // Validate billing info
      var name = document.getElementById('bill-name').value.trim();
      var phone = document.getElementById('bill-phone').value.trim();
      var email = document.getElementById('bill-email').value.trim();
      var company = document.getElementById('bill-company').value.trim();

      if (!name || !phone || !email || !company) {
        errEl.textContent = 'Please fill in all billing information fields.';
        errEl.classList.add('show'); return;
      }
      if (!/\S+@\S+\.\S+/.test(email)) {
        errEl.textContent = 'Please enter a valid email address.';
        errEl.classList.add('show'); return;
      }

      // Validate payment details
      if (currentPayMethod === 'card') {
        var cardNum = document.getElementById('card-number').value.replace(/\s/g, '');
        var expiry = document.getElementById('card-expiry').value;
        var cvv = document.getElementById('card-cvv').value;
        var cardName = document.getElementById('card-name').value.trim();
        if (cardNum.length < 16 || !expiry || cvv.length < 3 || !cardName) {
          errEl.textContent = 'Please enter valid card details.';
          errEl.classList.add('show'); return;
        }
      } else if (currentPayMethod === 'upi') {
        var upiId = document.getElementById('upi-id').value.trim();
        if (!upiId || !upiId.includes('@')) {
          errEl.textContent = 'Please enter a valid UPI ID (e.g. name@upi).';
          errEl.classList.add('show'); return;
        }
      }

      // Start processing
      var btn = document.getElementById('pay-submit-btn');
      var btnText = document.getElementById('pay-submit-text');
      btn.disabled = true;
      btnText.innerHTML = '<span class="spinner"></span> Processing...';

      setTimeout(function () {
        // Generate reference number
        var ref = 'BF' + Date.now().toString().slice(-8).toUpperCase();
        var gst = Math.round((currentPlan.monthly + currentPlan.setup) * 0.18);
        var total = currentPlan.monthly + currentPlan.setup + gst;
        var now = new Date();

        // Save lead
        saveLead({
          name: name, email: email, phone: phone, company: company, source: 'payment',
          industry: currentPlan.name, goal: 'Purchased ' + currentPlan.name + ' plan'
        });

        // Show success screen
        document.getElementById('pay-body').style.display = 'none';
        document.getElementById('pay-success').style.display = 'block';
        document.getElementById('pay-success-ref').innerHTML =
          '✅ Payment Reference: ' + ref + '\n' +
          '📦 Plan: BartaFlow ' + currentPlan.name + '\n' +
          '💰 Amount Paid: ₹' + total.toLocaleString('en-IN') + ' (incl. GST)\n' +
          '📅 Date: ' + now.toLocaleDateString('en-IN', { dateStyle: 'medium' }) + '\n' +
          '📧 Confirmation sent to: ' + email + '\n' +
          '⏱ Setup begins: Within 24 hours';

        showToast('✓', 'Payment successful! Welcome to BartaFlow ' + currentPlan.name + '!');

        // Show payment confirmation email
        setTimeout(function () {
          showEmailPreview('payment', [name, email, currentPlan.name, '₹' + total.toLocaleString('en-IN'), ref]);
        }, 1800);

        // Show admin pill
        var pill = document.getElementById('admin-pill');
        if (pill) pill.classList.add('show');

      }, 2200);
    };

    // Update existing ESC handler to close new modals too
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeLegal(); closePayment(); closeEmailModal();
      }
    });