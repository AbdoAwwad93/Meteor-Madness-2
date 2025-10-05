let scene, camera, renderer, controls, earth, clouds, moon, stars, asteroid, satellite;
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

let missileModel = null;
let activeMissile = null;
let explosionParticles = [];
let asteroidFragments = [];
let isDefenseActive = false;
let selectedDefense = 'none';
let missionState = 'selection'; // 'selection', 'playing', 'completed'
let missionCompleted = false;

const particlePool = [];
const maxPoolSize = 50;

function getParticleFromPool() {
  if (particlePool.length > 0) {
    return particlePool.pop();
  }
  return new THREE.Mesh(
    sharedGeometries.particle,
    new THREE.MeshBasicMaterial({ transparent: true })
  );
}

function returnParticleToPool(particle) {
  if (particlePool.length < maxPoolSize) {
    particle.material.opacity = 1;
    particle.scale.set(1, 1, 1);
    particlePool.push(particle);
  } else {
    particle.material.dispose();
  }
}

const sharedGeometries = {
  particle: null,
  fragment: null,
  explosionSphere: null,
  fallbackAsteroid: null,
  cityMarker: null
};

function initSharedGeometries() {
  sharedGeometries.particle = new THREE.SphereGeometry(0.08, 3, 3);
  sharedGeometries.fragment = new THREE.SphereGeometry(0.35, 4, 4);
  sharedGeometries.explosionSphere = new THREE.SphereGeometry(1, 12, 12);
  sharedGeometries.fallbackAsteroid = new THREE.SphereGeometry(1, 12, 12);
  sharedGeometries.cityMarker = new THREE.SphereGeometry(0.15, 8, 8);
}

function cleanupSharedGeometries() {
  Object.values(sharedGeometries).forEach(geom => {
    if (geom) geom.dispose();
  });
}

function loadMissileModel() {
  const loader = new THREE.GLTFLoader();
  loader.load(
    '../../3D_models/saturn_v_-_nasa.glb',
    (gltf) => {
      missileModel = gltf.scene;
      missileModel.scale.set(0.07, 0.07, 0.07);
      console.log('Missile model loaded successfully');
      scene.remove(missileModel);
    },
    undefined,
    (error) => {
      console.error('Error loading missile model:', error);
      createSimpleMissile();
    }
  );
}

function createSimpleMissile() {
  const missileGroup = new THREE.Group();
  
  const bodyGeometry = new THREE.CylinderGeometry(0.1, 0.15, 1, 8);
  const bodyMaterial = new THREE.MeshPhongMaterial({ 
    color: 0xcccccc,
    metalness: 0.8,
    roughness: 0.2
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.rotation.x = Math.PI / 2;
  missileGroup.add(body);
  
  const coneGeometry = new THREE.ConeGeometry(0.1, 0.3, 8);
  const coneMaterial = new THREE.MeshPhongMaterial({ 
    color: 0xff0000,
    metalness: 0.7
  });
  const cone = new THREE.Mesh(coneGeometry, coneMaterial);
  cone.position.z = 0.65;
  cone.rotation.x = -Math.PI / 2;
  missileGroup.add(cone);
  
  const finGeometry = new THREE.BoxGeometry(0.3, 0.01, 0.2);
  const finMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
  
  for (let i = 0; i < 4; i++) {
    const fin = new THREE.Mesh(finGeometry, finMaterial);
    fin.position.z = -0.4;
    fin.rotation.y = (Math.PI / 2) * i;
    missileGroup.add(fin);
  }
  
  const flameGeometry = new THREE.ConeGeometry(0.08, 0.4, 8);
  const flameMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xff6600,
    transparent: true,
    opacity: 0.8
  });
  const flame = new THREE.Mesh(flameGeometry, flameMaterial);
  flame.position.z = -0.7;
  flame.rotation.x = Math.PI / 2;
  missileGroup.add(flame);
  
  missileModel = missileGroup;
}

