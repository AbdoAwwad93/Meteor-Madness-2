// Major world cities with coordinates, population, and metadata
export const cities = [
  {
    id: 'new-york',
    name: 'New York City',
    country: 'United States',
    coordinates: { lat: 40.7128, lng: -74.0060 },
    population: 8336817,
    area: 789, // km²
    elevation: 10, // meters above sea level
    timezone: 'America/New_York'
  },
  {
    id: 'london',
    name: 'London',
    country: 'United Kingdom',
    coordinates: { lat: 51.5074, lng: -0.1278 },
    population: 8982000,
    area: 1572,
    elevation: 11,
    timezone: 'Europe/London'
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    country: 'Japan',
    coordinates: { lat: 35.6762, lng: 139.6503 },
    population: 13929286,
    area: 2191,
    elevation: 40,
    timezone: 'Asia/Tokyo'
  },
  {
    id: 'paris',
    name: 'Paris',
    country: 'France',
    coordinates: { lat: 48.8566, lng: 2.3522 },
    population: 2161000,
    area: 105,
    elevation: 35,
    timezone: 'Europe/Paris'
  },
  {
    id: 'moscow',
    name: 'Moscow',
    country: 'Russia',
    coordinates: { lat: 55.7558, lng: 37.6176 },
    population: 12615000,
    area: 2561,
    elevation: 156,
    timezone: 'Europe/Moscow'
  },
  {
    id: 'beijing',
    name: 'Beijing',
    country: 'China',
    coordinates: { lat: 39.9042, lng: 116.4074 },
    population: 21540000,
    area: 16410,
    elevation: 43,
    timezone: 'Asia/Shanghai'
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    country: 'India',
    coordinates: { lat: 19.0760, lng: 72.8777 },
    population: 12478447,
    area: 603,
    elevation: 14,
    timezone: 'Asia/Kolkata'
  },
  {
    id: 'sao-paulo',
    name: 'São Paulo',
    country: 'Brazil',
    coordinates: { lat: -23.5505, lng: -46.6333 },
    population: 12325232,
    area: 1521,
    elevation: 760,
    timezone: 'America/Sao_Paulo'
  },
  {
    id: 'cairo',
    name: 'Cairo',
    country: 'Egypt',
    coordinates: { lat: 30.0444, lng: 31.2357 },
    population: 10230350,
    area: 606,
    elevation: 23,
    timezone: 'Africa/Cairo'
  },
  {
    id: 'sydney',
    name: 'Sydney',
    country: 'Australia',
    coordinates: { lat: -33.8688, lng: 151.2093 },
    population: 5312163,
    area: 12368,
    elevation: 58,
    timezone: 'Australia/Sydney'
  },
  {
    id: 'los-angeles',
    name: 'Los Angeles',
    country: 'United States',
    coordinates: { lat: 34.0522, lng: -118.2437 },
    population: 3971883,
    area: 1302,
    elevation: 89,
    timezone: 'America/Los_Angeles'
  },
  {
    id: 'berlin',
    name: 'Berlin',
    country: 'Germany',
    coordinates: { lat: 52.5200, lng: 13.4050 },
    population: 3669491,
    area: 891,
    elevation: 34,
    timezone: 'Europe/Berlin'
  },
  {
    id: 'rome',
    name: 'Rome',
    country: 'Italy',
    coordinates: { lat: 41.9028, lng: 12.4964 },
    population: 2873000,
    area: 1285,
    elevation: 21,
    timezone: 'Europe/Rome'
  },
  {
    id: 'madrid',
    name: 'Madrid',
    country: 'Spain',
    coordinates: { lat: 40.4168, lng: -3.7038 },
    population: 3223334,
    area: 604,
    elevation: 667,
    timezone: 'Europe/Madrid'
  },
  {
    id: 'toronto',
    name: 'Toronto',
    country: 'Canada',
    coordinates: { lat: 43.6532, lng: -79.3832 },
    population: 2930000,
    area: 630,
    elevation: 173,
    timezone: 'America/Toronto'
  },
  {
    id: 'mexico-city',
    name: 'Mexico City',
    country: 'Mexico',
    coordinates: { lat: 19.4326, lng: -99.1332 },
    population: 9209944,
    area: 1485,
    elevation: 2240,
    timezone: 'America/Mexico_City'
  },
  {
    id: 'buenos-aires',
    name: 'Buenos Aires',
    country: 'Argentina',
    coordinates: { lat: -34.6118, lng: -58.3960 },
    population: 3075646,
    area: 203,
    elevation: 25,
    timezone: 'America/Argentina/Buenos_Aires'
  },
  {
    id: 'johannesburg',
    name: 'Johannesburg',
    country: 'South Africa',
    coordinates: { lat: -26.2041, lng: 28.0473 },
    population: 5634806,
    area: 1645,
    elevation: 1753,
    timezone: 'Africa/Johannesburg'
  },
  {
    id: 'dubai',
    name: 'Dubai',
    country: 'United Arab Emirates',
    coordinates: { lat: 25.2048, lng: 55.2708 },
    population: 3331420,
    area: 4114,
    elevation: 5,
    timezone: 'Asia/Dubai'
  },
  {
    id: 'singapore',
    name: 'Singapore',
    country: 'Singapore',
    coordinates: { lat: 1.3521, lng: 103.8198 },
    population: 5453600,
    area: 719,
    elevation: 15,
    timezone: 'Asia/Singapore'
  }
]

// Convert lat/lng to 3D coordinates on Earth sphere
export function latLngTo3D(lat, lng, radius = 5) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  
  return {
    x: radius * Math.sin(phi) * Math.cos(theta),
    y: radius * Math.cos(phi),
    z: radius * Math.sin(phi) * Math.sin(theta)
  }
}

// Get city by ID
export function getCityById(id) {
  return cities.find(city => city.id === id)
}

// Get all cities sorted by population
export function getCitiesByPopulation() {
  return [...cities].sort((a, b) => b.population - a.population)
}
