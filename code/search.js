
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
// window.mainMap = map;

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
        return { name: feature.properties.name, element: card, coordinates: feature.geometry.coordinates, centroid: centroid };
    });
}

function searchBuildings(input) {
    input.addEventListener("input", e => {
        const value = e.target.value.toLowerCase();
        if (value === "") {
            buildings.forEach(building => {
                building.element.classList.add("hide");
            });
        } else {
            buildings.forEach(building => {
                const isVisible = building.name?.toLowerCase().includes(value) || building.address?.toLowerCase().includes(value)
                // const isVisible = building.name ? building.name.toLowerCase().includes(value) : false;
                building.element.classList.toggle("hide", !isVisible);
                // building.element.style.display = 'block'; // Ensure cards are visible when they match the search
            });
        }
    });
}

//making sure we are focusing on either the start search input or the destination search input
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
        buildings.forEach(building => { // Hide all cards initially
            building.element.classList.add('hide');
        });
        if (activeInput === 'start' && startPoint !== selectedBuilding) {
            if (startPoint) {
                map.deselectBuildingByCentroid(startPoint.centroid); // Adjust deselection logic
                // startPoint.element.classList.remove('selected');
                startPoint.element.classList.remove('selected', 'visible');
                startPoint.element.classList.add('hide'); // Hide previous start point card
            }
            startPoint = selectedBuilding;
            startPoint.element.classList.add('selected', 'visible'); // Make only the selected card visible
            // startPoint.element.classList.add('selected');
            map.selectBuildingByCentroid(startPoint.centroid);
            console.log("Setting start point:", startPoint);
        } else if (activeInput === 'destination' && endPoint !== selectedBuilding) {
            if (endPoint) {
                map.deselectBuildingByCentroid(endPoint.centroid); // Adjust deselection logic
                // endPoint.element.classList.remove('selected');
                endPoint.element.classList.remove('selected', 'visible');
                endPoint.element.classList.add('hide'); // Hide previous destination card
            }
            endPoint = selectedBuilding;
            // endPoint.element.classList.add('selected');
            endPoint.element.classList.add('selected', 'visible'); // Make only the selected card visible
            map.selectBuildingByCentroid(endPoint.centroid);
            console.log("Setting end point:", endPoint);
        }
        // if (startPoint && endPoint && startPoint !== endPoint) {
        //     map.generateDirections(startPoint.centroid, endPoint.centroid);
        // }
        // Move the start card to the top of the container if it exists
        if (startPoint) {
            startPoint.element.classList.remove('hide');
            buildingCardcontainer.prepend(startPoint.element); // Ensures start point card is always at the top
        }
        // Move the destination card below the start card if both are selected
        if (endPoint) {
            endPoint.element.classList.remove('hide');
            if (startPoint) {
                startPoint.element.insertAdjacentElement('afterend', endPoint.element);
            } else {
                buildingCardcontainer.prepend(endPoint.element);
            }
        }
    }
    // Ensure selected cards are visible
    // if (startPoint) startPoint.element.classList.remove('hide');
    // if (endPoint) endPoint.element.classList.remove('hide');
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

