import * as THREE from "three";

// A stylized "vinyl toy" Excel, built from simple shapes: short twists with a fade, goatee, a black polo with
// white-tipped collar and sleeves, an earbud, and arms folded. Head and eyes follow the pointer, he blinks and
// breathes, and a tap makes him hop and say hi. Loaded only when it scrolls into view.

export type AvatarHandle = { dispose: () => void };
type Options = { reduceMotion: boolean; onTap: () => void };

const C = {
  skin: 0x6b4430,
  skinShade: 0x5c3a29,
  hair: 0x141010,
  fade: 0x2b1e18,
  shirt: 0x141414,
  white: 0xf3f1ec,
  dark: 0x241310,
  indigo: 0x6366f1,
  amber: 0xf59e0b,
};

function mat(color: number, roughness = 0.6, metalness = 0) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

// A rounded limb between two points.
function limb(a: THREE.Vector3, b: THREE.Vector3, r: number, m: THREE.Material) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const geo = new THREE.CapsuleGeometry(r, Math.max(0.01, dir.length()), 8, 20);
  const mesh = new THREE.Mesh(geo, m);
  mesh.position.copy(a).addScaledVector(dir, 0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  return mesh;
}

// Two thin white rings, like the tipping on a polo's sleeve.
function tipping(at: THREE.Vector3, axis: THREE.Vector3, radius: number, white: THREE.Material) {
  const g = new THREE.Group();
  for (const off of [0, 0.075]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.018, 8, 40), white);
    ring.position.copy(at).addScaledVector(axis, off);
    ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), axis.clone().normalize());
    g.add(ring);
  }
  return g;
}

