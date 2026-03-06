// Initial website setup
import { initScene } from "./scene.js"; // Setup the scene
import { setupControls } from "./controls.js"; // Setup use controls
import { setupRenderTypes } from "./renderTypes.js"; // Setup Render types

try{
  initScene();
  setupControls();
  setupRenderTypes();
}catch (error) {
  console.error(error); // Log the error to the console
  sendError(`Error while building the scene: <br>  <br> ${error} <br> <br> Please click F12 and navigate to "Console" for more infomation and message @dori7os on discord about it`)
}
// Backend functions 📌

// Error 
export function sendError(error) {
try{
  const popupSection = document.getElementById('section-Popup');
  document.getElementById("ErrorMessage").innerHTML = error;
  document.querySelectorAll(".PopupMenu").forEach((menu) => {
    popupSection.style.opacity = 0;
    popupSection.style.display = "none";
    menu.classList.remove('visible')
    menu.style.display = 'none';
  });
  document.querySelector(`.Popup-Error`).classList.add('visible');
  document.querySelector(`.Popup-Error`).style.display = 'flex';
  popupSection.style.display = 'flex';
  setTimeout(() => {
    popupSection.style.opacity = 1;
  }, 100);
}catch (error) {
  console.error(error); // Log the error to the console
  alert('Ran into an error while sending an error, this is messed up bad. Please message @dori7os on discord about this.')
}
}