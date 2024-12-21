// const dropdownButton = document.querySelectorAll(".dropdown-head");
// const dropdownContent = document.querySelector(".dropdown-container");

// dropdownButton.forEach((button) => {
//   button.addEventListener("click", () => {
//     button.nextElementSibling.classList.toggle("active");
//     const arrow = button.querySelector("img");
//     arrow.classList.toggle("rotate");
//   });
// });

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

//Hover on main page cards

const bookCards = document.querySelectorAll('.card');

bookCards.forEach((card) => {
  
  const bookInfoCard = card.querySelector('.title-share');
  const bookInfoHover = card.querySelector('.title-share-hover');

  

  card.addEventListener('mouseover', () => {
    bookInfoHover.style.display = "block";
  });

  card.addEventListener('mouseout', () => {
    bookInfoHover.style.display = "none";
  });
})