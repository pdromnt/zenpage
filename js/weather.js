let openWmApiKey = config.openWmApiKey;
let positionStackApiKey = config.positionStackApiKey;

(function () {
  let weather = document.querySelector('.weather');
  let temperatureText = document.querySelector('.weather__temperature');
  let unitText = document.querySelector('.weather__unit');
  let conditionIcon = document.querySelector('.weather__condition');
  let conditionText = document.querySelector('.weather__condition-text');
  let weatherLocationText = document.querySelector('.weather__location');

  chrome.storage.sync.get({
    weather: {}
  }, function (options) {
    if (options.weather.show) {
      // Get Lat & Long from saved location.
      fetch(`http://api.positionstack.com/v1/forward?access_key=${positionStackApiKey}&query=${options.weather.location}`)
        .then(response => response.json().then(data => ({ status: response.status, data })))
        .then((response) => {
          fetchWeather(response.data.data[0].latitude, response.data.data[0].longitude, options.weather.units, options.weather.location);
        })
        .catch((error) => {
          console.error(error);
          alert('Error getting location information.');
        });
    }
  });

  function fetchWeather(latitude, longitude, units, location) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=${units}&appid=${openWmApiKey}`)
      .then(response => response.json().then(data => ({ status: response.status, data })))
      .then((response) => {
        weather.classList.add('active');
        updateWeather(response.data, units, location);
      })
      .catch((error) => {
        console.error(error);
        alert('Error getting weather information.');
      });
  }

  function updateWeather(data, units, location) {
    temperatureText.innerHTML = data.main.temp.toString().split('.')[0] + '&deg;';
    unitText.innerHTML = parseUnits(units);
    conditionIcon.classList.add('icon-' + data.weather[0].icon); // Need to use OWM icons, from here: https://openweathermap.org/weather-conditions
    conditionText.innerHTML = data.weather[0].description;
    weatherLocationText.innerHTML = location;
  }

  function parseUnits(units) {
    if (units === 'metric') {
      return 'c'
    } else {
      return 'f'
    }
  }
})();