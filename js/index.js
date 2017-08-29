const container = document.querySelector('.flex-container');
const filmCardContainer = document.querySelector('.film-cards-container');
const searchBar = document.querySelector('.search-bar');
const filtercontainer = document.querySelector('.filter');
const filterblock = document.querySelector('.filter-block');
const setings = document.querySelector('.setings');
const form = document.querySelector('.search-form');
const input = document.querySelector('#search');
const toggleButton = document.querySelector('.viewType');
const ignoreProps = ['Poster', 'Type', 'imdbRating', 'imdbVotes', 'imdbID', 'Response', 'Plot', 'Year'];

let appState = {
    settings: {
        apikey: '',
        raiting: '',
        view: '',
        elPerPages:""
    },
    data: []
};

let data = [];


/**
 * Проверяем есть ли ключ API
 */

(function getApiKey() {
  if (localStorage.getItem('settings')) {
      appState.settings = JSON.parse(localStorage.getItem('settings'));
  } else {
      openSettings();
  }
}());

/**
 * Создание и отрисовка окна с настройками
 */

function openSettings() {
    const settings = document.createElement('div');
    settings.innerHTML = `
      <div class="settings-container"><input class="api-key-input" type="password" placeholder="API key">
          <div class="radio-container">
              <div class="radio">
                  <button class="list active-item" data-active="true" data-view="list">List</button>
                  <button class="pages" data-active="false" data-view="page">Pages</button>
              </div>
              <input type="text" class="items-per-page" disabled="disabled"> <span class="ipp-text">Элементов на странице</span></div>
          <div class="raiting-container"><label class="r-lable"><input class="r-raiting" type="checkbox"> показывать
              рейтинг R</label></div>
          <div class="button-wrapper">
              <button class="log-off">Log out</button>
              <div class="save-close">
                  <button class="save-settings">Save</button>
                  <button class="close-settings">Сlose</button>
              </div>
          </div>
      </div>`;
    document.body.appendChild(settings);

    const wrapper = document.querySelector('.wrapper');
    wrapper.style.opacity = 0;

    const close = settings.querySelector('.close-settings');
    const apiInput = settings.querySelector(".api-key-input");
    const raiting = settings.querySelector('.r-raiting');
    const radio = settings.querySelector(".radio");
    const save = settings.querySelector(".save-settings");
    const logOff = settings.querySelector(".log-off");
    const itemsPerPage = document.querySelector('.items-per-page');

    close.addEventListener('click', () => {
        wrapper.style.opacity = 1;
        document.body.removeChild(settings);
    });

    radio.addEventListener('click', function (e) {
        let child = radio.querySelectorAll("button");
        child.forEach(function (i) {
            i.classList.toggle("active-item");
        })
        if (radio.querySelector('.active-item').dataset.view === "page"){
            itemsPerPage.removeAttribute('disabled');
        } else {
            itemsPerPage.setAttribute('disabled', 'disabled');
            itemsPerPage.value = "";
        }
    });

    itemsPerPage.addEventListener('keypress', function (e) {
        if (!isNaN(e.key)){
            return;
        } else {
            e.preventDefault();
        }
    });

    save.addEventListener('click', function () {
        appState.settings.apikey = apiInput.value;
        appState.settings.raiting = raiting.checked;
        appState.settings.view = radio.querySelector(".active-item").dataset.view;
        if (appState.settings.view === "page"){
            appState.settings.elPerPages =   +itemsPerPage.value || 10;
        } else {
            appState.settings.elPerPages = null;
        };

        localStorage.setItem('settings', JSON.stringify(appState.settings));

        console.log(appState);
    });

    logOff.addEventListener('click', function () {
        appState.settings.apikey = "";
        localStorage.removeItem('apiKey');
        apiInput.value = "";
        console.log(Settings);
    });

}

/**
 *
 * @param query - поисковой запрос
 * @param apiKey -
 */

function getData(query, apiKey, type, page) {
  return fetch(`http://www.omdbapi.com/?s=${query}&type=${type}&page=${page}&apikey=${apiKey}`)
    .then(response => response.json());
}

function getFilmDetails(id, apiKey) {
  fetch(`http://www.omdbapi.com/?i=${id}&type=movie&apikey=${apiKey}`)
    .then(response => response.json()).then((data) => {
      console.log(data);
      createDetailsCard(data);
    }).catch((err) => {
      console.log(err);
    });
}

function search(query, apiKey, page = 1) {
  container.classList.remove('column');
  container.innerHTML = '';

  const type = document.querySelector(".search-type").value;
  console.log(type);


  fetch(`http://www.omdbapi.com/?s=${query}&type=${type}&page=${page}&apikey=${apiKey}`)
    .then(response => response.json())
    .then((json) => {
      data = data.concat(json.Search);

      const totalResult = json.totalResults;
      const pages = Math.ceil(totalResult / json.Search.length);

      if (pages > 1) {
          if (appState.settings.view === 'list') {

              for (let i = 2; i <= pages; i++) {
                  getData(query, apiKey, type, i)
                      .then((res) => {
                          data = data.concat(res.Search);
                          res.Search.forEach((filmItem) => {
                              container.appendChild(createFilmCard(filmItem));
                          });
                      });
              }

          } else if (appState.settings.view === 'page') {
              createPagesPicker(80);
          }
      } else {
          json.Search.forEach(
              (item) => {
                  container.appendChild(createFilmCard(item));
              },
          );
      }

    });
}

