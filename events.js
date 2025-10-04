import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { state } from './state.js';

// --- Menu events ---
export function setupMenuEvents(itemsPanel, scene) {
  const loader = new GLTFLoader();

  // Load assets and create menu items
  fetch("assets.json")
    .then(res => res.json())
    .then(jsonAssets => {
      state.assets = jsonAssets;

      state.assets.forEach(asset => {
        const div = document.createElement("div");
        div.className = "asset-item";
        div.innerHTML = `<img src="${asset.thumbnail}" alt=""><span>${asset.name}</span>`;

        // Update selectedAsset in state when clicked
        div.addEventListener("click", () => {
          state.selectedAssetId = asset.id; // or asset.name
          state.selectedAssetData = asset;

          // Load preview mesh
          if (state.previewMesh) scene.remove(state.previewMesh);
          loader.load(asset.glb, gltf => {
            state.previewMesh = gltf.scene;
            state.previewMesh.traverse(child => {
              if (child.isMesh) child.material = child.material.clone();
            });
            state.previewMesh.visible = false;
            scene.add(state.previewMesh);
          });
        });

        itemsPanel.appendChild(div);
      });
    });
}

// --- Scene events ---
export function setupSceneEvents(scene, camera, renderer, plane) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  function getMeshBottomOffset(mesh) {
    const box = new THREE.Box3().setFromObject(mesh);
    return -box.min.y;
  }

  function onMouseMove(event) {
    if (!state.previewMesh) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(plane);
    if (intersects.length > 0) {
      state.previewMesh.visible = true;
      state.previewMesh.position.copy(intersects[0].point);
      state.previewMesh.position.y += getMeshBottomOffset(state.previewMesh);
    } else {
      state.previewMesh.visible = false;
    }
  }

  function onClick() {
    if (!state.previewMesh || !state.previewMesh.visible || !state.selectedAssetData) return;

    const loader = new GLTFLoader();
    loader.load(state.selectedAssetData.glb, gltf => {
      const mesh = gltf.scene;
      mesh.position.copy(state.previewMesh.position);
      mesh.position.y += getMeshBottomOffset(mesh);
      scene.add(mesh);
    });
  }

  function onKeyDown(event) {
    if (event.key === "Escape") {
      if (state.previewMesh) scene.remove(state.previewMesh);
      state.previewMesh = null;
      state.selectedAssetId = null;
      state.selectedAssetData = null;
    }
  }

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("click", onClick);
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("resize", onResize);
}
