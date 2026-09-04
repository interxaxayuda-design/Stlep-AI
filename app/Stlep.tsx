"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Line } from "@react-three/drei";
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const NODE_COUNT = 60;
const CONNECT_DISTANCE = 4.4;

type NodeData = {
  base: THREE.Vector3;
  phase: number;
  speed: number;
};

function generateNodes(): NodeData[] {
  const nodes: NodeData[] = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    nodes.push({
      base: new THREE.Vector3(
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 12
      ),
      phase: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.4,
    });
  }
  return nodes;
}

function lerpColor(t: number) {
  const blue = new THREE.Color("#3b82f6");
  const purple = new THREE.Color("#a855f7");
  return blue.clone().lerp(purple, t);
}

function Node({ data, index }: { data: NodeData; index: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const color = lerpColor(index / NODE_COUNT);

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime();
      meshRef.current.position.set(
        data.base.x + Math.sin(t * data.speed + data.phase) * 0.3,
        data.base.y + Math.cos(t * data.speed * 0.8 + data.phase) * 0.3,
        data.base.z + Math.sin(t * data.speed * 0.6 + data.phase) * 0.3
      );
      const pulse = 1 + Math.sin(t * 2 + data.phase) * 0.4;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <mesh ref={meshRef} position={data.base}>
      <sphereGeometry args={[0.06, 12, 12]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  );
}

function SignalPulse({
  a,
  b,
  color,
  speed,
}: {
  a: THREE.Vector3;
  b: THREE.Vector3;
  color: THREE.Color;
  speed: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const t = (state.clock.getElapsedTime() * speed) % 1;
      meshRef.current.position.lerpVectors(a, b, t);
      const fade = Math.sin(t * Math.PI);
      (meshRef.current.material as THREE.MeshBasicMaterial).opacity = fade;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.045, 8, 8]} />
      <meshBasicMaterial color={color} transparent toneMapped={false} />
    </mesh>
  );
}

function NetworkNodes() {
  const groupRef = useRef<THREE.Group>(null);
  const nodes = useMemo(() => generateNodes(), []);

  const connections = useMemo(() => {
    const lines: { a: THREE.Vector3; b: THREE.Vector3; t: number; speed: number }[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].base.distanceTo(nodes[j].base) < CONNECT_DISTANCE) {
          lines.push({
            a: nodes[i].base,
            b: nodes[j].base,
            t: i / nodes.length,
            speed: 0.15 + Math.random() * 0.35,
          });
        }
      }
    }
    return lines;
  }, [nodes]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.04;
    }
  });

  return (
    <group ref={groupRef}>
      {nodes.map((n, i) => (
        <Node key={i} data={n} index={i} />
      ))}
      {connections.map((c, i) => (
        <group key={i}>
          <Line
            points={[c.a, c.b]}
            color={lerpColor(c.t)}
            lineWidth={0.6}
            transparent
            opacity={0.15}
          />
          <SignalPulse a={c.a} b={c.b} color={lerpColor(c.t)} speed={c.speed} />
        </group>
      ))}
    </group>
  );
}

export function NeuralNetwork() {
  return (
    <section className="relative w-full h-screen bg-black overflow-hidden">
      <Canvas camera={{ position: [0, 0, 14], fov: 50 }}>
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