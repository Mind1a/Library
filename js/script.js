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

    const dateText = container.querySelector(".date-text");

    dateInput.addEventListener("change", () => {
      const date = dateInput.value;
      dateText.textContent = date;
    });
  });
});

//Hover on main page cards

const bookCards = document.querySelectorAll(".card");

bookCards.forEach((card) => {
  const bookInfoCard = card.querySelector(".title-share");
  const bookInfoHover = card.querySelector(".title-share-hover");

  card.addEventListener("mouseover", () => {
    bookInfoHover.style.height = "50px";
  });

  card.addEventListener("mouseout", () => {
    bookInfoHover.style.height = "0px";
  });
});

const dropdownBTN = document.querySelector(".dropdown-button");
const dropdownOptionsEl = document.querySelector(".dropdown-options");
const dropdownTextEl = document.querySelector(".dropdown-text");
const dropdownOptions = document.querySelectorAll(".option");

dropdownBTN.addEventListener("click", () => {
  dropdownOptionsEl.classList.toggle("displayed");
  dropdownBTN.classList.toggle("active-btn");

  if (dropdownBTN.classList.contains("active-btn")) {
    dropdownBTN
      .querySelector("img")
      .setAttribute("src", "./assets/white-arrow.svg");
  } else {
    dropdownBTN
      .querySelector("img")
      .setAttribute("src", "./assets/blue-dropdown-icon.svg");
  }
});

dropdownOptions.forEach((option) => {
  option.addEventListener("click", (option) => {
    const selectedOption = option.target.textContent;
    //----
    const value = option.target.getAttribute("data-value");
    formObject.sortedBy = value;
    //----
    dropdownTextEl.textContent = selectedOption;
    dropdownOptionsEl.classList.remove("displayed");
    dropdownBTN.classList.remove("active-btn");
    dropdownBTN
      .querySelector("img")
      .setAttribute("src", "./assets/blue-dropdown-icon.svg");
    // dropdownTextEl.style.fontSize = "18px";
  });
});

// form events
const form = document.getElementById("main-form");
var formObject = {
  searchQuery: "",
  sortedBy: "",
  mediaType: [],
  dateFrom: "",
  dateTo: "",

  genre: [],
  language: [],
  fund: [],
};

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(form);

  data.forEach((value, key) => {
    const arrayTypes = ["mediaType", "genre", "language", "fund"];
    if (arrayTypes.includes(key)) {
      formObject[key].push(value);
    } else {
      formObject[key] = value;
    }
  });

  console.log(formObject);
});

const resetBtn = document.querySelector(".resetBTN");
resetBtn.addEventListener("click", () => {
  formObject = {
    searchQuery: "",
    sortedBy: "",
    mediaType: [],
    dateFrom: "",
    dateTo: "",

    genre: [],
    language: [],
    fund: [],
  };

  document.querySelectorAll(".date-text")[0].textContent = "-დან";
  document.querySelectorAll(".date-text")[1].textContent = "-მდე";
  document.querySelector(".dropdown-text").textContent = "სორტირება";
});
