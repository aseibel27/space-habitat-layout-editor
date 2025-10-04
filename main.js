import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// === Scene Setup ===
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa0a0a0);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(5, 8, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.update();

// Plane
const planeSize = 20;
const planeGeometry = new THREE.PlaneGeometry(planeSize, planeSize);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x999999 });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

const gridHelper = new THREE.GridHelper(planeSize, planeSize);
scene.add(gridHelper);

// Lights
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
hemiLight.position.set(0, 20, 0);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(10, 20, 10);
scene.add(dirLight);

// Raycaster for mouse
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// === Asset Menu ===
const assets = [
  { name: "Cube 2m", thumbnail: "assets/cube_2m.png", glb: "assets/cube_2m.glb" },
  { name: "Cube 4m", thumbnail: "assets/cube_4m.png", glb: "assets/cube_4m.glb" }
];

const menu = document.getElementById("menu");
let selectedAsset = null;
let previewMesh = null;
const loader = new GLTFLoader();

assets.forEach(asset => {
  const div = document.createElement("div");
  div.className = "asset-item";
  div.innerHTML = `<img src="${asset.thumbnail}" alt=""><span>${asset.name}</span>`;
  div.addEventListener("click", () => selectAsset(asset));
  menu.appendChild(div);
});

// === Asset Placement Logic ===
function selectAsset(asset) {
  selectedAsset = asset;
  if (previewMesh) scene.remove(previewMesh);
  loader.load(asset.glb, gltf => {
    previewMesh = gltf.scene;
    previewMesh.traverse(child => {
      if (child.isMesh) child.material = child.material.clone();
    });
    previewMesh.visible = false;
    scene.add(previewMesh);
  });
}

function placeAsset(position) {
  if (!selectedAsset) return;
  loader.load(selectedAsset.glb, gltf => {
    const mesh = gltf.scene;
    mesh.position.copy(position);
    mesh.position.y += getMeshBottomOffset(mesh);
    scene.add(mesh);
  });
}

// Compute bottom offset to align with plane
function getMeshBottomOffset(mesh) {
  const box = new THREE.Box3().setFromObject(mesh);
  return -box.min.y;
}

// Mouse events
function onMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  if (previewMesh) {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(plane);
    if (intersects.length > 0) {
      previewMesh.visible = true;
      previewMesh.position.copy(intersects[0].point);
      previewMesh.position.y += getMeshBottomOffset(previewMesh);
    } else {
      previewMesh.visible = false;
    }
  }
}

function onClick() {
  if (previewMesh && previewMesh.visible) {
    placeAsset(previewMesh.position);
  }
}

function onKeyDown(event) {
  if (event.key === "Escape" && previewMesh) {
    scene.remove(previewMesh);
    previewMesh = null;
    selectedAsset = null;
  }
}

window.addEventListener("mousemove", onMouseMove);
window.addEventListener("click", onClick);
window.addEventListener("keydown", onKeyDown);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// === Render Loop ===
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
