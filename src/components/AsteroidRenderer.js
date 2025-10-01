"use client"

import { useRef, useMemo, useState, useEffect } from "react"
import { useFrame, useLoader } from "@react-three/fiber"
import { useGLTF, useTexture, Text } from "@react-three/drei"
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader"
import * as THREE from "three"
import { latLngTo3D } from "../data/cities"

function AsteroidLabel({ position, name, isSelected, onClick, isHovered }) {
  const textRef = useRef()
  
  useFrame(({ camera }) => {
    if (textRef.current) {
      // Make the text always face the camera
      textRef.current.lookAt(camera.position)
    }
  })

  const handleClick = (event) => {
    event.stopPropagation() // Prevent event bubbling to the asteroid
    if (onClick) {
      onClick()
    }
  }

  const handlePointerOver = (event) => {
    event.stopPropagation()
  }

  const handlePointerOut = (event) => {
    event.stopPropagation()
  }

  return (
    <Text
      ref={textRef}
      position={[position.x + 0.15, position.y + 0.15, position.z]}
      fontSize={isHovered ? 0.15 : 0.12} // Larger when hovered
      color={isHovered ? "#00e5ff" : "#ffffff"} // Cyan when hovered
      anchorX="left"
      anchorY="middle"
      material-transparent
      material-opacity={isSelected ? 1.0 : (isHovered ? 1.0 : 0.7)} // Full opacity when hovered
      outlineWidth={isHovered ? 0.03 : 0.02} // Thicker outline when hovered
      outlineColor="#000000"
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      style={{ cursor: 'pointer' }}
    >
      {name}
    </Text>
  )
}

