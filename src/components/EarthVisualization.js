import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useData } from '../context/DataContext';
import { useTime } from '../context/TimeContext';
import AsteroidRenderer, { TestAsteroids } from './AsteroidRenderer';

function Earth({ activeDataLayer, textures = {} }) {
  const meshRef = useRef();
  const { currentTime } = useTime();

  useFrame((state) => {
    if (meshRef.current) {
      // Rotate Earth based on time
      meshRef.current.rotation.y = (currentTime.getTime() / 86400000) * Math.PI * 2;
      // Debug: log that Earth is rendering
      if (state.clock.elapsedTime < 1) {
        console.log('Earth is rendering, position:', meshRef.current.position);
      }
    }
  });

  return (
    <group>
      {/* Single Earth sphere */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <sphereGeometry args={[5, 64, 32]} />
        <meshPhongMaterial
          map={textures.dayMap}
          color={textures.dayMap ? undefined : '#4a90e2'}
          shininess={100}
        />
      </mesh>
    </group>
  );
}

function CameraController({ selectedAsteroid, asteroids, isFocusedMode }) {
  const { camera, gl } = useThree();
  const controlsRef = useRef();
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  useEffect(() => {
    camera.position.set(0, 0, 20);
    camera.lookAt(0, 0, 0);
    console.log('Camera positioned at:', camera.position);
  }, [camera]);

  // Handle asteroid selection and camera movement
  useEffect(() => {
    if (selectedAsteroid && asteroids && controlsRef.current && isFocusedMode) {
      const asteroid = asteroids.find(a => a.id === selectedAsteroid.id);
      if (asteroid) {
        setIsTransitioning(true);
        
        // Calculate asteroid position (same logic as in AsteroidRenderer but deterministic)
        let asteroidPosition = new THREE.Vector3();
        
        // Create a deterministic random seed based on asteroid ID
        const seed = asteroid.id ? asteroid.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0) : 1000;
        const seededRandom = (seed) => (Math.sin(seed) * 10000) % 1;
        
        if (asteroid.orbit) {
          const orbitProgress = asteroid.orbitProgress || seededRandom(seed);
          const angle = orbitProgress * Math.PI * 2;
          const a = 8 + seededRandom(seed + 1) * 4; // Deterministic distance
          const e = asteroid.orbit.eccentricity || 0.1;
          const i = (asteroid.orbit.inclination || 0) * Math.PI / 180;
          
          const r = a * (1 - e * e) / (1 + e * Math.cos(angle));
          const x = r * Math.cos(angle);
          const y = r * Math.sin(angle) * Math.cos(i);
          const z = r * Math.sin(angle) * Math.sin(i);
          
          asteroidPosition.set(x, y, z);
        } else {
          const distance = 8 + seededRandom(seed + 2) * 4;
          const theta = seededRandom(seed + 3) * Math.PI * 2;
          const phi = seededRandom(seed + 4) * Math.PI;
          
          asteroidPosition.set(
            distance * Math.sin(phi) * Math.cos(theta),
            distance * Math.cos(phi),
            distance * Math.sin(phi) * Math.sin(theta)
          );
        }
        
        // Position camera to focus on asteroid as main object (much closer for focused view)
        const direction = asteroidPosition.clone().normalize();
        const distance = 1.5; // Much closer distance for focused asteroid view
        const cameraPosition = asteroidPosition.clone().add(direction.multiplyScalar(-distance));
        
        // Animate camera to new position
        const startPosition = camera.position.clone();
        const startTarget = controlsRef.current.target.clone();
        const duration = 2000; // 2 seconds
        const startTime = Date.now();
        
        const animateCamera = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Smooth easing function
          const easeInOut = progress < 0.5 
            ? 2 * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
          
          // Interpolate camera position
          camera.position.lerpVectors(startPosition, cameraPosition, easeInOut);
          
          // Interpolate target (look at asteroid)
          controlsRef.current.target.lerpVectors(startTarget, asteroidPosition, easeInOut);
          controlsRef.current.update();
          
          if (progress < 1) {
            requestAnimationFrame(animateCamera);
          } else {
            setIsTransitioning(false);
          }
        };
        
        animateCamera();
      }
    } else if (!isFocusedMode && controlsRef.current) {
      // Reset camera to Earth view
      setIsTransitioning(true);
      const startPosition = camera.position.clone();
      const startTarget = controlsRef.current.target.clone();
      const targetPosition = new THREE.Vector3(0, 0, 20);
      const targetTarget = new THREE.Vector3(0, 0, 0);
      const duration = 2000; // 2 seconds
      const startTime = Date.now();
      
      const animateCamera = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Smooth easing function
        const easeInOut = progress < 0.5 
          ? 2 * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        
        // Interpolate camera position
        camera.position.lerpVectors(startPosition, targetPosition, easeInOut);
        
        // Interpolate target (look at Earth)
        controlsRef.current.target.lerpVectors(startTarget, targetTarget, easeInOut);
        controlsRef.current.update();
        
        if (progress < 1) {
          requestAnimationFrame(animateCamera);
        } else {
          setIsTransitioning(false);
        }
      };
      
      animateCamera();
    }
  }, [selectedAsteroid, asteroids, camera, isFocusedMode]);

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      zoomSpeed={0.6}
      panSpeed={0.5}
      rotateSpeed={0.4}
      minDistance={1}
      maxDistance={100}
      enabled={!isTransitioning} // Disable controls during transition
    />
  );
}

