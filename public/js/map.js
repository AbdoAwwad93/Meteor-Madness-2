let scene, camera, renderer, controls, map, citiesData = [];
let targetCityMarker = null;

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
  loader.load("textures/8k_earth_daymap.jpg", (texture) => {
    const geometry = new THREE.PlaneGeometry(400, 200);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    map = new THREE.Mesh(geometry, material);
    scene.add(map);
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
    const res = await fetch("data/cities.json");
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
    duration: 2,
    x: x,
    y: -y,
    z: 500,
    ease: "power2.inOut"
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
    "3D_models/Asteroid_2d.glb",
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
        duration: 1.8,
        x: x + offsetX,
        y: -y + offsetY,
        ease: "power2.in"
      });

      gsap.to(tail.position, {
        duration: 1.8,
        x: x,
        y: -y,
        ease: "power2.in",
        onComplete: () => {
          scene.remove(meteor);
          scene.remove(tail);
          meteorExplosion(lat, lon);
          fireAndSmoke(lat, lon);
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
    country: urlParams.get('country')
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
    }, 2000); // 2 second delay to allow camera to zoom
  }
}

MapMadness();
animate();

// Auto-start asteroid animation if city data is provided
autoStartAsteroidAnimation();
