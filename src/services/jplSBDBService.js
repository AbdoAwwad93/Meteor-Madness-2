// JPL Small-Body Database (SBDB) API Service
const JPL_SBDB_BASE = 'https://ssd-api.jpl.nasa.gov/sbdb.api';

class JPLSBDBService {
  async getOrbitalElements(designation) {
    try {
      // Try different API parameter formats
      const apiUrl = `${JPL_SBDB_BASE}?sstr=${encodeURIComponent(designation)}&full=1`;
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.code && data.code !== 200) {
        throw new Error(`API error: ${data.message || 'Unknown error'}`);
      }

      const elements = this.parseOrbitalElements(data);
      return elements;
    } catch (error) {
      return null;
    }
  }

  parseOrbitalElements(data) {
    // Check if we have orbital data
    if (!data.object || !data.object.orbit) {
      return null;
    }

    const orbit = data.object.orbit;
    const elements = orbit.elements;

    if (!elements) {
      return null;
    }

    const result = {
      // Orbital elements (in AU and degrees)
      a: parseFloat(elements.a?.value) || null, // AU
      e: parseFloat(elements.e?.value) || null,
      i: parseFloat(elements.i?.value) || null, // degrees
      om: parseFloat(elements.om?.value) || null, // degrees
      w: parseFloat(elements.w?.value) || null, // degrees
      ma: parseFloat(elements.ma?.value) || null, // degrees
      
      // Epoch information
      epoch: elements.epoch?.value || null,
      epoch_jd: parseFloat(elements.epoch?.value) || null,
      
      // Physical parameters
      diameter: this.extractDiameter(data.object.phys_par),
      albedo: parseFloat(data.object.phys_par?.albedo) || null,
      
      // Additional data
      designation: data.object.des || null,
      name: data.object.fullname || data.object.des || null,
      spkid: data.object.spkid || null
    };
    
    return result;
  }

  extractDiameter(physPar) {
    if (!physPar) return null;
    
    // Try different diameter fields
    const diameter = physPar.diameter || physPar.diameter_sigma || physPar.diameter_km;
    if (diameter) {
      return parseFloat(diameter);
    }
    
    // If no diameter, try to calculate from absolute magnitude and albedo
    const h = physPar.H;
    const albedo = physPar.albedo;
    if (h && albedo) {
      // Approximate diameter from absolute magnitude and albedo
      const diameter_km = Math.pow(10, (6.259 - 0.4 * h - 0.5 * Math.log10(albedo))) / 1000;
      return diameter_km;
    }
    
    return null;
  }

  async getMultipleOrbitalElements(designations) {
    // Use Promise.allSettled to make parallel requests instead of sequential
    const promises = designations.map(designation => 
      this.getOrbitalElements(designation).catch(error => {
        // Return null for failed requests instead of throwing
        return null;
      })
    );
    
    const results = await Promise.allSettled(promises);
    
    // Extract successful results
    return results
      .map(result => result.status === 'fulfilled' ? result.value : null)
      .filter(elements => elements !== null);
  }
}

export const jplSBDBService = new JPLSBDBService();