function launchKineticImpactor(asteroidTarget) {
  if (!asteroidTarget || isDefenseActive || !missileModel) return;
  
  // Disable defense panel while missile is active
  disableDefensePanel();
  
  isDefenseActive = true;
  activeMissile = missileModel.clone();
  
  const launchPos = new THREE.Vector3(0, -5.2, 0);
  activeMissile.position.copy(launchPos);
  
  // توجيه الصاروخ نحو الهدف
  const direction = new THREE.Vector3()
    .subVectors(asteroidTarget.position, activeMissile.position)
    .normalize();
  
  // حساب الزوايا المطلوبة
  const targetQuaternion = new THREE.Quaternion();
  const up = new THREE.Vector3(0, 1, 0);
  const matrix = new THREE.Matrix4();
  matrix.lookAt(activeMissile.position, asteroidTarget.position, up);
  targetQuaternion.setFromRotationMatrix(matrix);
  
  // تطبيق rotation إضافي عشان رأس الصاروخ يكون في الاتجاه الصحيح
  activeMissile.quaternion.copy(targetQuaternion);
  activeMissile.rotateX(-Math.PI / 2);
  
  scene.add(activeMissile);
  
  const interceptDistance = 10;
  let hasExploded = false;
  
  console.log('Kinetic Impactor launched');
  console.log('Target:', asteroidTarget.position);
  
  gsap.to(activeMissile.position, {
    duration: 5,
    x: asteroidTarget.position.x,
    y: asteroidTarget.position.y,
    z: asteroidTarget.position.z,
    ease: "power1.inOut",
    onUpdate: () => {
      if (hasExploded || !asteroid) return;
      
      // تحديث اتجاه الصاروخ باستمرار
      const direction = new THREE.Vector3()
        .subVectors(asteroidTarget.position, activeMissile.position)
        .normalize();
      
      const targetQuaternion = new THREE.Quaternion();
      const up = new THREE.Vector3(0, 1, 0);
      const matrix = new THREE.Matrix4();
      matrix.lookAt(activeMissile.position, asteroidTarget.position, up);
      targetQuaternion.setFromRotationMatrix(matrix);
      
      activeMissile.quaternion.copy(targetQuaternion);
      activeMissile.rotateX(-Math.PI / 2);
      
      const currentDistance = activeMissile.position.distanceTo(asteroidTarget.position);
      
      if (currentDistance < interceptDistance) {
        hasExploded = true;
        triggerSpaceExplosion(activeMissile.position.clone(), asteroidTarget);
      }
    }
  });
}

function triggerSpaceExplosion(explosionPos, asteroidTarget) {
  if (!activeMissile) return;
  
  console.log('Space Explosion at:', explosionPos);
  console.log('Distance from Earth:', explosionPos.length().toFixed(2));
  
  scene.remove(activeMissile);
  activeMissile = null;
  
  if (asteroidTarget) {
    scene.remove(asteroidTarget);
    asteroid = null;
  }
  
  createExplosionSphere(explosionPos);
  createExplosionParticles(explosionPos);
  createExplosionLight(explosionPos);
  createLargeSpaceExplosion(explosionPos);
  
  console.log('Asteroid destroyed in space!');
  
  setTimeout(() => {
    isDefenseActive = false;
    // Mission completed - asteroid destroyed
    completeMission();
  }, 2000);
}

function createLargeSpaceExplosion(position) {
  const explosionGeometry = new THREE.SphereGeometry(2, 16, 16);
  const explosionMaterial = new THREE.MeshBasicMaterial({
    color: 0xff6600,
    transparent: true,
    opacity: 1
  });
  
  const largeSphere = new THREE.Mesh(explosionGeometry, explosionMaterial);
  largeSphere.position.copy(position);
  largeSphere.scale.set(0.1, 0.1, 0.1);
  scene.add(largeSphere);
  
  gsap.to(largeSphere.scale, {
    duration: 1.2,
    x: 4,
    y: 4,
    z: 4,
    ease: "power2.out"
  });
  
  gsap.to(explosionMaterial, {
    duration: 1.2,
    opacity: 0,
    ease: "power2.in",
    onComplete: () => {
      scene.remove(largeSphere);
      explosionGeometry.dispose();
      explosionMaterial.dispose();
    }
  });
  
  createDebrisField(position);
}

