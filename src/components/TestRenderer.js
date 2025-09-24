import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Simple test component that renders a basic Earth sphere without textures
export function SimpleEarth() {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group>
      {/* Earth sphere with basic material */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <sphereGeometry args={[6371, 32, 16]} />
        <meshPhongMaterial
          color="#4a90e2"
          shininess={100}
        />
      </mesh>
      
      {/* Atmosphere */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[6371 * 1.01, 16, 8]} />
        <meshBasicMaterial
          color="#87ceeb"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

// Test satellite component
export function TestSatellite({ position = [8000, 0, 0] }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      // Simple orbital motion
      const time = state.clock.elapsedTime;
      meshRef.current.position.x = Math.cos(time * 0.5) * 8000;
      meshRef.current.position.z = Math.sin(time * 0.5) * 8000;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[100, 50, 50]} />
      <meshBasicMaterial color="#ff6b6b" />
    </mesh>
  );
}

export default function TestRenderer() {
  return (
    <group>
      <SimpleEarth />
      <TestSatellite />
    </group>
  );
}
