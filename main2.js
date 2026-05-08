import * as THREE from 'three';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.152/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'https://cdn.jsdelivr.net/npm/three@0.152/examples/jsm/loaders/FBXLoader.js';
import { OBJLoader } from 'https://cdn.jsdelivr.net/npm/three@0.152/examples/jsm/loaders/OBJLoader.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.152/examples/jsm/controls/OrbitControls.js';

//modelos fuera del loader
let plano;
let barreraEntrada;
let barreraSalida;
let alarma;
let interfonoEntrada;
let interfonoSalida;
let interfonoCajero;
let luz;

let girandoHelicopter = false;
let tHeli = 0;
let valorAlarma = 0; 

document.getElementById("alarma").addEventListener("click", () => {
  valorAlarma = valorAlarma === 0 ? 1 : 0;
  console.log("Valor actual de la alarma:", valorAlarma);
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

let valorHelicopter = 0; 

document.getElementById("helicopter").addEventListener("click", () => {
  girandoHelicopter = true;
  tHeli = 0;
});

let valorInterfonoSalida = 0; 

document.getElementById("InterfonoSalida").addEventListener("click", () => {
  valorInterfonoSalida = valorInterfonoSalida === 0 ? 1 : 0;
  console.log("Valor actual del interfono de salida:", valorInterfonoSalida);
  if (valorInterfonoSalida === 1) {
      activarSalida();
  } else {
      desactivarSalida();
  }
});

let valorInterfonoEntrada = 0; 

document.getElementById("InterfonoEntrada").addEventListener("click", () => {
  valorInterfonoEntrada = valorInterfonoEntrada === 0 ? 1 : 0;
  console.log("Valor actual del interfono de entarda:", valorInterfonoEntrada);
  if (valorInterfonoEntrada === 1) {
      activarEntrada();
  } else {
      desactivarEntrada();
  }
});

let valorInterfonoCajero = 0; 

document.getElementById("InterfonoCajero").addEventListener("click", () => {
  valorInterfonoCajero = valorInterfonoCajero === 0 ? 1 : 0;
  console.log("Valor actual del interfono del cajero:", valorInterfonoCajero);
  if (valorInterfonoCajero === 1) {
      activarCajero();
  } else {
      desactivarCajero();
  }
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
const loaderPlano = new GLTFLoader();
//entrada
const qClosed1 = new THREE.Quaternion();
const qOpen1 = new THREE.Quaternion();
//salida
const qClosed2 = new THREE.Quaternion();
const qOpen2 = new THREE.Quaternion();

loaderPlano.load(
  './planoPrueba.glb',
  (gltf) => {

    plano = gltf.scene;
    scene.add(plano);

    // centrar modelo
    const box = new THREE.Box3().setFromObject(plano);
    const center = box.getCenter(new THREE.Vector3());

    plano.position.x -= center.x;
    plano.position.y -= center.y;
    plano.position.z -= center.z;

    //nombre de nodos por consola
    plano.traverse((obj) => {
        console.log(obj.name, obj.type);
    });

    barreraEntrada = plano.getObjectByName("BarreraEntarda");
    barreraSalida = plano.getObjectByName("BarreraSalida");
    alarma = plano.getObjectByName("alarma");
    interfonoEntrada = plano.getObjectByName("cocheEntrada");
    interfonoSalida = plano.getObjectByName("cocheSalida");
    interfonoCajero = plano.getObjectByName("persona");

    //estado inicial de interfonos
    interfonoCajero.visible = false;
    interfonoEntrada.visible = false;
    interfonoSalida.visible = false;

    // estado cerrado entrada
    qClosed1.copy(barreraEntrada.quaternion);
    // estado cerrado salida
    qClosed2.copy(barreraSalida.quaternion);

    const axis1 = new THREE.Vector3(-1, 0, 0); // eje local der
    const axis2 = new THREE.Vector3(1, 0, 0); // eje local izq


    const offset1 = new THREE.Quaternion().setFromAxisAngle(
        axis1,
        THREE.MathUtils.degToRad(75)
    );

    const offset2 = new THREE.Quaternion().setFromAxisAngle(
        axis2,
        THREE.MathUtils.degToRad(75)
    );


    // estado abierto = cerrado + 75 grados
    qOpen1.copy(qClosed1).multiply(offset1);
    qOpen2.copy(qClosed2).multiply(offset2);
  }
);

//camara inicial
const cameraInitialTarget = new THREE.Vector3(0, 0, 0);
const cameraInitialPosition = new THREE.Vector3().copy(camera.position);
//camara cajero
const camTargetPositionCajero = new THREE.Vector3();
const cameraOffsetCajero = new THREE.Vector3(0, 2, 5);
//camara barrera entrada
const camTargetPositionEntrada = new THREE.Vector3();
const cameraOffsetEntrada = new THREE.Vector3(-2, 2, 3);
//camara barrera salida
const camTargetPositionSalida = new THREE.Vector3();
const cameraOffsetSalida = new THREE.Vector3(6, 0, -3);

let modoCajeroActivo = false;
let modoEntradaActivo = false;
let modoSalidaActivo = false;
let volviendoACamara = false;

function activarCajero() {
    modoCajeroActivo = true;
    controls.enabled = false;
}

function desactivarCajero() {
    modoCajeroActivo = false;
    volviendoACamara = true;
}

function activarEntrada() {
    modoEntradaActivo = true;
    controls.enabled = false;
}

function desactivarEntrada() {
    modoEntradaActivo = false;
    volviendoACamara = true;
}

function activarSalida() {
    modoSalidaActivo = true;
    controls.enabled = false;
}

function desactivarSalida() {
    modoSalidaActivo = false;
    volviendoACamara = true;
}



function animate() {
    requestAnimationFrame(animate);

    if(alarma){
        if(valorAlarma === 0){
            alarma.visible = false;
        }else{
            alarma.visible = true;
            alarma.rotation.z += 0.06;
        }
    }

    if (barreraEntrada) {
        const target = valorBarreraEntrada === 1 ? qOpen1 : qClosed1;
        barreraEntrada.quaternion.slerp(target, 0.1);
    }

    if (barreraSalida) {
        const target = valorBarreraSalida === 1 ? qOpen2 : qClosed2;
        barreraSalida.quaternion.slerp(target, 0.1);
    }

    if (girandoHelicopter && barreraEntrada && barreraSalida) {

        tHeli += 0.05; //velocidad

        const angle = Math.PI * 2 * tHeli; //360

        const axisEntrada = new THREE.Vector3(0, -1, 0);
        const axisSalida  = new THREE.Vector3(0, 1, 0);

        const qSpin1 = new THREE.Quaternion().setFromAxisAngle(axisEntrada, angle);
        const qSpin2 = new THREE.Quaternion().setFromAxisAngle(axisSalida, angle);

        //usar estado actual como base
        barreraEntrada.quaternion.multiply(qSpin1);
        barreraSalida.quaternion.multiply(qSpin2);

        if (tHeli >= 2.5) { //segundos
            girandoHelicopter = false;
        }
    }

   if (modoCajeroActivo) {
        interfonoCajero.visible = true;
        camTargetPositionCajero
            .copy(interfonoCajero.position)
            .add(cameraOffsetCajero);

        camera.position.lerp(camTargetPositionCajero, 0.05);
        camera.lookAt(interfonoCajero.position);
    } else if (volviendoACamara) {
        interfonoCajero.visible = false;
        camera.position.lerp(cameraInitialPosition, 0.15);
        controls.target.lerp(cameraInitialTarget, 0.15);

        camera.lookAt(controls.target);

        const dist = camera.position.distanceTo(cameraInitialPosition);

        if (dist < 0.15) {
            volviendoACamara = false;
            controls.enabled = true;
        }
    }

    if (modoEntradaActivo) {
        interfonoEntrada.visible = true;
        camTargetPositionEntrada
            .copy(interfonoEntrada.position)
            .add(cameraOffsetEntrada);

        camera.position.lerp(camTargetPositionEntrada, 0.05);
        camera.lookAt(interfonoEntrada.position);
    } else if (volviendoACamara) {
        interfonoEntrada.visible = false;
        camera.position.lerp(cameraInitialPosition, 0.15);
        controls.target.lerp(cameraInitialTarget, 0.15);

        camera.lookAt(controls.target);

        const dist = camera.position.distanceTo(cameraInitialPosition);

        if (dist < 0.15) {
            volviendoACamara = false;
            controls.enabled = true;
        }
    }

    if (modoSalidaActivo) {
        interfonoSalida.visible = true;
        camTargetPositionSalida
            .copy(interfonoSalida.position)
            .add(cameraOffsetSalida);

        camera.position.lerp(camTargetPositionSalida, 0.05);
        camera.lookAt(interfonoSalida.position);
    } else if (volviendoACamara) {
        interfonoSalida.visible = false;
        camera.position.lerp(cameraInitialPosition, 0.15);
        controls.target.lerp(cameraInitialTarget, 0.15);

        camera.lookAt(controls.target);

        const dist = camera.position.distanceTo(cameraInitialPosition);

        if (dist < 0.15) {
            volviendoACamara = false;
            controls.enabled = true;
        }
    }

    if (controls.enabled) {
        controls.update();
    }

    renderer.render(scene, camera);
}

animate();


// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
