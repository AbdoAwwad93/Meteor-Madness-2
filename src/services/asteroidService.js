// NASA Near Earth Object Web Service (NeoWs) API
const NASA_API_KEY = process.env.REACT_APP_NASA_API_KEY || 'DEMO_KEY';
const NEO_API_BASE = 'https://api.nasa.gov/neo/rest/v1';

class AsteroidService {
  async getAsteroids() {
    try {
      // Get Near Earth Objects for today
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(
        `${NEO_API_BASE}/feed?start_date=${today}&end_date=${today}&api_key=${NASA_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const asteroids = [];
      
      // Process NEO data
      Object.values(data.near_earth_objects).forEach(dayAsteroids => {
        dayAsteroids.forEach(neo => {
          asteroids.push({
            id: neo.id,
            name: neo.name,
            type: 'Near Earth Object',
            status: neo.is_potentially_hazardous_asteroid ? 'Hazardous' : 'Safe',
            diameter: neo.estimated_diameter?.kilometers?.estimated_diameter_average || 0.5,
            velocity: parseFloat(neo.close_approach_data[0]?.relative_velocity?.kilometers_per_hour) || 0,
            distance: parseFloat(neo.close_approach_data[0]?.miss_distance?.kilometers) || 0,
            orbit: {
              semiMajorAxis: Math.min((parseFloat(neo.close_approach_data[0]?.miss_distance?.astronomical) || 1), 3), // Closer to Earth
              eccentricity: Math.random() * 0.3, // Approximate
              inclination: Math.random() * 30, // Approximate
              period: Math.random() * 1000 + 365 // Approximate orbital period in days
            },
            orbitProgress: Math.random(), // Random position in orbit (0-1)
            magnitude: neo.absolute_magnitude_h,
            discoveryDate: neo.close_approach_data[0]?.close_approach_date || today,
            isPotentiallyHazardous: neo.is_potentially_hazardous_asteroid
          });
        });
      });
      
      // If no asteroids found, return mock data
      if (asteroids.length === 0) {
        return this.getMockAsteroids();
      }
      
      return asteroids.slice(0, 20); // Limit to 20 asteroids
    } catch (error) {
      console.error('Failed to fetch asteroid data:', error);
      return this.getMockAsteroids();
    }
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