function createDebrisField(position) {
  const debrisCount = 25;
  const debrisGroup = new THREE.Group();
  
  for (let i = 0; i < debrisCount; i++) {
    const debrisMaterial = new THREE.MeshBasicMaterial({
      color: Math.random() > 0.5 ? 0xffaa00 : 0xff3300,
      transparent: true
    });
    
    const debris = new THREE.Mesh(sharedGeometries.particle, debrisMaterial);
    debris.position.copy(position);
    
    const direction = new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2
    ).normalize();
    
    const speed = Math.random() * 6 + 3;
    debris.userData.velocity = direction.multiplyScalar(speed);
    debris.userData.life = 1.0;
    
    debrisGroup.add(debris);
  }
  
  scene.add(debrisGroup);
  explosionParticles.push(debrisGroup);
  
  setTimeout(() => {
    scene.remove(debrisGroup);
    debrisGroup.children.forEach(d => d.material.dispose());
    const index = explosionParticles.indexOf(debrisGroup);
    if (index > -1) explosionParticles.splice(index, 1);
  }, 2000);
}

function createExplosionSphere(position) {
  if (!sharedGeometries.explosionSphere) {
    initSharedGeometries();
  }
  
  const sphereMaterial = new THREE.MeshBasicMaterial({
    color: 0xffaa00,
    transparent: true,
    opacity: 1
  });
  const explosionSphere = new THREE.Mesh(sharedGeometries.explosionSphere, sphereMaterial);
  explosionSphere.position.copy(position);
  scene.add(explosionSphere);
  
  setTimeout(() => {
    scene.remove(explosionSphere);
    sphereMaterial.dispose();
  }, 800);
}

function createExplosionParticles(position) {
  const particleCount = 15;
  const particles = new THREE.Group();
  
  if (!sharedGeometries.particle) {
    initSharedGeometries();
  }
  
  const sharedMaterial = new THREE.MeshBasicMaterial({
    color: 0xff6600,
    transparent: true
  });
  
  for (let i = 0; i < particleCount; i++) {
    const particle = new THREE.Mesh(sharedGeometries.particle, sharedMaterial);
    particle.position.copy(position);
    
    const direction = new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2
    ).normalize();
    
    const speed = Math.random() * 4 + 2;
    particle.userData.velocity = direction.multiplyScalar(speed);
    particle.userData.life = 1.0;
    
    particles.add(particle);
  }
  
  scene.add(particles);
  explosionParticles.push(particles);
  
  setTimeout(() => {
    scene.remove(particles);
    sharedMaterial.dispose();
    const index = explosionParticles.indexOf(particles);
    if (index > -1) explosionParticles.splice(index, 1);
  }, 1000);
}

function createExplosionLight(position) {
  const light = new THREE.PointLight(0xffaa00, 6, 30);
  light.position.copy(position);
  scene.add(light);
  
  setTimeout(() => {
    scene.remove(light);
  }, 600);
}

function checkAsteroidDistance() {
  if (!asteroid || isDefenseActive) return;
  
  const distanceToEarth = asteroid.position.length();
  const activationDistance = 100;
  
  if (distanceToEarth < activationDistance && selectedDefense === 'kinetic') {
    console.log('Asteroid detected at:', distanceToEarth.toFixed(2));
    console.log('Launching missile...');
    launchKineticImpactor(asteroid);
  }
}

function updateKineticDefense() {
  checkAsteroidDistance();
}

function initAsteroidSelection() {
  previewScene = new THREE.Scene();
  previewCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  previewCamera.position.set(0, 2, 5);
  previewCamera.lookAt(0, 0, 0);

  const container = document.getElementById('asteroidPreview');
  previewRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  
  // Make preview responsive
  const updatePreviewSize = () => {
    const containerRect = container.getBoundingClientRect();
    const size = Math.min(containerRect.width, containerRect.height, 400);
    previewRenderer.setSize(size, size);
    previewCamera.aspect = 1;
    previewCamera.updateProjectionMatrix();
  };
  
  updatePreviewSize();
  previewRenderer.setClearColor(0x000000, 0);
  container.appendChild(previewRenderer.domElement);
  
  // Add resize listener for preview
  window.addEventListener('resize', updatePreviewSize);

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

  document.getElementById('launchBtn').addEventListener('click', () => {
    console.log('Launch button clicked!');
    startSimulation();
  });

  animatePreview();
}

