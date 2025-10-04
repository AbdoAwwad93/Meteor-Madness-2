"use client"

import { useRef, useMemo, useState } from "react"
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

function AsteroidModel({ position, rotation, isSelected, isHovered, onClick, asteroidId, asteroidIndex }) {
  const modelRef = useRef()

  // Select 3D model to ensure each model appears at least once
  const selectedModel = useMemo(() => {
    const models = [
      { path: "/3D_models/Itokawa_1_1.glb", type: "glb" },
      { path: "/3D_models/Apophis Model 1.obj", type: "obj" },
      { path: "/3D_models/Bennu_v20_200k.obj", type: "obj" },
      { path: "/3D_models/Asteroid_2d.glb", type: "glb" },
      { path: "/3D_models/Asteroid_1e.glb", type: "glb" }
    ]
    
    // First 5 asteroids get one of each model, then cycle through them
    const modelIndex = (asteroidIndex || 0) % models.length
    return models[modelIndex]
  }, [asteroidIndex])

  // Load the 3D asteroid models (hooks must be called unconditionally)
  const gltf1 = useGLTF("/3D_models/Itokawa_1_1.glb")
  const gltf2 = useGLTF("/3D_models/Asteroid_2d.glb")
  const gltf3 = useGLTF("/3D_models/Asteroid_1e.glb")
  const objModel1 = useLoader(OBJLoader, "/3D_models/Apophis Model 1.obj")
  const objModel2 = useLoader(OBJLoader, "/3D_models/Bennu_v20_200k.obj")
  
  // Load all available asteroid textures
  const textures = useTexture([
    "/textures/Asteroids/photo-stone-texture-pattern.jpg",
    "/textures/Asteroids/stone-texture.jpg"
  ])
  
  // Also try loading the stone texture directly as a fallback
  const stoneTexture = useTexture("/textures/Asteroids/photo-stone-texture-pattern.jpg")
  
  // Texture loading for asteroid

  // Select texture deterministically based on asteroid ID
  const selectedTexture = useMemo(() => {
    // Try to use the direct stone texture first
    if (stoneTexture) {
      return stoneTexture
    }
    
    if (!textures || textures.length === 0) {
      return null
    }
    
    // Create deterministic selection based on asteroid ID
    const seed = asteroidId ? asteroidId.split("").reduce((a, b) => a + b.charCodeAt(0), 0) : 1000
    const textureIndex = Math.abs(seed) % textures.length
    const selected = textures[textureIndex]
    
    
    return selected
  }, [textures, stoneTexture, asteroidId])

  // Clone the scene and apply textures to allow multiple instances
  const clonedScene = useMemo(() => {
    let sourceModel = null
    
    // Get the appropriate model based on selection
    if (selectedModel.path === "/3D_models/Itokawa_1_1.glb" && gltf1?.scene) {
      sourceModel = gltf1.scene
    } else if (selectedModel.path === "/3D_models/Asteroid_2d.glb" && gltf2?.scene) {
      sourceModel = gltf2.scene
    } else if (selectedModel.path === "/3D_models/Asteroid_1e.glb" && gltf3?.scene) {
      sourceModel = gltf3.scene
    } else if (selectedModel.path === "/3D_models/Apophis Model 1.obj" && objModel1) {
      sourceModel = objModel1
    } else if (selectedModel.path === "/3D_models/Bennu_v20_200k.obj" && objModel2) {
      sourceModel = objModel2
    }

    if (sourceModel && selectedTexture) {
      const cloned = sourceModel.clone()
      
      // Scale the model to visible size for asteroids around Earth
      let scaleFactor
      if (selectedModel.path === "/3D_models/Itokawa_1_1.glb") {
        scaleFactor = 0.0002 // Much smaller for Itokawa model
      } else if (selectedModel.path === "/3D_models/Bennu_v20_200k.obj") {
        scaleFactor = 0.008 // Bennu model needs different scaling
      } else if (selectedModel.path === "/3D_models/Apophis Model 1.obj") {
        scaleFactor = 0.05 // Keep Apophis model at current size
      } else if (selectedModel.type === "obj") {
        scaleFactor = 0.05 // Default for other OBJ models
      } else if (selectedModel.type === "glb") {
        scaleFactor = 0.01 // Default for GLB models
      } else {
        scaleFactor = 0.01 // Fallback
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

          // Only apply textures to non-Itokawa and non-Bennu models
          if (selectedModel.path !== "/3D_models/Itokawa_1_1.glb" && selectedModel.path !== "/3D_models/Bennu_v20_200k.obj") {
            
            if (!selectedTexture) {
              console.warn("No texture available for mesh:", child.name || "unnamed")
              return
            }
            
            // Use texture directly (cloning might be causing issues)
            const texture = selectedTexture
            
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
                  const z = uvAttribute.getZ(i)
                  
                  // Simple cylindrical UV mapping
                  uvArray[i * 2] = (x + size.x / 2) / size.x
                  uvArray[i * 2 + 1] = (z + size.z / 2) / size.z
                }
                
                child.geometry.setAttribute('uv', new THREE.BufferAttribute(uvArray, 2))
              }
              
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
          } else if (selectedModel.path === "/3D_models/Bennu_v20_200k.obj") {
            // Special handling for Bennu model - no texture, use natural asteroid colors
            child.material = new THREE.MeshPhongMaterial({
              color: new THREE.Color(0x8B7355), // Natural asteroid brown color
              shininess: 20,
              transparent: false,
              side: THREE.DoubleSide,
              wireframe: false,
              emissive: new THREE.Color(0x221100), // Subtle warm glow
              emissiveIntensity: 0.05
            })
          } else {
            // For Itokawa model, use original material without texture
          }

          // Add subtle emissive glow for all asteroids (only if not already set for OBJ or Bennu)
          if (selectedModel.type !== "obj" && selectedModel.path !== "/3D_models/Bennu_v20_200k.obj") {
            child.material.emissive = new THREE.Color(0x332211)
            child.material.emissiveIntensity = 0.1
          }

          // Consistent shininess for all asteroids (only if not already set for OBJ or Bennu)
          if (selectedModel.type !== "obj" && selectedModel.path !== "/3D_models/Bennu_v20_200k.obj" && child.material.shininess !== undefined) {
            child.material.shininess = 100
          }
        }
      })

      return cloned
    }
    return null
  }, [gltf1?.scene, gltf2?.scene, gltf3?.scene, objModel1, objModel2, selectedTexture, asteroidId, selectedModel.path, selectedModel.type])

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

function Asteroid({ asteroid, isSelected, onSelect, isMoving, movementProgress, targetPosition, asteroidIndex }) {
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
    asteroid.name,
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
        asteroidIndex={asteroidIndex}
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
  useGLTF.preload("/3D_models/Asteroid_2d.glb")
  useGLTF.preload("/3D_models/Asteroid_1e.glb")
  useTexture.preload("/textures/Asteroids/photo-stone-texture-pattern.jpg")
  useTexture.preload("/textures/Asteroids/stone-texture.jpg")

  // Create asteroid index mapping to ensure each model appears at least once
  const asteroidIndexMap = useMemo(() => {
    const map = new Map()
    asteroids.forEach((asteroid, index) => {
      map.set(asteroid.id, index)
    })
    return map
  }, [asteroids])

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
              asteroidIndex={asteroidIndexMap.get(asteroid.id)}
            />
          </group>
        )
      })}
    </group>
  )
}

// Preload the GLB models and asteroid textures for better performance
// Note: These preload calls are moved inside the component to avoid hooks rules violations
