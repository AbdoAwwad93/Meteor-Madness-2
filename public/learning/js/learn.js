// === Scene, Camera, Renderer ===
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 50);

let renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
let character;

let loader = new THREE.GLTFLoader();
let asteroids = [];
let asteroidModels = [
  "../../3D_models/Asteroid_1c_Iron.glb",
  "../../3D_models/Asteroid_1e.glb",
  "../../3D_models/Asteroid_2a.glb",
  "../../3D_models/Asteroid_2d.glb",
  "../../3D_models/Asteroid_2a.glb"
];

// === Sound and Loading Tracking ===
let loadedAsteroids = 0;
let characterLoaded = false;
let allModelsLoaded = false;
let introductionSound;

// Initialize audio
function initAudio() {
  introductionSound = new Audio('../../Learn sound/Introduction.mp3');
  introductionSound.volume = 0.7; // Set volume to 70%
  introductionSound.preload = 'auto';
}

// Check if all models are loaded
function checkAllModelsLoaded() {
  if (loadedAsteroids === asteroidModels.length && characterLoaded && !allModelsLoaded) {
    allModelsLoaded = true;
    console.log('All models loaded! Playing introduction sound...');
    playIntroductionSound();
  }
}

// Play introduction sound
function playIntroductionSound() {
  if (introductionSound) {
    introductionSound.play().then(() => {
      // Show subtitle when sound starts playing
      showSubtitle();
    }).catch(error => {
      console.error('Error playing introduction sound:', error);
      // Note: Some browsers require user interaction before playing audio
      console.log('Audio playback blocked. User interaction required.');
      // Still show subtitle even if sound doesn't play
      showSubtitle();
    });
  }
}

// Show subtitle with animation
function showSubtitle() {
  const subtitle = document.getElementById('subtitle');
  if (subtitle) {
    subtitle.classList.add('show');
    console.log('Subtitle displayed');
  }
}

const earthGeometry = new THREE.SphereGeometry(5, 64, 64);
const textureLoader = new THREE.TextureLoader();

const earthMaterial = new THREE.MeshPhongMaterial({
  map: textureLoader.load("../../textures/8k_earth_daymap.jpg"),
  bumpMap: textureLoader.load("../../textures/8k_earth_nightmap.jpg"),
  bumpScale: 0.3,
  specularMap: textureLoader.load("../../textures/8k_earth_specular.jpeg"),
  specular: new THREE.Color("grey"),
  shininess: 15
});

earth = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earth);

const cloudGeometry = new THREE.SphereGeometry(5.03, 64, 64);
const cloudMaterial = new THREE.MeshPhongMaterial({
  map: textureLoader.load("../../textures/8k_earth_clouds.jpg"),
  transparent: true,
  opacity: 0.4,
});
clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
scene.add(clouds);

// === الإضاءة ===
const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
sunLight.position.set(10, 10, 10);
scene.add(sunLight);

// === نجوم الخلفية ===
const starsGeometry = new THREE.SphereGeometry(100, 64, 64);
const starsMaterial = new THREE.MeshBasicMaterial({
  map: textureLoader.load("../../textures/8k_stars_milky_way.jpg"),
  side: THREE.BackSide
});
stars = new THREE.Mesh(starsGeometry, starsMaterial);
scene.add(stars);


function sphericalToCartesian(r, theta, phi) {
  let x = r * Math.sin(phi) * Math.cos(theta);
  let y = r * Math.cos(phi);
  let z = r * Math.sin(phi) * Math.sin(theta);
  return new THREE.Vector3(x, y, z);
}

let baseRadius = 14;
let asteroidConfigs = [
  { r: baseRadius, theta: 0.4, phi: 1.0 },
  { r: baseRadius + 2, theta: 1.2, phi: 2.0 },
  { r: baseRadius - 1, theta: 2.3, phi: 0.7 },
  { r: baseRadius + 3, theta: 3.1, phi: 1.8 },
  { r: baseRadius + 1.5, theta: 4.0, phi: 2.6 }
];

