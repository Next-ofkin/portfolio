import { SIG_H, SIG_W, strokePath, type Signature } from "@/lib/signature-shape";

export function SignatureSvg({ sig, className }: { sig: Pick<Signature, "strokes" | "color">; className?: string }) {
  return (
    <svg viewBox={`0 0 ${SIG_W} ${SIG_H}`} className={className} aria-hidden="true" focusable="false">
      {sig.strokes.map((s, i) => (
        <path
          key={i}
          d={strokePath(s)}
          fill="none"
          stroke={sig.color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}
