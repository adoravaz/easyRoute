import * as THREE from 'three';
import Openrouteservice from 'openrouteservice-js'
import createBuildings from './buildings';
import createTerrain from './terrain';
import createHighways from './highways';
import makeDirection from './makeDirection';
import { getProfileInfo } from './profiles';
import { getBuildingMaterial, highlightedMaterial } from './materials';

export const top_right = [37.0135, -122.0308]
export const bottom_left = [36.9696, -122.0857]
export const center = [36.9916, -122.0583, 182] // lon, lat, elev = 182 ors (note elevation is relative to ORS (openrouteservice) classification)
export const scale = 100 // as in how big 100x100 units big 

function findBuildings(mesh, result = []) {
    if (mesh.userData && mesh.userData.type === 'building') {
        result.push(mesh);
    }

    if (mesh.children && mesh.children.length > 0) {
        mesh.children.forEach(child => findBuildings(child, result));
    }

    return result;
}

class Map extends THREE.Object3D {
    constructor() {
        super();

        if (Map.instance) {
            return Map.instance;
        }

        this.buildings = null;
        this.highways = null;
        this.terrain = null;

        Map.instance = this;

        // Tools 
        this.orsDirections = new Openrouteservice.Directions({ api_key: import.meta.env.VITE_OPENSTREET_API_KEY });
        this.orsElevation = new Openrouteservice.Elevation({ api_key: import.meta.env.VITE_OPENSTREET_API_KEY });

        this.routes = [];
        this.routeUphillCounters = [];
        this.clickedBuildings = [];
        this.clickable = [];

        // Profile type 
        this.profile = getProfileInfo('driving-car');

        // Pop up 
        this.popup = document.getElementById('popup')

        this.init();
    }

    async init() {
        try {
            this.buildings = await createBuildings();
            console.log('Buildings loaded:');
            this.add(this.buildings);

            this.highways = await createHighways();
            console.log('Highways loaded');
            this.highways.position.y = -0.1
            this.add(this.highways);

            // this.terrain = await createTerrain();
            // console.log('Terrain computed');
            // this.add(this.terrain);

            this.clickable = findBuildings(this.buildings); // I have sprite and mesh objects in there. 

            this.scale.multiplyScalar(10)
            this.rotateX(-Math.PI / 2)

        } catch (error) {
            console.error('Failed to load buildings:', error);
        }

    }
    // This function draws the route. 
    generateDirections(avoidStairs) {

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

            let mode = document.getElementById('travelProfile').value;
            console.log("mode", mode);

            let temp = this;
            // customize options based on avoid stairs switch
            const options = avoidStairs ? { avoid_features: ['steps'] } : {};

            this.orsDirections.calculate({
                coordinates: [from, to],
                profile: mode,
                format: "geojson",
                api_version: 'v2',
                options: options,
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

                        // parse json response into directions array
                        const segments = json.features[0].properties.segments[0]; // contains distance, duration, instruction for directions
                        // distance and duration for entire route
                        const routeTotal = { distance: segments.distance, duration: segments.duration };
                        // turn-by-turn directions
                        let directions = segments.steps.map((step) => ({
                            distance: step.distance,
                            duration: step.duration,
                            instruction: step.instruction
                        }));
                        // update directions list
                        window.updateDirectionsList(directions, routeTotal);
                        document.getElementById('directions-container').style.display = 'block';
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

        } else {

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
        this.clickedBuildings = [];

        // clear directions list and hide the container
        window.updateDirectionsList([], { distance: 0, duration: 0 });
        document.getElementById('directions-container').style.display = 'none';
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

        // We can only select two buildings at a time. Deselect the old building 
        const index = this.clickedBuildings.indexOf(building);

        if (index !== -1) {
            this.deselectBuilding(building);
            this.clickedBuildings.splice(index, 1);
        } else {  // add it to the list 
            if (this.clickedBuildings.length >= 2) {

                this.deselectBuilding(this.clickedBuildings[0])
                this.clickedBuildings.shift();
            }

            this.selectBuilding(building);
            this.clickedBuildings.push(building);
        }
    }

    showPopup(x, y, building) {

        this.popup.style.left = `${x}px`;
        this.popup.style.top = `${y}px`;

        const buildingInfo = building.userData.info
        this.popup.innerHTML = `
        <h2>${buildingInfo.name}</h2>
        <p>${buildingInfo['addr:housenumber']} ${buildingInfo['addr:street']}, ${buildingInfo['addr:city']}, ${buildingInfo['addr:postcode']}</p>
        `;
        this.popup.style.display = 'block';
    }

    hidePopup() {
        this.popup.style.display = 'none';
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
