import * as THREE from 'three';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.152/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'https://cdn.jsdelivr.net/npm/three@0.152/examples/jsm/loaders/FBXLoader.js';
import { OBJLoader } from 'https://cdn.jsdelivr.net/npm/three@0.152/examples/jsm/loaders/OBJLoader.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.152/examples/jsm/controls/OrbitControls.js';

//modelos fuera del loader
let model1;
let model2;
let modelBarrera;
let modelBarreraSalida;
let modelAlarma;
let modelInterfonoSalida;
let modelInterfonoEntrada;

let model2InitialPosition = null;
let model2InitialRotation = null;

let valor = 0; 

document.getElementById("alarma").addEventListener("click", () => {
  valor = valor === 0 ? 1 : 0;
  console.log("Valor actual de la alarma:", valor);
});

let valorBarreraEntrada = 0; 

document.getElementById("barreraEntrada").addEventListener("click", () => {
  valorBarreraEntrada = valorBarreraEntrada === 0 ? 1 : 0;
  console.log("Valor actual de la barrera de entrada:", valorBarreraEntrada);
});

let valorBarreraSalida = 0; 

document.getElementById("barreraSalida").addEventListener("click", () => {
  valorBarreraSalida = valorBarreraSalida === 0 ? 1 : 0;
  console.log("Valor actual de la barrera de salida:", valorBarreraSalida);
});

let valorInterfonoSalida = 0; 

document.getElementById("InterfonoSalida").addEventListener("click", () => {
  valorInterfonoSalida = valorInterfonoSalida === 0 ? 1 : 0;
  console.log("Valor actual del interfono de salida:", valorInterfonoSalida);
});

let valorInterfonoEntrada = 0; 

