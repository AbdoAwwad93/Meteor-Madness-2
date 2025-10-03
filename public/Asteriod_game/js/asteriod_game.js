let scene, camera, renderer, controls, earth, clouds, moon, stars, asteroid;
let citiesData = [];
let targetCityMarker = null;

const asteroidModels = [
  { name: "Iron Asteroid", file: "Asteroid_1c_Iron.glb" },
  { name: "Rocky Asteroid", file: "Asteroid_1e.glb" },
  { name: "Carbon Asteroid", file: "Asteroid_2a.glb" },
  { name: "Ice Asteroid", file: "Asteroid_2d.glb" }
];

let currentAsteroidIndex = 0;
let selectedAsteroidSize = 1;
let previewScene, previewCamera, previewRenderer;
let previewAsteroid;

let menuPreviewScenes = [];
let menuPreviewRenderers = [];
let tempAsteroidIndex = 0;
let tempAsteroidSize = 1;



function initAsteroidSelection() {
  previewScene = new THREE.Scene();
  
  previewCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  previewCamera.position.set(0, 2, 5);
  previewCamera.lookAt(0, 0, 0);

  const container = document.getElementById('asteroidPreview');
  previewRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  previewRenderer.setSize(400, 400);
  previewRenderer.setClearColor(0x000000, 0);
  container.appendChild(previewRenderer.domElement);

  const ambLight = new THREE.AmbientLight(0xffffff, 0.5);
  previewScene.add(ambLight);
  
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(5, 5, 5);
  previewScene.add(dirLight);

  loadPreviewAsteroid(currentAsteroidIndex);

  document.getElementById('prevAsteroid').addEventListener('click', () => {
    currentAsteroidIndex = (currentAsteroidIndex - 1 + asteroidModels.length) % asteroidModels.length;
    loadPreviewAsteroid(currentAsteroidIndex);
  });

  document.getElementById('nextAsteroid').addEventListener('click', () => {
    currentAsteroidIndex = (currentAsteroidIndex + 1) % asteroidModels.length;
    loadPreviewAsteroid(currentAsteroidIndex);
  });

  const sizeSlider = document.getElementById('sizeSlider');
  const sizeValue = document.getElementById('sizeValue');
  
  sizeSlider.addEventListener('input', (e) => {
    selectedAsteroidSize = parseFloat(e.target.value);
    sizeValue.textContent = selectedAsteroidSize + 'x';
    
    if (previewAsteroid) {
      previewAsteroid.scale.set(selectedAsteroidSize, selectedAsteroidSize, selectedAsteroidSize);
    }
  });

  document.getElementById('launchBtn').addEventListener('click', startSimulation);

  animatePreview();
}

function loadPreviewAsteroid(index) {
  if (previewAsteroid) {
    previewScene.remove(previewAsteroid);
  }

  const model = asteroidModels[index];
  document.getElementById('asteroidName').textContent = model.name;

  const loader = new THREE.GLTFLoader();
  loader.load(
    `../../3D_models/${model.file}`,
    (gltf) => {
      previewAsteroid = gltf.scene;
      previewAsteroid.scale.set(selectedAsteroidSize, selectedAsteroidSize, selectedAsteroidSize);
      previewScene.add(previewAsteroid);
    },
    undefined,
    (error) => {
      console.error('Error loading asteroid:', error);
      
      const geometry = new THREE.SphereGeometry(1, 16, 16);
      const material = new THREE.MeshStandardMaterial({
        color: 0x888888,
        roughness: 0.9,
        metalness: 0.1
      });
      previewAsteroid = new THREE.Mesh(geometry, material);
      previewAsteroid.scale.set(selectedAsteroidSize, selectedAsteroidSize, selectedAsteroidSize);
      previewScene.add(previewAsteroid);
    }
  );
}

function animatePreview() {
  requestAnimationFrame(animatePreview);
  
  if (previewAsteroid) {
    previewAsteroid.rotation.y += 0.01;
    previewAsteroid.rotation.x += 0.005;
  }
  
  previewRenderer.render(previewScene, previewCamera);
}

function startSimulation() {
  document.getElementById('asteroidSelection').style.display = 'none';
  document.getElementById('mainScreen').style.display = 'block';
  
  MeteorMadness();
  loadCities().then((cities) => {
    citiesData = cities;
  });
  animate();
  initAsteroidMenu();
}



