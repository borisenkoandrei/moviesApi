let apikey = "39e0b104194205a78342a95c60fb7bee";

let data = [];

const container = document.querySelector(".flex-container");
const form = document.querySelector(".search-form");
const input = document.querySelector("#search");
const toggleButton = document.querySelector(".viewType");

function createFilmCard(filmItem){
    let filmCard = document.createElement("div");
    filmCard.dataset.id = filmItem.id;
    filmCard.classList.add("film-card");

    let filmTitle = document.createElement("div");
    filmTitle.classList.add("title");
    filmTitle.innerHTML = filmItem.title;

    let filmImage = document.createElement("img");
    filmImage.classList.add("poster");
    filmImage.src = `https://image.tmdb.org/t/p/w500${filmItem.poster_path}`;
    filmImage.alt = filmItem.title;
    filmImage.onerror = function () {
        filmImage.src = "http://via.placeholder.com/300x300"
    };

    let filmDescription = document.createElement("div");
    filmDescription.classList.add("description");
    filmDescription.innerHTML = filmItem.overview;

    let filmButton =document.createElement("button");
    filmButton.classList.add("film-card-button");
    filmButton.innerHTML = "Подробно";




    filmCard.appendChild(filmTitle);
    filmCard.appendChild(filmImage);
    filmCard.appendChild(filmDescription);
    filmCard.appendChild(filmButton);

    if (filmItem.video){
        let videoIcon = document.createElement("img");
        videoIcon.classList.add("video-icon");
        videoIcon.src = "data:image/png;base64,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";
        filmCard.appendChild(videoIcon)
    }

    filmButton.addEventListener("click", function (e) {
         let id = e.currentTarget.closest(".film-card").dataset.id;
        getFilmDetails(id);
    });

    return filmCard;
}

form.addEventListener("submit", function (e) {
    e.preventDefault();
    search(input.value);
});

function getData(query, page){
    return fetch(`https://api.themoviedb.org/3/search/movie?include_adult=false&page=${page}&query=${query}&language=ru&api_key=39e0b104194205a78342a95c60fb7bee`)
}

function search(query) {
    container.innerHTML = "";
    fetch(`https://api.themoviedb.org/3/search/movie?api_key=39e0b104194205a78342a95c60fb7bee&language=ru&query=${query}&page=1&include_adult=false`)
        .then(function(response) {
            return response.json()
        })
        .then(function(json) {
            data = [];
            if (json.total_pages > 1){
                for (let i = json.page; i<= json.total_pages; i++){
                    getData(query, i)
                        .then(function(response) {
                            return response.json()
                        })
                        .then(function (json) {
                            json.results.forEach(function (filmItem) {
                                container.appendChild(createFilmCard(filmItem))
                            });
                            data = data.concat(json.results);

                        }).then(function () {
                            // console.log(data)

                    })

                }
            } else{
                json.results.forEach(function (filmItem) {
                    addFilmCard(filmItem.title, `https://image.tmdb.org/t/p/w500${filmItem.poster_path}`,filmItem.overview, filmItem.id, filmItem.video);
                });
            }
        })
}

function createDetailsCard(FilmDetails) {
    let detailsCard = document.createElement("div");
    detailsCard.dataset.id = FilmDetails.id;
    detailsCard.classList.add("details-card");
    /**
     * TOP BLOCK
     * @type {Element}
     */

    let topBlock = document.createElement("div");
    topBlock.classList.add("top-block");

    let detailsCardTitle = document.createElement("div");
    detailsCardTitle.classList.add("details-card-title");
    detailsCardTitle.innerHTML = FilmDetails.title;

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

        let adult = document.createElement("div");
        adult.classList.add("adult");

            let adultPic = document.createElement("img");
            adultPic.classList.add("adult-pic");
            adultPic.setAttribute("alt", "16+");
            adultPic.src = "data:image/jpeg;base64,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";

        let posterPic = document.createElement("img");
        posterPic.classList.add("poster-pic");
        posterPic.setAttribute("alt", "Poster");
        posterPic.src = `https://image.tmdb.org/t/p/w500${FilmDetails.poster_path}`;

        let video = document.createElement("button");
        video.classList.add("video");
        video.innerHTML = "YouTube";
        video.dataset.src = FilmDetails.video;

        video.addEventListener("click", function (e) {
            let id = e.target.closest(".details-card").dataset.id;
            console.log(id);
            getVideoSrc(id);
        })


        adult.appendChild(adultPic);
        posterWrap.appendChild(adult);
        posterWrap.appendChild(posterPic);

        if (FilmDetails.video){
            posterWrap.appendChild(video);
        }



    let tableWrap = document.createElement("div");
    tableWrap.classList.add("table-wrap");

        let table = document.createElement("table");
        table.classList.add("desc-items");

        let tbody = document.createElement("tbody");

            let title = createTableRow("Название", FilmDetails.title);
            let tagline = createTableRow("Слоган", FilmDetails.tagline);
            let releaseDate = createTableRow("Дата релиза", FilmDetails.release_date);
            let voteAverage = createTableRow("Рейтинг", FilmDetails.vote_average);
            let budget = createTableRow("Бюджет", FilmDetails.budget);
            let productionCountries = createCountryRow(FilmDetails.production_countries);
            let genres = createGenreRow(FilmDetails.genres);
            let productionCompanies = createCompanyRow(FilmDetails.production_companies);

    tbody.appendChild(title);
    tbody.appendChild(tagline);
    tbody.appendChild(releaseDate);
    tbody.appendChild(voteAverage);
    tbody.appendChild(budget);
    tbody.appendChild(productionCountries);
    tbody.appendChild(genres);
    tbody.appendChild(productionCompanies);

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
    overviewText.innerText = FilmDetails.overview;

    overview.appendChild(overviewText);

    detailsCard.appendChild(topBlock);
    detailsCard.appendChild(descriptionContainer);
    detailsCard.appendChild(overview);

    document.body.appendChild(detailsCard);

    console.log(FilmDetails);


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
    td2.innerHTML = value;

    tr.appendChild(td1);
    tr.appendChild(td2);

    return tr;
}

