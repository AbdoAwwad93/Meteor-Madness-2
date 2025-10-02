let scene, camera, renderer, controls, map, citiesData = [];
let targetCityMarker = null;
let impactData = null;

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

async function loadCities() {
  try {
    const res = await fetch("../data/cities.json");
    citiesData = await res.json();
    document.getElementById("searchBox").disabled = false;
  } catch (err) {
    alert("Failed to load cities.json");
  }
}
loadCities();

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
    const query = e.target.value.toLowerCase();
    const city = citiesData.find(c => c.name.toLowerCase().includes(query));

    if (city) {
      addCityMarker(city.lat, city.lng, city.name);
      zoomToCity(city.lat, city.lng);
      dropMeteor(city.lat, city.lng);
    } else {
      alert("City not found!");
    }
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
    return result;
  } catch (error) {
    console.error('Error calculating impact:', error);
    throw error;
  }
}

function formatImpactAnalysis(impactResult) {
  if (!impactResult) return null;

  const { results, volcanic_impact, location, geojson } = impactResult;

  // Determine impact severity based on energy and crater size
  const energyJoules = results.energy_joules;
  const craterDiameterKm = results.crater_diameter_km;
  const blastRadiusKm = results.blast_radius_km;
  const earthquakeMagnitude = results.earthquake_magnitude;

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

    const result = await calculateImpact(impactRequestData);
    const formattedAnalysis = formatImpactAnalysis(result);
    
    // Store impact data for visualization
    impactData = formattedAnalysis;
    
    // Display the analysis
    displayImpactAnalysis(formattedAnalysis, cityData);
    
  } catch (error) {
    console.error('Failed to calculate impact:', error);
    content.innerHTML = `
      <div class="error-message">
        Failed to calculate impact analysis. Please try again.
      </div>
    `;
  }
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
