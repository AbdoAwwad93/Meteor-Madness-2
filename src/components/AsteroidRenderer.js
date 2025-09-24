import React, { useRef, useMemo, useState } from 'react';
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
      // Scale the model to appropriate size for asteroids around Earth
      cloned.scale.setScalar(0.001); // Larger scale to make asteroids more visible

      // Make the asteroid brighter by modifying materials
      cloned.traverse((child) => {
        if (child.isMesh && child.material) {
          // Clone the material to avoid affecting other instances
          child.material = child.material.clone();

          // Make it brighter
          if (child.material.color) {
            child.material.color.multiplyScalar(2.5); // Increase brightness
          }

          // Add emissive glow
          child.material.emissive = new THREE.Color(0x332211);
          child.material.emissiveIntensity = isSelected ? 0.3 : 0.1;

          // Increase shininess
          if (child.material.shininess !== undefined) {
            child.material.shininess = 100;
          }
        }
      });

      console.log('Cloned GLB scene created with scale:', cloned.scale);
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
        // Fallback to simple asteroid geometry while loading - brighter colors
        <mesh>
          <sphereGeometry args={[0.1, 8, 6]} />
          <meshPhongMaterial
            color={isSelected ? '#ffaa88' : '#ccaa77'}
            shininess={50}
            emissive={isSelected ? '#442211' : '#221100'}
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

  console.log('Rendering asteroid:', asteroid.name, 'with orbit:', asteroid.orbit);

  // Calculate fixed position once when component mounts
  useMemo(() => {
    // Create a deterministic random seed based on asteroid ID (same as camera controller)
    const seed = asteroid.id ? asteroid.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0) : 1000;
    const seededRandom = (seed) => (Math.sin(seed) * 10000) % 1;

    if (asteroid.orbit) {
      // Use asteroid's orbit progress to determine fixed angle
      const orbitProgress = asteroid.orbitProgress || seededRandom(seed);
      const angle = orbitProgress * Math.PI * 2;

      // Orbital parameters - deterministic based on asteroid ID
      const a = 8 + seededRandom(seed + 1) * 4; // 8-12 units from Earth
      const e = asteroid.orbit.eccentricity || 0.1; // Eccentricity
      const i = (asteroid.orbit.inclination || 0) * Math.PI / 180; // Inclination

      // Calculate fixed position in orbital plane
      const r = a * (1 - e * e) / (1 + e * Math.cos(angle));
      const x = r * Math.cos(angle);
      const y = r * Math.sin(angle) * Math.cos(i);
      const z = r * Math.sin(angle) * Math.sin(i);

      position.current.set(x, y, z);

      console.log(`Asteroid ${asteroid.name} fixed position:`, { x, y, z, distance: Math.sqrt(x*x + y*y + z*z) });
    } else {
      // If no orbit data, place asteroid at a fixed deterministic position around Earth
      const distance = 8 + seededRandom(seed + 2) * 4; // 8-12 units from Earth
      const theta = seededRandom(seed + 3) * Math.PI * 2;
      const phi = seededRandom(seed + 4) * Math.PI;

      position.current.set(
        distance * Math.sin(phi) * Math.cos(theta),
        distance * Math.cos(phi),
        distance * Math.sin(phi) * Math.sin(theta)
      );
    }

    // Set initial rotation (deterministic)
    rotation.current.set(
      seededRandom(seed + 5) * Math.PI,
      seededRandom(seed + 6) * Math.PI,
      seededRandom(seed + 7) * Math.PI
    );
  }, [asteroid.id, asteroid.orbit, asteroid.orbitProgress]);

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

    const a = 8 + seededRandom(seed + 1) * 4; // Same distance as asteroid
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

  return (
    <group>
      <line geometry={geometry}>
        <lineBasicMaterial
          color="#ffffff" // White color for all orbits
          transparent
          opacity={isSelected ? 0.6 : 0.3} // Only show selection state, no hover
          linewidth={2} // Fixed width, no hover effect
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

    const a = 8 + seededRandom(seed + 1) * 4; // Same distance as asteroid
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
  console.log('AsteroidRenderer received asteroids:', asteroids?.length || 0);

  // Early return after hooks
  if (!asteroids || asteroids.length === 0) {
    console.log('No asteroids to render');
    return null;
  }

  console.log('Rendering', asteroids.length, 'asteroids');

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
          {/* Only show orbits when not in focused mode */}
          {!isFocusedMode && asteroid.orbit && (
            <InteractiveOrbit
              asteroid={asteroid}
              isSelected={selectedAsteroid && selectedAsteroid.id === asteroid.id}
              onOrbitClick={() => onAsteroidSelect && onAsteroidSelect(asteroid)}
            />
          )}
        </group>
      ))}
    </group>
  );
}

// Preload the GLB model for better performance
useGLTF.preload('/Itokawa_1_1.glb');
