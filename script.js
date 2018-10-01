const api_key = "kqCPXa4qvrRlHSS8vyYPNeROW9HsO4K1";
const searchInput = document.getElementById("search-input");
const content = document.getElementById("content");
const dropDown = document.getElementById("dropdown");

let resultOfRequest,
    offset = 0,
    isLoading = false,
    section = "gifs",
    storage = JSON.parse(localStorage.getItem("favourites")) || [];

class Utils {

    static checkForNewDiv() {
        if (!isLoading && content.children.length > 0) {
            let lastDiv = document.querySelector("#content > div:last-child"),
                lastDivOffset = lastDiv.offsetTop + lastDiv.clientHeight,
                pageOffset = window.pageYOffset + window.innerHeight;

            if (pageOffset > lastDivOffset - 500) {
                offset++;
                Utils.getData(searchInput.value, "content");
            }
        }
    }

    static getParentNode(element) {
        let currentNode = element;
        while (currentNode.parentNode != content &&
            currentNode.parentNode != dropDown &&
            currentNode.parentNode != document) {
            currentNode = currentNode.parentNode
        }
        return currentNode.parentNode;
    }

    static getData(request, place, handleInputChange = false) {
        if (section != "favourite") {
            isLoading = true;
            fetch(`http://api.giphy.com/v1/${section}/search?api_key=${api_key}&q=${request}&limit=${place == "content" ? offset == 0 ? 10 : 5 : 5}&offset=${offset == 0 ? 0 : 20 + (offset - 1) * 5}`)
                .then(response => response.json()).then(response => {
                    Creator.createListOfEntities(response.data, place);
                    resultOfRequest = [...response.data];
                }
                ).then(() => isLoading = false).catch(error => {
                    console.error(error);
                });
        } else {
            if (!handleInputChange) {
                Creator.createListOfEntities(storage.slice(5 * offset, 5 * (offset + 1)), "content");
            }

        }
    }
}


class Eraser {
    static removeDataIfExist(place) {
        let listOfEntities = document.querySelectorAll(`#${place} .entity`);
        listOfEntities.forEach(element => {
            switch (place) {
                case "content": {
                    content.removeChild(element);
                    break;
                }
                case "dropdown": {
                    dropDown.removeChild(element);
                    break;
                }
            }
        });
    }

    static deleteItemFromStorage(item) {
        storage = JSON.parse(localStorage.getItem("favourites"));
        storage = storage.filter(element => element.id != item.getAttribute("entityid"));
        localStorage.setItem("favourites", JSON.stringify(storage));
    }

    static deleteFavouriteRadioButton() {
        if (storage.length == 0 && document.getElementById("favouriteButton")) {
            let section = document.getElementById("pick-section");
            section.removeChild(section.lastChild);
        }
    }
}

class Adder {

    static addAllListeners() {
        Adder.addFavouriteButtonToPickSection();
        Adder.addEventListenerForSearchInput();
        Adder.addEventListenerForSearchButton();
        Adder.addEventListenersForPickSection();
        Adder.addEventListenersForWindow();
    }

    static addFavouriteButtonToPickSection() {
        if (storage.length > 0 && !document.getElementById("favouriteButton")) {
            document.getElementById("pick-section").appendChild(Creator.createFavouriteRadioButton());
            Adder.addEventListenersForPickSection();
        }
    }

    static addItemToStorage(item) {
        storage.unshift(resultOfRequest.find(element => element.id == item.getAttribute("entityid")));
        localStorage.setItem("favourites", JSON.stringify(storage));
    }

    static addEventListenersForPickSection() {
        document.getElementsByName("contentType").
            forEach(element =>
                element.addEventListener("change", (event) => Handlers.handleChangePickContentType(event)));
    }

    static addEventListenerForSearchInput() {
        searchInput.addEventListener("input", (event) => Handlers.handleInputChange(event));
    }

    static addEventListenerForSearchButton() {
        document.getElementById("search-button").addEventListener("click", (event) => Handlers.handleClickSearchButton(event));
    }

    static addEventListenersForWindow() {
        window.addEventListener("click", (event) => Handlers.handleClickNotOnDropDown(event));
        window.addEventListener("scroll", (event) => Utils.checkForNewDiv());
    }

}

class Handlers {

    static handleClickNotOnDropDown(event) {
        if (Utils.getParentNode(event.target) != dropDown) {
            Eraser.removeDataIfExist("dropdown");
        }
    }

    static handleInputChange(event) {
        const request = event.target.value;
        Eraser.removeDataIfExist("dropdown");
        Utils.getData(request, "dropdown", true);
    }

    static handleClickFavoriteButton(event) {
        const targetItem = event.target.parentNode.parentNode,
            targetClassList = event.target.classList;
        if (Utils.getParentNode(event.target) == dropDown) {
            searchInput.focus();
        }
        if (targetClassList.contains("far")) {
            targetClassList.remove("far");
            targetClassList.add("fas");
            Adder.addItemToStorage(targetItem);
            Adder.addFavouriteButtonToPickSection();
        } else {
            targetClassList.remove("fas");
            targetClassList.add("far");
            Eraser.deleteItemFromStorage(targetItem);
            Eraser.deleteFavouriteRadioButton();
        }
    }

    static handleChangePickContentType(event) {
        offset = 0;
        section = event.target.value;
        Eraser.removeDataIfExist("content");
        Utils.getData(searchInput.value, "content");
    }

    static handleClickSearchButton(event) {
        Eraser.removeDataIfExist("content");
        Eraser.removeDataIfExist("dropdown");
        if (searchInput.value) {
            Utils.getData(searchInput.value, "content");
        }
    }

}

class Creator {

    static createFavouriteRadioButton() {
        let label = document.createElement("label");
        label.innerHTML = "<input type=\"radio\" id=\"favouriteButton\" name=\"contentType\" value=\"favourite\" />Избранное";
        return label;
    }

    static createListOfEntities(data, place) {
        switch (place) {
            case "content": {
                data.forEach(element => {
                    content.appendChild(Creator.createEntity(element, "downsized"));
                });
                break;
            }
            case "dropdown": {
                data.forEach(element => {
                    dropDown.appendChild(Creator.createEntity(element, "fixed_height_small"));
                });
                break;
            }
        }
    }

    static createImageForEntity(entity, imageProperty) {
        let image = document.createElement("img");
        image.setAttribute("src", entity.images[imageProperty].url);
        return image;
    }

    static createHeaderForEntity(title, id) {
        let header = document.createElement("div");
        header.className = "header";
        header.appendChild(Creator.createH5ForEntity(title));
        header.appendChild(Creator.createFavouriteStarForEntity(id));
        return header;
    }

    static createH5ForEntity(title) {
        let h5 = document.createElement("h5");
        h5.innerText = title;
        return h5;
    }

    static createFavouriteStarForEntity(id) {
        let star = document.createElement("i");
        star.classList.add("fa-star");
        if (storage.find(element => element.id == id)) {
            star.classList.add("fas");
        } else {
            star.classList.add("far");
        }
        star.addEventListener("click", (event) => Handlers.handleClickFavoriteButton(event));
        return star;
    }

    static createEntity(entity, imageProperty) {
        let DOMObject = document.createElement("div");
        DOMObject.className = "entity";
        DOMObject.setAttribute("entityid", entity.id);
        DOMObject.appendChild(Creator.createHeaderForEntity(entity.title, entity.id));
        DOMObject.appendChild(Creator.createImageForEntity(entity, imageProperty));
        return DOMObject;
    }
}

Adder.addAllListeners();    