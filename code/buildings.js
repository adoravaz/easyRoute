import * as THREE from 'three';
import { center, scale, top_right, bottom_left } from './map';
import { getBuildingMaterial } from './materials';

const buildingsGroup = new THREE.Group();

async function createBuildings() {
    try {
        // const response = await fetch('/UCSC_Buildings.geojson');
        const response = await fetch('/UCSC_Buildings_V3.geojson');
        const data = await response.json();
        LoadBuildings(data);
        //buildingsGroup.scale.multiplyScalar(.35)
        //buildingsGroup.rotateX(-Math.PI / 2)
        buildingsGroup.position.set(-.5, -.5, 0);
        // buildingsGroup.position.y = .05
        return buildingsGroup;
    } catch (error) {
        throw error;
    }
}

function LoadBuildings(data) {

    let features = data.features

    for (let i = 0; i < features.length; i++) {

        let fel = features[i]
        if (!fel['properties']) return

        if (fel.properties['building']) {
            addBuilding(fel.geometry, fel.properties, fel.properties["building:levels"])
        }
    }
}

function addBuilding(building, info, height = 1) {

    height = height ? height : 1

    let data = building.coordinates;
    let centroid = building.centroid;

    // This is because fel.geometry.coordinates is an array of arrays of cooridntes that make up all the polygons need for a building
    for (let i = 0; i < data.length; i++) {

        // Normalize the coordiantes and return the centroid in lat and long
        let polygon = normalizePolygon(data[i], centroid);

        let shape = genShape(polygon, center)
        let geometry = genGeometry(shape, {
            curveSegments: 1,
            depth: height / 400,
            bevelEnabled: false
        })

        let mesh = new THREE.Mesh(geometry, getBuildingMaterial(info['building']))
        mesh.geometry.computeBoundingBox();

        mesh.position.z = (centroid[2] - center[2]) / 3000; // This value needs to change 

        mesh.userData.info = info;
        mesh.userData.centroid = centroid;
        mesh.userData.type = "building"
        mesh.userData.color = mesh.material.color.getHex();

        if (info['name']) {

            var normalizedCentroid = [
                ((centroid[0]) - bottom_left[1]) / (top_right[1] - bottom_left[1]),
                ((centroid[1]) - bottom_left[0]) / (top_right[0] - bottom_left[0]),
            ]
            var buildingLabel = createTextSprite(info['name']);
            buildingLabel.scale.multiplyScalar(1 / 2000)
            buildingLabel.position.set(normalizedCentroid[0], normalizedCentroid[1], mesh.position.z + (height * 1.25 / 400))

            buildingsGroup.add(buildingLabel);
        }

        buildingsGroup.add(mesh)
    }
}

function normalizePolygon(polygon) {
    const output = polygon.map(vertex => [
        ((vertex[0]) - bottom_left[1]) / (top_right[1] - bottom_left[1]),
        ((vertex[1]) - bottom_left[0]) / (top_right[0] - bottom_left[0]),
    ]);
    return output
}

function genShape(polygon) {
    let shape = new THREE.Shape()

    for (let i = 0; i < polygon.length; i++) {
        let elp = polygon[i]

        if (i == 0) {
            shape.moveTo(elp[0], elp[1])
        } else {
            shape.lineTo(elp[0], elp[1])
        }
    }

    return shape
}

function genGeometry(shape, settings) {
    let geometry = new THREE.ExtrudeGeometry(shape, settings)

    return geometry
}

function createTextSprite(message, parameters = {}) {
    const fontface = parameters.fontface || 'Times New Roman';
    const fontsize = parameters.fontsize || 24;
    const fontweight = parameters.fontweight || '600';
    const borderThickness = parameters.borderThickness || 1;
    const borderColor = parameters.borderColor || { r: 0, g: 0, b: 0, a: 1.0 };
    const backgroundColor = parameters.backgroundColor || { r: 255, g: 255, b: 255, a: 1.0 };

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = `${fontweight} ${fontsize}px ${fontface}`; // Include font weight

    // Calculate canvas size based on text dimensions
    if (message.length > 25) {
        message = message.slice(0, 24);
        message += "..."
    }

    const metrics = context.measureText(message);
    const textWidth = metrics.width;

    canvas.width = textWidth * .5;
    canvas.height = fontsize;

    // Background color
    context.fillStyle = `rgba(${backgroundColor.r}, ${backgroundColor.g}, ${backgroundColor.b}, ${backgroundColor.a})`;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Border color
    context.strokeStyle = `rgba(${borderColor.r}, ${borderColor.g}, ${borderColor.b}, ${borderColor.a})`;
    context.lineWidth = borderThickness;
    context.strokeRect(0, 0, canvas.width, canvas.height);

    // Text color
    context.fillStyle = 'rgba(0.5, 0.5, 0, 1.0)';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(message, canvas.width / 2, canvas.height / 2);

    // Create texture
    const texture = new THREE.CanvasTexture(canvas);

    // Create sprite material
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });

    // Create sprite
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(canvas.width / 10, canvas.height / 10, 1); // Adjust scale based on canvas size

    return sprite;
}

export default createBuildings; 
