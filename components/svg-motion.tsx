// Small SMIL building blocks shared by the project scenes and the architecture diagrams.

export const ease = "0.4 0 0.2 1";

// A dot that travels along `path` during the first `travel` share of each `dur`-second cycle.
export function Pulse({
  path,
  dur,
  begin = 0,
  travel = 0.4,
  r = 3.5,
  className = "v-fill-acc",
}: {
  path: string;
  dur: number;
  begin?: number;
  travel?: number;
  r?: number;
  className?: string;
}) {
  const t = travel.toFixed(3);
  return (
    <circle r={r} className={className} opacity="0">
      <animateMotion
        path={path}
        dur={`${dur}s`}
        begin={`${begin}s`}
        repeatCount="indefinite"
        keyPoints="0;1;1"
        keyTimes={`0;${t};1`}
        calcMode="linear"
      />
      <animate
        attributeName="opacity"
        values="0;1;1;0;0"
        keyTimes={`0;0.03;${(travel - 0.02).toFixed(3)};${t};1`}
        dur={`${dur}s`}
        begin={`${begin}s`}
        repeatCount="indefinite"
      />
    </circle>
  );
}

// A short glow at share `at` of each cycle.
export function Flash({ at, dur, begin = 0, peak = 0.4 }: { at: number; dur: number; begin?: number; peak?: number }) {
  const a = Math.min(at, 0.7);
  return (
    <animate
      attributeName="opacity"
      values={`0;0;${peak};0;0`}
      keyTimes={`0;${a.toFixed(3)};${(a + 0.04).toFixed(3)};${(a + 0.28).toFixed(3)};1`}
      dur={`${dur}s`}
      begin={`${begin}s`}
      repeatCount="indefinite"
    />
  );
}

export function Ripple({ cx, cy, r, grow = 18, dur = 1.6 }: { cx: number; cy: number; r: number; grow?: number; dur?: number }) {
  return (
    <circle cx={cx} cy={cy} r={r} className="v-acc" opacity="0">
      <animate attributeName="r" values={`${r};${r + grow}`} dur={`${dur}s`} repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.7;0" dur={`${dur}s`} repeatCount="indefinite" />
    </circle>
  );
}

