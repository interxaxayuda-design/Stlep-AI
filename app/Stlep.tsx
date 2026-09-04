"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Line } from "@react-three/drei";
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const NODE_COUNT = 50;
const CONNECT_DISTANCE = 2.2;

function generateNodes() {
  const nodes: THREE.Vector3[] = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    nodes.push(
      new THREE.Vector3(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 6
      )
    );
  }
  return nodes;
}

function lerpColor(t: number) {
  const blue = new THREE.Color("#3b82f6");
  const purple = new THREE.Color("#a855f7");
  return blue.clone().lerp(purple, t);
}

function NetworkNodes() {
  const groupRef = useRef<THREE.Group>(null);
  const nodes = useMemo(() => generateNodes(), []);

  const connections = useMemo(() => {
    const lines: { a: THREE.Vector3; b: THREE.Vector3; t: number }[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].distanceTo(nodes[j]) < CONNECT_DISTANCE) {
          lines.push({ a: nodes[i], b: nodes[j], t: i / nodes.length });
        }
      }
    }
    return lines;
  }, [nodes]);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      groupRef.current.rotation.y = t * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {nodes.map((pos, i) => {
        const color = lerpColor(i / nodes.length);
        return (
          <mesh key={i} position={pos}>
            <sphereGeometry args={[0.05, 12, 12]} />
            <meshBasicMaterial color={color} toneMapped={false} />
          </mesh>
        );
      })}
      {connections.map((c, i) => (
        <Line
          key={i}
          points={[c.a, c.b]}
          color={lerpColor(c.t)}
          lineWidth={0.6}
          transparent
          opacity={0.25}
        />
      ))}
    </group>
  );
}

export function NeuralNetwork() {
  return (
    <section className="relative w-full h-screen bg-black overflow-hidden">
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <NetworkNodes />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
        />
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
  return <NeuralNetwork />;
}