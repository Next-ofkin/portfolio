// Webcam hand tracking for the Lab, loaded only after the visitor switches it on.
// Video never leaves the device: MediaPipe runs in the browser (WebAssembly, GPU when available).

const VERSION = "1.2.3"; // keep in step with @mediapipe/tasks-vision in package.json
const WASM = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VERSION}/wasm`;
const MODEL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

// One tracked hand, in 0..1 screen space (already mirrored, like a selfie).
export type HandPoint = { x: number; y: number; pinch: boolean };

type Landmark = { x: number; y: number; z: number };

const dist = (a: Landmark, b: Landmark) => Math.hypot(a.x - b.x, a.y - b.y);

export function readHand(lm: Landmark[]): HandPoint {
  const thumb = lm[4];
  const index = lm[8];
  // Pinch is judged against the size of the palm, so it works near and far from the camera.
  const palm = dist(lm[0], lm[9]) || 0.1;
  return { x: 1 - (thumb.x + index.x) / 2, y: (thumb.y + index.y) / 2, pinch: dist(thumb, index) / palm < 0.35 };
}

export async function startHands(video: HTMLVideoElement, onHands: (hands: HandPoint[]) => void): Promise<() => void> {
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      audio: false,
    });
  } catch {
    throw new Error("camera");
  }
  video.srcObject = stream;
  video.muted = true;
  video.playsInline = true;
  await video.play();

  const stopStream = () => stream.getTracks().forEach((t) => t.stop());

  let landmarker: import("@mediapipe/tasks-vision").HandLandmarker;
  try {
    const { FilesetResolver, HandLandmarker } = await import("@mediapipe/tasks-vision");
    const files = await FilesetResolver.forVisionTasks(WASM);
    const options = (delegate: "GPU" | "CPU") => ({
      baseOptions: { modelAssetPath: MODEL, delegate },
      runningMode: "VIDEO" as const,
      numHands: 2,
    });
    try {
      landmarker = await HandLandmarker.createFromOptions(files, options("GPU"));
    } catch {
      landmarker = await HandLandmarker.createFromOptions(files, options("CPU"));
    }
  } catch {
    stopStream();
    throw new Error("model");
  }

  let raf = 0;
  let last = -1;
  let stopped = false;
  const tick = () => {
    if (stopped) return;
    if (video.readyState >= 2 && video.currentTime !== last) {
      last = video.currentTime;
      const res = landmarker.detectForVideo(video, performance.now());
      onHands((res.landmarks ?? []).map((lm) => readHand(lm)));
    }
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  return () => {
    stopped = true;
    cancelAnimationFrame(raf);
    landmarker.close();
    stopStream();
    video.srcObject = null;
  };
}
