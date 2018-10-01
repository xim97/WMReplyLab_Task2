/*fetch("http://api.giphy.com/v1/gifs/search?api_key=y75ufo1GAk6BPtV5TPggZMw5b0HNeFtQ&q=todd%20howard")
    .then(respone => respone.json()).then(data => {
        console.log(data);

    }
    );
document.getElementsByClassName("gif")[document.getElementsByClassName("gif").length - 1].offsetHeight
*/
const searchInput = document.getElementById("search-input");
const api_key = "y75ufo1GAk6BPtV5TPggZMw5b0HNeFtQ";
const content = document.getElementById("content");
const dropDown = document.getElementById("dropdown");
let resultOfRequest;
let offset = 0, isLoading = false, section = "gifs";
let storage = JSON.parse(localStorage.getItem("favourites")) || [];
if (storage.length > 0) {
    let section = document.getElementById("pick-section");
    section.appendChild(createFavouriteRadioButton());
    document.getElementsByName("contentType").
        forEach(element =>
            element.addEventListener("change", handleChangePickContentType));
}
searchInput.addEventListener("input", handleInputChange);
document.getElementById("search-button").addEventListener("click", handleClickSearchButton);
document.getElementsByName("contentType").
    forEach(element =>
        element.addEventListener("change", handleChangePickContentType));

window.addEventListener("click", handleClickNotOnDropDown);

function handleClickNotOnDropDown(event) {
    if (event.target != dropDown) {
        removeDataIfExistFromDropDown();
    }
}


window.addEventListener("scroll", () => {
    if (!isLoading) {
        checkForNewDiv();
    }
});

function handleInputChange(event) {
    const request = event.target.value;
    removeDataIfExistFromDropDown();
    findDataForDropDown(request);
}

function createFavouriteRadioButton() {
    let label = document.createElement("label");
    label.innerHTML = "<input type=\"radio\" id=\"favouriteButton\" name=\"contentType\" value=\"favourite\" />Избранное";
    return label;
}

function handleClickFavoriteButton(event) {
    const targetItem = event.target.parentNode.parentNode;
    searchInput.focus();
    if (event.target.classList.contains("far")) {
        event.target.classList.remove("far");
        event.target.classList.add("fas");
        addItemToStorage(targetItem);
        if (storage.length > 0 && !document.getElementById("favouriteButton")) {
            let section = document.getElementById("pick-section");
            section.appendChild(createFavouriteRadioButton());
            document.getElementsByName("contentType").
                forEach(element =>
                    element.addEventListener("change", handleChangePickContentType));
        }
    } else {
        event.target.classList.remove("fas");
        event.target.classList.add("far");
        deleteItemFromStorage(targetItem);
        if (storage.length == 0 && document.getElementById("favouriteButton")) {
            let section = document.getElementById("pick-section");
            section.removeChild(section.lastChild);
        }
    }
}

function addItemToStorage(item) {
    storage.unshift({
        id: item.getAttribute("gifid"),
        title: item.querySelector("h5").innerText,
        url: item.lastChild.getAttribute("src")
    });
    localStorage.setItem("favourites", JSON.stringify(storage));
}

function deleteItemFromStorage(item) {
    storage = JSON.parse(localStorage.getItem("favourites"));
    storage = storage.filter(element => element.id != item.getAttribute("gifid"));
    localStorage.setItem("favourites", JSON.stringify(storage));
}

function handleChangePickContentType(event) {
    offset = 0;
    section = event.target.value;
    removeDataIfExist();
    findData(searchInput.value);
}

function checkForNewDiv() {
    var lastDiv = document.querySelector("#content > div:last-child");
    var lastDivOffset = lastDiv.offsetTop + lastDiv.clientHeight;
    var pageOffset = window.pageYOffset + window.innerHeight;

    if (pageOffset > lastDivOffset - 500) {
        offset++;
        findData(searchInput.value);
    }
};

function handleClickSearchButton(event) {
    removeDataIfExistFromDropDown();
    removeDataIfExist();
    if (searchInput.value) {
        findData(searchInput.value);
    }
}

function findData(request) {
    if (section != "favourite") {
        isLoading = true;
        fetch(`http://api.giphy.com/v1/${section}/search?api_key=${api_key}&q=${request}&limit=${offset == 0 ? 10 : 5}&offset=${offset == 0 ? 0 : 20 + (offset - 1) * 5}`)
            .then(respone => respone.json()).then(response => {
                response.data.forEach(element => {
                    content.appendChild(createGif(element));
                });
            }
            ).then(() => isLoading = false);
    } else {
        storage.slice(5 * offset, 5 * (offset + 1)).forEach(element => {
            content.appendChild(createGif(element));
        });
    }

}

function findDataForDropDown(request) {    
    isLoading = true;
    fetch(`http://api.giphy.com/v1/${section != "favourite" ? section : "gifs"}/search?api_key=${api_key}&q=${request}&limit=${5}`)
        .then(respone => respone.json()).then(response => {
            response.data.forEach(element => {
                dropDown.appendChild(createSmallGif(element));
            });
        }
        ).then(() => isLoading = false);

}

function removeDataIfExist() {
    let listOfGifs = document.querySelectorAll("#content .gif");
    listOfGifs.forEach(element => {
        content.removeChild(element);
    });
}

function removeDataIfExistFromDropDown() {
    let listOfGifs = document.querySelectorAll("#dropdown .gif");
    listOfGifs.forEach(element => {
        dropDown.removeChild(element);
    });
}

function createSmallGif(gifObject) {
    let gif = document.createElement("div");
    gif.className = "gif";
    gif.setAttribute("gifid", gifObject.id);
    let header = document.createElement("div");
    header.className = "header";
    let h5 = document.createElement("h5");
    h5.innerText = gifObject.title;
    let star = document.createElement("i");
    star.classList.add("fa-star");
    if (storage.find(element => element.id == gifObject.id)) {
        star.classList.add("fas");
    } else {
        star.classList.add("far");
    }
    star.addEventListener("click", handleClickFavoriteButton);
    header.appendChild(h5);
    header.appendChild(star);
    gif.appendChild(header);
    let image = document.createElement("img");
    if (gifObject.images) {
        image.setAttribute("src", gifObject.images.fixed_height_small.url);
    } else {
        image.setAttribute("src", gifObject.url);
    }

    gif.appendChild(image);
    return gif;
}

function createGif(gifObject) {
    let gif = document.createElement("div");
    gif.className = "gif";
    gif.setAttribute("gifid", gifObject.id);
    let header = document.createElement("div");
    header.className = "header";
    let h5 = document.createElement("h5");
    h5.innerText = gifObject.title;
    let star = document.createElement("i");
    star.classList.add("fa-star");
    if (storage.find(element => element.id == gifObject.id)) {
        star.classList.add("fas");
    } else {
        star.classList.add("far");
    }
    star.addEventListener("click", handleClickFavoriteButton);
    header.appendChild(h5);
    header.appendChild(star);
    gif.appendChild(header);
    let image = document.createElement("img");
    if (gifObject.images) {
        image.setAttribute("src", gifObject.images.downsized.url);
    } else {
        image.setAttribute("src", gifObject.url);
    }

    gif.appendChild(image);
    return gif;
}