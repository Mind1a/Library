const dropdownButton = document.querySelectorAll(".dropdown-head");
const dropdownContent = document.querySelector(".dropdown-container");

dropdownButton.forEach((button) => {
  button.addEventListener("click", () => {
    button.nextElementSibling.classList.toggle("active");
    const arrow = button.querySelector("img");
    arrow.classList.toggle("rotate");
  });
});
