import * as THREE from 'three';
import Openrouteservice from 'openrouteservice-js'
import createBuildings from './buildings';
import createHighways from './highways';
import makeDirection from './makeDirection';
import { getProfileInfo } from './profiles';
import { getBuildingMaterial, highlightedMaterial } from './materials';

// So I want to be able to export this Map as a contain unite where it handles routing between different locations, drawing, etc 
// The main problem is that I want to be able to use this map with different controllers and in different spaces like XR, mobile, and desktop 

// Things to do: 
// add multi 

function findBuildings(mesh, result = []) {
    if (mesh.userData && mesh.userData.type === 'building') {
        result.push(mesh);
    }

    if (mesh.children && mesh.children.length > 0) {
        mesh.children.forEach(child => findBuildings(child, result));
    }

    return result;
}

// function dontAskLol(clickedBuildings) {
//     let output = []
//     let from = clickedBuildings[0].userData.centroid;
//     let to = clickedBuildings[1].userData.centroid;
//     console.log("Getting Directions from " + from + " and " + to);

//     // // Don't ask lol 
//     // from = [from[0], from[1]];
//     // to = [to[0], to[1]];

//     // clickedBuildings.forEach((coord) => {
//     //     output.push([coord.userData.centroid[0],])
//     // }).
// }

class Map extends THREE.Object3D {
    constructor(scene = null) {
        super();

        if (Map.instance) {
            return Map.instance;
        }

        this.buildings = null;
        this.highways = null;
        this.rotateY(Math.PI);
        this.scale.multiplyScalar(.1);
        scene.add(this);

        this.position.y = 5

        Map.instance = this;

        // Tools 
        this.orsDirections = new Openrouteservice.Directions({ api_key: import.meta.env.VITE_OPENSTREET_API_KEY });
        this.orsElevation = new Openrouteservice.Elevation({ api_key: import.meta.env.VITE_OPENSTREET_API_KEY });
        this.orsMatrix = new Openrouteservice.Matrix({ api_key: import.meta.env.VITE_OPENSTREET_API_KEY });

        this.routes = [];
        this.routeUphillCounters = [];
        this.clickedBuildings = [];
        this.clickable = [];

        // Profile type 
        this.profile = getProfileInfo('walking', 'walking');

        // Profile type 
        this.profile = getProfileInfo('walking', 'walking');

        this.init();
    }

    async init() {
        try {
            const buildingsGroup = await createBuildings();
            //console.log('Buildings loaded:', buildingsGroup);
            this.buildings = buildingsGroup;
            this.add(this.buildings);
            //console.log(this.buildings.children);

            const routesGroup = await createHighways();
            //console.log('Highways loaded', routesGroup);
            this.highways = routesGroup;
            this.highways.position.y = -0.1
            this.add(this.highways);

            this.clickable = findBuildings(this.buildings);

        } catch (error) {
            console.error('Failed to load buildings:', error);
        }

    }
    // This function draws the route. 
    generateDirections() {

        let length = this.clickedBuildings.length;
        if (length <= 1) {
            console.log("Not enough buildings clicked");
            return
        } else if (length == 2) {

            let from = this.clickedBuildings[0].userData.centroid;
            let to = this.clickedBuildings[1].userData.centroid;
            console.log("Clicked Buildings", this.clickedBuildings);

            console.log(from)
            console.log(to)
            console.log("Getting Directions from " + from + " and " + to);

            // Don't ask lol 
            from = [from[0], from[1]];
            to = [to[0], to[1]];

            let temp = this;

            this.orsDirections.calculate({
                coordinates: [from, to],
                profile: temp.profile.profile,
                format: "geojson",
                api_version: 'v2',
            })
                .then(function (json) {

                    const routeCoordinates = json.features.find(feature => feature.geometry.type === 'LineString').geometry.coordinates;

                    temp.orsElevation.lineElevation({
                        format_in: 'geojson',
                        format_out: 'geojson',
                        geometry: {
                            coordinates: routeCoordinates,
                            type: 'LineString'
                        }
                    }).then((res) => {

                        const route = makeDirection(res.geometry.coordinates);
                        console.log("cords:= ", route)
                        temp.routes.push(route);
                        temp.add(route);
                    }).catch((error) => {
                        let response = JSON.stringify(error, null, "\t")
                        console.error(response);
                    })

                    const uphillCounter = getUphillCounter(routeCoordinates).then(function (counter) {
                        console.log("updated!");
                        temp.routeUphillCounters.push(counter);
                        document.getElementById('uphill-counter').innerHTML = counter.toString() + " units of elevation.";

                        return counter;
                    }).catch(function () { });

                    console.log("uphill counter:");
                    console.log(uphillCounter);

                    console.log("json:");
                    console.log(JSON.stringify(json));
                })
                .catch(function (err) {
                    let response = JSON.stringify(err, null, "\t")
                    console.error(response);
                })

        } else { // Matrix direction 
            // this.orsMatrix.calculate({
            //     locations: 
            // })
        }
    }

    clearRoutes() {

        // Clear the buildings then the routes 
        this.clickedBuildings.forEach((building) => {
            this.deselectBuilding(building);
        })

        this.routes.forEach((route) => {
            console.log("Route cleared")
            this.remove(route);
        })

        this.routeUphillCounters.forEach((route) => {
            console.log("Route uphill counter cleared")
            this.remove(route);
        })

        this.routes = [];
    }

    //functions that allow selection of buildings through search card
    selectBuildingByCentroid(centroid) {
        const building = this.clickable.find(b => {
            return b.userData.centroid[0] === centroid[0] && b.userData.centroid[1] === centroid[1];
        });
        if (building && !this.clickedBuildings.includes(building)) {
            this.clickedBuildings.push(building);
            building.material = highlightedMaterial;
        }
    }

    deselectBuilding(building) {
        console.log(building.userData.info['building'])
        building.material = getBuildingMaterial(building.userData.info['building']);
    }

    selectBuilding(building) {
        building.material = highlightedMaterial;
    }

    deselectBuildingByCentroid(centroid) {
        const building = this.clickable.find(b => {
            return b.userData.centroid[0] === centroid[0] && b.userData.centroid[1] === centroid[1];
        });
        if (building) {
            this.clickedBuildings = this.clickedBuildings.filter(b => b !== building);
            building.material = getBuildingMaterial(building.userData.info['building']);
        }
    }

    checkIntersectedBuildings(building) {

        console.log(building)

        const index = this.clickedBuildings.indexOf(building);

        if (index !== -1) {
            this.deselectBuilding(building);
            this.clickedBuildings.splice(index, 1);
        } else {
            this.selectBuilding(building);
            this.clickedBuildings.push(building);
        }
    }

    update(time) {

    }

}

async function getUphillCounter(routeCoordinates) {
    try {
        // elevations are in the form of key value pairs of:
        // "x y": z
        const response = await fetch('/elevations.json')
        const elevations = await response.json();

        var counter = 0;
        var prev = -1;

        for (var i = 0; i < routeCoordinates.length; i++) {
            var key = routeCoordinates[i][0].toString() + " " + routeCoordinates[i][1].toString()

            // in case we don't have elevation data at a given point
            if (!elevations.hasOwnProperty(key)) {
                continue;
            }

            if (prev != -1 && elevations[key] > prev) {
                counter += elevations[key] - prev;
            }
            prev = elevations[key];
        }

        return counter;
    } catch (error) {
        throw error;
    }
}

export default Map;
