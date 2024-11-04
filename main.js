import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Function to load a texture
const loadTexture = (path) => new THREE.TextureLoader().load(path);

// Load your space textures into an array
const materials = [
    loadTexture("./textures/space1.jpg"),
    loadTexture("./textures/space5.jpg"),
    loadTexture("./textures/space1.jpg"),
    loadTexture("./textures/space5.jpg"),
    loadTexture("./textures/space1.jpg"),
    loadTexture("./textures/space5.jpg"),
];

window.startGame = function() {
    document.getElementById('menu').style.display = 'none';
    initGame(); 
}

// Create a new scene
function initGame() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer({ antialias: true }); // Enable antialiasing
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true; // Enables shadow mapping
    document.body.appendChild(renderer.domElement);

    // Create a spherical geometry for the space background
    const sphereGeometry = new THREE.SphereGeometry(500, 128, 128); // Increased segments for smoother appearance
    const sphereMaterial = new THREE.MeshBasicMaterial({
        map: materials[0], // Use the first space texture for the inside of the sphere
        side: THREE.BackSide // Render the inside of the sphere
    });

    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphere); // Add the sphere to the scene

    // Load the Ludo board texture
    const textureLoader = new THREE.TextureLoader();
    const boardTexture = textureLoader.load('textures/board.jpg');

    // Create the 3D Ludo board
    const boardGeometry = new THREE.BoxGeometry(10, 0.5, 10);
    const boardMaterial = new THREE.MeshPhongMaterial({ map: boardTexture });
    const board = new THREE.Mesh(boardGeometry, boardMaterial);
    board.receiveShadow = true; // Board receives shadows
    board.castShadow = true; // Board casting shadows on the mat
    scene.add(board);

    // Create a larger mat below the board
    const matGeometry = new THREE.PlaneGeometry(15, 15);
    const matMaterial = new THREE.MeshPhongMaterial({ color: 0xaaaaaa });
    const mat = new THREE.Mesh(matGeometry, matMaterial);
    mat.rotation.x = -Math.PI / 2; // Keep the mat flat (rotated to face upwards)
    mat.position.set(0, -2.0, 0); // Position directly below the board
    mat.receiveShadow = true; // Mat receives shadows from the board only
    scene.add(mat);

    // Function to create coins
    function createCoin(color, x, z) {
        const coinRadius = 0.4; // Adjust the size of the coin to fit within the grid
        const coinHeight = 0.2; // Thickness of the coin
        const coinGeometry = new THREE.CylinderGeometry(coinRadius, coinRadius, coinHeight, 32);
        const coinMaterial = new THREE.MeshPhongMaterial({ color: color });
        const coin = new THREE.Mesh(coinGeometry, coinMaterial);
        coin.position.set(x, 0.8, z); // Position the coin slightly above the board
        coin.castShadow = true; // Coins cast shadows on the board only
        coin.receiveShadow = false; // Coins do not receive shadows
        scene.add(coin);
    }

    // Calculate the offset to position coins in the 4x4 grid areas on each corner
    const boardSize = 10;
    const offset = boardSize / 2.5; // Adjust to match the grid of the board

    // Blue coins
    createCoin(0x0000ff, -offset + 0.6, offset - 0.6);
    createCoin(0x0000ff, -offset + 2, offset - 0.6);
    createCoin(0x0000ff, -offset + 0.6, offset - 2);
    createCoin(0x0000ff, -offset + 2, offset - 2);

    // Yellow coins
    createCoin(0xffff00, offset - 0.6, offset - 0.6);
    createCoin(0xffff00, offset - 2, offset - 0.6);
    createCoin(0xffff00, offset - 0.6, offset - 2);
    createCoin(0xffff00, offset - 2, offset - 2);

    // Green coins
    createCoin(0x00ff00, offset - 0.6, -offset + 0.6);
    createCoin(0x00ff00, offset - 2, -offset + 0.6);
    createCoin(0x00ff00, offset - 0.6, -offset + 2);
    createCoin(0x00ff00, offset - 2, -offset + 2);

    // Red coins
    createCoin(0xff0000, -offset + 0.6, -offset + 0.6);
    createCoin(0xff0000, -offset + 2, -offset + 0.6);
    createCoin(0xff0000, -offset + 0.6, -offset + 2);
    createCoin(0xff0000, -offset + 2, -offset + 2);

    // Load dice face textures
    const diceFaceTextures = [
        new THREE.MeshPhongMaterial({ map: textureLoader.load('textures/one.png') }), 
        new THREE.MeshPhongMaterial({ map: textureLoader.load('textures/two.png') }), 
        new THREE.MeshPhongMaterial({ map: textureLoader.load('textures/three.png') }), 
        new THREE.MeshPhongMaterial({ map: textureLoader.load('textures/four.png') }), 
        new THREE.MeshPhongMaterial({ map: textureLoader.load('textures/five.png') }), 
        new THREE.MeshPhongMaterial({ map: textureLoader.load('textures/six.png') })  
    ];

    // Creating dice with textures
    const diceGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const dice = new THREE.Mesh(diceGeometry, diceFaceTextures);
    dice.position.set(0, 2, 0); // Dice above the board
    dice.castShadow = true; // Dice casts shadows on the board only
    dice.receiveShadow = false; // Dice do not receive shadows
    scene.add(dice);

    // Create a directional light to simulate sunlight
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.5); // White light with intensity
    sunLight.position.set(5, 10, 5); // Position of the sun in the scene
    sunLight.castShadow = true; // Enable shadows from the sun
    scene.add(sunLight);

    // Set shadow properties
    sunLight.shadow.mapSize.width = 2048; // Increased resolution for shadows
    sunLight.shadow.mapSize.height = 2048; // Increased resolution for shadows
    sunLight.shadow.camera.near = 0.5; // Default
    sunLight.shadow.camera.far = 50; // Default
    sunLight.shadow.bias = -0.002; // Adjust to reduce shadow artifacts

    // Add ambient light for soft lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.8); 
    scene.add(ambientLight);

    // Position the camera to see under the board
    camera.position.set(0, 5, 15); // Adjust height to see under the board
    camera.lookAt(0, 0, 0);

    // Add orbit controls for rotating the view
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Makes rotation smoother
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI; // Allows looking from above and below the board

    // Animation loop
    function animate() {
        // Dice rotation for added animation
        dice.rotation.x += 0.01; // Rotate the dice on x-axis
        dice.rotation.y += 0.01; // Rotate the dice on y-axis
        
        controls.update(); // Update the controls
        renderer.render(scene, camera);
        requestAnimationFrame(animate); // Loop the animation
    }
    
    animate(); // Start the animation
}

// Handle window resizing
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});
