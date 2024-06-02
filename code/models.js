

export async function createSun() {
    const loader = window.gltfLoader;

    return new Promise((resolve, reject) => {
        loader.load(
            'easyRouteSun.glb',
            function (gltf) {
                // Called when the resource is loaded
                const model = gltf.scene;
                model.scale.multiplyScalar(.07);
                model.rotation.z = Math.PI / 10;
                model.rotation.y = Math.PI;
                model.position.set(0, .2, .5);
                console.log("model loaded", model);
                resolve(model); // Resolve the promise with the loaded model
            },
            function (xhr) {
                // Called while loading is progressing
                console.log(xhr);
            },
            function (error) {
                // Called when loading has errors
                console.error('An error happened', error);
                reject(error); // Reject the promise with the error
            }
        );
    });
}

export async function createBananaDuck() {
    const loader = window.gltfLoader;

    return new Promise((resolve, reject) => {
        loader.load(
            'banana_duck.glb',
            function (gltf) {
                // Called when the resource is loaded
                const model = gltf.scene;
                model.scale.multiplyScalar(.2);
                //model.rotation.z = Math.PI / 10;
                model.rotation.y = Math.PI;
                model.position.set(4, .4, 1);
                console.log("model loaded", model);
                resolve(model); // Resolve the promise with the loaded model
            },
            function (xhr) {
                // Called while loading is progressing
                console.log(xhr);
            },
            function (error) {
                // Called when loading has errors
                console.error('An error happened', error);
                reject(error); // Reject the promise with the error
            }
        );
    });
}
