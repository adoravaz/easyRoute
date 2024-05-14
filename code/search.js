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

.catch(error => {
    // Handle any errors that occur during the fetch
    console.error('Error fetching the GeoJSON file:', error);
});
