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
  "../../3D_models/Asteroid_2a.glb",
  "../../3D_models/Asteroid_2d.glb",
  "../../3D_models/Asteroid_2a.glb"
];

// === Audio and Scripts Configuration ===
const asteroidContent = [
  {
    audio: '../../Learn sound/Introduction.mp3',
    text: `<p>For billions of years, Earth has drifted through a cosmic shooting gallery — a vast arena filled with silent travelers called asteroids and comets.</p>
<p>Most drift peacefully in the darkness, but some wander close... too close. These are known as Near-Earth Objects (NEOs) — rocky relics from the birth of our Solar System that occasionally cross our planet's path.</p>
<p>They tell a story — not just of danger, but of creation, evolution, and survival.</p>`
  },
  {
    audio: '../../Learn sound/what is asteroid.mp3',
    text: `<p>Asteroids are chunks of rock and metal left over from the formation of the Solar System about 4.6 billion years ago.</p>
<p>Most of them live safely in the asteroid belt between Mars and Jupiter, but gravitational nudges from planets — especially Jupiter — sometimes push them toward Earth's orbit.</p>
<p>When their paths bring them within 1.3 astronomical units of the Sun (about Earth's distance), they're called Near-Earth Objects (NEOs).</p>`
  },
  {
    audio: '../../Learn sound/chc.mp3',
    text: `<p><strong>The Chicxulub Impact (66 million years ago)</strong></p>
<p>Sixty-six million years ago, a 10-kilometer-wide asteroid slammed into what's now Yucatán, Mexico.</p>
<p>The explosion released energy equivalent to 100 trillion tons of TNT, forming the Chicxulub Crater and sending dust and sulfur into the atmosphere.</p>
<p>The sunlight dimmed, temperatures dropped, and the reign of the dinosaurs ended — clearing the path for mammals… and eventually, us.</p>`
  },
  {
    audio: '../../Learn sound/tunguska.mp3',
    text: `<p><strong>The Tunguska Event (1908)</strong></p>
<p>On June 30, 1908, a fiery object exploded over Tunguska, Siberia, flattening 2,000 square kilometers of forest.</p>
<p>The blast was likely caused by a small asteroid or comet fragment — only 50–60 meters wide — that disintegrated before hitting the ground.</p>
<p>If it had arrived a few hours later, it would've destroyed St. Petersburg.</p>`
  },
  {
    audio: '../../Learn sound/chyla.mp3',
    text: `<p><strong>Chelyabinsk Meteor (2013)</strong></p>
<p>In February 2013, a 19-meter asteroid exploded over Chelyabinsk, Russia, with the power of 30 Hiroshima bombs.</p>
<p>More than 1,500 people were injured by the shockwave.</p>
<p>It was a chilling reminder that even small space rocks can cause real damage.</p>`
  },
  {
    audio: '../../Learn sound/apophis.mp3',
    text: `<p><strong>99942 Apophis</strong></p>
<p>In 2004, astronomers discovered Apophis, a 370-meter asteroid predicted to have a 2.7% chance of hitting Earth in 2029.</p>
<p>After years of tracking, we now know it'll safely pass just 31,000 km from Earth — closer than many satellites!</p>
<p>Apophis became a wake-up call for global asteroid defense programs.</p>`
  },
  {
    audio: '../../Learn sound/YU55.mp3',
    text: `<p><strong>2005 YU55 & The Future</strong></p>
<p>In 2011, asteroid 2005 YU55 passed only 324,000 km from Earth — closer than the Moon.</p>
<p>Humanity isn't helpless anymore. NASA's DART mission made history by changing an asteroid's orbit.</p>
<p>The story of asteroids is, in the end, the story of us — learning to understand and defend the only home we've ever known.</p>`
  }
];

// === Sound and Loading Tracking ===
let loadedAsteroids = 0;
let characterLoaded = false;
let allModelsLoaded = false;
let currentAudio = null;

// Check if all models are loaded
function checkAllModelsLoaded() {
  if (loadedAsteroids === asteroidModels.length && characterLoaded && !allModelsLoaded) {
    allModelsLoaded = true;
    console.log('All models loaded!');
    // Play introduction automatically when everything is loaded
    playAsteroidAudio(0);
  }
}

