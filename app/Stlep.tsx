"use client";

import { Canvas } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
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
  for (let i = 0; i < 10; i++) {
    shapes.push({
      position: [
        (Math.random() - 0.5) * 30,  // was 18
        (Math.random() - 0.5) * 18,  // was 11
        (Math.random() - 0.5) * 22 - 4,  // was 10, offset -2 → -4
      ],
      rotationSpeed: [
        (Math.random() - 0.5) * 0.15,
        (Math.random() - 0.5) * 0.15,
        (Math.random() - 0.5) * 0.1,
      ],
      scale: 0.8 + Math.random() * 1.8,  // slightly bigger too, so distant shapes stay visible
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

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime();
      meshRef.current.rotation.x += config.rotationSpeed[0] * 0.01;
      meshRef.current.rotation.y += config.rotationSpeed[1] * 0.01;
      meshRef.current.rotation.z += config.rotationSpeed[2] * 0.01;
      meshRef.current.position.y =
        config.position[1] + Math.sin(t * 0.3 + floatPhase) * 0.4;
    }
  });

  const geometryEl = (() => {
    switch (config.geometry) {
      case "icosahedron":
        return <icosahedronGeometry args={[1, 0]} />;
      case "torus":
        return <torusGeometry args={[1, 0.35, 8, 24]} />;
      case "octahedron":
        return <octahedronGeometry args={[1, 0]} />;
      case "dodecahedron":
        return <dodecahedronGeometry args={[1, 0]} />;
    }
  })();

  return (
    <mesh ref={meshRef} position={config.position} scale={config.scale}>
      {geometryEl}
      <meshBasicMaterial color={color} wireframe transparent opacity={0.5} />
    </mesh>
  );
}



function Scene() {
  const shapes = useMemo(() => generateShapes(), []);
  return (
    <>
      {shapes.map((s, i) => (
        <WireShape key={i} config={s} />
      ))}
    </>
  );
}

export function FloatingShapes() {
  return (
    <section className="relative w-full h-screen bg-black overflow-hidden">
      {/* Aurora glow layer */}
      <div className="absolute top-0 left-0 w-full h-[60vh] pointer-events-none z-[1] overflow-hidden">
        <div className="absolute -top-1/3 left-1/4 w-[60vw] h-[60vw] rounded-full bg-blue-500/30 blur-[120px] animate-aurora-1" />
        <div className="absolute -top-1/4 right-1/4 w-[50vw] h-[50vw] rounded-full bg-purple-500/30 blur-[120px] animate-aurora-2" />
      </div>

      <Canvas camera={{ position: [0, 0, 18], fov: 65 }}>
        <Scene />
      </Canvas>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <h1 className="font-display text-4xl md:text-6xl font-bold text-center px-6 max-w-4xl leading-tight tracking-tight">
          <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Stlep
          </span>
          <span className="text-white">
            , nueva generación de edición de video impulsado por IA
          </span>
        </h1>
      </div>
    </section>
  );
}

export default function Stlep() {
  return <FloatingShapes />;
}