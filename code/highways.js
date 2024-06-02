
import { getHighwayMatrial } from './materials';


let alltypes = ['pedestrian', 'track', 'crossing', 'secondary', 'steps', 'footway',
    'traffic_signals', 'living_street', 'secondary_link',
    'service', 'cycleway', 'turning_circle', 'proposed', 'tertiary', 'path']
let temp = ['pedestrian', 'secondary', 'service', 'footway', 'steps']
let test = ['residential']

const routesGroup = new THREE.Group();

const highwayTypes = new Set(temp);

async function createHighways() {
    try {
        // const response = await fetch('/UCSC_Highways.geojson');
        const response = await fetch('/UCSC_Highways_V7.geojson')
        const data = await response.json();
        LoadHighways(data);
        return routesGroup;
    } catch (error) {
        throw error;
    }
}

function LoadHighways(data) {
    let features = data.features

    for (let i = 0; i < features.length; i++) {
        let feature = features[i]
        if (feature.properties['highway']) {
            addHighway(feature.geometry, feature.properties)
        }
    }
}

function addHighway(data, info) {

    if (!highwayTypes.has(info.highway) || data.type === "Polygon") {
        return
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

        let line = new THREE.Line(polygon, getHighwayMatrial(info.highway))

        line.userData.type = "line"

        routesGroup.add(line);
    }
}

// Ok so my problem is that line segements renders the vertex in steps of two so I have to account for that. 

function genGeometry(polygon) {

    const points = [];

    for (let i = 0; i < polygon.length; i++) {
        const point = new THREE.Vector3(-(polygon[i][1] - center[1]) * (1 / scale), 0, (polygon[i][0] - center[0]) * (1 / scale))
        points.push(point)
    }

    // console.log("geometry points", points);

    const geometry = new THREE.BufferGeometry().setFromPoints(points);


    return geometry;
}

export default createHighways; 