// Play audio for specific asteroid
function playAsteroidAudio(index) {
  // Stop current audio if playing
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
  
  // Hide subtitle first
  const subtitle = document.getElementById('subtitle');
  subtitle.classList.remove('show');
  
  // Wait a bit then show new content
  setTimeout(() => {
    // Update subtitle text
    const subtitleText = subtitle.querySelector('.subtitle-text');
    subtitleText.innerHTML = asteroidContent[index].text;
    
    // Create and play new audio
    currentAudio = new Audio(asteroidContent[index].audio);
    currentAudio.volume = 0.7;
    
    currentAudio.play().then(() => {
      subtitle.classList.add('show');
      console.log(`Playing asteroid ${index + 1} audio`);
    }).catch(error => {
      console.error('Error playing audio:', error);
      subtitle.classList.add('show');
    });
  }, 500);
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
  { r: baseRadius + 1.5, theta: 4.0, phi: 2.6 },
  { r: baseRadius + 12, theta: 3.1, phi: 2.8 },
  { r: baseRadius + 15, theta: 4.0, phi: 3.6 }
];

asteroidModels.forEach((path, i) => {
  loader.load(path, (gltf) => {
    let model = gltf.scene;
    if (i >= 5) {
      model.scale.set(1.5, 1.5, 1.5);
    } else {
      model.scale.set(0.8, 0.8, 0.8);
    }
    let cfg = asteroidConfigs[i];
    model.position.copy(sphericalToCartesian(cfg.r, cfg.theta, cfg.phi));
    scene.add(model);
    asteroids.push(model);
    
    loadedAsteroids++;
    console.log(`Asteroid ${i + 1}/${asteroidModels.length} loaded`);
    checkAllModelsLoaded();
  }, undefined, (error) => {
    console.error(`Error loading asteroid ${i + 1}:`, error);
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
    
    characterLoaded = true;
    console.log('Character loaded');
    checkAllModelsLoaded();
  }, undefined, (error) => {
    console.error('Error loading character:', error);
    characterLoaded = true;
    checkAllModelsLoaded();
  });
}

function initCharacter(fbx) {
  const char = fbx;
  char.scale.setScalar(.06);
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
    const offsetDistance = 35;
    const screenX = -15;
    const screenY = -12;
    
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    
    const cameraRight = new THREE.Vector3();
    const cameraUp = new THREE.Vector3();
    cameraRight.crossVectors(cameraDirection, camera.up).normalize();
    cameraUp.crossVectors(cameraRight, cameraDirection).normalize();
    
    character.position.copy(camera.position);
    character.position.addScaledVector(cameraDirection, offsetDistance);
    character.position.addScaledVector(cameraRight, screenX);
    character.position.addScaledVector(cameraUp, screenY);
    
    character.lookAt(camera.position);
    
    if (character.userData && character.userData.update) {
      character.userData.update();
    }
  }
  
  controls.update();
  renderer.render(scene, camera);
}

loadCharacter();
animate();

// === التحكم في الكاميرا ===
let currentAsteroid = 0;
const startBtn = document.getElementById("startBtn");
const nextBtn = document.getElementById("nextBtn");

function moveCameraTo(target, index) {
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
    ease: "power2.inOut",
    onComplete: () => {
      playAsteroidAudio(index);
    }
  });
}

startBtn.addEventListener("click", () => {
  if (asteroids.length === 0) return;
  startBtn.disabled = true;
  nextBtn.disabled = false;
  currentAsteroid = 0;
  moveCameraTo(asteroids[currentAsteroid], currentAsteroid);
});

nextBtn.addEventListener("click", () => {
  if (asteroids.length === 0) return;
  
  currentAsteroid++;
  
  if (currentAsteroid >= asteroids.length) {
    // If reached the end, go back to start
    currentAsteroid = 0;
    nextBtn.textContent = "Next";
  } else if (currentAsteroid === asteroids.length - 1) {
    // If this is the last asteroid, change button to "Finish"
    nextBtn.textContent = "Finish";
  }
  
  moveCameraTo(asteroids[currentAsteroid], currentAsteroid);
});

// === Resize ===
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});