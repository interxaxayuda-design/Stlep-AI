"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";

interface Pantalla2Props {
  user: { name: string; avatar: string } | null;
  onLogin: () => void;
}

// ---------------------------------------------------------------------------
// Starfield: capa fija de puntos tenues que le dan densidad al fondo.
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
      tint: Math.random() < 0.7 ? "#e6e9ff" : Math.random() < 0.85 ? "#c4b5fd" : "#93c5fd",
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

// ---------------------------------------------------------------------------
// TriangleLinesCanvas: red de líneas finas tipo wireframe, dibujada en
// <canvas> con coordenadas ya convertidas a píxeles reales del viewport.
// ---------------------------------------------------------------------------
const ORIGINS = [
  {
    id: "o1",
    point: { x: 58, y: -6 },
    targets: [
      { x: 8, y: 22 },
      { x: 30, y: 55 },
      { x: 62, y: 68 },
      { x: 88, y: 40 },
      { x: 102, y: 78 },
    ],
  },
  {
    id: "o2",
    point: { x: -4, y: 46 },
    targets: [
      { x: 22, y: 8 },
      { x: 40, y: 62 },
      { x: 12, y: 96 },
      { x: 58, y: 90 },
    ],
  },
  {
    id: "o3",
    point: { x: 104, y: 72 },
    targets: [
      { x: 66, y: 34 },
      { x: 44, y: 78 },
      { x: 90, y: 12 },
    ],
  },
];

function TriangleLinesCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const toPx = (pct: { x: number; y: number }, width: number, height: number) => ({
      x: (pct.x / 100) * width,
      y: (pct.y / 100) * height,
    });

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = container.clientWidth;
      const height = container.clientHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      ORIGINS.forEach((o) => {
        const origin = toPx(o.point, width, height);
        o.targets.forEach((t) => {
          const target = toPx(t, width, height);
          const gradient = ctx.createLinearGradient(origin.x, origin.y, target.x, target.y);
          gradient.addColorStop(0, "rgba(165,180,252,0.5)");
          gradient.addColorStop(1, "rgba(165,180,252,0)");

          ctx.strokeStyle = gradient;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(origin.x, origin.y);
          ctx.lineTo(target.x, target.y);
          ctx.stroke();
        });
      });

      ORIGINS.forEach((o) => {
        const origin = toPx(o.point, width, height);

        const glowRadius = 46;
        const glow = ctx.createRadialGradient(origin.x, origin.y, 0, origin.x, origin.y, glowRadius);
        glow.addColorStop(0, "rgba(196,181,253,0.85)");
        glow.addColorStop(1, "rgba(196,181,253,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(origin.x, origin.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#e0e7ff";
        ctx.beginPath();
        ctx.arc(origin.x, origin.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    draw();

    const resizeObserver = new ResizeObserver(() => draw());
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full">
      <canvas ref={canvasRef} className="block" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Compresión de video en cliente (canvas + MediaRecorder, sin dependencias)
// ---------------------------------------------------------------------------
const MAX_WIDTH = 854;
const TARGET_BITRATE = 1_500_000;

type Stage = "idle" | "compressing" | "ready" | "error";

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

function pickMimeType() {
  const candidates = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];
  for (const type of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type)) return type;
  }
  return "";
}

export default function Pantalla2({ user, onLogin }: Pantalla2Props) {
  const [isHovered, setIsHovered] = useState(false);

  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState(0);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const [purpose, setPurpose] = useState("");
  const [styleNotes, setStyleNotes] = useState("");

  const hiddenVideoRef = useRef<HTMLVideoElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);

  const compressFile = useCallback((file: File) => {
    setStage("compressing");
    setProgress(0);
    setErrorMsg("");
    setOriginalSize(file.size);
    setCompressedSize(0);
    setPreviewUrl(null);

    const video = hiddenVideoRef.current;
    const canvas = hiddenCanvasRef.current;
    if (!video || !canvas) return;

    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;
    video.volume = 0;

    video.onloadedmetadata = () => {
      const scale = Math.min(1, MAX_WIDTH / video.videoWidth);
      const w = Math.round(video.videoWidth * scale);
      const h = Math.round(video.videoHeight * scale);
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      let canvasStream: MediaStream;
      try {
        canvasStream = (canvas as HTMLCanvasElement & { captureStream: (fps?: number) => MediaStream }).captureStream(30);
      } catch {
        setStage("error");
        setErrorMsg("Este navegador no soporta compresión de video en el cliente.");
        return;
      }

      const combined = new MediaStream();
      canvasStream.getVideoTracks().forEach((t) => combined.addTrack(t));
      const videoWithCapture = video as HTMLVideoElement & { captureStream?: () => MediaStream };
      const audioStream = videoWithCapture.captureStream ? videoWithCapture.captureStream() : null;
      audioStream?.getAudioTracks().forEach((t) => combined.addTrack(t));

      const mimeType = pickMimeType();
      const recorder = new MediaRecorder(combined, { mimeType, videoBitsPerSecond: TARGET_BITRATE });
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType || "video/webm" });
        setCompressedSize(blob.size);
        setPreviewUrl(URL.createObjectURL(blob));
        setStage("ready");
        URL.revokeObjectURL(objectUrl);
      };

      let raf = 0;
      const draw = () => {
        if (video.paused || video.ended) return;
        ctx.drawImage(video, 0, 0, w, h);
        if (video.duration) setProgress(Math.min(100, (video.currentTime / video.duration) * 100));
        raf = requestAnimationFrame(draw);
      };

      video.onended = () => {
        cancelAnimationFrame(raf);
        recorder.stop();
        video.pause();
      };

      video
        .play()
        .then(() => {
          recorder.start();
          draw();
        })
        .catch(() => {
          setStage("error");
          setErrorMsg("No se pudo iniciar la reproducción para comprimir el video.");
        });
    };

    video.onerror = () => {
      setStage("error");
      setErrorMsg("No se pudo leer el archivo de video.");
    };
  }, []);

  const handleFileUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "video/*";
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith("video/")) {
        setStage("error");
        setErrorMsg("Elegí un archivo de video válido.");
        return;
      }
      compressFile(file);
    };
    input.click();
  };

  const resetUpload = () => {
    setStage("idle");
    setPreviewUrl(null);
    setOriginalSize(0);
    setCompressedSize(0);
    setProgress(0);
  };

  return (
    <section className="relative w-full h-screen overflow-hidden font-sans flex flex-col justify-between select-none bg-[#050510]">

      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.95); opacity: 0.6; }
          50% { transform: scale(1.06); opacity: 0.15; }
          100% { transform: scale(0.95); opacity: 0.6; }
        }
        @keyframes glint-sweep {
          0% { transform: translateX(-120%) skewX(-15deg); }
          100% { transform: translateX(220%) skewX(-15deg); }
        }
        @keyframes star-twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
        @keyframes fade-slide-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .no-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* 1. Nebulosa de fondo */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 90% 70% at 50% 0%, rgba(88,60,150,0.35) 0%, rgba(30,20,70,0.25) 35%, rgba(5,5,16,0.9) 70%), " +
              "radial-gradient(ellipse 70% 60% at 20% 100%, rgba(40,50,140,0.3) 0%, transparent 60%), " +
              "radial-gradient(ellipse 60% 50% at 85% 80%, rgba(90,50,160,0.25) 0%, transparent 60%)",
          }}
        />
        <Starfield />
      </div>

      {/* 2. Red de líneas triangulares, dibujada en canvas */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-[1]">
        <TriangleLinesCanvas />
      </div>

      {/* 3. Header */}
      <div className="w-full p-6 md:p-8 flex justify-between items-center z-20 pointer-events-auto">
        <div className="flex items-center gap-3 bg-white/[0.04] border border-white/10 px-4 py-2 rounded-full backdrop-blur-xl">
          <div className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
            {user ? (
              <img src={user.avatar} alt="Perfil" className="w-full h-full object-cover" />
            ) : (
              <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
          </div>
          {user && (
            <span className="text-slate-200 text-sm font-medium tracking-wide pr-1">{user.name}</span>
          )}
        </div>

        {!user && (
          <button
            onClick={onLogin}
            className="flex items-center gap-3 bg-white text-black font-medium text-sm px-5 py-2.5 rounded-full hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.19v3.15C3.17 21.3 7.25 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.19C.43 8.1 0 9.8 0 12s.43 3.9 1.19 5.42l4.09-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.25 0 3.17 2.7 1.19 6.58l4.09 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            <span>Iniciar sesión</span>
          </button>
        )}
      </div>

      {/* 4. Contenido central */}
      <div className="flex-1 flex flex-col items-center justify-center z-10 px-6 py-8 pointer-events-none overflow-y-auto no-scrollbar">

        <h1 className="font-display text-5xl md:text-7xl font-extrabold text-center tracking-tight mb-10 text-white drop-shadow-[0_0_40px_rgba(139,92,246,0.25)]">
          Empieza a delegar
        </h1>

        <div className="pointer-events-auto relative flex flex-col items-center">

          {stage !== "ready" && (
            <div className="absolute -inset-4 rounded-3xl bg-indigo-500/15 blur-xl animate-[pulse-ring_4s_ease-in-out_infinite] pointer-events-none" />
          )}

          <div className="relative group rounded-2xl border border-white/10 hover:border-indigo-400/40 transition-colors duration-500 w-[300px] sm:w-[420px] md:w-[480px]">

            {/* Estado: idle — botón original */}
            {stage === "idle" && (
              <button
                onClick={handleFileUpload}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="relative w-full h-28 sm:h-32 rounded-2xl bg-white/[0.04] backdrop-blur-2xl flex items-center justify-between px-8 text-white transition-all duration-500 cursor-pointer overflow-hidden group-hover:scale-[1.01] active:scale-[0.98]"
              >
                {isHovered && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                      style={{ animation: "glint-sweep 1.1s ease-out" }}
                    />
                  </div>
                )}

                <div className="flex flex-col text-left z-10 pointer-events-none">
                  <span className="text-white font-semibold text-lg sm:text-xl tracking-wide">
                    Subir un nuevo video
                  </span>
                  <span className="text-zinc-400 text-xs sm:text-sm font-normal mt-1">
                    Arrastra o haz clic para cargar tu archivo
                  </span>
                </div>

                <div className="relative z-10 w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center group-hover:bg-indigo-500 group-hover:border-indigo-400 transition-all duration-500">
                  <svg
                    className="w-6 h-6 sm:w-8 sm:h-8 text-white group-hover:rotate-90 transition-all duration-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </button>
            )}

            {/* Estado: compressing — misma tarjeta, con progreso */}
            {stage === "compressing" && (
              <div className="relative w-full h-28 sm:h-32 rounded-2xl bg-white/[0.04] backdrop-blur-2xl flex flex-col justify-center px-8 text-white overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-sm sm:text-base tracking-wide">
                    Comprimiendo video…
                  </span>
                  <span className="text-indigo-300 text-xs font-mono">{Math.round(progress)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-indigo-400 transition-all duration-150"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-zinc-400 text-xs mt-2 font-mono">
                  original {formatBytes(originalSize)}
                </span>
              </div>
            )}

            {/* Estado: ready — preview inline dentro de la misma tarjeta */}
            {stage === "ready" && previewUrl && (
              <div className="relative w-full rounded-2xl bg-white/[0.04] backdrop-blur-2xl p-4 text-white overflow-hidden">
                <video src={previewUrl} controls className="w-full rounded-xl bg-black block" />
                <div className="flex items-center justify-between mt-3 text-xs font-mono text-zinc-400">
                  <span>
                    {formatBytes(originalSize)} <span className="text-zinc-600">→</span>{" "}
                    <span className="text-emerald-400">{formatBytes(compressedSize)}</span>
                  </span>
                  <button
                    onClick={resetUpload}
                    className="text-zinc-400 hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
                  >
                    Cambiar video
                  </button>
                </div>
              </div>
            )}

            {/* Estado: error */}
            {stage === "error" && (
              <div className="relative w-full h-28 sm:h-32 rounded-2xl bg-white/[0.04] backdrop-blur-2xl flex flex-col justify-center px-8 text-white">
                <span className="text-red-400 font-semibold text-sm sm:text-base">
                  No se pudo procesar el video
                </span>
                <span className="text-zinc-400 text-xs mt-1">{errorMsg}</span>
                <button
                  onClick={resetUpload}
                  className="mt-3 self-start bg-white/10 hover:bg-white/15 border border-white/10 text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  Reintentar
                </button>
              </div>
            )}
          </div>

          {/* elementos ocultos usados para procesar el video */}
          <video ref={hiddenVideoRef} className="hidden" playsInline />
          <canvas ref={hiddenCanvasRef} className="hidden" />

          {stage !== "ready" && (
            <p className="mt-6 text-slate-400 text-sm md:text-base font-normal tracking-wide text-center max-w-md">
              Haz clic para subir el video que quieres que <span className="text-white font-semibold">Stlep</span> edite por ti
            </p>
          )}

          {/* Campos de contexto — aparecen debajo, en la misma pantalla, una vez que hay preview */}
          {stage === "ready" && (
            <div
              className="w-full mt-5 flex flex-col gap-4"
              style={{ animation: "fade-slide-up 400ms ease-out" }}
            >
              <label className="block bg-white/[0.04] border border-white/10 rounded-2xl backdrop-blur-2xl px-5 py-4">
                <span className="block text-white text-sm font-semibold mb-2">¿Para qué es el video?</span>
                <textarea
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Ej: anuncio de Instagram, tutorial interno, clip para un cliente…"
                  rows={2}
                  className="w-full bg-transparent border-none outline-none resize-none text-sm text-zinc-200 placeholder:text-zinc-500"
                />
              </label>

              <label className="block bg-white/[0.04] border border-white/10 rounded-2xl backdrop-blur-2xl px-5 py-4">
                <span className="block text-white text-sm font-semibold mb-2">Describí cómo querés que quede</span>
                <textarea
                  value={styleNotes}
                  onChange={(e) => setStyleNotes(e.target.value)}
                  placeholder="Ej: ritmo rápido, subtítulos grandes, tono cálido, cortes en cada beat…"
                  rows={3}
                  className="w-full bg-transparent border-none outline-none resize-none text-sm text-zinc-200 placeholder:text-zinc-500"
                />
              </label>
            </div>
          )}
        </div>
      </div>

      {/* 5. Chips inferiores */}
      <div className="w-full px-6 pb-8 z-20 pointer-events-auto flex flex-wrap justify-center items-center gap-4 sm:gap-8 max-w-4xl mx-auto">
        <div className="flex items-center gap-2.5 bg-white/[0.04] border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md text-xs sm:text-sm text-slate-300">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
          <span>Formatos: MP4, MOV, 4K+</span>
        </div>

        <div className="flex items-center gap-2.5 bg-white/[0.04] border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md text-xs sm:text-sm text-slate-300">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
          <span>Procesamiento ultra rápido</span>
        </div>

        <div className="flex items-center gap-2.5 bg-white/[0.04] border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md text-xs sm:text-sm text-slate-300">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
          <span>Edición inteligente con IA</span>
        </div>
      </div>
    </section>
  );
}