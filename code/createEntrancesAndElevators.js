// createEntrancesAndElevators.js
import * as THREE from 'three';
import { elevatorMaterials, entranceMaterials } from './materials';

// const center = [-122.0583, 36.9916, 36.9941766]
const scale = 10000

const entrancesAndElevatorsGroup = new THREE.Group();

// Load textures
const elevatorTexture = new THREE.TextureLoader().load('/transpelev.png');
const entranceTexture = new THREE.TextureLoader().load('/entrance.jpeg');

// function addElevator(feature) {
//     const geometry = new THREE.CircleGeometry(0.2, 32);
//     const material = elevatorMaterials[feature.properties.accessibility] || elevatorMaterials.no_access;
//     const elevator = new THREE.Mesh(geometry, material);
//     const position = new THREE.Vector2(feature.geometry.coordinates[0] - center[0], feature.geometry.coordinates[1] - center[1]).multiplyScalar(scale);
//     elevator.position.set(position.x, 0, position.y);
//     entrancesAndElevatorsGroup.add(elevator);
// }
function addElevator(feature) {
    const material = new THREE.SpriteMaterial({ map: elevatorTexture });
    const elevator = new THREE.Sprite(material);
    elevator.scale.set(0.001, 0.001, 0.001); 
    // const position = new THREE.Vector2(feature.geometry.coordinates[0] - center[0], feature.geometry.coordinates[1] - center[1]).multiplyScalar(scale);
    // const position = new THREE.Vector3(
    //     (feature.geometry.coordinates[0] - center[0]) * scale, 
    //     (feature.geometry.coordinates[2] / 10) - (center[2]), 
    //     (feature.geometry.coordinates[1] - center[1]) * scale
    // );
    // //elevator.position.set(position.x, 0, position.y);
    // elevator.position.set(position.x, position.y, position.z);

    let [x, y, z] = window.map.getRelativePoints(feature.geometry.coordinates[1], feature.geometry.coordinates[0]);
    let levels = (feature.properties.height) ? feature.properties.height : 1;
    
    elevator.position.set(x, y + levels*0.001 + 0.002, z);
    entrancesAndElevatorsGroup.add(elevator);
}

// function addEntrance(feature) {
//     const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
//     const type = feature.properties.type || 'secondary';  // Default to 'secondary' if type is not specified
//     const material = entranceMaterials[type];
//     const entrance = new THREE.Mesh(geometry, material);
//     const position = new THREE.Vector2(feature.geometry.coordinates[0] - center[0], feature.geometry.coordinates[1] - center[1]).multiplyScalar(scale);
//     entrance.position.set(position.x, 0, position.y);
//     entrancesAndElevatorsGroup.add(entrance);
// }

function addEntrance(feature) {
    const material = new THREE.SpriteMaterial({ map: entranceTexture,
        transparent: true,  // Enable transparency.
        opacity: 0.5 });
    const entrance = new THREE.Sprite(material);
    entrance.scale.set(0.001, 0.001, 0.001); 
    // const position = new THREE.Vector2(feature.geometry.coordinates[0] - center[0], feature.geometry.coordinates[1] - center[1]).multiplyScalar(scale);
    // const position = new THREE.Vector3(
    //     (feature.geometry.coordinates[0] - center[0]) * scale, 
    //     (feature.geometry.coordinates[2] / 10) - (center[2]), 
    //     (feature.geometry.coordinates[1] - center[1]) * scale
    // );
    // // entrance.position.set(position.x, 0, position.y);
    // entrance.position.set(position.x, position.y, position.z);
    let [x, y, z] = window.map.getRelativePoints(feature.geometry.coordinates[1], feature.geometry.coordinates[0]);
    let levels = (feature.properties.height) ? feature.properties.height : 1;
    
    entrance.position.set(x, y + levels*0.001, z);
    entrancesAndElevatorsGroup.add(entrance);
}

async function createEntrancesAndElevators() {
    const response = await fetch('/elevatorswithentrances_V4copy.geojson');
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


// async function createEntrancesAndElevators() {
//     const response = await fetch('/elevatorswithentrances.geojson');
//     const data = await response.json();
//     loadEntrancesAndElevators(data);
//     return elevatorsGroup;
// }

