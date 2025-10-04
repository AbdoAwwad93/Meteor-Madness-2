"use client"

import { useRef, useEffect, useState, useImperativeHandle } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import * as THREE from "three"
import { useData } from "../context/DataContext"
import { useTime } from "../context/TimeContext"
import AsteroidRenderer from "./AsteroidRenderer"

function Earth({ activeDataLayer, textures = {}, onEarthClick, allowSelection = false }) {
  const meshRef = useRef()
  const { currentTime } = useTime()

  useFrame((state) => {
    if (meshRef.current) {
      // Rotate Earth based on time
      meshRef.current.rotation.y = (currentTime.getTime() / 86400000) * Math.PI * 2
    }
  })

  const handleClick = (event) => {
    if (allowSelection && onEarthClick) {
      // Get the intersection point
      const intersection = event.intersections[0]
      if (intersection) {
        const point = intersection.point
        // Convert 3D point to lat/lng
        const lat = Math.asin(point.y / 5) * (180 / Math.PI)
        const lng = Math.atan2(point.z, point.x) * (180 / Math.PI)
        onEarthClick({ lat, lng, point: point.clone() })
      }
    }
  }

  return (
    <group>
      {/* Clickable Earth sphere */}
      <mesh 
        ref={meshRef} 
        position={[0, 0, 0]} 
        onClick={handleClick}
        userData={{ isEarth: true }}
        style={{ cursor: allowSelection ? 'crosshair' : 'default' }}
      >
        <sphereGeometry args={[5, 64, 32]} />
        <meshPhongMaterial map={textures.dayMap} color={textures.dayMap ? undefined : "#4a90e2"} shininess={100} />
      </mesh>
    </group>
  )
}