function viewItemsOnList() {

}

function viewItemsOnPages(pages) {
    getData(query, apiKey, type, i)
        .then((res) => {
            data = data.concat(res.Search);
            res.Search.forEach((filmItem) => {
                container.appendChild(createFilmCard(filmItem));
            });
        });
}

function createPagesPicker(pagesNumber) {
    let ppWrapper = document.createElement('div');
    ppWrapper.classList.add("pages-picker-wrapper");

    let pagePicker = document.createElement('ul');
    pagePicker.classList.add("pages-picker");

    let pageIndex = document.createElement('li');
    pageIndex.classList.add("page-index");

    let prewPage = document.createElement('a');
    prewPage.setAttribute('href', '#');
    prewPage.classList.add('prew-page');
    prewPage.innerHTML = '<<';

    pageIndex.appendChild(prewPage);
    pagePicker.appendChild(pageIndex);

    for (let i = 1; i<=pagesNumber; i++){
        let pageIndex = document.createElement('li');
        pageIndex.classList.add("page-index")

        let ageNumber = document.createElement('a');
        ageNumber.setAttribute('href', '#');
        ageNumber.classList.add('page-number');
        ageNumber.innerHTML = i;

        pageIndex.appendChild(ageNumber);
        pagePicker.appendChild(pageIndex);

    }

    let pageIndex2 = document.createElement('li');
    pageIndex2.classList.add("page-index");

    let nextPage = document.createElement('a');
    nextPage.setAttribute('href', '#');
    nextPage.classList.add('next-page');
    nextPage.innerHTML = '>>';

    pageIndex2.appendChild(nextPage);
    pagePicker.appendChild(pageIndex2);

    ppWrapper.appendChild(pagePicker);
    document.body.appendChild(ppWrapper);










}

function createFilmCard(filmItem) {
  const filmCard = document.createElement('div');
  filmCard.dataset.id = filmItem.imdbID;
  filmCard.classList.add('film-card');

  const filmTitle = document.createElement('div');
  filmTitle.classList.add('title');
  filmTitle.innerHTML = filmItem.Title;

  const filmYear = document.createElement('div');
  filmYear.classList.add('year');
  filmYear.innerHTML = filmItem.Year;


  const filmImage = document.createElement('img');
  filmImage.classList.add('poster');
  if (filmItem.Poster === 'N/A') {
    filmImage.src = 'http://via.placeholder.com/300x300';
  } else {
    filmImage.src = filmItem.Poster;
  }
  filmImage.alt = filmItem.Title;
  filmImage.onerror = function () {
    filmImage.src = 'http://via.placeholder.com/300x300';
  };

  const filmButton = document.createElement('button');
  filmButton.classList.add('film-card-button');
  filmButton.innerHTML = 'Подробно';

  filmCard.appendChild(filmTitle);
  filmCard.appendChild(filmYear);
  filmCard.appendChild(filmImage);
  filmCard.appendChild(filmButton);

  filmButton.addEventListener('click', (e) => {
    const id = e.currentTarget.closest('.film-card').dataset.id;
    getFilmDetails(id, appState.settings.apikey);
  });

  return filmCard;
}

