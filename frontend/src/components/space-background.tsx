'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function Stars() {
  const ref = useRef<THREE.Points>(null);
  
  const [positions, colors] = useMemo(() => {
    const particleCount = typeof window !== 'undefined' && window.matchMedia("(max-width: 768px)").matches ? 1500 : 2500;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const radius = Math.random() * 50 + 8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      const colorVariation = Math.random();
      if (colorVariation > 0.9) {
        colors[i * 3] = 1;
        colors[i * 3 + 1] = 0.8 + Math.random() * 0.2;
        colors[i * 3 + 2] = 0.6 + Math.random() * 0.2;
      } else {
        colors[i * 3] = 0.8 + Math.random() * 0.2;
        colors[i * 3 + 1] = 0.85 + Math.random() * 0.15;
        colors[i * 3 + 2] = 1;
      }
    }
    
    return [positions, colors];
  }, []);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta * 0.01;
      ref.current.rotation.y -= delta * 0.015;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 6]}>
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          vertexColors
          size={0.1}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </group>
  );
}

function GalaxySpiral() {
  const ref = useRef<THREE.Points>(null);
  
  const [positions, colors] = useMemo(() => {
    const count = typeof window !== 'undefined' && window.matchMedia("(max-width: 768px)").matches ? 800 : 1500;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const arm = Math.floor(Math.random() * 4);
      const armAngle = (arm / 4) * Math.PI * 2;
      const distance = Math.pow(Math.random(), 0.5) * 25;
      const spin = distance * 0.4;
      const angle = armAngle + spin + (Math.random() - 0.5) * (0.5 + distance * 0.02);
      
      positions[i * 3] = Math.cos(angle) * distance + (Math.random() - 0.5) * 1.5;
      positions[i * 3 + 1] = (Math.random() - 0.5) * (1 + distance * 0.05);
      positions[i * 3 + 2] = Math.sin(angle) * distance + (Math.random() - 0.5) * 1.5;
      
      // Galaxy colors: center warm, edges cool
      const distNorm = distance / 25;
      colors[i * 3] = 0.8 - distNorm * 0.4 + Math.random() * 0.2;
      colors[i * 3 + 1] = 0.3 - distNorm * 0.1 + Math.random() * 0.2;
      colors[i * 3 + 2] = 0.5 + distNorm * 0.5;
    }
    
    return [positions, colors];
  }, []);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.01;
    }
  });

  return (
    <group position={[8, 5, -40]} rotation={[1, 0.3, 0.5]}>
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          vertexColors
          size={0.15}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.6}
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </group>
  );
}

function Moon() {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <mesh ref={ref} position={[5, 3, -10]}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial
        color="#c8c8c8"
        emissive="#333333"
        emissiveIntensity={0.15}
        roughness={0.85}
        metalness={0.1}
      />
    </mesh>
  );
}

function GasGiant() {
  const ref = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.012;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.003;
    }
  });

  return (
    <group position={[-9, -4, -20]} rotation={[0.3, 0, 0.2]}>
      <mesh ref={ref}>
        <sphereGeometry args={[2.2, 64, 64]} />
        <meshStandardMaterial
          color="#1a1040"
          emissive="#0a0520"
          emissiveIntensity={0.3}
          roughness={0.6}
          metalness={0.4}
        />
      </mesh>
      <mesh ref={ringRef} rotation={[Math.PI / 2.2, 0, 0]}>
        <torusGeometry args={[3.5, 0.25, 2, 80]} />
        <meshBasicMaterial
          color="#7755cc"
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

export function SpaceBackground() {
  return (
    <div className="fixed inset-0 -z-10 hidden dark:block pointer-events-none">
      <Canvas
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
        camera={{ position: [0, 0, 8], fov: 65 }}
        style={{ background: 'radial-gradient(ellipse at 30% 80%, #0a0520 0%, #050210 40%, #000000 100%)' }}
      >
        <ambientLight intensity={0.08} />
        <pointLight position={[10, 8, 5]} intensity={0.4} color="#4466ff" />
        <pointLight position={[-8, -4, -10]} intensity={0.3} color="#6633aa" />
        <directionalLight position={[5, 5, 5]} intensity={0.2} color="#ffffff" />
        
        <Stars />
        <GalaxySpiral />
        <Moon />
        <GasGiant />
      </Canvas>
    </div>
  );
}

// Meteor overlay - CSS based, tembus semua, pointer-events none
export function MeteorOverlay() {
  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none hidden dark:block overflow-hidden">
      <div className="meteor meteor-0" />
      <div className="meteor meteor-1" />
      <div className="meteor meteor-2" />
      <div className="meteor meteor-3" />
      <style jsx>{`
        .meteor {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #fff;
          box-shadow: 
            0 0 4px 2px rgba(255, 255, 255, 0.9),
            0 0 8px 4px rgba(150, 200, 255, 0.6),
            0 0 16px 6px rgba(80, 120, 255, 0.3);
          opacity: 0;
        }
        /* Trail - garis panjang di belakang arah jatuh (atas) */
        .meteor::after {
          content: '';
          position: absolute;
          bottom: 100%;
          left: 50%;
          width: 2px;
          height: 120px;
          transform: translateX(-50%);
          background: linear-gradient(to top, rgba(255, 255, 255, 0.8), rgba(150, 200, 255, 0.4) 30%, transparent);
          border-radius: 2px;
        }

        /* Semua jatuh serong dari kiri-atas ke kanan-bawah */
        .meteor-0 {
          top: -5%;
          left: 15%;
          animation: fall 35s linear infinite;
        }
        .meteor-1 {
          top: -5%;
          left: 45%;
          animation: fall 40s linear infinite;
          animation-delay: 12s;
        }
        .meteor-2 {
          top: -5%;
          left: 70%;
          animation: fall 38s linear infinite;
          animation-delay: 22s;
        }
        .meteor-3 {
          top: -5%;
          left: 30%;
          animation: fall 42s linear infinite;
          animation-delay: 32s;
        }

        @keyframes fall {
          0%, 92% {
            opacity: 0;
            transform: translate(0, 0) rotate(25deg);
          }
          93% {
            opacity: 1;
            transform: translate(0, 0) rotate(25deg);
          }
          99% {
            opacity: 0.6;
          }
          100% {
            opacity: 0;
            transform: translate(150px, 110vh) rotate(25deg);
          }
        }
      `}</style>
    </div>
  );
}
