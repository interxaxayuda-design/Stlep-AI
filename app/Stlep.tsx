"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo, useState } from "react";
import * as THREE from "three";

// Campo de partículas en perspectiva profunda (Estilo la referencia)
function DeepParticleField() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 1200; // Gran densidad de partículas para el efecto inmersivo

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    
    const colorBlue = new THREE.Color("#3b82f6");
    const colorPurple = new THREE.Color("#a855f7");

    for (let i = 0; i < count; i++) {
      // Distribuir en un plano amplio con profundidad
      pos[i * 3] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20 - 2; // Más concentrado hacia abajo/medio
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40 - 10;

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
      
      // Movimiento orgánico muy suave de marea / flotación
      pointsRef.current.rotation.y = t * 0.02;
      
      // Reacción sutil al movimiento del mouse (Parallax)
      const targetX = (state.pointer.x * Math.PI) / 20;
      const targetY = (state.pointer.y * Math.PI) / 20;
      
      pointsRef.current.rotation.y = THREE.MathUtils.damp(pointsRef.current.rotation.y, targetX + t * 0.02, 3, delta);
      pointsRef.current.rotation.x = THREE.MathUtils.damp(pointsRef.current.rotation.x, -targetY, 3, delta);
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        vertexColors
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export function StlepAdvancedHero() {
  const [user, setUser] = useState<{ name: string; avatar: string } | null>(null);

  const handleLogin = () => {
    setUser({
      name: "Usuario",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
    });
  };

  return (
    <section className="relative w-full h-screen bg-[#030308] overflow-hidden font-sans flex flex-col justify-between select-none">
      
      {/* Iluminación Ambiental de Fondo (Mesh Gradient cenital estilo referencia) */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[70vw] h-[40vw] rounded-full bg-blue-600/10 blur-[160px]" />
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[50vw] h-[30vw] rounded-full bg-purple-600/10 blur-[140px]" />
      </div>

      {/* Canvas 3D de Partículas en Perspectiva */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-[1]">
        <Canvas camera={{ position: [0, 2, 12], fov: 60 }}>
          <DeepParticleField />
        </Canvas>
      </div>

      {/* Navbar Superior Completo (Estilo Pro) */}
      <nav className="w-full px-8 py-5 flex justify-between items-center z-30 border-b border-white/5 backdrop-blur-md bg-black/20">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 cursor-pointer">
            <span className="font-bold text-xl tracking-wider text-white">STLEP</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">AI</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-400 font-medium">
            <a href="#inicio" className="text-white transition-colors">Inicio</a>
            <a href="#servicios" className="hover:text-white transition-colors">Servicios</a>
            <a href="#portafolio" className="hover:text-white transition-colors">Portafolio</a>
            <a href="#blog" className="hover:text-white transition-colors">Blog</a>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Avatar / Usuario */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl flex items-center justify-center overflow-hidden shadow-lg transition-transform hover:scale-105">
              {user ? (
                <img src={user.avatar} alt="Perfil" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
            {user && <span className="text-gray-200 text-sm font-medium hidden sm:inline-block">{user.name}</span>}
          </div>

          {!user && (
            <button 
              onClick={handleLogin}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/10 text-sm font-medium px-4 py-2 rounded-full backdrop-blur-md transition-all duration-300 cursor-pointer"
            >
              Iniciar Sesión
            </button>
          )}

          <a 
            href="#consultoria"
            className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-medium px-5 py-2 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all duration-300"
          >
            <span>Agendar Consultoría</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      </nav>

      {/* Contenido Central (Hero) */}
      <div className="flex-1 flex flex-col items-center justify-center z-20 px-6 text-center max-w-5xl mx-auto pointer-events-none">
        <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1] animate-fade-in-up">
          <span className="text-white">Edición Web & </span>
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(168,85,247,0.3)]">
            Video Inteligente
          </span>
        </h1>
        
        <p className="mt-6 text-gray-400 text-base sm:text-lg md:text-xl max-w-2xl font-normal leading-relaxed">
          Transformamos flujos de trabajo creativos en sistemas automatizados de alto impacto impulsados por inteligencia artificial de nueva generación.
        </p>

        {/* Botones de Acción Principal */}
        <div className="mt-8 pointer-events-auto flex flex-wrap items-center justify-center gap-4">
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium px-7 py-3.5 rounded-full shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:scale-105 transition-all duration-300 cursor-pointer">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Ver Soluciones</span>
          </button>
          
          <a href="#contacto" className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 font-medium px-7 py-3.5 rounded-full backdrop-blur-md hover:scale-105 transition-all duration-300">
            <span>Agendar llamada</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      </div>

      {/* Footer Minimalista Inferior */}
      <footer className="w-full p-6 flex justify-between items-center text-xs text-zinc-500 z-20 border-t border-white/5 bg-black/40 backdrop-blur-md">
        <span>Stlep Intelligence © 2026. Todos los derechos reservados.</span>
        <div className="flex gap-4">
          <span className="hover:text-gray-300 cursor-pointer">Política de Privacidad</span>
          <span className="hover:text-gray-300 cursor-pointer">Términos de Uso</span>
        </div>
      </footer>
    </section>
  );
}

export default function Stlep() {
  return <StlepAdvancedHero />;
}