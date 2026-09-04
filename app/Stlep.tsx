"use client";

import { Canvas } from "@react-three/fiber";
import { MeshTransmissionMaterial, Environment } from "@react-three/drei";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function LiquidBlob() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime();
      meshRef.current.rotation.x = Math.sin(t * 0.3) * 0.3;
      meshRef.current.rotation.y = t * 0.2;
      meshRef.current.position.y = Math.sin(t * 0.5) * 0.2;
    }
  });

  return (
    <mesh ref={meshRef} scale={2.2}>
      <icosahedronGeometry args={[1, 16]} />
      <MeshTransmissionMaterial
        color="#ff1744"
        thickness={1.2}
        roughness={0.05}
        transmission={1}
        ior={1.4}
        chromaticAberration={0.05}
        distortion={0.6}
        distortionScale={0.4}
        temporalDistortion={0.15}
        clearcoat={1}
        attenuationColor="#ff1744"
        attenuationDistance={0.4}
      />
    </mesh>
  );
}

export function LiquidMetal() {
  return (
    <section className="relative w-full h-screen bg-black overflow-hidden">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={2} color="#ff1744" />
        <Environment preset="studio" />
        <LiquidBlob />
      </Canvas>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <h1 className="text-4xl md:text-6xl font-bold text-center px-6 max-w-4xl leading-tight">
          <span className="text-white">Stlep, </span>
          <span className="text-red-600">
            nueva generación de edición de video impulsado por IA
          </span>
        </h1>
      </div>
    </section>
  );
}

export default function Stlep() {
  return <LiquidMetal />;
}