function CameraController({ selectedAsteroid, asteroids, isFocusedMode, onCameraReachedAsteroid, movingAsteroid, resetCameraRef, isResettingCamera, onResetComplete }) {
  const { camera } = useThree()
  const controlsRef = useRef()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  // Default camera position - responsive
  const defaultCameraPosition = new THREE.Vector3(0, 0, window.innerWidth <= 768 ? 25 : 20)
  const defaultTarget = new THREE.Vector3(0, 0, 0)

  // Expose reset function to parent component
  useImperativeHandle(resetCameraRef, () => ({
    resetToDefault: () => {
      if (controlsRef.current && camera) {
        setIsResetting(true)
        setIsTransitioning(true)
        
        const startPosition = camera.position.clone()
        const startTarget = controlsRef.current.target.clone()
        
        const startTime = Date.now()
        const duration = 3000
        
        const animateReset = () => {
          const elapsed = Date.now() - startTime
          const progress = Math.min(elapsed / duration, 1)
          
          // Smooth easing function
          const easeInOutCubic = progress < 0.5 
            ? 4 * progress * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 3) / 2
          
          // Interpolate camera position
          camera.position.lerpVectors(startPosition, defaultCameraPosition, easeInOutCubic)
          
          // Interpolate target (look at Earth center)
          if (controlsRef.current) {
            controlsRef.current.target.lerpVectors(startTarget, defaultTarget, easeInOutCubic)
            controlsRef.current.update()
          }
          
          if (progress < 1) {
            requestAnimationFrame(animateReset)
          } else {
            setIsTransitioning(false)
            setIsResetting(false)
            // Call the parent callback to clear the reset flag
            if (onResetComplete) {
              onResetComplete()
            }
          }
        }
        
        animateReset()
      }
    }
  }))
  // Handle asteroid selection and camera movement
  useEffect(() => {
    // Don't move camera if we're resetting or if no asteroid is selected
    if (!selectedAsteroid || !asteroids || !controlsRef.current || isResetting || isResettingCamera) {
      return
    }
    
    if (selectedAsteroid && asteroids && controlsRef.current && !isResetting && !isResettingCamera) {
      const asteroid = asteroids.find((a) => a.id === selectedAsteroid.id)
      if (asteroid) {
        setIsTransitioning(true)

        // Use real asteroid position if available
        const asteroidPosition = new THREE.Vector3()

        if (asteroid.realPosition) {
          // Use the calculated real position
          asteroidPosition.copy(asteroid.realPosition)
        } else {
          // Fallback to calculated position using orbital mechanics

          if (asteroid.orbit && asteroid.orbit.semiMajorAxis) {
            // Use orbital mechanics calculation
            const orbit = asteroid.orbit
            const currentTime = new Date()
            const epochTime = new Date((orbit.epoch - 2440587.5) * 86400000)
            const timeSinceEpoch = (currentTime.getTime() - epochTime.getTime()) / 86400000

            const meanMotion = Math.sqrt(1.32712440018e11 / Math.pow(orbit.semiMajorAxis * 149597870.7, 3)) * 86400
            const meanAnomaly = ((orbit.meanAnomaly * Math.PI) / 180 + meanMotion * timeSinceEpoch) % (2 * Math.PI)

            // Solve Kepler's equation
            let eccentricAnomaly = meanAnomaly
            for (let i = 0; i < 10; i++) {
              const f = eccentricAnomaly - orbit.eccentricity * Math.sin(eccentricAnomaly) - meanAnomaly
              const fPrime = 1 - orbit.eccentricity * Math.cos(eccentricAnomaly)
              eccentricAnomaly = eccentricAnomaly - f / fPrime
            }

            // Calculate true anomaly
            const cosE = Math.cos(eccentricAnomaly)
            const sinE = Math.sin(eccentricAnomaly)
            const sqrtOneMinusESq = Math.sqrt(1 - orbit.eccentricity * orbit.eccentricity)
            const cosNu = (cosE - orbit.eccentricity) / (1 - orbit.eccentricity * cosE)
            const sinNu = (sqrtOneMinusESq * sinE) / (1 - orbit.eccentricity * cosE)
            const trueAnomaly = Math.atan2(sinNu, cosNu)

            // Calculate distance
            const r =
              (orbit.semiMajorAxis * (1 - orbit.eccentricity * orbit.eccentricity)) /
              (1 + orbit.eccentricity * Math.cos(trueAnomaly))

            // Convert to scene units (1 AU = 100 units)
            const rScene = r * 100

            // Calculate position in orbital plane
            const xOrb = rScene * Math.cos(trueAnomaly)
            const yOrb = rScene * Math.sin(trueAnomaly)

            // Apply orbital inclination and orientation
            const i = (orbit.inclination * Math.PI) / 180
            const Omega = (orbit.longitudeOfAscendingNode * Math.PI) / 180
            const omega = (orbit.argumentOfPerihelion * Math.PI) / 180

            // Rotate to heliocentric coordinates
            const x = xOrb * Math.cos(omega) - yOrb * Math.sin(omega)
            const y = (xOrb * Math.sin(omega) + yOrb * Math.cos(omega)) * Math.cos(i)
            const z = (xOrb * Math.sin(omega) + yOrb * Math.cos(omega)) * Math.sin(i)

            // Final rotation by longitude of ascending node
            const xFinal = x * Math.cos(Omega) - y * Math.sin(Omega)
            const yFinal = x * Math.sin(Omega) + y * Math.cos(Omega)
            const zFinal = z

            asteroidPosition.set(xFinal, yFinal, zFinal)
          }
        }

        // Calculate camera position - behind the asteroid with Earth visible
        const direction = asteroidPosition.clone().normalize()
        
        // Special closer distance for Bennu model (asteroid at index 2)
        let distance = isFocusedMode ? 0.2 : 1.5 // Very close to asteroid for detailed view
        const asteroidIndex = window.asteroidIndexMap ? window.asteroidIndexMap.get(asteroid.id) : 0
        if (asteroidIndex === 2) { // Bennu model is at index 2
          distance = isFocusedMode ? 0.08 : 0.5 // Much closer for Bennu model
        }
        
        // Position camera behind the asteroid (opposite side from Earth)
        // This makes Earth visible in the background
        const cameraPosition = asteroidPosition.clone().add(direction.multiplyScalar(distance))

        // Animate camera to new position with faster, smoother transition
        const startPosition = camera.position.clone()
        const startTarget = controlsRef.current?.target?.clone() || new THREE.Vector3(0, 0, 0)
        const duration = 3500 // Faster transition for better responsiveness
        const startTime = Date.now()

        const animateCamera = () => {
          const elapsed = Date.now() - startTime
          const progress = Math.min(elapsed / duration, 1)

          // Improved easing function for smoother, faster transition
          const easeInOutCubic = progress < 0.5 
            ? 4 * progress * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 3) / 2

          // Interpolate camera position
          camera.position.lerpVectors(startPosition, cameraPosition, easeInOutCubic)

          // Interpolate target (look at asteroid) - only if controls exist
          if (controlsRef.current) {
            controlsRef.current.target.lerpVectors(startTarget, asteroidPosition, easeInOutCubic)
            controlsRef.current.update()
          }

          if (progress < 1) {
            requestAnimationFrame(animateCamera)
          } else {
            setIsTransitioning(false)
            // Call the callback when camera reaches the asteroid
            if (onCameraReachedAsteroid) {
              onCameraReachedAsteroid()
            }
          }
        }

        animateCamera()
      }
    }
    // Removed automatic camera reset to Earth view - camera stays where user positions it
  }, [selectedAsteroid, asteroids, camera, isFocusedMode, onCameraReachedAsteroid, movingAsteroid, isResetting, isResettingCamera])

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      zoomSpeed={1}
      panSpeed={1}
      rotateSpeed={0.5}
      minDistance={0.18} // Allow very close zoom for detailed asteroid viewing
      maxDistance={500}
      enabled={true} // Always allow camera controls
    />
  )
}