function initAsteroidMenu() {
  asteroidModels.forEach((model, index) => {
    const container = document.getElementById(`option-${index}`);
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.set(0, 1, 3);
    camera.lookAt(0, 0, 0);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(100, 100);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    
    const ambLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(3, 3, 3);
    scene.add(dirLight);
    
    const loader = new THREE.GLTFLoader();
    loader.load(
      `../../3D_models/${model.file}`,
      (gltf) => {
        const ast = gltf.scene;
        ast.scale.set(0.8, 0.8, 0.8);
        scene.add(ast);
        scene.userData.asteroid = ast;
      },
      undefined,
      (error) => {
        const geometry = new THREE.SphereGeometry(0.5, 16, 16);
        const material = new THREE.MeshStandardMaterial({ color: 0x888888 });
        const ast = new THREE.Mesh(geometry, material);
        scene.add(ast);
        scene.userData.asteroid = ast;
      }
    );
    
    menuPreviewScenes.push(scene);
    menuPreviewRenderers.push({ renderer, camera });
  });
  
  animateMenuPreviews();
  
  document.querySelectorAll('.asteroid-option').forEach(option => {
    option.addEventListener('click', () => {
      document.querySelectorAll('.asteroid-option').forEach(opt => 
        opt.classList.remove('selected'));
      option.classList.add('selected');
      tempAsteroidIndex = parseInt(option.dataset.index);
    });
  });
  
  const sizeSliderMenu = document.getElementById('sizeSliderMenu');
  const sizeValueMenu = document.getElementById('sizeValueMenu');
  
  sizeSliderMenu.addEventListener('input', (e) => {
    tempAsteroidSize = parseFloat(e.target.value);
    sizeValueMenu.textContent = tempAsteroidSize + 'x';
  });
  
  document.getElementById('changeAsteroidBtn').addEventListener('click', () => {
    document.getElementById('asteroidMenu').style.display = 'flex';
    tempAsteroidIndex = currentAsteroidIndex;
    tempAsteroidSize = selectedAsteroidSize;
    sizeSliderMenu.value = tempAsteroidSize;
    sizeValueMenu.textContent = tempAsteroidSize + 'x';
  });
  
  document.getElementById('confirmAsteroid').addEventListener('click', () => {
    currentAsteroidIndex = tempAsteroidIndex;
    selectedAsteroidSize = tempAsteroidSize;
    changeAsteroid();
    document.getElementById('asteroidMenu').style.display = 'none';
  });
  
  document.getElementById('cancelAsteroid').addEventListener('click', () => {
    document.getElementById('asteroidMenu').style.display = 'none';
  });
}

function animateMenuPreviews() {
  requestAnimationFrame(animateMenuPreviews);
  
  menuPreviewScenes.forEach((scene, index) => {
    if (scene.userData.asteroid) {
      scene.userData.asteroid.rotation.y += 0.01;
    }
    const { renderer, camera } = menuPreviewRenderers[index];
    renderer.render(scene, camera);
  });
}

function changeAsteroid() {
  if (asteroid) {
    scene.remove(asteroid);
  }
  
  const selectedModel = asteroidModels[currentAsteroidIndex];
  const loader = new THREE.GLTFLoader();
  
  loader.load(
    `../../3D_models/${selectedModel.file}`,
    (gltf) => {
      asteroid = gltf.scene;
      asteroid.scale.set(selectedAsteroidSize, selectedAsteroidSize, selectedAsteroidSize);
      asteroid.position.set(100, 0, 0);
      asteroid.name = "asteroid";
      scene.add(asteroid);
    },
    undefined,
    (error) => {
      console.error("Error loading asteroid model:", error);
      
      const asteroidGeometry = new THREE.SphereGeometry(1, 16, 16);
      const asteroidMaterial = new THREE.MeshStandardMaterial({
        color: 0x888888,
        roughness: 0.9,
        metalness: 0.1,
      });
      asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
      asteroid.scale.set(selectedAsteroidSize, selectedAsteroidSize, selectedAsteroidSize);
      asteroid.position.set(100, 0, 0);
      scene.add(asteroid);
    }
  );
}



