import axios from 'axios';

const NASA_API_KEY = process.env.REACT_APP_NASA_API_KEY || 'DEMO_KEY';
const BASE_URL = 'https://api.nasa.gov';

// Cache for API responses
const cache = new Map();
const CACHE_DURATION = parseInt(process.env.REACT_APP_CACHE_DURATION) || 300000; // 5 minutes

class NASAAPIService {
  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      params: {
        api_key: NASA_API_KEY
      }
    });
  }

  async getCachedData(key, fetchFunction) {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    const data = await fetchFunction();
    cache.set(key, { data, timestamp: Date.now() });
    return data;
  }

  async getEarthImagery(lat = 29.78, lon = -95.33, date = new Date().toISOString().split('T')[0]) {
    const cacheKey = `earth-imagery-${lat}-${lon}-${date}`;
    return this.getCachedData(cacheKey, async () => {
      const response = await this.client.get('/planetary/earth/imagery', {
        params: { lat, lon, date, dim: 0.15 }
      });
      return response.data;
    });
  }

  async getClimateData(dataset = 'temperature') {
    const cacheKey = `climate-${dataset}`;
    return this.getCachedData(cacheKey, async () => {
      // Mock data for now - replace with actual NASA API calls
      switch (dataset) {
        case 'temperature':
          return this.generateMockTemperatureData();
        case 'co2':
          return this.generateMockCO2Data();
        case 'seaLevel':
          return this.generateMockSeaLevelData();
        case 'iceSheet':
          return this.generateMockIceSheetData();
        case 'methane':
          return this.generateMockMethaneData();
        default:
          throw new Error(`Unknown dataset: ${dataset}`);
      }
    });
  }

  async getSatelliteData() {
    const cacheKey = 'satellites';
    return this.getCachedData(cacheKey, async () => {
      // Mock satellite data - replace with actual TLE data from Celestrak or NASA
      return this.generateMockSatelliteData();
    });
  }

  // Mock data generators (replace with actual API calls)
  generateMockTemperatureData() {
    const data = [];
    const now = new Date();
    for (let i = 0; i < 100; i++) {
      data.push({
        date: new Date(now.getTime() - i * 24 * 60 * 60 * 1000),
        value: 14.5 + Math.sin(i * 0.1) * 2 + Math.random() * 0.5,
        anomaly: Math.sin(i * 0.1) * 1.5 + Math.random() * 0.3
      });
    }
    return data.reverse();
  }

  generateMockCO2Data() {
    const data = [];
    const now = new Date();
    let baseValue = 415;
    for (let i = 0; i < 100; i++) {
      data.push({
        date: new Date(now.getTime() - i * 24 * 60 * 60 * 1000),
        value: baseValue + Math.sin(i * 0.05) * 5 + Math.random() * 2,
        location: 'Mauna Loa Observatory'
      });
      baseValue += 0.02; // Slight increase over time
    }
    return data.reverse();
  }

  generateMockSeaLevelData() {
    const data = [];
    const now = new Date();
    let baseLevel = 0;
    for (let i = 0; i < 100; i++) {
      data.push({
        date: new Date(now.getTime() - i * 24 * 60 * 60 * 1000),
        value: baseLevel + Math.sin(i * 0.03) * 10 + Math.random() * 2,
        trend: 3.3 // mm/year
      });
      baseLevel += 0.01;
    }
    return data.reverse();
  }

  generateMockIceSheetData() {
    const data = [];
    const now = new Date();
    let baseMass = 0;
    for (let i = 0; i < 100; i++) {
      data.push({
        date: new Date(now.getTime() - i * 24 * 60 * 60 * 1000),
        greenland: baseMass - i * 0.5 + Math.random() * 10,
        antarctica: baseMass - i * 0.3 + Math.random() * 8,
        unit: 'Gt' // Gigatons
      });
    }
    return data.reverse();
  }

  generateMockMethaneData() {
    const data = [];
    const now = new Date();
    for (let i = 0; i < 100; i++) {
      data.push({
        date: new Date(now.getTime() - i * 24 * 60 * 60 * 1000),
        value: 1850 + Math.sin(i * 0.1) * 50 + Math.random() * 10,
        unit: 'ppb' // parts per billion
      });
    }
    return data.reverse();
  }

  generateMockSatelliteData() {
    const satellites = [
      {
        id: 'terra',
        name: 'Terra',
        type: 'Earth Observation',
        altitude: 705,
        inclination: 98.2,
        period: 98.8,
        launched: '1999-12-18',
        status: 'Active',
        instruments: ['MODIS', 'ASTER', 'CERES', 'MISR', 'MOPITT'],
        description: 'Earth observing satellite studying land, oceans, atmosphere, and climate'
      },
      {
        id: 'aqua',
        name: 'Aqua',
        type: 'Earth Observation',
        altitude: 705,
        inclination: 98.2,
        period: 98.8,
        launched: '2002-05-04',
        status: 'Active',
        instruments: ['MODIS', 'AIRS', 'AMSU', 'CERES', 'AMSR-E'],
        description: 'Studies Earth\'s water cycle and climate system'
      },
      {
        id: 'landsat8',
        name: 'Landsat 8',
        type: 'Earth Observation',
        altitude: 705,
        inclination: 98.2,
        period: 99,
        launched: '2013-02-11',
        status: 'Active',
        instruments: ['OLI', 'TIRS'],
        description: 'Land imaging satellite for monitoring Earth\'s surface changes'
      },
      {
        id: 'iss',
        name: 'International Space Station',
        type: 'Space Station',
        altitude: 408,
        inclination: 51.6,
        period: 92.9,
        launched: '1998-11-20',
        status: 'Active',
        instruments: ['Various'],
        description: 'International space station conducting scientific research'
      }
    ];

    // Add orbital elements for each satellite
    return satellites.map(sat => ({
      ...sat,
      position: this.calculateSatellitePosition(sat),
      orbit: this.generateOrbitPath(sat)
    }));
  }

  calculateSatellitePosition(satellite) {
    // Simplified orbital calculation - replace with actual TLE data
    const now = Date.now() / 1000;
    const meanMotion = 2 * Math.PI / (satellite.period * 60); // rad/s
    const meanAnomaly = (now * meanMotion) % (2 * Math.PI);
    
    // Convert to Cartesian coordinates (simplified)
    const radius = 6371 + satellite.altitude; // Earth radius + altitude
    const x = radius * Math.cos(meanAnomaly);
    const y = radius * Math.sin(meanAnomaly) * Math.cos(satellite.inclination * Math.PI / 180);
    const z = radius * Math.sin(meanAnomaly) * Math.sin(satellite.inclination * Math.PI / 180);
    
    return { x, y, z };
  }

  generateOrbitPath(satellite) {
    const points = [];
    const radius = 6371 + satellite.altitude;
    const inclination = satellite.inclination * Math.PI / 180;
    
    for (let i = 0; i < 100; i++) {
      const angle = (i / 100) * 2 * Math.PI;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle) * Math.cos(inclination);
      const z = radius * Math.sin(angle) * Math.sin(inclination);
      points.push({ x, y, z });
    }
    
    return points;
  }
}

const nasaAPI = new NASAAPIService();

export const fetchNASAData = async (dataType, params = {}) => {
  switch (dataType) {
    case 'satellites':
      return nasaAPI.getSatelliteData();
    case 'temperature':
    case 'co2':
    case 'seaLevel':
    case 'iceSheet':
    case 'methane':
      return nasaAPI.getClimateData(dataType);
    case 'earthImagery':
      return nasaAPI.getEarthImagery(params.lat, params.lon, params.date);
    default:
      throw new Error(`Unknown data type: ${dataType}`);
  }
};

export default nasaAPI;
