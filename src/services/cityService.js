// GeoNames API City Service
// Free API with comprehensive worldwide city data
// Documentation: http://www.geonames.org/export/web-services.html
// 
// Note: Using 'demo' account because user account 'awwad411' needs to be enabled
// at https://www.geonames.org/manageaccount for free web service access

class CityService {
  constructor() {
    this.GEONAMES_API_BASE = 'http://api.geonames.org';
    this.GEONAMES_USERNAME = 'awwad411';
    this.cache = new Map();
    this.cacheTimeout = 24 * 60 * 60 * 1000; // 24 hours cache
  }

  // Get cities from GeoNames API
  async getMajorCities() {
    const cacheKey = 'geonames_cities';
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      console.log('Fetching cities from GeoNames API...');
      const cities = await this.fetchCitiesFromGeoNames();
      
      if (cities && cities.length > 0) {
        console.log(`Successfully fetched ${cities.length} cities from GeoNames API`);
        // Cache the result
        this.cache.set(cacheKey, {
          data: cities,
          timestamp: Date.now()
        });
        return cities;
      } else {
        throw new Error('No cities returned from GeoNames API');
      }
    } catch (error) {
      console.error('GeoNames API failed:', error);
      throw error; // Don't use fallback, throw the error
    }
  }

  // Fetch cities from GeoNames API
  async fetchCitiesFromGeoNames() {
    try {
      // Get ALL cities using multiple searches for comprehensive coverage
      const searches = await Promise.allSettled([
        // Get ALL populated places (cities, towns, villages)
        this.fetchFromGeoNames('search', {
          q: '',
          featureClass: 'P',
          featureCode: 'PPL', // All populated places
          orderby: 'population',
          maxRows: 1000, // Maximum allowed by GeoNames
          username: this.GEONAMES_USERNAME
        }),
        // Get major cities (first-order administrative divisions)
        this.fetchFromGeoNames('search', {
          q: '',
          featureClass: 'P',
          featureCode: 'PPLA', // Major cities
          orderby: 'population',
          maxRows: 1000,
          username: this.GEONAMES_USERNAME
        }),
        // Get capitals
        this.fetchFromGeoNames('search', {
          q: '',
          featureClass: 'P',
          featureCode: 'PPLC', // Capital cities
          orderby: 'population',
          maxRows: 1000,
          username: this.GEONAMES_USERNAME
        }),
        // Get seats of government
        this.fetchFromGeoNames('search', {
          q: '',
          featureClass: 'P',
          featureCode: 'PPLG', // Seat of government
          orderby: 'population',
          maxRows: 1000,
          username: this.GEONAMES_USERNAME
        }),
        // Get second-order administrative divisions
        this.fetchFromGeoNames('search', {
          q: '',
          featureClass: 'P',
          featureCode: 'PPLA2', // Second-order administrative division
          orderby: 'population',
          maxRows: 1000,
          username: this.GEONAMES_USERNAME
        }),
        // Get third-order administrative divisions
        this.fetchFromGeoNames('search', {
          q: '',
          featureClass: 'P',
          featureCode: 'PPLA3', // Third-order administrative division
          orderby: 'population',
          maxRows: 1000,
          username: this.GEONAMES_USERNAME
        })
      ]);

      // Combine results from successful searches
      let allCities = [];
      searches.forEach((result) => {
        if (result.status === 'fulfilled' && result.value.geonames) {
          allCities = allCities.concat(result.value.geonames);
        }
      });

      if (allCities.length === 0) {
        throw new Error('No cities returned from GeoNames API');
      }

      // Remove duplicates and sort by population
      const uniqueCities = this.removeDuplicates(allCities);
      const sortedCities = uniqueCities.sort((a, b) => 
        (parseInt(b.population) || 0) - (parseInt(a.population) || 0)
      );

      console.log(`GeoNames API returned ${sortedCities.length} cities (all types)`);
      
      // Transform to our format with ALL details
      const cities = sortedCities.map(city => this.transformGeoNamesCity(city));
      
      return cities;

    } catch (error) {
      console.error('Error fetching from GeoNames:', error);
      throw error;
    }
  }

  // Fetch data from GeoNames API
  async fetchFromGeoNames(endpoint, params) {
    const url = new URL(`${this.GEONAMES_API_BASE}/${endpoint}`);
    
    // Add all parameters
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        url.searchParams.append(key, params[key]);
      }
    });

    // Add JSON format parameter
    url.searchParams.append('type', 'json');

    console.log(`Making GeoNames API call: ${url.toString()}`);

    const response = await fetch(url.toString());
      
      if (!response.ok) {
      const errorText = await response.text();
      console.error(`GeoNames API error ${response.status}:`, errorText);
      throw new Error(`GeoNames API error: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    
    // Check if response is XML (error case)
    if (text.trim().startsWith('<?xml')) {
      console.error('GeoNames API returned XML:', text);
      throw new Error('GeoNames API returned XML instead of JSON. Check API parameters.');
    }

    try {
      const data = JSON.parse(text);
      return data;
    } catch (error) {
      console.error('GeoNames API response:', text);
      throw new Error(`Failed to parse GeoNames response: ${error.message}`);
    }
  }

  // Remove duplicate cities based on geonameId
  removeDuplicates(cities) {
    const seen = new Set();
    return cities.filter(city => {
      if (seen.has(city.geonameId)) {
        return false;
      }
      seen.add(city.geonameId);
      return true;
    });
  }

  // Transform GeoNames city data to our format
  transformGeoNamesCity(geoCity) {
    return {
      id: `geoname-${geoCity.geonameId}`,
      name: geoCity.name,
      country: geoCity.countryName,
      countryCode: geoCity.countryCode,
      coordinates: {
        lat: parseFloat(geoCity.lat),
        lng: parseFloat(geoCity.lng)
      },
      population: parseInt(geoCity.population) || 0,
      elevation: parseInt(geoCity.elevation) || 0,
      timezone: geoCity.timezone || this.getTimezoneFromCountry(geoCity.countryCode),
      featureClass: geoCity.fcl,
      featureCode: geoCity.fcode,
      adminCode1: geoCity.adminCode1,
      adminName1: geoCity.adminName1,
      geonameId: geoCity.geonameId
    };
  }

  // Search cities by name using GeoNames API
  async searchCities(query) {
    if (!query || query.length < 2) {
      return [];
    }

    const cacheKey = `search_${query.toLowerCase()}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      console.log(`Searching GeoNames API for: ${query}`);
      
      // Search GeoNames API for cities matching the query
      // Prioritize exact matches with better search strategy
      const searches = await Promise.allSettled([
        // Search for exact name matches first (most important)
        this.fetchFromGeoNames('search', {
          name: query, // Use 'name' parameter for exact matches
          featureClass: 'P',
          orderby: 'population',
          maxRows: 50,
          username: this.GEONAMES_USERNAME
        }),
        // Search for major cities (administrative centers)
        this.fetchFromGeoNames('search', {
          q: query,
          featureClass: 'P',
          featureCode: 'PPLA', // Major cities
          orderby: 'population',
          maxRows: 20,
          username: this.GEONAMES_USERNAME
        }),
        // Search for capitals
        this.fetchFromGeoNames('search', {
          q: query,
          featureClass: 'P',
          featureCode: 'PPLC', // Capital cities
          orderby: 'population',
          maxRows: 10,
          username: this.GEONAMES_USERNAME
        }),
        // Search for general populated places (fallback)
        this.fetchFromGeoNames('search', {
          q: query,
          featureClass: 'P',
          featureCode: 'PPL', // All populated places
          orderby: 'population',
          maxRows: 30,
          username: this.GEONAMES_USERNAME
        })
      ]);

      // Combine results from successful searches
      let allCities = [];
      searches.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.geonames) {
          allCities = allCities.concat(result.value.geonames);
        }
      });

      if (allCities.length === 0) {
        console.log(`No cities found for query: ${query}`);
        return [];
      }

      // Remove duplicates and sort by relevance
      const uniqueCities = this.removeDuplicates(allCities);
      
      // Sort by relevance: exact matches first, then by population
      const sortedCities = uniqueCities.sort((a, b) => {
        const queryLower = query.toLowerCase().trim();
        const aNameLower = a.name.toLowerCase().trim();
        const bNameLower = b.name.toLowerCase().trim();
        
        // Exact match gets highest priority
        if (aNameLower === queryLower && bNameLower !== queryLower) return -1;
        if (bNameLower === queryLower && aNameLower !== queryLower) return 1;
        
        // Starts with query gets second priority
        if (aNameLower.startsWith(queryLower) && !bNameLower.startsWith(queryLower)) return -1;
        if (bNameLower.startsWith(queryLower) && !aNameLower.startsWith(queryLower)) return 1;
        
        // Contains query gets third priority
        if (aNameLower.includes(queryLower) && !bNameLower.includes(queryLower)) return -1;
        if (bNameLower.includes(queryLower) && !aNameLower.includes(queryLower)) return 1;
        
        // Then sort by population (largest first)
        return (parseInt(b.population) || 0) - (parseInt(a.population) || 0);
      });

      const cities = sortedCities.map(city => this.transformGeoNamesCity(city));

      // Cache the result
      this.cache.set(cacheKey, {
        data: cities,
        timestamp: Date.now()
      });

      // Limit results to top 20 for better performance and relevance
      const limitedCities = cities.slice(0, 20);
      console.log(`Found ${limitedCities.length} cities for query: ${query} (showing top results)`);
      return limitedCities;

    } catch (error) {
      console.error('GeoNames search failed:', error);
      throw error; // Don't use fallback, throw the error
    }
  }

  // Get API status
  getApiStatus() {
          return {
      username: this.GEONAMES_USERNAME,
      status: 'Active - GeoNames Demo Account'
    };
  }

  // Test API connection
  async testApiConnection() {
    try {
      console.log('Testing GeoNames API connection...');
      const response = await this.fetchFromGeoNames('search', {
        q: 'test',
        featureClass: 'P',
        maxRows: 1,
        username: this.GEONAMES_USERNAME
      });
      
      console.log('GeoNames API connection successful!');
      return { success: true, message: 'API connection working' };
    } catch (error) {
      console.error('GeoNames API connection failed:', error);
      return { success: false, message: error.message };
    }
  }

  // Get cities by country using GeoNames API
  async getCitiesByCountry(countryCode) {
    const cacheKey = `country_${countryCode}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const response = await this.fetchFromGeoNames('search', {
        country: countryCode,
        featureClass: 'P',
        orderby: 'population',
        maxRows: 500,
        username: this.GEONAMES_USERNAME
      });

      const cities = (response.geonames || []).map(city => this.transformGeoNamesCity(city));

      // Cache the result
      this.cache.set(cacheKey, {
        data: cities,
        timestamp: Date.now()
      });

      return cities;

    } catch (error) {
      console.error('Failed to get cities by country:', error);
      return [];
    }
  }

  // Get cities near a specific location
  async getCitiesNearLocation(lat, lng, radiusKm = 50, maxResults = 20) {
    const cacheKey = `nearby_${lat}_${lng}_${radiusKm}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const response = await this.fetchFromGeoNames('findNearby', {
        lat: lat,
        lng: lng,
        featureClass: 'P',
        radius: radiusKm,
        maxRows: maxResults,
        username: this.GEONAMES_USERNAME
      });

      const cities = (response.geonames || []).map(city => this.transformGeoNamesCity(city));

      // Cache the result
      this.cache.set(cacheKey, {
        data: cities,
        timestamp: Date.now()
      });

      return cities;

    } catch (error) {
      console.error('Failed to get cities near location:', error);
      return [];
    }
  }


  // Get timezone from country code (simplified mapping)
  getTimezoneFromCountry(countryCode) {
    const timezoneMap = {
      'US': 'America/New_York',
      'GB': 'Europe/London',
      'JP': 'Asia/Tokyo',
      'FR': 'Europe/Paris',
      'RU': 'Europe/Moscow',
      'CN': 'Asia/Shanghai',
      'IN': 'Asia/Kolkata',
      'BR': 'America/Sao_Paulo',
      'EG': 'Africa/Cairo',
      'AU': 'Australia/Sydney',
      'DE': 'Europe/Berlin',
      'IT': 'Europe/Rome',
      'ES': 'Europe/Madrid',
      'CA': 'America/Toronto',
      'MX': 'America/Mexico_City',
      'AR': 'America/Argentina/Buenos_Aires',
      'ZA': 'Africa/Johannesburg',
      'AE': 'Asia/Dubai',
      'SG': 'Asia/Singapore'
    };

    return timezoneMap[countryCode] || 'UTC';
  }
}

export const cityService = new CityService();