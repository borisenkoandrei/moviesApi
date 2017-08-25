const container = document.querySelector('.flex-container');
const filmCardContainer = document.querySelector('.film-cards-container');
const searchBar = document.querySelector('.search-bar');
const filtercontainer = document.querySelector('.filter');
const filterblock = document.querySelector('.filter-block');
const form = document.querySelector('.search-form');
const input = document.querySelector('#search');
const toggleButton = document.querySelector('.viewType');
const ignoreProps = ['Poster', 'Type', 'imdbRating', 'imdbVotes', 'imdbID', 'Response', 'Plot', 'Year'];

let apikey = '';
let data = [];


/**
 * Проверяем есть ли ключ API
 */

(function getApiKey() {
  if (localStorage.getItem('apiKey')) {
    apikey = localStorage.getItem('apiKey');
  } else {
    createApiWindow();
  }
}());

/**
 *
 * @param query - поисковой запрос
 * @param apiKey -
 */

function getData(query, apiKey, page) {
  return fetch(`http://www.omdbapi.com/?s=${query}&type=movie&page=${page}&apikey=${apiKey}`)
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
  // data = [];
  fetch(`http://www.omdbapi.com/?s=${query}&type=movie&page=${page}&apikey=${apiKey}`)
    .then(response => response.json())
    .then((json) => {
      data = data.concat(json.Search);

      const totalResult = json.totalResults;
      const pages = Math.ceil(totalResult / json.Search.length);

      if (pages > 1) {
        for (let i = 2; i <= pages; i++) {
          getData(query, apiKey, i)
            .then((res) => {
              data = data.concat(res.Search);
              res.Search.forEach((filmItem) => {
                container.appendChild(createFilmCard(filmItem));
              });
            });
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
    getFilmDetails(id, apikey);
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

function saveApiKey(key) {
  localStorage.setItem('apiKey', key);
  apikey = key;
}

function createApiWindow() {
  const apiKeyWrapper = document.createElement('div');
  apiKeyWrapper.classList.add('enter-api-key');

  const titleKeyWrapper = document.createElement('div');
  titleKeyWrapper.classList.add('title-api-key');

  const apiTitle = document.createElement('span');
  apiTitle.classList.add('enter-api-title');
  apiTitle.innerHTML = 'Введите ключ api';

  titleKeyWrapper.appendChild(apiTitle);

  const formApiKey = document.createElement('div');
  formApiKey.classList.add('form-api-key');

  const apiKeyInput = document.createElement('input');
  apiKeyWrapper.setAttribute('type', 'text');
  apiKeyInput.classList.add('api-key-input');

  const apiKeyButton = document.createElement('button');
  apiKeyButton.classList.add('api-key-button');
  apiKeyButton.innerHTML = 'Сохранить';

  formApiKey.appendChild(apiKeyInput);
  formApiKey.appendChild(apiKeyButton);

  apiKeyWrapper.appendChild(titleKeyWrapper);
  apiKeyWrapper.appendChild(formApiKey);

  filmCardContainer.appendChild(apiKeyWrapper);

  apiKeyButton.addEventListener('click', () => {
    saveApiKey(apiKeyInput.value);
    filmCardContainer.removeChild(apiKeyWrapper);
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
  e.preventDefault();
  search(input.value, apikey);
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

