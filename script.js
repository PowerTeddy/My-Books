const library = [
    {
        "Title":"In our midsts among us",
        "pdf":"https://drive.google.com/file/d/1vpRIGFQjg1m2Uj-Ho2mEljtfFoBBKhof/view?usp=sharing",
        "description":"Captain Stewart is sent to investigate a dead corpse at a school.\nWhat will he find?\nWhat will happen?\nFind out in this thriller short-story"
    },
    {
        "Title":"The 87",
        "pdf":"https://drive.google.com/file/d/1r0OniyJ-CxtkiXkvwux7TPmnjRiBlLzU/view?usp=sharing",
        "description":"Samantha is stuck in the past with the incident that happened long ago. \"The 87\", that's what the journals called it. An incident with a mysterious bald man. His biggest act. And the horrific magic behind him."
    }
]

var pdfjsLib = window['pdfjs-dist/build/pdf'];

pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';

function openbook(number) {
    const book = library[number - 1]
    const url = "/in-our-midst-among-us.pdf"

    document.getElementById("Title").innerHTML = book.Title
    document.getElementById("pagetitle").innerHTML = book.Title
    
    document.getElementById("main").innerHTML = `
    <button onclick="location.reload()" class="back">Back</button>
    <div>
        <canvas id="book-canvas"></canvas>
        <div class="bottom-bar">
            <button class="arrow" id="prev-page">
                <i class="fas fa-arrow-left"></i>
            </button>
            <input id="page-show"></input>
            <button class="arrow" id="next-page">
                <i class="fas fa-arrow-right"></i>
            </button>
        </div>
    </div>`

    var pdfDoc = null,
        pageNumber = 1,
        pageIsRendering = false,
        pageNumIsPending = null;

    const scale = 1.5,
        canvas = document.querySelector('#book-canvas'),
        ctx = canvas.getContext('2d');

    const renderPage = num => {
        pageIsRendering = true;

        // Get page
        pdfDoc.getPage(num).then(page => {
            // Set scale

            var officialScale = canvas.width / page.getViewport(1.0).width
            if (officialScale > 1.5) {
                officialScale = 1.5
            }

            const viewport = page.getViewport({ scale });
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderCtx = {
                canvasContext: ctx,
                viewport
            };

            page.render(renderCtx).promise.then(() => {
                pageIsRendering = false;

                if (pageNumIsPending !== null) {
                    renderPage(pageNumIsPending);
                    pageNumIsPending = null;
                }
            });

            //output current page
            document.getElementById('page-show').value = num; 
        });
    };

    pdfjsLib
        .getDocument(url)
        .promise.then(pdfDoc_ => {
            pdfDoc = pdfDoc_;

            renderPage(pageNumber);
        })
        .catch(err => {
            console.log(err)
            // Remove bottom bar
            document.querySelector('.bottom-bar').style.display = 'none';
        });

    const queueRenderPage = num => {
        if (pageIsRendering) {
            pageNumIsPending = num;
        } else {
            renderPage(num);
        }
    };

    const showPrevPage = () => {
        if (pageNumber <= 1) {
            return;
        }
        pageNumber--;
        queueRenderPage(pageNumber);
    };

    // Show Next Page
    const showNextPage = () => {
        if (pageNumber >= pdfDoc.numPages) {
            return;
        }
        pageNumber++;
        queueRenderPage(pageNumber);
    };

    document.getElementById("prev-page").addEventListener("click", showPrevPage)
    document.getElementById("next-page").addEventListener("click", showNextPage)
    document.getElementById("page-show").addEventListener("keyup", function (e) {
        if (e.key === 'Enter' || e.keyCode === 13) {
            if (parseInt(document.getElementById("page-show").value) > pdfDoc.numPages) {
                pageNumber = pdfDoc.numPages;
            } else if (parseInt(document.getElementById("page-show").value) <= 1) {
                pageNumber = 1
            } else {
                pageNumber = parseInt(document.getElementById("page-show").value);
            }
            
            queueRenderPage(pageNumber);
        }
    });
}