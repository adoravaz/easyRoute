// createEntrancesAndElevators.js
import * as THREE from 'three';
import { elevatorMaterials, entranceMaterials } from './materials';

// const center = [-122.0583, 36.9916, 36.9941766]
const scale = 10000

const entrancesAndElevatorsGroup = new THREE.Group();

// Load textures
const elevatorTexture = new THREE.TextureLoader().load('/transpelev.png');
const entranceTexture = new THREE.TextureLoader().load('/entrance.jpeg');

function addElevator(feature) {
    const material = new THREE.SpriteMaterial({ map: elevatorTexture });
    const elevator = new THREE.Sprite(material);
    elevator.scale.set(0.001, 0.001, 0.001); 

    let [x, y, z] = window.map.getRelativePoints(feature.geometry.coordinates[1], feature.geometry.coordinates[0]);
    elevator.position.set(x, y+0.004, z);
    entrancesAndElevatorsGroup.add(elevator);
}

//not in use anymore- made map looked cluttered can add back if needed
function addEntrance(feature) {
    const material = new THREE.SpriteMaterial({ map: entranceTexture,
        transparent: true,  // Enable transparency.
        opacity: 0.5 });
    const entrance = new THREE.Sprite(material);
    entrance.scale.set(0.001, 0.001, 0.001); 

    let [x, y, z] = window.map.getRelativePoints(feature.geometry.coordinates[1], feature.geometry.coordinates[0]);
    entrance.position.set(x, y+0.003, z);

    entrancesAndElevatorsGroup.add(entrance);
}

async function createEntrancesAndElevators() {

    const response = await fetch('/elevatorswithentrances_V4 copy.geojson');

    const data = await response.json();
    data.features.forEach(feature => {
        if (feature.properties['highway'] === 'elevator') {
            addElevator(feature);
        } else if (feature.properties['entrance']) {
            // addEntrance(feature);
        }
    });
    return entrancesAndElevatorsGroup;
}

export default createEntrancesAndElevators;
