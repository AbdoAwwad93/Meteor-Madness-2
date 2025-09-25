// Orbital Mechanics Service - Calculate positions from orbital elements
import * as THREE from 'three';

class OrbitalMechanicsService {
  constructor() {
    // Physical constants
    this.AU_KM = 149597870.7; // Astronomical Unit in km
    this.GM_SUN = 1.32712440018e11; // Sun's gravitational parameter (km³/s²)
    this.GM_EARTH = 3.986004418e5; // Earth's gravitational parameter (km³/s²)
    this.EARTH_RADIUS = 6371; // Earth radius in km
  }

  // Convert degrees to radians
  degToRad(degrees) {
    return degrees * Math.PI / 180;
  }

  // Convert radians to degrees
  radToDeg(radians) {
    return radians * 180 / Math.PI;
  }

  // Solve Kepler's equation using Newton-Raphson method
  solveKeplerEquation(meanAnomaly, eccentricity, maxIterations = 10, tolerance = 1e-8) {
    let E = meanAnomaly; // Initial guess
    
    for (let i = 0; i < maxIterations; i++) {
      const f = E - eccentricity * Math.sin(E) - meanAnomaly;
      const fPrime = 1 - eccentricity * Math.cos(E);
      
      if (Math.abs(f) < tolerance) {
        break;
      }
      
      E = E - f / fPrime;
    }
    
    return E;
  }

  // Calculate true anomaly from eccentric anomaly
  calculateTrueAnomaly(eccentricAnomaly, eccentricity) {
    const cosE = Math.cos(eccentricAnomaly);
    const sinE = Math.sin(eccentricAnomaly);
    const sqrtOneMinusESq = Math.sqrt(1 - eccentricity * eccentricity);
    
    const cosNu = (cosE - eccentricity) / (1 - eccentricity * cosE);
    const sinNu = (sqrtOneMinusESq * sinE) / (1 - eccentricity * cosE);
    
    return Math.atan2(sinNu, cosNu);
  }

  // Calculate heliocentric position from orbital elements
  calculateHeliocentricPosition(elements, time) {
    try {
      // Handle both field name formats (JPL SBDB vs NASA fallback)
      const a = (elements.a || elements.semiMajorAxis) * this.AU_KM; // Convert AU to km
      const e = elements.e || elements.eccentricity;
      const i = this.degToRad(elements.i || elements.inclination);
      const Omega = this.degToRad(elements.om || elements.longitudeOfAscendingNode); // Longitude of ascending node
      const omega = this.degToRad(elements.w || elements.argumentOfPerihelion); // Argument of perihelion
      const M0 = this.degToRad(elements.ma || elements.meanAnomaly);
      
      // Validate orbital elements
      if (!isFinite(a) || !isFinite(e) || !isFinite(i) || !isFinite(Omega) || !isFinite(omega) || !isFinite(M0)) {
        return null;
      }
      
      // Calculate time since epoch
      const epochJD = elements.epoch_jd || elements.epoch;
      const currentJD = this.dateToJulianDay(time);
      const deltaT = (currentJD - epochJD) * 86400; // Convert days to seconds
      
      // Calculate mean motion
      const n = Math.sqrt(this.GM_SUN / (a * a * a)); // rad/s
      const M = M0 + n * deltaT; // Current mean anomaly
      
      // Solve Kepler's equation
      const E = this.solveKeplerEquation(M, e);
      
      // Calculate true anomaly
      const nu = this.calculateTrueAnomaly(E, e);
      
      // Calculate distance
      const r = a * (1 - e * e) / (1 + e * Math.cos(nu));
      
      // Calculate position in perifocal coordinates
      const xPeri = r * Math.cos(nu);
      const yPeri = r * Math.sin(nu);
      const zPeri = 0;
      
      // Transform to heliocentric ecliptic coordinates using proper Euler rotations
      // R = Rz(Ω) * Rx(i) * Rz(ω)
      const cosOmega = Math.cos(Omega);
      const sinOmega = Math.sin(Omega);
      const cosI = Math.cos(i);
      const sinI = Math.sin(i);
      const cosOmegaArg = Math.cos(omega);
      const sinOmegaArg = Math.sin(omega);
      
      // First rotation: Rz(ω) - rotation around z by argument of perihelion
      const x1 = xPeri * cosOmegaArg - yPeri * sinOmegaArg;
      const y1 = xPeri * sinOmegaArg + yPeri * cosOmegaArg;
      const z1 = zPeri;
      
      // Second rotation: Rx(i) - rotation around x by inclination
      const x2 = x1;
      const y2 = y1 * cosI - z1 * sinI;
      const z2 = y1 * sinI + z1 * cosI;
      
      // Third rotation: Rz(Ω) - rotation around z by longitude of ascending node
      const x = x2 * cosOmega - y2 * sinOmega;
      const y = x2 * sinOmega + y2 * cosOmega;
      const z = z2;
      
      return new THREE.Vector3(x, y, z);
        } catch (error) {
          return null;
        }
  }

