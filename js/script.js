const dropdownButton = document.querySelectorAll(".dropdown-head");
const dropdownContent = document.querySelector(".dropdown-container");

dropdownButton.forEach((button) => {
  button.addEventListener("click", () => {
    button.nextElementSibling.classList.toggle("active");
    const arrow = button.querySelector("img");
    arrow.classList.toggle("rotate");
  });
});

const dateContainer = document.querySelectorAll(".date-input-container");

dateContainer.forEach((container) => {
  container.addEventListener("click", () => {
    const dateInput = container.querySelector("#date-input");

    dateInput.showPicker();

    const dateText = container.querySelector("#date-text");

    dateInput.addEventListener("change", () => {
      const date = dateInput.value;
      dateText.textContent = date;
    });
  });
});