function AsteroidModel({ position, rotation, isSelected, isHovered, onClick, asteroidId }) {
  const modelRef = useRef()
  const [modelLoaded, setModelLoaded] = useState(false)

  // Select 3D model deterministically based on asteroid ID
  const selectedModel = useMemo(() => {
    const models = [
      { path: "/3D_models/Itokawa_1_1.glb", type: "glb" },
      { path: "/3D_models/Apophis Model 1.obj", type: "obj" }
    ]
    const seed = asteroidId ? asteroidId.split("").reduce((a, b) => a + b.charCodeAt(0), 0) : 1000
    const modelIndex = Math.abs(seed + 1) % models.length // +1 to get different selection than texture
    return models[modelIndex]
  }, [asteroidId])

  // Load the 3D asteroid models (hooks must be called unconditionally)
  const gltf1 = useGLTF("/3D_models/Itokawa_1_1.glb")
  const objModel = useLoader(OBJLoader, "/3D_models/Apophis Model 1.obj")
  
  // Load all available asteroid textures
  const textures = useTexture([
    "/textures/Asteroids/photo-stone-texture-pattern.jpg",
    "/textures/Asteroids/stone-texture.jpg"
  ])
  
  // Also try loading the stone texture directly as a fallback
  const stoneTexture = useTexture("/textures/Asteroids/photo-stone-texture-pattern.jpg")
  
  // Debug texture loading
  console.log("Textures loaded:", textures)
  if (textures && textures.length > 0) {
    textures.forEach((texture, index) => {
      console.log(`Texture ${index}:`, {
        loaded: texture?.image ? "YES" : "NO",
        src: texture?.image?.src,
        width: texture?.image?.width,
        height: texture?.image?.height
      })
    })
  }

  // Select texture deterministically based on asteroid ID
  const selectedTexture = useMemo(() => {
    // Try to use the direct stone texture first
    if (stoneTexture) {
      console.log(`Using direct stone texture for asteroid ${asteroidId}:`, {
        texture: stoneTexture,
        hasImage: !!stoneTexture?.image,
        imageSrc: stoneTexture?.image?.src,
        imageLoaded: stoneTexture?.image?.complete
      })
      return stoneTexture
    }
    
    if (!textures || textures.length === 0) {
      console.log("No textures available for asteroid:", asteroidId)
      return null
    }
    
    // Create deterministic selection based on asteroid ID
    const seed = asteroidId ? asteroidId.split("").reduce((a, b) => a + b.charCodeAt(0), 0) : 1000
    const textureIndex = Math.abs(seed) % textures.length
    const selected = textures[textureIndex]
    
    console.log(`Selected texture ${textureIndex} for asteroid ${asteroidId}:`, {
      texture: selected,
      hasImage: !!selected?.image,
      imageSrc: selected?.image?.src,
      imageLoaded: selected?.image?.complete
    })
    
    return selected
  }, [textures, stoneTexture, asteroidId])

  // Clone the scene and apply textures to allow multiple instances
  const clonedScene = useMemo(() => {
    let sourceModel = null
    
    // Get the appropriate model based on selection
    if (selectedModel.path === "/3D_models/Itokawa_1_1.glb" && gltf1?.scene) {
      sourceModel = gltf1.scene
      console.log("Using Itokawa GLB model for asteroid:", asteroidId)
    } else if (selectedModel.path === "/3D_models/Apophis Model 1.obj" && objModel) {
      sourceModel = objModel
      console.log("Using Apophis OBJ model for asteroid:", asteroidId)
    }

    if (sourceModel && selectedTexture) {
      const cloned = sourceModel.clone()
      
      // Scale the model to visible size for asteroids around Earth
      // Itokawa GLB model is much larger, so scale it down more
      let scaleFactor
      if (selectedModel.path === "/3D_models/Itokawa_1_1.glb") {
        scaleFactor = 0.0002 // Much smaller for Itokawa model
      } else if (selectedModel.type === "obj") {
        scaleFactor = 0.05 // Keep OBJ models at current size
      } else {
        scaleFactor = 0.01 // Default for other GLB models
      }
      cloned.scale.setScalar(scaleFactor)

      // Apply texture to all meshes in the model (skip textures for Itokawa model)
      cloned.traverse((child) => {
        if (child.isMesh) {
          // Create material if it doesn't exist (OBJ models might not have materials)
          if (!child.material) {
            child.material = new THREE.MeshPhongMaterial()
          } else {
            // Clone the material to avoid affecting other instances
            child.material = child.material.clone()
          }

          // Only apply textures to non-Itokawa models
          if (selectedModel.path !== "/3D_models/Itokawa_1_1.glb") {
            console.log("Applying texture to mesh:", child.name || "unnamed", "selectedTexture:", selectedTexture)
            
            if (!selectedTexture) {
              console.warn("No texture available for mesh:", child.name || "unnamed")
              return
            }
            
            // Use texture directly (cloning might be causing issues)
            const texture = selectedTexture
            console.log("Using texture directly:", {
              texture: texture,
              hasImage: !!texture?.image,
              imageSrc: texture?.image?.src,
              imageComplete: texture?.image?.complete
            })
            
            // Configure texture properties
            texture.wrapS = THREE.RepeatWrapping
            texture.wrapT = THREE.RepeatWrapping
            texture.repeat.set(1, 1) // Use original texture size for OBJ models
            texture.flipY = false // OBJ models often need this
            texture.anisotropy = 4 // Improve texture quality
            texture.minFilter = THREE.LinearFilter
            texture.magFilter = THREE.LinearFilter

            // For OBJ models, create a new material with proper settings
            if (selectedModel.type === "obj") {
              console.log("Creating material with texture for OBJ model:", {
                meshName: child.name || "unnamed",
                texture: texture,
                textureImage: texture?.image,
                textureSrc: texture?.image?.src
              })
              
              child.material = new THREE.MeshPhongMaterial({
                map: texture,
                shininess: 30,
                color: new THREE.Color(0xffffff), // White base color to let texture show through
                transparent: false,
                side: THREE.DoubleSide, // Ensure both sides are rendered
                wireframe: false // Make sure wireframe is off
              })
              
              // Ensure the material updates properly
              child.material.needsUpdate = true
              
              // Make sure the mesh is visible
              child.visible = true
              
              // Ensure geometry has UV coordinates for texture mapping
              if (child.geometry && !child.geometry.attributes.uv) {
                console.warn("OBJ model mesh missing UV coordinates, generating basic UVs:", child.name || "unnamed")
                child.geometry.computeBoundingBox()
                const bbox = child.geometry.boundingBox
                const size = new THREE.Vector3()
                bbox.getSize(size)
                
                // Generate basic UV coordinates
                const uvAttribute = child.geometry.getAttribute('position')
                const uvArray = new Float32Array(uvAttribute.count * 2)
                
                for (let i = 0; i < uvAttribute.count; i++) {
                  const x = uvAttribute.getX(i)
                  const y = uvAttribute.getY(i)
                  const z = uvAttribute.getZ(i)
                  
                  // Simple cylindrical UV mapping
                  uvArray[i * 2] = (x + size.x / 2) / size.x
                  uvArray[i * 2 + 1] = (z + size.z / 2) / size.z
                }
                
                child.geometry.setAttribute('uv', new THREE.BufferAttribute(uvArray, 2))
              }
              
              console.log("Applied texture to OBJ model mesh:", child.name || "unnamed", "texture:", texture.image?.src)
              console.log("Final material settings:", {
                hasTexture: !!child.material.map,
                textureImage: child.material.map?.image?.src,
                textureWidth: child.material.map?.image?.width,
                textureHeight: child.material.map?.image?.height,
                color: child.material.color.getHexString(),
                shininess: child.material.shininess,
                wireframe: child.material.wireframe,
                side: child.material.side,
                hasUVs: !!child.geometry?.attributes?.uv,
                uvCount: child.geometry?.attributes?.uv?.count
              })
            } else {
              // For other GLB models, apply texture normally
              child.material.map = texture
              child.material.needsUpdate = true
              
              // Make asteroids consistently colored with texture
              if (child.material.color) {
                child.material.color.multiplyScalar(1.5) // Slight brightness boost
              }

              // Add some color variation based on asteroid ID
              const colorVariation = new THREE.Color().setHSL(
                (asteroidId ? asteroidId.split("").reduce((a, b) => a + b.charCodeAt(0), 0) : 1000) % 360 / 360,
                0.2, // Low saturation
                1.0  // Full lightness to let texture show through
              )
              child.material.color.multiply(colorVariation)
            }
          } else {
            // For Itokawa model, use original material without texture
            console.log("Using original Itokawa material without texture for mesh:", child.name || "unnamed")
          }

          // Add subtle emissive glow for all asteroids (only if not already set for OBJ)
          if (selectedModel.type !== "obj") {
            child.material.emissive = new THREE.Color(0x332211)
            child.material.emissiveIntensity = 0.1
          }

          // Consistent shininess for all asteroids (only if not already set for OBJ)
          if (selectedModel.type !== "obj" && child.material.shininess !== undefined) {
            child.material.shininess = 100
          }
        }
      })

      setModelLoaded(true)
      return cloned
    }
    return null
  }, [gltf1?.scene, objModel, selectedTexture, asteroidId, selectedModel.path])

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
          <sphereGeometry args={[1, 8, 6]} />
          <meshPhongMaterial color="#ccaa77" shininess={50} emissive="#221100" />
        </mesh>
      )}
    </group>
  )
}

