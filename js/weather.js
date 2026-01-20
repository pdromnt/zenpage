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
      // Check cache first
      chrome.storage.local.get(['weatherCache'], function (cacheResult) {
        let cache = cacheResult.weatherCache;
        let requestedLocation = options.weather.location;

        if (cache && cache.location === requestedLocation && cache.lat && cache.lon) {
          // Use cached coordinates
          fetchWeather(cache.lat, cache.lon, options.weather.units, requestedLocation, openWmApiKey);
        } else {
          // Fetch from PositionStack
          fetch(`https://api.positionstack.com/v1/forward?access_key=${positionStackApiKey}&query=${requestedLocation}`)
            .then(response => response.json().then(data => ({ status: response.status, data })))
            .then((response) => {
              if (response.data.data && response.data.data.length > 0) {
                let lat = response.data.data[0].latitude;
                let lon = response.data.data[0].longitude;

                // Cache the result
                chrome.storage.local.set({
                  weatherCache: {
                    location: requestedLocation,
                    lat: lat,
                    lon: lon
                  }
                });

                fetchWeather(lat, lon, options.weather.units, requestedLocation, openWmApiKey);
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
    }
  });

  function fetchWeather(latitude, longitude, units, location, apiKey) {
    chrome.storage.local.get(['weatherDataCache'], function (cacheResult) {
      let cache = cacheResult.weatherDataCache;
      let now = Date.now();
      // 10 minutes = 600000 ms
      let isValidCache = cache &&
        cache.lat === latitude &&
        cache.lon === longitude &&
        cache.units === units &&
        cache.iconDataUri &&
        (now - cache.timestamp < 600000);

      if (isValidCache) {
        weather.classList.add('active');
        updateWeather(cache.data, units, location, cache.iconDataUri);
      } else {
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=${units}&appid=${apiKey}`)
          .then(response => response.json().then(data => ({ status: response.status, data })))
          .then((response) => {
            let weatherData = response.data;
            let iconCode = weatherData.weather[0].icon;
            let iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

            // Fetch the icon data to cache it
            fetch(iconUrl)
              .then(res => res.blob())
              .then(blob => {
                let reader = new FileReader();
                reader.onloadend = function () {
                  let iconDataUri = reader.result;

                  weather.classList.add('active');
                  updateWeather(weatherData, units, location, iconDataUri);

                  // Cache the new data with icon
                  chrome.storage.local.set({
                    weatherDataCache: {
                      lat: latitude,
                      lon: longitude,
                      units: units,
                      data: weatherData,
                      timestamp: now,
                      iconDataUri: iconDataUri
                    }
                  });
                }
                reader.readAsDataURL(blob);
              })
              .catch(err => {
                console.error("Failed to cache weather icon:", err);
                // Fallback: render without cached icon (will load from URL)
                weather.classList.add('active');
                updateWeather(weatherData, units, location);

                // Cache without icon data
                chrome.storage.local.set({
                  weatherDataCache: {
                    lat: latitude,
                    lon: longitude,
                    units: units,
                    data: weatherData,
                    timestamp: now
                  }
                });
              });
          })
          .catch((error) => {
            console.error(error);
            // alert('Error getting weather information.');
          });
      }
    });
  }

  function updateWeather(data, units, location, iconDataUri = null) {
    temperatureText.innerHTML = Math.round(data.main.temp) + '&deg;'; // Added Math.round for better display
    unitText.innerHTML = parseUnits(units);

    if (iconDataUri) {
      conditionIcon.src = iconDataUri;
    } else {
      conditionIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    }

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