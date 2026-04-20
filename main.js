import * as THREE from 'three';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.152/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.152/examples/jsm/controls/OrbitControls.js';

// Escena
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

// Cámara
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 1, 5);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//cam orbital
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // movimiento suave
controls.dampingFactor = 0.05;

controls.enableZoom = true;
controls.enablePan = true;

// Luces
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

// Loader GLTF
const loader = new GLTFLoader();

loader.load(
  './lobo.glb', // asegúrate de que la ruta es correcta
  (gltf) => {
    const model = gltf.scene;
    scene.add(model);

    // Ajustes opcionales
    model.position.set(0, 0, 0);
    model.scale.set(1, 1, 1);
  },
  undefined,
  (error) => {
    console.error('Error cargando modelo:', error);
  }
);

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animación
function animate() {
  requestAnimationFrame(animate);

  controls.update(); // 🔴 obligatorio si usas damping

  renderer.render(scene, camera);
}

animate();