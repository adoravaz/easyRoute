const buildingCardtemplate = document.querySelector("[data-building-template]");
const buildingCardcontainer = document.querySelector("[data-building-cards-container]");
const searchInput = document.querySelector("[data-search]");

let buildings = []; 

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

            // Setting the coordinates as an attribute
            card.setAttribute('data-coordinates', JSON.stringify(feature.geometry.coordinates));

            header.textContent = feature.properties.name; 
            body.textContent = `${feature.properties['addr:street']} ${feature.properties['addr:housenumber']}, ${feature.properties['addr:city']} ${feature.properties['addr:postcode']}`;

            // Initially hide the card
            card.classList.add('hide');

            buildingCardcontainer.append(card);

            return {name: feature.properties.name, address: body.textContent, element:card };

            // console.log(feature)
            // console.log(geometry)
    })
})

let selectedCard = null; // Keeps track of the currently selected card

//listens for clicks on any card and reacts by interacting with the map
buildingCardcontainer.addEventListener('click', function(event) {
    const card = event.target.closest('.card');
    if (card) {
        const coordinates = JSON.parse(card.getAttribute('data-coordinates'));

        // If there's a previously selected card, remove the selected class
        if (selectedCard && selectedCard !== card) {
            selectedCard.classList.remove('selected');
        }

        // Toggle the selected class on the current card
        card.classList.toggle('selected');
        selectedCard = card.classList.contains('selected') ? card : null;
        console.log('card clicked')

        // Call the method on the mainMap global object
        // if (window.mainMap) {
        //     window.mainMap.selectBuildingByCoordinates(coordinates);
        // }

        // console.log(coordinates)
        // Logic to highlight the building on the map
        // selectBuildingOnMap(coordinates);
    }
});

// function selectBuildingOnMap(coordinates) {
//     // Implement this function to match a building in the Three.js scene with these coordinates and change its appearance
//     // You would need access to your Three.js scene objects here to find and modify the relevant building
// }


