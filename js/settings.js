let quickLinksContainer = document.querySelector('.quick-links-container');
let sitesOptions = []; // Will be populated dynamically
const status = document.getElementById('status');
const languageSelect = document.getElementById('language');

// Initialize i18n and then restore options
i18n.init().then(async () => {
  await populateLanguages();
  restoreOptions();
});

async function populateLanguages() {
  const languages = await i18n.getSupportedLanguages();
  languages.forEach(lang => {
    const option = document.createElement('option');
    option.value = lang.code;
    option.textContent = lang.name;
    languageSelect.appendChild(option);
  });
}

// Fetch sites data
fetch('data/sites.json')
  .then(response => response.json())
  .then(sites => {
    sites.forEach(site => {
      let siteDiv = document.createElement('div');
      siteDiv.className = 'site';

      let label = document.createElement('label');
      label.htmlFor = site.id;
      label.className = 'flex-start gap-10';

      let icon = document.createElement('i');
      icon.className = 'lni ' + site.icon;

      let text = document.createElement('span');
      text.textContent = site.name;

      label.appendChild(icon);
      label.appendChild(text);

      let input = document.createElement('input');
      input.id = site.id;
      input.type = 'checkbox';

      siteDiv.appendChild(label);
      siteDiv.appendChild(input);
      quickLinksContainer.appendChild(siteDiv);
    });

    // Update the sitesOptions list after rendering
    sitesOptions = document.querySelectorAll('.site');

    // Call restore after rendering
    restoreQuickLinks();
  });
let weatherLocationOption = document.querySelector('#weather-location');
let weatherCelsiusOption = document.querySelector('#celsius');
let weatherFahrenheitOption = document.querySelector('#fahrenheit');
let weatherDisplayOption = document.querySelector('#display-weather');
let bookmarksList = document.getElementById('bookmarks-list');
let addCategoryBtn = document.getElementById('add-category');

let unsplashKeyOption = document.querySelector('#unsplash-key');
let unsplashSecretOption = document.querySelector('#unsplash-secret');
let positionStackKeyOption = document.querySelector('#positionstack-key');
let openWeatherKeyOption = document.querySelector('#openweather-key');

let locationFetchStatus = document.getElementById('location-status');

const MAX_CATEGORIES = 5;
const MAX_LINKS = 10;

function saveBookmarks() {
  let bookmarks = [];
  let bookmarksOptions = document.querySelectorAll('.bookmark-option-category');
  let categoryErrors = document.querySelectorAll('.error.error--category-name');
  let linkErrors = document.querySelectorAll('.error.error--category-links');

  // Reset error messages
  categoryErrors.forEach(setEmpty);
  linkErrors.forEach(setEmpty);

  let hasError = false;

  bookmarksOptions.forEach(function (option, index) {
    let categoryNameInput = option.querySelector('.category-name-input');
    let categoryName = categoryNameInput.value.trim();
    let categoryLinks = option.querySelectorAll('.bookmark-option-link');

    let categoryStatus = option.querySelector('.error.error--category-name');
    let linkStatus = option.querySelector('.error.error--category-links');

    // Empty category name with at least one link
    if (categoryName.length === 0 && [].some.call(categoryLinks, validLink)) {
      categoryStatus.textContent = i18n.t('bookmarks_error_empty');
      hasError = true;
    }

    // Category name but no complete links
    if (categoryName.length > 0 && ![].some.call(categoryLinks, validLink)) {
      categoryStatus.textContent = i18n.t('bookmarks_error_min');
      hasError = true;
    }
  });

  if (!hasError) {
    bookmarksOptions.forEach(function (bookmark) {
      let categoryName = bookmark.querySelector('.category-name-input').value.trim();
      let categoryLinksOptions = bookmark.querySelectorAll('.bookmark-option-link');

      let categoryLinks = [];

      categoryLinksOptions.forEach(function (link) {
        let title = link.querySelector('.link-title').value.trim();
        let url = link.querySelector('.link-url').value.trim();

        if (title.length > 0 && url.length > 0) {
          categoryLinks.push({ title: title, url: url });
        }
      });

      if (categoryName.length > 0 && categoryLinks.length > 0) {
        bookmarks.push({
          category: categoryName,
          links: categoryLinks
        });
      }
    });

    chrome.storage.sync.set({
      bookmarks: bookmarks
    }, function () {
      notifySave();
    });
  }

  function setEmpty(node) {
    node.textContent = '';
  }

  function validLink(link) {
    let title = link.querySelector('.link-title').value.trim();
    let url = link.querySelector('.link-url').value.trim();
    return title.length > 0 && url.length > 0;
  }
}

