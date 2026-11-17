"use client";

// Christmas backdrop shared by the draw page and the admin page: falling snow
// and a string of blinking lights. Flakes are generated after mount so server
// and client HTML match.
import { useEffect, useState } from "react";

interface Flake {
  left: number;
  size: number;
  delay: number;
  duration: number;
  drift: number;
  opacity: number;
}

const BULBS = ["#ff4d4d", "#ffd23f", "#3ddc84", "#4dabff", "#ff8ad8"];

export const SANTA_CSS = `
@keyframes ss-fall {
  0% { transform: translate3d(0, -10vh, 0); }
  100% { transform: translate3d(var(--drift), 110vh, 0); }
}
@keyframes ss-blink {
  0%, 100% { opacity: 1; filter: brightness(1.15); }
  50% { opacity: .35; filter: brightness(.6); }
}
@keyframes ss-bob {
  0%, 100% { transform: translateY(0) rotate(-1.5deg); }
  50% { transform: translateY(-10px) rotate(1.5deg); }
}
@keyframes ss-shake {
  0% { transform: translate(0,0) rotate(0); }
  10% { transform: translate(-2px,1px) rotate(-2deg); }
  20% { transform: translate(2px,-1px) rotate(2deg); }
  30% { transform: translate(-4px,2px) rotate(-4deg); }
  40% { transform: translate(4px,-2px) rotate(4deg); }
  50% { transform: translate(-6px,3px) rotate(-6deg) scale(1.03); }
  60% { transform: translate(6px,-3px) rotate(6deg) scale(1.05); }
  70% { transform: translate(-9px,4px) rotate(-8deg) scale(1.07); }
  80% { transform: translate(9px,-4px) rotate(9deg) scale(1.1); }
  90% { transform: translate(-12px,5px) rotate(-11deg) scale(1.14); }
  100% { transform: translate(12px,-5px) rotate(12deg) scale(1.2); }
}
@keyframes ss-glow {
  0%, 100% { box-shadow: 0 0 30px 6px rgba(255,200,40,.35); }
  50% { box-shadow: 0 0 60px 18px rgba(255,200,40,.6); }
}
@keyframes ss-twinkle {
  0%, 100% { opacity: .2; transform: scale(.8); }
  50% { opacity: 1; transform: scale(1.15); }
}
`;

export function Snow({ count = 60, contained = false }: { count?: number; contained?: boolean }) {
  const [flakes, setFlakes] = useState<Flake[]>([]);

  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    setFlakes(
      Array.from({ length: reduce ? 0 : count }, () => ({
        left: Math.random() * 100,
        size: 2 + Math.random() * 5,
        delay: -Math.random() * 14,
        duration: 8 + Math.random() * 10,
        drift: (Math.random() - 0.5) * 120,
        opacity: 0.35 + Math.random() * 0.6,
      })),
    );
  }, [count]);

  return (
    <div
      aria-hidden
      className={`${contained ? "absolute" : "fixed"} inset-0 overflow-hidden pointer-events-none`}
    >
      {flakes.map((f, i) => (
        <span
          key={i}
          className="absolute top-0 rounded-full bg-white"
          style={
            {
              left: `${f.left}%`,
              width: f.size,
              height: f.size,
              opacity: f.opacity,
              filter: f.size > 5 ? "blur(1px)" : undefined,
              animation: `ss-fall ${f.duration}s linear ${f.delay}s infinite`,
              "--drift": `${f.drift}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

export function Lights({ count = 18 }: { count?: number }) {
  return (
    <div aria-hidden className="pointer-events-none relative h-12 w-full overflow-hidden">
      <svg className="absolute inset-x-0 top-0 h-6 w-full" preserveAspectRatio="none" viewBox="0 0 100 10">
        <path d="M0 2 Q 12.5 9 25 2 T 50 2 T 75 2 T 100 2" fill="none" stroke="#1f3b2d" strokeWidth="0.6" />
      </svg>
      <div className="absolute inset-x-0 top-0 flex justify-between px-[2%]">
        {Array.from({ length: count }, (_, i) => {
          const t = (i + 0.5) / count;
          const y = 2 + 7 * Math.abs(Math.sin(t * Math.PI * 4)) * 1.4;
          const color = BULBS[i % BULBS.length];
          return (
            <span
              key={i}
              className="block h-4 w-2.5 rounded-b-full rounded-t-sm"
              style={{
                marginTop: y,
                background: color,
                boxShadow: `0 0 10px 2px ${color}`,
                animation: `ss-blink ${1.4 + (i % 3) * 0.35}s ease-in-out ${(i % 5) * 0.27}s infinite`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
