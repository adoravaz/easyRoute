// createEntrancesAndElevators.js
import * as THREE from 'three';
import { elevatorMaterials, entranceMaterials } from './materials';

const center = [-122.0583, 36.9916, 36.9941766]
const scale = 10000

const entrancesAndElevatorsGroup = new THREE.Group();

function addElevator(feature) {
    const geometry = new THREE.CircleGeometry(0.2, 32);
    const material = elevatorMaterials[feature.properties.accessibility] || elevatorMaterials.no_access;
    const elevator = new THREE.Mesh(geometry, material);
    const position = new THREE.Vector2(feature.geometry.coordinates[0] - center[0], feature.geometry.coordinates[1] - center[1]).multiplyScalar(scale);
    elevator.position.set(position.x, 0, position.y);
    entrancesAndElevatorsGroup.add(elevator);
}

function addEntrance(feature) {
    const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const type = feature.properties.type || 'secondary';  // Default to 'secondary' if type is not specified
    const material = entranceMaterials[type];
    const entrance = new THREE.Mesh(geometry, material);
    const position = new THREE.Vector2(feature.geometry.coordinates[0] - center[0], feature.geometry.coordinates[1] - center[1]).multiplyScalar(scale);
    entrance.position.set(position.x, 0, position.y);
    entrancesAndElevatorsGroup.add(entrance);
}

async function createEntrancesAndElevators() {
    const response = await fetch('/elevatorswithentrances.geojson');
    const data = await response.json();
    data.features.forEach(feature => {
        if (feature.properties['highway'] === 'elevator') {
            addElevator(feature);
        } else if (feature.properties['entrance']) {
            addEntrance(feature);
        }
    });
    return entrancesAndElevatorsGroup;
}

export default createEntrancesAndElevators;


// async function createEntrancesAndElevators() {
//     const response = await fetch('/elevatorswithentrances.geojson');
//     const data = await response.json();
//     loadEntrancesAndElevators(data);
//     return elevatorsGroup;
// }

