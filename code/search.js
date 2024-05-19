import Map from './map';
import Openrouteservice from 'openrouteservice-js'
import createBuildings from './buildings';
import createHighways from './highways';
import makeDirection from './makeDirection';

const buildingCardtemplate = document.querySelector("[data-building-template]");
const buildingCardcontainer = document.querySelector("[data-building-cards-container]");
const startSearchInput = document.querySelector("#start-search"); //referring to the html elements
const destinationSearchInput = document.querySelector("#destination-search");

// console.log(startSearchInput)
// console.log(destinationSearchInput)

let buildings = []; 
const map = new Map();
window.mainMap = map;

// console.log("map", map);

let startPoint = null;
let endPoint = null;
let isStartSelected = false;
let activeInput = null;  // Keeps track of which input is active

async function loadBuildings() {
    const res = await fetch('/UCSC_Buildings_V3.geojson');
    console.log('loaded buildings')
    const data = await res.json();
    buildings = data.features.map(feature => {
        const card = buildingCardtemplate.content.cloneNode(true).children[0];
        const header = card.querySelector("[data-header]");
        const body = card.querySelector("[data-body]");
        const centroid = feature.geometry.centroid;
        header.textContent = feature.properties.name;
        body.textContent = `${feature.properties['addr:street']} ${feature.properties['addr:housenumber']}, ${feature.properties['addr:city']} ${feature.properties['addr:postcode']}`;
        card.classList.add('hide');
        buildingCardcontainer.append(card);
        return { name: feature.properties.name, element: card, coordinates: feature.geometry.coordinates, centroid: centroid};
    });
}

function searchBuildings(input) {
    input.addEventListener("input", e => {
        const value = e.target.value.toLowerCase();
            if (value === "") {
                buildings.forEach(building => {
                building.element.classList.add("hide");
             });
           }else{
                buildings.forEach(building => {
                const isVisible = building.name?.toLowerCase().includes(value) || building.address?.toLowerCase().includes(value)
                // const isVisible = building.name ? building.name.toLowerCase().includes(value) : false;
                building.element.classList.toggle("hide", !isVisible);
            });
        }
    });
}


startSearchInput.addEventListener("focus", () => {
    activeInput = 'start';
});

destinationSearchInput.addEventListener("focus", () => {
    activeInput = 'destination';
});

buildingCardcontainer.addEventListener('click', event => {
        const card = event.target.closest('.card');
        if (card) {
            const selectedBuilding = buildings.find(b => b.name === card.querySelector("[data-header]").textContent);
            if (activeInput === 'start' && startPoint !== selectedBuilding) {
                if (startPoint) {
                    map.deselectBuildingByCentroid(startPoint.centroid); // Adjust deselection logic
                    startPoint.element.classList.remove('selected');
                }
                startPoint = selectedBuilding;
                startPoint.element.classList.add('selected');
                map.selectBuildingByCentroid(startPoint.centroid);
                console.log("Setting start point:", startPoint);
            } else if (activeInput === 'destination' && endPoint !== selectedBuilding) {
                if (endPoint) {
                    map.deselectBuildingByCentroid(endPoint.centroid); // Adjust deselection logic
                    endPoint.element.classList.remove('selected');
                }
                endPoint = selectedBuilding;
                endPoint.element.classList.add('selected');
                map.selectBuildingByCentroid(endPoint.centroid);
                console.log("Setting end point:", endPoint);
            }
            // if (startPoint && endPoint && startPoint !== endPoint) {
            //     map.generateDirections(startPoint.centroid, endPoint.centroid);
            // }
    }
});

// function testHighlight() {
//     const knownCentroid = [-122.060563, 36.993883, 200];
//     map.selectBuilding(knownCentroid);
// }
// testHighlight();  // Call this somewhere in your initialization to see if highlighting works in isolation

loadBuildings();
searchBuildings(startSearchInput);
searchBuildings(destinationSearchInput);

console.log(startSearchInput)
console.log(destinationSearchInput)
