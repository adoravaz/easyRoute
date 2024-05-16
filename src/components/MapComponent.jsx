import React, { useEffect, useRef, useState} from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'stats.js';
import Map from '../utils/map.js'; // import Three.js Map component
import DirectionsList from './DirectionsList';
import './MapComponent.css';

const MapComponent = () => {
    const mountRef = useRef(null);
    const [routeTotal, setRouteTotal] = useState({});
    const [directions, setDirections] = useState([]);

    useEffect(() => {
        const stats = new Stats();
        stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom

        document.body.appendChild(stats.dom); // append stats overlay

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);

        // Position the camera
        camera.position.y = 10;
        //camera.position.x = 10;
        camera.position.z = 5;
        camera.updateProjectionMatrix();

        // Renderer
        const renderer = new THREE.WebGLRenderer({
            antialias: true
        })
        renderer.setClearColor("white");
        renderer.setPixelRatio(window.devicePixelRatio)
        renderer.setSize(window.innerWidth, window.innerHeight);
        // document.getElementById("app").appendChild(renderer.domElement);
        mountRef.current.appendChild(renderer.domElement); // append three.js canvas to ref

        // Map Controls 
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true
        controls.dampingFactor = .25
        controls.screenSpacePanning = true
        controls.maxDistance = 1000

        // Mouse 
        const mouse = new THREE.Vector2();

        // Helpers
        let gridHelper = new THREE.GridHelper(50, 30, new THREE.Color(0x555555), new THREE.Color(0x333333));
        //scene.add(gridHelper);

        let axisHelper = new THREE.AxesHelper(10, 10);
        //scene.add(axisHelper);

        // Init Light
        let light0 = new THREE.AmbientLight(0xfafafa, 10.25);
        let light1 = new THREE.PointLight(0xfafafa, 0.4);
        light1.position.set(20, 30, 10);

        scene.add(light0);
        scene.add(light1);

        // Raycaster 
        const raycast = new THREE.Raycaster();

        // Our Map 
        const map = new Map();
        scene.add(map);

        const onClick = (event) => {
            console.log("clicked");

            // get bounding rectangle of the map container
            const rect = renderer.domElement.getBoundingClientRect();

            // Calculate mouse position in normalized device coordinates (-1 to +1) for both components
            // mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
            // mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            // console.log("mouse x: " + mouse.x + ", mouse y: " + mouse.y);

            // Update the picking ray with the camera and mouse position
            raycast.setFromCamera(mouse, camera);

            // console.log('map.buildings.children: ' + JSON.stringify(map.buildings.children));
            // Calculate objects intersecting the picking ray
            const intersects = raycast.intersectObjects(map.buildings.children, true); // Note this only checks if we clicked buildings
            // console.log("intersects: " + intersects);
            if (intersects.length > 0) {
                map.checkIntersectedBuildings(intersects[0].object);
            }
        };

        const onCalcRoute = () => {
            // map.generateDirections((directions) => {
            //     setDirections(directions);
            // });
            map.generateDirections(setDirections, setRouteTotal);
        };

        const onClearRoute = () => {
            map.clearRoutes();
            setDirections([]);
            setRouteTotal({});
        };

        renderer.domElement.addEventListener('click', onClick);
        document.getElementById('calcRoute').addEventListener('click', onCalcRoute);
        document.getElementById('clearRoute').addEventListener('click', onClearRoute);

        const onWindowResize = () => {
            const rect = mountRef.current.getBoundingClientRect();

            // update camera aspect ratio and projection matrix
            // camera.aspect = window.innerWidth / window.innerHeight;
            camera.aspect = rect.width / rect.height;
            camera.updateProjectionMatrix();
            // update renderer size
            renderer.setSize(rect.width, rect.height);
            // renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', onWindowResize, false);

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);
            stats.begin();
            controls.update();
            renderer.render(scene, camera);
            stats.end();
        };
        
        animate();

        // cleanup and remove event listeners
        return () => {
            window.removeEventListener('resize', onWindowResize);
            renderer.domElement.removeEventListener('click', onClick);
            document.getElementById('calcRoute').removeEventListener('click', onCalcRoute);
            document.getElementById('clearRoute').removeEventListener('click', onClearRoute);
            mountRef.current.removeChild(renderer.domElement);
            document.body.removeChild(stats.dom); // Cleanup stats overlay as well
        };
    }, []);

    return (
        <div className="container">
            <div ref={mountRef} className="map-container"></div>
            <div className="directions-container">
                <DirectionsList directions={directions} routeTotal={routeTotal} />
            </div>
            <button id="calcRoute" className="my-button-1">Calculate Route</button>
            <br />
            <button id="clearRoute" className="my-button-2">Clear Route</button>
        </div>
        // <div ref={mapRef} />
    );
};

export default MapComponent;