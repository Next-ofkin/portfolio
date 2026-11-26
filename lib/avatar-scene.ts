import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

// Excel's 3D head-and-shoulders, made in MetaPerson from his photo. It ships as a T-pose, so the arms are
// lowered here; the grey tee is darkened to his usual black. Head and eyes follow the pointer, he blinks
// and breathes, a tap makes him smile and nod, and a drag turns him. Loaded only when it scrolls into view.

export type AvatarHandle = { dispose: () => void };
type Options = { reduceMotion: boolean; onTap: () => void; onReady: () => void; onError: (e: unknown) => void };

const MODEL_URL = "/avatar/excel.glb";

type Morphs = { mesh: THREE.Mesh; dict: Record<string, number> }[];

function setMorph(morphs: Morphs, name: string, v: number) {
  for (const { mesh, dict } of morphs) {
    const i = dict[name];
    if (i !== undefined && mesh.morphTargetInfluences) mesh.morphTargetInfluences[i] = v;
  }
}

// Point a bone along a world-space direction (used once, to take the arms out of the T-pose).
function aim(bone: THREE.Object3D, child: THREE.Object3D, target: THREE.Vector3) {
  bone.parent?.updateMatrixWorld(true);
  bone.updateMatrixWorld(true);
  const a = new THREE.Vector3().setFromMatrixPosition(bone.matrixWorld);
  const b = new THREE.Vector3().setFromMatrixPosition(child.matrixWorld);
  const delta = new THREE.Quaternion().setFromUnitVectors(b.sub(a).normalize(), target.clone().normalize());
  const world = bone.getWorldQuaternion(new THREE.Quaternion());
  const parent = bone.parent ? bone.parent.getWorldQuaternion(new THREE.Quaternion()) : new THREE.Quaternion();
  bone.quaternion.copy(parent.invert().multiply(delta.multiply(world)));
}

// A bone we turn by small world-axis amounts on top of its rest pose.
function turner(bone: THREE.Object3D | undefined) {
  if (!bone) return null;
  const rest = bone.quaternion.clone();
  const parent = bone.parent ? bone.parent.getWorldQuaternion(new THREE.Quaternion()) : new THREE.Quaternion();
  const parentInv = parent.clone().invert();
  const e = new THREE.Euler();
  const d = new THREE.Quaternion();
  return (pitch: number, yaw: number) => {
    d.setFromEuler(e.set(pitch, yaw, 0, "YXZ"));
    // express the world rotation in the parent's rest frame, then apply it on top of the rest pose
    bone.quaternion.copy(parentInv).multiply(d).multiply(parent).multiply(rest);
  };
}

