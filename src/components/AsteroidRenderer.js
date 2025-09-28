"use client"

import { useRef, useMemo, useState, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import { useGLTF, Text } from "@react-three/drei"
import * as THREE from "three"
import { latLngTo3D } from "../data/cities"

function AsteroidLabel({ position, name, isSelected }) {
  const textRef = useRef()
  
  useFrame(({ camera }) => {
    if (textRef.current) {
      // Make the text always face the camera
      textRef.current.lookAt(camera.position)
    }
  })

  return (
    <Text
      ref={textRef}
      position={[position.x + 0.15, position.y + 0.15, position.z]}
      fontSize={0.12}
      color="#ffffff"
      anchorX="left"
      anchorY="middle"
      material-transparent
      material-opacity={isSelected ? 1.0 : 0.7}
      outlineWidth={0.02}
      outlineColor="#000000"
    >
      {name}
    </Text>
  )
}

function AsteroidModel({ position, rotation, isSelected, onClick }) {
  const modelRef = useRef()
  const [modelLoaded, setModelLoaded] = useState(false)

  // Always call useGLTF hook (React hooks must be called unconditionally)
  const gltf = useGLTF("/Itokawa_1_1.glb")

  // Clone the scene to allow multiple instances
  const clonedScene = useMemo(() => {
    if (gltf?.scene) {
      const cloned = gltf.scene.clone()
      // Scale the model to small size for asteroids around Earth
      cloned.scale.setScalar(0.0005) // Small size, no difference when selected

      // Make the asteroid brighter by modifying materials
      cloned.traverse((child) => {
        if (child.isMesh && child.material) {
          // Clone the material to avoid affecting other instances
          child.material = child.material.clone()

          // Make asteroids consistently colored
          if (child.material.color) {
            child.material.color.multiplyScalar(2.5) // Normal brightness for all
          }

          // Add subtle emissive glow for all asteroids
          child.material.emissive = new THREE.Color(0x332211)
          child.material.emissiveIntensity = 0.1

          // Consistent shininess for all asteroids
          if (child.material.shininess !== undefined) {
            child.material.shininess = 100
          }
        }
      })

      // Debug logging removed for production
      setModelLoaded(true)
      return cloned
    }
    return null
  }, [gltf?.scene, isSelected])

  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.position.copy(position)
      modelRef.current.rotation.copy(rotation)
    }
  })

  return (
    <group ref={modelRef} onClick={onClick}>
      {clonedScene ? (
        <primitive object={clonedScene} />
      ) : (
        // Fallback to simple asteroid geometry while loading
        <mesh>
          <sphereGeometry args={[0.05, 8, 6]} />
          <meshPhongMaterial color="#ccaa77" shininess={50} emissive="#221100" />
        </mesh>
      )}
    </group>
  )
}

