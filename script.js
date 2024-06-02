import Map from './code/map'

(async () => {
    THREE.Object3D.DefaultUp = new THREE.Vector3(0, 0, 1);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
        antialias: true
    })
    renderer.setClearColor("white");
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.getElementById("app").appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);

    const scene = new THREE.Scene();
    const walls = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxBufferGeometry(1, 1, 1)),
        new THREE.LineBasicMaterial({ color: 0xcccccc }));
    walls.position.set(0, 0, 0);
    scene.add(walls);
    scene.add(new THREE.AxesHelper(1));

    const stats = new Stats();
    stats.showPanel(1); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(stats.dom);
    const render = () => {
        stats.update();
        renderer.render(scene, camera);
    };

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        render();
    }

    window.addEventListener('resize', onWindowResize, false);

    controls.addEventListener('change', render);
    render(); // first time


    const map = new Map();
    scene.add(map);

    render();
})();

