import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTime } from '../context/TimeContext';

function Satellite({ satellite, isSelected, onClick }) {
  const meshRef = useRef();
  const orbitRef = useRef();
  const { currentTime } = useTime();

  // Calculate satellite position based on current time
  const position = useMemo(() => {
    if (!satellite.position) return [0, 0, 0];
    
    // Update position based on orbital mechanics and current time
    const timeOffset = (currentTime.getTime() - Date.now()) / 1000;
    const meanMotion = 2 * Math.PI / (satellite.period * 60);
    const currentAngle = (timeOffset * meanMotion) % (2 * Math.PI);
    
    const radius = 6371 + satellite.altitude;
    const inclination = satellite.inclination * Math.PI / 180;
    
    const x = radius * Math.cos(currentAngle);
    const y = radius * Math.sin(currentAngle) * Math.cos(inclination);
    const z = radius * Math.sin(currentAngle) * Math.sin(inclination);
    
    return [x, y, z];
  }, [satellite, currentTime]);

  // Create orbit path
  const orbitGeometry = useMemo(() => {
    const points = [];
    const radius = 6371 + satellite.altitude;
    const inclination = satellite.inclination * Math.PI / 180;
    
    for (let i = 0; i <= 100; i++) {
      const angle = (i / 100) * 2 * Math.PI;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle) * Math.cos(inclination);
      const z = radius * Math.sin(angle) * Math.sin(inclination);
      points.push(new THREE.Vector3(x, y, z));
    }
    
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [satellite]);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...position);
      
      // Add a subtle pulsing effect for selected satellite
      if (isSelected) {
        meshRef.current.scale.setScalar(1 + Math.sin(Date.now() * 0.005) * 0.2);
      } else {
        meshRef.current.scale.setScalar(1);
      }
    }
  });

  const satelliteColor = isSelected ? '#ff6b6b' : getSatelliteColor(satellite.type);

  return (
    <group>
      {/* Orbit path */}
      <line geometry={orbitGeometry}>
        <lineBasicMaterial 
          color={satelliteColor} 
          transparent 
          opacity={isSelected ? 0.8 : 0.3}
          linewidth={2}
        />
      </line>
      
      {/* Satellite */}
      <mesh
        ref={meshRef}
        position={position}
        onClick={onClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        <boxGeometry args={[50, 20, 20]} />
        <meshBasicMaterial color={satelliteColor} />
      </mesh>
      
      {/* Satellite label */}
      {isSelected && (
        <mesh position={[position[0], position[1] + 100, position[2]]}>
          <planeGeometry args={[200, 50]} />
          <meshBasicMaterial 
            color="#000" 
            transparent 
            opacity={0.7}
          />
        </mesh>
      )}
    </group>
  );
}

function getSatelliteColor(type) {
  switch (type) {
    case 'Earth Observation':
      return '#4ecdc4';
    case 'Communication':
      return '#45b7d1';
    case 'Navigation':
      return '#f9ca24';
    case 'Space Station':
      return '#f0932b';
    case 'Weather':
      return '#eb4d4b';
    default:
      return '#6c5ce7';
  }
}

export default function SatelliteRenderer({ satellites, selectedSatellite }) {
  if (!satellites || satellites.length === 0) {
    return null;
  }

  return (
    <group>
      {satellites.map((satellite) => (
        <Satellite
          key={satellite.id}
          satellite={satellite}
          isSelected={selectedSatellite?.id === satellite.id}
          onClick={(e) => {
            e.stopPropagation();
            // This would trigger the parent component's satellite selection
            console.log('Satellite clicked:', satellite.name);
          }}
        />
      ))}
    </group>
  );
}