function loadPreviewAsteroid(index) {
  if (previewAsteroid) {
    previewScene.remove(previewAsteroid);
  }

  const model = asteroidModels[index];
  document.getElementById('asteroidName').textContent = model.name;

  // Create fallback asteroid immediately
  if (!sharedGeometries.fallbackAsteroid) {
    initSharedGeometries();
  }
  
  const fallbackMaterial = new THREE.MeshStandardMaterial({
    color: 0x888888,
    roughness: 0.9,
    metalness: 0.1
  });
  previewAsteroid = new THREE.Mesh(sharedGeometries.fallbackAsteroid, fallbackMaterial);
  previewAsteroid.scale.set(selectedAsteroidSize, selectedAsteroidSize, selectedAsteroidSize);
  previewScene.add(previewAsteroid);

  const loader = new THREE.GLTFLoader();
  loader.load(
    `../../3D_models/${model.file}`,
    (gltf) => {
      // Remove fallback and add real model
      previewScene.remove(previewAsteroid);
      previewAsteroid = gltf.scene;
      previewAsteroid.scale.set(selectedAsteroidSize, selectedAsteroidSize, selectedAsteroidSize);
      previewScene.add(previewAsteroid);
      console.log('Asteroid model loaded successfully:', model.name);
    },
    undefined,
    (error) => {
      console.error('Error loading asteroid model:', error);
      console.log('Using fallback asteroid model');
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
  console.log('Starting simulation...');
  missionState = 'playing';
  missionCompleted = false;
  
  document.getElementById('asteroidSelection').style.display = 'none';
  document.getElementById('mainScreen').style.display = 'block';
  
  // Hide change asteroid button initially
  document.getElementById('changeAsteroidBtn').style.display = 'none';
  
  // Enable defense panel when starting simulation (asteroid selected)
  enableDefensePanel();
  
  initSharedGeometries();
  MeteorMadness();
  
  loadCities().then((cities) => {
    citiesData = cities;
    console.log('Cities loaded:', cities.length);
  });
  
  loadMissileModel();
  animate();
  initAsteroidMenu();
  console.log('Simulation started successfully');
}

const fallbackGeometry = new THREE.SphereGeometry(0.5, 8, 8);

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
        const material = new THREE.MeshStandardMaterial({ color: 0x888888 });
        const ast = new THREE.Mesh(fallbackGeometry, material);
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
      document.querySelectorAll('.asteroid-option').forEach(opt => opt.classList.remove('selected'));
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
      
      if (!sharedGeometries.fallbackAsteroid) {
        initSharedGeometries();
      }
      
      const asteroidMaterial = new THREE.MeshStandardMaterial({
        color: 0x888888,
        roughness: 0.9,
        metalness: 0.1,
      });
      asteroid = new THREE.Mesh(sharedGeometries.fallbackAsteroid, asteroidMaterial);
      asteroid.scale.set(selectedAsteroidSize, selectedAsteroidSize, selectedAsteroidSize);
      asteroid.position.set(100, 0, 0);
      scene.add(asteroid);
    }
  );
}

