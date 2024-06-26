import { MeshLineMaterial } from 'three.meshline';
import { metalness, roughness } from 'three/examples/jsm/nodes/Nodes.js';

const buildingMaterials = {
    university: new THREE.MeshBasicMaterial({ color: "#3d85c6" }), //dark blue
    apartments: new THREE.MeshBasicMaterial({ color: "#4C967D" }),
    dormitory: new THREE.MeshBasicMaterial({ color: "#fba826" }),
    // Make other buildings less prominent
    house: new THREE.MeshBasicMaterial({ color: "lightgray" }),
    trailer: new THREE.MeshBasicMaterial({ color: "lightgray" }),
    greenhouse: new THREE.MeshBasicMaterial({ color: "lightgray" }),
    farm_auxiliary: new THREE.MeshBasicMaterial({ color: "lightgray" }),
    industrial: new THREE.MeshBasicMaterial({ color: "lightgray" }),
    roof: new THREE.MeshBasicMaterial({ color: "lightgray" }), // include roofs but want them less visible
    default: new THREE.MeshBasicMaterial({ color: "lightgray" }), // Default for any unspecified building type
};

const highwayMaterials = {
    pedestrian: new THREE.LineBasicMaterial({ color: "black" }),
    residential: new THREE.LineBasicMaterial({ color: "coral" }),
    service: new THREE.LineBasicMaterial({ color: 0x969696 }),
    tertiary: new THREE.LineBasicMaterial({ color: "skyblue" }),
    secondary: new THREE.LineBasicMaterial({ color: "lightgreen" }),
    track: new THREE.LineBasicMaterial({ color: "white" }),
    secondary_link: new THREE.LineBasicMaterial({ color: "magenta" }), // Wheel chair ramp
    cycleway: new THREE.LineBasicMaterial({ color: "Bisque" }),
    footway: new THREE.LineBasicMaterial({ color: 'white' }),
    path: new THREE.LineBasicMaterial({ color: 0xE6E6FA }),
    steps: new THREE.LineDashedMaterial({ color: "red", linewidth: 1, scale: 1, dashSize: .0005, gapSize: .0002, opacity: 1 }),
    living_street: new THREE.LineBasicMaterial({ color: 0xfffdb8 }),
    default: new THREE.LineBasicMaterial({ color: "black" }),
}

const highlightedMaterial = new THREE.MeshStandardMaterial({
    color: 'red',   // Gold color
    emissive: 0xceeb5b, // Orange emissive color for a glowing effect
    emissiveIntensity: 1,
    roughness: 0.5,
    metalness: 0.1
});

const routeMaterial = new MeshLineMaterial({
    color: "yellow",
    lineWidth: 0.0003,
});

//added for materials for the entrances and elevators
const elevatorMaterials = {
    accessible: new THREE.MeshBasicMaterial({ color: "green" }),
    limited_access: new THREE.MeshBasicMaterial({ color: "yellow" }),
    no_access: new THREE.MeshBasicMaterial({ color: "red" })
};

const entranceMaterials = {
    main: new THREE.MeshBasicMaterial({ color: "blue" }),
    secondary: new THREE.MeshBasicMaterial({ color: "lightblue" }),
    restricted: new THREE.MeshBasicMaterial({ color: "grey" })
};

function getHighwayMatrial(type) {
    switch (type) {
        case "pedestrian": return highwayMaterials.pedestrian;
        case "residential": return highwayMaterials.residential;
        case "service": return highwayMaterials.service;
        case "tertiary": return highwayMaterials.tertiary;
        case "secondary": return highwayMaterials.secondary;
        case "track": return highwayMaterials.track;
        case "secondary_link": return highwayMaterials.secondary_link; // Wheel chair ramp
        case "cycleway": return highwayMaterials.cycleway;
        case "footway": return highwayMaterials.footway;
        case "path": return highwayMaterials.path;
        case "steps": return highwayMaterials.steps;
        case "living_street": return highwayMaterials.living_street;
        case "crossing": return highwayMaterials.default;
        case "traffic_signals": return highwayMaterials.default;
        case "turning_circle": return highwayMaterials.default;
        case "proposed": return highwayMaterials.default;
        default: return highwayMaterials.default;
    }
}

function getBuildingMaterial(type) {

    switch (type) {
        case "university": return buildingMaterials.university;
        case "apartments": return buildingMaterials.apartments;
        case "roof": return buildingMaterials.roof;
        case "dormitory": return buildingMaterials.dormitory;
        case "house": return buildingMaterials.house;
        case "trailer": return buildingMaterials.trailer;
        case "greenhouse": return buildingMaterials.greenhouse;
        case "farm_auxiliary": return buildingMaterials.farm_auxiliary;
        case "industrial": return buildingMaterials.industrial
        default: return buildingMaterials.default;
    }
}

function createShaderMaterial(mapTexture, demTexture) {
    const vertexShader = `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;

    const fragmentShader = `
        uniform sampler2D mapTexture;
        uniform sampler2D demTexture;
        varying vec2 vUv;

        void main() {
            vec4 mapColor = texture2D(mapTexture, vUv);
            vec4 demColor = texture2D(demTexture, vUv);
            gl_FragColor = vec4(mapColor.rgb, mapColor.a);
        }
    `;

    const material = new THREE.ShaderMaterial({
        uniforms: {
            mapTexture: { value: mapTexture },
            demTexture: { value: demTexture }
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader
    });

    return material;
}

export { getBuildingMaterial, getHighwayMatrial, highlightedMaterial, elevatorMaterials, entranceMaterials, routeMaterial };
