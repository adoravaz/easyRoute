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
                    map.deselectBuilding(startPoint.centroid); // Adjust deselection logic
                    startPoint.element.classList.remove('selected');
                }
                startPoint = selectedBuilding;
                startPoint.element.classList.add('selected');
                map.selectBuilding(startPoint.centroid);
                console.log("Setting start point:", startPoint);
            } else if (activeInput === 'destination' && endPoint !== selectedBuilding) {
                if (endPoint) {
                    map.deselectBuilding(endPoint.centroid); // Adjust deselection logic
                    endPoint.element.classList.remove('selected');
                }
                endPoint = selectedBuilding;
                endPoint.element.classList.add('selected');
                map.selectBuilding(endPoint.centroid);
                console.log("Setting end point:", endPoint);
            }
            if (startPoint && endPoint && startPoint !== endPoint) {
                map.generateDirections(startPoint.centroid, endPoint.centroid);
            }
            // card.classList.toggle('selected');
            // if (startPoint && endPoint) {
            //     map.generateDirections(startPoint.centroid, endPoint.centroid);

            // setPoint(selectedBuilding.centroid); //calls function
            // if (!isStartSelected && selectedBuilding != null) {
            //     // map.selectBuilding(selectedBuilding.centroid);
            //     setStartPoint(selectedBuilding.centroid);
            //     isStartSelected = true;
            //     // console.log('Highlighted!')
            // }else {
            //     setEndPoint(selectedBuilding.centroid);
            //     isStartSelected = false; // Reset for next selection
            //     // console.log('Highlighted2!')
            // }
            // card.classList.toggle('selected');
            // card.classList.contains('selected') ? card : null;
            // if (map.buildings != null) {
            // //    map.selectBuilding(selectedBuilding.centroid);
            //    setStartPoint(selectedBuilding.centroid);
            //    console.log('Highlighted!')
            // }
            // setStartPoint(startPoint);
            // setEndPoint(endPoint);


            // if (startPoint && endPoint && startPoint !== endPoint) {
            //     map.generateDirections(startPoint.centroid, endPoint.centroid);
            // }else{
            //     console.log("Invalid start or end point:", startPoint, endPoint);
            // }
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

// function setStartPoint(building) {
//     console.log("Setting start point:", building);
//     startPoint = building;
//     map.selectBuilding(building);
// }

// function setEndPoint(building) {
//     console.log("Setting end point:", building);
//     endPoint = building;
//     map.selectBuilding(building);
// }




// console.log(startSearchInput)
// // console.log(destinationSearchInput)
// searchBuildings(startSearchInput, setStartPoint);
// // console.log(search1)

// searchBuildings(destinationSearchInput, setEndPoint);
console.log(startSearchInput)
console.log(destinationSearchInput)

// const buildingCardtemplate = document.querySelector("[data-building-template]");
// const buildingCardcontainer = document.querySelector("[data-building-cards-container]");
// const searchInput = document.querySelector("[data-search]");

// let buildings = []; 
// const map = new Map();
// window.mainMap = map;
// scene.add(map);

// console.log("map", map);

// //getting the data from the users search
// searchInput.addEventListener("input", e=> {
//     const value = e.target.value.toLowerCase()
//     //if the search bar is empty, hide all cards 
//     if (value === "") {
//         // If the search bar is empty, hide all cards
//         buildings.forEach(feature => {
//             feature.element.classList.add("hide");
//         });
//     }else{
//         buildings.forEach(feature => {
//             const isVisible = feature.name?.toLowerCase().includes(value) || feature.address?.toLowerCase().includes(value)
//             feature.element.classList.toggle("hide", !isVisible)
//         });
//     }
//     // console.log(buildings)
// }); //check if we also want coordinates as part of the search of the buildings

// fetch('/UCSC_Buildings_V3.geojson') //need to check if path is correctly being referred to 
//     .then(res => res.json())  // calling json() to parse the response.
//     .then(data => {
//         buildings = data.features.map(feature => { //data.features specifically for geoson files

//             // const properties = feature.properties; // Accessing properties of each feature
//             // const geometry = feature.geometry; // Accessing geometry of each feature

//             const card = buildingCardtemplate.content.cloneNode(true).children[0]
//             const header = card.querySelector("[data-header]");
//             const body = card.querySelector("[data-body]"); 

//             //calculating the centroid
//             // const centroid = findCentroid(feature.geometry.coordinates[0]);  // Calculate centroid
//             // // console.log(feature.geometry.coordinates)
//             // console.log(centroid)

//             // Setting the coordinates as an attribute
//             card.setAttribute('data-coordinates', JSON.stringify(feature.geometry.coordinates));
//             card.setAttribute('data-centroid', JSON.stringify(feature.geometry.centroid));

//             header.textContent = feature.properties.name; 
//             body.textContent = `${feature.properties['addr:street']} ${feature.properties['addr:housenumber']}, ${feature.properties['addr:city']} ${feature.properties['addr:postcode']}`;

//             // Initially hide the card
//             card.classList.add('hide');

//             buildingCardcontainer.append(card); 

//             //adding this line to store the centroid
//             // card.dataset.centroid = JSON.stringify(feature.geometry.coordinates);

//             return {name: feature.properties.name, address: body.textContent, element:card}; //just added centroid in attrib

//             // console.log(feature)
//             // console.log(geometry)
//     })
// })

// let selectedCard = null; // Keeps track of the currently selected card

// //listens for clicks on any card and reacts by interacting with the map
// map.init().then(() => {
// buildingCardcontainer.addEventListener('click', function(event) {
//     const card = event.target.closest('.card');
//     if (card) {
//         const coordinates = JSON.parse(card.getAttribute('data-coordinates'));
//         const centroid = JSON.parse(card.getAttribute('data-centroid')); // Make sure you have saved centroid here

//         console.log(centroid)

//         // If there's a previously selected card, remove the selected class
//         if (selectedCard && selectedCard !== card) {
//             selectedCard.classList.remove('selected');
//         }

//         // Toggle the selected class on the current card
//         card.classList.toggle('selected');
//         selectedCard = card.classList.contains('selected') ? card : null;
//         // console.log('card clicked')
//         console.log(coordinates)
//         // console.log(centroid)

//         if (map.buildings != null) {
//             map.selectBuilding(centroid);
//             console.log('Highlighted!')
//         }
//     }
//   });
// }).catch(error => console.error("Failed to initialize map:", error));

