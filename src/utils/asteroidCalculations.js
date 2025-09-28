// Asteroid impact calculations and utilities

// Calculate asteroid mass from diameter and density
export function calculateMass(diameter, density = 3000) {
  // density in kg/m³ (typical asteroid density)
  const radius = (diameter * 1000) / 2 // convert km to m
  const volume = (4/3) * Math.PI * Math.pow(radius, 3)
  return volume * density // kg
}

// Calculate kinetic energy from mass and velocity
export function calculateKineticEnergy(mass, velocity) {
  // velocity in m/s, mass in kg
  return 0.5 * mass * Math.pow(velocity, 2) // Joules
}

// Convert kinetic energy to TNT equivalent
export function joulesToTNT(joules) {
  const TNT_ENERGY = 4.184e9 // Joules per ton of TNT
  return joules / TNT_ENERGY // tons of TNT
}

// Calculate crater diameter based on impact energy
export function calculateCraterDiameter(energyTNT, targetDensity = 2700) {
  // Using the scaling law: D = 1.25 * (E/ρ)^(1/3.4)
  // E in Joules, ρ in kg/m³, D in meters
  const energyJoules = energyTNT * 4.184e9
  const craterDiameter = 1.25 * Math.pow(energyJoules / targetDensity, 1/3.4)
  return craterDiameter / 1000 // convert to km
}

// Calculate damage radius based on impact energy
export function calculateDamageRadius(energyTNT) {
  // Empirical formula for airburst damage radius
  const radius = 0.1 * Math.pow(energyTNT, 0.33) // km
  return Math.max(radius, 1) // minimum 1km radius
}

// Calculate affected population within damage radius
export function calculateAffectedPopulation(city, damageRadius) {
  // Simple approximation: population density * area
  const populationDensity = city.population / city.area // people per km²
  const affectedArea = Math.PI * Math.pow(damageRadius, 2)
  return Math.min(Math.round(populationDensity * affectedArea), city.population)
}

// Get asteroid classification based on diameter
export function getAsteroidClassification(diameter) {
  if (diameter < 0.1) return { class: 'Meteoroid', description: 'Small space rock' }
  if (diameter < 1) return { class: 'Small Asteroid', description: 'Minor impact potential' }
  if (diameter < 10) return { class: 'Medium Asteroid', description: 'Regional impact' }
  if (diameter < 100) return { class: 'Large Asteroid', description: 'Continental impact' }
  return { class: 'Planet Killer', description: 'Global catastrophe' }
}

// Get impact severity based on energy
export function getImpactSeverity(energyTNT) {
  if (energyTNT < 0.001) return { level: 'Minor', color: '#00ff00', description: 'Local damage only' }
  if (energyTNT < 0.1) return { level: 'Moderate', color: '#ffff00', description: 'City-wide damage' }
  if (energyTNT < 10) return { level: 'Severe', color: '#ff8800', description: 'Regional devastation' }
  if (energyTNT < 1000) return { level: 'Catastrophic', color: '#ff0000', description: 'Continental disaster' }
  return { level: 'Extinction', color: '#800080', description: 'Global extinction event' }
}

// Calculate time to impact based on distance and velocity
export function calculateTimeToImpact(distance, velocity) {
  // distance in km, velocity in km/s
  return distance / velocity // seconds
}

// Format time duration for display
export function formatTimeDuration(seconds) {
  if (seconds < 60) return `${seconds.toFixed(1)}s`
  if (seconds < 3600) return `${(seconds / 60).toFixed(1)}m`
  if (seconds < 86400) return `${(seconds / 3600).toFixed(1)}h`
  return `${(seconds / 86400).toFixed(1)}d`
}

// Calculate trajectory from asteroid to target city
export function calculateTrajectory(asteroidPosition, targetPosition) {
  const direction = targetPosition.clone().sub(asteroidPosition).normalize()
  const distance = asteroidPosition.distanceTo(targetPosition)
  
  return {
    direction,
    distance,
    // Generate points along the trajectory
    points: generateTrajectoryPoints(asteroidPosition, targetPosition, 20)
  }
}

// Generate points along trajectory for visualization
function generateTrajectoryPoints(start, end, numPoints) {
  const points = []
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints
    const point = start.clone().lerp(end, t)
    points.push(point)
  }
  return points
}

// Calculate impact angle (angle between velocity vector and surface normal)
export function calculateImpactAngle(velocity, surfaceNormal) {
  const cosAngle = Math.abs(velocity.dot(surfaceNormal) / (velocity.length() * surfaceNormal.length()))
  return Math.acos(cosAngle) * (180 / Math.PI) // degrees
}

// Enhanced asteroid data with calculated properties
export function enhanceAsteroidData(asteroid) {
  const diameter = asteroid.diameter || 0.5 // km
  const velocity = asteroid.velocity || 25000 // m/s
  const mass = calculateMass(diameter)
  const kineticEnergy = calculateKineticEnergy(mass, velocity)
  const energyTNT = joulesToTNT(kineticEnergy)
  const craterDiameter = calculateCraterDiameter(kineticEnergy)
  const damageRadius = calculateDamageRadius(energyTNT)
  const classification = getAsteroidClassification(diameter)
  const severity = getImpactSeverity(energyTNT)
  
  return {
    ...asteroid,
    mass,
    kineticEnergy,
    energyTNT,
    craterDiameter,
    damageRadius,
    classification,
    severity,
    // Additional properties
    density: 3000, // kg/m³
    composition: getAsteroidComposition(diameter),
    albedo: 0.1 + Math.random() * 0.3, // surface reflectivity
    rotationPeriod: 2 + Math.random() * 20, // hours
    temperature: 200 + Math.random() * 100 // Kelvin
  }
}

// Determine asteroid composition based on size and other factors
function getAsteroidComposition(diameter) {
  if (diameter < 0.1) return 'Stony'
  if (diameter < 1) return Math.random() > 0.5 ? 'Stony' : 'Iron'
  if (diameter < 10) return Math.random() > 0.3 ? 'Stony-Iron' : 'Iron'
  return 'Carbonaceous'
}

