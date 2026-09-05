"use client";

import { useState, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Pantalla2Props {
  user: { name: string; avatar: string } | null;
  onLogin: () => void;
}

// Campo de partículas 3D coherente y dinámico
function BackgroundParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 900;

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    
    const colorBlue = new THREE.Color("#2563eb");
    const colorCyan = new THREE.Color("#06b6d4");
    const colorPurple = new THREE.Color("#8b5cf6");

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 45;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 25;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30 - 5;

      const mixedColor = colorBlue.clone().lerp(colorCyan, Math.random()).lerp(colorPurple, Math.random() * 0.3);
      col[i * 3] = mixedColor.r;
      col[i * 3 + 1] = mixedColor.g;
      col[i * 3 + 2] = mixedColor.b;
    }
    return [pos, col];
  }, []);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      const t = state.clock.getElapsedTime();
      const targetX = (state.pointer.x * Math.PI) / 18;
      const targetY = (state.pointer.y * Math.PI) / 18;
      
      pointsRef.current.rotation.y = THREE.MathUtils.damp(pointsRef.current.rotation.y, targetX + t * 0.02, 3, delta);
      pointsRef.current.rotation.x = THREE.MathUtils.damp(pointsRef.current.rotation.x, -targetY, 3, delta);
    }
  });

  const particleTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, "rgba(255,255,255,1)");
      gradient.addColorStop(0.3, "rgba(255,255,255,0.7)");
      gradient.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
    }
    return new THREE.CanvasTexture(canvas);
  }, []);

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.32}
        vertexColors
        transparent
        opacity={0.8}
        map={particleTexture}
        alphaTest={0.01}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export default function Pantalla2({ user, onLogin }: Pantalla2Props) {
  const [isHovered, setIsHovered] = useState(false);

  // Generación aleatoria de estrellitas reales de 4 puntas
  const randomStars = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 80 + 10}%`,
      left: `${Math.random() * 80 + 10}%`,
      size: `${Math.random() * 12 + 10}px`,
      duration: `${Math.random() * 3 + 2}s`,
      delay: `${Math.random() * 2}s`,
    }));
  }, []);

  const handleFileUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "video/*";
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        console.log("Video seleccionado:", file.name);
      }
    };
    input.click();
  };

  return (
    <section className="relative w-full h-screen bg-black overflow-hidden font-sans flex flex-col justify-between select-none">
      
      {/* Estilos de animación personalizados */}
      <style>{`
        @keyframes float-orb-blue {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(50px, -30px) scale(1.2); }
        }
        @keyframes float-orb-cyan {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-50px, 40px) scale(1.15); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 0.2; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }
        @keyframes twinkle-star {
          0%, 100% { opacity: 0.2; transform: scale(0.7) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.3) rotate(45deg); }
        }
        @keyframes border-glow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>

      {/* 1. Fondo Iluminado Azul Intenso y Bioluminiscente */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        {/* Orbe Azul Eléctrico Principal */}
        <div className="absolute top-[10%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-blue-600/35 blur-[160px] animate-[float-orb-blue_12s_ease-in-out_infinite]" />
        
        {/* Orbe Cian/Turquesa Resplandeciente */}
        <div className="absolute top-[25%] right-[15%] w-[50vw] h-[50vw] rounded-full bg-cyan-500/25 blur-[150px] animate-[float-orb-cyan_16s_ease-in-out_infinite]" />
        
        {/* Reflejo Azul Profundo Inferior */}
        <div className="absolute -bottom-[10%] left-[25%] w-[55vw] h-[55vw] rounded-full bg-blue-800/30 blur-[170px]" />
      </div>

      {/* 2. Canvas 3D de Partículas */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-[1]">
        <Canvas camera={{ position: [0, 0, 14], fov: 60 }}>
          <BackgroundParticles />
        </Canvas>
      </div>

      {/* 3. Header Superior */}
      <div className="w-full p-6 md:p-8 flex justify-between items-center z-20 pointer-events-auto">
        {/* Perfil del Usuario */}
        <div className="flex items-center gap-3 bg-blue-950/30 border border-blue-500/20 px-4 py-2 rounded-full backdrop-blur-xl shadow-[0_0_20px_rgba(37,99,235,0.15)]">
          <div className="w-9 h-9 rounded-full bg-blue-900/50 border border-blue-400/30 flex items-center justify-center overflow-hidden shrink-0">
            {user ? (
              <img src={user.avatar} alt="Perfil" className="w-full h-full object-cover" />
            ) : (
              <svg className="w-5 h-5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
          </div>
          {user && (
            <span className="text-gray-200 text-sm font-medium tracking-wide pr-1">
              {user.name}
            </span>
          )}
        </div>

        {/* Botón Iniciar Sesión (si no hay usuario) */}
        {!user && (
          <button 
            onClick={onLogin}
            className="flex items-center gap-3 bg-white text-black font-medium text-sm px-5 py-2.5 rounded-full shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:bg-blue-50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer"
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

      {/* 4. Contenido Central */}
      <div className="flex-1 flex flex-col items-center justify-center z-10 px-6 pointer-events-none">
        
        {/* Título Principal */}
        <h1 className="font-display text-5xl md:text-7xl font-extrabold text-center tracking-tight mb-10 drop-shadow-[0_0_35px_rgba(59,130,246,0.3)]">
          <span className="bg-gradient-to-r from-white via-blue-100 to-cyan-300 bg-clip-text text-transparent">
            Empieza a delegar
          </span>
        </h1>

        {/* Contenedor del Botón Rectangular */}
        <div className="pointer-events-auto relative flex flex-col items-center">
          
          {/* Animación extra: Anillo de pulso expansivo de fondo */}
          <div className="absolute -inset-4 rounded-3xl bg-blue-500/20 blur-xl animate-[pulse-ring_4s_ease-in-out_infinite] pointer-events-none" />

          {/* Wrapper con borde dinámico Neón */}
          <div className="relative group rounded-2xl p-[1px] bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500 shadow-[0_0_40px_rgba(37,99,235,0.25)] hover:shadow-[0_0_60px_rgba(6,182,212,0.45)] transition-all duration-500">
            
            {/* Botón Rectangular */}
            <button
              onClick={handleFileUpload}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="relative w-[300px] sm:w-[420px] md:w-[480px] h-28 sm:h-32 rounded-2xl bg-zinc-950/85 backdrop-blur-2xl border border-white/10 flex items-center justify-between px-8 text-white transition-all duration-500 cursor-pointer overflow-hidden group-hover:scale-[1.02] active:scale-[0.98]"
            >
              
              {/* Estrellitas en forma de ✦ distribuidas aleatoriamente dentro del botón en Hover */}
              {isHovered && randomStars.map((star) => (
                <span
                  key={star.id}
                  className="absolute text-cyan-200 pointer-events-none animate-[twinkle-star_2s_infinite]"
                  style={{
                    top: star.top,
                    left: star.left,
                    fontSize: star.size,
                    animationDuration: star.duration,
                    animationDelay: star.delay,
                  }}
                >
                  ✦
                </span>
              ))}

              {/* Glow Interno Azul en Hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              {/* Lado Izquierdo: Textos */}
              <div className="flex flex-col text-left z-10 pointer-events-none">
                <span className="text-white font-semibold text-lg sm:text-xl tracking-wide group-hover:text-cyan-200 transition-colors">
                  Subir un nuevo video
                </span>
                <span className="text-zinc-400 text-xs sm:text-sm font-normal mt-1">
                  Arrastra o haz clic para cargar tu archivo
                </span>
              </div>

              {/* Lado Derecho: Icono + dentro de contenedor con brillo */}
              <div className="relative z-10 w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-black transition-all duration-500 shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                <svg 
                  className="w-6 h-6 sm:w-8 sm:h-8 text-white group-hover:text-black group-hover:rotate-90 transition-all duration-500" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth={2.2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>

            </button>
          </div>

          {/* Texto de descripción debajo del botón */}
          <p className="mt-6 text-blue-200/80 text-sm md:text-base font-normal tracking-wide text-center max-w-md drop-shadow">
            Haz clic para subir el video que quieres que <span className="text-white font-semibold underline decoration-cyan-400/50 underline-offset-4">Stlep</span> edite por ti
          </p>

        </div>

      </div>

      {/* 5. Complementos Inferiores (Información para llenar pantalla) */}
      <div className="w-full px-6 pb-8 z-20 pointer-events-auto flex flex-wrap justify-center items-center gap-4 sm:gap-8 max-w-4xl mx-auto">
        
        <div className="flex items-center gap-2.5 bg-blue-950/30 border border-blue-500/15 px-4 py-2 rounded-xl backdrop-blur-md text-xs sm:text-sm text-zinc-300 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>Formatos: MP4, MOV, 4K+</span>
        </div>

        <div className="flex items-center gap-2.5 bg-blue-950/30 border border-blue-500/15 px-4 py-2 rounded-xl backdrop-blur-md text-xs sm:text-sm text-zinc-300 shadow-lg">
          <span className="text-blue-400">⚡</span>
          <span>Procesamiento Ultra Rápido</span>
        </div>

        <div className="flex items-center gap-2.5 bg-blue-950/30 border border-blue-500/15 px-4 py-2 rounded-xl backdrop-blur-md text-xs sm:text-sm text-zinc-300 shadow-lg">
          <span className="text-cyan-400">✨</span>
          <span>Edición Inteligente IA</span>
        </div>

      </div>

    </section>
  );
}