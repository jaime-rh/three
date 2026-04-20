import * as THREE from 'three';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.152/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'https://cdn.jsdelivr.net/npm/three@0.152/examples/jsm/loaders/FBXLoader.js';
import { OBJLoader } from 'https://cdn.jsdelivr.net/npm/three@0.152/examples/jsm/loaders/OBJLoader.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.152/examples/jsm/controls/OrbitControls.js';

//modelos fuera del loader
let model1;
let model2;

let model2InitialPosition = null;
let model2InitialRotation = null;

let valor = 0; // estado inicial

  document.getElementById("alarma").addEventListener("click", () => {
    valor = valor === 0 ? 1 : 0;
    console.log("Valor actual de la alarma:", valor);
  });


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
camera.position.set(0, 1, 30);

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

//Loader GLB/GLTF
const loader = new GLTFLoader();

loader.load(
  './P_CalleReal84_2.glb',
  (gltf) => {

    model1 = gltf.scene;
    scene.add(model1);

    // centrar modelo
    const box = new THREE.Box3().setFromObject(model1);
    const center = box.getCenter(new THREE.Vector3());

    model1.position.x -= center.x;
    model1.position.y -= center.y;
    model1.position.z -= center.z;
  }
);

//Loader2
const loader2 = new FBXLoader();

loader2.load('./caj.fbx', (fbx) => {
  model2 = fbx;
  scene.add(model2);

  model2.scale.set(0.01, 0.01, 0.01); 
  model2.position.set(11, -1, 1);

  // Guardar posición y rotación inicial
  model2InitialPosition = model2.position.clone();
  model2InitialRotation = model2.rotation.clone();

  fbx.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
});

function animate() {
  requestAnimationFrame(animate);

  if (model2) {
    if (valor === 1) {
      model2.rotation.y += 0.04;
    } else {
      // Restaurar posición y rotación
      model2.position.copy(model2InitialPosition);
      model2.rotation.copy(model2InitialRotation);
    }
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();

/*

// Loader FBX
const loader = new FBXLoader();

loader.load('./caj.fbx', (fbx) => {
  scene.add(fbx);

  // Ajustes típicos
  fbx.scale.set(0.01, 0.01, 0.01); 
  fbx.position.set(0, 0, 0);

  // Opcional: sombras
  fbx.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
});

// Loader OBJ
const loader = new OBJLoader();

loader.load('./Cajero.obj', (obj) => {

  // Material básico (OBJ no siempre trae materiales bien)
  obj.traverse((child) => {
    if (child.isMesh) {
      child.material = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
    }
  });

  obj.scale.set(1, 1, 1);
  scene.add(obj);
});

*/

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* Animación
function animate() {
  requestAnimationFrame(animate);

  controls.update(); // 🔴 obligatorio si usas damping

  renderer.render(scene, camera);
}

animate();
*/