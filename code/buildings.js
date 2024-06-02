
import { getBuildingMaterial } from './materials';

async function createBuildings() {
    try {

        const response = await fetch('/UCSC_Buildings_V3.geojson');
        const data = await response.json();
        const buildings = LoadBuildings(data);

        addElevationData(buildings);
        const titles = createBuildingTitles(buildings);

        buildings.rotation.x = -Math.PI / 2
        //buildings.position.set(-0.5, .1, .5);

        const group = new THREE.Group();
        group.add(titles);
        group.add(buildings);



        return group;
    } catch (error) {
        throw error;
    }
}

function LoadBuildings(data) {

    const buildingsGroup = new THREE.Group();

    let features = data.features

    for (let i = 0; i < features.length; i++) {

        let fel = features[i]
        if (!fel['properties']) return

        if (fel.properties['building']) {
            let building = addBuilding(fel.geometry, fel.properties, fel.properties["building:levels"])

            if (building != null) {
                buildingsGroup.add(building);
            }
        }
    }

    return buildingsGroup;
}

function addElevationData(buildings) {

    for (let i = 0; i < buildings.children.length; i++) {
        let building = buildings.children[i];
        let temp = window.map.getRelativePoints(building.userData.centroid[1], building.userData.centroid[0]);
        building.userData.worldPoints = temp;
        building.position.z = temp[1];
    }

    console.log("elevation added to all buildings");
}

function createBuildingTitles(buildings) {

    const titlesGroup = new THREE.Group();

    for (let i = 0; i < buildings.children.length; i++) {
        let building = buildings.children[i];
        let info = building.userData.info;
        let position = building.userData.worldPoints;

        if (info['name']) {
            var buildingLabel = createTextSprite(info['name']);
            buildingLabel.position.set(position[0], position[1] + (building.userData.height * 0.001), position[2])
            //buildingLabel.rotation.x = Math.PI / 2;
            titlesGroup.add(buildingLabel);
        }

    }

    //titlesGroup.rotation.x = Math.PI;
    return titlesGroup;
}
function addBuilding(building, info, height = 1) {

    height = height ? height : 1

    let data = building.coordinates;
    let centroid = building.centroid;

    // This is because fel.geometry.coordinates is an array of arrays of cooridntes that make up all the polygons needed for a building
    for (let i = 0; i < data.length; i++) {

        // Normalize the coordiantes and return the centroid in lat and long
        let polygon = normalizePolygon(data[i]);

        let shape = genShape(polygon)
        let geometry = genGeometry(shape, {
            curveSegments: 1,
            depth: height / 1500,
            bevelEnabled: false
        })

        let mesh = new THREE.Mesh(geometry, getBuildingMaterial(info['building']))
        mesh.geometry.computeBoundingBox();

        mesh.userData.info = info;
        mesh.userData.centroid = centroid;
        mesh.userData.type = "building"
        mesh.userData.color = mesh.material.color.getHex();
        mesh.userData.height = height;

        return mesh;
    }

    return null;
}

function normalizePolygon(polygon) {

    let bbox = window.map.bbox;

    const output = polygon.map(vertex => [
        ((vertex[0]) - bbox[0]) / (bbox[2] - bbox[0]) - 0.5,
        ((vertex[1]) - bbox[1]) / (bbox[3] - bbox[1]) - 0.5,
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
    const fontsize = parameters.fontsize || 28;
    const fontweight = parameters.fontweight || '600';
    const borderThickness = parameters.borderThickness || 1;
    const borderColor = parameters.borderColor || { r: 0, g: 0, b: 0, a: 1.0 };
    const backgroundColor = parameters.backgroundColor || { r: 255, g: 255, b: 255, a: 1.0 };

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = `${fontweight} ${fontsize}px ${fontface}`; // Include font weight

    // Calculate canvas size based on text dimensions
    if (message.length > 20) {
        message = message.slice(0, 17);
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
    sprite.scale.set(window.innerWidth / 1300000, window.innerHeight / 1300000, 1); // Adjust scale based on canvas size

    return sprite;
}

export default createBuildings; 
