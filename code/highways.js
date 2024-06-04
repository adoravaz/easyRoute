
import { getHighwayMatrial } from './materials';
import { Line } from 'three';

let alltypes = ['pedestrian', 'track', 'crossing', 'secondary', 'steps', 'footway',
    'traffic_signals', 'living_street', 'secondary_link',
    'service', 'cycleway', 'turning_circle', 'proposed', 'tertiary', 'path']

let temp = ['pedestrian', 'service', 'steps', 'cycleway', 'footway']
let test = ['steps']

const highwayTypes = new Set(test);

async function createHighways() {
    try {
        const response = await fetch('/UCSC_Highways_V7.geojson')
        const data = await response.json();
        const routesGroup = LoadHighways(data);
        console.log("highway loaded. Item length ", routesGroup.children.length);
        return routesGroup;
    } catch (error) {
        throw error;
    }
}

function LoadHighways(data) {
    let features = data.features
    const group = new THREE.Group();

    for (let i = 0; i < features.length; i++) {
        let feature = features[i]
        if (feature.properties['highway']) {
            let highway = addHighway(feature.geometry, feature.properties)

            if (highway) {
                group.add(highway)
            }
        }
    }

    return group;
}

function addHighway(data, info) {

    if (!highwayTypes.has(info.highway) || data.type === "Polygon") {
        return null
    }

    // This is because fel.geometry.coordinates is an array of arrays of coords that make up all the polygons need for a building
    for (let i = 0; i < data.coordinates.length; i++) {

        // Normalize the coordiantes and return the centroid in lat and long
        let polygon;
        if (data.coordinates[0].length == 1) {
            polygon = genGeometry(data.coordinates[0]);
        } else {
            polygon = genGeometry(data.coordinates);
        }

        let line = new Line(polygon, getHighwayMatrial(info.highway))
        line.geometry.computeBoundingBox();
        line.userData.type = "line"

        if (line.material.isLineDashedMaterial) {
            line.computeLineDistances();
        }

        return line;
    }

    return null;
}

// Ok so my problem is that line segements renders the vertex in steps of two so I have to account for that. 

function genGeometry(polygon) {

    const points = [];

    for (let i = 0; i < polygon.length; i++) {

        const point = window.map.getRelativePoints(polygon[i][1], polygon[i][0])
        points.push(new THREE.Vector3(point[0], point[1] + 0.0005, point[2]));
    }

    return new THREE.BufferGeometry().setFromPoints(points);
}

export default createHighways; 
