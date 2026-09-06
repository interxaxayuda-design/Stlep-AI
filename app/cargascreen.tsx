"use client";

import { useMemo, type CSSProperties } from "react";

// ---------------------------------------------------------------------------
// Starfield: misma capa de estrellas con deriva lenta que en las otras
// pantallas, para que la transición se sienta parte de la misma app.
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
      driftX: `${(Math.random() - 0.5) * 90}px`,
      driftY: `${(Math.random() - 0.5) * 90}px`,
      driftDuration: `${10 + Math.random() * 14}s`,
      driftDelay: `${Math.random() * -30}s`,
      tint: Math.random() < 0.7 ? "#e6e9ff" : Math.random() < 0.85 ? "#c4b5fd" : "#93c5fd",
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {stars.map((s) => (
        <span
          key={s.id}
          className="absolute rounded-full"
          style={
            {
              top: s.top,
              left: s.left,
              width: s.size,
              height: s.size,
              backgroundColor: s.tint,
              opacity: s.opacity,
              boxShadow: s.size > 1 ? `0 0 ${s.size * 2}px ${s.tint}` : "none",
              animation: `star-twinkle ${s.duration} ease-in-out infinite, star-drift ${s.driftDuration} ease-in-out infinite alternate`,
              animationDelay: `${s.delay}, ${s.driftDelay}`,
              "--drift-x": s.driftX,
              "--drift-y": s.driftY,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

export default function CargaScreen() {
  return (
    <section className="relative w-full h-screen overflow-hidden font-sans flex flex-col items-center justify-center select-none bg-[#050510]">

      <style>{`
        @keyframes star-twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
        @keyframes star-drift {
          0% { transform: translate(0, 0); }
          100% { transform: translate(var(--drift-x), var(--drift-y)); }
        }
        @keyframes loading-bar-sweep {
          0% { transform: translateX(-110%); }
          100% { transform: translateX(340%); }
        }
        @keyframes soft-pulse {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 1; }
        }
        @keyframes glow-drift {
          0%, 100% { transform: translate3d(-4%, 0, 0) scale(1); }
          50% { transform: translate3d(4%, 0, 0) scale(1.06); }
        }
      `}</style>

      {/* Nebulosa de fondo: una aurora ancha y fija arriba (como la referencia),
          que solo se mueve con transform (GPU) — nunca hacia abajo, nunca
          recalculando el gradiente. */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute left-1/2 -top-[18%] -translate-x-1/2 w-[160vw] h-[45vh] min-h-[320px] rounded-[50%] will-change-transform"
          style={{
            background:
              "radial-gradient(closest-side, rgba(99,140,255,0.55) 0%, rgba(80,90,220,0.32) 45%, transparent 75%)",
            filter: "blur(70px)",
            animation: "glow-drift 14s ease-in-out infinite",
          }}
        />
        <Starfield />
      </div>

      {/* Contenido central */}
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <span
          className="text-xs font-medium tracking-[0.2em] uppercase text-indigo-300/80 mb-4"
          style={{ animation: "soft-pulse 2.4s ease-in-out infinite" }}
        >
          Procesando
        </span>

        <h1 className="font-display text-2xl md:text-3xl font-semibold text-white tracking-tight mb-10">
          Subiendo tu video…
        </h1>

        {/* Barra de carga moderna, estilo indeterminado */}
        <div className="w-[260px] sm:w-[340px] h-1.5 rounded-full bg-white/10 overflow-hidden relative">
          <div
            className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-gradient-to-r from-indigo-500 via-purple-400 to-indigo-500 shadow-[0_0_12px_rgba(129,140,248,0.6)]"
            style={{ animation: "loading-bar-sweep 1.5s ease-in-out infinite" }}
          />
        </div>

        <p className="mt-6 text-slate-400 text-sm tracking-wide max-w-xs">
          No cierres esta ventana, esto puede tardar un momento.
        </p>
      </div>
    </section>
  );
}