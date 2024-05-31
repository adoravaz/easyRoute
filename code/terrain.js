import * as THREE from 'three'
import { createShaderMaterial } from './materials';
import { center, scale } from './map';

const textureLoader = new THREE.TextureLoader();

function createTerrainGeometry(elevationData, width, height) {
    const geometry = new THREE.PlaneGeometry(width, height, width - 1, height - 1);

    for (let i = 0; i < geometry.attributes.position.count; i++) {
        geometry.attributes.position.setZ(i, elevationData[i] * 60); // Scale elevation as needed
    }

    geometry.computeVertexNormals(); // Recompute normals for proper shading

    return geometry;
}

function loadTexture(url) {
    return new Promise((resolve, reject) => {
        const loader = new THREE.TextureLoader();
        loader.load(url, resolve, undefined, reject);
    });
}

async function createTerrain() {
    const mapTexture = await loadTexture('ucsc_map_satellite.png');
    const demTexture = await loadTexture('ucsc_map_dem_v2.png');

    const canvas = document.createElement('canvas');
    canvas.width = demTexture.image.width;
    canvas.height = demTexture.image.height;

    const context = canvas.getContext('2d');
    context.drawImage(demTexture.image, 0, 0);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    const elevationData = new Float32Array(canvas.width * canvas.height);
    for (let i = 0; i < elevationData.length; i++) {
        const offset = i * 4;
        const grayscaleValue = imageData.data[offset]; // R, G, B values are the same for grayscale
        elevationData[i] = grayscaleValue / 300; // Normalize to [0, 1]
    }

    const geometry = createTerrainGeometry(elevationData, canvas.width, canvas.height);
    const material = createShaderMaterial(mapTexture, demTexture);

    const mesh = new THREE.Mesh(geometry, material);
    mesh.scale.multiplyScalar(1 / 1280);

    mesh.position.set(0, 0, -.06);

    return mesh;
}

export default createTerrain; 