import Openrouteservice from 'openrouteservice-js'
import createBuildings from './buildings';
import createHighways from './highways';
import makeDirection from './makeDirection';
import createEntrancesAndElevators from './createEntrancesAndElevators'; //added for the elevators

import { getProfileInfo } from './profiles';
import { getBuildingMaterial, highlightedMaterial } from './materials';

// repair icon image
const repairIconTexture = new THREE.TextureLoader().load('/repair_icon.png');

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
        this.tgeo = null;
        this.terrain = null;

        Map.instance = this;
        window.map = this;

        // Tools 
        this.orsDirections = new Openrouteservice.Directions({ api_key: import.meta.env.VITE_OPENSTREET_API_KEY });
        this.orsElevation = new Openrouteservice.Elevation({ api_key: import.meta.env.VITE_OPENSTREET_API_KEY });

        this.center = [36.9916, -122.0583]
        this.scalar = 1;
        this.radius = 4;
        this.zoom = 16;

        this.routes = [];
        this.routeUphillCounters = [];
        this.clickedBuildings = [];
        this.clickable = [];

        this.proj = null;
        this.bbox = null;

        this.raycaster = new THREE.Raycaster();

        // Profile type 
        this.profile = getProfileInfo('driving-car');

        // Pop up 
        this.popup = document.getElementById('popup')
        this.popupHeader = document.getElementById('popup_header');
        this.popupAddress = document.getElementById('popup_address');
        this.init();
    }

    async init() {
        try {
            this.tgeo = new ThreeGeo({
                tokenMapbox: import.meta.env.VITE_MAPBOX_API_TOKEN, // <---- set your Mapbox API token here
            });

            this.terrain = await this.tgeo.getTerrainRgb(this.center, this.radius, this.zoom);
            this.terrain.scale.multiplyScalar(this.scalar);
            this.terrain.rotation.x = -Math.PI / 2;
            const { proj, bbox } = this.tgeo.getProjection(this.center, this.radius);
            this.proj = proj;
            this.bbox = bbox;

            this.add(this.terrain);

            //added for the entrances and elevators
            const elevandentGroup = await createEntrancesAndElevators();
            console.log('Entrances and Elevators loaded', elevandentGroup);
            this.elevandent = elevandentGroup;
            this.add(this.elevandent);

            this.buildings = await createBuildings();
            console.log('Buildings loaded:');
            this.add(this.buildings);
            this.clickable = findBuildings(this.buildings); // I have sprite and mesh objects in there. 

            // this.highways = await createHighways();
            // this.add(this.highways);

        } catch (error) {
            console.error('Failed to load buildings:', error);
        }
    }

    // This function takes in a lat and a long and returns an array of points [x, y, z] use these to update objects to the right position. 
    getRelativePoints(lat, long) {

        if (this.terrain != null) {

            const temp = this.proj([lat, long]);

            const origin = new THREE.Vector3(temp[0], 5, -temp[1]);

            const direction = new THREE.Vector3(0, -1, 0);
            direction.normalize();

            this.raycaster.set(origin, direction);

            const intersects = this.raycaster.intersectObjects(this.terrain.children, true); // true to check all descendants

            if (intersects.length > 0) {
                return [origin.x, intersects[0].point.y, origin.z]; // [x, y, z]
            } else {
                //console.log('No intersections found.');
                return [0, 0, 0];
            }
        }

        console.log("terrain is still null");

        return [0, 0, 0];
    }

    // This function takes in a lat and a long and returns an array of points [x, y, z] use these to update objects to the right position. 
    getRelativePoints(lat, long) {

        if (this.terrain != null) {

            const temp = this.proj([lat, long]);

            const origin = new THREE.Vector3(temp[0], 5, -temp[1]);

            const direction = new THREE.Vector3(0, -1, 0);
            direction.normalize();

            this.raycaster.set(origin, direction);

            const intersects = this.raycaster.intersectObjects(this.terrain.children, true); // true to check all descendants

            if (intersects.length > 0) {
                return [origin.x, intersects[0].point.y, origin.z]; // [x, y, z]
            } else {
                //console.log('No intersections found.');
                return [0, 0, 0];
            }
        }

        console.log("terrain is still null");

        return [0, 0, 0];
    }

    // This function takes in a lat and a long and returns an array of points [x, y, z] use these to update objects to the right position. 
    getRelativePoints(lat, long) {

        if (this.terrain != null) {

            const temp = this.proj([lat, long]);

            const origin = new THREE.Vector3(temp[0], 5, -temp[1]);

            const direction = new THREE.Vector3(0, -1, 0);
            direction.normalize();

            this.raycaster.set(origin, direction);

            const intersects = this.raycaster.intersectObjects(this.terrain.children, true); // true to check all descendants

            if (intersects.length > 0) {
                return [origin.x, intersects[0].point.y, origin.z]; // [x, y, z]
            } else {
                //console.log('No intersections found.');
                return [0, 0, 0];
            }
        }

        console.log("terrain is still null");

        return [0, 0, 0];
    }

    // This function takes in a lat and a long and returns an array of points [x, y, z] use these to update objects to the right position. 
    getRelativePoints(lat, long) {

        if (this.terrain != null) {

            const temp = this.proj([lat, long]);

            const origin = new THREE.Vector3(temp[0], 5, -temp[1]);

            const direction = new THREE.Vector3(0, -1, 0);
            direction.normalize();

            this.raycaster.set(origin, direction);

            const intersects = this.raycaster.intersectObjects(this.terrain.children, true); // true to check all descendants

            if (intersects.length > 0) {
                return [origin.x, intersects[0].point.y, origin.z]; // [x, y, z]
            } else {
                //console.log('No intersections found.');
                return [0, 0, 0];
            }
        }

        console.log("terrain is still null");

        return [0, 0, 0];
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
            console.log("Getting Directions from " + from + " and " + to);

            // Don't ask lol 
            from = [from[0], from[1]];
            to = [to[0], to[1]];

            let temp = this;
            // customize options based on avoid stairs switch
            const options = avoidStairs ? { avoid_features: ['steps'] } : {};
            const mode = document.getElementById('travelProfile').value;

            console.log("mode, options", mode, options.avoid_features);
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

                        getUphillCounter(routeCoordinates).then(function (counter) {
                            console.log("uphill counter:", counter);
                            temp.routeUphillCounters.push(counter);

                            let color = "#000000";
                            if (counter < 5) {
                                color = "#00c800";
                            } else if (counter > 30) {
                                color = "#c80000";
                            } else {
                                let rOffset = Math.round((counter - 5) / (30 - 5) * 200);
                                let gOffset = 200 - rOffset;

                                rOffset = rOffset.toString(16);
                                gOffset = gOffset.toString(16);

                                if (rOffset.length == 1) {
                                    rOffset = "0" + rOffset;
                                }
                                if (gOffset.length == 1) {
                                    gOffset = "0" + gOffset;
                                }

                                color = "#" + rOffset + gOffset + "00";
                            }

                            if (counter == 1) {
                                document.getElementById('uphill-counter').innerHTML = "For this route, you must climb <b>" + counter.toString() + " unit of elevation</b>.";
                            } else {
                                document.getElementById('uphill-counter').innerHTML = "For this route, you must climb <b>" + counter.toString() + " units of elevation</b>.";
                            }
                            document.getElementById('uphill-counter').style.color = color;

                        }).catch(function () { });
                    }).catch((error) => {
                        let response = JSON.stringify(error, null, "\t")
                        console.error(response);
                    })
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

        // clear uphill counter
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
        this.popupHeader.innerText = `${buildingInfo.name}`;
        this.popupAddress.innerText = `${buildingInfo['addr:housenumber']} ${buildingInfo['addr:street']}, ${buildingInfo['addr:city']}, ${buildingInfo['addr:postcode']}`;

        this.popup.style.display = 'block';

        // display building's repair details if available
        const repairDetails = (window.repairDetailsMap[buildingInfo.name]) ? ("Reported Repairs: " + window.repairDetailsMap[buildingInfo.name]) : "";
        document.getElementById('report-show').innerText = repairDetails; // clear previous details
    }

    hidePopup() {
        this.popup.style.display = 'none';
    }

    // add repair icon based on entered location
    addIconAtLocation(iconUrl, geoPosition) {
        if (iconUrl === '/repair_icon.png') {
            console.log("geoPosition: " + JSON.stringify(geoPosition));
            this.addRepairIcon(geoPosition);
        } else {
            console.log("invalid icon URL: ", iconUrl);
        }
    }

    addRepairIcon(geoPosition) {
        const { longitude, latitude, elevation, levels } = geoPosition;
        const center = [-122.0583, 36.9916, 36.9941766]; // lon, lat, elev
        const scale = 10000;

        // Create material for the repair icon sprite
        const material = new THREE.SpriteMaterial({ map: repairIconTexture });

        // Create the sprite
        const repairIcon = new THREE.Sprite(material);

        // Scale the sprite to an appropriate size
        repairIcon.scale.set(0.002, 0.002, 0.002);
        let position = window.map.getRelativePoints(latitude, longitude);
        console.log("position from addRepairIcon (lon, lat): " + JSON.stringify(position));
        /* WHAT WE WANT:
            Engineering 2 - x: -0.03653762744349004, y: 0.027197348814988715, z: -0.09237682727959462, height: 5 
            SNE - x: -0.01906323468879839, y: 0.022629188805589746, z: -0.07408626253553885, height: 1
            Media Theater - x: -0.02611265279015801, y: 0.020111946201806348, z: -0.035883454819152005, height: 1
        */

        // Set the position of the sprite
        repairIcon.position.set(position[0], position[1] + levels * 0.001 + 0.001, position[2]);
        console.log("repairIcon position set (x, z, y): " + JSON.stringify(position[0]) + ", " + JSON.stringify(position[1] + levels * 0.001) + ", " + JSON.stringify(position[2]) + ", levels: " + levels);

        // Add the sprite to the scene
        this.add(repairIcon);

        console.log("Repair icon added");
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
