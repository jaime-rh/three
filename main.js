import * as THREE from 'three';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.152/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'https://cdn.jsdelivr.net/npm/three@0.152/examples/jsm/loaders/FBXLoader.js';
import { OBJLoader } from 'https://cdn.jsdelivr.net/npm/three@0.152/examples/jsm/loaders/OBJLoader.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.152/examples/jsm/controls/OrbitControls.js';

//modelos fuera del loader
let plano;
let plano2;
let barreraEntrada;
let barreraSalida;
let alarma;
let interfonoEntrada;
let interfonoSalida;
let interfonoCajero;
let luz;
let planoActual = 1;

let girandoHelicopter = false;
let tHeli = 0;

let plano1Cargado = false;
let plano2Cargado = false;

let cargandoPlano = false;


function cargarPlano(nivel) {

    if (cargandoPlano) return;

    cargandoPlano = true;

    // liberar plano contrario
    if (nivel === 1 && plano2) {
        destruirPlano(plano2);
        plano2 = null;
        plano2Cargado = false;
    }

    if (nivel === 2 && plano) {
        destruirPlano(plano);
        plano = null;
        plano1Cargado = false;
    }


    // PLANO 1
    if (nivel === 1) {

        // ya cargado
        if (plano1Cargado) {
            plano.visible = true;
            planoActual = 1;
            cargandoPlano = false;
            return;
        }

        const inicioCarga = performance.now();

        console.log("Cargando plano 1...");

        loaderPlano.load(
            './planoNodos-1.glb',
            (gltf) => {

                const finCarga = performance.now();

                const tiempo =
                    ((finCarga - inicioCarga) / 1000).toFixed(2);

                console.log(
                    `Plano 1 cargado en ${tiempo} segundos`
                );

                plano = gltf.scene;
                scene.add(plano);

                const box = new THREE.Box3().setFromObject(plano);
                const center = box.getCenter(new THREE.Vector3());

                plano.position.x -= center.x;
                plano.position.y -= center.y;
                plano.position.z -= center.z;

                barreraEntrada = plano.getObjectByName("BarreraEntarda");
                barreraSalida = plano.getObjectByName("BarreraSalida");
                alarma = plano.getObjectByName("alarma");

                interfonoEntrada = plano.getObjectByName("cocheEntrada");
                interfonoSalida = plano.getObjectByName("cocheSalida");
                interfonoCajero = plano.getObjectByName("persona");

                interfonoCajero.visible = false;
                interfonoEntrada.visible = false;
                interfonoSalida.visible = false;

                qClosed1.copy(barreraEntrada.quaternion);
                qClosed2.copy(barreraSalida.quaternion);

                const axis1 = new THREE.Vector3(-1, 0, 0);
                const axis2 = new THREE.Vector3(1, 0, 0);

                const offset1 = new THREE.Quaternion()
                    .setFromAxisAngle(axis1, THREE.MathUtils.degToRad(75));

                const offset2 = new THREE.Quaternion()
                    .setFromAxisAngle(axis2, THREE.MathUtils.degToRad(75));

                qOpen1.copy(qClosed1).multiply(offset1);
                qOpen2.copy(qClosed2).multiply(offset2);

                plano1Cargado = true;
                planoActual = 1;
                cargandoPlano = false;
            });
    }

    // PLANO 2
    if (nivel === 2) {

        if (plano2Cargado) {
            plano2.visible = true;
            planoActual = 2;
            cargandoPlano = false;
            return;
        }

        const inicioCarga = performance.now();

        console.log("Cargando plano 2...");

        loaderPlano.load(

            './planoNodos-2.glb',

            (gltf) => {

                const finCarga = performance.now();

                const tiempo =
                    ((finCarga - inicioCarga) / 1000).toFixed(2);

                console.log(
                    `Plano 2 cargado en ${tiempo} segundos`
                );

                plano2 = gltf.scene;
                scene.add(plano2);

                const box = new THREE.Box3().setFromObject(plano2);
                const center = box.getCenter(new THREE.Vector3());

                plano2.position.x -= center.x;
                plano2.position.y -= center.y;
                plano2.position.z -= center.z;

                plano2.visible = true;

                plano2Cargado = true;
                planoActual = 2;
                cargandoPlano = false;
            });
    } 

    // actualizar barra superior
    window.parent.postMessage({
        type: "CAMBIO_NIVEL",
        nivel: nivel
    }, "*");
}

function destruirPlano(modelo) {

        if (!modelo) return;

        modelo.traverse((obj) => {

            // geometría
            if (obj.geometry) {
                obj.geometry.dispose();
            }

            // materiales
            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach((mat) => {
                        // texturas
                        for (const key in mat) {
                            const value = mat[key];
                            if (value && value.isTexture) {
                                value.dispose();
                            }
                        }
                        mat.dispose();
                    });
                } else {
                    for (const key in obj.material) {
                        const value = obj.material[key];
                        if (value && value.isTexture) {
                            value.dispose();
                        }
                    }
                    obj.material.dispose();
                }
            }
        });
    scene.remove(modelo);
    modelo.clear();
    renderer.renderLists.dispose();
    console.log("Plano destruido");
    console.log(renderer.info.memory);
}

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

let valorBoliviano = 0;

document.getElementById("boliviano").addEventListener("click", () => {
  valorBoliviano = valorBoliviano === 0 ? 1 : 0;

  const popup = document.getElementById("popupBoliviano");

  if (valorBoliviano === 1) {
    popup.style.display = "flex";
  } else {
    popup.style.display = "none";
  }
});

window.addEventListener("message", (event) => {

    const data = event.data;

    if (data === "nivel1") {
        cargarPlano(1);
    }

    if (data === "nivel2") {
        cargarPlano(2);
    }
});

function setPlano(nivel) {
    cargarPlano(nivel);
}

// Escena
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x00000);

// Cámara
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 8, 30);

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
    cargarPlano(1);
    modoCajeroActivo = true;
    controls.enabled = false;
}

function desactivarCajero() {
    modoCajeroActivo = false;
    volviendoACamara = true;
}

function activarEntrada() {
    cargarPlano(1);
    modoEntradaActivo = true;
    controls.enabled = false;
}

function desactivarEntrada() {
    modoEntradaActivo = false;
    volviendoACamara = true;
}

function activarSalida() {
    cargarPlano(1);
    modoSalidaActivo = true;
    controls.enabled = false;
}

function desactivarSalida() {
    modoSalidaActivo = false;
    volviendoACamara = true;
}

let alarmaAnterior = 0;

function animate() {
    requestAnimationFrame(animate);

    if(alarma){
        if (valorAlarma === 1) {

            alarma.visible = true;
            alarma.rotation.z += 0.06;

            if (alarmaAnterior === 0) {
                cargarPlano(1);
            }

        } else {
            alarma.visible = false;
        }
        alarmaAnterior = valorAlarma;
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
