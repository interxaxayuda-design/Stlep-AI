"use client";

import { useState, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Pantalla2Props {
  user: { name: string; avatar: string } | null;
  onLogin: () => void;
}

// Campo de partículas 3D coherente con la pantalla principal
function BackgroundParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 800;

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    
    const colorBlue = new THREE.Color("#3b82f6");
    const colorPurple = new THREE.Color("#a855f7");

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 45;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 25;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30 - 5;

      const mixedColor = colorBlue.clone().lerp(colorPurple, Math.random());
      col[i * 3] = mixedColor.r;
      col[i * 3 + 1] = mixedColor.g;
      col[i * 3 + 2] = mixedColor.b;
    }
    return [pos, col];
  }, []);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      const t = state.clock.getElapsedTime();
      pointsRef.current.rotation.y = t * 0.02;

      const targetX = (state.pointer.x * Math.PI) / 20;
      const targetY = (state.pointer.y * Math.PI) / 20;
      
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
        size={0.3}
        vertexColors
        transparent
        opacity={0.75}
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
      
      {/* 1. Fondo de orbes bioluminiscentes */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <style>{`
          @keyframes float-orb-1 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(60px, -40px) scale(1.15); }
          }
          @keyframes float-orb-2 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(-60px, 40px) scale(1.2); }
          }
          @keyframes shimmer-dots {
            0% { background-position: 0 0; }
            100% { background-position: 60px 60px; }
          }
          @keyframes spin-border {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        
        {/* Luces difusas multicapa */}
        <div className="absolute top-[15%] left-[25%] w-[50vw] h-[50vw] rounded-full bg-blue-600/25 blur-[150px] animate-[float-orb-1_14s_ease-in-out_infinite]" />
        <div className="absolute top-[30%] right-[20%] w-[45vw] h-[45vw] rounded-full bg-purple-600/25 blur-[160px] animate-[float-orb-2_18s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-10%] left-[35%] w-[40vw] h-[40vw] rounded-full bg-indigo-500/15 blur-[140px]" />
      </div>

      {/* 2. Canvas 3D (Partículas) */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-[1]">
        <Canvas camera={{ position: [0, 0, 14], fov: 60 }}>
          <BackgroundParticles />
        </Canvas>
      </div>

      {/* 3. Header Superior */}
      <div className="w-full p-6 md:p-10 flex justify-between items-center z-20 pointer-events-auto">
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-xl shadow-2xl">
          <div className="w-9 h-9 rounded-full bg-zinc-800 border border-white/20 flex items-center justify-center overflow-hidden shrink-0">
            {user ? (
              <img src={user.avatar} alt="Perfil" className="w-full h-full object-cover" />
            ) : (
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        {!user && (
          <button 
            onClick={onLogin}
            className="flex items-center gap-3 bg-white text-black font-medium text-sm px-5 py-2.5 rounded-full shadow-[0_4px_20px_rgba(255,255,255,0.15)] hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer"
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
      <div className="flex-1 flex flex-col items-center justify-center z-10 px-6 -mt-8 pointer-events-none">
        
        {/* Título Principal estilo Neón / Gradiente */}
        <h1 className="font-display text-5xl md:text-7xl font-bold text-center tracking-tight mb-14 drop-shadow-2xl">
          <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Empieza a delegar
          </span>
        </h1>

        {/* Contenedor Interactivo del Botón Principal */}
        <div className="pointer-events-auto flex flex-col items-center">
          <div className="relative group">
            
            {/* Resplandor exterior neón al hacer hover */}
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 opacity-30 group-hover:opacity-100 blur-xl transition-all duration-500 group-hover:scale-110" />

            {/* Borde Giratorio Gradiente */}
            <div className="absolute -inset-[2px] rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-40 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden">
              <div className="w-full h-full animate-[spin-border_4s_linear_infinite] bg-[conic-gradient(from_0deg,#3b82f6,#a855f7,#ec4899,#3b82f6)]" />
            </div>

            {/* Botón Principal */}
            <button
              onClick={handleFileUpload}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="relative w-32 h-32 md:w-40 md:h-40 rounded-full bg-zinc-950/90 backdrop-blur-2xl border border-white/10 flex items-center justify-center text-white transition-all duration-500 cursor-pointer shadow-2xl group-hover:scale-105 active:scale-95 overflow-hidden"
            >
              {/* Patrón de textura animada en hover */}
              {isHovered && (
                <div 
                  className="absolute inset-0 opacity-25 pointer-events-none animate-[shimmer-dots_2s_linear_infinite]"
                  style={{
                    backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.9) 1.5px, transparent 1.5px)`,
                    backgroundSize: `16px 16px`
                  }}
                />
              )}

              {/* Degradado central dinámico */}
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/30 via-purple-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Signo Más */}
              <svg 
                className="w-14 h-14 md:w-16 md:h-16 relative z-10 text-white/90 group-hover:text-white group-hover:rotate-90 transition-all duration-500 ease-out filter drop-shadow-[0_0_12px_rgba(255,255,255,0.5)]" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth={1.75}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {/* Subtítulo indicativo */}
          <p className="mt-8 text-zinc-400 text-sm md:text-base font-medium tracking-wide text-center max-w-sm drop-shadow">
            Haz clic para subir el video que quieres que <span className="text-white font-semibold">Stlep</span> edite
          </p>
        </div>

      </div>

      {/* Espaciador Inferior */}
      <div className="h-16 z-20 pointer-events-none" />
    </section>
  );
}