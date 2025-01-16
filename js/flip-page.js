// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js";

const state = {
  bookContainer: null,
  loader: null,
  main: null,
  currentPageElement: null,
  totalPagesElement: null,
  pageFlip: null,
  currentPage: 0,
  isAnimating: false,
};

const chapterToPageMap = {
  0: 0, // Chapter 1 starts at page 0
  1: 3, // Chapter 2 starts at page 3
  2: 3, // Chapter 3 starts at page 8
  3: 4, // Chapter 4 starts at page 12
  4: 5,
  5: 5,
  6: 6,
  7: 7,
  8: 7,
  // 9: 8,
  // 10: 9,
  // 11: 9,
  // 12: 10,
  // 13: 10,
  // 14: 11,
  // 15: 12,
  // 16: 12,
  // 17: 13,
  // 18: 14,
  // 19: 14,
  // 20: 15,
  // 21: 16,
  // 22: 16,
  // 23: 17,
  // 24: 17,
  // 25: 18,
  // 26: 18,
  // 27: 19,
  // 28: 20,
};

// Initialize DOM elements
function initializeElements() {
  state.bookContainer = document.getElementById("pdf-container");
  state.loader = document.getElementById("loader");
  state.main = document.getElementById("main");
  state.currentPageElement = document.getElementById("current-page");
  state.totalPagesElement = document.getElementById("total-pages");
  state.mainHeader = document.getElementById("main-header");
  state.flipHeader = document.getElementById("flip-page-header");
}

// Optimized page creation with proper cleanup
async function createPage(pdf, pageNum) {
  const page = await pdf.getPage(pageNum);
  const scale = 2;
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { alpha: false }); // Optimize canvas
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const pageContainer = document.createElement("div");
  pageContainer.className = "my-page";
  Object.assign(pageContainer.style, {
    position: "relative",
    width: `${viewport.width}px`,
    height: `${viewport.height}px`,
    background: "#fff",
    overflow: "hidden",
    willChange: "transform", // Optimize animations
  });

  await page.render({
    canvasContext: context,
    viewport: viewport,
    intent: "display", // Optimize rendering
  }).promise;

  const img = new Image();
  img.decoding = "async"; // Optimize image loading
  img.loading = "eager";

  return new Promise((resolve) => {
    img.onload = () => {
      img.style.width = "100%";
      img.style.height = "100%";
      pageContainer.appendChild(img);
      canvas.remove();
      resolve(pageContainer);
    };
    img.src = canvas.toDataURL("image/png");
  });
}

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

// Setup navigation with passive event listeners
function setupNavigation() {
  const nextBtn = document.getElementById("next");
  const prevBtn = document.getElementById("prev");

  // Handle "Next" button click
  const handleNext = () => {
    if (state.currentPage < state.pageFlip.getPageCount() - 1) {
      state.currentPage += 1; // Update current page immediately
      updatePageCountUI(); // Synchronize UI with the current page
      state.pageFlip.flip(state.currentPage); // Flip the page
    }
  };

  // Handle "Prev" button click
  const handlePrev = () => {
    if (state.currentPage > 0) {
      state.currentPage -= 1; // Update current page immediately
      updatePageCountUI(); // Synchronize UI with the current page
      state.pageFlip.flip(state.currentPage); // Flip the page
    }
  };

  // Update UI to reflect the current page count
  const updatePageCountUI = () => {
    state.currentPageElement.innerText = state.currentPage + 1; // Display as 1-based index
  };

  // Add event listeners for the buttons
  nextBtn.addEventListener("click", handleNext, { passive: true });
  prevBtn.addEventListener("click", handlePrev, { passive: true });

  // Listen for manual page flips and synchronize the page count
  state.pageFlip.on("flip", (event) => {
    state.currentPage = event.data; // Update current page based on the event
    updatePageCountUI(); // Synchronize UI with the current page
  });
}

// Setup chapter menu with passive event listeners
function setupChapterMenu() {
  const menu = document.getElementById("menu");
  let menuList = null;

  function createChapterList() {
    const ul = document.createElement("ul");
    ul.className = "menu-ul";
    ul.style.display = "none";

    const chapters = Object.keys(chapterToPageMap).length; // Total number of chapters
    Array.from({ length: chapters }, (_, i) => {
      const li = document.createElement("li");
      li.className = "menu-li";

      if (i === 0) {
        li.textContent = "განდეგილი - დასაწყისი";
      } else {
        li.textContent = `თავი ${i}`;
      }

      // Add click and touch event listeners for chapter selection
      li.addEventListener("click", () => changeChapter(li, i, ul), {
        passive: true,
      });
      li.addEventListener("touchstart", () => changeChapter(li, i, ul), {
        passive: true,
      });

      ul.appendChild(li);
    });

    return ul;
  }

  menu.addEventListener(
    "click",
    () => {
      if (!menuList) {
        menuList = createChapterList();
        menu.parentElement.appendChild(menuList);
      }
      menuList.style.display =
        menuList.style.display === "none" ? "block" : "none";
    },
    { passive: true }
  );

  menu.addEventListener(
    "touchstart",
    () => {
      if (!menuList) {
        menuList = createChapterList();
        menu.parentElement.appendChild(menuList);
      }
      menuList.style.display =
        menuList.style.display === "none" ? "block" : "none";
    },
    { passive: true }
  );
}

async function changeChapter(chapter, index, ul) {
  const chapterTitle = document.getElementById("main-chapter");
  chapterTitle.textContent = chapter.textContent;

  const active = ul.querySelector(".menu-li.hover");
  if (active && active !== chapter) {
    active.classList.remove("hover");
  }
  chapter.classList.toggle("hover");

  ul.style.display = "none";

  if (!state.isAnimating) {
    const targetPage = chapterToPageMap[index];
    if (targetPage !== undefined) {
      state.currentPage = targetPage; // Update current page
      state.currentPageElement.innerText = state.currentPage + 1; // Display as 1-based index
      state.pageFlip.flip(state.currentPage, true); // Flip instantly to the page
    } else {
      console.error("Chapter-to-page mapping is missing for chapter:", index);
    }
  }
}

function showLoader() {
  state.loader.style.display = "flex";
  state.main.style.display = "none";
  state.flipHeader.style.display = "none";
}

function hideLoader() {
  state.loader.style.display = "none";
  state.main.style.display = "block";
  state.mainHeader.style.display = "none";
  state.flipHeader.style.display = "flex";
  state.bookContainer.style.visibility = "visible";
}

// function showMainHeader(){
//   state.flipHeader.style.display = "none";
//   state.mainHeader.style.display = "flex";
// }
// function hideMainHeader(){
//   state.flipHeader.style.display = "flex";
//   state.mainHeader.style.display = "none";
// }

// Main initialization function with performance optimizations
async function initializeViewer(pdfUrl) {
  try {
    initializeElements();
    showLoader();

    // Initialize PageFlip with optimized settings
    state.pageFlip = new St.PageFlip(state.bookContainer, {
      width: 700,
      height: 1000,
      showCover: true,
      drawShadow: true,
      flippingTime: 2000,
      usePortrait: false,
      startZIndex: 0,
      minWidth: 300,
      maxWidth: 1000,
      useMouseEvents: true,
      swipeDistance: 30,
      preventTouchEvents: false, // Allow touch events
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
