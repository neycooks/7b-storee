import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";
import {
  renderer,
  scene,
  camera,
} from "./scene.js";

export let orbit;
export let orbit2;

export function setupControls() {
  orbit = new OrbitControls(camera, renderer.domElement);
  orbit2 = new TrackballControls(camera, renderer.domElement);

  camera.position.set(-0.5, 1.7, 3.5);
  orbit.maxDistance = 7;
  orbit.minDistance = 0.7;
  orbit.target.set(0, 0.7, 0);
  orbit.enablePan = false;
  orbit.enableDamping = true;
  orbit.dampingFactor = 0.12;
  orbit.enableZoom = false;

  orbit2.noRotate = true;
  orbit2.noPan = true;
  orbit2.noZoom = false;
  orbit2.zoomSpeed = 1.5;

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (isMobile) {
    orbit2.enabled = false;
    orbit.enabled = true;
    orbit.enableZoom = true;
  }
  orbit.update();
}