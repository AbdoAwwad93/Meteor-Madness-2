// Cache buster - v2.0 with Gemini 1.5-flash
let scene, camera, renderer, controls, map;
let targetCityMarker = null;
let impactData = null;

// Audio setup for explosion sound
let explosionSound = null;
let soundEnabled = true; // Default to enabled

function initializeAudio() {
  try {
    // Create audio object for explosion sound
    explosionSound = new Audio('../sound/صوت انفجار.mp3');
    explosionSound.preload = 'auto';
    explosionSound.volume = 0.7; // Set volume to 70% to avoid being too loud
    
    // Handle audio loading errors
    explosionSound.addEventListener('error', (e) => {
      console.warn('Could not load explosion sound:', e);
    });
    
    console.log('Audio initialized successfully');
  } catch (error) {
    console.warn('Audio initialization failed:', error);
  }
}

function playExplosionSound() {
  try {
    if (explosionSound && soundEnabled) {
      // Reset audio to beginning and play
      explosionSound.currentTime = 0;
      explosionSound.play().catch(error => {
        console.warn('Could not play explosion sound:', error);
        // Try to enable audio context if needed
        if (error.name === 'NotAllowedError') {
          console.log('Audio playback blocked. User interaction required to enable audio.');
        }
      });
    }
  } catch (error) {
    console.warn('Error playing explosion sound:', error);
  }
}

function setupSoundControl() {
  const soundControl = document.getElementById('soundControl');
  
  if (soundControl) {
    soundControl.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      
      if (soundEnabled) {
        soundControl.textContent = '🔊';
        soundControl.classList.remove('muted');
        soundControl.title = 'Sound Effects On (Click to mute)';
      } else {
        soundControl.textContent = '🔇';
        soundControl.classList.add('muted');
        soundControl.title = 'Sound Effects Off (Click to unmute)';
      }
      
      // Store preference in localStorage
      localStorage.setItem('soundEnabled', soundEnabled);
      
      console.log('Sound', soundEnabled ? 'enabled' : 'disabled');
    });
    
    // Load saved preference
    const savedSoundState = localStorage.getItem('soundEnabled');
    if (savedSoundState !== null) {
      soundEnabled = savedSoundState === 'true';
      
      if (!soundEnabled) {
        soundControl.textContent = '🔇';
        soundControl.classList.add('muted');
        soundControl.title = 'Sound Effects Off (Click to unmute)';
      } else {
        soundControl.title = 'Sound Effects On (Click to mute)';
      }
    } else {
      soundControl.title = 'Sound Effects On (Click to mute)';
    }
  }
}