export function createAvatar(canvas: HTMLCanvasElement, opts: Options): AvatarHandle {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  camera.position.set(0, 2.25, 10.5);
  camera.lookAt(0, 2.05, 0);

  // Light: soft fill, warm amber key from the right, indigo rim from behind (the site's two colours).
  scene.add(new THREE.HemisphereLight(0xffffff, 0x1a1a2e, 1.1));
  const key = new THREE.DirectionalLight(0xffd9a0, 2.2);
  key.position.set(4, 6, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(C.indigo, 3.2);
  rim.position.set(-5, 4, -5);
  scene.add(rim);
  const rim2 = new THREE.DirectionalLight(C.amber, 1.4);
  rim2.position.set(5, 2, -4);
  scene.add(rim2);

  const skin = mat(C.skin, 0.5);
  const skinShade = mat(C.skinShade, 0.55);
  const hair = mat(C.hair, 0.95);
  const fade = mat(C.fade, 0.9);
  const shirt = mat(C.shirt, 0.75);
  const white = mat(C.white, 0.4);
  const dark = mat(C.dark, 0.5);
  const black = mat(0x050505, 0.3, 0.2);

  const figure = new THREE.Group();
  scene.add(figure);

  // ---------- Base: a figurine stand with the site's colours ----------
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.75, 1.85, 0.28, 64), mat(0x101010, 0.45));
  base.position.y = -0.14;
  figure.add(base);
  const ringA = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.025, 8, 80), new THREE.MeshBasicMaterial({ color: C.indigo }));
  ringA.rotation.x = Math.PI / 2;
  ringA.position.y = -0.02;
  figure.add(ringA);
  const ringB = new THREE.Mesh(new THREE.TorusGeometry(1.84, 0.02, 8, 80), new THREE.MeshBasicMaterial({ color: C.amber }));
  ringB.rotation.x = Math.PI / 2;
  ringB.position.y = -0.24;
  figure.add(ringB);

  // ---------- Body: black polo ----------
  const body = new THREE.Group();
  figure.add(body);
  const profile = [
    [0, 0],
    [1.0, 0],
    [1.08, 0.5],
    [1.16, 1.05],
    [1.12, 1.4],
    [0.85, 1.66],
    [0.42, 1.78],
    [0, 1.8],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const torso = new THREE.Mesh(new THREE.LatheGeometry(profile, 64), shirt);
  torso.scale.z = 0.72;
  body.add(torso);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.37, 0.5, 32), skinShade);
  neck.position.y = 1.9;
  body.add(neck);

  // Collar band and flaps, with white tipping
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.43, 0.08, 12, 40), shirt);
  band.rotation.x = Math.PI / 2;
  band.position.y = 1.78;
  band.scale.y = 0.8;
  body.add(band);
  for (const s of [-1, 1]) {
    const flap = new THREE.Group();
    const cloth = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.05, 0.34), shirt);
    flap.add(cloth);
    for (const off of [0.12, 0.155]) {
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.056, 0.016), white);
      stripe.position.z = off;
      flap.add(stripe);
    }
    flap.position.set(s * 0.22, 1.66, 0.5);
    flap.rotation.set(-1.05, s * 0.55, s * 0.25);
    body.add(flap);
  }
  // Placket and buttons
  const placket = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.5, 0.04), mat(0x1c1c1c, 0.7));
  placket.position.set(0, 1.36, 0.8);
  placket.rotation.x = -0.18;
  body.add(placket);
  for (const y of [1.48, 1.28]) {
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 12), white);
    b.position.set(0, y, 0.83 + (1.48 - y) * 0.16);
    body.add(b);
  }

  // ---------- Arms, folded across the chest ----------
  const arms = new THREE.Group();
  body.add(arms);
  for (const s of [-1, 1]) {
    const shoulder = new THREE.Vector3(s * 1.08, 1.42, 0);
    const elbow = new THREE.Vector3(s * 1.12, 0.58, 0.62);
    const hand = new THREE.Vector3(-s * 0.55, s > 0 ? 0.86 : 0.74, s > 0 ? 0.98 : 0.9);
    // short sleeve over the upper arm
    const sleeveEnd = shoulder.clone().lerp(elbow, 0.5);
    arms.add(limb(shoulder, sleeveEnd, 0.34, shirt));
    const axis = new THREE.Vector3().subVectors(elbow, shoulder).normalize();
    arms.add(tipping(sleeveEnd.clone().addScaledVector(axis, -0.08), axis, 0.34, white));
    arms.add(limb(sleeveEnd, elbow, 0.27, skin));
    arms.add(limb(elbow, hand, 0.25, skin));
    const fist = new THREE.Mesh(new THREE.SphereGeometry(0.27, 24, 24), skin);
    fist.position.copy(hand);
    fist.scale.set(1, 0.9, 0.85);
    arms.add(fist);
  }

  // ---------- Head ----------
  const headPivot = new THREE.Group();
  headPivot.position.y = 2.05;
  body.add(headPivot);
  const head = new THREE.Group();
  head.position.y = 1.05;
  headPivot.add(head);

  const skull = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 64), skin);
  skull.scale.set(0.93, 1.06, 0.95);
  head.add(skull);
  // Jaw: a little wider at the bottom, like the photo
  const jaw = new THREE.Mesh(new THREE.SphereGeometry(0.75, 48, 48), skin);
  jaw.position.set(0, -0.38, 0.06);
  jaw.scale.set(1.04, 0.72, 0.95);
  head.add(jaw);

  // Fade: a close-cropped cap over the back and sides
  const fadeCap = new THREE.Mesh(new THREE.SphereGeometry(1.012, 64, 32, 0, Math.PI * 2, 0, 1.3), fade);
  fadeCap.scale.copy(skull.scale);
  fadeCap.rotation.x = -0.32;
  head.add(fadeCap);

  // Twists on top: short ellipsoids standing out from the crown
  const twistGeo = new THREE.SphereGeometry(1, 10, 10);
  const N = 170;
  const twists = new THREE.InstancedMesh(twistGeo, hair, N);
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const up = new THREE.Vector3(0, 1, 0);
  let placed = 0;
  for (let i = 0; i < N * 3 && placed < N; i++) {
    // golden-angle spiral over the crown
    const t = (i + 0.5) / (N * 3);
    const polar = Math.acos(1 - t * 0.55); // top of the head only
    const az = i * 2.399963;
    const n = new THREE.Vector3(Math.sin(polar) * Math.cos(az), Math.cos(polar), Math.sin(polar) * Math.sin(az));
    n.applyAxisAngle(new THREE.Vector3(1, 0, 0), -0.18);
    if (n.y < 0.55 && n.z < -0.1) continue; // keep the back short (fade)
    if (n.z > 0.55 && n.y < 0.75) continue; // clear hairline over the forehead
    const pos = new THREE.Vector3(n.x * 0.93, n.y * 1.06, n.z * 0.95).multiplyScalar(1.02);
    q.setFromUnitVectors(up, n);
    const r = 0.085 + Math.random() * 0.03;
    m4.compose(pos, q, new THREE.Vector3(r, r * (1.7 + Math.random() * 0.6), r));
    twists.setMatrixAt(placed++, m4);
  }
  twists.count = placed;
  head.add(twists);

  // Ears and the earbud
  for (const s of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 24), skinShade);
    ear.position.set(s * 0.9, -0.02, 0);
    ear.scale.set(0.45, 1, 0.75);
    head.add(ear);
  }
  const bud = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.12, 6, 12), black);
  bud.position.set(0.98, -0.02, 0.06);
  bud.rotation.z = 0.5;
  head.add(bud);

  // Eyes, brows, nose, smile, goatee
  const eyes: THREE.Group[] = [];
  const pupils: THREE.Mesh[] = [];
  for (const s of [-1, 1]) {
    const eye = new THREE.Group();
    eye.position.set(s * 0.32, 0.12, 0.8);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.16, 32, 32), white);
    ball.scale.set(1, 1.1, 0.55);
    eye.add(ball);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.085, 24, 24), black);
    pupil.position.z = 0.07;
    pupil.scale.z = 0.5;
    eye.add(pupil);
    const glint = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    glint.position.set(0.03, 0.035, 0.11);
    pupil.add(glint);
    head.add(eye);
    eyes.push(eye);
    pupils.push(pupil);
    const brow = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.24, 4, 8), hair);
    brow.position.set(s * 0.33, 0.36, 0.84);
    brow.rotation.z = Math.PI / 2 + s * 0.12;
    head.add(brow);
  }
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.17, 24, 24), skinShade);
  nose.position.set(0, -0.12, 0.92);
  nose.scale.set(1.45, 0.9, 0.85);
  head.add(nose);
  const smile = new THREE.Group();
  smile.position.set(0, -0.42, 0.86);
  smile.rotation.x = -0.2;
  const teeth = new THREE.Mesh(new THREE.CircleGeometry(0.24, 32, Math.PI, Math.PI), white);
  smile.add(teeth);
  const lip = new THREE.Mesh(new THREE.TorusGeometry(0.245, 0.035, 8, 32, Math.PI), dark);
  lip.rotation.z = Math.PI;
  smile.add(lip);
  const top = new THREE.Mesh(new THREE.CapsuleGeometry(0.03, 0.46, 4, 8), dark);
  top.rotation.z = Math.PI / 2;
  smile.add(top);
  head.add(smile);
  const goatee = new THREE.Mesh(new THREE.SphereGeometry(0.2, 24, 24), hair);
  goatee.position.set(0, -0.8, 0.62);
  goatee.scale.set(1.05, 0.8, 0.75);
  head.add(goatee);
  const stache = new THREE.Mesh(new THREE.CapsuleGeometry(0.025, 0.32, 4, 8), fade);
  stache.position.set(0, -0.3, 0.95);
  stache.rotation.z = Math.PI / 2;
  head.add(stache);

  // Soft contact shadow under the base
  const shadowTex = (() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d");
    if (g) {
      const grad = g.createRadialGradient(64, 64, 10, 64, 64, 64);
      grad.addColorStop(0, "rgba(0,0,0,0.55)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = grad;
      g.fillRect(0, 0, 128, 128);
    }
    return new THREE.CanvasTexture(c);
  })();
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 5),
    new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -0.3;
  scene.add(shadow);

  // ---------- Sizing ----------
  const resize = () => {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // keep the whole figure in frame on tall or wide boxes
    camera.position.z = w / h < 0.8 ? 12.5 : 10.5;
    camera.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  // ---------- Interaction ----------
  const look = { x: 0, y: 0 }; // where the pointer is, -1..1
  const cur = { x: 0, y: 0 };
  let spin = 0; // drag to turn him
  let spinVel = 0;
  let drag: { x: number; moved: number } | null = null;
  let hop = 0; // 0..1 while hopping

  const onMove = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    look.x = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2)));
    look.y = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height * 0.3)) / (window.innerHeight / 2)));
    if (drag) {
      const dx = e.clientX - drag.x;
      drag.x = e.clientX;
      drag.moved += Math.abs(dx);
      spinVel = dx * 0.012;
      spin += spinVel;
    }
  };
  const onDown = (e: PointerEvent) => {
    drag = { x: e.clientX, moved: 0 };
    canvas.setPointerCapture?.(e.pointerId);
  };
  const onUp = () => {
    if (drag && drag.moved < 6) {
      hop = 1;
      opts.onTap();
    }
    drag = null;
  };
  window.addEventListener("pointermove", onMove, { passive: true });
  canvas.addEventListener("pointerdown", onDown);
  window.addEventListener("pointerup", onUp);

  // ---------- Animation ----------
  let raf = 0;
  let running = false;
  let nextBlink = performance.now() + 2500;
  const t0 = performance.now();
  let last = t0;

  const frame = () => {
    const nowMs = performance.now();
    const t = (nowMs - t0) / 1000;
    const dt = Math.min(0.05, (nowMs - last) / 1000);
    last = nowMs;
    // follow the pointer, smoothly
    cur.x += (look.x - cur.x) * 0.08;
    cur.y += (look.y - cur.y) * 0.08;
    headPivot.rotation.y = cur.x * 0.55;
    headPivot.rotation.x = cur.y * 0.22;
    body.rotation.y = cur.x * 0.12;
    for (const p of pupils) p.position.set(cur.x * 0.05, -cur.y * 0.04, 0.07);
    // drag spin with a gentle settle back to facing front
    if (!drag) {
      spinVel *= 0.92;
      spin += spinVel;
      spin *= 0.97;
    }
    figure.rotation.y = spin;
    // breathe
    const breath = Math.sin(t * 1.6);
    torso.scale.y = 1 + breath * 0.012;
    headPivot.position.y = 2.05 + breath * 0.015;
    // blink
    const now = performance.now();
    const blinking = now > nextBlink && now < nextBlink + 130;
    for (const e of eyes) e.scale.y = blinking ? 0.1 : 1;
    if (now > nextBlink + 130) nextBlink = now + 2200 + Math.random() * 2800;
    // hop and nod after a tap
    if (hop > 0) {
      hop = Math.max(0, hop - dt * 1.6);
      const k = Math.sin((1 - hop) * Math.PI);
      figure.position.y = k * 0.35;
      head.rotation.x = -k * 0.25;
    } else {
      figure.position.y = 0;
      head.rotation.x *= 0.9;
    }
    renderer.render(scene, camera);
    if (running) raf = requestAnimationFrame(frame);
  };

  const start = () => {
    if (running || opts.reduceMotion) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };
  frame(); // first picture straight away
  const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { threshold: 0.05 });
  io.observe(canvas);

  return {
    dispose() {
      stop();
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose();
          const m = o.material as THREE.Material | THREE.Material[];
          (Array.isArray(m) ? m : [m]).forEach((x) => x.dispose());
        }
      });
      shadowTex.dispose();
      renderer.dispose();
    },
  };
}
