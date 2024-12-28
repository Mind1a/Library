if (typeof pdfjsLib !== "undefined") {
    const pdfUrl = "../assets/flip-page/განდეგილი 1957.pdf";

    async function load() {
        const bookContainer = document.getElementById("pdf-container");
        const loader = document.getElementById("loader")

        loader.style.display = "block"
        const pageFlip = new St.PageFlip(bookContainer, {
            width: 700, // Adjusted width for better view
            height: 1000, // Adjusted height for better view
            showCover: true,
            drawShadow: true,
            flippingTime: 2000,
        });

        try {
            const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
            const numPages = pdf.numPages; 
            let totalPages = numPages;

            for (let pageNum = 1; pageNum <= numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);

                
                const scale = 2;
                const viewport = page.getViewport({ scale });

                const svgContainer = document.createElement("div");
                svgContainer.classList.add("my-page");
                svgContainer.style.position = "relative";
                svgContainer.style.width = `${viewport.width}px`;
                svgContainer.style.height = `${viewport.height}px`;
                svgContainer.style.background = "#fff";
                svgContainer.style.overflow = "hidden";

                // Render the PDF page to SVG
                const svg = await page.getOperatorList().then((opList) => {
                    const svgBuilder = new pdfjsLib.SVGGraphics(page.commonObjs, page.objs);
                    return svgBuilder.getSVG(opList, viewport);
                });

                svg.style.position = "absolute";
                svg.style.top = "0";
                svg.style.left = "0";
                svgContainer.appendChild(svg);

                bookContainer.appendChild(svgContainer);
            }

            pageFlip.loadFromHTML(document.querySelectorAll(".my-page"));


            const savedPage = parseInt(localStorage.getItem("currentPage")) || 0;
            pageFlip.flip(savedPage);

            pageFlip.on("flip", (e) => {
                const currentPage = e.data;
                localStorage.setItem("currentPage", currentPage);
                console.log(`Current page saved: ${currentPage}`);
            });





            const goToPageBtn = document.getElementById("go-to-page");
            const pageNumberInput = document.getElementById("page-number");

            goToPageBtn.addEventListener("click", () => {
                const pageNumber = parseInt(pageNumberInput.value);
                console.log(pageNumber);
                if (pageNumber >= 1 && pageNumber <= totalPages) {
                    pageFlip.flip(pageNumber);
                }
            });

            loader.style.display = "none"
            bookContainer.style.visibility = "visible";
            pageNumberInput.style.visibility = "visible";
            goToPageBtn.style.visibility = "visible";
        } catch (error) {
            console.error("Error loading PDF:", error);
            loader.style.display = "none"
        }
    }

    const menu = document.getElementById("menu")
    const menuListContainer = document.getElementById("menu-list-container")
    menu.addEventListener("click", (e)=> {
        e.preventDefault();
        const ul = document.createElement("ul");

        for(let i=0; i<3; i++){
           const li = document.createElement("li")
           li.textContent = `chepter ${i + 1}`;
           ul.appendChild(li) 
        }
        menuListContainer.appendChild(ul)
    })

    load();
} else {
    console.error("PDF.js is not available");
}
