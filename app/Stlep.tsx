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
  
  for (let i = 0; i < 15; i++) {
    shapes.push({
      position: [
        // Reduced from 45 to 25 to pull them horizontally toward the center
        (Math.random() - 0.5) * 25,      
        // Reduced from 25 to 15 to pull them vertically toward the center
        (Math.random() - 0.5) * 15,      
        // Adjusted slightly to keep them floating right around the text depth
        (Math.random() - 0.5) * 15 - 4,  
      ],
      rotationSpeed: [
        (Math.random() - 0.5) * 0.15,
        (Math.random() - 0.5) * 0.15,
        (Math.random() - 0.5) * 0.1,
      ],
      scale: 0.8 + Math.random() * 2,
      geometry: geometries[i % geometries.length],
      colorT: Math.random(),
    });
  }
  return shapes;
}

function lerpColor(t: number) {
  const blue = new THREE.Color("#3b82f6");
  const purple = new THREE.Color("#a855f7");
  return blue.clone().lerp(purple, t);
}

function WireShape({ config }: { config: ShapeConfig }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const floatPhase = useMemo(() => Math.random() * Math.PI * 2, []);
  const color = lerpColor(config.colorT);
  
  // Track current scale for the entrance animation (starting at 0)
  const currentScale = useRef(0);

  useFrame((state, delta) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime();
      
      // Fixed: Slowed down to match your original exact speed
      meshRef.current.rotation.x += config.rotationSpeed[0] * delta * 0.6;
      meshRef.current.rotation.y += config.rotationSpeed[1] * delta * 0.6;
      meshRef.current.rotation.z += config.rotationSpeed[2] * delta * 0.6;
      
      // Continuous floating
      meshRef.current.position.y =
        config.position[1] + Math.sin(t * 0.5 + floatPhase) * 0.8;

      // Entrance animation: Smoothly scale up from 0 to the target scale
      currentScale.current = THREE.MathUtils.damp(
        currentScale.current,
        config.scale,
        2.5, // Speed of the pop-in
        delta
      );
      meshRef.current.scale.setScalar(currentScale.current);
    }
  });

  const geometryEl = (() => {
    switch (config.geometry) {
      case "icosahedron": return <icosahedronGeometry args={[1, 0]} />;
      case "torus": return <torusGeometry args={[1, 0.3, 16, 32]} />;
      case "octahedron": return <octahedronGeometry args={[1, 0]} />;
      case "dodecahedron": return <dodecahedronGeometry args={[1, 0]} />;
    }
  })();

  return (
    <mesh ref={meshRef} position={config.position}>
      {geometryEl}
      <meshBasicMaterial 
        color={color} 
        wireframe 
        transparent 
        opacity={0.35} 
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

function Scene() {
  const shapes = useMemo(() => generateShapes(), []);
  const groupRef = useRef<THREE.Group>(null);

  // Mouse Interaction: Tilt the entire scene based on cursor position
  useFrame((state, delta) => {
    if (groupRef.current) {
      // Calculate target rotation based on normalized mouse coordinates (-1 to 1)
      const targetX = (state.pointer.x * Math.PI) / 12; // Controls pan left/right
      const targetY = (state.pointer.y * Math.PI) / 12; // Controls pan up/down
      
      // Smoothly interpolate current rotation to the target rotation
      groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, targetX, 3, delta);
      groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, -targetY, 3, delta);
    }
  });

  return (
    <>
      <fog attach="fog" args={["#000000", 12, 35]} />
      {/* Wrap shapes in a group to control them all together with the mouse */}
      <group ref={groupRef}>
        {shapes.map((s, i) => (
          <WireShape key={i} config={s} />
        ))}
      </group>
    </>
  );
}

export function FloatingShapes() {
  return (
    <section className="relative w-full h-screen bg-black overflow-hidden font-sans">
      <div className="absolute inset-0 w-full h-full pointer-events-none z-[1]">
        <div className="absolute -top-[10%] -left-[10%] w-[60vw] h-[60vw] rounded-full bg-blue-600/20 blur-[120px] animate-aurora-1 mix-blend-screen" />
        <div className="absolute bottom-[0%] -right-[10%] w-[50vw] h-[50vw] rounded-full bg-purple-600/20 blur-[120px] animate-aurora-2 mix-blend-screen" />
      </div>

      <Canvas camera={{ position: [0, 0, 18], fov: 60 }}>
        <Scene />
      </Canvas>

      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
        <div className="absolute w-[80vw] max-w-[800px] h-[300px] bg-black/60 blur-[80px] rounded-full animate-fade-in-up" />
        
        {/* Added animation classes and stagger delays to the text */}
        <h1 className="relative font-display text-5xl md:text-7xl font-bold text-center px-6 max-w-5xl leading-tight tracking-tight animate-fade-in-up opacity-0 fill-mode-forwards delay-100">
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent drop-shadow-sm">
            Stlep
          </span>
          <span className="text-white drop-shadow-md">
            , nueva generación de edición de video impulsado por IA
          </span>
        </h1>
        
        <p className="relative mt-6 text-gray-400 text-lg md:text-xl max-w-2xl text-center font-medium drop-shadow-md animate-fade-in-up opacity-0 fill-mode-forwards delay-300">
          Potencia tu flujo de trabajo con herramientas de renderizado inteligentes.
        </p>
      </div>
    </section>
  );
}

export default function Stlep() {
  return <FloatingShapes />;
}