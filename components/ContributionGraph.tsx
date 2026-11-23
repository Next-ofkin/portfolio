import { formatDate, groupWeeks, monthLabels, type ContributionDay } from "@/lib/github-parse";

const FILL = ["rgba(255,255,255,0.06)", "#312e81", "#4338ca", "#6366f1", "#a5a8ff"];
const CELL = 11;
const GAP = 3;

// Last-year calendar as a static SVG. On phones the strip scrolls, and starts at the newest weeks
// (rtl container, ltr content) so visitors see recent activity first without any script.
export function ContributionGraph({ days, total }: { days: ContributionDay[]; total: number }) {
  const weeks = groupWeeks(days);
  const labels = monthLabels(weeks);
  const step = CELL + GAP;
  const top = 18;
  const width = weeks.length * step - GAP;
  const height = top + 7 * step - GAP;

  return (
    <figure>
      <figcaption className="mb-5 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <p className="font-display text-2xl font-semibold tracking-tight">
          {total.toLocaleString("en-US")} contributions in the last year
        </p>
        <p className="text-sm text-muted">
          {formatDate(days[0].date)} to {formatDate(days[days.length - 1].date)}
        </p>
      </figcaption>
      <div className="overflow-x-auto pb-1" dir="rtl">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width={width}
          height={height}
          role="img"
          aria-label={`${total} GitHub contributions in the last year`}
          className="block min-w-[640px] max-w-full"
          style={{ width: "100%", height: "auto", direction: "ltr" }}
        >
          {weeks.map((w, wi) => (
            <g key={wi} transform={`translate(${wi * step} 0)`}>
              {labels[wi] && (
                <text x="0" y="10" fill="#a3a3a3" fontSize="10" fontFamily="var(--font-sans)">
                  {labels[wi]}
                </text>
              )}
              {w.map(
                (d, di) =>
                  d && (
                    <rect
                      key={d.date}
                      x="0"
                      y={top + di * step}
                      width={CELL}
                      height={CELL}
                      rx="2.5"
                      fill={FILL[d.level]}
                    >
                      <title>{`${d.count} ${d.count === 1 ? "contribution" : "contributions"} on ${formatDate(d.date)}`}</title>
                    </rect>
                  ),
              )}
            </g>
          ))}
        </svg>
      </div>
      <div className="mt-4 flex items-center justify-end gap-2 text-xs text-muted" aria-hidden="true">
        Less
        {FILL.map((c) => (
          <span key={c} className="h-2.5 w-2.5 rounded-sm" style={{ background: c }} />
        ))}
        More
      </div>
    </figure>
  );
}
