import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// sword cursor
const style = document.createElement('style');
style.textContent = `
    body, canvas.webgl {
        cursor: none !important;
    }
    
    .custom-cursor {
        position: fixed;
        pointer-events: none;
        z-index: 9999;
        transform: translate(-50%, -50%);
        width: 124px;
        height: 124px;
        transition: transform 0.1s;
    }
    
    .cursor-slice {
        transform: translate(-50%, -50%) rotate(45deg) scale(1.2);
        filter: brightness(150%);
    }
`;
document.head.appendChild(style);


// Cannon.js Physics World Setup
const world = new CANNON.World();
world.gravity.set(0, -9.8, 0); 
world.solver.iterations = 10;


// loading screen
function createLoadingScreen() {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loadingScreen';
    loadingDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #1a1a1a;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        transition: opacity 0.5s;
    `;

    // Main loading container
    const loadingContainer = document.createElement('div');
    loadingContainer.style.cssText = `
        position: relative;
        width: 400px;
        height: 400px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    `;

    // Rotating fruits container
    const orbitContainer = document.createElement('div');
    orbitContainer.className = 'orbit-container';
    orbitContainer.style.cssText = `
        position: fixed;
        width: 400px;
        height: 400px;
        animation: rotate 15s linear infinite;
        top: 45%;
        left: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
    `;

    // Gamepic image at center
    const logoImg = document.createElement('img');
    logoImg.src = 'gamepic4.webp';
    logoImg.style.cssText = `
        width: 150px;
        position: absolute;
        top: 40%;
        left: 48%;
        transform: translate(-50%, -50%);
        z-index: 2;
        filter: drop-shadow(0 0 8px rgba(255,255,255,0.5));
    `;

    // Fruits arranged in a circle around the image
    const fruits = ['🍎', '🍊', '🍋', '🍇', '🍓', '🍌', '🍉', '🍑'];
    fruits.forEach((fruit, index) => {
        const angle = (360 / fruits.length) * index;
        const fruitEl = document.createElement('div');
        fruitEl.style.cssText = `
            position: absolute;
            font-size: 50px;
            filter: drop-shadow(0 0 12px rgba(255,255,255,0.7));
            opacity: 1;
            left: 46%;
            top: 50%;
            transform: 
                rotate(${angle}deg) 
                translateX(250px) 
                rotate(-${angle}deg);
            will-change: transform;
        `;
        fruitEl.textContent = fruit;
        orbitContainer.appendChild(fruitEl);
    });

    // Progress elements
    const progressContainer = document.createElement('div');
    progressContainer.style.cssText = `
        position: absolute;
        bottom: 20%;
        width: 80%;
        max-width: 300px;
        z-index: 3;
    `;

    const progressBar = document.createElement('div');
    progressBar.id = 'progressBar';
    progressBar.style.cssText = `
        height: 10px;
        background: #333;
        border-radius: 5px;
        overflow: hidden;
    `;

    const progressFill = document.createElement('div');
    progressFill.id = 'progressFill';
    progressFill.style.cssText = `
        width: 0%;
        height: 100%;
        background: linear-gradient(90deg, #00ff88 0%, #00ccff 100%);
        transition: width 0.3s ease;
    `;

    const progressText = document.createElement('div');
    progressText.id = 'progressText';
    progressText.style.cssText = `
        color: white;
        font-size: 24px;
        text-align: center;
        margin-top: 15px;
        font-family: 'Arial Black', sans-serif;
        text-shadow: 0 2px 4px rgba(0,0,0,0.5);
    `;

    // Add animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes rotate {
            from { 
                transform: translate(-50%, -50%) rotate(0deg); 
            }
            to { 
                transform: translate(-50%, -50%) rotate(360deg); 
            }
        }
        
        .orbit-container div {
            transform-origin: center center;
        }
    `;

    // Assemble elements
    progressBar.appendChild(progressFill);
    progressContainer.appendChild(progressBar);
    progressContainer.appendChild(progressText);
    loadingContainer.appendChild(orbitContainer);
    loadingContainer.appendChild(logoImg);
    loadingContainer.appendChild(progressContainer);
    loadingDiv.appendChild(loadingContainer);
    document.body.appendChild(loadingDiv);
    document.head.appendChild(style);
}


function updateLoadingProgress(progress) {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    if (progressFill) progressFill.style.width = `${progress}%`;
    if (progressText) progressText.textContent = `${Math.round(progress)}% SLICED`;
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => loadingScreen.remove(), 500);
    }
}
createLoadingScreen();