function MapMadness() {
  scene = new THREE.Scene();

  const aspect = window.innerWidth / window.innerHeight;
  const d = 100;

  camera = new THREE.OrthographicCamera(
    -d * aspect, d * aspect,
    d, -d,
    0.1, 2000
  );
  camera.position.set(0, 0, 500);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById("map").appendChild(renderer.domElement);

  controls = new THREE.MapControls(camera, renderer.domElement);
  controls.enableRotate = false;
  controls.zoomSpeed = 2.0;
  controls.panSpeed = 1.5;
  controls.minZoom = 0.5;
  controls.maxZoom = 100;
  controls.screenSpacePanning = true;
  controls.minPolarAngle = 0;
  controls.maxPolarAngle = Math.PI;

  const loader = new THREE.TextureLoader();
  loader.load("../textures/8k_earth_daymap.jpg", (texture) => {
    const geometry = new THREE.PlaneGeometry(400, 200);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    map = new THREE.Mesh(geometry, material);
    scene.add(map);
    
    // Hide loading screen once map is loaded
    setTimeout(() => {
      const loadingScreen = document.getElementById('loadingScreen');
      if (loadingScreen) {
        loadingScreen.classList.add('hidden');
        setTimeout(() => {
          loadingScreen.style.display = 'none';
        }, 500);
      }
    }, 500); // Small delay to ensure smooth transition
  });

  window.addEventListener("resize", () => {
    const aspect = window.innerWidth / window.innerHeight;
    camera.left = -d * aspect;
    camera.right = d * aspect;
    camera.top = d;
    camera.bottom = -d;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

// Cities data is now handled by the React app, no need to load cities.json
// Enable search box immediately since we don't need to wait for data
document.addEventListener('DOMContentLoaded', function() {
  const searchBox = document.getElementById("searchBox");
  if (searchBox) {
    searchBox.disabled = false;
  }
  
  // Initialize audio for explosion sound
  initializeAudio();
  
  // Setup sound control button
  setupSoundControl();
});

function latLonToXY(lat, lon, width = 400, height = 200) {
  let x = (lon + 180) * (width / 360) - width / 2;
  let y = (90 - lat) * (height / 180) - height / 2;
  return { x, y };
}

function addCityMarker(lat, lon, name) {
  if (targetCityMarker) scene.remove(targetCityMarker);

  const { x, y } = latLonToXY(lat, lon);
  const geometry = new THREE.SphereGeometry(1, 16, 16);
  const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const marker = new THREE.Mesh(geometry, material);

  marker.position.set(x, -y, 1);
  marker.userData = { name };

  scene.add(marker);
  targetCityMarker = marker;
}

function zoomToCity(lat, lon) {
  const { x, y } = latLonToXY(lat, lon, 400, 200);

  gsap.to(camera.position, {
    duration: 1.2, // Reduced from 2 seconds to 1.2 seconds
    x: x,
    y: -y,
    z: 500,
    ease: "power3.inOut" // Improved easing for smoother transition
  });
}

function meteorExplosion(lat, lon) {
  const { x, y } = latLonToXY(lat, lon, 400, 200);

  // Play explosion sound
  playExplosionSound();

  const geometry = new THREE.CircleGeometry(5, 32);
  const material = new THREE.MeshBasicMaterial({
    color: 0xff6600,
    transparent: true,
    opacity: 0.8
  });

  const explosion = new THREE.Mesh(geometry, material);
  explosion.position.set(x, -y, 2);
  scene.add(explosion);

  setTimeout(() => {
    explosion.material.color.set(0x000000);
  }, 2000);
}

function fireAndSmoke(lat, lon) {
  const { x, y } = latLonToXY(lat, lon, 400, 200);

  const fireGeo = new THREE.CircleGeometry(5, 32);
  const fireMat = new THREE.MeshBasicMaterial({
    color: 0xff3300,
    transparent: true,
    opacity: 0.8
  });
  const fire = new THREE.Mesh(fireGeo, fireMat);
  fire.position.set(x, -y, 2);
  scene.add(fire);

  gsap.to(fire.material, { duration: 2, opacity: 0.5, repeat: -1, yoyo: true });

  const smokeGeo = new THREE.CircleGeometry(6, 32);
  const smokeMat = new THREE.MeshBasicMaterial({
    color: 0x888888,
    transparent: true,
    opacity: 0.4
  });
  const smoke = new THREE.Mesh(smokeGeo, smokeMat);
  smoke.position.set(x, -y, 1.5);
  scene.add(smoke);

  gsap.to(smoke.position, {
    duration: 3,
    y: -y + 10,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });
  gsap.to(smoke.material, { duration: 3, opacity: 0, repeat: -1, yoyo: true });
}

function createTailTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 64;

  const ctx = canvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, 0, 64);

  gradient.addColorStop(0, "rgba(255, 150, 0, 1)");
  gradient.addColorStop(0.5, "rgba(255, 80, 0, 0.8)");
  gradient.addColorStop(1, "rgba(255, 0, 0, 0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1, 64);

  return new THREE.CanvasTexture(canvas);
}

function dropMeteor(lat, lon) {
  const { x, y } = latLonToXY(lat, lon, 400, 200);

  const tailGeo = new THREE.PlaneGeometry(2 * 2, 2 * 6);
  const tailMat = new THREE.MeshBasicMaterial({
    map: createTailTexture(),
    transparent: true
  });
  const tail = new THREE.Mesh(tailGeo, tailMat);
  tail.position.set(x + 80, -y + 80, 4.5);
  scene.add(tail);

  const loader = new THREE.GLTFLoader();
  loader.load(
    "../3D_models/Asteroid_2d.glb",
    (gltf) => {
      const meteor = gltf.scene;
      meteor.scale.set(2, 2, 2);
      meteor.position.set(x + 80, -y + 80, 5);
      scene.add(meteor);

      const angle = Math.atan2(-y - (-y + 80), x - (x + 80));
      meteor.rotation.z = angle - Math.PI / 2;
      tail.rotation.z = angle - Math.PI / 2;

      const offsetDistance = 2 * 3;
      const offsetX = Math.cos(angle) * offsetDistance;
      const offsetY = Math.sin(angle) * offsetDistance;
      meteor.position.x += offsetX;
      meteor.position.y += offsetY;

      gsap.to(meteor.position, {
        duration: 1.2, // Reduced from 1.8 seconds to 1.2 seconds
        x: x + offsetX,
        y: -y + offsetY,
        ease: "power3.in" // Improved easing
      });

      gsap.to(tail.position, {
        duration: 1.2, // Reduced from 1.8 seconds to 1.2 seconds
        x: x,
        y: -y,
        ease: "power3.in", // Improved easing
        onComplete: () => {
          scene.remove(meteor);
          scene.remove(tail);
          meteorExplosion(lat, lon);
          fireAndSmoke(lat, lon);
          
          // Show impact analysis panel after impact
          const params = getUrlParams();
          if (params.asteroidName) {
            const asteroidData = {
              name: params.asteroidName,
              diameter: parseFloat(params.asteroidDiameter) || 0.5,
              velocity: (parseFloat(params.asteroidVelocity) || 25) * 1000 // Convert km/s to m/s
            };
            const cityData = {
              name: params.city,
              lat: parseFloat(params.lat),
              lng: parseFloat(params.lng),
              country: params.country
            };
            showImpactPanel(asteroidData, cityData);
          }
        }
      });
    },
    undefined,
    (error) => {
      console.error("Error loading asteroid model:", error);
    }
  );
}

document.getElementById("searchBox").addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    // Search functionality is now handled by the React app
    // This map page receives city data via URL parameters
    alert("Please use the city search in the main application to select a target city.");
  }
});

