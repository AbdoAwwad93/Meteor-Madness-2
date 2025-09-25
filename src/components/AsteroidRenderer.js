import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useTime } from '../context/TimeContext';

function AsteroidModel({ position, rotation, isSelected, onClick }) {
  const modelRef = useRef();
  const [modelLoaded, setModelLoaded] = useState(false);

  // Always call useGLTF hook (React hooks must be called unconditionally)
  const gltf = useGLTF('/Itokawa_1_1.glb');

  // Clone the scene to allow multiple instances
  const clonedScene = useMemo(() => {
    if (gltf?.scene) {
      const cloned = gltf.scene.clone();
      // Scale the model to small size for asteroids around Earth
      cloned.scale.setScalar(0.0005); // Small size, no difference when selected

      // Make the asteroid brighter by modifying materials
      cloned.traverse((child) => {
        if (child.isMesh && child.material) {
          // Clone the material to avoid affecting other instances
          child.material = child.material.clone();

          // Make asteroids consistently colored
          if (child.material.color) {
            child.material.color.multiplyScalar(2.5); // Normal brightness for all
          }

          // Add subtle emissive glow for all asteroids
          child.material.emissive = new THREE.Color(0x332211);
          child.material.emissiveIntensity = 0.1;

          // Consistent shininess for all asteroids
          if (child.material.shininess !== undefined) {
            child.material.shininess = 100;
          }
        }
      });

      // Debug logging removed for production
      setModelLoaded(true);
      return cloned;
    }
    return null;
  }, [gltf?.scene, isSelected]);

  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.position.copy(position);
      modelRef.current.rotation.copy(rotation);
    }
  });

  return (
    <group ref={modelRef} onClick={onClick}>
      {clonedScene ? (
        <primitive object={clonedScene} />
      ) : (
        // Fallback to simple asteroid geometry while loading
        <mesh>
          <sphereGeometry args={[0.05, 8, 6]} />
          <meshPhongMaterial
            color="#ccaa77"
            shininess={50}
            emissive="#221100"
          />
        </mesh>
      )}
    </group>
  );
}

function Asteroid({ asteroid, isSelected, onSelect }) {
  const groupRef = useRef();
  const position = useRef(new THREE.Vector3());
  const rotation = useRef(new THREE.Euler());

  // Debug logging removed for production

  // Calculate position - ONLY use real orbital data
  useMemo(() => {
    if (asteroid.hasRealOrbitalData && asteroid.realPosition) {
      // Use calculated real position from orbital mechanics
      position.current.copy(asteroid.realPosition);
    } else {
      // NO FALLBACK - throw error if no real data
      throw new Error(`Asteroid ${asteroid.name} missing real orbital data`);
    }

    // Set initial rotation (deterministic)
    const seed = asteroid.id ? asteroid.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0) : 1000;
    const seededRandom = (seed) => (Math.sin(seed) * 10000) % 1;
    rotation.current.set(
      seededRandom(seed + 5) * Math.PI,
      seededRandom(seed + 6) * Math.PI,
      seededRandom(seed + 7) * Math.PI
    );
  }, [asteroid.id, asteroid.orbit, asteroid.orbitProgress, asteroid.hasRealOrbitalData, asteroid.realPosition]);

  // Only rotate the asteroid slowly, no orbital movement
  useFrame(() => {
    // Slow rotation only
    rotation.current.x += 0.002;
    rotation.current.y += 0.003;
  });

  return (
    <group ref={groupRef}>
      <AsteroidModel
        position={position.current}
        rotation={rotation.current}
        isSelected={isSelected}
        onClick={() => onSelect && onSelect(asteroid)}
      />
    </group>
  );
}

