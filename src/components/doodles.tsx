import type { SVGProps } from "react";

export function Squiggle(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 200 20" fill="none" {...props}>
      <path
        d="M2 10 Q 25 -5, 50 10 T 100 10 T 150 10 T 198 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Sparkle(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 40 40" fill="none" {...props}>
      <path
        d="M20 4 L23 17 L36 20 L23 23 L20 36 L17 23 L4 20 L17 17 Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Sun(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 60 60" fill="none" {...props}>
      <circle cx="30" cy="30" r="12" fill="currentColor" />
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i * Math.PI) / 4;
        const x1 = 30 + Math.cos(a) * 18;
        const y1 = 30 + Math.sin(a) * 18;
        const x2 = 30 + Math.cos(a) * 26;
        const y2 = 30 + Math.sin(a) * 26;
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

export function Clover(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 60 60" fill="none" {...props}>
      <g fill="currentColor">
        <ellipse cx="30" cy="18" rx="9" ry="11" />
        <ellipse cx="18" cy="30" rx="11" ry="9" />
        <ellipse cx="42" cy="30" rx="11" ry="9" />
        <ellipse cx="30" cy="42" rx="9" ry="11" />
      </g>
      <line
        x1="30"
        y1="40"
        x2="30"
        y2="58"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Leaf(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 60 60" fill="none" {...props}>
      <path
        d="M10 50 Q 10 10, 50 10 Q 50 50, 10 50 Z"
        fill="currentColor"
      />
      <path
        d="M14 46 L 46 14"
        stroke="oklch(0.97 0.03 95)"
        strokeWidth="2"
      />
    </svg>
  );
}
