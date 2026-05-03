import { useMemo } from "react";
import doodleCup from "@/assets/doodle-cup.png";
import doodleFairy from "@/assets/doodle-fairy.png";
import doodleFlowerPink from "@/assets/doodle-flower-pink.png";
import doodleFlowerYellow from "@/assets/doodle-flower-yellow.png";
import badgeTeaMagic from "@/assets/badge-tea-magic.png";

const DOODLES: { src: string; alt: string; spin?: boolean }[] = [
  { src: doodleCup, alt: "Steaming teacup" },
  { src: doodleFairy, alt: "Tea fairy" },
  { src: doodleFlowerPink, alt: "Pink flower" },
  { src: doodleFlowerYellow, alt: "Yellow flower" },
  { src: badgeTeaMagic, alt: "Tea magic badge", spin: true },
];

const MESSAGES = [
  "steeping…",
  "picking petals…",
  "stirring the magic…",
  "brewing something good…",
  "gathering herbs…",
];

interface DoodleLoaderProps {
  message?: string;
  className?: string;
  /** full screen overlay vs inline */
  fullScreen?: boolean;
}

export function DoodleLoader({
  message,
  className = "",
  fullScreen = false,
}: DoodleLoaderProps) {
  const { doodle, label } = useMemo(() => {
    return {
      doodle: DOODLES[Math.floor(Math.random() * DOODLES.length)],
      label: message ?? MESSAGES[Math.floor(Math.random() * MESSAGES.length)],
    };
  }, [message]);

  const wrapper = fullScreen
    ? "fixed inset-0 z-50 flex flex-col items-center justify-center bg-paper/80 backdrop-blur-sm"
    : "flex flex-col items-center justify-center py-16";

  return (
    <div className={`${wrapper} ${className}`} role="status" aria-live="polite">
      <img
        src={doodle.src}
        alt=""
        aria-hidden="true"
        className={`w-24 md:w-32 drop-shadow-lg ${
          doodle.spin ? "animate-spin-slow" : "animate-bounce-soft"
        }`}
      />
      <p className="mt-6 font-marker text-xl text-clover">{label}</p>
      <span className="sr-only">Loading {doodle.alt}</span>
    </div>
  );
}
