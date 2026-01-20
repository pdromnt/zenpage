let images = [];
let background = document.querySelector('.background');
let credit = document.querySelector('.credit');

// Caches 20 random photos
let PATH_BASE = 'https://api.unsplash.com/photos';
let PATH_RANDOM = '/random';
let PATH_UTM = '?utm_source=startpage&utm_medium=referral&utm_campaign=api-credit';
let PARAM_FEATURED = 'featured=true';
let PARAM_ORIENTATION = 'orientation=landscape';
let PARAM_COUNT = 'count=20';
let url = PATH_BASE + PATH_RANDOM + '?' + PARAM_FEATURED + '&' + PARAM_ORIENTATION + '&' + PARAM_COUNT;

function loadImage() {
  if (images.length === 0) {
    getImages(url, function (result) {
      images = JSON.parse(result).map(function (image) {
        return {
          url: image.urls.full,
          user: image.user
        };
      });

      setImage(images[0]);
    });
  } else {
    let current = images.pop();
    setImage(current);
  }
}

function getImages(url, callback) {

  let xhr = new XMLHttpRequest();

  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200)
      callback(xhr.responseText);
  }
  xhr.open("GET", url, true); // true for asynchronous
  xhr.setRequestHeader('Authorization', 'Client-ID ' + config.unsplashKey);
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
