import * as THREE from 'three';
import { center, scale } from './map';

function genGeometry(polygon) {

    const points = [];

    for (let i = 0; i < polygon.length; i++) {
        const point = new THREE.Vector3(
            -(polygon[i][0] - center[0]) * scale,
            (polygon[i][2] / 10) - (center[2]),
            (polygon[i][1] - center[1]) * scale)
        points.push(point)
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    geometry.setIndex

    return geometry;
}

function makeDirection(data) {

    let geometry = genGeometry(data)

    let line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: "red" }))

    return line;
}

export default makeDirection;
