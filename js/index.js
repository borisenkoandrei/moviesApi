const container = document.querySelector(".flex-container");
const searchBar = document.querySelector(".search-bar");
const filtercontainer = document.querySelector(".filter");
const form = document.querySelector(".search-form");
const input = document.querySelector("#search");
const toggleButton = document.querySelector(".viewType");
const ignoreProps = ["Poster", "Type","imdbRating", "imdbVotes", "imdbID", "Response"];

let apikey = "";
let data = [];



/**
 * Проверяем есть ли ключ API
 */

(function getApiKey(){
    if (localStorage.getItem("apiKey")){
        apikey = localStorage.getItem("apiKey");
    } else {
        let api = prompt("Введите ключ API");
        localStorage.setItem("apiKey", api);
        apikey = api;
    }
})();

/**
 *
 * @param query - поисковой запрос
 * @param apiKey -
 */

function getData(query, apiKey, page){
    return fetch(`http://www.omdbapi.com/?s=${query}&type=movie&page=${page}&apikey=${apiKey}`)
        .then(function (response) {
            return response.json();
        })
}

function getFilmDetails(id, apiKey) {
    fetch(`http://www.omdbapi.com/?i=${id}&type=movie&apikey=${apiKey}`)
        .then(function(response) {
            return response.json();
        }).then(function (data) {
            createDetailsCard(data);
        }).catch(function (err) {
            console.log(err)
        })
}

function search(query, apiKey, page = 1) {
    container.classList.remove("column");
    container.innerHTML = "";
    fetch(`http://www.omdbapi.com/?s=${query}&type=movie&page=${page}&apikey=${apiKey}`)
        .then(function(response) {
            return response.json()
        })
        .then(function(json) {
            data = data.concat(json.Search);

            let totalResult = json.totalResults;
            let pages = Math.ceil(totalResult / json.Search.length);

            if(pages >1){
                for (let i = 2; i <= pages; i++){
                    getData(query, apiKey, i)
                        .then(function (res) {
                            data = data.concat(res.Search);
                            res.Search.forEach(function (filmItem) {
                                container.appendChild(createFilmCard(filmItem))
                            });
                        })
                }
            }
        })
}

function createFilmCard(filmItem){
    let filmCard = document.createElement("div");
    filmCard.dataset.id = filmItem.imdbID;
    filmCard.classList.add("film-card");

    let filmTitle = document.createElement("div");
    filmTitle.classList.add("title");
    filmTitle.innerHTML = filmItem.Title;

    let filmImage = document.createElement("img");
    filmImage.classList.add("poster");
    if (filmItem.Poster === "N/A") {
        filmImage.src = "http://via.placeholder.com/300x300"
    } else {
        filmImage.src = filmItem.Poster;
    }
    filmImage.alt = filmItem.Title;
    filmImage.onerror = function () {
        filmImage.src = "http://via.placeholder.com/300x300"
    };

    let filmButton = document.createElement("button");
    filmButton.classList.add("film-card-button");
    filmButton.innerHTML = "Подробно";

    filmCard.appendChild(filmTitle);
    filmCard.appendChild(filmImage);
    filmCard.appendChild(filmButton);

    filmButton.addEventListener("click", function (e) {
         let id = e.currentTarget.closest(".film-card").dataset.id;
        getFilmDetails(id, apikey);
    });

    return filmCard;
}

