document.querySelector('.open-form-button').addEventListener('click', openForm);
document.querySelector('.submit-btn').addEventListener('click', closeForm);
document.querySelector('.cancel-btn').addEventListener('click', cancelForm);
function openForm() {
  document.getElementById("open-form").style.display = "none";
  document.getElementById("report-show").innerHTML = '';

  document.getElementById("reportForm").style.display = "block";
}

function closeForm() {
  const address = document.getElementById("repair-address");
  const details = document.getElementById("repair-details");
  const results = "Address:\r\n" + address.value + "\r\n" + "Details:\r\n" + details.value;
  document.getElementById("report-show").textContent = results;

  document.getElementById("report-form").reset();
  document.getElementById("reportForm").style.display = "none";
  document.getElementById("open-form").style.display = "block";
}

function cancelForm() {
  document.getElementById("reportForm").style.display = "none";
  document.getElementById("open-form").style.display = "block";
}
