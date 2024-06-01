import Map from './map';

const map = window.mainMap; // main map is accessible globally

document.addEventListener("DOMContentLoaded", () => {
  // event listeners for the buttons
  document.querySelector('.open-form-button').addEventListener('click', openForm);
  document.getElementById("report-form").addEventListener("submit", handleSubmit);
  // document.querySelector('.submit-btn').addEventListener('click', closeForm);
  document.querySelector('.cancel-btn').addEventListener('click', cancelForm);
  console.log('event listeners for form added');
});

// function for opening repair form
function openForm() {
  document.getElementById("open-form").style.display = "none";
  document.getElementById("report-show").innerHTML = '';
  document.getElementById("reportForm").style.display = "block";
  console.log('form opened');
}

function handleSubmit(event) {
  event.preventDefault();
  console.log("submit form clicked");

  const buildings = window.buildings; // buildings data is accessible globally

  const address = document.getElementById("repair-address").value.trim();
  const details = document.getElementById("repair-details").value;
  // display repair details
  const results = "Address:\r\n" + address + "\r\n" + "Details:\r\n" + details;
  document.getElementById("report-show").textContent = results;
  console.log("results displayed");
  console.log("address: " + address);
  console.log("details: " + details);

  if (address) {
    // console.log("buildings: " + JSON.stringify(buildings));
    const selectBuilding = buildings.find(b =>
      b.name.toLowerCase() === address.toLowerCase()
    );
    console.log("selectBuildings: " + JSON.stringify(selectBuilding));

    if (selectBuilding) {
      const {centroid} = selectBuilding;
      map.addIconAtLocation('/repair_icon.png', {
        longitude: centroid[0],
        latitude: centroid[1],
        elevation: centroid[2]
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
  console.log("form reset and closed");
}

// function for closing form after it's submitted
// function closeForm() {
//   console.log("submit form clicked");
  
//   const address = document.getElementById("repair-address").value.trim().toLowerCase();
//   const details = document.getElementById("repair-details").value;

//   if (address) {
//     const selectBuilding = buildings.find(b =>
//       b.name.toLowerCase() === address
//     );

//     if (selectBuilding) {
//       const {centroid} = selectBuilding;
//       map.addIconAtLocation('public/repair_icon.png', {
//         longitude: centroid[0],
//         latitude: centroid[1],
//         elevation: centroid[2]
//       });
//     } else {
//       alert('Building not found.');
//     }
//   } else {
//     alert('Please enter a building name or address.');
//   }

//   // display repair details
//   const results = "Address:\r\n" + address.value + "\r\n" + "Details:\r\n" + details.value;
//   document.getElementById("report-show").textContent = results;

//   document.getElementById("report-form").reset();
//   document.getElementById("reportForm").style.display = "none";
//   document.getElementById("open-form").style.display = "block";
// }


// function for closing form if it's canceled (i.e. not submitted)
function cancelForm() {
  document.getElementById("reportForm").style.display = "none";
  document.getElementById("open-form").style.display = "block";
  console.log("form canceled");
}