function animate() {
  requestAnimationFrame(animate);

  const halfMapWidth = 400 / 2;
  const halfMapHeight = 200 / 2;
  const margin = 5;

  const minX = -halfMapWidth + margin;
  const maxX = halfMapWidth - margin;
  const minY = -halfMapHeight + margin;
  const maxY = halfMapHeight - margin;

  camera.position.x = Math.min(Math.max(camera.position.x, minX), maxX);
  camera.position.y = Math.min(Math.max(camera.position.y, minY), maxY);

  const aspect = window.innerWidth / window.innerHeight;
  const d = 100;
  const minZoomToFit = Math.max(
    400 / (2 * d * aspect),
    200 / (2 * d)
  );
  controls.minZoom = minZoomToFit;

  controls.update();
  renderer.render(scene, camera);
}

// Function to get URL parameters
function getUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    city: urlParams.get('city'),
    lat: urlParams.get('lat'),
    lng: urlParams.get('lng'),
    country: urlParams.get('country'),
    asteroidName: urlParams.get('asteroidName'),
    asteroidDiameter: urlParams.get('asteroidDiameter'),
    asteroidVelocity: urlParams.get('asteroidVelocity')
  };
}

// Function to automatically start asteroid animation with passed city
function autoStartAsteroidAnimation() {
  const params = getUrlParams();
  
  if (params.city && params.lat && params.lng) {
    const lat = parseFloat(params.lat);
    const lng = parseFloat(params.lng);
    
    // Set the search box value
    document.getElementById('searchBox').value = params.city;
    
    // Add city marker
    addCityMarker(lat, lng, params.city);
    
    // Zoom to city
    zoomToCity(lat, lng);
    
    // Start the asteroid animation after a short delay
    setTimeout(() => {
      dropMeteor(lat, lng);
    }, 1200); // Reduced delay from 2000ms to 1200ms to match zoom duration
  }
}

MapMadness();
animate();

// Auto-start asteroid animation if city data is provided
autoStartAsteroidAnimation();

// Back to Earth functionality
function setupBackToEarthButton() {
  const backToEarthBtn = document.getElementById('backToEarthBtn');
  
  if (backToEarthBtn) {
    backToEarthBtn.addEventListener('click', () => {
      // Add a smooth transition effect before navigating
      backToEarthBtn.style.transform = 'scale(0.95)';
      backToEarthBtn.style.opacity = '0.7';
      
      // Navigate back to the main Earth visualization
      setTimeout(() => {
        // Check if we're in a subdirectory or root
        const basePath = window.location.pathname.includes('/public/') ? '../' : './';
        window.location.href = basePath + 'index.html';
      }, 150); // Short delay for visual feedback
    });
  }
}

// Mock impact calculation for fallback
function calculateMockImpact(impactData) {
  const { diameter_m, velocity_kms, lat, lon } = impactData;
  
  // Basic impact calculations using simplified physics
  const mass = (4/3) * Math.PI * Math.pow(diameter_m / 2, 3) * 3000; // Assume 3000 kg/m³ density
  const velocity_ms = velocity_kms * 1000;
  const energy_joules = 0.5 * mass * Math.pow(velocity_ms, 2);
  
  // Simplified crater calculations
  const crater_diameter_km = Math.pow(energy_joules / 1e12, 0.294) * 0.8; // Simplified scaling
  const blast_radius_km = crater_diameter_km * 3; // Rough approximation
  const earthquake_magnitude = Math.log10(energy_joules / 1e6) * 0.67 + 4.5; // Simplified formula
  
  return {
    results: {
      energy_joules: energy_joules,
      crater_diameter_km: Math.max(crater_diameter_km, 0.01),
      crater_diameter_m: Math.max(crater_diameter_km * 1000, 10),
      blast_radius_km: Math.max(blast_radius_km, 0.1),
      earthquake_magnitude: Math.max(earthquake_magnitude, 1.0)
    },
    volcanic_impact: {
      is_affected: false,
      volcano_name: null,
      impact_level: 'none'
    },
    location: {
      is_water: Math.random() > 0.7, // Random for demo
      elevation_m: Math.random() * 1000,
      is_water_source: false
    },
    geojson: null
  };
}