function MeteorMadness() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.set(0, 5, 25);

  const canvas = document.getElementById('gameCanvas');
  renderer = new THREE.WebGLRenderer({ 
    antialias: true, 
    powerPreference: "high-performance",
    canvas: canvas
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

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

  const earthGeometry = new THREE.SphereGeometry(5, 48, 48);
  const earthMaterial = new THREE.MeshPhongMaterial({
    map: earthTexture,
    bumpMap: bumpMap,
    bumpScale: 0.05,
    specularMap: specularMap,
    specular: new THREE.Color("grey"),
  });
  earth = new THREE.Mesh(earthGeometry, earthMaterial);
  scene.add(earth);

  const cloudGeometry = new THREE.SphereGeometry(5.05, 32, 32);
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
  
  const satelliteLoader = new THREE.GLTFLoader();
  satelliteLoader.load(
    '../../3D_models/simple_satellite_low_poly_free.glb',
    (gltf) => {
      satellite = gltf.scene;
      satellite.scale.set(0.5, 0.5, 0.5);
      satellite.position.set(7, 0, 0);
      scene.add(satellite);
    },
    undefined,
    (error) => {
      console.error('Error loading satellite model:', error);
      const satelliteGroup = new THREE.Group();
      const bodyGeometry = new THREE.BoxGeometry(0.3, 0.15, 0.15);
      const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0xcccccc, metalness: 0.7, roughness: 0.3 });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      satelliteGroup.add(body);
      
      const panelGeometry = new THREE.BoxGeometry(0.5, 0.01, 0.3);
      const panelMaterial = new THREE.MeshPhongMaterial({ color: 0x1a5490, metalness: 0.5 });
      const leftPanel = new THREE.Mesh(panelGeometry, panelMaterial);
      leftPanel.position.set(-0.4, 0, 0);
      satelliteGroup.add(leftPanel);
      
      const rightPanel = new THREE.Mesh(panelGeometry, panelMaterial);
      rightPanel.position.set(0.4, 0, 0);
      satelliteGroup.add(rightPanel);
      
      const antennaGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.3, 8);
      const antennaMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
      const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
      antenna.position.set(0, 0.15, 0);
      satelliteGroup.add(antenna);
      
      satellite = satelliteGroup;
      satellite.position.set(10, 0, 0);
      scene.add(satellite);
    }
  );

  const starGeometry = new THREE.BufferGeometry();
  const starCount = 3000;
  const starPositions = [];
  for (let i = 0; i < starCount; i++) {
    starPositions.push((Math.random() - 0.5) * 2000, (Math.random() - 0.5) * 2000, (Math.random() - 0.5) * 2000);
  }
  starGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starPositions, 3));
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
      if (!sharedGeometries.fallbackAsteroid) {
        initSharedGeometries();
      }
      const asteroidMaterial = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.9, metalness: 0.1 });
      asteroid = new THREE.Mesh(sharedGeometries.fallbackAsteroid, asteroidMaterial);
      asteroid.scale.set(selectedAsteroidSize, selectedAsteroidSize, selectedAsteroidSize);
      asteroid.position.set(100, 0, 0);
      scene.add(asteroid);
    }
  );

  window.addEventListener("resize", () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });
}

async function loadCities() {
  const response = await fetch("../data/cities.json");
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
  
  if (!sharedGeometries.cityMarker) {
    initSharedGeometries();
  }
  
  const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const marker = new THREE.Mesh(sharedGeometries.cityMarker, material);
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
  if (missionCompleted) {
    console.log('Mission completed - cannot launch asteroid');
    return;
  }
  
  if (targetCityMarker && asteroid) {
    // Disable defense panel while asteroid is moving
    disableDefensePanel();
    
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
      duration: 6,
      x: worldPos.x,
      y: worldPos.y,
      z: worldPos.z,
      ease: "power2.inOut",
      onComplete: () => {
        if (selectedDefense === 'none') {
          triggerEarthImpact(worldPos);
          scene.remove(asteroid);
        }
      }
    });
  } else {
    alert("Search for a city first!");
  }
});

function triggerEarthImpact(impactPos) {
  console.log('Direct Earth Impact at:', impactPos);
  
  const impactSphere = new THREE.Mesh(
    sharedGeometries.explosionSphere,
    new THREE.MeshBasicMaterial({ color: 0xff3300, transparent: true, opacity: 1 })
  );
  impactSphere.position.copy(impactPos);
  impactSphere.scale.set(0.1, 0.1, 0.1);
  scene.add(impactSphere);
  
  gsap.to(impactSphere.scale, { duration: 1.5, x: 3, y: 3, z: 3, ease: "power2.out" });
  gsap.to(impactSphere.material, {
    duration: 1.5,
    opacity: 0,
    ease: "power2.in",
    onComplete: () => {
      scene.remove(impactSphere);
      impactSphere.material.dispose();
    }
  });
  
  createEarthImpactParticles(impactPos);
  
  const impactLight = new THREE.PointLight(0xff3300, 10, 50);
  impactLight.position.copy(impactPos);
  scene.add(impactLight);
  
  gsap.to(impactLight, {
    duration: 2,
    intensity: 0,
    ease: "power2.in",
    onComplete: () => {
      scene.remove(impactLight);
    }
  });
  
  shakeCamera();
  createShockwave(impactPos);
  
  // Mission completed
  setTimeout(() => {
    completeMission();
  }, 3000);
}

