const map = window.mainMap; // main map is accessible globally

const buildingCardtemplate = document.querySelector("[repair-data-building-template]");
const buildingCardContainer = document.querySelector("[repair-data-building-cards-container]");
const addressSearchInput = document.querySelector("#repair-address");

let startPoint = null;

// initialize and define buildings array (with building heights)
let buildings = [];
async function loadBuildings() {
  try {
    const res = await fetch('/UCSC_Buildings_V3.geojson');
    console.log('loaded buildings')
    const data = await res.json();
    buildings = data.features.map(feature => {
      const card = buildingCardtemplate.content.cloneNode(true).children[0];
      const header = card.querySelector("[repair-data-header]");
      const body = card.querySelector("[repair-data-body]");
      const centroid = feature.geometry.centroid;
      header.textContent = feature.properties.name;
      body.textContent = `${feature.properties['addr:street']} ${feature.properties['addr:housenumber']}, ${feature.properties['addr:city']} ${feature.properties['addr:postcode']}`;
      card.classList.add('hide');
      buildingCardContainer.append(card);
      return { name: feature.properties.name, element: card, levels: (feature.properties['building:levels']) ? feature.properties['building:levels'] : 1, centroid: centroid};
    });
    // console.log("buildings from loadBuildingd: " + JSON.stringify(buildings));
  } catch (error) {
    console.log("Failed to load buildings: ", error);
  }
}

// from search.js
function searchBuildings(input) {
  input.addEventListener("input", e => {
      const value = e.target.value.toLowerCase();
          if (value === "") {
              buildings.forEach(building => {
              building.element.classList.add("hide");
           });
         }else{
              buildings.forEach(building => {
              const isVisible = building.name?.toLowerCase().includes(value) || building.address?.toLowerCase().includes(value);
              building.element.classList.toggle("hide", !isVisible);
          });
      }
  });
}

buildingCardContainer.addEventListener('click', event => {
  const card = event.target.closest('.repair-card');
  if (card) {
    const selectedBuilding = buildings.find(b => b.name === card.querySelector("[repair-data-header]").textContent);
      buildings.forEach(building => { // Hide all cards initially
        building.element.classList.add('hide');
    });
    if (startPoint !== selectedBuilding) {
      if (startPoint) {
        startPoint.element.classList.remove('selected', 'visible');
        startPoint.element.classList.add('hide'); // Hide previous start point card
      }
      startPoint = selectedBuilding;
      startPoint.element.classList.add('selected', 'visible'); // Make only the selected card visible
      addressSearchInput.value = selectedBuilding.name; // Autofill the start search input
    }
    if (startPoint) {
      startPoint.element.classList.remove('hide');
      buildingCardContainer.prepend(startPoint.element); // Ensures start point card is always at the top
    }
  }
});

function resetSearchState() {
  startPoint = null;
  document.getElementById('repair-address').value = ''; // clear search inputs here

  // hide all cards
  const cards = document.querySelectorAll('.repair-building-cards .repair-card');
  cards.forEach(card => {
      // card.style.display = 'none'; // Hide each card
      card.classList.add('hide'); // Add 'hide' class that sets display to none
  });

  // hide selected cards
  const selectedCards = document.querySelectorAll('.repair-building-cards .repair-card.selected');
  selectedCards.forEach(card => {
    card.classList.remove('selected', 'visible'); // Remove 'selected' and 'visible' classes
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  // Disable the submit button initially
  const submitButton = document.querySelector('#report-form .submit-btn');
  submitButton.disabled = true;

  // call loadBuildings to populate the buildings array
  await loadBuildings();
  searchBuildings(addressSearchInput);

  // Enable the submit button after buildings are loaded
  submitButton.disabled = false;

  // event listeners for the buttons
  document.querySelector('.open-form-button').addEventListener('click', openForm);
  document.getElementById("report-form").addEventListener("submit", handleSubmit);
  // document.querySelector('.submit-btn').addEventListener('click', closeForm);
  document.querySelector('.cancel-btn').addEventListener('click', cancelForm);
  console.log('event listeners for form added');
});

// function for opening repair form
function openForm() {
  console.log("openForm called");
  document.getElementById("open-form").style.display = "none";
  // document.getElementById("report-show").innerHTML = '';
  // document.getElementById("report-show").style.display = "block";
  document.getElementById("reportForm").style.display = "block";
  console.log('form opened');
}

async function handleSubmit(event) {
  event.preventDefault();
  console.log("submit form clicked");

  // const buildings = window.buildings; // buildings data is accessible globally

  const address = document.getElementById("repair-address").value.trim();
  const details = document.getElementById("repair-details").value;
  // display repair details
  const results = "Address:\r\n" + address + "\r\n" + "Details:\r\n" + details;
  // document.getElementById("report-show").textContent = results;
  console.log("results displayed");
  console.log("address: " + address);
  console.log("details: " + details);

  if (address) {
    // console.log("buildings: " + JSON.stringify(buildings));
    const selectBuilding = buildings.find(b => {
      if (b.name && address) {
        return b.name.toLowerCase() === address.toLowerCase();
      }
      return false
    });
    console.log("selectBuildings: " + JSON.stringify(selectBuilding));

    if (selectBuilding) {
      const {centroid} = selectBuilding;
      const {levels} = selectBuilding;
      map.addIconAtLocation('/repair_icon.png', {
        longitude: centroid[0],
        latitude: centroid[1],
        elevation: centroid[2],
        levels: levels
      });
    } else {
      alert('Building not found.');
      console.log("building not found");
    }
  } else {
    alert('Please enter a building name or address.');
    console.log("Please enter a building name or address.");
  }  

  event.target.reset();
  document.getElementById("reportForm").style.display = "none";
  document.getElementById("open-form").style.display = "block";
  // document.getElementById("report-show").style.display = "block";
  resetSearchState();
  console.log("form reset and closed");
}

// function for closing form if it's canceled (i.e. not submitted)
function cancelForm() {
  document.getElementById("report-form").reset();
  document.getElementById("reportForm").style.display = "none";
  // document.getElementById("report-show").style.display = "none";
  document.getElementById("open-form").style.display = "block";
  resetSearchState();
  console.log("form canceled");
}