// welcome message
const welcomeStyle = document.createElement('style');
welcomeStyle.textContent = `
    .welcome-message {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 4.5em;
        font-family: 'Arial Black', sans-serif;
        color: #ffffff;
        text-shadow: 0 0 20px rgba(0,255,136,0.8),
                     0 0 30px rgba(0,204,255,0.8),
                     0 0 40px rgba(255,255,255,0.5);
        animation: welcomePulse 2s ease-out forwards;
        z-index: 9999;
        opacity: 0;
        pointer-events: none;
        text-align: center;
        white-space: nowrap;
    }

    @keyframes welcomePulse {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
        40% { transform: translate(-50%, -50%) scale(1); }
        80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(1.2); }
    }

    .welcome-subtext {
        font-size: 0.4em;
        display: block;
        margin-top: 10px;
        color: #00ff88;
        text-shadow: 0 0 10px rgba(0,255,136,0.5);
    }
`;
document.head.appendChild(welcomeStyle);


// Modified Loading Manager setup
const loadingManager = new THREE.LoadingManager();
let loaded = false;
let loadStartTime = Date.now();

loadingManager.onLoad = () => {
    const loadTime = Date.now() - loadStartTime;
    const remainingTime = Math.max(0, 2500 - loadTime);

    setTimeout(() => {
        if (!loaded) {
            loaded = true;
            hideLoadingScreen();
            initGame(); 

            // Create welcome message
            const welcomeDiv = document.createElement('div');
            welcomeDiv.className = 'welcome-message';
            welcomeDiv.innerHTML = 'FRUIT SLICER<div class="welcome-subtext">READY TO PLAY</div>';
            document.body.appendChild(welcomeDiv);

            // Play welcome sound after 1 second
            setTimeout(() => {
                if (welcomeBuffer) {
                    const welcomeSound = new THREE.Audio(listener);
                    welcomeSound.setBuffer(welcomeBuffer);
                    welcomeSound.setVolume(0.5);
                    welcomeSound.play();
                }
            }, 800);

            // Remove message after animation
            setTimeout(() => {
                welcomeDiv.remove();
            }, 2500);
        }
    }, remainingTime);
};

loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
    const progress = (itemsLoaded / itemsTotal) * 100;
    updateLoadingProgress(progress);
};

loadStartTime = Date.now();

// Scene setup
const scene = new THREE.Scene();
const canvas = document.querySelector('canvas.webgl');

// Camera setup
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 18);
camera.lookAt(0, 0, 0);

const listener = new THREE.AudioListener();
camera.add(listener);
let sliceSounds = [];
let sliceSound;
let currentSoundIndex = 0;
const AUDIO_POOL_SIZE = 5;

let bombSound;
let lastHoveredBomb = null;
const BOMB_AUDIO_POOL_SIZE = 3;
let bombSounds = [];
let currentBombSoundIndex = 0;

let welcomeBuffer;
let gameOverBuffer;


// Add this after creating loadingManager
const audioLoader = new THREE.AudioLoader(loadingManager);
audioLoader.load('slicing_sound.mp3', (buffer) => {

    for (let i = 0; i < AUDIO_POOL_SIZE; i++) {
        const audio = new THREE.Audio(listener);
        audio.setBuffer(buffer);
        audio.setVolume(0.3);
        sliceSounds.push(audio);
    }
});


audioLoader.load('bomb1.mp3', (buffer) => {
    for (let i = 0; i < BOMB_AUDIO_POOL_SIZE; i++) {
        const sound = new THREE.Audio(listener);
        sound.setBuffer(buffer);
        sound.setVolume(0.5);
        sound.setLoop(false);
        bombSounds.push(sound);
    }
});


audioLoader.load('welcome1.mp3', (buffer) => {
    welcomeBuffer = buffer;
});

audioLoader.load('gameover.wav', (buffer) => {
    gameOverBuffer = buffer;
});


// hearts
let lives = 5;
const livesContainer = document.createElement('div');
const gameOverScreen = document.createElement('div');

