let apikey = "39e0b104194205a78342a95c60fb7bee";

let data = [];

const container = document.querySelector(".flex-container");
const form = document.querySelector(".search-form");
const input = document.querySelector("#search");

function createFilmCard(title, imageUrl, description, id){
    let filmCard = document.createElement("div");
    filmCard.dataset.id = id;
    filmCard.classList.add("film-card");

    let filmTitle = document.createElement("div");
    filmTitle.classList.add("title");
    filmTitle.innerHTML = title;

    let filmImage = document.createElement("img");
    filmImage.classList.add("poster");
    filmImage.src = imageUrl;
    filmImage.alt = title;
    filmImage.onerror = function () {
        filmImage.src = "http://via.placeholder.com/300x300"
    };

    let filmDescription = document.createElement("div");
    filmDescription.classList.add("description");
    filmDescription.innerHTML = description;

    let filmButton =document.createElement("button");
    filmButton.classList.add("film-card-button");
    filmButton.innerHTML = "Подробно";

    filmCard.appendChild(filmTitle);
    filmCard.appendChild(filmImage);
    filmCard.appendChild(filmDescription);
    filmCard.appendChild(filmButton);

    return filmCard;
}

function addFilmCard(title, imageUrl, description, id){
    container.appendChild(createFilmCard(title, imageUrl, description,id))
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
            if (json.total_pages > 1){
                for (let i = json.page; i<= json.total_pages; i++){
                    getData(query, i)
                        .then(function(response) {
                            return response.json()
                        })
                        .then(function (json) {
                            json.results.forEach(function (filmItem) {
                                addFilmCard(filmItem.title, `https://image.tmdb.org/t/p/w500${filmItem.poster_path}`,filmItem.overview, filmItem.id);
                            });
                            data = data.concat(json.results);
                        }).then(function () {
                            if(i === json.total_pages){
                                console.log(data)
                            }

                    });
                }
            } else{
                json.results.forEach(function (filmItem) {
                    addFilmCard(filmItem.title, `https://image.tmdb.org/t/p/w500${filmItem.poster_path}`,filmItem.overview, filmItem.id);
                });
            }
        })
        .then(function () {
            console.log(data)
        })
}