function Lighting() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 5, 10]}
        intensity={1}
        castShadow
      />
      <pointLight position={[0, 0, 0]} intensity={0.5} />
    </>
  );
}

function MilkyWayBackground() {
  const [milkyWayTexture, setMilkyWayTexture] = useState(null);

  useEffect(() => {
    console.log('Creating Milky Way background...');
    
    // Always create procedural Milky Way texture (more reliable)
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    
    // Create gradient background
    const gradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, canvas.width / 2
    );
    gradient.addColorStop(0, 'rgba(100, 50, 150, 0.8)');
    gradient.addColorStop(0.3, 'rgba(50, 25, 100, 0.6)');
    gradient.addColorStop(0.6, 'rgba(25, 12, 50, 0.4)');
    gradient.addColorStop(1, 'rgba(10, 5, 20, 0.2)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add stars
    ctx.fillStyle = 'white';
    for (let i = 0; i < 2000; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 2;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Add Milky Way band
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(-Math.PI / 6);
    
    const milkyWayGradient = ctx.createLinearGradient(0, -canvas.height / 4, 0, canvas.height / 4);
    milkyWayGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
    milkyWayGradient.addColorStop(0.3, 'rgba(200, 180, 255, 0.3)');
    milkyWayGradient.addColorStop(0.5, 'rgba(255, 220, 180, 0.5)');
    milkyWayGradient.addColorStop(0.7, 'rgba(200, 180, 255, 0.3)');
    milkyWayGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = milkyWayGradient;
    ctx.fillRect(-canvas.width, -canvas.height / 4, canvas.width * 2, canvas.height / 2);
    ctx.restore();
    
    // Add nebula clouds
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const radius = Math.random() * 100 + 50;
      
      const nebulaGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      const colors = [
        'rgba(255, 100, 150, 0.2)',
        'rgba(100, 150, 255, 0.2)',
        'rgba(150, 255, 100, 0.2)',
        'rgba(255, 200, 100, 0.2)'
      ];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      nebulaGradient.addColorStop(0, color);
      nebulaGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = nebulaGradient;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    setMilkyWayTexture(texture);
    console.log('Milky Way texture created successfully');
  }, []);

  if (!milkyWayTexture) {
    console.log('Milky Way texture not ready yet');
    return null;
  }

  return (
    <mesh>
      <sphereGeometry args={[500, 32, 16]} />
      <meshBasicMaterial
        map={milkyWayTexture}
        side={THREE.BackSide}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
}

function SimpleStars() {
  const starsRef = useRef();
  
  useEffect(() => {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({ 
      color: 0xffffff, 
      size: 2,
      sizeAttenuation: false 
    });
    
    const starsVertices = [];
    for (let i = 0; i < 1000; i++) {
      const radius = 50 + Math.random() * 50;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      
      starsVertices.push(x, y, z);
    }
    
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    
    if (starsRef.current) {
      starsRef.current.geometry = starsGeometry;
      starsRef.current.material = starsMaterial;
    }
  }, []);

  return <points ref={starsRef} />;
}

export default function EarthVisualization({ selectedSatellite, activeDataLayer, onSatelliteSelect, isFocusedMode = false }) {
  const { satellites } = useData();
  const [isLoaded, setIsLoaded] = useState(true); // Always show Earth
  const [loadedTextures, setLoadedTextures] = useState({});
  
  console.log('EarthVisualization satellites:', satellites?.length || 0, satellites);

  useEffect(() => {
    // Try to preload textures in background
    const loader = new THREE.TextureLoader();
    // Only load JPG files for now (TIF not supported in browsers)
    const textureUrls = [
      `${process.env.PUBLIC_URL}/textures/8k_earth_daymap.jpg`,
      `${process.env.PUBLIC_URL}/textures/8k_earth_nightmap.jpg`,
      `${process.env.PUBLIC_URL}/textures/8k_earth_clouds.jpg`,
      `${process.env.PUBLIC_URL}/textures/8k_stars_milky_way.jpg`
    ];

    console.log('Starting texture loading...');
    const textures = {};
    let loadedCount = 0;
    
    textureUrls.forEach((url, index) => {
      console.log(`Attempting to load: ${url}`);
      loader.load(
        url, 
        (texture) => {
          const keys = ['dayMap', 'nightMap', 'cloudsMap', 'milkyWay'];
          textures[keys[index]] = texture;
          loadedCount++;
          console.log(`✅ Successfully loaded texture: ${url} (${loadedCount}/${textureUrls.length})`);
          
          // Update state with loaded textures
          setLoadedTextures({...textures});
        },
        (progress) => {
          console.log(`Loading progress for ${url}:`, progress);
        },
        (error) => {
          console.error(`❌ Failed to load texture: ${url}`, error);
          loadedCount++;
        }
      );
    });
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0, 20], fov: 45 }}
      style={{ width: '100%', height: '100%' }}
      gl={{ antialias: true, alpha: false }}
    >
      <color attach="background" args={['#000']} />
      
      <Lighting />
      
      {isLoaded && (
        <>
          {/* Always show Earth */}
          <Earth textures={loadedTextures} />
          <AsteroidRenderer
            asteroids={satellites}
            selectedAsteroid={selectedSatellite}
            onAsteroidSelect={onSatelliteSelect}
            isFocusedMode={isFocusedMode}
          />
        </>
      )}
      <CameraController 
        selectedAsteroid={selectedSatellite} 
        asteroids={satellites} 
        isFocusedMode={isFocusedMode}
      />
    </Canvas>
  );
}