function createCountryRow(value){
    let countryList = [];
    let countryResult = "";

    let tr = document.createElement("tr");
    let td1 = document.createElement("td");
    td1.innerHTML = "Страна";

    let td2 = document.createElement("td");

    value.forEach(function (countryOdj) {
        countryList.push(countryOdj.name);
    });

    countryResult = countryList.join(", ");

    td2.innerHTML = countryResult;

    tr.appendChild(td1);
    tr.appendChild(td2);

    return tr;

}

function createGenreRow(value){
    let countryList = [];
    let countryResult = "";

    let tr = document.createElement("tr");
    let td1 = document.createElement("td");
    td1.innerHTML = "Жанр";

    let td2 = document.createElement("td");

    value.forEach(function (countryOdj) {
        countryList.push(countryOdj.name);
    });

    countryResult = countryList.join(", ");

    td2.innerHTML = countryResult;

    tr.appendChild(td1);
    tr.appendChild(td2);

    return tr;

}

function createCompanyRow(value){
    let countryList = [];
    let countryResult = "";

    let tr = document.createElement("tr");
    let td1 = document.createElement("td");
    td1.innerHTML = "Компания";

    let td2 = document.createElement("td");

    value.forEach(function (countryOdj) {
        countryList.push(countryOdj.name);
    });

    countryResult = countryList.join(", ");

    td2.innerHTML = countryResult;

    tr.appendChild(td1);
    tr.appendChild(td2);

    return tr;
}



function getFilmDetails(id) {
    fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=39e0b104194205a78342a95c60fb7bee&language=ru`)
        .then(function(response) {
            return response.json();
        }).then(function (data) {
            createDetailsCard(data);
    }).catch(function (err) {
        console.log(err)
    })
}

function closeDetailsCard(detailsCardNode){
    document.body.removeChild(detailsCardNode);
}

document.addEventListener("click", function (event) {
    let detailsCard = document.querySelector(".details-card");
    // console.log(event.target.closest(".details-card"))
    if (detailsCard && !event.target.closest(".details-card")){
        document.body.removeChild(detailsCard);
    }

})


// <iframe width="480" height="360" src="https://www.youtube.com/embed/xFa2_PVMeDQ"
// frameborder="0" allowfullscreen></iframe>

function getVideoSrc(id) {
    fetch(`https://api.themoviedb.org/3/movie/${id}/videos?api_key=39e0b104194205a78342a95c60fb7bee&language=en-US`)
        .then(function(response) {
            return response.json();
        }).then(function (json) {
            console.log(json.results);
            if (json.results.length > 0){
                viewVideo(json.results[0].key)
            } else {
                console.log("Заглушка пошла");
                viewVideo("dQw4w9WgXcQ")
            }
        })

}

function viewVideo(src) {
    let videoWrapper = document.createElement("div");
    videoWrapper.classList.add("videoPlayer");

    let frame = document.createElement("iframe");
    frame.setAttribute("width","560");
    frame.setAttribute("height","315");
    frame.setAttribute("src",`https://www.youtube.com/embed/${src}`);
    frame.setAttribute("frameborder","0");
    frame.setAttribute("allowfullscreen",null);

    let videoCloseButton = document.createElement("button");
    videoCloseButton.classList.add("videoCloseButton");
    videoCloseButton.innerHTML = "X";

    videoWrapper.appendChild(frame);
    videoWrapper.appendChild(videoCloseButton);

    videoCloseButton.addEventListener("click", function (event) {
        document.body.removeChild(videoWrapper);
    });

    document.body.appendChild(videoWrapper);
}


function toggleColumn() {
    container.classList.toggle("column");
    let allItems = document.querySelectorAll(".film-card");

    allItems.forEach(function (item) {
        item.classList.toggle("column");

    })

    console.log(allItems)
}

toggleButton.addEventListener("click", function () {
    toggleColumn();
});


/**
 * Сортировка по заголовку
 * @param type Если true сортируем по убыванию, если false по возрвстанию
 */
function sortData(type){
    function sortByTitleUp(a,b) {
        if (a.title > b.title) return 1;
        if (a.title < b.title) return -1;
    }

    function sortByTitleLov(a,b) {
        console.log(a,b);
        if (a.title > b.title) return -1;
        if (a.title < b.title) return 1;
    }

    if(type === true){
        data.sort(sortByTitleUp);
    } else if (type === false){
        data.sort(sortByTitleLov);
    }
    console.log(data)
}

function sortItemOnList(type) {

    container.innerHTML = "";

    sortData(type);

    data.forEach(function (filmItem) {
        container.appendChild(createFilmCard(filmItem))
    });

}










