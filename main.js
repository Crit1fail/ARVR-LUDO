import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';


window.startGame = function() {
 
    document.getElementById('menu').style.display = 'none';
    
    // Start the game 
    initGame(); 
}

// Create a new scene
function initGame () {
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // Enables the  shadow mapping for lighting
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

// Loads the Ludo board texture from textures
const textureLoader = new THREE.TextureLoader();
const boardTexture = textureLoader.load('textures/board.jpg'); // Path to your board image

// Creates the 3D Ludo board with depth (extrusion for thickness)
const boardGeometry = new THREE.BoxGeometry(10, 0.5, 10); // Width, height, depth
const boardMaterial = new THREE.MeshPhongMaterial({ map: boardTexture });
const board = new THREE.Mesh(boardGeometry, boardMaterial);
board.receiveShadow = true; // Board receives shadows
board.castShadow = true; // board casting shadows on the mat
scene.add(board);

// Create a larger mat (plane) below the board
const matGeometry = new THREE.PlaneGeometry(15, 15); // Larger than the board
const matMaterial = new THREE.MeshPhongMaterial({ color: 0xaaaaaa }); // Gray color for the mat
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

// Add ambient light for soft lighting
const ambientLight = new THREE.AmbientLight(0x404040, 0.8); 
scene.add(ambientLight);

// Add directional light that will act as the sun
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(0, 10, 0); // Initial position of the light
directionalLight.castShadow = true; // Enable shadows
scene.add(directionalLight); // Add to the scene

// Position the camera to see under the board
camera.position.set(0, 5, 15); // Adjust height to see under the board
camera.lookAt(0, 0, 0);

// Add orbit controls for rotating the view
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // makes rotation smoother
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI; // Allows looking from above and below the board

// Mouse movement event listener
window.addEventListener('mousemove', (event) => {
   
    const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update directional light position based on mouse coordinates
    directionalLight.position.x = mouseX * 10; // Adjust the scaling factor
    directionalLight.position.z = mouseY * 10; // Adjust the scaling factor
    directionalLight.position.y = 10; // Keep the light above the board

    // Debugging: Log the light's position
    console.log(`Light Position - x: ${directionalLight.position.x}, z: ${directionalLight.position.z}`);
});

// Animation loop
function animate() {
    // Dice rotation for added animation
    dice.rotation.x += 0.01; // Rotate the dice on x-axis
    dice.rotation.y += 0.01; // Rotate the dice on y-axis

    controls.update(); // Update controls
    renderer.render(scene, camera);
}
}
