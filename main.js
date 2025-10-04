import { createScene, createVessel } from './scene-setup.js';
import { createMenu } from './menu.js';
import { setupMenuEvents, setupSceneEvents } from './events.js';

// Setup scene
const { scene, camera, renderer} = createScene();
const plane = createVessel(scene);

// Setup menu
const itemsPanel = createMenu();

// Setup events
setupMenuEvents(itemsPanel, scene);
setupSceneEvents(scene, camera, renderer, plane);

// Render loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
