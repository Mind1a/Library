// Global state object
const state = {
  bookContainer: null,
  loader: null,
  main: null,
  currentPageElement: null,
  totalPagesElement: null,
  pageFlip: null,
  currentPage: 0,
};

// Initialize DOM elements
function initializeElements() {
  state.bookContainer = document.getElementById("pdf-container");
  state.loader = document.getElementById("loader");
  state.main = document.getElementById("main");
  state.currentPageElement = document.getElementById("current-page");
  state.totalPagesElement = document.getElementById("total-pages");
}

// Create a single page
async function createPage(pdf, pageNum) {
  const page = await pdf.getPage(pageNum);
  const scale = 2;
  const viewport = page.getViewport({ scale });

  // Create a canvas
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  // Create page container
  const pageContainer = document.createElement("div");
  pageContainer.className = "my-page";
  Object.assign(pageContainer.style, {
    position: "relative",
    width: `${viewport.width}px`,
    height: `${viewport.height}px`,
    background: "#fff",
    overflow: "hidden",
  });

  // Render PDF page to canvas
  await page.render({
    canvasContext: context,
    viewport: viewport,
  }).promise;

  // Convert canvas to image
  const img = new Image();
  img.src = canvas.toDataURL("image/png");
  img.style.width = "100%";
  img.style.height = "100%";

  pageContainer.appendChild(img);

  // Clean up
  canvas.remove();

  return pageContainer;
}

// Setup all pages
async function setupPages(pdf) {
  const numPages = pdf.numPages;
  state.totalPagesElement.innerText = numPages;

  const pages = await Promise.all(
    Array.from({ length: numPages }, (_, i) => createPage(pdf, i + 1))
  );

  pages.forEach((page) => state.bookContainer.appendChild(page));
  state.pageFlip.loadFromHTML(document.querySelectorAll(".my-page"));
  state.pageFlip.flip(state.currentPage);
}

// Setup navigation
function setupNavigation() {
  const nextBtn = document.getElementById("next");
  const prevBtn = document.getElementById("prev");

  nextBtn.addEventListener("click", () =>
    state.pageFlip.flip(state.currentPage + 1)
  );
  prevBtn.addEventListener("click", () =>
    state.pageFlip.flip(state.currentPage - 1)
  );

  state.pageFlip.on("flip", (e) => {
    state.currentPage = e.data;
    state.currentPageElement.innerText = state.currentPage;
  });
}

// Setup chapter menu
function setupChapterMenu() {
  const menu = document.getElementById("menu");
  let menuList = null;

  function createChapterList() {
    const ul = document.createElement("ul");
    ul.className = "menu-ul";
    ul.style.display = "none";

    const chapters = 5;
    Array.from({ length: chapters }, (_, i) => {
      const li = document.createElement("li");
      li.className = "menu-li";
      li.textContent = `${i + 1} თავი`;
      li.addEventListener("click", () => changeChapter(li, i, ul));
      ul.appendChild(li);
    });

    return ul;
  }

  menu.addEventListener("click", () => {
    if (!menuList) {
      menuList = createChapterList();
      menu.parentElement.appendChild(menuList);
    }
    menuList.style.display =
      menuList.style.display === "none" ? "block" : "none";
  });
}

// Change chapter
async function changeChapter(chapter, index, ul) {
  const chapterTitle = document.getElementById("main-chapter");
  chapterTitle.textContent = chapter.textContent;

  const active = ul.querySelector(".menu-li.hover");
  if (active && active !== chapter) {
    active.classList.remove("hover");
  }
  chapter.classList.toggle("hover");

  await new Promise((resolve) => setTimeout(resolve, 300));
  ul.style.display = "none";
  state.pageFlip.flip(index * 4);
}

// Show/Hide loader
function showLoader() {
  state.loader.style.display = "flex";
  state.main.style.display = "none";
}

function hideLoader() {
  state.loader.style.display = "none";
  state.main.style.display = "block";
  state.bookContainer.style.visibility = "visible";
}

// Main initialization function
async function initializeViewer(pdfUrl) {
  try {
    initializeElements();
    showLoader();

    state.pageFlip = new St.PageFlip(state.bookContainer, {
      width: 700,
      height: 1000,
      showCover: true,
      drawShadow: true,
      flippingTime: 2000,
    });

    const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
    await setupPages(pdf);
    setupNavigation();
    setupChapterMenu();
    hideLoader();
  } catch (error) {
    console.error("Error initializing book viewer:", error);
    hideLoader();
  }
}

// Initialize when PDF.js is available
if (typeof pdfjsLib !== "undefined") {
  initializeViewer("../assets/flip-page/განდეგილი 1957.pdf");
} else {
  console.error("PDF.js is not available");
}
