
function genGeometry(polygon) {

    const points = [];

    for (let i = 0; i < polygon.length; i++) {
        const temp = window.map.getRelativePoints(polygon[i][1], polygon[i][0]);
        console.log("temp", temp);
        const point = new THREE.Vector3(
            temp[0],
            temp[1],
            temp[2])
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
