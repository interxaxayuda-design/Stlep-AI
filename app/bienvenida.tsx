"use client";

import { useEffect, useMemo, useState } from "react";

interface BienvenidaProps {
  user: { name: string; avatar: string };
  onComplete: () => void;
  durationMs?: number;
}

// ---------------------------------------------------------------------------
// Starfield: misma idea que en Pantalla2, con tinte celeste/blanco para que
// combine con el fondo azul en vez del violeta.
// ---------------------------------------------------------------------------
function Starfield() {
  const stars = useMemo(() => {
    return Array.from({ length: 140 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() < 0.85 ? 1 : Math.random() < 0.97 ? 2 : 3,
      opacity: 0.25 + Math.random() * 0.55,
      duration: `${4 + Math.random() * 5}s`,
      delay: `${Math.random() * 5}s`,
      tint: Math.random() < 0.7 ? "#e8f1ff" : Math.random() < 0.85 ? "#93c5fd" : "#60a5fa",
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {stars.map((s) => (
        <span
          key={s.id}
          className="absolute rounded-full"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            backgroundColor: s.tint,
            opacity: s.opacity,
            boxShadow: s.size > 1 ? `0 0 ${s.size * 2}px ${s.tint}` : "none",
            animation: `star-twinkle ${s.duration} ease-in-out infinite`,
            animationDelay: s.delay,
          }}
        />
      ))}
    </div>
  );
}

function getSaludo() {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

export default function Bienvenida({ user, onComplete, durationMs = 5000 }: BienvenidaProps) {
  const saludo = useMemo(getSaludo, []);

  useEffect(() => {
    const timer = setTimeout(onComplete, durationMs);
    return () => clearTimeout(timer);
  }, [onComplete, durationMs]);

  return (
    <section className="relative w-full h-screen overflow-hidden font-sans flex flex-col items-center justify-center select-none bg-[#050b1a]">

      <style>{`
        @keyframes star-twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Fondo azul con nebulosa */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 90% 70% at 50% 30%, rgba(37,99,235,0.35) 0%, rgba(15,45,110,0.25) 35%, rgba(5,11,26,0.92) 72%), " +
              "radial-gradient(ellipse 70% 60% at 15% 90%, rgba(30,64,175,0.28) 0%, transparent 60%), " +
              "radial-gradient(ellipse 60% 50% at 88% 15%, rgba(56,130,246,0.22) 0%, transparent 60%)",
          }}
        />
        <Starfield />
      </div>

      {/* Contenido */}
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <h1
          className="font-display text-4xl md:text-6xl font-extrabold text-white tracking-tight drop-shadow-[0_0_40px_rgba(59,130,246,0.35)]"
          style={{ animation: "fade-in-up 700ms ease-out both", animationDelay: "150ms" }}
        >
          {saludo}
        </h1>

        <div
          className="mt-8 flex items-center gap-3 bg-white/[0.06] border border-white/10 pl-2 pr-5 py-2 rounded-full backdrop-blur-xl"
          style={{ animation: "fade-in-up 700ms ease-out both", animationDelay: "1100ms" }}
        >
          <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 shrink-0">
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          </div>
          <span className="text-white text-base font-medium tracking-wide">{user.name}</span>
        </div>

        <p
          className="mt-10 text-slate-300 text-lg md:text-xl font-medium tracking-wide"
          style={{ animation: "fade-in-up 700ms ease-out both", animationDelay: "2200ms" }}
        >
          Empecemos
        </p>
      </div>
    </section>
  );
}