// NASA Near Earth Object Web Service (NeoWs) API
const NASA_API_KEY = process.env.REACT_APP_NASA_API_KEY || 'DEMO_KEY';
const NEO_API_BASE = 'https://api.nasa.gov/neo/rest/v1';
const NEO_FETCH_MODE = (process.env.REACT_APP_NEO_FETCH_MODE || 'browse').toLowerCase(); // 'browse' | 'feed'
const NEO_PAGE_SIZE = parseInt(process.env.REACT_APP_NEO_PAGE_SIZE || '200', 10); // browse size per page
const NEO_MAX_PAGES = parseInt(process.env.REACT_APP_NEO_MAX_PAGES || '3', 10); // how many pages to fetch
const NEO_MAX_COUNT = parseInt(process.env.REACT_APP_NEO_MAX_COUNT || '600', 10); // safety cap

class AsteroidService {
  async getAsteroids() {
    try {
      if (NEO_FETCH_MODE === 'browse') {
        return await this.getAsteroidsByBrowse();
      } else {
        return await this.getAsteroidsByFeed();
      }
    } catch (error) {
      console.error('Failed to fetch asteroid data:', error);
      return this.getMockAsteroids();
    }
  }

  async getAsteroidsByFeed() {
    const today = new Date().toISOString().split('T')[0];
    const response = await fetch(
      `${NEO_API_BASE}/feed?start_date=${today}&end_date=${today}&api_key=${NASA_API_KEY}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const asteroids = [];
    Object.values(data.near_earth_objects).forEach(dayAsteroids => {
      dayAsteroids.forEach(neo => {
        const ca = neo.close_approach_data && neo.close_approach_data[0];
        asteroids.push(this.mapNeoToAsteroid(neo, ca));
      });
    });
    return asteroids.slice(0, Math.min(NEO_MAX_COUNT, asteroids.length));
  }

  async getAsteroidsByBrowse() {
    const results = [];
    for (let page = 0; page < NEO_MAX_PAGES; page++) {
      const response = await fetch(
        `${NEO_API_BASE}/neo/browse?page=${page}&size=${NEO_PAGE_SIZE}&api_key=${NASA_API_KEY}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const neos = data.near_earth_objects || [];
      for (const neo of neos) {
        const ca = Array.isArray(neo.close_approach_data) && neo.close_approach_data.length > 0
          ? neo.close_approach_data[0]
          : null;
        results.push(this.mapNeoToAsteroid(neo, ca));
        if (results.length >= NEO_MAX_COUNT) {
          return results;
        }
      }
      // If there are no more pages, break
      if (!data.page || page >= (data.page.total_pages - 1)) {
        break;
      }
    }
    return results.length ? results : this.getMockAsteroids();
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

  getMockAsteroids() {
    const mockAsteroids = [];
    const asteroidNames = [
      'Ceres', 'Vesta', 'Pallas', 'Hygiea', 'Astraea', 'Hebe', 'Iris', 'Flora',
      'Metis', 'Psyche', 'Thetis', 'Melpomene', 'Fortuna', 'Massalia', 'Lutetia',
      'Kalliope', 'Thalia', 'Themis', 'Phocaea', 'Proserpina'
    ];

    for (let i = 0; i < 20; i++) {
      const semiMajorAxis = 1.2 + Math.random() * 2.8; // Between 1.2-4 units (closer to Earth)
      const eccentricity = Math.random() * 0.3;
      const inclination = Math.random() * 30;
      const period = Math.sqrt(Math.pow(semiMajorAxis, 3)) * 365.25; // Kepler's 3rd law approximation

      mockAsteroids.push({
        id: `asteroid_${i + 1}`,
        name: asteroidNames[i] || `Asteroid ${i + 1}`,
        type: 'Near Earth Asteroid',
        status: Math.random() > 0.8 ? 'Hazardous' : 'Safe',
        diameter: Math.random() * 2 + 0.1, // 0.1 to 2.1 km
        velocity: Math.random() * 30 + 10, // 10-40 km/s
        distance: semiMajorAxis * 149597870.7, // Convert AU to km
        orbit: {
          semiMajorAxis,
          eccentricity,
          inclination,
          period
        },
        orbitProgress: Math.random(), // Random position in orbit (0-1)
        magnitude: Math.random() * 10 + 10, // Absolute magnitude
        discoveryDate: new Date(Date.now() - Math.random() * 100 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        isPotentiallyHazardous: Math.random() > 0.9
      });
    }

    return mockAsteroids;
  }

  async getAsteroidDetails(asteroidId) {
    try {
      const response = await fetch(`${NEO_API_BASE}/neo/${asteroidId}?api_key=${NASA_API_KEY}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch asteroid details:', error);
      return null;
    }
  }
}

export const asteroidService = new AsteroidService();
