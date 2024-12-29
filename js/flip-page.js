if (typeof pdfjsLib !== "undefined") {
    const pdfUrl = "../assets/flip-page/განდეგილი 1957.pdf";

    async function load() {
        const bookContainer = document.getElementById("pdf-container");
        const loader = document.getElementById("loader")
        // page-flip library
        loader.style.display = "block"
        const pageFlip = new St.PageFlip(bookContainer, {
            width: 700,
            height: 1000, 
            showCover: true,
            drawShadow: true,
            flippingTime: 2000,
        });

        try {
            const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
            const numPages = pdf.numPages; 
            const totalPage = document.getElementById("total-pages")
            totalPage.innerText = numPages;

            // დინამიურად შეიქმნა წიგნის გვერდები
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

                // pdf ფორმატი svg-ში
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

            // წიგნის გვერდების გადაფურცვლა და გვერდების სისწორე ასევე გადასვლის ფუნციონალი
            // გასაფიხსია prev და next 
            pageFlip.on("flip", (e) => {
                const nextPage = document.getElementById("next")
                const prevPage = document.getElementById("prev")

                const currentPage = e.data;
                const current = document.getElementById("current-page")
                nextPage.addEventListener("click", () => {
                    pageFlip.flip(currentPage + 2)
                    current.innerText = currentPage + 2
                })
                prevPage.addEventListener("click", () => {
                    pageFlip.flip(currentPage - 2)
                    current.innerText = currentPage - 2
                })
                current.innerText = currentPage;
                localStorage.setItem("currentPage", currentPage);
                console.log(`Current page saved: ${currentPage}`);
            });

            const menu = document.getElementById("menu");
            
            // ფუნცცია სადაც დინამიურად შეიქმნება menu bar
            async function createUl() {
                const ul = document.createElement("ul"); 
                ul.style.display = "none"; 
                ul.classList.add("menu-ul");
        
                let pageNumber = 5; //აქ ჩაიწერება სათაურების რაოდენობა
                for (let chapter = 1; chapter <= pageNumber; chapter++) {
                    const li = document.createElement("li");
                    li.classList.add("menu-li");
                    li.innerText = `${chapter} თავი`;
                    li.style.cursor = "pointer"
        
                    li.addEventListener("click", () => changeChapter(li, 3))
                    ul.appendChild(li);
                }
        
                return ul;
            }
        
            async function changeChapter(chapter, index){
                const chapterTitle = document.getElementById("main-chapter")
                chapterTitle.innerText = chapter.innerText
                // ინდექსის ადგილას ჩაიწერება თავის საწყისი გვერდი
                pageFlip.flip(index * 4)
            }
            async function toggleMenu() {
                let ul = document.querySelector(".menu-ul");
                if (!ul) {
                    ul = await createUl();
                    menu.parentElement.appendChild(ul);
                }
                ul.style.display = ul.style.display === "none" ? "block" : "none";
            }
        
            menu.addEventListener("click", toggleMenu);

            loader.style.display = "none"
            bookContainer.style.visibility = "visible";
        } catch (error) {
            console.error("Error loading PDF:", error);
            loader.style.display = "none"
        }
    }

    load();
} else {
    console.error("PDF.js is not available");
}