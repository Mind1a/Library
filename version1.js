class BookViewer {
  constructor() {
    this.bookContainer = document.getElementById("pdf-container");
    this.loader = document.getElementById("loader");
    this.main = document.getElementById("main");
    this.currentPageElement = document.getElementById("current-page");
    this.totalPagesElement = document.getElementById("total-pages");
    this.pageFlip = null;
    this.currentPage = 0;
  }

  async initialize(pdfUrl) {
    try {
      this.showLoader();
      this.pageFlip = new St.PageFlip(this.bookContainer, {
        width: 700,
        height: 1000,
        showCover: true,
        drawShadow: true,
        flippingTime: 2000,
      });

      const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
      await this.setupPages(pdf);
      this.setupNavigation();
      this.setupChapterMenu();
      this.hideLoader();
    } catch (error) {
      console.error("Error initializing book viewer:", error);
      this.hideLoader();
    }
  }

  async setupPages(pdf) {
    const numPages = pdf.numPages;
    this.totalPagesElement.innerText = numPages;

    const pages = await Promise.all(
      Array.from({ length: numPages }, (_, i) => this.createPage(pdf, i + 1))
    );

    pages.forEach((page) => this.bookContainer.appendChild(page));
    this.pageFlip.loadFromHTML(document.querySelectorAll(".my-page"));
    this.pageFlip.flip(this.currentPage);
  }

  async createPage(pdf, pageNum) {
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

  setupNavigation() {
    const nextBtn = document.getElementById("next");
    const prevBtn = document.getElementById("prev");

    nextBtn.addEventListener("click", () =>
      this.pageFlip.flip(this.currentPage + 1)
    );
    prevBtn.addEventListener("click", () =>
      this.pageFlip.flip(this.currentPage - 1)
    );

    this.pageFlip.on("flip", (e) => {
      this.currentPage = e.data;
      this.currentPageElement.innerText = this.currentPage;
    });
  }

  setupChapterMenu() {
    const menu = document.getElementById("menu");
    let menuList = null;

    const createChapterList = () => {
      const ul = document.createElement("ul");
      ul.className = "menu-ul";
      ul.style.display = "none";

      const chapters = 5;
      Array.from({ length: chapters }, (_, i) => {
        const li = document.createElement("li");
        li.className = "menu-li";
        li.textContent = `${i + 1} თავი`;
        li.addEventListener("click", () => this.changeChapter(li, i, ul));
        ul.appendChild(li);
      });

      return ul;
    };

    menu.addEventListener("click", () => {
      if (!menuList) {
        menuList = createChapterList();
        menu.parentElement.appendChild(menuList);
      }
      menuList.style.display =
        menuList.style.display === "none" ? "block" : "none";
    });
  }

  async changeChapter(chapter, index, ul) {
    const chapterTitle = document.getElementById("main-chapter");
    chapterTitle.textContent = chapter.textContent;

    const active = ul.querySelector(".menu-li.hover");
    if (active && active !== chapter) {
      active.classList.remove("hover");
    }
    chapter.classList.toggle("hover");

    await new Promise((resolve) => setTimeout(resolve, 300));
    ul.style.display = "none";
    this.pageFlip.flip(index * 4);
  }

  showLoader() {
    this.loader.style.display = "flex";
    this.main.style.display = "none";
  }

  hideLoader() {
    this.loader.style.display = "none";
    this.main.style.display = "block";
    this.bookContainer.style.visibility = "visible";
  }
}

// Initialize the viewer
if (typeof pdfjsLib !== "undefined") {
  const viewer = new BookViewer();
  viewer.initialize("../assets/flip-page/განდეგილი 1957.pdf");
} else {
  console.error("PDF.js is not available");
}