function Asteroid({ asteroid, isSelected, onSelect, isMoving, movementProgress, targetPosition }) {
  const groupRef = useRef()
  const position = useRef(new THREE.Vector3())
  const rotation = useRef(new THREE.Euler())
  const originalPosition = useRef(new THREE.Vector3())
  const animatedPosition = useRef(new THREE.Vector3())
  const targetPositionRef = useRef(new THREE.Vector3())
  const [isHovered, setIsHovered] = useState(false)

  useMemo(() => {
    if (asteroid.hasRealOrbitalData && asteroid.realPosition) {
      // Store original position (this will be the repositioned position if moving)
      originalPosition.current.copy(asteroid.realPosition)

      if (isMoving && movementProgress !== undefined) {
        // Calculate target position - use the target position passed from parent
        let targetPosition3D
        
        if (targetPosition) {
          // Target specific position on Earth surface
          if (targetPosition.point) {
            targetPosition3D = targetPosition.point.clone()
          } else {
            // Fallback to lat/lng conversion
            targetPosition3D = latLngTo3D(targetPosition.lat, targetPosition.lng, 5.1)
          }
        } else {
          // Fallback to Earth center
          targetPosition3D = new THREE.Vector3(0, 0, 0)
        }
        
        const direction = targetPosition3D.clone().sub(originalPosition.current)
        const distance = direction.length()

        // Stop when very close to target (within 0.1 units for surface targets, 5.1 for Earth center)
        const minDistance = targetPosition ? 0.1 : 5.1
        const maxProgress = Math.max(0, (distance - minDistance) / distance)
        const clampedProgress = Math.min(movementProgress, maxProgress)

        targetPositionRef.current.copy(originalPosition.current)
        targetPositionRef.current.add(direction.multiplyScalar(clampedProgress))

        // Initialize animated position if this is the start of movement
        if (movementProgress === 0) {
          animatedPosition.current.copy(originalPosition.current)
        }
      } else {
        // Use original position when not moving
        position.current.copy(asteroid.realPosition)
        animatedPosition.current.copy(asteroid.realPosition)
        targetPositionRef.current.copy(asteroid.realPosition)
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
    targetPosition,
  ])

  useFrame((state, delta) => {
    // Only rotate when not moving
    if (!isMoving) {
      rotation.current.x += 0.002
      rotation.current.y += 0.003
    }

    if (isMoving && movementProgress !== undefined) {
      // Smoother interpolation towards target position with improved easing
      const lerpFactor = Math.min(delta * 12, 1) // Increased speed for faster movement
      // Use smoothstep for more natural movement
      const smoothLerpFactor = lerpFactor * lerpFactor * (3 - 2 * lerpFactor)
      animatedPosition.current.lerp(targetPositionRef.current, smoothLerpFactor)
      position.current.copy(animatedPosition.current)
    }
  })

  const handlePointerOver = () => {
    setIsHovered(true)
  }

  const handlePointerOut = () => {
    setIsHovered(false)
  }

  return (
    <group 
      ref={groupRef}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <AsteroidModel
        position={position.current}
        rotation={rotation.current}
        isSelected={isSelected}
        isHovered={isHovered}
        onClick={() => onSelect && onSelect(asteroid)}
        asteroidId={asteroid.id}
      />
      <AsteroidLabel
        position={position.current}
        name={asteroid.name}
        isSelected={isSelected}
        isHovered={isHovered}
        onClick={() => onSelect && onSelect(asteroid)}
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
  // Preload models and textures for better performance
  useGLTF.preload("/3D_models/Itokawa_1_1.glb")
  useTexture.preload("/textures/Asteroids/photo-stone-texture-pattern.jpg")
  useTexture.preload("/textures/Asteroids/stone-texture.jpg")

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
        if (movingAsteroid && movingAsteroid.id === asteroid.id && movingAsteroid.targetPosition) {
          // Create a new asteroid object with repositioned coordinates
          const originalDistance = asteroid.realPosition ? asteroid.realPosition.length() : 20
          const targetDirection = movingAsteroid.targetPosition.point ? 
            movingAsteroid.targetPosition.point.clone() : 
            latLngTo3D(movingAsteroid.targetPosition.lat, movingAsteroid.targetPosition.lng, 5.1)
          const repositionedPosition = targetDirection.clone().normalize().multiplyScalar(originalDistance)
          
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
              targetPosition={movingAsteroid && movingAsteroid.id === asteroid.id ? movingAsteroid.targetPosition : undefined}
            />
          </group>
        )
      })}
    </group>
  )
}

// Preload the GLB models and asteroid textures for better performance
// Note: These preload calls are moved inside the component to avoid hooks rules violations