function Asteroid({ asteroid, isSelected, onSelect, isMoving, movementProgress }) {
  const groupRef = useRef()
  const position = useRef(new THREE.Vector3())
  const rotation = useRef(new THREE.Euler())
  const originalPosition = useRef(new THREE.Vector3())
  const animatedPosition = useRef(new THREE.Vector3())
  const targetPosition = useRef(new THREE.Vector3())

  useMemo(() => {
    if (asteroid.hasRealOrbitalData && asteroid.realPosition) {
      // Store original position (this will be the repositioned position if moving)
      originalPosition.current.copy(asteroid.realPosition)

      if (isMoving && movementProgress !== undefined) {
        // Calculate target position - use the target position passed from parent
        let targetPosition3D
        
        if (asteroid.targetPosition) {
          // Target specific position on Earth surface
          if (asteroid.targetPosition.point) {
            targetPosition3D = asteroid.targetPosition.point.clone()
          } else {
            // Fallback to lat/lng conversion
            targetPosition3D = latLngTo3D(asteroid.targetPosition.lat, asteroid.targetPosition.lng, 5.1)
          }
        } else {
          // Fallback to Earth center
          targetPosition3D = new THREE.Vector3(0, 0, 0)
        }
        
        const direction = targetPosition3D.clone().sub(originalPosition.current)
        const distance = direction.length()

        // Stop when very close to target (within 0.1 units for surface targets, 5.1 for Earth center)
        const minDistance = asteroid.targetPosition ? 0.1 : 5.1
        const maxProgress = Math.max(0, (distance - minDistance) / distance)
        const clampedProgress = Math.min(movementProgress, maxProgress)

        targetPosition.current.copy(originalPosition.current)
        targetPosition.current.add(direction.multiplyScalar(clampedProgress))

        // Initialize animated position if this is the start of movement
        if (movementProgress === 0) {
          animatedPosition.current.copy(originalPosition.current)
        }
      } else {
        // Use original position when not moving
        position.current.copy(asteroid.realPosition)
        animatedPosition.current.copy(asteroid.realPosition)
        targetPosition.current.copy(asteroid.realPosition)
      }
    } else {
      throw new Error(`Asteroid ${asteroid.name} missing real orbital data`)
    }

    // Set initial rotation (deterministic)
    const seed = asteroid.id ? asteroid.id.split("").reduce((a, b) => a + b.charCodeAt(0), 0) : 1000
    const seededRandom = (seed) => (Math.sin(seed) * 10000) % 1
    rotation.current.set(
      seededRandom(seed + 5) * Math.PI,
      seededRandom(seed + 6) * Math.PI,
      seededRandom(seed + 7) * Math.PI,
    )
  }, [
    asteroid.id,
    asteroid.orbit,
    asteroid.orbitProgress,
    asteroid.hasRealOrbitalData,
    asteroid.realPosition,
    isMoving,
    movementProgress,
  ])

  useFrame((state, delta) => {
    // Only rotate when not moving
    if (!isMoving) {
      rotation.current.x += 0.002
      rotation.current.y += 0.003
    }

    if (isMoving && movementProgress !== undefined) {
      // Smooth interpolation towards target position
      const lerpFactor = Math.min(delta * 8, 1) // Adjust speed of interpolation
      animatedPosition.current.lerp(targetPosition.current, lerpFactor)
      position.current.copy(animatedPosition.current)
    }
  })

  return (
    <group ref={groupRef}>
      <AsteroidModel
        position={position.current}
        rotation={rotation.current}
        isSelected={isSelected}
        onClick={() => onSelect && onSelect(asteroid)}
      />
      <AsteroidLabel
        position={position.current}
        name={asteroid.name}
        isSelected={isSelected}
      />
    </group>
  )
}

function OrbitTrail({ orbit, asteroid, isHovered = false, isSelected = false }) {
  // Use the same deterministic logic as asteroid positioning
  const orbitData = useMemo(() => {
    // Create the same deterministic random seed based on asteroid ID
    const seed = asteroid.id ? asteroid.id.split("").reduce((a, b) => a + b.charCodeAt(0), 0) : 1000
    const seededRandom = (seed) => (Math.sin(seed) * 10000) % 1

    const a = (asteroid.orbit?.semiMajorAxis || 1.5) * 100 // Use real semi-major axis, convert to scene units
    const e = orbit.eccentricity || 0.1
    const i = ((orbit.inclination || 0) * Math.PI) / 180

    const points = []
    for (let angle = 0; angle < Math.PI * 2; angle += 0.05) {
      const r = (a * (1 - e * e)) / (1 + e * Math.cos(angle))
      const x = r * Math.cos(angle)
      const y = r * Math.sin(angle) * Math.cos(i)
      const z = r * Math.sin(angle) * Math.sin(i)
      points.push(new THREE.Vector3(x, y, z))
    }

    return { points, a, e, i }
  }, [orbit, asteroid.id])

  const geometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(orbitData.points)
  }, [orbitData.points])

  const lineRef = useRef()

  useEffect(() => {
    if (lineRef.current) {
      // compute distances for dashed material
      lineRef.current.computeLineDistances()
    }
  }, [geometry])

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
  )
}