function saveQuickLinks() {
  function getCheckbox(site) {
    return site.getElementsByTagName('input')[0];
  }

  let selectedSites = [].map.call(sitesOptions, function (site) {
    return {
      name: getCheckbox(site).id,
      selected: getCheckbox(site).checked
    };
  });

  chrome.storage.sync.set({
    selectedSites: selectedSites
  }, function () {
    notifySave();
  });
}

function saveWeatherOptions() {
  let weatherUnits = 'metric';

  if (weatherFahrenheitOption.checked) {
    weatherUnits = 'imperial';
  }

  let weatherOptions = {
    show: weatherDisplayOption.checked,
    units: weatherUnits,
    location: weatherLocationOption.value
  };

  chrome.storage.sync.set({
    weather: weatherOptions
  });
}

function saveApiKeys() {
  let apiKeys = {
    unsplash: unsplashKeyOption.value.trim(),
    unsplashSecret: unsplashSecretOption.value.trim(),
    positionStack: positionStackKeyOption.value.trim(),
    openWeather: openWeatherKeyOption.value.trim()
  };

  chrome.storage.sync.set({
    apiKeys: apiKeys
  }, function () {
    notifySave();
  });
}

function saveLanguage() {
  const selectedLanguage = languageSelect.value;
  chrome.storage.sync.set({
    language: selectedLanguage
  }, function () {
    if (i18n.currentLanguage !== selectedLanguage) {
      i18n.loadLanguage(selectedLanguage);
    }
    notifySave();
  });
}

function saveOptions() {
  saveBookmarks();
  saveQuickLinks();
  saveWeatherOptions();
  saveApiKeys();
  saveLanguage();
}

function notifySave() {
  status.textContent = i18n.t('settings_status_saved');
  setTimeout(function () {
    status.textContent = '';
  }, 2000);
}

function createCategoryElement(name = '', links = []) {
  let li = document.createElement('li');
  li.classList.add('bookmark-option-category');

  let headerDiv = document.createElement('div');
  headerDiv.classList.add('category-header');

  let nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.classList.add('category-name-input');
  nameInput.placeholder = i18n.t('bookmarks_placeholder_category');
  nameInput.value = name;

  let removeBtn = document.createElement('button');
  removeBtn.textContent = i18n.t('bookmarks_remove_category');
  removeBtn.className = 'remove-btn';
  removeBtn.onclick = function () {
    li.remove();
    checkLimits();
  };

  headerDiv.appendChild(nameInput);
  headerDiv.appendChild(removeBtn);

  let categoryError = document.createElement('span');
  categoryError.classList.add('error', 'error--category-name');
  headerDiv.appendChild(categoryError);

  li.appendChild(headerDiv);

  let linksUl = document.createElement('ul');
  linksUl.classList.add('links-list');

  let linksError = document.createElement('span');
  linksError.classList.add('error', 'error--category-links');
  li.appendChild(linksError);

  li.appendChild(linksUl);

  // Add initial links
  if (links.length > 0) {
    links.forEach(link => {
      linksUl.appendChild(createLinkElement(link.title, link.url));
    });
  }

  let addLinkBtn = document.createElement('button');
  addLinkBtn.textContent = i18n.t('bookmarks_add_link');
  addLinkBtn.className = 'add-link-btn';
  addLinkBtn.onclick = function () {
    if (linksUl.children.length < MAX_LINKS) {
      linksUl.appendChild(createLinkElement());
    } else {
      alert(`Maximum ${MAX_LINKS} links per category.`);
    }
  };

  li.appendChild(addLinkBtn);

  return li;
}

function createLinkElement(title = '', url = '') {
  let li = document.createElement('li');
  li.classList.add('bookmark-option-link');

  let titleInput = document.createElement('input');
  titleInput.type = 'text';
  titleInput.placeholder = i18n.t('bookmarks_placeholder_name');
  titleInput.classList.add('link-title');
  titleInput.value = title;

  let urlInput = document.createElement('input');
  urlInput.type = 'text';
  urlInput.placeholder = i18n.t('bookmarks_placeholder_url');
  urlInput.classList.add('link-url');
  urlInput.value = url;

  let removeBtn = document.createElement('button');
  removeBtn.textContent = 'X';
  removeBtn.className = 'remove-link-btn';
  removeBtn.onclick = function () {
    li.remove();
  };

  li.appendChild(titleInput);
  li.appendChild(urlInput);
  li.appendChild(removeBtn);

  return li;
}

function checkLimits() {
  if (bookmarksList.children.length >= MAX_CATEGORIES) {
    addCategoryBtn.disabled = true;
    addCategoryBtn.textContent = i18n.t('bookmarks_max_categories');
  } else {
    addCategoryBtn.disabled = false;
    addCategoryBtn.textContent = i18n.t('bookmarks_add_category');
  }
}

