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
    const loader = new THREE.TextureLoader();
    // Allow loading from CDNs with CORS
    if (loader.setCrossOrigin) loader.setCrossOrigin('anonymous');
    const basePath = (process.env.PUBLIC_URL || '') + '/textures';

    // Define candidate URLs for each texture (local first, then CDN fallbacks)
    const candidates = {
      dayMap: [
        `${basePath}/8k_earth_daymap.jpg`,
        'https://unpkg.com/three-globe@2.30.0/example/img/earth-blue-marble.jpg',
        'https://raw.githubusercontent.com/itsmetommi/threejs-earth-textures/main/2k_earth_daymap.jpg',
        'https://unpkg.com/@pmndrs/assets@1.0.0/textures/planets/earth/day.jpg'
      ],
      nightMap: [
        `${basePath}/8k_earth_nightmap.jpg`,
        'https://raw.githubusercontent.com/itsmetommi/threejs-earth-textures/main/2k_earth_nightmap.jpg'
      ],
      cloudsMap: [
        `${basePath}/8k_earth_clouds.jpg`,
        'https://raw.githubusercontent.com/itsmetommi/threejs-earth-textures/main/2k_earth_clouds.jpg'
      ],
      milkyWay: [
        `${basePath}/8k_stars_milky_way.jpg`
      ]
    };

    function setCommonTextureProps(texture) {
      if (!texture) return;
      // sRGB for color-correct rendering
      if ('colorSpace' in texture) {
        texture.colorSpace = THREE.SRGBColorSpace;
      } else {
        // older three fallback
        texture.encoding = THREE.sRGBEncoding;
      }
      texture.anisotropy = 8;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
    }

    function loadFirstAvailable(urlList) {
      return new Promise((resolve) => {
        const tryNext = (idx) => {
          if (idx >= urlList.length) {
            resolve(null);
            return;
          }
          const url = urlList[idx];
          console.log('Attempting to load texture:', url);
          loader.load(
            url,
            (tex) => {
              setCommonTextureProps(tex);
              console.log('Loaded texture:', url);
              resolve(tex);
            },
            undefined,
            () => {
              console.warn('Failed to load texture, trying next:', url);
              tryNext(idx + 1);
            }
          );
        };
        tryNext(0);
      });
    }

    function createProceduralDayTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      // Ocean (brighter, more saturated)
      const oceanGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      oceanGradient.addColorStop(0, '#1565C0');
      oceanGradient.addColorStop(1, '#0D47A1');
      ctx.fillStyle = oceanGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // Simple continents blotches with higher contrast
      ctx.fillStyle = '#43A047';
      for (let i = 0; i < 200; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const r = Math.random() * 55 + 25;
        ctx.beginPath();
        ctx.ellipse(x, y, r * 1.9, r, 0, 0, Math.PI * 2);
        ctx.globalAlpha = 0.95;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      // Add ice caps
      const gradTop = ctx.createLinearGradient(0, 0, 0, 80);
      gradTop.addColorStop(0, 'rgba(240,240,255,0.95)');
      gradTop.addColorStop(1, 'rgba(240,240,255,0)');
      ctx.fillStyle = gradTop;
      ctx.fillRect(0, 0, canvas.width, 100);
      const gradBottom = ctx.createLinearGradient(0, canvas.height - 80, 0, canvas.height);
      gradBottom.addColorStop(0, 'rgba(240,240,255,0)');
      gradBottom.addColorStop(1, 'rgba(240,240,255,0.95)');
      ctx.fillStyle = gradBottom;
      ctx.fillRect(0, canvas.height - 100, canvas.width, 100);
      const texture = new THREE.CanvasTexture(canvas);
      setCommonTextureProps(texture);
      return texture;
    }

    // Set an immediate high-contrast procedural texture so Earth never appears flat
    const immediateProcedural = createProceduralDayTexture();
    setLoadedTextures({ dayMap: immediateProcedural });

    (async () => {
      console.log('Starting texture loading with fallbacks...');
      const [dayMap, nightMap, cloudsMap, milkyWay] = await Promise.all([
        loadFirstAvailable(candidates.dayMap),
        loadFirstAvailable(candidates.nightMap),
        loadFirstAvailable(candidates.cloudsMap),
        loadFirstAvailable(candidates.milkyWay)
      ]);

      const finalDayMap = dayMap || immediateProcedural || createProceduralDayTexture();
      const textures = { dayMap: finalDayMap };
      if (nightMap) textures.nightMap = nightMap;
      if (cloudsMap) textures.cloudsMap = cloudsMap;
      if (milkyWay) textures.milkyWay = milkyWay;

      setLoadedTextures(textures);
    })();
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
