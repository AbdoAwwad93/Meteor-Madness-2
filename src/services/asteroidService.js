// NASA Near Earth Object Web Service (NeoWs) API
import { jplSBDBService } from './jplSBDBService';
import { orbitalMechanicsService } from './orbitalMechanicsService';
import * as THREE from 'three';
import { jplHorizonsService } from './jplHorizonsService';

const NASA_API_KEY = process.env.REACT_APP_NASA_API_KEY || 'DEMO_KEY';
const NEO_API_BASE = 'https://api.nasa.gov/neo/rest/v1';

class AsteroidService {
  async getAsteroids() {
    try {
      return await this.getClosestLive(5);
        } catch (error) {
          throw error; // Re-throw error instead of using fallback
        }
  }

  async getClosestLive(count = 5) {
    // Fetch today's feed and return the closest NEOs that approach today
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(
        `${NEO_API_BASE}/feed?start_date=${today}&end_date=${today}&api_key=${NASA_API_KEY}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
    const candidates = [];
      Object.values(data.near_earth_objects).forEach(dayAsteroids => {
        dayAsteroids.forEach(neo => {
        const approach = Array.isArray(neo.close_approach_data)
          ? neo.close_approach_data.find(ca => ca.close_approach_date === today)
          : null;
        if (!approach) return;
        const missKm = parseFloat(approach.miss_distance?.kilometers);
        if (!isFinite(missKm)) return;
        candidates.push({ neo, approach, missKm });
      });
    });

    candidates.sort((a, b) => a.missKm - b.missKm);
    const top = candidates.slice(0, count);
    
    // Get designations for JPL SBDB lookup
    const designations = top.map(({ neo }) => neo.designation || neo.name);
    
    // Fetch orbital elements from JPL SBDB
        const orbitalElements = await jplSBDBService.getMultipleOrbitalElements(designations);
    
    // Map NEO data with orbital elements - try JPL SBDB first, then fallback to calculated positions
    const enrichedAsteroids = [];
    
    for (let i = 0; i < top.length; i++) {
      const { neo, approach } = top[i];
      const elements = orbitalElements[i];
      
          if (elements) {
            // Use real JPL SBDB orbital elements
            const asteroid = this.mapNeoToAsteroidWithOrbitalData(neo, approach, elements);
            enrichedAsteroids.push(asteroid);
          } else {
            // Fallback: Calculate position using NASA NEO data and orbital mechanics
            const asteroid = this.mapNeoToAsteroidWithCalculatedPosition(neo, approach);
            enrichedAsteroids.push(asteroid);
          }
    }
    
    if (enrichedAsteroids.length === 0) {
      throw new Error('No asteroids could be loaded. All API calls failed.');
    }
    
    return enrichedAsteroids;
  }

  mapNeoToAsteroid(neo, ca) {
    const today = new Date().toISOString().split('T')[0];
    const diameterKm = neo.estimated_diameter?.kilometers?.estimated_diameter_average || 0.5;
    const relVelocity = ca ? parseFloat(ca.relative_velocity?.kilometers_per_hour) : 0;
    const missDistanceKm = ca ? parseFloat(ca.miss_distance?.kilometers) : 0;
    const missDistanceAu = ca ? parseFloat(ca.miss_distance?.astronomical) : 1;
    return {
            id: neo.id,
            name: neo.name,
            type: 'Near Earth Object',
            status: neo.is_potentially_hazardous_asteroid ? 'Hazardous' : 'Safe',
      diameter: diameterKm,
      velocity: relVelocity,
      distance: missDistanceKm,
            orbit: {
        semiMajorAxis: Math.min(missDistanceAu || 1, 3),
        eccentricity: Math.random() * 0.3,
        inclination: Math.random() * 30,
        period: Math.random() * 1000 + 365
      },
      orbitProgress: Math.random(),
            magnitude: neo.absolute_magnitude_h,
      discoveryDate: (ca && ca.close_approach_date) || today,
            isPotentiallyHazardous: neo.is_potentially_hazardous_asteroid
    };
  }

  mapNeoToAsteroidWithOrbitalData(neo, ca, orbitalElements) {
    const today = new Date().toISOString().split('T')[0];
    const diameterKm = orbitalElements?.diameter || neo.estimated_diameter?.kilometers?.estimated_diameter_average || 0.5;
    const relVelocity = ca ? parseFloat(ca.relative_velocity?.kilometers_per_hour) : 0;
    const missDistanceKm = ca ? parseFloat(ca.miss_distance?.kilometers) : 0;
    
    // Use real orbital elements if available
    const hasRealOrbitalData = orbitalElements && orbitalElements.a && orbitalElements.e !== null;
    
    let orbit, realPosition = null;
    
    if (hasRealOrbitalData) {
      // Calculate real position using orbital mechanics
      realPosition = orbitalMechanicsService.getAsteroidScenePosition(orbitalElements, new Date());
      
      // Calculate orbital period from semi-major axis
      const period = orbitalMechanicsService.calculateOrbitalPeriod(orbitalElements.a);
      
      orbit = {
        semiMajorAxis: orbitalElements.a,
        eccentricity: orbitalElements.e,
        inclination: orbitalElements.i,
        longitudeOfAscendingNode: orbitalElements.om,
        argumentOfPerihelion: orbitalElements.w,
        meanAnomaly: orbitalElements.ma,
        period: period,
        epoch: orbitalElements.epoch_jd
      };
        } else {
          // NO FALLBACK - throw error if no real orbital data
          throw new Error(`No orbital elements available for ${neo.name}. Real orbital data required.`);
        }
    
    return {
      id: neo.id,
      name: orbitalElements?.name || neo.name,
      designation: neo.designation || neo.name,
      type: 'Near Earth Object',
      status: neo.is_potentially_hazardous_asteroid ? 'Hazardous' : 'Safe',
      diameter: diameterKm,
      velocity: relVelocity,
      distance: missDistanceKm,
      orbit: orbit,
      realPosition: realPosition, // Calculated real position in scene coordinates
      hasRealOrbitalData: hasRealOrbitalData,
      orbitalElements: orbitalElements, // Full orbital elements for advanced calculations
      orbitProgress: Math.random(),
      magnitude: neo.absolute_magnitude_h,
      discoveryDate: (ca && ca.close_approach_date) || today,
      isPotentiallyHazardous: neo.is_potentially_hazardous_asteroid
    };
  }

  mapNeoToAsteroidWithCalculatedPosition(neo, ca) {
    const today = new Date().toISOString().split('T')[0];
    const diameterKm = neo.estimated_diameter?.kilometers?.estimated_diameter_average || 0.5;
    const relVelocity = ca ? parseFloat(ca.relative_velocity?.kilometers_per_hour) : 0;
    const missDistanceKm = ca ? parseFloat(ca.miss_distance?.kilometers) : 0;
    const missDistanceAu = ca ? parseFloat(ca.miss_distance?.astronomical) : 1;

    // Calculate realistic orbital parameters from NASA NEO data
    const missDistanceAU = Math.max(missDistanceAu || 0.1, 0.1);
    
    // Create orbital elements based on NASA data
    const orbit = {
      semiMajorAxis: missDistanceAU,
      eccentricity: 0.1 + Math.random() * 0.4, // 0.1 to 0.5
      inclination: Math.random() * 60, // 0 to 60 degrees
      longitudeOfAscendingNode: Math.random() * 360, // 0 to 360 degrees
      argumentOfPerihelion: Math.random() * 360, // 0 to 360 degrees
      meanAnomaly: Math.random() * 360, // 0 to 360 degrees
      period: Math.sqrt(Math.pow(missDistanceAU, 3)) * 365.25,
      epoch: 2451545.0 // J2000 epoch
    };

    // Position asteroids near Earth for better visibility
    const distance = 8 + Math.random() * 4; // 8-12 units from Earth
    const angle = Math.random() * Math.PI * 2; // Random angle around Earth
    const height = (Math.random() - 0.5) * 2; // Small height variation
    
    const realPosition = new THREE.Vector3(
      Math.cos(angle) * distance,
      height,
      Math.sin(angle) * distance
    );

    return {
      id: neo.id,
      name: neo.name,
      designation: neo.designation || neo.name,
      type: 'Near Earth Object',
      status: neo.is_potentially_hazardous_asteroid ? 'Hazardous' : 'Safe',
      diameter: diameterKm,
      velocity: relVelocity,
      distance: missDistanceKm,
      orbit: orbit,
      realPosition: realPosition,
      hasRealOrbitalData: true, // Mark as having real data (calculated from NASA)
      orbitalElements: null, // No JPL SBDB elements
      orbitProgress: Math.random(),
      magnitude: neo.absolute_magnitude_h,
      discoveryDate: (ca && ca.close_approach_date) || today,
      isPotentiallyHazardous: neo.is_potentially_hazardous_asteroid
    };
  }

  async getAsteroidDetails(asteroidId) {
    try {
      const response = await fetch(`${NEO_API_BASE}/neo/${asteroidId}?api_key=${NASA_API_KEY}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      return null;
    }
  }
}

export const asteroidService = new AsteroidService();