function InteractiveOrbit({ asteroid, isSelected, onOrbitClick }) {
  // Use the same deterministic logic as asteroid positioning
  const orbitData = useMemo(() => {
    // Create the same deterministic random seed based on asteroid ID
    const seed = asteroid.id ? asteroid.id.split("").reduce((a, b) => a + b.charCodeAt(0), 0) : 1000
    const seededRandom = (seed) => (Math.sin(seed) * 10000) % 1

    const a = (asteroid.orbit?.semiMajorAxis || 1.5) * 100 // Use real semi-major axis, convert to scene units
    const e = asteroid.orbit?.eccentricity || 0.1
    const i = ((asteroid.orbit?.inclination || 0) * Math.PI) / 180

    const points = []
    for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
      const r = (a * (1 - e * e)) / (1 + e * Math.cos(angle))
      const x = r * Math.cos(angle)
      const y = r * Math.sin(angle) * Math.cos(i)
      const z = r * Math.sin(angle) * Math.sin(i)
      points.push(new THREE.Vector3(x, y, z))
    }

    return { points, a, e, i }
  }, [asteroid])

  const geometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(orbitData.points)
  }, [orbitData.points])

  return (
    <group>
      {/* Invisible thick line for easier clicking */}
      <line geometry={geometry} userData={{ isOrbitLine: true, asteroidId: asteroid.id }}>
        <lineBasicMaterial color="#ffffff" transparent opacity={0} linewidth={10} />
      </line>
      {/* Visible orbit trail */}
      <OrbitTrail orbit={asteroid.orbit} asteroid={asteroid} isSelected={isSelected} />
    </group>
  )
}

export default function AsteroidRenderer({
  asteroids,
  selectedAsteroid,
  onAsteroidSelect,
  isFocusedMode = false,
  movingAsteroid,
  movementProgress,
  targetPosition,
}) {
  // Early return after hooks
  if (!asteroids || asteroids.length === 0) {
    return null
  }

  // When an asteroid is moving, only show that asteroid
  const asteroidsToShow = movingAsteroid 
    ? asteroids.filter((asteroid) => asteroid.id === movingAsteroid.id)
    : (isFocusedMode && selectedAsteroid 
        ? asteroids.filter((asteroid) => asteroid.id === selectedAsteroid.id) 
        : asteroids)

  return (
    <group>
      {asteroidsToShow.map((asteroid) => {
        // If this is the moving asteroid and we have a target position, reposition it
        let asteroidToRender = asteroid
        if (movingAsteroid && movingAsteroid.id === asteroid.id && targetPosition) {
          // Create a new asteroid object with repositioned coordinates
          const originalDistance = asteroid.realPosition ? asteroid.realPosition.length() : 20
          const targetDirection = targetPosition.point ? targetPosition.point.clone() : latLngTo3D(targetPosition.lat, targetPosition.lng, 1)
          const repositionedPosition = targetDirection.normalize().multiplyScalar(originalDistance)
          
          asteroidToRender = {
            ...asteroid,
            realPosition: repositionedPosition
          }
        }

        return (
          <group key={asteroid.id}>
            <Asteroid
              asteroid={asteroidToRender}
              isSelected={selectedAsteroid && selectedAsteroid.id === asteroid.id}
              onSelect={onAsteroidSelect}
              isMoving={movingAsteroid && movingAsteroid.id === asteroid.id}
              movementProgress={movingAsteroid && movingAsteroid.id === asteroid.id ? movementProgress : undefined}
            />
          </group>
        )
      })}
    </group>
  )
}

// Preload the GLB model for better performance
useGLTF.preload("/Itokawa_1_1.glb")
