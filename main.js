
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { MapControls } from 'three/examples/jsm/Addons.js';
import { MapTilerProvider, MapBoxProvider, MapView, UnitsUtils } from 'geo-three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createSun, createBananaDuck } from './code/models';

import Stats from 'stats.js'
import Map from './code/map';

const stats = new Stats()
stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom

document.body.appendChild(stats.dom)

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 120);

// Position the camera
camera.position.y = .5;
camera.position.x = -.8;
camera.position.z = -.8;
camera.updateProjectionMatrix();

// Renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true
})
renderer.setClearColor(0xfeffa6);
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.getElementById("app").appendChild(renderer.domElement);

// Map Controls 
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true
controls.dampingFactor = .25
controls.screenSpacePanning = true
controls.maxDistance = 1000

// Tool for models.js
window.gltfLoader = new GLTFLoader();

// Mouse 
const mouse = new THREE.Vector2();

// Init Light
let light0 = new THREE.AmbientLight(0xfafafa, 1)
scene.add(light0)

scene.background = new THREE.Color(0xfeffa6);
scene.fog = new THREE.Fog(0xfeffa6, .5, 7);


const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 3);
hemiLight.position.set(0, 20, 0);
scene.add(hemiLight);

scene.add(
  new THREE.AxesHelper(1)
)

// Raycaster 
const raycast = new THREE.Raycaster();

//Our Map 
const map = new Map();
scene.add(map);

const sun = await createSun();
scene.add(sun);

// after initializing the map, exposing map to be available globally
// window.mainMap = map;

renderer.domElement.addEventListener('click', (event) => {
  // console.log("clicked", event);

  // Calculate mouse position in normalized device coordinates (-1 to +1) for both components
  mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

  // Update the picking ray with the camera and mouse position
  raycast.setFromCamera(mouse, camera);

  // Calculate objects intersecting the picking ray
  const intersects = raycast.intersectObjects((map.clickable) ? map.clickable : [], true); // Note this only checks if we clicked buildings

  if (intersects.length > 0) {
    map.checkIntersectedBuildings(intersects[0].object)
    map.showPopup(event.clientX + 40, event.clientY - 40, intersects[0].object)
  }

});

document.getElementById('calcRoute').addEventListener('click', () => {
  if (map.clickedBuildings.length >= 2) {
    //map.generateDirections();
  } else {
    console.error("Not enough buildings selected for a route.");
  }
});

// avoid stairs switch toggled
let avoidStairs = false;
// document.getElementById('avoidStairsSwitch').addEventListener('change', (event) => {
//   avoidStairs = event.target.checked;
// });

// document.getElementById('calcRoute').addEventListener('click', () => {
//   // map.clearRoutes();  // Clear previous routes if any
//   map.generateDirections(avoidStairs);
// });

// document.getElementById('clearRoute').addEventListener('click', () => {
//   map.clearRoutes();
//   hideBuildingCards(); //added functionality to hid the building cards
//   // reset avoid stairs switch
//   //document.getElementById('avoidStairsSwitch').checked = false;
//   avoidStairs = false;
// })

// Function to hide all building cards
function hideBuildingCards() {
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    card.style.display = 'none'; // Hide each card
    // card.classList.add('hide'); // Add 'hide' class that sets display to none
  });
}

// create HTML elements for directions list
const directionsList = document.getElementById('directions-list');
const totalDistance = document.getElementById('total-distance');
const totalDuration = document.getElementById('total-duration');
function updateDirectionsList(directions, routeTotal) {
  directionsList.innerHTML = '';
  directions.forEach((direction) => {
    const li = document.createElement('li');
    li.className = 'direction-item';
    li.textContent = `${direction.instruction} (Distance: ${direction.distance} meters, Duration: ${(direction.duration / 60).toFixed(2)} min)`;
    directionsList.appendChild(li);
  });
  totalDistance.textContent = `Total Distance: ${routeTotal.distance} meters`;
  totalDuration.textContent = `Total Duration: ${(routeTotal.duration / 60).toFixed(2)} min`;
}

// expose updateDirectionsList to global scope so it can be called from map.js
window.updateDirectionsList = updateDirectionsList;

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize, false);

// Animation loop
const animate = function () {
  requestAnimationFrame(animate);

  stats.begin()

  //controls.update()

  renderer.render(scene, camera);

  stats.end();
};

animate();