function createEarthImpactParticles(position) {
  const particleCount = 30;
  const impactParticles = new THREE.Group();
  const particleMaterial = new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true });
  
  for (let i = 0; i < particleCount; i++) {
    const particle = new THREE.Mesh(sharedGeometries.particle, particleMaterial.clone());
    particle.position.copy(position);
    
    const direction = position.clone().normalize();
    const spreadAngle = (Math.random() - 0.5) * 0.8;
    direction.x += spreadAngle;
    direction.y += spreadAngle;
    direction.z += spreadAngle;
    direction.normalize();
    
    const speed = Math.random() * 5 + 3;
    particle.userData.velocity = direction.multiplyScalar(speed);
    particle.userData.life = 1.0;
    impactParticles.add(particle);
  }
  
  scene.add(impactParticles);
  explosionParticles.push(impactParticles);
  
  setTimeout(() => {
    scene.remove(impactParticles);
    impactParticles.children.forEach(p => p.material.dispose());
    const index = explosionParticles.indexOf(impactParticles);
    if (index > -1) explosionParticles.splice(index, 1);
  }, 2000);
}

function shakeCamera() {
  const originalPos = camera.position.clone();
  const shakeIntensity = 0.3;
  const shakeDuration = 1000;
  const startTime = Date.now();
  
  function shake() {
    const elapsed = Date.now() - startTime;
    if (elapsed < shakeDuration) {
      const intensity = shakeIntensity * (1 - elapsed / shakeDuration);
      camera.position.x = originalPos.x + (Math.random() - 0.5) * intensity;
      camera.position.y = originalPos.y + (Math.random() - 0.5) * intensity;
      camera.position.z = originalPos.z + (Math.random() - 0.5) * intensity;
      requestAnimationFrame(shake);
    } else {
      camera.position.copy(originalPos);
    }
  }
  shake();
}