asteroidModels.forEach((path, i) => {
  loader.load(path, (gltf) => {
    let model = gltf.scene;
    model.scale.set(0.6, 0.6, 0.6);
    let cfg = asteroidConfigs[i];
    model.position.copy(sphericalToCartesian(cfg.r, cfg.theta, cfg.phi));
    scene.add(model);
    asteroids.push(model);
    
    // Track loaded asteroids
    loadedAsteroids++;
    console.log(`Asteroid ${i + 1}/${asteroidModels.length} loaded`);
    checkAllModelsLoaded();
  }, undefined, (error) => {
    console.error(`Error loading asteroid ${i + 1}:`, error);
    // Still increment counter to prevent infinite waiting
    loadedAsteroids++;
    checkAllModelsLoaded();
  });
});

let fbxLoader = new THREE.FBXLoader();

function loadCharacter() {
  fbxLoader.load('../UI/SK_Sandy.fbx', (fbx) => {
    character = initCharacter(fbx);
    scene.add(character);
    loadAnimations();
    
    // Track character loaded
    characterLoaded = true;
    console.log('Character loaded');
    checkAllModelsLoaded();
  }, undefined, (error) => {
    console.error('Error loading character:', error);
    // Still mark as loaded to prevent infinite waiting
    characterLoaded = true;
    checkAllModelsLoaded();
  });
}

function initCharacter(fbx) {
  const char = fbx;
  char.scale.setScalar(.127);
  char.position.set(-35, -18, 1);
  char.traverse((c) => {
    if (c.isMesh) {
      if (c.material.name === 'Alpha_Body_MAT') {
        c.material = new THREE.MeshMatcapMaterial({
          matcap: textureLoader.load('../assets/fire-edge-blue.jpg'),
        });
      }
      c.castShadow = true;
    }
  });
  const mixer = new THREE.AnimationMixer(char);
  char.userData = { mixer, update: (t) => mixer.update(0.01) };
  return char;
}

function loadAnimations() {
  const animations = ['Talking (4)', 'Sitting Drinking (1)'];
  const apath = '../assets/animations/';
  let actions = [];
  let activeAction, previousAction;
  let switched = false;

  animations.forEach((name, index) => {
    fbxLoader.load(`${apath}${name}.fbx`, (fbx) => {
      let anim = fbx.animations[0];
      anim.name = name;
      if (character) {
        const action = character.userData.mixer.clipAction(anim);
        actions[index] = action;

        if (index === 0) {
          activeAction = actions[index];
          activeAction.play();
        }
      }
    });
  });

  function switchAndStop() {
    if (!switched) {
      previousAction = activeAction;
      activeAction = actions[1];

      previousAction.fadeOut(0.5);
      activeAction.reset().fadeIn(0.5).play();

      switched = true;

      activeAction.clampWhenFinished = true;
      activeAction.loop = THREE.LoopOnce;
    }
  }

  setTimeout(switchAndStop, 30000);
}

function animate() {
  requestAnimationFrame(animate);
  earth.rotation.y += 0.002;
  asteroids.forEach(a => a.rotation.y += 0.01);
  
  if (character) {
    character.lookAt(camera.position);
    if (character.userData && character.userData.update) {
      character.userData.update();
    }
  }
  
  controls.update();
  renderer.render(scene, camera);
}

// Initialize audio and load character
initAudio();
loadCharacter();

animate();

// === التحكم في الكاميرا ===
let currentAsteroid = 0;
const startBtn = document.getElementById("startBtn");
const nextBtn = document.getElementById("nextBtn");

function moveCameraTo(target) {
  if (!target) return;
  let pos = new THREE.Vector3();
  target.getWorldPosition(pos);
  gsap.to(camera.position, {
    duration: 2,
    x: pos.x + 3,
    y: pos.y + 2,
    z: pos.z + 5,
    ease: "power2.inOut"
  });
  gsap.to(controls.target, {
    duration: 2,
    x: pos.x,
    y: pos.y,
    z: pos.z,
    ease: "power2.inOut"
  });
}

startBtn.addEventListener("click", () => {
  if (asteroids.length === 0) return;
  startBtn.disabled = true;
  nextBtn.disabled = false;
  currentAsteroid = 0;
  moveCameraTo(asteroids[currentAsteroid]);
});

nextBtn.addEventListener("click", () => {
  if (asteroids.length === 0) return;
  currentAsteroid = (currentAsteroid + 1) % asteroids.length;
  moveCameraTo(asteroids[currentAsteroid]);
});

// === Resize ===
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});