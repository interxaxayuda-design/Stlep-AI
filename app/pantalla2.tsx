"use client";

import { useState, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Pantalla2Props {
  user: { name: string; avatar: string } | null;
  onLogin: () => void;
}

// ---------------------------------------------------------------------------
// Starfield: capa fija de puntos tenues que le dan densidad al fondo,
// sin el parpadeo errático de un sistema de partículas.
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
// Cristales facetados: geometría low-poly con flatShading real, así cada
// cara recibe la luz distinto y se ve tallado en vez de un plano liso.
// Ocupan todo el cuadro, incluidas las esquinas, con tinte violeta/índigo/azul.
// ---------------------------------------------------------------------------
const PALETTE = ["#818cf8", "#a78bfa", "#60a5fa", "#c4b5fd"];

function CrystalField() {
  const groupRef = useRef<THREE.Group>(null);
  const count = 18;

  const crystals = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      // Distribución que cubre el cuadro completo, incluidas esquinas y bordes,
      // con distintas profundidades para dar sensación de "lleno" con paralaje.
      const edgeBias = Math.random() < 0.55;
      const x = edgeBias
        ? (Math.random() < 0.5 ? -1 : 1) * (5 + Math.random() * 6)
        : (Math.random() - 0.5) * 10;
      const y = edgeBias
        ? (Math.random() - 0.5) * 9
        : (Math.random() < 0.5 ? -1 : 1) * (3 + Math.random() * 4);

      return {
        id: i,
        basePosition: new THREE.Vector3(x, y, -3 - Math.random() * 9),
        rotationSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.25,
          (Math.random() - 0.5) * 0.25,
          (Math.random() - 0.5) * 0.2
        ),
        floatOffset: Math.random() * Math.PI * 2,
        floatSpeed: 0.25 + Math.random() * 0.3,
        scale: 0.4 + Math.random() * 1.1,
        color: PALETTE[i % PALETTE.length],
        detail: Math.random() < 0.5 ? 0 : 1,
      };
    });
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();

    const targetX = (state.pointer.x * Math.PI) / 26;
    const targetY = (state.pointer.y * Math.PI) / 32;
    groupRef.current.rotation.y = THREE.MathUtils.damp(
      groupRef.current.rotation.y,
      targetX + t * 0.01,
      2,
      delta
    );
    groupRef.current.rotation.x = THREE.MathUtils.damp(
      groupRef.current.rotation.x,
      -targetY,
      2,
      delta
    );

    groupRef.current.children.forEach((mesh, i) => {
      const c = crystals[i];
      if (!c) return;
      mesh.position.y = c.basePosition.y + Math.sin(t * c.floatSpeed + c.floatOffset) * 0.4;
      mesh.rotation.x += c.rotationSpeed.x * delta;
      mesh.rotation.y += c.rotationSpeed.y * delta;
      mesh.rotation.z += c.rotationSpeed.z * delta;
    });
  });

  return (
    <>
      <ambientLight intensity={0.4} color="#a5b4fc" />
      <directionalLight position={[5, 8, 6]} intensity={1.4} color="#e0e7ff" />
      <pointLight position={[-8, -2, -2]} intensity={1.1} color="#8b5cf6" />
      <pointLight position={[6, -4, 2]} intensity={0.8} color="#3b82f6" />

      <group ref={groupRef}>
        {crystals.map((c) => (
          <mesh key={c.id} position={c.basePosition} scale={c.scale}>
            <icosahedronGeometry args={[1, c.detail]} />
            <meshPhysicalMaterial
              color={c.color}
              flatShading
              transmission={0.55}
              thickness={1.2}
              roughness={0.15}
              metalness={0.1}
              ior={1.5}
              clearcoat={0.8}
              clearcoatRoughness={0.2}
              transparent
              opacity={0.92}
              emissive={c.color}
              emissiveIntensity={0.08}
            />
          </mesh>
        ))}
      </group>
    </>
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
      `}</style>

      {/* 1. Nebulosa de fondo: llena el cuadro con profundidad de color */}
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

      {/* 2. Canvas 3D: cristales facetados llenando el cuadro */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-[1]">
        <Canvas camera={{ position: [0, 0, 11], fov: 58 }}>
          <CrystalField />
        </Canvas>
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
            <span className="text-slate-200 text-sm font-medium tracking-wide pr-1">
              {user.name}
            </span>
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
      <div className="flex-1 flex flex-col items-center justify-center z-10 px-6 pointer-events-none">

        <h1 className="font-display text-5xl md:text-7xl font-extrabold text-center tracking-tight mb-10 text-white drop-shadow-[0_0_40px_rgba(139,92,246,0.25)]">
          Empieza a delegar
        </h1>

        <div className="pointer-events-auto relative flex flex-col items-center">

          <div className="absolute -inset-4 rounded-3xl bg-indigo-500/15 blur-xl animate-[pulse-ring_4s_ease-in-out_infinite] pointer-events-none" />

          <div className="relative group rounded-2xl border border-white/10 hover:border-indigo-400/40 transition-colors duration-500">

            <button
              onClick={handleFileUpload}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="relative w-[300px] sm:w-[420px] md:w-[480px] h-28 sm:h-32 rounded-2xl bg-white/[0.04] backdrop-blur-2xl flex items-center justify-between px-8 text-white transition-all duration-500 cursor-pointer overflow-hidden group-hover:scale-[1.01] active:scale-[0.98]"
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
          </div>

          <p className="mt-6 text-slate-400 text-sm md:text-base font-normal tracking-wide text-center max-w-md">
            Haz clic para subir el video que quieres que <span className="text-white font-semibold">Stlep</span> edite por ti
          </p>

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