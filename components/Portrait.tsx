import Image from "next/image";
import photo from "@/public/excel-shogbola.webp";
import { PortraitSwitch } from "./PortraitSwitch";

// The portrait sits in front of the same six strings as the hero, lit from behind so the black shirt
// still reads on the dark page.
export function Portrait() {
  const strings = [0, 1, 2, 3, 4, 5];
  return (
    <figure className="portrait relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-line bg-surface">
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(55% 45% at 62% 30%, rgba(245,158,11,0.32), transparent 70%), radial-gradient(60% 55% at 25% 85%, rgba(99,102,241,0.38), transparent 70%)",
        }}
      />
      <svg
        aria-hidden="true"
        viewBox="0 0 400 500"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        {strings.map((i) => (
          <path
            key={i}
            d={`M0 ${150 + i * 34} C120 ${140 + i * 34} 280 ${162 + i * 34} 400 ${150 + i * 34}`}
            className={`portrait-string ${i < 3 ? "string-accent" : "string-gold"}`}
            style={{ animationDelay: `${i * -0.7}s` }}
            strokeWidth={1 + i * 0.5}
            fill="none"
            opacity="0.55"
          />
        ))}
      </svg>
      <PortraitSwitch
        photo={
          <Image
            src={photo}
            alt="Excel Shogbola, arms folded, smiling and looking off to the side"
            placeholder="blur"
            sizes="(min-width: 768px) 40vw, 92vw"
            className="absolute inset-x-0 bottom-0 h-auto w-full"
          />
        }
      />
    </figure>
  );
}
