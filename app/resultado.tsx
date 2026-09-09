"use client";

import { useMemo, type CSSProperties } from "react";

interface ResultadoProps {
  videoUrl: string;
}

// ---------------------------------------------------------------------------
// Starfield: mismo criterio que el resto, pero acá el movimiento queda como
// único elemento de vida en el fondo — todo lo demás está quieto, a
// propósito, para que la pantalla se sienta calma.
// ---------------------------------------------------------------------------
function Starfield() {
  const stars = useMemo(() => {
    return Array.from({ length: 120 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() < 0.85 ? 1 : Math.random() < 0.97 ? 2 : 3,
      opacity: 0.2 + Math.random() * 0.45,
      duration: `${5 + Math.random() * 6}s`,
      delay: `${Math.random() * 5}s`,
      driftX: `${(Math.random() - 0.5) * 30}px`,
      driftY: `${(Math.random() - 0.5) * 30}px`,
      driftDuration: `${24 + Math.random() * 26}s`,
      driftDelay: `${Math.random() * -40}s`,
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

export default function Resultado({ videoUrl }: ResultadoProps) {
  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = "video-stlep.mp4";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

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
        @keyframes fade-slide-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Fondo quieto: una sola mancha suave, sin animación */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-[70vw] h-[70vw] max-w-[680px] max-h-[680px] rounded-full"
          style={{
            background:
              "radial-gradient(closest-side, rgba(88,100,220,0.32) 0%, rgba(70,60,150,0.18) 45%, transparent 72%)",
            filter: "blur(90px)",
          }}
        />
        <Starfield />
      </div>

      {/* Contenido central */}
      <div
        className="relative z-10 flex flex-col items-center px-6 text-center w-full max-w-[420px] sm:max-w-[480px]"
        style={{ animation: "fade-slide-up 500ms ease-out" }}
      >
        <span className="text-xs font-medium tracking-[0.2em] uppercase text-indigo-300/70 mb-3">
          Listo
        </span>

        <h1 className="font-display text-2xl md:text-3xl font-semibold text-white tracking-tight mb-8">
          Tu video está listo
        </h1>

        <div className="w-full rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-4">
          <video src={videoUrl} controls className="w-full rounded-xl bg-black block" />
        </div>

        <button
          type="button"
          onClick={handleDownload}
          className="mt-8 flex items-center gap-2 bg-white text-black font-semibold text-sm px-7 py-3 rounded-full hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer"
        >
          <span>Descargar</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 4v12m0 0l-4-4m4 4l4-4M5 20h14" />
          </svg>
        </button>
      </div>
    </section>
  );
}