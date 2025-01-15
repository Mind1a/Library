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
  1: 4, // Chapter 2 starts at page 4
  2: 8, // Chapter 3 starts at page 8
  3: 12, // Chapter 4 starts at page 12
  4: 16, // Chapter 5 starts at page 16
  5: 22, // Chapter 5 starts at page 16
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
      li.textContent = `თავი ${i + 1} - ლორემ იპსუმ მოგვარიდა აღზრდილებისთვის`;

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

    // Dynamically calculate settings based on device type
    const isMobile = window.innerWidth <= 768;
    const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;

    const width = isMobile ? 300 : isTablet ? 600 : 700;
    const height = isMobile ? 500 : isTablet ? 800 : 1000;

    // Initialize PageFlip with responsive settings
    state.pageFlip = new St.PageFlip(state.bookContainer, {
      width,
      height,
      showCover: true,
      drawShadow: true,
      flippingTime: 2000,
      // პორტრეტი
      usePortrait: isMobile,
      size: "stretch",
      // Threshold values
      minWidth: isMobile ? 200 : 315,
      maxWidth: 1000,
      minHeight: isMobile ? 400 : 420,
      maxHeight: 1000,
      mobileScrollSupport: true,
      useMouseEvents: true,
      swipeDistance: 30,
      preventTouchEvents: false, // Allow touch events

      // Custom properties
      changeOrientation: isMobile ? 'portrait' : 'landscape',
      state: 'read',
    });

    const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
    await setupPages(pdf);
    setupNavigation();
    setupChapterMenu();
    hideLoader();

    // Add event listener for screen resize to reinitialize PageFlip
    window.addEventListener("resize", async () => {
      await initializeViewer(pdfUrl);
    }, { passive: true });
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
