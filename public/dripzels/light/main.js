import {
  WebGLRenderer,
  PerspectiveCamera,
  AmbientLight,
  TextureLoader,
  MeshStandardMaterial,
  MeshBasicMaterial,
  Scene,
  LinearSRGBColorSpace,
  Vector2,
  ColorManagement,
} from "three";
import * as THREE from "three";

import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
// Export Objects

let renderer, scene, camera, orbit, loader = new GLTFLoader(), dloader = new DRACOLoader();

// Settings
let threeBackground = "0x060606";

function loadThreeCanvas() {
  renderer = new WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  // renderer.outputColorSpace = LinearSRGBColorSpace;
  renderer.setClearColor(parseInt(threeBackground), 1); // Background color
  scene = new Scene();
  camera = new PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
    );
    camera.position.set(0, 7, 10)
  orbit = new OrbitControls(camera, renderer.domElement);
  orbit.target.set(0, 3, 0)
  ColorManagement.enabled = true;

  const ao = new AmbientLight(0xffffff, 1)
  scene.add(ao)

  document.body.appendChild(renderer.domElement);

  // Render -----------
  function animate() {
    // Animate
    orbit.update();
    renderer.render(scene, camera);
  }
  renderer.setAnimationLoop(animate);
  
  window.addEventListener("resize", function () {
    // Resize window
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

let shirt, pants;
function loadThreeModels() {
  dloader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
  dloader.setDecoderConfig({type: 'js'})
  loader.setDRACOLoader(dloader);

  loader.load("./assets/models/models_low.glb", (gltf) => {
    gltf.scene.traverse((child) => {
        if (child.isMesh) {
            switch (child.material.name){
              case "Shirt":
                shirt = child.material;
                break;
              case "Pants":
                pants = child.material;
                break;
            }
        }
    });
    
    scene.add(gltf.scene)
});

}

function buttonEvents() {
  const uploadInputs = document.querySelectorAll('.uploadInput');

  uploadInputs.forEach((input) => {
    input.addEventListener('change', (event) => {
      if (!event.target.files[0].name) {return;}
      let clothingType = event.target.id;
      const clothingFile = new Image();
      clothingFile.src = URL.createObjectURL(event.target.files[0]);
      input.value = null;

      const loadImagePromise = new Promise((resolve, reject) => {
        clothingFile.onload = resolve;
        clothingFile.onerror = reject;
      });

      loadImagePromise.then(() => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = clothingFile.width;
        canvas.height = clothingFile.height;

        ctx.fillStyle = '#dfa381';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.drawImage(clothingFile, 0, 0);
        // document.getElementById('topp').appendChild(canvas);
        clothingFile.src = canvas.toDataURL();

        changeClothing(clothingFile, clothingType);
      }).catch(error => {
        console.error('Error loading image:', error);
      });
    });
  });

  document.getElementById("resetButton").addEventListener("click", () => {
    const clothingFile = new Image();
    clothingFile.src = "./assets/models/DefaultClothing.webp";

    const loadImagePromise = new Promise((resolve, reject) => {
      clothingFile.onload = resolve;
      clothingFile.onerror = reject;
    });

    loadImagePromise
      .then(() => {
        changeClothing(clothingFile, "Shirt")
        changeClothing(clothingFile, "Pants")
      })
      .catch((error) => {
        console.error("Error loading image while resetting:", error);
      });
  });
}

function changeClothing(clothingFile, clothingType) {
  // Load the image to a three.js texture
  const textureLoader = new THREE.TextureLoader();
  clothingFile = textureLoader.load(clothingFile.src, (texture) => {texture.flipY = false;texture.needsUpdate = true;texture.colorSpace = THREE.SRGBColorSpace;});

  switch (clothingType){
    case "Shirt":
      shirt.map = clothingFile;
      break;
    case "Pants":
      pants.map = clothingFile;
      break;
  }
}

loadThreeCanvas();
loadThreeModels();
buttonEvents();