
import { MeshLine } from "three.meshline";
import { routeMaterial } from "./materials";

function makeDirection(polygon) {

    const points = [];

    for (let i = 0; i < polygon.length; i++) {
        const temp = window.map.getRelativePoints(polygon[i][1], polygon[i][0]);
        console.log("temp", temp);
        const point = new THREE.Vector3(
            temp[0],
            temp[1] + 0.0005,
            temp[2])
        points.push(point)
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const meshLine = new MeshLine();
    meshLine.setGeometry(geometry);

    return new THREE.Mesh(meshLine, routeMaterial);
}

export default makeDirection;
