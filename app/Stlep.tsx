"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo, useState } from "react";
import * as THREE from "three";

// Campo de partículas con relieve 3D real
function StlepParticleField() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 1000;

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    
    const colorBlue = new THREE.Color("#3b82f6");
    const colorPurple = new THREE.Color("#a855f7");

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20 - 1;
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
      
      pointsRef.current.rotation.y = t * 0.025;

      const targetX = (state.pointer.x * Math.PI) / 16;
      const targetY = (state.pointer.y * Math.PI) / 16;
      
      pointsRef.current.rotation.y = THREE.MathUtils.damp(pointsRef.current.rotation.y, targetX + t * 0.025, 3, delta);
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
      gradient.addColorStop(0.3, "rgba(255,255,255,0.8)");
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
        size={0.35}
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

// Stack con logos oficiales corregidos y Database incluido
const technologies = [
  { 
    name: "VS Code", 
    svg: "https://api.iconify.design/vscode-icons:file-type-vscode.svg" 
  },
  { 
    name: "Node.js", 
    svg: "https://api.iconify.design/logos:nodejs-icon.svg" 
  },
  { 
    name: "Firebase", 
    svg: "https://api.iconify.design/logos:firebase.svg" 
  },
  { 
    name: "Gemini API", 
    svg: "https://api.iconify.design/logos:google-gemini.svg" 
  },
  { 
    name: "Next.js", 
    svg: "https://api.iconify.design/logos:nextjs-icon.svg" 
  },
  { 
    name: "React", 
    svg: "https://api.iconify.design/logos:react.svg" 
  },
  { 
    name: "Tailwind CSS", 
    svg: "https://api.iconify.design/logos:tailwindcss-icon.svg" 
  },
  { 
    name: "Vercel", 
    svg: "https://api.iconify.design/logos:vercel-icon.svg" 
  },
  { 
    name: "Database", 
    svg: "https://api.iconify.design/vscode-icons:file-type-sql.svg" 
  },
  { 
    name: "Three.js", 
    svg: "https://api.iconify.design/logos:threejs.svg" 
  }
];

export function TechMarquee() {
  return (
    <div className="w-full pb-8 pt-4 relative overflow-hidden z-20 pointer-events-auto">
      {/* Degradados laterales elegantes para difuminar los extremos */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black via-black/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black via-black/80 to-transparent z-10 pointer-events-none" />

      <div className="flex w-full overflow-hidden">
        <div className="flex animate-marquee gap-16 whitespace-nowrap items-center min-w-full">
          {[...technologies, ...technologies, ...technologies].map((tech, index) => (
            <div 
              key={index} 
              className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity duration-300 cursor-default select-none group"
            >
              <img 
                src={tech.svg} 
                alt={tech.name} 
                className="w-6 h-6 object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300" 
              />
              <span className="text-sm font-medium tracking-wide text-zinc-400 group-hover:text-zinc-200 transition-colors">
                {tech.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function FloatingShapes() {
  const [user, setUser] = useState<{ name: string; avatar: string } | null>(null);

  const handleLogin = () => {
    setUser({
      name: "Usuario",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
    });
  };

  return (
    <section className="relative w-full h-screen bg-black overflow-hidden font-sans flex flex-col justify-between select-none">
      
      {/* Fondo con Iluminación Ambiental Cenital */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[60vw] h-[40vw] rounded-full bg-blue-600/15 blur-[150px]" />
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[40vw] h-[30vw] rounded-full bg-purple-600/15 blur-[140px]" />
      </div>

      {/* Canvas 3D de Partículas Esféricas */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-[1]">
        <Canvas camera={{ position: [0, 0, 14], fov: 60 }}>
          <StlepParticleField />
        </Canvas>
      </div>

      {/* Header Superior Original de Stlep */}
      <div className="w-full p-6 md:p-10 flex justify-between items-center z-20">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl flex items-center justify-center overflow-hidden shadow-2xl transition-transform hover:scale-105">
            {user ? (
              <img src={user.avatar} alt="Perfil" className="w-full h-full object-cover" />
            ) : (
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
          </div>
          {user && (
            <span className="text-gray-200 text-sm font-medium hidden sm:inline-block tracking-wide">
              {user.name}
            </span>
          )}
        </div>

        {!user && (
          <button 
            onClick={handleLogin}
            className="flex items-center gap-3 bg-white text-black font-medium text-sm px-5 py-2.5 rounded-full shadow-[0_4px_20px_rgba(255,255,255,0.1)] hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.19v3.15C3.17 21.3 7.25 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.19C.43 8.1 0 9.8 0 12s.43 3.9 1.19 5.42l4.09-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.25 0 3.17 2.7 1.19 6.58l4.09 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            <span>Iniciar sesión con Google</span>
          </button>
        )}
      </div>

      {/* Contenido Central Original */}
      <div className="flex-1 flex flex-col items-center justify-center z-10 px-6 -mt-10 pointer-events-none">
        <h1 className="relative font-display text-5xl md:text-7xl font-bold text-center max-w-5xl leading-tight tracking-tight animate-fade-in-up opacity-0 fill-mode-forwards delay-100">
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            Stlep
          </span>
          <span className="text-white">
            , nueva generación de edición de video impulsado por IA
          </span>
        </h1>
        
        <p className="relative mt-6 text-gray-400 text-lg md:text-xl max-w-2xl text-center font-normal tracking-wide animate-fade-in-up opacity-0 fill-mode-forwards delay-300">
          Potencia tu flujo de trabajo con herramientas de renderizado inteligentes.
        </p>
      </div>

      {/* Carrusel Integrado */}
      <TechMarquee />
    </section>
  );
}

export default function Stlep() {
  return <FloatingShapes />;
}