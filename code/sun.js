import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

class Sun extends THREE.Object3D {
    constructor() {
        super();

        this.init();
    }

    init() {

        const loader = new GLTFLoader();
        let temp = this;
        loader.load(
            'easyRouteSun.glb',
            function (gltf) {
                // Called when the resource is loaded
                const model = gltf.scene;
                model.scale.multiplyScalar(.07);
                model.rotation.z = Math.PI / 10;
                model.rotation.y = Math.PI;
                model.position.set(0, .2, .45);
                console.log("model loaded", model);
                temp.add(model);
            },
            function (xhr) {
                // Called while loading is progressing
                //console.log(xhr);
            },
            function (error) {
                // Called when loading has errors
                console.error('An error happened', error);
            }
        );
    }
}

export default Sun; 