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
// make stuff simple 
// improve performance in route section 
// add a search bar 
// add 2D text to map 
// add hover 
// add default UI, problem: I need two different UIs 2D and 3D (for XR); 
// add multi 

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

        this.routes = [];
        this.routeUphillCounters = [];
        this.clickedBuildings = [];

        // Profile type 
        this.profile = getProfileInfo('walking', 'walking');

        this.init();
    }

    async init() {
        try {
            const buildingsGroup = await createBuildings();
            console.log('Buildings loaded:', buildingsGroup);
            this.buildings = buildingsGroup;
            this.add(this.buildings);
            //console.log(this.buildings.children);

            const routesGroup = await createHighways();
            console.log('Highways loaded', routesGroup);
            this.highways = routesGroup;
            this.highways.position.y = -0.1
            this.add(this.highways);

        } catch (error) {
            console.error('Failed to load buildings:', error);
        }

    }
    // This function draws the route. 
    generateDirections(startBuilding, endBuilding) {

        let length = this.clickedBuildings.length;
        if (length <= 1) {
            console.log("Not enough buildings clicked");
            return
        } else if (length == 2) {

            // let from = startBuilding.userData.centroid;
            // let to = endBuilding.userData.centroid;

    
            let from = this.clickedBuildings[0].userData.centroid;
            let to = this.clickedBuildings[1].userData.centroid;
            console.log("Clicked Buildings",this.clickedBuildings);

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
                    const route = makeDirection(routeCoordinates);
                    const uphillCounter = getUphillCounter(routeCoordinates).then(function (counter) {
                        console.log("updated!");
                        temp.routeUphillCounters.push(counter);
                        document.getElementById('uphill-counter').innerHTML = counter.toString() + " units of elevation.";

                        return counter;
                    }).catch(function () {});
                    temp.routes.push(route);
                    temp.add(route);

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
        const building = this.buildings.children.find(b => {
            return b.userData.centroid[0] === centroid[0] && b.userData.centroid[1] === centroid[1];
        });
          if (building && !this.clickedBuildings.includes(building)) {
            this.clickedBuildings.push(building);
            building.material = highlightedMaterial;
        }
    }

    deselectBuildingByCentroid(centroid) {
        const building = this.buildings.children.find(b => {
            return b.userData.centroid[0] === centroid[0] && b.userData.centroid[1] === centroid[1];
        });
            if (building) {
            this.clickedBuildings = this.clickedBuildings.filter(b => b !== building);
            building.material = getBuildingMaterial(building.userData.info['building']);
        }
    }

    //function to hide 
  

    // selectBuilding(buildingCentroid) {
    //     const building = this.buildings.children.find(b => {
    //         return b.userData.centroid[0] === buildingCentroid[0] && b.userData.centroid[1] === buildingCentroid[1];
    //     });
    //     if (building && !this.clickedBuildings.includes(building)) {
    //         this.clickedBuildings.push(building);
    //         building.material = highlightedMaterial;
    //     }
    // }
    
    // deselectBuilding(buildingCentroid) {
    //     const building = this.buildings.children.find(b => {
    //         return b.userData.centroid[0] === buildingCentroid[0] && b.userData.centroid[1] === buildingCentroid[1];
    //     });
    //     if (building) {
    //         this.clickedBuildings = this.clickedBuildings.filter(b => b !== building);
    //         building.material = getBuildingMaterial(building.userData.info['building']);
    //     }
    // }

    
    //functions that allow selection of buildings through manual click
    deselectBuilding(building) {
        console.log(building.userData.info['building'])
        building.material = getBuildingMaterial(building.userData.info['building']);
    }

    selectBuilding(building) {
        building.material = highlightedMaterial;
    }

    // checkIntersectedBuildings(intersectedObject) {
    //     if (this.clickedBuildings.includes(intersectedObject)) {
    //         this.deselectBuilding(intersectedObject);
    //     } else {
    //         this.selectBuilding(intersectedObject);
    //     }
    // }

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

        for (var i = 0; i < routeCoordinates.length; i ++) {
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
