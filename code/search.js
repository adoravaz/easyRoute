import Openrouteservice from 'openrouteservice-js'

import createBuildings from './buildings';
import createHighways from './highways';

import makeDirection from './makeDirection';
import Map from './map';

const buildingCardtemplate = document.querySelector("[data-building-template]");
const buildingCardcontainer = document.querySelector("[data-building-cards-container]");
const searchInput = document.querySelector("[data-search]");

let buildings = []; 
const map = new Map();
// window.mainMap = map;
// scene.add(map);

console.log("map", map);

//getting the data from the users search
searchInput.addEventListener("input", e=> {
    const value = e.target.value.toLowerCase()
    buildings.forEach(feature => {
        const isVisible = feature.name?.toLowerCase().includes(value) || feature.address?.toLowerCase().includes(value)
        feature.element.classList.toggle("hide", !isVisible)
    })
    // console.log(buildings)
}) //check if we also want coordinates as part of the search of the buildings

fetch('/buildings.geojson') //need to check if path is correctly being referred to 
    .then(res => res.json())  // calling json() to parse the response.
    .then(data => {
        buildings = data.features.map(feature => { //data.features specifically for geoson files

            // const properties = feature.properties; // Accessing properties of each feature
            // const geometry = feature.geometry; // Accessing geometry of each feature

            const card = buildingCardtemplate.content.cloneNode(true).children[0]
            const header = card.querySelector("[data-header]");
            const body = card.querySelector("[data-body]"); 

            //calculating the centroid
            // const centroid = findCentroid(feature.geometry.coordinates[0]);  // Calculate centroid
            // // console.log(feature.geometry.coordinates)
            // console.log(centroid)

            // Setting the coordinates as an attribute
            card.setAttribute('data-coordinates', JSON.stringify(feature.geometry.coordinates));
            // card.setAttribute('data-centroid', JSON.stringify(centroid));

            header.textContent = feature.properties.name; 
            body.textContent = `${feature.properties['addr:street']} ${feature.properties['addr:housenumber']}, ${feature.properties['addr:city']} ${feature.properties['addr:postcode']}`;

            // Initially hide the card
            card.classList.add('hide');

            buildingCardcontainer.append(card); 

            //adding this line to store the centroid
            // card.dataset.centroid = JSON.stringify(feature.geometry.coordinates);

            return {name: feature.properties.name, address: body.textContent, element:card}; //just added centroid in attrib

            // console.log(feature)
            // console.log(geometry)
    })
})

let selectedCard = null; // Keeps track of the currently selected card

//listens for clicks on any card and reacts by interacting with the map
map.init().then(() => {
buildingCardcontainer.addEventListener('click', function(event) {
    const card = event.target.closest('.card');
    if (card) {
        const coordinates = JSON.parse(card.getAttribute('data-coordinates'));
        // const centroid = JSON.parse(card.getAttribute('data-centroid')); // Make sure you have saved centroid here

        // If there's a previously selected card, remove the selected class
        if (selectedCard && selectedCard !== card) {
            selectedCard.classList.remove('selected');
        }

        // Toggle the selected class on the current card
        card.classList.toggle('selected');
        selectedCard = card.classList.contains('selected') ? card : null;
        // console.log('card clicked')
        console.log(coordinates)
        // console.log(centroid)

        // map.highlightBuildingOnMap(centroid);
    }
  });
}).catch(error => console.error("Failed to initialize map:", error));

