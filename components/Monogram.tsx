// "ES" drawn like strings: the E is a stem with three bars of different gauge, the S is one plucked line.
export function Monogram({ className = "h-10 w-auto" }: { className?: string }) {
  return (
    <svg viewBox="0 0 46 40" className={className} fill="none" aria-hidden="true">
      <path d="M8 6V34" stroke="#f5f5f4" strokeWidth="4" strokeLinecap="round" />
      <path d="M8 7H24" stroke="#a5a8ff" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M8 20H21" stroke="#f59e0b" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M8 33H24" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
      <path
        d="M40 12.5C40 7 31 7 31 12.8C31 18.6 41 17.6 41 24.4C41 31.6 30.5 32.4 29.5 27"
        stroke="#f5f5f4"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
