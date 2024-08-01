const anotationBtn = document.getElementById("anotation");
const searchBtn = document.getElementById("search");
const featureBtn = document.getElementById("feature");
const anotationSection = document.querySelector(".anotation-section");
const featureSection = document.querySelector(".feature-section");
const searchingSection = document.querySelector(".searching-section");

anotationBtn.addEventListener("click", () => openBookInfo("anotation"));
featureBtn.addEventListener("click", () => openBookInfo("feature"));
searchBtn.addEventListener("click", () => openBookInfo("search"));

function openBookInfo(section) {
  [anotationSection, featureSection, searchingSection].forEach((sec) => {
    if (sec.classList.contains("open")) {
      sec.classList.remove("open");
      sec.style.maxHeight = "0";
      sec.style.opacity = "0";
    }
  });

  if (section === "anotation") {
    anotationSection.classList.add("open");
    anotationSection.style.maxHeight = anotationSection.scrollHeight + "px";
    anotationSection.style.opacity = "1";
  } else if (section === "feature") {
    featureSection.classList.add("open");
    featureSection.style.maxHeight = featureSection.scrollHeight + "px";
    featureSection.style.opacity = "1";
  } else if (section === "search") {
    searchingSection.classList.add("open");
    searchingSection.style.maxHeight = searchingSection.scrollHeight + "px";
    searchingSection.style.opacity = "1";
  }
}
