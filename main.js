import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
// import { XRButton } from 'three/addons/webxr/XRButton.js';

import Stats from 'stats.js'
import Map from './code/map';

const stats = new Stats()
stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom

document.body.appendChild(stats.dom)

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);

// Position the camera
camera.position.y = 10;
//camera.position.x = 10;
camera.position.z = 5;
camera.updateProjectionMatrix();

// Renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true
})
renderer.setClearColor("white");
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.xr.enabled = true;
renderer.sortObjects = false;
document.getElementById("app").appendChild(renderer.domElement);

// document.body.appendChild(XRButton.createButton(renderer, { 'optionalFeatures': ['depth-sensing'] }));

// Map Controls 
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true
controls.dampingFactor = .25
controls.screenSpacePanning = true
controls.maxDistance = 1000

// Mouse 
const mouse = new THREE.Vector2();

// Helpers
let gridHelper = new THREE.GridHelper(50, 30, new THREE.Color(0x555555), new THREE.Color(0x333333))
//scene.add(gridHelper);

let axisHelper = new THREE.AxesHelper(10, 10);
//scene.add(axisHelper);

// Init Light
let light0 = new THREE.AmbientLight(0xfafafa, 10.25)

let light1 = new THREE.PointLight(0xfafafa, 0.4)
light1.position.set(20, 30, 10)

scene.add(light0)
scene.add(light1)

scene.add(
  new THREE.AxesHelper(3)
)

// Raycaster 
const raycast = new THREE.Raycaster();

// Our Map 
const map = new Map(scene);

// after initializing the map, exposing map to be available globally
window.mainMap = map;

renderer.domElement.addEventListener('click', (event) => {
  console.log("clicked");

  // Calculate mouse position in normalized device coordinates (-1 to +1) for both components
  mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

  // Update the picking ray with the camera and mouse position
  raycast.setFromCamera(mouse, camera);

  // Calculate objects intersecting the picking ray
  const intersects = raycast.intersectObjects((map.clickable) ? map.clickable : [], true); // Note this only checks if we clicked buildings

  if (intersects.length > 0) {
    map.checkIntersectedBuildings(intersects[0].object)
  }

});

// document.getElementById('calcRoute').addEventListener('click', () => {
//   if (map.clickedBuildings.length >= 2) {
//       map.generateDirections();
//   } else {
//       console.error("Not enough buildings selected for a route.");
//   }
// });

// avoid stairs switch toggled
let avoidStairs = false;
document.getElementById('avoidStairsSwitch').addEventListener('change', (event) => {
  avoidStairs = event.target.checked;
});

document.getElementById('calcRoute').addEventListener('click', () => {
  // map.clearRoutes();  // Clear previous routes if any
  map.generateDirections(avoidStairs);
});

document.getElementById('clearRoute').addEventListener('click', () => {
  map.clearRoutes();
  //search bar functionality to reset search bar and hide all building cards
  hideBuildingCards(); // Hide all building cards
  // document.getElementById('start-search').value = ''; // Clear start search input
  // document.getElementById('destination-search').value = ''; // Clear destination search input
  if (window.resetSearchState) {
    window.resetSearchState(); // Reset search states
  }
  resetCardSelection();
  // hideBuildingCards(); //added functionality to hid the building cards
  // reset avoid stairs switch
  document.getElementById('avoidStairsSwitch').checked = false;
  avoidStairs = false;
})

// Function to hide all building cards
function hideBuildingCards() {
  const cards = document.querySelectorAll('.building-cards .card');
  cards.forEach(card => {
      // card.style.display = 'none'; // Hide each card
      card.classList.add('hide'); // Add 'hide' class that sets display to none
  });
}

// Function to reset selection of cards
function resetCardSelection() {
  const selectedCards = document.querySelectorAll('.building-cards .card.selected');
  selectedCards.forEach(card => {
    card.classList.remove('selected', 'visible'); // Remove 'selected' and 'visible' classes
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
    li.textContent = `${direction.instruction} (Distance: ${direction.distance} meters, Duration: ${(direction.duration/60).toFixed(2)} min)`;
    directionsList.appendChild(li);
  });
  totalDistance.textContent = `Total Distance: ${routeTotal.distance} meters`;
  totalDuration.textContent = `Total Duration: ${(routeTotal.duration/60).toFixed(2)} min`;
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

  controls.update()

  renderer.render(scene, camera);

  stats.end();
};

animate();