function Lighting() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 5, 10]} intensity={1} castShadow />
      <pointLight position={[0, 0, 0]} intensity={0.5} />
    </>
  )
}

function MilkyWayBackground({ milkyWayTexture }) {
  const meshRef = useRef()
  
  useEffect(() => {
    if (milkyWayTexture && meshRef.current) {
      // Create a large sphere for the background
      const geometry = new THREE.SphereGeometry(100, 32, 32)
      const material = new THREE.MeshBasicMaterial({
        map: milkyWayTexture,
        side: THREE.BackSide, // Render inside of sphere
      })
      
      if (meshRef.current) {
        meshRef.current.geometry = geometry
        meshRef.current.material = material
      }
    }
  }, [milkyWayTexture])

  if (!milkyWayTexture) return null

  return <mesh ref={meshRef} />
}





export default function EarthVisualization({
  selectedSatellite,
  activeDataLayer,
  onSatelliteSelect,
  isFocusedMode = false,
  movingAsteroid,
  movementProgress,
  onCameraReachedAsteroid,
  targetPosition,
  onEarthClick,
  allowSelection = false,
  resetCameraRef,
  isResettingCamera,
  onResetComplete,
}) {
  const { satellites } = useData()
  const [isLoaded] = useState(true) // Always show Earth
  const [loadedTextures, setLoadedTextures] = useState({})

  // Create fallback asteroids if none are loaded
  const fallbackAsteroids = [
    {
      id: 'fallback-1',
      name: 'Didymos',
      type: 'Near Earth Object',
      status: 'Safe',
      diameter: 0.8,
      velocity: 25000,
      distance: 1000000,
      orbit: {
        semiMajorAxis: 1.6,
        eccentricity: 0.38,
        inclination: 3.4,
        period: 770
      },
      realPosition: new THREE.Vector3(12, 2, 8),
      hasRealOrbitalData: true,
      magnitude: 18.1,
      discoveryDate: '1996-04-11',
      isPotentiallyHazardous: false
    },
    {
      id: 'fallback-2',
      name: 'Bennu',
      type: 'Near Earth Object',
      status: 'Hazardous',
      diameter: 0.5,
      velocity: 30000,
      distance: 2000000,
      orbit: {
        semiMajorAxis: 1.1,
        eccentricity: 0.2,
        inclination: 6.0,
        period: 436
      },
      realPosition: new THREE.Vector3(-10, -1, 6),
      hasRealOrbitalData: true,
      magnitude: 20.1,
      discoveryDate: '1999-09-11',
      isPotentiallyHazardous: true
    }
  ]

  const asteroidsToRender = satellites && satellites.length > 0 ? satellites : fallbackAsteroids

  useEffect(() => {
    const loader = new THREE.TextureLoader()
    // Allow loading from CDNs with CORS
    if (loader.setCrossOrigin) loader.setCrossOrigin("anonymous")
    const basePath = (process.env.PUBLIC_URL || "") + "/textures"

    // Define candidate URLs for each texture (local first, then CDN fallbacks)
    const candidates = {
      dayMap: [
        `${basePath}/8k_earth_daymap.jpg`,
        "https://unpkg.com/three-globe@2.30.0/example/img/earth-blue-marble.jpg",
        "https://raw.githubusercontent.com/itsmetommi/threejs-earth-textures/main/2k_earth_daymap.jpg",
        "https://unpkg.com/@pmndrs/assets@1.0.0/textures/planets/earth/day.jpg",
      ],
      nightMap: [
        `${basePath}/8k_earth_nightmap.jpg`,
        "https://raw.githubusercontent.com/itsmetommi/threejs-earth-textures/main/2k_earth_nightmap.jpg",
      ],
      cloudsMap: [
        `${basePath}/8k_earth_clouds.jpg`,
        "https://raw.githubusercontent.com/itsmetommi/threejs-earth-textures/main/2k_earth_clouds.jpg",
      ],
      milkyWay: [`${basePath}/8k_stars_milky_way.jpg`],
    }

    // Preload textures for faster transitions
    const textureCache = new Map()

    function setCommonTextureProps(texture) {
      if (!texture) return
      // sRGB for color-correct rendering
      if ("colorSpace" in texture) {
        texture.colorSpace = THREE.SRGBColorSpace
      } else {
        // older three fallback
        texture.encoding = THREE.sRGBEncoding
      }
      texture.anisotropy = 8
      texture.wrapS = THREE.RepeatWrapping
      texture.wrapT = THREE.ClampToEdgeWrapping
    }

    function loadFirstAvailable(urlList, cacheKey) {
      return new Promise((resolve) => {
        // Check cache first
        if (textureCache.has(cacheKey)) {
          resolve(textureCache.get(cacheKey))
          return
        }

        const tryNext = (idx) => {
          if (idx >= urlList.length) {
            resolve(null)
            return
          }
          const url = urlList[idx]
          loader.load(
            url,
            (tex) => {
              setCommonTextureProps(tex)
              // Cache the texture for future use
              textureCache.set(cacheKey, tex)
              resolve(tex)
            },
            undefined,
            () => {
              tryNext(idx + 1)
            },
          )
        }
        tryNext(0)
      })
    }

    function createProceduralDayTexture() {
      const canvas = document.createElement("canvas")
      canvas.width = 1024
      canvas.height = 512
      const ctx = canvas.getContext("2d")
      // Ocean (brighter, more saturated)
      const oceanGradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      oceanGradient.addColorStop(0, "#1565C0")
      oceanGradient.addColorStop(1, "#0D47A1")
      ctx.fillStyle = oceanGradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      // Simple continents blotches with higher contrast
      ctx.fillStyle = "#43A047"
      for (let i = 0; i < 200; i++) {
        const x = Math.random() * canvas.width
        const y = Math.random() * canvas.height
        const r = Math.random() * 55 + 25
        ctx.beginPath()
        ctx.ellipse(x, y, r * 1.9, r, 0, 0, Math.PI * 2)
        ctx.globalAlpha = 0.95
        ctx.fill()
      }
      ctx.globalAlpha = 1
      // Add ice caps
      const gradTop = ctx.createLinearGradient(0, 0, 0, 80)
      gradTop.addColorStop(0, "rgba(240,240,255,0.95)")
      gradTop.addColorStop(1, "rgba(240,240,255,0)")
      ctx.fillStyle = gradTop
      ctx.fillRect(0, 0, canvas.width, 100)
      const gradBottom = ctx.createLinearGradient(0, canvas.height - 80, 0, canvas.height)
      gradBottom.addColorStop(0, "rgba(240,240,255,0)")
      gradBottom.addColorStop(1, "rgba(240,240,255,0.95)")
      ctx.fillStyle = gradBottom
      ctx.fillRect(0, canvas.height - 100, canvas.width, 100)
      const texture = new THREE.CanvasTexture(canvas)
      setCommonTextureProps(texture)
      return texture
    }

    // Set an immediate high-contrast procedural texture so Earth never appears flat
    const immediateProcedural = createProceduralDayTexture()
    setLoadedTextures({ dayMap: immediateProcedural })
    ;(async () => {
      const [dayMap, nightMap, cloudsMap, milkyWay] = await Promise.all([
        loadFirstAvailable(candidates.dayMap, 'dayMap'),
        loadFirstAvailable(candidates.nightMap, 'nightMap'),
        loadFirstAvailable(candidates.cloudsMap, 'cloudsMap'),
        loadFirstAvailable(candidates.milkyWay, 'milkyWay'),
      ])

      const finalDayMap = dayMap || immediateProcedural || createProceduralDayTexture()
      const textures = { dayMap: finalDayMap }
      if (nightMap) textures.nightMap = nightMap
      if (cloudsMap) textures.cloudsMap = cloudsMap
      if (milkyWay) textures.milkyWay = milkyWay

      setLoadedTextures(textures)
    })()
  }, [])

  return (
    <Canvas
      camera={{ 
        position: [0, 0, 20], 
        fov: window.innerWidth <= 768 ? 60 : 45 // Wider FOV on mobile for better viewing
      }}
      style={{ 
        width: "100%", 
        height: "100%", 
        position: "absolute", 
        top: 0, 
        left: 0 
      }}
      gl={{ 
        antialias: window.innerWidth > 768, // Disable antialias on mobile for performance
        alpha: true,
        powerPreference: "high-performance"
      }}
      scene={{ background: null }}
      dpr={window.innerWidth <= 768 ? 1 : window.devicePixelRatio} // Lower pixel ratio on mobile
    >

      <Lighting />
      
      {/* Milky Way Background */}
      <MilkyWayBackground milkyWayTexture={loadedTextures.milkyWay} />

      {isLoaded && (
        <>
          {/* Always show Earth */}
          <Earth textures={loadedTextures} onEarthClick={onEarthClick} allowSelection={allowSelection} />
          
          
          <AsteroidRenderer
            asteroids={asteroidsToRender}
            selectedAsteroid={selectedSatellite}
            onAsteroidSelect={onSatelliteSelect}
            isFocusedMode={isFocusedMode}
            movingAsteroid={movingAsteroid}
            movementProgress={movementProgress}
            targetPosition={targetPosition}
          />
          
          {/* Trajectory line removed as requested */}
          
          {/* Impact effects removed as requested */}
        </>
      )}
      <CameraController 
        selectedAsteroid={selectedSatellite} 
        asteroids={asteroidsToRender} 
        isFocusedMode={isFocusedMode} 
        onCameraReachedAsteroid={onCameraReachedAsteroid} 
        movingAsteroid={movingAsteroid} 
        resetCameraRef={resetCameraRef} 
        isResettingCamera={isResettingCamera} 
        onResetComplete={onResetComplete} 
      />
    </Canvas>
  )
}
