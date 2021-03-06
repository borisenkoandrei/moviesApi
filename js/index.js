const container = document.querySelector('.flex-container');
const searchBar = document.querySelector('.search-bar');
const filtercontainer = document.querySelector('.filter');
const filterblock = document.querySelector('.filter-block');
const setings = document.querySelector('.setings');
const form = document.querySelector('.search-form');
const input = document.querySelector('#search');
const toggleButton = document.querySelector('.viewType');
const ignoreProps = ['Poster', 'Type', 'imdbRating', 'imdbVotes', 'imdbID', 'Response', 'Plot', 'Year'];
const favoritContainer = document.querySelector('.favorit-container');
const favoritList = document.querySelector('.fav-list');
const openbutton = document.querySelector('.open-button');


const appState = {
  settings: {
  },
  searchQuery: {
  },
  pages: {
    currentPage: '',
    pages: '',
  },
  fav: [],
  favId: [],
};
// const appState = {
//   settings: {
//     apikey: '',
//     raiting: '',
//     view: '',
//     elPerPages: '',
//   },
//   searchQuery: {
//     value: '',
//     type: '',
//   },
//   pages: {
//     currentPage: '',
//     pages: '',
//   },
//   fav: []
//
// };


let data = [];


/**
 * Проверяем есть ли ключ API
 */

(function init() {
  if (localStorage.getItem('favorite')) {
    const favList = JSON.parse(localStorage.getItem('favorite'));
    appState.fav = favList;
  }

  if (localStorage.getItem('favID')) {
    const favList = JSON.parse(localStorage.getItem('favID'));
    appState.favId = favList;
  }

  if (localStorage.getItem('settings')) {
    appState.settings = JSON.parse(localStorage.getItem('settings'));
  } else {
    openSettings();
  }
}());


/**
 * Создание и отрисовка окна с настройками
 */

function viewSettingsParam() {
  const apiInput = document.querySelector('.api-key-input');
  const raiting = document.querySelector('.r-raiting');
  const radio = document.querySelector('.radio');

  const settings = appState.settings;

  apiInput.value = settings.apikey;
  raiting.checked = settings.raiting;
  Array.from(radio.children, (radioElem) => {
    if (radioElem.dataset.view === appState.settings.view && !radioElem.classList.contains('active-item') ||
      radioElem.dataset.view !== appState.settings.view && radioElem.classList.contains('active-item')) {
      radioElem.classList.toggle('active-item');
    }
  });
}

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
  const apiInput = settings.querySelector('.api-key-input');
  const raiting = settings.querySelector('.r-raiting');
  const radio = settings.querySelector('.radio');
  const save = settings.querySelector('.save-settings');
  const logOff = settings.querySelector('.log-off');
  const itemsPerPage = document.querySelector('.items-per-page');

  if (Object.keys(appState.settings).length > 0) {
    viewSettingsParam();
  }

  close.addEventListener('click', () => {
    wrapper.style.opacity = 1;
    document.body.removeChild(settings);
  });

  radio.addEventListener('click', (e) => {
    const child = radio.querySelectorAll('button');
    child.forEach((i) => {
      i.classList.toggle('active-item');
    });
    if (radio.querySelector('.active-item').dataset.view === 'page') {
      itemsPerPage.removeAttribute('disabled');
    } else {
      itemsPerPage.setAttribute('disabled', 'disabled');
      itemsPerPage.value = '';
    }
  });

  itemsPerPage.addEventListener('keypress', (e) => {
    if (!isNaN(e.key)) {
      return;
    }
    e.preventDefault();
  });

  save.addEventListener('click', () => {
    appState.settings.apikey = apiInput.value || JSON.parse(localStorage.getItem('settings')).apikey;
    appState.settings.raiting = raiting.checked;
    appState.settings.view = radio.querySelector('.active-item').dataset.view;
    if (appState.settings.view === 'page') {
      appState.settings.elPerPages = +itemsPerPage.value || 10;
    } else {
      appState.settings.elPerPages = null;
    }

    localStorage.setItem('settings', JSON.stringify(appState.settings));

    wrapper.style.opacity = 1;
    document.body.removeChild(settings);
  });

  logOff.addEventListener('click', () => {
    appState.settings.apikey = '';
    localStorage.removeItem('apiKey');
    apiInput.value = '';
  });
}


function getData(page) {
  return fetch(`http://www.omdbapi.com/?s=${appState.searchQuery.value}&type=${appState.searchQuery.type}&page=${page}&apikey=${appState.settings.apikey}`)
    .then(response => response.json());
}

function getFilmDetails(id) {
  fetch(`http://www.omdbapi.com/?i=${id}&apikey=${appState.settings.apikey}`)
    .then(response => response.json()).then((data) => {
      createDetailsCard(data);
    }).catch((err) => {
      alert(err);
    });
}

function checkRaiting(filmItem) { // imdbID
  return fetch(`http://www.omdbapi.com/?i=${filmItem.imdbID}&apikey=${appState.settings.apikey}`)
    .then(response => response.json())
    .then((data) => {
      if (data.Rated !== 'R') {
        container.appendChild(createFilmCard(filmItem));
      }
    })
    .catch((err) => {
      alert(err);
    });
}

