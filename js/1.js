/**
 * Created by IEUser on 10.08.2017.
 */
function search(query){

    let data = [];
    let xhr = new XMLHttpRequest();

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === this.DONE) {
            let result = JSON.parse(this.responseText);
            data = result.results;
            if (result.total_pages >= 1){
                for (let i = result.page+1; i<=result.total_pages; i++){
                    let xhr2 = new XMLHttpRequest();

                    xhr2.addEventListener("readystatechange", function () {
                        if (this.readyState === this.DONE) {
                            let result2 = JSON.parse(this.responseText);
                            data = data.concat(result2.results);

                            if(i === result.total_pages){
                                data.forEach(function (film) {

                                    let xhr = new XMLHttpRequest();

                                    xhr.addEventListener("readystatechange", function () {
                                        if (this.readyState === this.DONE) {
                                            let result3 = JSON.parse(this.responseText);
                                            console.log(this.responseText);
                                            container.appendChild(createFilmCard(film.original_title,`https://image.tmdb.org/t/p/w500${film.poster_path}`, `${result3.overview}`));
                                        }
                                    });

                                    xhr.open("GET", `https://api.themoviedb.org/3/movie/${film.id}?language=ru&api_key=39e0b104194205a78342a95c60fb7bee`);

                                    xhr.send();


                                })
                            }
                        }

                    })

                    xhr2.open("GET", `https://api.themoviedb.org/3/search/movie?include_adult=false&page=${i}&query=${query}&language=ru&api_key=39e0b104194205a78342a95c60fb7bee`);

                    xhr2.send();


                }

            }

        }
    });

    xhr.open("GET", `https://api.themoviedb.org/3/search/movie?include_adult=false&page=1&query=${query}&language=ru&api_key=39e0b104194205a78342a95c60fb7bee`);

    xhr.send();


}

var data3 = "{}";

var xhr = new XMLHttpRequest();

xhr.addEventListener("readystatechange", function () {
    if (this.readyState === this.DONE) {
        console.log(this.responseText);
    }
});

xhr.open("GET", "https://api.themoviedb.org/3/movie/377531?language=en-US&api_key=39e0b104194205a78342a95c60fb7bee");

xhr.send(data3);