function OrbitTrail({ orbit, asteroid, isHovered = false, isSelected = false }) {
  // Use the same deterministic logic as asteroid positioning
  const orbitData = useMemo(() => {
    // Create the same deterministic random seed based on asteroid ID
    const seed = asteroid.id ? asteroid.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0) : 1000;
    const seededRandom = (seed) => (Math.sin(seed) * 10000) % 1;

        const a = (asteroid.orbit?.semiMajorAxis || 1.5) * 100; // Use real semi-major axis, convert to scene units
    const e = orbit.eccentricity || 0.1;
    const i = (orbit.inclination || 0) * Math.PI / 180;

    const points = [];
    for (let angle = 0; angle < Math.PI * 2; angle += 0.05) {
      const r = a * (1 - e * e) / (1 + e * Math.cos(angle));
      const x = r * Math.cos(angle);
      const y = r * Math.sin(angle) * Math.cos(i);
      const z = r * Math.sin(angle) * Math.sin(i);
      points.push(new THREE.Vector3(x, y, z));
    }

    return { points, a, e, i };
  }, [orbit, asteroid.id]);

  const geometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(orbitData.points);
  }, [orbitData.points]);

  const lineRef = useRef();

  useEffect(() => {
    if (lineRef.current) {
      // compute distances for dashed material
      lineRef.current.computeLineDistances();
    }
  }, [geometry]);

  return (
    <group>
      <line ref={lineRef} geometry={geometry}>
        <lineDashedMaterial
          color={"#00e5ff"}
          transparent
          opacity={isSelected ? 0.85 : 0.45}
          dashSize={0.25}
          gapSize={0.15}
          linewidth={1}
        />
      </line>
    </group>
  );
}

function InteractiveOrbit({ asteroid, isSelected, onOrbitClick }) {
  // Use the same deterministic logic as asteroid positioning
  const orbitData = useMemo(() => {
    // Create the same deterministic random seed based on asteroid ID
    const seed = asteroid.id ? asteroid.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0) : 1000;
    const seededRandom = (seed) => (Math.sin(seed) * 10000) % 1;

        const a = (asteroid.orbit?.semiMajorAxis || 1.5) * 100; // Use real semi-major axis, convert to scene units
    const e = asteroid.orbit?.eccentricity || 0.1;
    const i = (asteroid.orbit?.inclination || 0) * Math.PI / 180;

    const points = [];
    for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
      const r = a * (1 - e * e) / (1 + e * Math.cos(angle));
      const x = r * Math.cos(angle);
      const y = r * Math.sin(angle) * Math.cos(i);
      const z = r * Math.sin(angle) * Math.sin(i);
      points.push(new THREE.Vector3(x, y, z));
    }

    return { points, a, e, i };
  }, [asteroid]);

  const geometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(orbitData.points);
  }, [orbitData.points]);

  return (
    <group>
      {/* Invisible thick line for easier clicking */}
      <line geometry={geometry} userData={{ isOrbitLine: true, asteroidId: asteroid.id }}>
        <lineBasicMaterial
          color="#ffffff"
          transparent
          opacity={0}
          linewidth={10}
        />
      </line>
      {/* Visible orbit trail */}
      <OrbitTrail
        orbit={asteroid.orbit}
        asteroid={asteroid}
        isSelected={isSelected}
      />
    </group>
  );
}

export default function AsteroidRenderer({ asteroids, selectedAsteroid, onAsteroidSelect, isFocusedMode = false }) {
  // Early return after hooks
  if (!asteroids || asteroids.length === 0) {
    return null;
  }

  // Filter asteroids based on mode
  const asteroidsToShow = isFocusedMode && selectedAsteroid
    ? asteroids.filter(asteroid => asteroid.id === selectedAsteroid.id)
    : asteroids;

  return (
    <group>
      {asteroidsToShow.map(asteroid => (
        <group key={asteroid.id}>
          <Asteroid
            asteroid={asteroid}
            isSelected={selectedAsteroid && selectedAsteroid.id === asteroid.id}
            onSelect={onAsteroidSelect}
          />
              {/* Orbits removed as requested */}
        </group>
      ))}
    </group>
  );
}

// Preload the GLB model for better performance
useGLTF.preload('/Itokawa_1_1.glb');
