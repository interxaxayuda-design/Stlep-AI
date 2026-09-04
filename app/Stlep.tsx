"use client";

import { Canvas } from "@react-three/fiber";
import { MeshDistortMaterial, Environment } from "@react-three/drei";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function LiquidBlob() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime();
      meshRef.current.rotation.y = t * 0.15;
      meshRef.current.position.y = Math.sin(t * 0.4) * 0.15;
    }
  });

  return (
    <mesh ref={meshRef} scale={2.2}>
      <icosahedronGeometry args={[1, 6]} />
      <MeshDistortMaterial
        color="#c40012"
        metalness={0.9}
        roughness={0.15}
        distort={0.4}
        speed={1.5}
      />
    </mesh>
  );
}

export function LiquidMetal() {
  return (
    <section className="relative w-full h-screen bg-black overflow-hidden">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={3} color="#ffffff" />
        <pointLight position={[-5, -3, 2]} intensity={2} color="#ff1744" />
        <Environment preset="city" />
        <LiquidBlob />
      </Canvas>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <h1 className="font-display text-4xl md:text-6xl font-bold text-center px-6 max-w-4xl leading-tight tracking-tight">
          <span className="text-red-600">Stlep</span>
          <span className="text-white">
            , nueva generación de edición de video impulsado por IA
          </span>
        </h1>
      </div>
    </section>
  );
}

export default function Stlep() {
  return <LiquidMetal />;
}