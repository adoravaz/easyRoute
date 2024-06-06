import { MapControls } from 'three/examples/jsm/Addons.js';
import Map from './code/map';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.0001, 120);

// Position the camera
camera.position.y = 0.128633;
camera.position.x = -0.290214;
camera.position.z = -0.093298;
camera.updateProjectionMatrix();

// Renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true,
})

renderer.setClearColor(0xfeffa6);
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.getElementById("app").appendChild(renderer.domElement);

// Map Controls 
const controls = new MapControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.maxDistance = 1;

// Mouse 
const mouse = new THREE.Vector2();

// Init Light
let light0 = new THREE.AmbientLight(0xfafafa, 1)
scene.add(light0)

scene.background = new THREE.Color(0x6196ff);
scene.fog = new THREE.Fog(0x6196ff, 0.4, 1);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 3);
hemiLight.position.set(0, .4, 0);
scene.add(hemiLight);

// Raycaster 
const raycast = new THREE.Raycaster();

// Map 
const map = new Map();
scene.add(map);

renderer.domElement.addEventListener('click', (event) => {

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

// avoid stairs switch toggled
let avoidStairs = false;

//added
document.getElementById('toggleAvoidStairs').addEventListener('click', function () {
  const button = document.getElementById('toggleAvoidStairs');
  if (!avoidStairs) {
    button.classList.remove('bg-gray-500');
    button.classList.add('bg-green-500');
    button.textContent = 'Avoid Stairs: On';
  } else {
    button.classList.remove('bg-green-500');
    button.classList.add('bg-gray-500');
    button.textContent = 'Avoid Stairs: Off';
  }

  avoidStairs = !avoidStairs;
});

document.getElementById('calcRoute').addEventListener('click', () => {
  if (map.clickedBuildings.length >= 2) {
    map.generateDirections(avoidStairs);
    // document.getElementById('directions-title').style.display = "block";
  } else {
    console.error("Not enough buildings selected for a route.");
  }
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
  //document.getElementById('avoidStairsSwitch').checked = false;
})

// Function to hide all building cards
function hideBuildingCards() {
  const cards = document.querySelectorAll('.building-cards .card');
  cards.forEach(card => {
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

  // stats.begin()

  //controls.update()

  renderer.render(scene, camera);

  // stats.end();
};

animate();

