"use client";

import { useState } from "react";

interface Pantalla2Props {
  user: { name: string; avatar: string } | null;
  onLogin: () => void;
}

export default function Pantalla2({ user, onLogin }: Pantalla2Props) {
  const [isHovered, setIsHovered] = useState(false);

  const handleFileUpload = () => {
    // Aquí puedes disparar la lógica para abrir el selector de archivos
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "video/*";
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        console.log("Video seleccionado:", file.name);
      }
    };
    input.click();
  };

  return (
    <section className="relative w-full h-screen bg-black overflow-hidden font-sans flex flex-col justify-between select-none">
      
      {/* 1. Fondo con Orbes Desenfocados (Movimiento Lento y Fluido) */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <style>{`
          @keyframes float-orb-1 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(40px, -30px) scale(1.1); }
          }
          @keyframes float-orb-2 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(-40px, 30px) scale(1.15); }
          }
          @keyframes shimmer-dots {
            0% { background-position: 0 0; }
            100% { background-position: 50px 50px; }
          }
        `}</style>
        
        {/* Orbe Azul */}
        <div className="absolute top-[20%] left-[30%] w-[45vw] h-[45vw] rounded-full bg-blue-600/20 blur-[130px] animate-[float-orb-1_12s_ease-in-out_infinite]" />
        
        {/* Orbe Púrpura/Morado (Interponiéndose suavemente) */}
        <div className="absolute top-[35%] right-[30%] w-[40vw] h-[40vw] rounded-full bg-purple-600/20 blur-[140px] animate-[float-orb-2_15s_ease-in-out_infinite]" />
      </div>

      {/* 2. Header Superior (Mantiene sesión de Google y Foton/Nombre a la izquierda) */}
      <div className="w-full p-6 md:p-10 flex justify-between items-center z-20 pointer-events-auto">
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
            onClick={onLogin}
            className="flex items-center gap-3 bg-white text-black font-medium text-sm px-5 py-2.5 rounded-full shadow-[0_4px_20px_rgba(255,255,255,0.1)] hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer"
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

      {/* 3. Contenido Central (Texto principal y Botón con signo más y destellos brillantes) */}
      <div className="flex-1 flex flex-col items-center justify-center z-10 px-6 -mt-12 pointer-events-none">
        
        {/* Texto blanco principal */}
        <h1 className="font-display text-4xl md:text-6xl font-bold text-white text-center tracking-tight mb-12">
          Empieza a delegar
        </h1>

        {/* Botón Grande con Signo Más y Destellos en Hover */}
        <div className="pointer-events-auto flex flex-col items-center">
          <button
            onClick={handleFileUpload}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`relative w-28 h-28 md:w-36 md:h-36 rounded-full bg-zinc-900 border border-white/20 flex items-center justify-center text-white transition-all duration-500 cursor-pointer shadow-[0_0_50px_rgba(59,130,246,0.15)] hover:scale-105 active:scale-95 group overflow-hidden`}
          >
            {/* Efecto de puntos brillantes animados en hover */}
            {isHovered && (
              <div 
                className="absolute inset-0 opacity-40 pointer-events-none animate-[shimmer-dots_2s_linear_infinite]"
                style={{
                  backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.8) 1.5px, transparent 1.5px)`,
                  backgroundSize: `16px 16px`
                }}
              />
            )}

            {/* Resplandor interno de fondo al hacer hover */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Signo Más Grande */}
            <svg 
              className="w-12 h-12 md:w-16 md:h-16 relative z-10 text-white group-hover:rotate-90 transition-transform duration-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>

          {/* Texto de descripción debajo del botón */}
          <p className="mt-6 text-zinc-400 text-sm md:text-base font-normal tracking-wide text-center max-w-sm">
            Haz clic para subir el video que quieres que Slept edite
          </p>
        </div>

      </div>

      {/* Espaciador inferior para equilibrar el diseño */}
      <div className="h-16 z-20" />
    </section>
  );
}