document.getElementById("InterfonoEntrada").addEventListener("click", () => {
  valorInterfonoEntrada = valorInterfonoEntrada === 0 ? 1 : 0;
  console.log("Valor actual del interfono de salida:", valorInterfonoEntrada);
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

//Loader GLB/GLTF PLANO
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

//CAJERO
const loader2 = new GLTFLoader();

loader2.load(
  './cajequinsa.glb',
  (gltf) => {

    model2 = gltf.scene;
    scene.add(model2);

    model2.scale.set(1, 1, 1);
    model2.position.set(11, -1, 0.3);
  }
);


// BARRERA ENTRADA
const loaderBarreraEntrada = new GLTFLoader();

let barreraPivot = new THREE.Group();
scene.add(barreraPivot);

let barreraInitialRotation = new THREE.Euler();

loaderBarreraEntrada.load('./bar.glb', (gltf) => {

    modelBarrera = gltf.scene;

    // Escalar y orientar
    modelBarrera.scale.set(0.65, 0.65, 0.65);
    modelBarrera.rotation.y = Math.PI / 2;

    // Colocar la barrera en su sitio FINAL
    modelBarrera.position.set(-4.6, -1, 2.4);

    // Añadir temporalmente a la escena para calcular bounding box en mundo
    scene.add(modelBarrera);

    // Obtener bounding box en coordenadas MUNDO
    const box = new THREE.Box3().setFromObject(modelBarrera);
    const min = box.min.clone(); // esquina inferior-izquierda-trasera

    // Quitar de la escena (la moveremos al pivot)
    scene.remove(modelBarrera);

    // Colocar el pivot EXACTAMENTE en la esquina del modelo
    barreraPivot.position.copy(min);

    // Añadir el modelo al pivot
    barreraPivot.add(modelBarrera);

    // Mover el modelo dentro del pivot para que la esquina quede en el origen
    modelBarrera.position.sub(min);

    // Guardar rotación inicial del pivot
    barreraInitialRotation.copy(barreraPivot.rotation);
});

// BARRERA SALIDA
const loaderBarreraSalida = new GLTFLoader();

let barreraPivotSalida = new THREE.Group();
scene.add(barreraPivotSalida);

let barreraInitialRotationSalida = new THREE.Euler();

loaderBarreraSalida.load('./bar.glb', (gltf) => {

    modelBarreraSalida = gltf.scene;

    // Escalar y orientar
    modelBarreraSalida.scale.set(0.65, 0.65, 0.65);
    modelBarreraSalida.rotation.y = Math.PI / 2;

    // Colocar la barrera en su sitio FINAL
    modelBarreraSalida.position.set(-8, -2.2, -1.2);

    // Añadir temporalmente a la escena para calcular bounding box en mundo
    scene.add(modelBarreraSalida);

    // Obtener bounding box en coordenadas MUNDO
    const box = new THREE.Box3().setFromObject(modelBarreraSalida);
    const max = box.max.clone(); // esquina inferior-izquierda-trasera

    // Quitar de la escena (la moveremos al pivot)
    scene.remove(modelBarreraSalida);

    // Colocar el pivot EXACTAMENTE en la esquina del modelo
    barreraPivotSalida.position.copy(max);

    // Añadir el modelo al pivot
    barreraPivotSalida.add(modelBarreraSalida);

    // Mover el modelo dentro del pivot para que la esquina quede en el origen
    modelBarreraSalida.position.sub(max);

    // Guardar rotación inicial del pivot
    barreraInitialRotationSalida.copy(barreraPivotSalida.rotation);
});

//ALARMA
const loaderAlarma = new GLTFLoader();

loaderAlarma.load(
  './alarma.glb',
  (gltf) => {

    modelAlarma = gltf.scene;
    scene.add(modelAlarma);

    modelAlarma.scale.set(0.65, 0.65, 0.65);
    modelAlarma.position.set(12, 5, 0.3);

    modelAlarma.position.x -= center.x;
    modelAlarma.position.y -= center.y;
    modelAlarma.position.z -= center.z;
    
  }
);

//INTERFONO SALIDA
const loaderInterfonoSalida = new GLTFLoader();

loaderInterfonoSalida.load(
  './person.glb',
  (gltf) => {

    modelInterfonoSalida = gltf.scene;
    scene.add(modelInterfonoSalida);

    modelInterfonoSalida.scale.set(2, 2, 2);
    modelInterfonoSalida.position.set(-9, 0.75, 7);
    modelInterfonoSalida.rotation.y = -Math.PI / 2;
  }
);

//INTERFONO ENTRADA
const loaderInterfonoEntrada = new GLTFLoader();

loaderInterfonoEntrada.load(
  './person.glb',
  (gltf) => {

    modelInterfonoEntrada = gltf.scene;
    scene.add(modelInterfonoEntrada);

    modelInterfonoEntrada.scale.set(2, 2, 2);
    modelInterfonoEntrada.position.set(-4, -1.4, -1);
    modelInterfonoEntrada.rotation.y = Math.PI / 2;
  }
);

//barrera entrada
let barreraAngleUp = Math.PI * 5 / 12;  // 75 grados
let barreraAngleDown = 0;
let barreraCurrentAngle = 0;
let barreraSpeed = 0.1;

//barrera salida
let barreraAngleUpSalida = -Math.PI * 5 / 12;  // 75 grados
let barreraAngleDownSalida = 0;
let barreraCurrentAngleSalida = 0;
let barreraSpeedSalida = 0.1;

function animate() {
  requestAnimationFrame(animate);

  if (modelAlarma) {
      if (valor === 1) {
          modelAlarma.visible = true;
          modelAlarma.rotation.y += 0.06;
      } else {
          modelAlarma.visible = false;
      }
  }

  if (modelInterfonoSalida) {
      if (valorInterfonoSalida === 1) {
          modelInterfonoSalida.visible = true;
      } else {
          modelInterfonoSalida.visible = false;
      }
  }

  if (modelInterfonoEntrada) {
      if (valorInterfonoEntrada === 1) {
          modelInterfonoEntrada.visible = true;
      } else {
          modelInterfonoEntrada.visible = false;
      }
  }


  if (barreraPivot) {

      let targetAngle = valorBarreraEntrada === 1 ? barreraAngleUp : barreraAngleDown;

      barreraCurrentAngle += (targetAngle - barreraCurrentAngle) * barreraSpeed;

      // ROTACIÓN SOBRE EL EJE Z DESDE EL EXTREMO
      barreraPivot.rotation.z = barreraInitialRotation.z + barreraCurrentAngle;
  }

  if (barreraPivotSalida) {

      let targetAngle = valorBarreraSalida === 1 ? barreraAngleUpSalida : barreraAngleDownSalida;

      barreraCurrentAngleSalida += (targetAngle - barreraCurrentAngleSalida) * barreraSpeedSalida;

      // ROTACIÓN SOBRE EL EJE Z DESDE EL EXTREMO
      barreraPivotSalida.rotation.z = barreraInitialRotationSalida.z + barreraCurrentAngleSalida;
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