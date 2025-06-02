let sitesOptions = document.querySelectorAll('.site');
let weatherLocationOption = document.querySelector('#weather-location');
let weatherCelsiusOption = document.querySelector('#celsius');
let weatherFahrenheitOption = document.querySelector('#fahrenheit');
let weatherDisplayOption = document.querySelector('#display-weather');

let locationFetchStatus = document.getElementById('location-status');

function saveBookmarks() {
  let bookmarks = [];
  let bookmarksOptions = document.querySelectorAll('.bookmark-option-category');
  let categoryErrors = document.querySelectorAll('.error.error--category-name');
  let linkErrors = document.querySelectorAll('.error.error--category-links');

  // Reset error messages
  categoryErrors.forEach(setEmpty);
  linkErrors.forEach(setEmpty);

  // Validation
  bookmarksOptions.forEach(function (option, index) {
    let categoryName = option.querySelector('input').value;
    let categoryLinks = option.querySelectorAll('.bookmark-option-link');

    // Empty category name with at least one link
    if (categoryName.length === 0 && [].some.call(categoryLinks, validLink)) {
      handleCategoryError('Category name cannot be empty.', index);
    }

    // Category name but no complete links
    if (categoryName.length > 0 && ![].some.call(categoryLinks, validLink)) {
      handleCategoryError('Category must contain at least one bookmark.', index);
    }

    // Incomplete links
    if ([].some.call(categoryLinks, incompleteLink)) {
      handleLinkError(index);
    }
  });

  // If no errors
  if ([].every.call(categoryErrors, isEmpty) && [].every.call(linkErrors, isEmpty)) {
    bookmarksOptions.forEach(function (bookmark) {
      let categoryName = bookmark.getElementsByTagName('input')[0].value;
      let categoryLinksOptions = bookmark.getElementsByClassName('bookmark-option-link');

      let categoryLinks = [];

      Array.prototype.forEach.call(categoryLinksOptions, function (link) {
        let url = {
          title: link.getElementsByTagName('input')[0].value,
          url: link.getElementsByTagName('input')[1].value
        };

        categoryLinks.push(url);
      });

      categoryLinks = categoryLinks.filter(function (link) { return link.title.length > 0 && link.url.length > 0 })

      bookmarks.push({
        category: categoryName,
        links: categoryLinks
      });
    });

    bookmarks = bookmarks.filter(function (bookmark) { return bookmark.category.length > 0 });

    chrome.storage.sync.set({
      bookmarks: bookmarks
    }, function () {
      notifySave();
    });
  }

  function setEmpty(node) {
    node.textContent = '';
  }

  function isEmpty(node) {
    return node.textContent === '';
  }

  function validLink(link) {
    return [].every.call(link.querySelectorAll('input'), function (linkValue) {
      return linkValue.value.length > 0;
    });
  }

  function incompleteLink(link) {
    let inputs = link.querySelectorAll('input');

    return [].some.call(inputs, function (linkValue) {
      return linkValue.value.length === 0;
    }) && [].some.call(inputs, function (linkValue) {
      return linkValue.value.length > 0;
    });
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

function saveOptions() {
  saveBookmarks();
  saveQuickLinks();
  saveWeatherOptions();
}

function notifySave() {
  let status = document.getElementById('status');
  status.textContent = 'Saved.';
  setTimeout(function () {
    status.textContent = '';
  }, 750);
}

function handleCategoryError(message, index) {
  let categoryStatus = document.querySelectorAll('.error.error--category-name')[index];
  categoryStatus.textContent = message;
}

function handleLinkError(index) {
  let linkStatus = document.querySelectorAll('.error.error--category-links')[index];
  linkStatus.textContent = 'You have one or more incomplete bookmarks.';
}

function restoreBookmarks() {
  chrome.storage.sync.get({ bookmarks: [] }, function (items) {
    let bookmarks = items.bookmarks;
    let len = bookmarks.length > 3 ? bookmarks.length : 3; // Default 3 categories

    let bookmarksList = document.querySelector('.bookmark-options ul');

    for (let i = 0; i < len; i++) {
      let bookmarkCategory = document.createElement('li');
      bookmarkCategory.classList.add('bookmark-option-category');

      let categoryInput = document.createElement('input');
      categoryInput.placeholder = 'Category';
      categoryInput.value = bookmarks[i] ? bookmarks[i].category : '';
      categoryInput.type = 'text';

      let categoryStatus = document.createElement('span');
      categoryStatus.classList.add('error', 'error--category-name');

      bookmarkCategory.appendChild(categoryInput);
      bookmarkCategory.appendChild(categoryStatus);

      let linksList = document.createElement('ul');
      let linkStatus = document.createElement('span');
      linkStatus.classList.add('error', 'error--category-links');
      linksList.appendChild(linkStatus);

      let linkElements = makeLinks(bookmarks[i] ? bookmarks[i].links : []);

      linkElements.forEach(function (el) {
        linksList.appendChild(el);
      });

      bookmarkCategory.appendChild(linksList);
      bookmarksList.appendChild(bookmarkCategory);
    }
  });
}

function makeLinks(links) {
  // let linksList = document.createElement('ul');
  let linksElements = [];
  let len = links.length > 3 ? links.length : 3; // Default 3 links per category

  for (let j = 0; j < len; j++) {
    let linkEl = document.createElement('li');
    linkEl.classList.add('bookmark-option-link');

    let linkTitleInput = document.createElement('input');
    linkTitleInput.placeholder = 'Name';
    linkTitleInput.value = links[j] ? links[j].title : '';
    linkTitleInput.type = 'text';

    let linkUrlInput = document.createElement('input');
    linkUrlInput.placeholder = 'Url';
    linkUrlInput.value = links[j] ? links[j].url : '';
    linkUrlInput.type = 'text';

    linkEl.appendChild(linkTitleInput);
    linkEl.appendChild(linkUrlInput);
    linksElements.push(linkEl);
  }

  return linksElements;
}

function restoreQuickLinks() {
  chrome.storage.sync.get({
    selectedSites: []
  }, function (items) {
    items.selectedSites.forEach(function (site) {
      document.getElementById(site.name).checked = site.selected;
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

    if (options.weather.units === 'metric') {
      weatherCelsiusOption.checked = true;
    } else if (options.weather.units === 'imperial') {
      weatherFahrenheitOption.checked = true;
    }

    if (options.weather.location) {
      weatherLocationOption.value = options.weather.location;
    }
  });
}

function restoreOptions() {
  restoreQuickLinks();
  restoreBookmarks();
  restoreWeatherOptions();
}

function getCurrentLocation() {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(function (position) {
      if (position) {
        locationFetchStatus.textContent = 'Fetching data, please wait...';
        getFormattedLocation(position, setLocation);
      } else {
        alert('Error getting location. Please manually enter your location in the text box.');
      }
    }, function (error) {
      alert('Error: ' + error.message);
    });
  } else {
    alert(`Your browser doesn't support geolocation. Please manually enter your location in the text box.`);
  }

  saveWeatherOptions();
}

function getFormattedLocation(position, callback) {
  let positionStackApiKey = config.positionStackApiKey;
  let latitude = position.coords.latitude;
  let longitude = position.coords.longitude;
  let location = '';

  fetch(`http://api.positionstack.com/v1/reverse?access_key=${positionStackApiKey}&query=${latitude},${longitude}`)
    .then(response => response.json().then(data => ({ status: response.status, data })))
    .then((response) => {
      if (!response.data.data.length) {
        alert('Failed to get formatted location information. Using latitude and longitude.');
        location = latitude.toString() + ', ' + longitude.toString();
      } else {
        location = response.data.data[0].county + ', ' + response.data.data[0].region;
      }
    })
    .catch((error) => {
      console.error(error);
      alert('Error fetching location information from servers. Attempting to use latitude and longitude...');
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
  locationFetchStatus.textContent = 'Done!';

  setTimeout(() => {
    locationFetchStatus.textContent = '';
  }, 1000);
}

document.querySelector('.geolocate').addEventListener('click', getCurrentLocation);

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
