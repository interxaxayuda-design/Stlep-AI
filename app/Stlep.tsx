"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";

type ShapeConfig = {
  position: [number, number, number];
  rotationSpeed: [number, number, number];
  scale: number;
  geometry: "icosahedron" | "torus" | "octahedron" | "dodecahedron";
  colorT: number;
};

function generateShapes(): ShapeConfig[] {
  const geometries: ShapeConfig["geometry"][] = [
    "icosahedron",
    "torus",
    "octahedron",
    "dodecahedron",
  ];
  const shapes: ShapeConfig[] = [];
  // Increased shape count for a denser, more immersive background
  for (let i = 0; i < 15; i++) {
    shapes.push({
      position: [
        (Math.random() - 0.5) * 45,      // Spread wider across the X axis
        (Math.random() - 0.5) * 25,      // Spread taller across the Y axis
        (Math.random() - 0.5) * 20 - 8,  // Pushed further back on the Z axis
      ],
      rotationSpeed: [
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.15,
      ],
      scale: 0.8 + Math.random() * 2,
      geometry: geometries[i % geometries.length],
      colorT: Math.random(),
    });
  }
  return shapes;
}

function lerpColor(t: number) {
  const blue = new THREE.Color("#3b82f6"); // Tailwind blue-500
  const purple = new THREE.Color("#a855f7"); // Tailwind purple-500
  return blue.clone().lerp(purple, t);
}

function WireShape({ config }: { config: ShapeConfig }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const floatPhase = useMemo(() => Math.random() * Math.PI * 2, []);
  const color = lerpColor(config.colorT);

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime();
      meshRef.current.rotation.x += config.rotationSpeed[0] * 0.01;
      meshRef.current.rotation.y += config.rotationSpeed[1] * 0.01;
      meshRef.current.rotation.z += config.rotationSpeed[2] * 0.01;
      // Smoother, slightly more pronounced floating animation
      meshRef.current.position.y =
        config.position[1] + Math.sin(t * 0.5 + floatPhase) * 0.8;
    }
  });

  const geometryEl = (() => {
    switch (config.geometry) {
      case "icosahedron":
        return <icosahedronGeometry args={[1, 0]} />;
      case "torus":
        return <torusGeometry args={[1, 0.3, 16, 32]} />; // Smoother geometry for the torus
      case "octahedron":
        return <octahedronGeometry args={[1, 0]} />;
      case "dodecahedron":
        return <dodecahedronGeometry args={[1, 0]} />;
    }
  })();

  return (
    <mesh ref={meshRef} position={config.position} scale={config.scale}>
      {geometryEl}
      <meshBasicMaterial 
        color={color} 
        wireframe 
        transparent 
        opacity={0.35} 
        blending={THREE.AdditiveBlending} // Creates a glowing overlap effect
        depthWrite={false} // Prevents wireframes from rendering ugly internal clipping
      />
    </mesh>
  );
}

function Scene() {
  const shapes = useMemo(() => generateShapes(), []);
  return (
    <>
      {/* Fog blends the 3D shapes smoothly into the black background as they get further away */}
      <fog attach="fog" args={["#000000", 12, 35]} />
      {shapes.map((s, i) => (
        <WireShape key={i} config={s} />
      ))}
    </>
  );
}

export function FloatingShapes() {
  return (
    <section className="relative w-full h-screen bg-black overflow-hidden font-sans">
      {/* Fixed Aurora layer: Full height, mix-blend-screen for better lighting, and moved slightly to corners */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-[1]">
        <div className="absolute -top-[10%] -left-[10%] w-[60vw] h-[60vw] rounded-full bg-blue-600/20 blur-[120px] animate-aurora-1 mix-blend-screen" />
        <div className="absolute bottom-[0%] -right-[10%] w-[50vw] h-[50vw] rounded-full bg-purple-600/20 blur-[120px] animate-aurora-2 mix-blend-screen" />
      </div>

      <Canvas camera={{ position: [0, 0, 18], fov: 60 }}>
        <Scene />
      </Canvas>

      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
        {/* Invisible shadow block behind the text ensures perfect readability against the 3D elements */}
        <div className="absolute w-[80vw] max-w-[800px] h-[300px] bg-black/60 blur-[80px] rounded-full" />
        
        <h1 className="relative font-display text-5xl md:text-7xl font-bold text-center px-6 max-w-5xl leading-tight tracking-tight">
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent drop-shadow-sm">
            Stlep
          </span>
          <span className="text-white drop-shadow-md">
            , nueva generación de edición de video impulsado por IA
          </span>
        </h1>
        {/* Added a subtle sub-headline for better landing page structure */}
        <p className="relative mt-6 text-gray-400 text-lg md:text-xl max-w-2xl text-center font-medium drop-shadow-md">
          Potencia tu flujo de trabajo con herramientas de renderizado inteligentes.
        </p>
      </div>
    </section>
  );
}

export default function Stlep() {
  return <FloatingShapes />;
}