function restoreBookmarks() {
  chrome.storage.sync.get({ bookmarks: [] }, function (items) {
    let bookmarks = items.bookmarks;

    // Clear list
    bookmarksList.innerHTML = '';

    bookmarks.forEach(bookmark => {
      bookmarksList.appendChild(createCategoryElement(bookmark.category, bookmark.links));
    });

    checkLimits();
  });
}

addCategoryBtn.addEventListener('click', function () {
  if (bookmarksList.children.length < MAX_CATEGORIES) {
    bookmarksList.appendChild(createCategoryElement());
    checkLimits();
  }
});

function restoreQuickLinks() {
  chrome.storage.sync.get({
    selectedSites: []
  }, function (items) {
    items.selectedSites.forEach(function (site) {
      let el = document.getElementById(site.name);
      if (el) el.checked = site.selected;
    });
  });
}

function restoreWeatherOptions() {
  chrome.storage.sync.get({
    weather: {}
  }, function (options) {
    if (options.weather.show) {
      weatherDisplayOption.checked = true;
    }

    if (options.weather.units === 'imperial') {
      weatherFahrenheitOption.checked = true;
    } else {
      // Default to metric (Celsius)
      weatherCelsiusOption.checked = true;
    }

    if (options.weather.location) {
      weatherLocationOption.value = options.weather.location;
    }
  });
}

function restoreApiKeys() {
  chrome.storage.sync.get({
    apiKeys: {}
  }, function (options) {
    if (options.apiKeys.unsplash) {
      unsplashKeyOption.value = options.apiKeys.unsplash;
    }
    if (options.apiKeys.unsplashSecret) {
      unsplashSecretOption.value = options.apiKeys.unsplashSecret;
    }
    if (options.apiKeys.positionStack) {
      positionStackKeyOption.value = options.apiKeys.positionStack;
    }
    if (options.apiKeys.openWeather) {
      openWeatherKeyOption.value = options.apiKeys.openWeather;
    }
  });
}

function restoreLanguage() {
  chrome.storage.sync.get({ language: i18n.currentLanguage }, function (items) {
    languageSelect.value = items.language;
  });
}

function restoreOptions() {
  restoreQuickLinks();
  restoreBookmarks();
  restoreWeatherOptions();
  restoreApiKeys();
  restoreLanguage();
}

function getCurrentLocation() {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(function (position) {
      if (position) {
        locationFetchStatus.textContent = i18n.t('weather_fetching');
        // Prefer the value from the input if present, otherwise try storage
        let key = positionStackKeyOption.value.trim();
        if (key) {
          getFormattedLocation(position, key, setLocation);
        } else {
          chrome.storage.sync.get({ apiKeys: {} }, function (result) {
            if (result.apiKeys.positionStack) {
              getFormattedLocation(position, result.apiKeys.positionStack, setLocation);
            } else {
              alert(i18n.t("api_err_positionstack"));
              locationFetchStatus.textContent = '';
            }
          });
        }
      } else {
        alert(i18n.t('weather_err_geo'));
      }
    }, function (error) {
      alert(i18n.t('err_generic') + ': ' + error.message);
    });
  } else {
    alert(i18n.t('api_err_geolocation_unsupported'));
  }

  saveWeatherOptions();
}

function getFormattedLocation(position, apiKey, callback) {
  let latitude = position.coords.latitude;
  let longitude = position.coords.longitude;
  let location = '';

  fetch(`https://api.positionstack.com/v1/reverse?access_key=${apiKey}&query=${latitude},${longitude}`)
    .then(response => response.json().then(data => ({ status: response.status, data })))
    .then((response) => {
      if (!response.data.data || !response.data.data.length) {
        alert(i18n.t('api_err_location_format'));
        location = latitude.toString() + ', ' + longitude.toString();
      } else {
        location = response.data.data[0].county + ', ' + response.data.data[0].region;
      }
    })
    .catch((error) => {
      console.error(error);
      alert(i18n.t('api_err_location_fetch'));
      location = latitude.toString() + ', ' + longitude.toString();
    })
    .finally(() => {
      if (callback && typeof callback === "function") {
        callback(location);
      }
    });
}

function setLocation(location) {
  weatherLocationOption.value = location;
  locationFetchStatus.textContent = i18n.t('weather_done');

  setTimeout(() => {
    locationFetchStatus.textContent = '';
  }, 1000);
}

document.querySelector('.geolocate').addEventListener('click', getCurrentLocation);

document.getElementById('save').addEventListener('click', saveOptions);

// Handle active state in sidebar
document.querySelectorAll('.sidebar nav a').forEach(link => {
  link.addEventListener('click', function () {
    document.querySelectorAll('.sidebar nav a').forEach(l => l.classList.remove('active'));
    this.classList.add('active');
  });
});