function search(page = 1) {
  container.classList.remove('column');
  container.innerHTML = '';

  fetch(`http://www.omdbapi.com/?s=${appState.searchQuery.value}&type=${appState.searchQuery.type}&page=${page}&apikey=${appState.settings.apikey}`)
    .then(response => response.json())
    .then((json) => {
      data = data.concat(json.Search);

      const totalResult = json.totalResults;
      appState.pages.pages = Math.ceil(totalResult / json.Search.length);
      appState.pages.currentPage = 1;

      if (appState.pages.pages > 1) {
        if (appState.settings.view === 'list') {
          for (let i = 2; i <= appState.pages.pages; i++) {
            getData(i)
              .then((res) => {
                data = data.concat(res.Search);
                res.Search.forEach((filmItem) => {
                  if (appState.settings.raiting === true) {
                    container.appendChild(createFilmCard(filmItem));
                  } else {
                    checkRaiting(filmItem);
                  }
                });
              });
          }
        } else if (appState.settings.view === 'page') {
          getData(appState.pages.currentPage)
            .then((res) => {
              data = data.concat(res.Search);
              res.Search.forEach((filmItem) => {
                container.appendChild(createFilmCard(filmItem));
              });
            });

          createPagesPicker(appState.pages.pages);
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

function createPagesPicker(pagesNumber) {
  if (document.querySelector('.pages-picker-wrapper')) {
    document.body.removeChild(document.querySelector('.pages-picker-wrapper'));
  }
  const ppWrapper = document.createElement('div');
  ppWrapper.classList.add('pages-picker-wrapper');

  const pagePicker = document.createElement('ul');
  pagePicker.classList.add('pages-picker');

  const pageIndex = document.createElement('li');
  pageIndex.classList.add('page-index');

  const prewPage = document.createElement('a');
  prewPage.setAttribute('href', '#');
  prewPage.classList.add('prew-page');
  prewPage.innerHTML = '<<';
  prewPage.dataset.type = 'prew';

  pageIndex.appendChild(prewPage);
  pagePicker.appendChild(pageIndex);

  for (let i = 1; i <= pagesNumber; i++) {
    const pageIndex = document.createElement('li');
    pageIndex.classList.add('page-index');

    const ageNumber = document.createElement('a');
    ageNumber.setAttribute('href', '#');
    ageNumber.classList.add('page-number');
    ageNumber.innerHTML = i;

    pageIndex.appendChild(ageNumber);
    pagePicker.appendChild(pageIndex);
  }

  const pageIndex2 = document.createElement('li');
  pageIndex2.classList.add('page-index');

  const nextPage = document.createElement('a');
  nextPage.setAttribute('href', '#');
  nextPage.classList.add('next-page');
  nextPage.innerHTML = '>>';
  nextPage.dataset.type = 'next';

  pageIndex2.appendChild(nextPage);
  pagePicker.appendChild(pageIndex2);

  ppWrapper.appendChild(pagePicker);
  document.body.appendChild(ppWrapper);

  pagePicker.addEventListener('click', (e) => {
    e.preventDefault();
    if (e.target.dataset.type === 'prew' && appState.pages.currentPage !== 1) {
      container.innerHTML = '';
      appState.pages.currentPage = +appState.pages.currentPage - 1;
      getData(appState.pages.currentPage)
        .then((res) => {
          data = data.concat(res.Search);
          res.Search.forEach((filmItem) => {
            container.appendChild(createFilmCard(filmItem));
          });
        });
    } else if (e.target.dataset.type === 'next' && appState.pages.currentPage !== appState.pages.pages) {
      container.innerHTML = '';
      appState.pages.currentPage = +appState.pages.currentPage + 1;
      getData(appState.pages.currentPage)
        .then((res) => {
          data = data.concat(res.Search);
          res.Search.forEach((filmItem) => {
            container.appendChild(createFilmCard(filmItem));
          });
        });
    } else if (e.target.dataset.type === 'prew' && appState.pages.currentPage === 1 || e.target.dataset.type === 'next' && appState.pages.currentPage === appState.pages.pages) {
      e.preventDefault();
    } else {
      container.innerHTML = '';
      appState.pages.currentPage = +e.target.innerHTML;
      getData(e.target.innerHTML)
        .then((res) => {
          data = data.concat(res.Search);
          res.Search.forEach((filmItem) => {
            container.appendChild(createFilmCard(filmItem));
          });
        });
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

  const addToFavorite = document.createElement('button');
  addToFavorite.classList.add('filmCardAddToFavorite');
  if (appState.favId.indexOf(filmItem.imdbID) > -1) {
    addToFavorite.innerHTML = '-';
    addToFavorite.dataset.action = 'delete';
  } else {
    addToFavorite.innerHTML = '+';
    addToFavorite.dataset.action = 'add';
  }

  filmCard.appendChild(filmTitle);
  filmCard.appendChild(filmYear);
  filmCard.appendChild(filmImage);
  filmCard.appendChild(filmButton);
  filmCard.appendChild(addToFavorite);

  addToFavorite.addEventListener('click', (e) => {
    const favoriteData = { id: filmItem.imdbID, year: filmItem.Year, title: filmItem.Title };
    if (addToFavorite.dataset.action === 'add') {
      appState.fav.push(favoriteData);
      appState.favId.push(filmItem.imdbID);
      localStorage.setItem('favorite', JSON.stringify(appState.fav));
      localStorage.setItem('favID', JSON.stringify(appState.favId));
      addToFavorite.dataset.action = 'delete';
      addToFavorite.innerHTML = '-';
      addFavoriteItemsOnList();
    } else {
      appState.fav.forEach((item, i) => {
        if (item.id === filmItem.imdbID) {
          appState.fav.splice(i, 1);
          localStorage.setItem('favorite', JSON.stringify(appState.fav));
          addFavoriteItemsOnList();
        }
      });
      appState.favId.forEach((item, i) => {
        if (item === filmItem.imdbID) {
          appState.favId.splice(i, 1);
          localStorage.setItem('favID', JSON.stringify(appState.favId));
          addFavoriteItemsOnList();
        }
      });
      addToFavorite.dataset.action = 'add';
      addToFavorite.innerHTML = '+';
    }
  });

  filmButton.addEventListener('click', (e) => {
    const id = e.currentTarget.closest('.film-card').dataset.id;
    getFilmDetails(id);
  });

  return filmCard;
}
/**
 *
 * @param FilmDetails
 * @param {{imdbID}} FilmDetails
 * @param {{Title}} FilmDetails
 * @param {{Poster}} FilmDetails
 * @param {{Plot}} FilmDetails
 *
 */
function createDetailsCard(FilmDetails) {
  const detailsCard = document.createElement('div');
  detailsCard.dataset.id = FilmDetails.imdbID;
  detailsCard.classList.add('details-card');

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

  posterWrap.appendChild(posterPic);

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
}

function sortItemOnList(type, item) {
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
  if (input.value === '') {
    e.preventDefault();
    return;
  }
  e.preventDefault();
  appState.searchQuery.value = input.value;
  appState.searchQuery.type = document.querySelector('.search-type').value;
  search();
});

document.addEventListener('click', (event) => {
  const detailsCard = document.querySelector('.details-card');
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

openbutton.addEventListener('click', (e) => {
  if (e.target.closest('.favorit-container')) {
    favoritContainer.classList.toggle('favorit-container-view');
    openbutton.classList.toggle('open-button-view');
    favoritList.innerHTML = '';
    addFavoriteItemsOnList();
  }
});

function createFavoritItem(favItemData) {
  const favItem = document.createElement('li');
  favItem.dataset.id = favItemData.id;
  favItem.classList.add('fav-item');

  const favItemTextWrap = document.createElement('div');
  favItemTextWrap.classList.add('fav-item_text-wrap');

  const favItemTitle = document.createElement('div');
  favItemTitle.classList.add('fav-item_title');
  favItemTitle.innerHTML = favItemData.title;

  const favItemYear = document.createElement('div');
  favItemYear.classList.add('fav-item_year');
  favItemYear.innerHTML = favItemData.year;

  const favItemDelete = document.createElement('button');
  favItemDelete.classList.add('fav-item_delete');
  favItemDelete.innerHTML = 'Удалить';

  const favItemDetails = document.createElement('button');
  favItemDetails.classList.add('fav-item_details');
  favItemDetails.innerHTML = 'Подробно';


  favItemTextWrap.appendChild(favItemTitle);
  favItemTextWrap.appendChild(favItemYear);

  favItem.appendChild(favItemTextWrap);
  favItem.appendChild(favItemDelete);
  favItem.appendChild(favItemDetails);

  favItemDetails.addEventListener('click', () => {
    getFilmDetails(favItemData.id);
  });

  favItemDelete.addEventListener('click', (e) => {
    const id = e.target.closest('.fav-item').dataset.id;
    favoritList.removeChild(favoritList.querySelector(`[data-id=${id}]`));
    appState.fav.forEach((item, i) => {
      if (item.id === favItemData.id) {
        appState.fav.splice(i, 1);
        localStorage.setItem('favorite', JSON.stringify(appState.fav));
      }
    });
    appState.favId.forEach((item, i) => {
      if (item === favItemData.id) {
        appState.favId.splice(i, 1);
        localStorage.setItem('favID', JSON.stringify(appState.favId));
      }
    });
  });

  return favItem;
}

function addFavoriteItemsOnList() {
  favoritList.innerHTML = '';
  appState.fav.forEach((item) => {
    favoritList.appendChild(createFavoritItem(item));
    localStorage.setItem('favorite', JSON.stringify(appState.fav));
  });
}

window.addEventListener('scroll', (e) => {
  const scrolled = window.pageYOffset;
  const delta = 80 - scrolled;
  if (delta >= 0) {
    favoritContainer.style.marginTop = `${delta} + px`;
  } else {
    e.preventDefault();
  }
});