// Impact Analysis API Functions
async function calculateImpact(impactData) {
  try {
    const response = await fetch('https://nasaproject-production.up.railway.app/impact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(impactData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    // Validate that the result has the expected structure
    if (!result || !result.results) {
      console.warn('API returned unexpected structure, using mock calculation');
      return calculateMockImpact(impactData);
    }
    
    return result;
  } catch (error) {
    console.error('Error calculating impact:', error);
    console.log('Falling back to mock calculation');
    return calculateMockImpact(impactData);
  }
}

// Gemini AI Integration for Accessible Impact Analysis
class GeminiService {
  constructor() {
    // Try to get API key from global variable set by React app, localStorage, or environment
    this.apiKey = window.geminiApiKey || localStorage.getItem('gemini_api_key') || 'AIzaSyDJn3VEryqDiZ38BYUfFBp6pR1rK9PTyK8';
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';
    console.log('GeminiService initialized with URL:', this.baseUrl);
  }

  // Method to update API key dynamically
  setApiKey(apiKey) {
    this.apiKey = apiKey;
    localStorage.setItem('gemini_api_key', apiKey);
  }

  async generateImpactAnalysis(impactData, asteroidData, cityData) {
    try {
      if (!this.apiKey) {
        throw new Error('Gemini API key not configured. Please configure it in the main application or set it manually in the map.js file.');
      }

      const prompt = this.buildAnalysisPrompt(impactData, asteroidData, cityData);
      const fullUrl = `${this.baseUrl}?key=${this.apiKey}`;
      console.log('Making Gemini API call to:', fullUrl);
      
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.candidates || !result.candidates[0] || !result.candidates[0].content) {
        throw new Error('Invalid response from Gemini API');
      }

      const aiResponse = result.candidates[0].content.parts[0].text;
      
      return this.parseAIResponse(aiResponse, impactData);
    } catch (error) {
      console.error('Error generating impact analysis with Gemini:', error);
      throw error;
    }
  }

  buildAnalysisPrompt(impactData, asteroidData, cityData) {
    const { results, volcanic_impact, location } = impactData;
    
    return `
You are a scientific communication expert specializing in making complex impact analysis data accessible to both scientists and the general public. 

**ASTEROID IMPACT DATA:**
- Asteroid: "${asteroidData.name || 'Unnamed Asteroid'}"
- Size: ${asteroidData.diameter || 0.5} km diameter
- Velocity: ${((asteroidData.velocity || 25000) / 1000).toFixed(1)} km/s
- Target: ${cityData.name}, ${cityData.country || 'Unknown Country'}

**TECHNICAL IMPACT ANALYSIS:**
- Energy Release: ${(results.energy_joules / 1e15).toFixed(2)} × 10¹⁵ Joules (${(results.energy_joules / (4.184e9) / 1e6).toFixed(1)} Megatons TNT)
- Crater Diameter: ${results.crater_diameter_km.toFixed(2)} km
- Blast Radius: ${results.blast_radius_km.toFixed(1)} km
- Earthquake Magnitude: ${results.earthquake_magnitude.toFixed(1)} Richter scale
- Impact Surface: ${location.is_water ? 'Water (Ocean/Sea)' : 'Land'}
- Volcanic Trigger: ${volcanic_impact.is_affected ? `Yes - ${volcanic_impact.volcano_name}` : 'No'}

**TASK:**
Transform this technical data into a comprehensive, accessible impact analysis with the following structure:

**SCIENTIFIC SUMMARY:** (for researchers and professionals)
- Precise technical details
- Comparative analysis with historical events
- Environmental and geological implications
- Research significance

**PUBLIC IMPACT ASSESSMENT:** (for general audience)
- Real-world consequences in simple terms
- Comparison to familiar events (wars, natural disasters, etc.)
- Regional and global effects
- Human impact and safety implications

**SCIENTIFIC CONTEXT:** (educational content)
- How this compares to other known impacts
- What scientists would study
- Long-term environmental effects
- Planetary defense implications

**SAFETY & RESPONSE:** (practical information)
- Immediate effects and timeline
- Evacuation considerations
- Infrastructure damage assessment
- Recovery implications

Please format your response as a JSON object with these exact keys:
{
  "scientificSummary": "Detailed technical analysis...",
  "publicImpact": "Accessible explanation...",
  "scientificContext": "Educational content...",
  "safetyResponse": "Practical information...",
  "comparisonEvents": ["Event 1", "Event 2", "Event 3"],
  "riskLevel": "Low|Moderate|High|Extreme",
  "keyFindings": ["Finding 1", "Finding 2", "Finding 3"]
}

Make the content engaging, accurate, and appropriate for both audiences. Use analogies and comparisons to help people understand the scale and implications.
    `.trim();
  }

  parseAIResponse(aiResponse, originalImpactData) {
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }

      const parsedData = JSON.parse(jsonMatch[0]);
      
      const requiredFields = ['scientificSummary', 'publicImpact', 'scientificContext', 'safetyResponse'];
      for (const field of requiredFields) {
        if (!parsedData[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      return {
        ...parsedData,
        originalData: originalImpactData,
        generatedAt: new Date().toISOString(),
        source: 'gemini-ai'
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return this.createFallbackResponse(aiResponse, originalImpactData);
    }
  }

  createFallbackResponse(aiResponse, originalImpactData) {
    return {
      scientificSummary: aiResponse.substring(0, 500) + '...',
      publicImpact: aiResponse.substring(500, 1000) + '...',
      scientificContext: aiResponse.substring(1000, 1500) + '...',
      safetyResponse: aiResponse.substring(1500) || 'Safety assessment not available.',
      comparisonEvents: ['Tunguska Event (1908)', 'Chicxulub Impact (65 MYA)'],
      riskLevel: 'Moderate',
      keyFindings: [
        'Impact analysis completed',
        'Technical data processed',
        'AI analysis generated'
      ],
      originalData: originalImpactData,
      generatedAt: new Date().toISOString(),
      source: 'gemini-ai-fallback'
    };
  }
}

const geminiService = new GeminiService();

function formatImpactAnalysis(impactResult) {
  if (!impactResult) return null;

  const { results, volcanic_impact, location, geojson } = impactResult;

  // Validate that results object exists and has required properties
  if (!results) {
    console.error('Impact calculation failed: results object is missing');
    return null;
  }

  // Check for required properties with fallback values
  const energyJoules = results.energy_joules || 1e15; // Default fallback
  const craterDiameterKm = results.crater_diameter_km || 0.1;
  const blastRadiusKm = results.blast_radius_km || 1;
  const earthquakeMagnitude = results.earthquake_magnitude || 2.0;

  // Log the actual data structure for debugging
  console.log('Impact result structure:', {
    results: results,
    volcanic_impact: volcanic_impact,
    location: location,
    hasEnergyJoules: 'energy_joules' in results,
    hasCraterDiameter: 'crater_diameter_km' in results,
    hasBlastRadius: 'blast_radius_km' in results,
    hasEarthquakeMag: 'earthquake_magnitude' in results
  });

  let severity = 'Low';
  let severityColor = '#00ff88';
  let description = 'Minor local impact';

  if (energyJoules > 1e20) {
    severity = 'Extreme';
    severityColor = '#ff0000';
    description = 'Global catastrophic event';
  } else if (energyJoules > 1e19) {
    severity = 'High';
    severityColor = '#ff8800';
    description = 'Regional devastation';
  } else if (energyJoules > 1e18) {
    severity = 'Moderate';
    severityColor = '#ffaa00';
    description = 'Significant local damage';
  }

  // Format energy in more readable units
  const energyTNT = energyJoules / (4.184e9); // Convert to TNT equivalent
  let energyDisplay = '';
  if (energyTNT >= 1e6) {
    energyDisplay = `${(energyTNT / 1e6).toFixed(1)} Megatons TNT`;
  } else if (energyTNT >= 1e3) {
    energyDisplay = `${(energyTNT / 1e3).toFixed(1)} Kilotons TNT`;
  } else {
    energyDisplay = `${energyTNT.toFixed(1)} Tons TNT`;
  }

  return {
    severity: {
      level: severity,
      color: severityColor,
      description: description
    },
    energy: {
      joules: energyJoules,
      tntEquivalent: energyTNT,
      display: energyDisplay
    },
    crater: {
      diameterKm: craterDiameterKm,
      diameterM: results.crater_diameter_m
    },
    blast: {
      radiusKm: blastRadiusKm
    },
    earthquake: {
      magnitude: earthquakeMagnitude
    },
    volcanic: {
      isAffected: volcanic_impact.is_affected,
      volcanoName: volcanic_impact.volcano_name,
      impactLevel: volcanic_impact.impact_level
    },
    location: {
      isWater: location.is_water,
      elevation: location.elevation_m,
      waterSource: location.is_water_source
    },
    geojson: geojson,
    summary: {
      craterSize: craterDiameterKm > 1 ? `${craterDiameterKm.toFixed(1)} km crater` : `${results.crater_diameter_m.toFixed(0)} m crater`,
      blastZone: `${blastRadiusKm.toFixed(0)} km blast radius`,
      earthquake: `Magnitude ${earthquakeMagnitude.toFixed(1)} earthquake`,
      volcanic: volcanic_impact.is_affected ? `Volcanic activity triggered at ${volcanic_impact.volcano_name}` : 'No volcanic activity triggered'
    }
  };
}

function showImpactPanel(asteroidData, cityData) {
  const panel = document.getElementById('impactPanel');
  const subtitle = document.getElementById('impactSubtitle');
  const content = document.getElementById('impactContent');
  
  // Update subtitle
  subtitle.textContent = `${asteroidData.name || 'Asteroid'} → ${cityData.name}`;
  
  // Show panel
  panel.classList.add('visible');
  
  // Calculate impact analysis
  calculateImpactAnalysis(asteroidData, cityData);
}

async function calculateImpactAnalysis(asteroidData, cityData) {
  const content = document.getElementById('impactContent');
  
  try {
    const impactRequestData = {
      diameter_m: (asteroidData.diameter || 0.5) * 1000, // Convert km to m
      velocity_kms: (asteroidData.velocity || 25000) / 1000, // Convert m/s to km/s
      lat: cityData.lat,
      lon: cityData.lng,
      delta_km: 1000 // Default search radius
    };

    console.log('Calculating impact with data:', impactRequestData);
    const result = await calculateImpact(impactRequestData);
    
    console.log('Impact calculation result:', result);
    
    // Validate the result structure
    if (!result || typeof result !== 'object') {
      throw new Error('Invalid response from impact calculation API');
    }
    
    const formattedAnalysis = formatImpactAnalysis(result);
    
    if (!formattedAnalysis) {
      throw new Error('Failed to format impact analysis data');
    }
    
    // Store impact data for visualization
    impactData = formattedAnalysis;
    
    // Display the analysis with Gemini AI enhancement
    await displayEnhancedImpactAnalysis(result, asteroidData, cityData);
    
  } catch (error) {
    console.error('Failed to calculate impact:', error);
    content.innerHTML = `
      <div class="error-message">
        <strong>Impact Analysis Error</strong><br>
        Failed to calculate impact analysis: ${error.message}<br><br>
        <small>This might be due to:<br>
        • Network connectivity issues<br>
        • API service temporarily unavailable<br>
        • Invalid asteroid or city data<br><br>
        Please try again or check the console for more details.</small>
      </div>
    `;
  }
}

// Enhanced impact analysis display with Gemini AI integration
async function displayEnhancedImpactAnalysis(impactResult, asteroidData, cityData) {
  const content = document.getElementById('impactContent');
  
  // Show loading state
  content.innerHTML = `
    <div class="loading-spinner">
      <div class="spinner"></div>
    </div>
  `;

  try {
    // Generate Gemini AI analysis
    const geminiAnalysis = await geminiService.generateImpactAnalysis(impactResult, asteroidData, cityData);
    
    // Create tabbed interface
    content.innerHTML = `
      <div class="tab-container">
        <div class="tab-buttons">
          <button class="tab-btn active" onclick="switchTab('public', this)">Public</button>
          <button class="tab-btn" onclick="switchTab('scientific', this)">Scientific</button>
          <button class="tab-btn" onclick="switchTab('technical', this)">Technical</button>
        </div>
        
        <div id="public-tab" class="tab-content active">
          ${generatePublicTab(geminiAnalysis, impactResult)}
        </div>
        
        <div id="scientific-tab" class="tab-content">
          ${generateScientificTab(geminiAnalysis, impactResult)}
        </div>
        
        <div id="technical-tab" class="tab-content">
          ${generateTechnicalTab(impactResult, asteroidData, cityData)}
        </div>
      </div>
    `;
    
  } catch (error) {
    console.error('Failed to generate enhanced analysis:', error);
    // Fallback to original display
    const formattedAnalysis = formatImpactAnalysis(impactResult);
    displayImpactAnalysis(formattedAnalysis, cityData);
  }
}

function switchTab(tabName, buttonElement) {
  // Remove active class from all tabs and buttons
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
  
  // Add active class to clicked button and corresponding content
  buttonElement.classList.add('active');
  document.getElementById(`${tabName}-tab`).classList.add('active');
}

function generatePublicTab(geminiAnalysis, impactResult) {
  const riskColor = {
    'Low': '#00ff88',
    'Moderate': '#ffaa00', 
    'High': '#ff8800',
    'Extreme': '#ff0000'
  };

  return `
    <div class="severity-badge" style="background: ${riskColor[geminiAnalysis.riskLevel] || '#666'}">
      ${geminiAnalysis.riskLevel || 'Moderate'} Risk
    </div>

    <div class="section">
      <div class="section-title">🌍 Public Impact Assessment</div>
      <div class="section-content">
        ${geminiAnalysis.publicImpact || 'Impact assessment in progress...'}
      </div>
    </div>

    <div class="section">
      <div class="section-title">🛡️ Safety & Response</div>
      <div class="section-content">
        ${geminiAnalysis.safetyResponse || 'Safety assessment in progress...'}
      </div>
    </div>

    <div class="section">
      <div class="section-title">📊 Key Findings</div>
      <div class="key-findings">
        ${(geminiAnalysis.keyFindings || []).map(finding => 
          `<div class="finding-item">${finding}</div>`
        ).join('')}
      </div>
    </div>

    ${geminiAnalysis.comparisonEvents ? `
    <div class="section">
      <div class="section-title">🔍 Similar Events</div>
      <div class="comparison-events">
        ${geminiAnalysis.comparisonEvents.map(event => 
          `<span class="comparison-item">${event}</span>`
        ).join('')}
      </div>
    </div>
    ` : ''}
  `;
}

function generateScientificTab(geminiAnalysis, impactResult) {
  return `
    <div class="section">
      <div class="section-title">🔬 Scientific Summary</div>
      <div class="section-content">
        ${geminiAnalysis.scientificSummary || 'Scientific analysis in progress...'}
      </div>
    </div>

    <div class="section">
      <div class="section-title">📚 Scientific Context</div>
      <div class="section-content">
        ${geminiAnalysis.scientificContext || 'Context analysis in progress...'}
      </div>
    </div>

    <div class="section">
      <div class="section-title">📊 Key Findings</div>
      <div class="key-findings">
        ${(geminiAnalysis.keyFindings || []).map(finding => 
          `<div class="finding-item">${finding}</div>`
        ).join('')}
      </div>
    </div>
  `;
}

function generateTechnicalTab(impactResult, asteroidData, cityData) {
  const results = impactResult?.results || {};
  const volcanic = impactResult?.volcanic_impact || { is_affected: false, volcano_name: null, impact_level: 'none' };
  const location = impactResult?.location || { is_water: false, elevation_m: 0, is_water_source: false };

  const formatEnergy = (joules) => {
    if (!joules || joules <= 0) return 'Unknown';
    const tntEquivalent = joules / (4.184e9);
    if (tntEquivalent >= 1e6) {
      return `${(tntEquivalent / 1e6).toFixed(1)} Megatons TNT`;
    } else if (tntEquivalent >= 1e3) {
      return `${(tntEquivalent / 1e3).toFixed(1)} Kilotons TNT`;
    } else {
      return `${tntEquivalent.toFixed(1)} Tons TNT`;
    }
  };

  return `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Energy Release</div>
        <div class="stat-value" style="color: #00e5ff">${formatEnergy(results.energy_joules)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Crater Diameter</div>
        <div class="stat-value" style="color: #ff4757">${(results.crater_diameter_km || 0).toFixed(1)} km</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Blast Radius</div>
        <div class="stat-value" style="color: #ff8800">${(results.blast_radius_km || 0).toFixed(0)} km</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Earthquake</div>
        <div class="stat-value" style="color: #ffaa00">M${(results.earthquake_magnitude || 0).toFixed(1)}</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">🎯 Impact Parameters</div>
      <div class="section-content">
        <div style="margin-bottom: 10px;">
          <strong>Asteroid Size:</strong> ${asteroidData?.diameter || 0.5} km diameter
        </div>
        <div style="margin-bottom: 10px;">
          <strong>Velocity:</strong> ${((asteroidData?.velocity || 25000) / 1000).toFixed(1)} km/s
        </div>
        <div style="margin-bottom: 10px;">
          <strong>Target:</strong> ${cityData?.name || 'Unknown'}, ${cityData?.country || 'Unknown'}
        </div>
        <div style="margin-bottom: 10px;">
          <strong>Coordinates:</strong> ${(cityData?.lat || 0).toFixed(4)}°, ${(cityData?.lng || 0).toFixed(4)}°
        </div>
        <div>
          <strong>Surface:</strong> ${location.is_water ? 'Water' : 'Land'}
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Impact Zones</div>
      <div class="impact-zone">
        <div class="zone-title">Primary Impact Zone</div>
        <div class="zone-stats">
          <div class="zone-stat">
            <span class="label">Crater Diameter:</span>
            <span class="value">${(results.crater_diameter_km || 0).toFixed(1)} km</span>
          </div>
          <div class="zone-stat">
            <span class="label">Blast Radius:</span>
            <span class="value">${(results.blast_radius_km || 0).toFixed(0)} km</span>
          </div>
          <div class="zone-stat">
            <span class="label">Earthquake Mag:</span>
            <span class="value">${(results.earthquake_magnitude || 0).toFixed(1)}</span>
          </div>
          <div class="zone-stat">
            <span class="label">Energy:</span>
            <span class="value">${formatEnergy(results.energy_joules)}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Volcanic Activity</div>
      <div class="volcanic-info ${volcanic.is_affected ? 'affected' : ''}">
        <div class="volcanic-title">
          ${volcanic.is_affected ? 'Volcanic Trigger' : 'No Volcanic Activity'}
        </div>
        <div class="volcanic-details">
          ${volcanic.is_affected 
            ? `Volcanic activity triggered at ${volcanic.volcano_name}`
            : 'Impact will not trigger volcanic activity'
          }
        </div>
      </div>
    </div>
  `;
}

function displayImpactAnalysis(analysis, cityData) {
  const content = document.getElementById('impactContent');
  
  content.innerHTML = `
    <div class="severity-badge" style="background: ${analysis.severity.color}">
      ${analysis.severity.level} Impact
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Energy Release</div>
        <div class="stat-value" style="color: #00e5ff">${analysis.energy.display}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Crater Diameter</div>
        <div class="stat-value" style="color: #ff4757">${analysis.summary.craterSize}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Blast Radius</div>
        <div class="stat-value" style="color: #ff8800">${analysis.summary.blastZone}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Earthquake</div>
        <div class="stat-value" style="color: #ffaa00">M${analysis.earthquake.magnitude.toFixed(1)}</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Impact Zones</div>
      <div class="impact-zone">
        <div class="zone-title">Primary Impact Zone</div>
        <div class="zone-stats">
          <div class="zone-stat">
            <span class="label">Crater Diameter:</span>
            <span class="value">${analysis.crater.diameterKm.toFixed(1)} km</span>
          </div>
          <div class="zone-stat">
            <span class="label">Blast Radius:</span>
            <span class="value">${analysis.blast.radiusKm.toFixed(0)} km</span>
          </div>
          <div class="zone-stat">
            <span class="label">Earthquake Mag:</span>
            <span class="value">${analysis.earthquake.magnitude.toFixed(1)}</span>
          </div>
          <div class="zone-stat">
            <span class="label">Energy:</span>
            <span class="value">${analysis.energy.display}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Volcanic Activity</div>
      <div class="volcanic-info ${analysis.volcanic.isAffected ? 'affected' : ''}">
        <div class="volcanic-title">
          ${analysis.volcanic.isAffected ? 'Volcanic Trigger' : 'No Volcanic Activity'}
        </div>
        <div class="volcanic-details">
          ${analysis.volcanic.isAffected 
            ? `Volcanic activity triggered at ${analysis.volcanic.volcanoName}`
            : 'Impact will not trigger volcanic activity'
          }
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Impact Location</div>
      <div class="location-info">
        <div class="location-title">Target Details</div>
        <div class="location-details">
          <div>Location: ${cityData.name}, ${cityData.country}</div>
          <div>Coordinates: ${cityData.lat.toFixed(4)}°, ${cityData.lng.toFixed(4)}°</div>
          <div>Surface: ${analysis.location.isWater ? 'Water' : 'Land'}</div>
          ${analysis.location.elevation ? `<div>Elevation: ${analysis.location.elevation} m</div>` : ''}
        </div>
      </div>
    </div>
  `;
}


// Setup impact panel close button
function setupImpactPanel() {
  const closeButton = document.getElementById('closeImpactPanel');
  const panel = document.getElementById('impactPanel');
  
  if (closeButton) {
    closeButton.addEventListener('click', () => {
      panel.classList.remove('visible');
    });
  }
}

// Initialize the back to Earth button
setupBackToEarthButton();
setupImpactPanel();
