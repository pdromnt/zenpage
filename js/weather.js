(function () {
  let weather = document.querySelector('.weather');
  let temperatureText = document.querySelector('.weather__temperature');
  let unitText = document.querySelector('.weather__unit');
  let conditionIcon = document.querySelector('.weather__condition');
  let conditionText = document.querySelector('.weather__condition-text');
  let weatherLocationText = document.querySelector('.weather__location');

  chrome.storage.sync.get({
    weather: {},
    apiKeys: {}
  }, function (options) {
    let openWmApiKey = options.apiKeys.openWeather;
    let positionStackApiKey = options.apiKeys.positionStack;

    if (options.weather.show && openWmApiKey && positionStackApiKey) {
      // Get Lat & Long from saved location.
      fetch(`https://api.positionstack.com/v1/forward?access_key=${positionStackApiKey}&query=${options.weather.location}`)
        .then(response => response.json().then(data => ({ status: response.status, data })))
        .then((response) => {
          if (response.data.data && response.data.data.length > 0) {
            fetchWeather(response.data.data[0].latitude, response.data.data[0].longitude, options.weather.units, options.weather.location, openWmApiKey);
          } else {
            console.error('PositionStack: No location data found.');
          }
        })
        .catch((error) => {
          console.error(error);
          // alert('Error getting location information.'); // Suppress alert on new tab load
        });
    }
  });

  function fetchWeather(latitude, longitude, units, location, apiKey) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=${units}&appid=${apiKey}`)
      .then(response => response.json().then(data => ({ status: response.status, data })))
      .then((response) => {
        weather.classList.add('active');
        updateWeather(response.data, units, location);
      })
      .catch((error) => {
        console.error(error);
        // alert('Error getting weather information.');
      });
  }

  function updateWeather(data, units, location) {
    temperatureText.innerHTML = data.main.temp.toString().split('.')[0] + '&deg;';
    unitText.innerHTML = parseUnits(units);
    conditionIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    conditionIcon.alt = data.weather[0].description;
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