function createShockwave(position) {
  const shockwaveGeometry = new THREE.RingGeometry(0.5, 0.8, 32);
  const shockwaveMaterial = new THREE.MeshBasicMaterial({
    color: 0xffaa00,
    transparent: true,
    opacity: 0.8,
    side: THREE.DoubleSide
  });
  
  const shockwave = new THREE.Mesh(shockwaveGeometry, shockwaveMaterial);
  shockwave.position.copy(position);
  const normal = position.clone().normalize();
  shockwave.lookAt(normal.multiplyScalar(100));
  scene.add(shockwave);
  
  gsap.to(shockwave.scale, { duration: 2, x: 5, y: 5, z: 5, ease: "power2.out" });
  gsap.to(shockwaveMaterial, {
    duration: 2,
    opacity: 0,
    ease: "power2.in",
    onComplete: () => {
      scene.remove(shockwave);
      shockwaveGeometry.dispose();
      shockwaveMaterial.dispose();
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initDefenseSystem();
});

function initDefenseSystem() {
  const defenseOptions = document.querySelectorAll('.defense-option');
  defenseOptions.forEach(option => {
    option.addEventListener('click', () => {
      defenseOptions.forEach(opt => opt.classList.remove('selected'));
      option.classList.add('selected');
      selectedDefense = option.dataset.defense;
      console.log('Selected Defense:', selectedDefense);
      handleDefenseSelection(selectedDefense);
    });
  });
}

function handleDefenseSelection(defenseType) {
  // Only allow defense selection if mission is not completed
  if (missionCompleted) {
    console.log('Cannot change defense - mission completed');
    return;
  }
  
  switch(defenseType) {
    case 'blast':
      console.log('Blast Deflection activated');
      break;
    case 'gravity':
      console.log('Gravity Tractor activated');
      break;
    case 'kinetic':
      console.log('Kinetic Impactor activated');
      break;
    case 'none':
      console.log('No Defense - Direct impact mode');
      break;
    default:
      console.log('Unknown defense type');
  }
  
  selectedDefense = defenseType;
  
  // Update visual feedback
  document.querySelectorAll('.defense-option').forEach(option => {
    option.classList.remove('selected');
  });
  
  if (defenseType !== 'none') {
    document.querySelector(`[onclick="handleDefenseSelection('${defenseType}')"]`).classList.add('selected');
  }
  
  // Apply defense to asteroid if it exists
  if (asteroid) {
    applyDefenseToAsteroid(asteroid, defenseType);
  }
}

function getSelectedDefense() {
  return selectedDefense;
}

function applyDefenseToAsteroid(asteroidTarget) {
  if (!asteroidTarget) return;
  switch(selectedDefense) {
    case 'kinetic':
      launchKineticImpactor(asteroidTarget);
      break;
  }
}

function animate() {
  requestAnimationFrame(animate);

  if (satellite) {
    let satTime = Date.now() * 0.0005;
    const radius = 14;
    satellite.position.set(
      Math.cos(satTime) * radius,
      Math.sin(satTime * 0.7) * 3,
      Math.sin(satTime) * radius
    );
    satellite.lookAt(earth.position);
  }

  explosionParticles.forEach(particleGroup => {
    particleGroup.children.forEach(particle => {
      if (particle.userData.velocity) {
        particle.position.add(particle.userData.velocity.clone().multiplyScalar(0.05));
        particle.userData.life -= 0.02;
        particle.material.opacity = Math.max(0, particle.userData.life);
      }
    });
  });

  scene.traverse(obj => {
    if (obj.userData?.type === "cityMarker") {
      const dist = camera.position.distanceTo(obj.getWorldPosition(new THREE.Vector3()));
      const scaleFactor = THREE.MathUtils.clamp(dist / 40, 0.05, 0.3);
      obj.scale.set(scaleFactor, scaleFactor, scaleFactor);
    }
  });

  updateKineticDefense();
  controls.update();
  renderer.render(scene, camera);
}

// Mission Management Functions
function completeMission() {
  missionState = 'completed';
  missionCompleted = true;
  
  console.log('Mission completed!');
  
  // Show mission completion message
  showMissionCompletionMessage();
  
  // Show change asteroid button
  document.getElementById('changeAsteroidBtn').style.display = 'block';
  
  // Disable defense panel
  disableDefensePanel();
  
  // Disable launch asteroid button
  document.getElementById('asteroidBtn').disabled = true;
  document.getElementById('asteroidBtn').style.opacity = '0.5';
}

function showMissionCompletionMessage() {
  // Create mission completion overlay
  const overlay = document.createElement('div');
  overlay.id = 'missionCompletionOverlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
    backdrop-filter: blur(10px);
  `;
  
  const messageBox = document.createElement('div');
  messageBox.style.cssText = `
    background: var(--panel);
    padding: var(--spacing-xl);
    border-radius: var(--radius-lg);
    border: 2px solid var(--accent);
    text-align: center;
    color: var(--text);
    max-width: 500px;
    box-shadow: var(--shadow-lg);
  `;
  
  const title = document.createElement('h2');
  title.textContent = 'Mission Completed!';
  title.style.cssText = `
    color: var(--accent);
    font-size: var(--font-3xl);
    margin-bottom: var(--spacing-lg);
    text-shadow: 0 0 20px rgba(0, 229, 255, 0.5);
  `;
  
  const message = document.createElement('p');
  message.textContent = selectedDefense === 'none' 
    ? 'The asteroid has impacted Earth. Choose a new asteroid to try again with defense systems!'
    : 'The asteroid has been successfully destroyed! Choose a new asteroid for another mission.';
  message.style.cssText = `
    font-size: var(--font-lg);
    margin-bottom: var(--spacing-lg);
    line-height: 1.6;
  `;
  
  const instruction = document.createElement('p');
  instruction.textContent = 'Click "Change Asteroid" in the top left to select a new asteroid and start a new mission.';
  instruction.style.cssText = `
    font-size: var(--font-base);
    color: var(--text-secondary);
    margin-bottom: var(--spacing-xl);
  `;
  
  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Continue';
  closeBtn.style.cssText = `
    background: var(--accent);
    color: var(--text);
    border: none;
    padding: var(--spacing-md) var(--spacing-xl);
    border-radius: var(--radius);
    font-size: var(--font-lg);
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
  `;
  
  closeBtn.addEventListener('click', () => {
    document.body.removeChild(overlay);
  });
  
  closeBtn.addEventListener('mouseenter', () => {
    closeBtn.style.background = 'var(--accent-secondary)';
    closeBtn.style.transform = 'translateY(-2px)';
  });
  
  closeBtn.addEventListener('mouseleave', () => {
    closeBtn.style.background = 'var(--accent)';
    closeBtn.style.transform = 'translateY(0)';
  });
  
  messageBox.appendChild(title);
  messageBox.appendChild(message);
  messageBox.appendChild(instruction);
  messageBox.appendChild(closeBtn);
  overlay.appendChild(messageBox);
  
  document.body.appendChild(overlay);
}

function disableDefensePanel() {
  const defenseOptions = document.querySelectorAll('.defense-option');
  defenseOptions.forEach(option => {
    option.style.opacity = '0.5';
    option.style.pointerEvents = 'none';
    option.style.cursor = 'not-allowed';
    option.style.filter = 'grayscale(50%)';
  });
  
  const defenseMenu = document.getElementById('defenseMenu');
  if (defenseMenu) {
    defenseMenu.style.opacity = '0.5';
    defenseMenu.style.filter = 'grayscale(50%)';
  }
  
  console.log('Defense panel disabled - mission in progress');
}

function enableDefensePanel() {
  const defenseOptions = document.querySelectorAll('.defense-option');
  defenseOptions.forEach(option => {
    option.style.opacity = '1';
    option.style.pointerEvents = 'auto';
    option.style.cursor = 'pointer';
    option.style.filter = 'none';
  });
  
  const defenseMenu = document.getElementById('defenseMenu');
  if (defenseMenu) {
    defenseMenu.style.opacity = '1';
    defenseMenu.style.filter = 'none';
  }
  
  console.log('Defense panel enabled - ready for selection');
}

function startNewMission() {
  missionState = 'playing';
  missionCompleted = false;
  
  // Hide change asteroid button
  document.getElementById('changeAsteroidBtn').style.display = 'none';
  
  // Enable defense panel for new mission
  enableDefensePanel();
  
  // Enable launch asteroid button
  document.getElementById('asteroidBtn').disabled = false;
  document.getElementById('asteroidBtn').style.opacity = '1';
  
  // Reset asteroid if needed
  if (asteroid) {
    scene.remove(asteroid);
    asteroid = null;
  }
  
  // Reset defense state
  isDefenseActive = false;
  selectedDefense = 'none';
  
  // Load new asteroid
  changeAsteroid();
  
  console.log('New mission started - defense panel enabled');
}

// Update the change asteroid button click handler
document.addEventListener('DOMContentLoaded', () => {
  const changeAsteroidBtn = document.getElementById('changeAsteroidBtn');
  if (changeAsteroidBtn) {
    changeAsteroidBtn.addEventListener('click', () => {
      if (missionCompleted) {
        // Show asteroid selection menu
        document.getElementById('asteroidMenu').style.display = 'flex';
      } else {
        // Normal change asteroid functionality
        document.getElementById('asteroidMenu').style.display = 'flex';
      }
    });
  }
});

// Update the confirm asteroid button to start new mission
document.addEventListener('DOMContentLoaded', () => {
  const confirmAsteroidBtn = document.getElementById('confirmAsteroid');
  if (confirmAsteroidBtn) {
    confirmAsteroidBtn.addEventListener('click', () => {
      currentAsteroidIndex = tempAsteroidIndex;
      selectedAsteroidSize = tempAsteroidSize;
      changeAsteroid();
      document.getElementById('asteroidMenu').style.display = 'none';
      
      // If mission was completed, start new mission
      if (missionCompleted) {
        startNewMission();
      }
    });
  }
});

initAsteroidSelection();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getSelectedDefense,
    applyDefenseToAsteroid,
    handleDefenseSelection,
    launchKineticImpactor,
    cleanupSharedGeometries,
    completeMission,
    startNewMission
  };
}