export function createAvatar(canvas: HTMLCanvasElement, opts: Options): AvatarHandle {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(24, 0.8, 0.05, 20);

  // Soft fill, warm amber key from the right, indigo rim from behind (the site's two colours).
  scene.add(new THREE.HemisphereLight(0xffffff, 0x2a2440, 1.5));
  const key = new THREE.DirectionalLight(0xffe2b8, 2.4);
  key.position.set(1.6, 2.6, 2.4);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xffffff, 0.6);
  fill.position.set(-2, 1.6, 2);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0x818cf8, 3.4);
  rim.position.set(-2.4, 2.4, -2.2);
  scene.add(rim);
  const rim2 = new THREE.DirectionalLight(0xf59e0b, 1.8);
  rim2.position.set(2.4, 1.8, -2);
  scene.add(rim2);

  const pivot = new THREE.Group(); // drag turns this
  scene.add(pivot);

  let disposed = false;
  let ready = false;
  const morphs: Morphs = [];
  let turnNeck: ReturnType<typeof turner> = null;
  let turnHead: ReturnType<typeof turner> = null;
  let turnEyeL: ReturnType<typeof turner> = null;
  let turnEyeR: ReturnType<typeof turner> = null;
  let spine: THREE.Object3D | undefined;
  let spineRest = new THREE.Quaternion();
  let model: THREE.Object3D | null = null;

  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  loader.load(
    MODEL_URL,
    (gltf) => {
      if (disposed) return;
      model = gltf.scene;
      const B = (n: string) => model?.getObjectByName(n);
      model.traverse((o) => {
        if (!(o instanceof THREE.Mesh)) return;
        o.frustumCulled = false; // bones move him outside the bind-pose bounds
        if (o.morphTargetDictionary) morphs.push({ mesh: o, dict: o.morphTargetDictionary });
        if (o.name === "outfit") {
          const m = o.material as THREE.MeshStandardMaterial;
          m.color.setHex(0x2b2b2e); // grey tee to near-black
          m.roughness = 0.85;
        }
      });
      // Arms down, elbows soft.
      for (const [side, sx] of [["Left", 1], ["Right", -1]] as const) {
        const arm = B(`${side}Arm`);
        const fore = B(`${side}ForeArm`);
        const hand = B(`${side}Hand`);
        if (arm && fore) aim(arm, fore, new THREE.Vector3(sx * 0.18, -1, 0.05));
        if (fore && hand) aim(fore, hand, new THREE.Vector3(sx * 0.08, -1, 0.35));
      }
      model.updateMatrixWorld(true);
      turnNeck = turner(B("Neck"));
      turnHead = turner(B("Head"));
      turnEyeL = turner(B("LeftEye"));
      turnEyeR = turner(B("RightEye"));
      spine = B("Spine2");
      if (spine) spineRest = spine.quaternion.clone();
      setMorph(morphs, "mouthSmileLeft", 0.25);
      setMorph(morphs, "mouthSmileRight", 0.25);
      pivot.add(model);
      ready = true;
      resize();
      frame();
      opts.onReady();
      if (visible) start();
    },
    undefined,
    (err) => {
      if (!disposed) opts.onError(err);
    },
  );

  // ---------- Sizing: head and shoulders ----------
  const resize = () => {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const z = w / h < 0.75 ? 2.2 : 2.0;
    camera.position.set(0, 1.55, z);
    camera.lookAt(0, 1.46, 0);
    camera.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(() => {
    resize();
    if (!running && ready) renderer.render(scene, camera);
  });
  ro.observe(canvas);

  // ---------- Interaction ----------
  const look = { x: 0, y: 0 }; // where the pointer is, -1..1
  const cur = { x: 0, y: 0 };
  let spin = 0;
  let spinVel = 0;
  let drag: { x: number; moved: number } | null = null;
  let joy = 0; // 1 right after a tap, fades out

  const onMove = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    look.x = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2)));
    look.y = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height * 0.3)) / (window.innerHeight / 2)));
    if (drag) {
      const dx = e.clientX - drag.x;
      drag.x = e.clientX;
      drag.moved += Math.abs(dx);
      spinVel = dx * 0.01;
      spin = Math.max(-1.2, Math.min(1.2, spin + spinVel));
    }
  };
  const onDown = (e: PointerEvent) => {
    drag = { x: e.clientX, moved: 0 };
    canvas.setPointerCapture?.(e.pointerId);
  };
  const onUp = () => {
    if (drag && drag.moved < 6) {
      joy = 1;
      opts.onTap();
      if (!running && ready) {
        // reduced motion: show the smile as a still
        setMorph(morphs, "mouthSmileLeft", 0.9);
        setMorph(morphs, "mouthSmileRight", 0.9);
        renderer.render(scene, camera);
      }
    }
    drag = null;
  };
  window.addEventListener("pointermove", onMove, { passive: true });
  canvas.addEventListener("pointerdown", onDown);
  window.addEventListener("pointerup", onUp);

  // ---------- Animation ----------
  let raf = 0;
  let running = false;
  let visible = false;
  let nextBlink = performance.now() + 2000;
  const t0 = performance.now();
  let last = t0;
  const sq = new THREE.Quaternion();
  const se = new THREE.Euler();

  const frame = () => {
    const now = performance.now();
    const t = (now - t0) / 1000;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    cur.x += (look.x - cur.x) * 0.07;
    cur.y += (look.y - cur.y) * 0.07;

    // drag spin, settling back to face front
    if (!drag) {
      spinVel *= 0.9;
      spin += spinVel;
      spin *= 0.96;
    }
    pivot.rotation.y = spin;

    // a tap: smile wide and nod
    joy = Math.max(0, joy - dt * 0.45);
    const nod = joy > 0.7 ? Math.sin((1 - joy) * Math.PI * 3.3) * 0.12 : 0;
    const smile = 0.25 + 0.7 * Math.min(1, joy * 2.5);
    setMorph(morphs, "mouthSmileLeft", smile);
    setMorph(morphs, "mouthSmileRight", smile);
    setMorph(morphs, "cheekSquintLeft", smile * 0.35);
    setMorph(morphs, "cheekSquintRight", smile * 0.35);

    // follow the pointer: neck and head share the turn, the eyes lead
    const yaw = cur.x * 0.5;
    const pitch = cur.y * 0.22;
    turnNeck?.(pitch * 0.4, yaw * 0.4);
    turnHead?.(pitch * 0.6 + nod, yaw * 0.6);
    turnEyeL?.(cur.y * 0.12, cur.x * 0.18);
    turnEyeR?.(cur.y * 0.12, cur.x * 0.18);

    // breathe
    if (spine) {
      sq.setFromEuler(se.set(Math.sin(t * 1.5) * 0.012, 0, 0));
      spine.quaternion.copy(spineRest).multiply(sq);
    }
    if (model) model.position.y = Math.sin(t * 1.5) * 0.002;

    // blink
    const blinkT = now - nextBlink;
    const lid = blinkT > 0 && blinkT < 160 ? Math.sin((blinkT / 160) * Math.PI) : 0;
    setMorph(morphs, "eyeBlinkLeft", lid);
    setMorph(morphs, "eyeBlinkRight", lid);
    if (blinkT > 160) nextBlink = now + 2200 + Math.random() * 3000;

    renderer.render(scene, camera);
    if (running) raf = requestAnimationFrame(frame);
  };

  const start = () => {
    if (running || opts.reduceMotion || !ready) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };
  const io = new IntersectionObserver(
    ([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
      else stop();
    },
    { threshold: 0.05 },
  );
  io.observe(canvas);

  return {
    dispose() {
      disposed = true;
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
          for (const x of Array.isArray(m) ? m : [m]) {
            for (const v of Object.values(x)) if (v instanceof THREE.Texture) v.dispose();
            x.dispose();
          }
        }
      });
      renderer.dispose();
    },
  };
}