function MeteorMadness() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
  );
  camera.position.set(0, 5, 25);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.minDistance = 7;
  controls.maxDistance = 100;

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(10, 10, 10);
  scene.add(directionalLight);

  const loader = new THREE.TextureLoader();

  const earthTexture = loader.load("../../textures/8k_earth_daymap.jpg");
  const bumpMap = loader.load("../../textures/8k_earth_nightmap.jpg");
  const specularMap = loader.load("../../textures/8k_earth_specular.jpeg");
  const cloudTexture = loader.load("../../textures/8k_earth_clouds.jpg");
  const moonTexture = loader.load("../../textures/8k_moon.jpg");

  const earthGeometry = new THREE.SphereGeometry(5, 64, 64);
  const earthMaterial = new THREE.MeshPhongMaterial({
    map: earthTexture,
    bumpMap: bumpMap,
    bumpScale: 0.05,
    specularMap: specularMap,
    specular: new THREE.Color("grey"),
  });
  earth = new THREE.Mesh(earthGeometry, earthMaterial);
  scene.add(earth);

  const cloudGeometry = new THREE.SphereGeometry(5.05, 64, 64);
  const cloudMaterial = new THREE.MeshPhongMaterial({
    map: cloudTexture,
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
  });
  clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
  scene.add(clouds);

  const moonGeometry = new THREE.SphereGeometry(1.3, 32, 32);
  const moonMaterial = new THREE.MeshPhongMaterial({ map: moonTexture });
  moon = new THREE.Mesh(moonGeometry, moonMaterial);
  moon.position.set(12, 0, 0);
  scene.add(moon);

  const starGeometry = new THREE.BufferGeometry();
  const starCount = 5000;
  const starPositions = [];
  for (let i = 0; i < starCount; i++) {
    let x = (Math.random() - 0.5) * 2000;
    let y = (Math.random() - 0.5) * 2000;
    let z = (Math.random() - 0.5) * 2000;
    starPositions.push(x, y, z);
  }
  starGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(starPositions, 3)
  );
  const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.7 });
  stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);

  const selectedModel = asteroidModels[currentAsteroidIndex];
  const Asteroidloader = new THREE.GLTFLoader();
  Asteroidloader.load(
    `../../3D_models/${selectedModel.file}`,
    (gltf) => {
      asteroid = gltf.scene;
      asteroid.scale.set(selectedAsteroidSize, selectedAsteroidSize, selectedAsteroidSize);
      asteroid.position.set(100, 0, 0);
      asteroid.name = "asteroid";
      scene.add(asteroid);
    },
    undefined,
    (error) => {
      console.error("Error loading asteroid model:", error);

      const asteroidGeometry = new THREE.SphereGeometry(1, 16, 16);
      const asteroidMaterial = new THREE.MeshStandardMaterial({
        color: 0x888888,
        roughness: 0.9,
        metalness: 0.1,
      });
      asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
      asteroid.scale.set(selectedAsteroidSize, selectedAsteroidSize, selectedAsteroidSize);
      asteroid.position.set(100, 0, 0);
      scene.add(asteroid);
    }
  );

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

async function loadCities() {
  const response = await fetch("../../data/cities.json");
  const cities = await response.json();
  return cities;
}

function latLonToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

document.getElementById("search").addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    const query = e.target.value.toLowerCase();
    const city = citiesData.find(c => c.name.toLowerCase().includes(query));

    if (city) {
      addCityMarker(city.lat, city.lng, city.name);
      zoomToCity(city.lat, city.lng);
    } else {
      alert("City not found!");
    }
  }
});

function addCityMarker(lat, lon, name) {
  earth.children = earth.children.filter(c => c.userData?.type !== "cityMarker");

  const pos = latLonToVector3(lat, lon, 5.1);
  const geometry = new THREE.SphereGeometry(0.15, 16, 16);
  const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const marker = new THREE.Mesh(geometry, material);
  marker.position.copy(pos);
  marker.userData = { type: "cityMarker", name };
  earth.add(marker);

  targetCityMarker = marker;
}

function zoomToCity(lat, lon) {
  const pos = latLonToVector3(lat, lon, 7);

  gsap.to(camera.position, {
    duration: 2,
    x: pos.x,
    y: pos.y,
    z: pos.z,
    onUpdate: () => camera.lookAt(0, 0, 0)
  });
}

document.getElementById("asteroidBtn").addEventListener("click", () => {
  if (targetCityMarker && asteroid) {
    const worldPos = new THREE.Vector3();
    targetCityMarker.getWorldPosition(worldPos);

    gsap.to(camera.position, {
      duration: 2,
      x: asteroid.position.x + 20,
      y: asteroid.position.y + 15,
      z: asteroid.position.z + 30,
      onUpdate: () => {
        camera.lookAt(0, 0, 0);
      },
      ease: "power2.inOut"
    });

    gsap.to(asteroid.position, {
      duration: 3,
      x: worldPos.x,
      y: worldPos.y,
      z: worldPos.z,
      ease: "power2.inOut"
    });
  } else {
    alert("Search for a city first!");
  }
});

function animate() {
  requestAnimationFrame(animate);

  earth.rotation.y += 0.0008;
  clouds.rotation.y += 0.001;

  let time = Date.now() * 0.0005;
  moon.position.set(Math.cos(time) * 12, 0, Math.sin(time) * 12);

  let dist = camera.position.length();
  clouds.material.opacity = THREE.MathUtils.clamp(
    1 - (25 - dist) / 15,
    0.2,
    0.8
  );

  scene.traverse(obj => {
    if (obj.userData?.type === "cityMarker") {
      const dist = camera.position.distanceTo(obj.getWorldPosition(new THREE.Vector3()));
      const scaleFactor = THREE.MathUtils.clamp(dist / 40, 0.05, 0.3);
      obj.scale.set(scaleFactor, scaleFactor, scaleFactor);
    }
  });

  controls.update();
  renderer.render(scene, camera);
}

initAsteroidSelection();