// JPL Horizons API Service for real-time asteroid positions
// This service fetches current ephemeris data from NASA JPL Horizons system

class JPLHorizonsService {
  constructor() {
    this.HORIZONS_API_BASE = 'https://ssd-api.jpl.nasa.gov/horizons.api';
    this.CORS_PROXY = 'https://api.allorigins.win/raw?url=';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes cache
  }

  // Get current position for a single asteroid
  async getAsteroidPosition(asteroidId, designation) {
    
    // Check cache first
    if (this.cache.has(asteroidId)) {
      const cached = this.cache.get(asteroidId);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      
      // Use JPL Horizons API with CORS proxy to get current position
      const apiUrl = `${this.HORIZONS_API_BASE}?format=json&COMMAND='${designation}'&OBJ_DATA='YES'&MAKE_EPHEM='YES'&EPHEM_TYPE='VECTOR'&CENTER='500@399'&START_TIME='${this.getCurrentTimeString()}'&STOP_TIME='${this.getCurrentTimeString()}'&STEP_SIZE='1d'&VEC_TABLE='2'&VEC_CORR='NONE'&OUT_UNITS='AU-D'&REF_SYSTEM='ICRF'&VEC_LABELS='YES'&VEC_DELTA_T='NO'&CSV_FORMAT='NO'&OBJ_DATA='YES'&QUANTITIES='1,9,20,23,24,25'`;
      const response = await fetch(`${this.CORS_PROXY}${encodeURIComponent(apiUrl)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.result && data.result.includes('$$SOE')) {
        // Parse the ephemeris data
        const position = this.parseHorizonsData(data.result);
        
        if (position) {
          // Cache the result
          this.cache.set(asteroidId, {
            data: position,
            timestamp: Date.now()
          });
          
          return position;
        }
      }
      
      return null;
      
    } catch (error) {
      return null;
    }
  }

  // Get positions for multiple asteroids
  async getMultipleAsteroidPositions(asteroids) {
    const promises = asteroids.map(asteroid => 
      this.getAsteroidPosition(asteroid.id, asteroid.designation || asteroid.name)
    );
    
    const results = await Promise.all(promises);
    
    // Combine results with asteroid data
    return asteroids.map((asteroid, index) => ({
      ...asteroid,
      realTimePosition: results[index]
    }));
  }

  // Parse JPL Horizons ephemeris data
  parseHorizonsData(result) {
    try {
      const lines = result.split('\n');
      let inDataSection = false;
      
      for (let line of lines) {
        if (line.includes('$$SOE')) {
          inDataSection = true;
          continue;
        }
        if (line.includes('$$EOE')) {
          break;
        }
        if (inDataSection && line.trim()) {
          // Parse the data line
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 6) {
            // Extract position and velocity
            const x = parseFloat(parts[2]); // X position (AU)
            const y = parseFloat(parts[3]); // Y position (AU)
            const z = parseFloat(parts[4]); // Z position (AU)
            const vx = parseFloat(parts[5]); // X velocity (AU/day)
            const vy = parseFloat(parts[6]); // Y velocity (AU/day)
            const vz = parseFloat(parts[7]); // Z velocity (AU/day)
            
            return {
              position: { x, y, z }, // Position in AU
              velocity: { x: vx, y: vy, z: vz }, // Velocity in AU/day
              timestamp: new Date()
            };
          }
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  // Get current time in Horizons format
  getCurrentTimeString() {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    const hour = String(now.getUTCHours()).padStart(2, '0');
    const minute = String(now.getUTCMinutes()).padStart(2, '0');
    const second = String(now.getUTCSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  }

  // Convert AU to scene units
  convertToSceneUnits(positionAU, scaleFactor = 100) {
    return {
      x: positionAU.x * scaleFactor,
      y: positionAU.y * scaleFactor,
      z: positionAU.z * scaleFactor
    };
  }

  // Get asteroid position relative to Earth
  async getAsteroidRelativePosition(asteroidId, designation) {
    try {
      // Get asteroid position
      const asteroidData = await this.getAsteroidPosition(asteroidId, designation);
      if (!asteroidData) return null;

      // Get Earth position (simplified)
      const earthPosition = await this.getEarthPosition();
      if (!earthPosition) return null;

      // Calculate relative position
      const relativePosition = {
        x: asteroidData.position.x - earthPosition.position.x,
        y: asteroidData.position.y - earthPosition.position.y,
        z: asteroidData.position.z - earthPosition.position.z
      };

      // Convert to scene units
      return this.convertToSceneUnits(relativePosition);
      
    } catch (error) {
      return null;
    }
  }

  // Get Earth position (simplified)
  async getEarthPosition() {
    try {
      const apiUrl = `${this.HORIZONS_API_BASE}?format=json&COMMAND='399'&OBJ_DATA='YES'&MAKE_EPHEM='YES'&EPHEM_TYPE='VECTOR'&CENTER='500@10'&START_TIME='${this.getCurrentTimeString()}'&STOP_TIME='${this.getCurrentTimeString()}'&STEP_SIZE='1d'&VEC_TABLE='2'&VEC_CORR='NONE'&OUT_UNITS='AU-D'&REF_SYSTEM='ICRF'&VEC_LABELS='YES'&VEC_DELTA_T='NO'&CSV_FORMAT='NO'&OBJ_DATA='YES'&QUANTITIES='1,9,20,23,24,25'`;
      const response = await fetch(`${this.CORS_PROXY}${encodeURIComponent(apiUrl)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.result && data.result.includes('$$SOE')) {
        return this.parseHorizonsData(data.result);
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }
}

export const jplHorizonsService = new JPLHorizonsService();
