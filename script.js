/*fetch("http://api.giphy.com/v1/gifs/search?api_key=y75ufo1GAk6BPtV5TPggZMw5b0HNeFtQ&q=todd%20howard")
    .then(respone => respone.json()).then(data => {
        console.log(data);
        
    }
    );
document.getElementsByClassName("gif")[document.getElementsByClassName("gif").length - 1].offsetHeight
*/
const searchInput = document.getElementById("search-input");
const api_key = "y75ufo1GAk6BPtV5TPggZMw5b0HNeFtQ";
const gifs = document.getElementById("gifs");
let page = 0;
document.getElementById("search-button").addEventListener("click", handleClickSearchButton);

window.addEventListener("scroll", () => {
    checkForNewDiv();
})

function checkForNewDiv() {
    var lastDiv = document.querySelector("#gifs > div:last-child");
    var lastDivOffset = lastDiv.offsetTop + lastDiv.clientHeight;
    var pageOffset = window.pageYOffset + window.innerHeight;

    if (pageOffset > lastDivOffset - 500) {
        page++;
        findGifs(searchInput.value);        
    }
};

function handleClickSearchButton(event) {
    removeGifsIfExist();
    if (searchInput.value) {
        findGifs(searchInput.value);
    }
}

function findGifs(request) {
    fetch(`http://api.giphy.com/v1/gifs/search?api_key=${api_key}&q=${request}&limit=${page == 0 ? 20 : 5}&offset=${page == 0 ? 0 : 20 + (page - 1) * 5}`)
        .then(respone => respone.json()).then(response => {
            console.log("page" + page + "length" + response.data.length);
            response.data.forEach(element => {
                gifs.appendChild(createGif(element));
            });
        }
        );
}

function removeGifsIfExist() {
    let listOfGifs = document.querySelectorAll(".gif");
    listOfGifs.forEach(element => {
        gifs.removeChild(element);
    });
}

function createGif(gifObject) {
    let gif = document.createElement("div");
    gif.className = "gif";
    let header = document.createElement("div");
    header.className = "header";
    let h5 = document.createElement("h5");
    h5.innerText = gifObject.title;
    let star = document.createElement("i");
    star.classList.add("far", "fa-star");
    header.appendChild(h5);
    header.appendChild(star);
    gif.appendChild(header);
    let image = document.createElement("img");
    image.setAttribute("src", gifObject.images.downsized_medium.url);
    gif.appendChild(image);
    return gif;
}