const gameStyle = document.createElement('style');
gameStyle.textContent = `
    .lives-container {
        position: fixed;
        top: 20px;
        right: 20px;
        display: flex;
        gap: 10px;
        z-index: 1000;
    }
    
    .life-icon {
        width: 40px;
        height: 40px;
        background: url('heart.png') center/contain no-repeat;
        filter: drop-shadow(0 0 5px rgba(255,50,50,0.8));
        transition: transform 0.2s;
    }
    
    .game-over {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 2000;
        color: white;
        font-family: 'Arial Black', sans-serif;
        text-align: center;
        animation: fadeIn 0.5s;
    }
    
    .game-over-content {
        transform: scale(1.2);
        text-shadow: 0 0 20px rgba(255,0,0,0.5);
    }
    
    .game-over h1 {
        font-size: 4em;
        margin: 0;
        color: #ff5555;
    }
    
    .game-over p {
        font-size: 2em;
        margin: 20px 0;
    }
    
    .restart-btn {
        padding: 15px 40px;
        font-size: 1.5em;
        background: #ff4444;
        border: none;
        border-radius: 50px;
        color: white;
        cursor: pointer;
        transition: all 0.3s;
    }
    
    .restart-btn:hover {
        background: #ff6666;
        transform: scale(1.1);
        box-shadow: 0 0 20px rgba(255,100,100,0.5);
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;
document.head.appendChild(gameStyle);

// Initialize lives display
function initLivesDisplay() {
    livesContainer.className = 'lives-container';
    for (let i = 0; i < lives; i++) {
        const life = document.createElement('div');
        life.className = 'life-icon';
        livesContainer.appendChild(life);
    }
    document.body.appendChild(livesContainer);
}

// Create game over screen
function createGameOverScreen() {
    gameOverScreen.className = 'game-over';
    gameOverScreen.innerHTML = `
        <div class="game-over-content">
            <h1>GAME OVER</h1>
            <p id="finalScore">Final Score: 0</p>
            <button class="restart-btn" onclick="location.reload()">PLAY AGAIN</button>
        </div>
    `;
    document.body.appendChild(gameOverScreen);
}

// Update lives display
function updateLives() {
    livesContainer.innerHTML = '';
    for (let i = 0; i < lives; i++) {
        const life = document.createElement('div');
        life.className = 'life-icon';
        livesContainer.appendChild(life);
    }
}


// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;


// Texture loader and environment
const textureLoader = new THREE.TextureLoader(loadingManager);
const skyTexture = textureLoader.load('sky-envmap.jpg');
skyTexture.mapping = THREE.EquirectangularReflectionMapping;
scene.background = skyTexture;
scene.environment = skyTexture;


// Game elements
let fruits = [];
let score = 0;
let isGameOver = false;
let slicedFruits = [];
let spawnInterval;

// UI Elements
const scoreElement = document.createElement('div');
scoreElement.style.position = 'absolute';
scoreElement.style.top = '20px';
scoreElement.style.left = '20px';
scoreElement.style.color = 'white';
scoreElement.style.fontSize = '24px';
document.body.appendChild(scoreElement);

// Vertical background plane
const planeTexture = textureLoader.load('background.jpeg');
planeTexture.colorSpace = THREE.SRGBColorSpace;

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(65, 28),
    new THREE.MeshStandardMaterial({
        map: planeTexture,
        shininess: 30,
        specular: 0x222222,
        side: THREE.DoubleSide,
        bumpScale: 0.05,
        reflectivity: 0.5
    })
);
plane.rotation.x = Math.PI;
plane.position.set(0, 0, -8);
plane.receiveShadow = true;
scene.add(plane);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 7.2);
directionalLight.position.set(5, 8, 5);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
scene.add(directionalLight);


// Fruit parameters
let fruitModels = [];
const scaleFactors = {
    apple: { original: 40, sliced: 0.3 },
    banana: { original: 20, sliced: 5 },
    mango: { original: 30, sliced: 0.3 },
    orange: { original: 0.04, sliced: 1.5 },
    greenlemon: { original: 50.5, sliced: 6 },
    lemon: { original: 53, sliced: 2 },
    watermelon: { original: 4, sliced: 4.5 },
    pomegranate: { original: 27.3, sliced: 0.7 },
    strawberry: { original: 0.7, sliced: 0.5 },
    bomb: { original: 10, sliced: 10 }
};


// Modified Game settings
const gameSettings = {
    spawnRate: 1500,
    maxFruits: 12,
    scorePerFruit: 10,
    bombPenalty: 50,
    bombSpawnChance: 0.15,
    planeBounds: {
        x: 32.5,
        y: 14
    },
    physics: {
        minVelocityY: 22, // Much higher initial upward velocity
        maxVelocityY: 22, // Maximum upward velocity increased
        minVelocityX: -5, // Horizontal spread (negative)
        maxVelocityX: 5,  // Horizontal spread (positive)
        gravity: 0.25,    // Stronger gravity pull
        drag: 0.99,       // Slight air resistance
        spinSpeed: 0.05   // Rotation speed
    }
};


// Load models
const gltfLoader = new GLTFLoader(loadingManager);
loadModels(); 

function loadModels() {
    const fruitTypes = Object.keys(scaleFactors);
    fruitModels = {};

fruitTypes.forEach(type => {
    fruitModels[type] = { original: null, sliced: null };
    
    // Load original model
    gltfLoader.load(`fruits/${type}.glb`, (gltf) => {
        const model = gltf.scene;
        model.scale.set(scaleFactors[type].original, scaleFactors[type].original, scaleFactors[type].original);
        model.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        fruitModels[type].original = model;
    });

    // Load sliced model
    gltfLoader.load(`fruits/sliced/sliced_${type}.glb`, (gltf) => {
        const model = gltf.scene;
        model.scale.set(scaleFactors[type].sliced, scaleFactors[type].sliced, scaleFactors[type].sliced);
        model.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        fruitModels[type].sliced = model;
    });
});
}


class SlicedFruit {
    constructor(type, position, velocity) {
        this.mesh = fruitModels[type].sliced.clone();
        this.mesh.position.copy(position);
        scene.add(this.mesh);

        // Physics setup for sliced piece to drop straight down
        this.body = new CANNON.Body({
            mass: 2,
            position: new CANNON.Vec3(position.x, position.y, position.z),
            linearDamping: 0.05, // Higher damping to reduce horizontal movement
            angularDamping: 0.99 // Almost completely dampen rotation
        });
        
        this.body.addShape(new CANNON.Sphere(0.8));
    
        this.body.velocity.set(
            velocity.x * 0.2, // Minimal horizontal velocity
            velocity.y,       // Fixed downward velocity
            0
        );
        
        this.body.angularVelocity.set(0, 0, 0);
        this.initialQuaternion = this.mesh.quaternion.clone();
        world.addBody(this.body);
    }

    update() {
        this.mesh.position.copy(this.body.position);
        this.mesh.quaternion.copy(this.initialQuaternion);
        this.body.velocity.x *= 0.95; // Dampen any horizontal movement

        if (this.body.velocity.y > -12) {
            this.body.velocity.y = -12;
        }

        if (this.body.position.y < -20) {
            this.remove();
        }
    }

    remove() {
        scene.remove(this.mesh);
        world.removeBody(this.body);
        slicedFruits = slicedFruits.filter(f => f !== this);
    }
}


class Fruit {
    constructor(camera) {
        const fruitTypes = Object.keys(fruitModels);
        const regularFruits = fruitTypes.filter(t => t !== 'bomb');
        this.type = Math.random() < gameSettings.bombSpawnChance ? 'bomb' : 
            regularFruits[Math.floor(Math.random() * regularFruits.length)];
        this.mesh = fruitModels[this.type].original.clone();
        this.camera = camera;
        
        const spawnX = THREE.MathUtils.randFloatSpread(25);
        
        // Create physics body
        this.body = new CANNON.Body({
            mass: 1,
            position: new CANNON.Vec3(spawnX, -16, 0), // Start below screen
            linearDamping: 0.01 // Very slight damping
        });
        
        // Add sphere shape (adjust radius based on fruit type)
        const radius = this.type === 'bomb' ? 2 : 1.5;
        this.body.addShape(new CANNON.Sphere(radius));
        
        // Randomly distribute initial velocities - much higher to reach top of screen
        const velocityY = THREE.MathUtils.randFloat(
            gameSettings.physics.minVelocityY, 
            gameSettings.physics.maxVelocityY
        );
        
        const velocityX = THREE.MathUtils.randFloat(
            gameSettings.physics.minVelocityX, 
            gameSettings.physics.maxVelocityX
        );
        
        // Set initial velocity - higher upward with some horizontal variation
        this.body.velocity.set(velocityX, velocityY, 0);
        
        // Add some initial spin
        this.body.angularVelocity.set(
            Math.random() - 0.5,
            Math.random() - 0.5,
            Math.random() - 0.5
        );
        
        world.addBody(this.body);

        this.isSliced = false;
        this.init();
        
        // Randomize starting rotation
        this.mesh.rotation.set(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2
        );
    }

    init() {
        this.mesh.position.copy(this.body.position);
        scene.add(this.mesh);
         
        if (this.type === 'bomb') {
            this.mesh.scale.set(10, 10, 10);
        }
    }

    update() {
        if (this.isSliced) return;

        // Sync Three.js mesh with physics body
        this.mesh.position.copy(this.body.position);
        this.mesh.quaternion.copy(this.body.quaternion);

        // Remove if below plane and off-screen
        if (this.body.position.y < -20) {
            this.remove();
        }
    }
    
    slice() {
        if (this.isSliced) return;
        this.isSliced = true;

        world.removeBody(this.body);

        if (this.type === 'bomb') {
            score = Math.max(0, score - gameSettings.bombPenalty);
            createExplosionEffect(this.mesh.position);
            this.remove();
            return;
        }

        if (sliceSounds.length > 0) {
            const sound = sliceSounds[currentSoundIndex];
            // Stop and rewind immediately
            if (sound.isPlaying) sound.stop();
            sound.play();
            // Cycle through the pool
            currentSoundIndex = (currentSoundIndex + 1) % AUDIO_POOL_SIZE;
        }
    
        score += gameSettings.scorePerFruit;

        this.mesh.visible = false;
        
        const slicedPart = new SlicedFruit(
            this.type, 
            this.mesh.position,
            new THREE.Vector3(
                this.body.velocity.x * 0.3, // Preserve some horizontal momentum
                -5,                         // Fixed downward velocity
                0                           // No depth movement
            )
        );
        slicedFruits.push(slicedPart);
        createSliceEffect(this.mesh.position);
    
        setTimeout(() => this.remove(), 50);
    }

    remove() {
        scene.remove(this.mesh);
        world.removeBody(this.body);
        fruits = fruits.filter(f => f !== this);
        // Reset hover reference if removing the hovered bomb
        if (lastHoveredBomb === this) {
            lastHoveredBomb = null;
        }
    }
}


// Game mechanics
function spawnFruit() {
    if (!isGameOver) {
        // Spawn single fruit
        if (fruits.length < gameSettings.maxFruits) {
            const newFruit = new Fruit(camera);
            fruits.push(newFruit);
        }
        
        // Occasionally spawn fruit clusters (25% chance)
        if (Math.random() < 0.25 && fruits.length + 3 <= gameSettings.maxFruits) {
            // Delay each fruit in cluster slightly for better visual effect
            setTimeout(() => {
                if (fruits.length < gameSettings.maxFruits) {
                    const fruit1 = new Fruit(camera);
                    fruits.push(fruit1);
                }
            }, 100);
            
            setTimeout(() => {
                if (fruits.length < gameSettings.maxFruits) {
                    const fruit2 = new Fruit(camera);
                    fruits.push(fruit2);
                }
            }, 200);
        }
    }
}

// Game initialization function remains the same
function initGame() {
    initLivesDisplay();
    createGameOverScreen();
    spawnInterval = setInterval(spawnFruit, gameSettings.spawnRate);
    setupInput();
    animate();
    
    // Gradually increase spawn rate and difficulty
    setInterval(() => {
        gameSettings.spawnRate = Math.max(800, gameSettings.spawnRate - 50);
        gameSettings.physics.minVelocityY = Math.min(26, gameSettings.physics.minVelocityY + 0.1);
        gameSettings.physics.maxVelocityY = Math.min(32, gameSettings.physics.maxVelocityY + 0.1);
        gameSettings.bombSpawnChance = Math.min(0.25, gameSettings.bombSpawnChance + 0.01);
        
        clearInterval(spawnInterval);
        spawnInterval = setInterval(spawnFruit, gameSettings.spawnRate);
    }, 10000);
}


function setupInput() {


    const cursor = document.createElement('img');
    cursor.className = 'custom-cursor';
    cursor.src = 'sword_cursor2.png';
    document.body.appendChild(cursor);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let lastIntersection = null;
    const slashPoints = [];
    const slashLine = createSlashLine();
    scene.add(slashLine);

    function onPointerMove(event) {

        const x = event.clientX || event.touches?.[0]?.clientX;
        const y = event.clientY || event.touches?.[0]?.clientY;
        if (x && y) {
            cursor.style.left = `${x}px`;
            cursor.style.top = `${y}px`;
        }

        // Add slicing animation
        cursor.classList.add('cursor-slice');
        setTimeout(() => cursor.classList.remove('cursor-slice'), 100);

        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Update slash visualization
        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObject(plane);
        
        if (intersects.length > 0) {
            slashPoints.push(intersects[0].point.clone());
            if (slashPoints.length > 10) slashPoints.shift();
            updateSlashLine(slashPoints, slashLine);
        }

        // Continuous slicing check
        checkIntersection();

        document.addEventListener('click', () => {
            if (sliceSound && sliceSound.context.state === 'suspended') {
                sliceSound.context.resume();
            }

            const context = listener.context;
            if (context.state === 'suspended') {
                context.resume();
            }
        });
    }


    function checkIntersection() {
        if (isGameOver) return;

        let currentBomb = null;
    
        raycaster.setFromCamera(pointer, camera);
        const planeIntersects = raycaster.intersectObject(plane);
        if (planeIntersects.length === 0) return;
        const cursorWorldPos = planeIntersects[0].point;
        const hitRadius = 2.5;
    
        // Check all fruits for proximity using 2D distance
        fruits.forEach(fruit => {
            if (fruit.isSliced) return;
    
            // Calculate 2D distance (ignore Z-axis)
            const dx = cursorWorldPos.x - fruit.body.position.x;
            const dy = cursorWorldPos.y - fruit.body.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            const effectiveRadius = fruit.type === 'bomb' ? 2 : 1.5;
    
            if (distance < hitRadius + effectiveRadius) {
                // Visual feedback and slicing logic
                fruit.mesh.traverse(child => {
                    if (child.isMesh && child.material) {
                        child.material.emissive?.setHex(0xff0000);
                    }
                });
    
                setTimeout(() => {
                    fruit.mesh.traverse(child => {
                        if (child.isMesh && child.material) {
                            child.material.emissive?.setHex(0x000000);
                        }
                    });
                }, 50);
    
                fruit.slice();
                
                if (fruit.type === 'bomb') {
                    currentBomb = fruit;
                }
            }
        });

        if (currentBomb && bombSounds.length > 0) {
            const sound = bombSounds[currentBombSoundIndex];
            if (sound.isPlaying) sound.stop();
            sound.play();
            currentBombSoundIndex = (currentBombSoundIndex + 1) % BOMB_AUDIO_POOL_SIZE;
    
            // Deduct life only if it's a new bomb hover
            if (currentBomb !== lastHoveredBomb) {
                lives = Math.max(0, lives - 1);
                updateLives();
                
                if (lives <= 0) {
                    isGameOver = true;
                    gameOverScreen.style.display = 'flex';

                    if (gameOverBuffer) {
                        const gameOverSound = new THREE.Audio(listener);
                        gameOverSound.setBuffer(gameOverBuffer);
                        gameOverSound.setVolume(0.7);
                        gameOverSound.play();
                    }

                    const finalScoreElement = document.getElementById('finalScore');
                    if (finalScoreElement) {
                        finalScoreElement.textContent = `Final Score: ${score}`;
                    }

                    clearInterval(spawnInterval);
                    fruits.forEach(fruit => world.removeBody(fruit.body));
                    slicedFruits.forEach(sliced => world.removeBody(sliced.body));
                }
            }
        }
        
        lastHoveredBomb = currentBomb;
    }

    function createSlashLine() {
        const lineGeometry = new THREE.BufferGeometry();
        const lineMaterial = new THREE.LineBasicMaterial({ 
            color: 0xff0000,
            transparent: true,
            opacity: 0.7
        });
        return new THREE.Line(lineGeometry, lineMaterial);
    }

    function updateSlashLine(points, line) {
        if (points.length < 2) return;
        const positions = new Float32Array(points.length * 3);
        points.forEach((point, i) => {
            positions[i*3] = point.x;
            positions[i*3+1] = point.y;
            positions[i*3+2] = point.z;
        });
        line.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        line.geometry.attributes.position.needsUpdate = true;
    }

    // Event listeners
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('touchmove', e => {
        e.preventDefault();
        onPointerMove(e.touches[0]);
    });
}

// Modified createSliceEffect
function createSliceEffect(position) {
    const particles = new THREE.Group();
    const colors = [0xff0000, 0xff8800, 0xffff00];
    
    for (let i = 0; i < 25; i++) {
        const particle = new THREE.Mesh(
            new THREE.SphereGeometry(0.2),
            new THREE.MeshBasicMaterial({
                color: colors[Math.floor(Math.random() * colors.length)],
                transparent: true
            })
        );
        particle.position.copy(position);
        particle.velocity = new THREE.Vector3(
            THREE.MathUtils.randFloat(-3, 3),
            THREE.MathUtils.randFloat(-1, 4),
            THREE.MathUtils.randFloat(-1, 1)
        );
        particle.material.opacity = 1;
        particles.add(particle);
    }

    // Animation loop
    const animate = () => {
        particles.children.forEach(particle => {
            particle.position.add(particle.velocity);
            particle.material.opacity *= 0.92;
            particle.velocity.y -= 0.08;
            particle.velocity.multiplyScalar(0.95);
        });
        
        if (particles.children[0]?.material.opacity > 0.1) {
            requestAnimationFrame(animate);
        } else {
            scene.remove(particles);
        }
    };
    
    scene.add(particles);
    animate();
}


function createExplosionEffect(position) {

    // Add temporary score penalty display
    const penaltyDisplay = document.createElement('div');
    penaltyDisplay.className = 'score-penalty';
    penaltyDisplay.textContent = `-${gameSettings.bombPenalty}`;
    penaltyDisplay.style.left = `${event.clientX}px`;
    penaltyDisplay.style.top = `${event.clientY}px`;
    document.body.appendChild(penaltyDisplay);

    setTimeout(() => {
        document.body.removeChild(penaltyDisplay);
    }, 1000);
    // Particles
    const particles = new THREE.Group();
    const colors = [0xff0000, 0x222222, 0xff6600, 0x444444];
    
    for (let i = 0; i < 150; i++) {
        const particle = new THREE.Mesh(
            new THREE.SphereGeometry(0.4),
            new THREE.MeshBasicMaterial({
                color: colors[Math.floor(Math.random() * colors.length)],
                transparent: true
            })
        );
        particle.position.copy(position);
        particle.velocity = new THREE.Vector3(
            THREE.MathUtils.randFloat(-8, 8),
            THREE.MathUtils.randFloat(-8, 8),
            THREE.MathUtils.randFloat(-8, 8)
        );
        particle.material.opacity = 1;
        particles.add(particle);
    }

    // Shockwave sphere
    const shockwaveGeometry = new THREE.SphereGeometry(1, 32, 32);
    const shockwaveMaterial = new THREE.MeshBasicMaterial({
        color: 0xff4444,
        transparent: true,
        opacity: 0.8
    });
    const shockwave = new THREE.Mesh(shockwaveGeometry, shockwaveMaterial);
    shockwave.position.copy(position);
    scene.add(shockwave);

    // Animation
    let scale = 1;
    const animate = () => {
        // Update particles
        particles.children.forEach(particle => {
            particle.position.add(particle.velocity);
            particle.material.opacity *= 0.88;
            particle.velocity.multiplyScalar(0.94);
        });

        // Update shockwave
        scale += 3;
        shockwave.scale.set(scale, scale, scale);
        shockwave.material.opacity *= 0.82;

        // Cleanup
        if (shockwave.material.opacity < 0.1) {
            scene.remove(shockwave);
            scene.remove(particles);
        } else {
            requestAnimationFrame(animate);
        }
    };

    scene.add(particles);
    animate();

    // Destroy nearby fruits in radius
    const blastRadius = 5;
    fruits.forEach(fruit => {
        if (fruit.mesh.position.distanceTo(position) < blastRadius) {
            fruit.slice();
        }
    });
}


// Resize handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});


// Game loop
function animate() {
    requestAnimationFrame(animate);
    world.step(1/60);

    
    if (!isGameOver) {
        fruits.forEach(fruit => fruit.update());
        slicedFruits.forEach(sliced => sliced.update()); // Add this line
        updateUI();
    }
    renderer.render(scene, camera);
}

function updateUI() {
    scoreElement.textContent = `Score: ${score}`;
}