function createDetailsCard(FilmDetails) {
  const detailsCard = document.createElement('div');
  detailsCard.dataset.id = FilmDetails.imdbID;
  detailsCard.classList.add('details-card');
  /**
     * TOP BLOCK
     * @type {Element}
     */

  const topBlock = document.createElement('div');
  topBlock.classList.add('top-block');

  const detailsCardTitle = document.createElement('div');
  detailsCardTitle.classList.add('details-card-title');
  detailsCardTitle.innerHTML = FilmDetails.Title;

  const closeButton = document.createElement('button');
  closeButton.classList.add('close');
  closeButton.innerHTML = 'X';

  topBlock.appendChild(detailsCardTitle);
  topBlock.appendChild(closeButton);

  /**
     * Description Container
     * @type {Element}
     */

  const descriptionContainer = document.createElement('div');
  descriptionContainer.classList.add('description-container');

  const posterWrap = document.createElement('div');
  posterWrap.classList.add('poster-wrap');

  const posterPic = document.createElement('img');
  posterPic.classList.add('poster-pic');
  posterPic.setAttribute('alt', 'Poster');
  if (FilmDetails.Poster === 'N/A') {
    posterPic.src = 'http://via.placeholder.com/300x300';
  } else {
    posterPic.src = FilmDetails.Poster;
  }

  const video = document.createElement('button');
  video.classList.add('video');
  video.innerHTML = 'YouTube';
  video.dataset.src = FilmDetails.video;

  video.addEventListener('click', (e) => {
    const id = e.target.closest('.details-card').dataset.id;
    getVideoSrc(id);
  });

  posterWrap.appendChild(posterPic);

  if (FilmDetails.video) {
    posterWrap.appendChild(video);
  }


  const tableWrap = document.createElement('div');
  tableWrap.classList.add('table-wrap');

  const table = document.createElement('table');
  table.classList.add('desc-items');

  const tbody = document.createElement('tbody');

  for (const key in FilmDetails) {
    if (ignoreProps.indexOf(key) > -1) {
      continue;
    } else if (FilmDetails[key] == 'N/A') {
      continue;
    } else {
      tbody.appendChild(createTableRow(key, FilmDetails[key]));
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

  const overview = document.createElement('div');
  overview.classList.add('overview');

  const overviewText = document.createElement('span');
  overviewText.classList.add('overview-text');
  overviewText.innerText = FilmDetails.Plot;

  overview.appendChild(overviewText);

  detailsCard.appendChild(topBlock);
  detailsCard.appendChild(descriptionContainer);
  detailsCard.appendChild(overview);

  document.body.appendChild(detailsCard);
  document.body.style.overflow = 'hidden';
  document.body.style.paddingRight = '16px';
  searchBar.style.paddingRight = '16px';


  closeButton.addEventListener('click', (e) => {
    const detailsCard = e.currentTarget.closest('.details-card');
    closeDetailsCard(detailsCard);
  });
}

function createTableRow(name, value) {
  const tr = document.createElement('tr');
  const td1 = document.createElement('td');
  td1.innerHTML = name;

  const td2 = document.createElement('td');

  if (name === 'Website') {
    const link = document.createElement('a');
    link.innerHTML = value;
    link.href = value;
    link.setAttribute('target', '_blank');
    td2.appendChild(link);
  } else if (name === 'Rated') {
    const img = document.createElement('img');
    img.classList.add('pg-img');
    img.src = `./img/PG/${value}.png`;
    img.alt = value;
    td2.appendChild(img);
  } else {
    td2.innerHTML = value;
  }

  tr.appendChild(td1);
  tr.appendChild(td2);

  return tr;
}

function closeDetailsCard(detailsCardNode) {
  document.body.removeChild(detailsCardNode);
  document.body.style.overflow = 'visible';
  document.body.style.paddingRight = '0px';
  searchBar.style.paddingRight = '0px';
}

function toggleColumn() {
  container.classList.toggle('column');
  const allItems = document.querySelectorAll('.film-card');
  const adult = document.querySelectorAll('.adult-icon');
  const description = document.querySelectorAll('.description');

  allItems.forEach((item) => {
    item.classList.toggle('column');
  });

  adult.forEach((item) => {
    item.classList.toggle('hidden');
  });

  description.forEach((item) => {
    item.classList.toggle('hidden');
  });
}


/**
 * Сортировка по заголовку
 * @param type Если true сортируем по убыванию, если false по возрвстанию
 * @param item
 */
function sortData(type, item) {
  function sortUp(a, b) {
    if (a[item] > b[item]) {
      return 1;
    }
    if (a[item] < b[item]) { return -1; }
  }

  function sortLov(a, b) {
    if (a[item] > b[item]) return -1;
    if (a[item] < b[item]) return 1;
  }

  if (type === 'true') {
    data.sort(sortUp);
  } else if (type === 'false') {
    data.sort(sortLov);
  }
  console.log(data);
}

function sortItemOnList(type, item) {
  console.log(typeof type);
  container.innerHTML = '';

  sortData(type, item);

  data.forEach((filmItem) => {
    container.appendChild(createFilmCard(filmItem));
  });
}

filtercontainer.addEventListener('click', (e) => {
  if (e.target === e.currentTarget) {
    return;
  }

  const button = e.target;
  console.log(button);
  const item = button.dataset.type;
  const sortType = button.dataset.sotrtype;

  sortItemOnList(sortType, item);

  if (button.dataset.sotrtype === 'true') {
    button.dataset.sotrtype = 'false';
  } else {
    button.dataset.sotrtype = 'true';
  }
});

form.addEventListener('submit', (e) => {
  // const type =
  console.log(input.value);
  if (input.value === ""){
    e.preventDefault();
    return;
  } else {
    e.preventDefault();
    search(input.value, appState.settings.apikey);
  }
});

document.addEventListener('click', (event) => {
  const detailsCard = document.querySelector('.details-card');
  // console.log(event.target.closest(".details-card"))
  if (detailsCard && !event.target.closest('.details-card')) {
    document.body.removeChild(detailsCard);
    document.body.style.overflow = 'visible';
    document.body.style.paddingRight = '0px';
  }
});

toggleButton.addEventListener('click', () => {
  toggleColumn();
});

function animation() {
  filtercontainer.classList.toggle('ani');
}

filterblock.addEventListener('click', () => {
  animation();
});

setings.addEventListener('click', () => {
  openSettings();
});

