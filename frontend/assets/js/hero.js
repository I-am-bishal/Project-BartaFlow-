// ── HERO SECTION ─────────────────────────────────────────────────────────

// ── ANIMATED COUNTERS ────────────────────────────────────────────────────
function animCount(id, target, suffix) {
  suffix = suffix || '';
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

// ── THREE.JS 3D HERO CANVAS — deferred so it never blocks initial paint ──
(function () {
  var initThree = function () {
    const c = document.getElementById('hero-canvas');
    if (!c || typeof THREE === 'undefined') return;
    const W = c.offsetWidth || 600, H = c.offsetHeight || 520;
    const renderer = new THREE.WebGLRenderer({ canvas: c, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(W, H);
    const scene = new THREE.Scene();
    const cam   = new THREE.PerspectiveCamera(55, W / H, 0.1, 100);
    cam.position.z = 6;

    // Central wireframe icosahedron
    const sGeo  = new THREE.IcosahedronGeometry(1.5, 3);
    const sEdge = new THREE.EdgesGeometry(sGeo);
    const sMat  = new THREE.LineBasicMaterial({ color: 0xc9a84c, transparent: true, opacity: 0.25 });
    const sphere = new THREE.LineSegments(sEdge, sMat);
    scene.add(sphere);

    const igSphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.3, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0xc9a84c, transparent: true, opacity: 0.04 })
    );
    scene.add(igSphere);

    // Orbital rings
    const ringData = [
      { r: 2.2, op: 0.20, color: 0x4a8cf7, rx: Math.PI / 2.5, speed:  0.005  },
      { r: 2.8, op: 0.15, color: 0xc9a84c, rx: Math.PI / 4,   speed: -0.003  },
      { r: 3.4, op: 0.10, color: 0x6ee7b7, rx: Math.PI / 6,   speed:  0.002  },
      { r: 4.0, op: 0.07, color: 0xfbbf24, rx: Math.PI / 8,   speed: -0.0015 },
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
      pPos[i * 3]     = (Math.random() - 0.5) * 14;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({
      size: 0.04, color: 0xffffff, transparent: true, opacity: 0.18
    })));

    let mx = 0, my = 0;
    document.addEventListener('mousemove', e => {
      mx = (e.clientX / innerWidth  - 0.5) * 2;
      my = (e.clientY / innerHeight - 0.5) * 2;
    });

    let t = 0;
    (function tick() {
      requestAnimationFrame(tick);
      t += 0.01;
      sphere.rotation.y   += 0.004;
      sphere.rotation.x   += 0.001;
      igSphere.rotation.y += 0.004;
      rings.forEach(r => r.rotation.z += r.userData.speed);
      dots.forEach(d => {
        const rData = ringData[d.userData.ring];
        const angle = t * d.userData.speed + d.userData.offset;
        const ry    = rData.rx;
        d.position.x = d.userData.r * Math.cos(angle);
        d.position.y = d.userData.r * Math.sin(angle) * Math.cos(ry);
        d.position.z = d.userData.r * Math.sin(angle) * Math.sin(ry);
      });
      cam.position.x += (mx * 0.4  - cam.position.x) * 0.04;
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
  };

  if (window.requestIdleCallback) { requestIdleCallback(initThree, { timeout: 2000 }); }
  else { setTimeout(initThree, 200); }
})();