  // Calculate Earth's heliocentric position (more accurate)
  calculateEarthHeliocentricPosition(time) {
    // More accurate Earth position using approximate orbital elements
    const currentJD = this.dateToJulianDay(time);
    const daysSinceJ2000 = currentJD - 2451545.0;
    
    // Earth's approximate orbital elements at J2000
    const a = this.AU_KM; // Semi-major axis (1 AU)
    const e = 0.0167; // Eccentricity
    const i = 0; // Inclination (Earth's orbit is in ecliptic plane)
    const Omega = 0; // Longitude of ascending node
    const omega = 102.9; // Argument of perihelion (degrees)
    const M0 = 357.5; // Mean anomaly at J2000 (degrees)
    
    // Convert to radians
    const omegaRad = this.degToRad(omega);
    const M0Rad = this.degToRad(M0);
    
    // Calculate mean anomaly
    const n = Math.sqrt(this.GM_SUN / (a * a * a)); // Mean motion
    const deltaT = daysSinceJ2000 * 86400; // Convert days to seconds
    const M = M0Rad + n * deltaT;
    
    // Solve Kepler's equation for Earth
    const E = this.solveKeplerEquation(M, e);
    
    // Calculate true anomaly
    const nu = this.calculateTrueAnomaly(E, e);
    
    // Calculate distance
    const r = a * (1 - e * e) / (1 + e * Math.cos(nu));
    
    // Position in perifocal coordinates
    const xPeri = r * Math.cos(nu);
    const yPeri = r * Math.sin(nu);
    const zPeri = 0;
    
    // Transform to heliocentric coordinates (Earth's orbit is in ecliptic plane)
    const x = xPeri * Math.cos(omegaRad) - yPeri * Math.sin(omegaRad);
    const y = xPeri * Math.sin(omegaRad) + yPeri * Math.cos(omegaRad);
    const z = zPeri;
    
    return new THREE.Vector3(x, y, z);
  }

  // Convert geocentric position to scene coordinates
  geocentricToSceneCoordinates(geocentricKm, earthRadiusUnits = 5) {
    // Scale for visualization - convert km to scene units
    // Much more realistic scaling: 1 AU = 100 scene units (5x further)
    const scaleFactor = 100 / this.AU_KM; // 100 units per AU
    return geocentricKm.multiplyScalar(scaleFactor);
  }

  // Calculate geocentric position from heliocentric positions
  calculateGeocentricPosition(asteroidHelio, earthHelio) {
    return asteroidHelio.clone().sub(earthHelio);
  }

  // Convert date to Julian Day
  dateToJulianDay(date) {
    const time = date.getTime();
    return (time / 86400000) + 2440587.5;
  }

  // Main method to get asteroid position in scene coordinates
  getAsteroidScenePosition(elements, time, earthRadiusUnits = 5) {
    // Calculate heliocentric positions
    const asteroidHelio = this.calculateHeliocentricPosition(elements, time);
    const earthHelio = this.calculateEarthHeliocentricPosition(time);
    
        if (!asteroidHelio || !earthHelio) {
          return null;
        }
    
    // Calculate geocentric position
    const geocentric = this.calculateGeocentricPosition(asteroidHelio, earthHelio);
    
    // Convert to scene coordinates
    const scenePosition = this.geocentricToSceneCoordinates(geocentric, earthRadiusUnits);
    
    // Debug logging removed for production
    
    return scenePosition;
  }

  // Calculate orbital period from semi-major axis
  calculateOrbitalPeriod(semiMajorAxisAU) {
    const a = semiMajorAxisAU * this.AU_KM; // Convert to km
    const period = 2 * Math.PI * Math.sqrt((a * a * a) / this.GM_SUN); // seconds
    return period / 86400; // Convert to days
  }

  // Generate orbital path points for visualization
  generateOrbitalPath(elements, numPoints = 100, timeSpan = 30) {
    const points = [];
    const startTime = new Date();
    const timeStep = (timeSpan * 24 * 60 * 60 * 1000) / numPoints; // milliseconds per point
    
    for (let i = 0; i < numPoints; i++) {
      const time = new Date(startTime.getTime() + i * timeStep);
      const position = this.getAsteroidScenePosition(elements, time);
      
      if (position) {
        points.push(position);
      }
    }
    
    return points;
  }
}

export const orbitalMechanicsService = new OrbitalMechanicsService();
