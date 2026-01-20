let images = [];
let background = document.querySelector('.background');
let credit = document.querySelector('.credit');

// Caches 20 random photos
let PATH_BASE = 'https://api.unsplash.com/photos';
let PATH_RANDOM = '/random';
let PATH_UTM = '?utm_source=startpage&utm_medium=referral&utm_campaign=api-credit';
let PARAM_FEATURED = 'featured=true';
let PARAM_ORIENTATION = 'orientation=landscape';
let PARAM_COUNT = 'count=1';
let url = PATH_BASE + PATH_RANDOM + '?' + PARAM_FEATURED + '&' + PARAM_ORIENTATION + '&' + PARAM_COUNT;

function loadImage(force = false) {
  chrome.storage.sync.get({
    apiKeys: {}
  }, function (options) {
    if (options.apiKeys.unsplash) {
      chrome.storage.local.get(['cachedImage', 'imageTimestamp'], function (cache) {
        let now = Date.now();
        // 1 hour cache = 3600000 ms
        if (!force && cache.cachedImage && cache.imageTimestamp && (now - cache.imageTimestamp < 3600000)) {
          setImage(cache.cachedImage);
        } else {
          getImages(url, options.apiKeys.unsplash, function (result) {
            let fetchedImages = JSON.parse(result).map(function (image) {
              return {
                url: image.urls.full,
                user: image.user
              };
            });

            if (fetchedImages.length > 0) {
              let image = fetchedImages[0];
              setImage(image);
              chrome.storage.local.set({
                cachedImage: image,
                imageTimestamp: now
              });
            }
          });
        }
      });
    }
  });
}

function getImages(url, apiKey, callback) {

  let xhr = new XMLHttpRequest();

  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200)
      callback(xhr.responseText);
  }
  xhr.open("GET", url, true); // true for asynchronous
  xhr.setRequestHeader('Authorization', 'Client-ID ' + apiKey);
  xhr.send(null);
}

function setImage(image) {
  background.style.backgroundImage = 'url(' + image.url + ')';
  setCredit(image.user);
}

function setCredit(user) {
  credit.textContent = ''; // Clear existing content

  let aUser = document.createElement('a');
  aUser.href = user.links.html + PATH_UTM;
  aUser.textContent = 'Photo by ' + user.name;

  let separator = document.createTextNode(' / ');

  let aUnsplash = document.createElement('a');
  aUnsplash.href = 'https://unsplash.com';
  aUnsplash.textContent = 'Unsplash';

  credit.appendChild(aUser);
  credit.appendChild(separator);
  credit.appendChild(aUnsplash);
}

loadImage();