function createDetailsCard(FilmDetails) {
    let detailsCard = document.createElement("div");
    detailsCard.dataset.id = FilmDetails.imdbID;
    detailsCard.classList.add("details-card");
    /**
     * TOP BLOCK
     * @type {Element}
     */

    let topBlock = document.createElement("div");
    topBlock.classList.add("top-block");

    let detailsCardTitle = document.createElement("div");
    detailsCardTitle.classList.add("details-card-title");
    detailsCardTitle.innerHTML = FilmDetails.Title;

    let closeButton = document.createElement("button");
    closeButton.classList.add("close");
    closeButton.innerHTML = "X";

    topBlock.appendChild(detailsCardTitle);
    topBlock.appendChild(closeButton);

    /**
     * Description Container
     * @type {Element}
     */

    let descriptionContainer = document.createElement("div");
    descriptionContainer.classList.add("description-container");

    let posterWrap = document.createElement("div");
    posterWrap.classList.add("poster-wrap");

        let posterPic = document.createElement("img");
        posterPic.classList.add("poster-pic");
        posterPic.setAttribute("alt", "Poster");
        if(FilmDetails.Poster === "N/A"){
            posterPic.src = "http://via.placeholder.com/300x300"
        } else{
            posterPic.src = FilmDetails.Poster;
        }

        let video = document.createElement("button");
        video.classList.add("video");
        video.innerHTML = "YouTube";
        video.dataset.src = FilmDetails.video;

        video.addEventListener("click", function (e) {
            let id = e.target.closest(".details-card").dataset.id;
            getVideoSrc(id);
        })

        posterWrap.appendChild(posterPic);

        if (FilmDetails.video){
            posterWrap.appendChild(video);
        }



    let tableWrap = document.createElement("div");
    tableWrap.classList.add("table-wrap");

        let table = document.createElement("table");
        table.classList.add("desc-items");

        let tbody = document.createElement("tbody");

        for (let key in FilmDetails){
            if(ignoreProps.indexOf(key) > -1){
                continue
            } else{
                if(FilmDetails[key] == "N/A"){
                    continue
                } else {
                    tbody.appendChild(createTableRow(key, FilmDetails[key]));
                }
            }
        }

    table.appendChild(tbody);

    tableWrap.appendChild(table);

    descriptionContainer.appendChild(posterWrap);
    descriptionContainer.appendChild(tableWrap);



    /**
     * Ovwevew
     * @type {Element}
     */

    let overview = document.createElement("div");
    overview.classList.add("overview");

    let overviewText = document.createElement("span");
    overviewText.classList.add("overview-text");
    overviewText.innerText = FilmDetails.Plot;

    overview.appendChild(overviewText);

    detailsCard.appendChild(topBlock);
    detailsCard.appendChild(descriptionContainer);
    detailsCard.appendChild(overview);

    document.body.appendChild(detailsCard);
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = "16px";
    searchBar.style.paddingRight = "16px";


    closeButton.addEventListener("click", function (e) {
        let detailsCard = e.currentTarget.closest(".details-card");
        closeDetailsCard(detailsCard);
    })

}

function createTableRow(name, value) {
    let tr = document.createElement("tr");
    let td1 = document.createElement("td");
    td1.innerHTML = name;

    let td2 = document.createElement("td");

    if (name ==="Website"){
        let link = document.createElement("a");
        link.innerHTML = value;
        link.href = value;
        link.setAttribute("target", "_blank");
        td2.appendChild(link)
    } else {
        td2.innerHTML = value;
    }

    tr.appendChild(td1);
    tr.appendChild(td2);

    return tr;
}

function closeDetailsCard(detailsCardNode){
    document.body.removeChild(detailsCardNode);
    document.body.style.overflow = "visible";
    document.body.style.paddingRight = "0px";
    searchBar.style.paddingRight = "0px";

}

function toggleColumn() {
    container.classList.toggle("column");
    let allItems = document.querySelectorAll(".film-card");
    let adult = document.querySelectorAll(".adult-icon");
    let description = document.querySelectorAll(".description");

    allItems.forEach(function (item) {
        item.classList.toggle("column");
    });

    adult.forEach(function (item) {
        item.classList.toggle("hidden");
    });

    description.forEach(function (item) {
        item.classList.toggle("hidden");
    });
}

toggleButton.addEventListener("click", function () {
    toggleColumn();
});


/**
 * Сортировка по заголовку
 * @param type Если true сортируем по убыванию, если false по возрвстанию
 * @param item
 */
function sortData(type, item){
    function sortUp(a,b) {
        if (a[item] > b[item]) return 1;
        if (a[item] < b[item]) return -1;
    }

    function sortLov(a,b) {
        if (a[item] > b[item]) return -1;
        if (a[item] < b[item]) return 1;
    }

    if(type === "true"){
        data.sort(sortUp);
    } else if (type === "false"){
        data.sort(sortLov);
    }
    console.log(data)
}

function sortItemOnList(type, item) {

    console.log(typeof type);
    container.innerHTML = "";

    sortData(type, item);

    data.forEach(function (filmItem) {
        container.appendChild(createFilmCard(filmItem))
    });

}

filtercontainer.addEventListener("click", function (e) {
    if(e.target === e.currentTarget){
        return;
    }

    let button = e.target;
    console.log(button)
    let item = button.dataset.type;
    let sortType = button.dataset.sotrtype;

    sortItemOnList(sortType, item);

    if (button.dataset.sotrtype === "true"){
        button.dataset.sotrtype = "false"
    } else {
        button.dataset.sotrtype = "true"
    }
});

form.addEventListener("submit", function (e) {
    e.preventDefault();
    search(input.value, apikey);
});

document.addEventListener("click", function (event) {
    let detailsCard = document.querySelector(".details-card");
    // console.log(event.target.closest(".details-card"))
    if (detailsCard && !event.target.closest(".details-card")){
        document.body.removeChild(detailsCard);
        document.body.style.overflow = "visible";
        document.body.style.paddingRight = "0px";
    }
});









