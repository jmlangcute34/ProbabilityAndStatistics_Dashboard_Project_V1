var input = document.getElementById("nameInput");
var nameEl = document.getElementById("name");

input.addEventListener("input", function () {
  nameEl.textContent = input.value.trim() || "Brokkie";
});
