(function () {
  let timeDisplay = document.querySelector('.time');
  let dateDisplay = document.querySelector('.date');
  let greetingDisplay = document.querySelector('.greeting');
  let hintRight = document.querySelector('.hint.right');
  let hintBottom = document.querySelector('.hint.bottom');

  let bookmarks = document.querySelector('.bookmarks');
  let bookmarksWrap = document.querySelector('.bookmarks-wrap'); ``
  let bookmarksBtn = hintBottom.querySelector('span:last-child');
  let loadImageBtn = hintRight.querySelector('span:last-child');
  let closeBtn = document.querySelector('.hint.top.left span:last-child');

  document.addEventListener('click', function (e) {
    if (bookmarksBtn.contains(e.target) && !bookmarks.classList.contains('open')) {
      openBookmarks();
    } else if (bookmarks.classList.contains('open') && !bookmarksWrap.contains(e.target)) {
      closeBookmarks();
    } else if (closeBtn.contains(e.target) && bookmarks.classList.contains('open')) {
      closeBookmarks();
    } else if (loadImageBtn.contains(e.target)) {
      document.querySelector('.hint.right').classList.remove('animated', 'jello');
      handleImageReload();
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'b' && event.ctrlKey && !bookmarks.classList.contains('open')) {
      openBookmarks();
    } else if (event.key === 'c' && event.ctrlKey) {
      handleImageReload();
    } else if (event.key === 'Escape' && bookmarks.classList.contains('open')) {
      closeBookmarks();
    }
  });

  hintRight.addEventListener('animationend', resetAnimation);

  // Schedule ticks, then tick for the first time.
  setInterval(tick, 1000);
  tick();

  checkApiKeys();

  function checkApiKeys() {
    chrome.storage.sync.get({ apiKeys: {} }, function (result) {
      let keys = result.apiKeys;
      if (!keys.unsplash || !keys.unsplashSecret || !keys.positionStack || !keys.openWeather) {
        document.querySelector('.missing-keys-hint').classList.add('show');
      }
    });
  }

  // Initialize i18n
  i18n.init().then(() => {
    tick(); // Run tick after i18n is ready
  });

  function handleImageReload() {
    chrome.storage.sync.get({ imageReloads: [] }, function (result) {
      let reloads = result.imageReloads;
      let now = Date.now();
      // Filter reloads from the last 5 minutes (300000 ms)
      reloads = reloads.filter(timestamp => now - timestamp < 300000);

      if (reloads.length >= 3) {
        // Show wait tooltip
        let hintRight = document.querySelector('.hint.right');
        let originalText = hintRight.innerHTML;
        hintRight.innerHTML = `<span>${i18n.t('rate_limit_msg')}</span>`;
        hintRight.classList.add('animated', 'jello');

        setTimeout(() => {
          hintRight.innerHTML = originalText;
        }, 3000);
      } else {
        // Allow reload
        reloads.push(now);
        chrome.storage.sync.set({ imageReloads: reloads });

        document.querySelector('.hint.right').classList.add('animated', 'jello');
        loadImage(true);
      }
    });
  }

  function openBookmarks() {
    bookmarks.classList.add('open');
    document.querySelector('.container').classList.add('blurred');
    document.querySelector('.background').classList.add('blurred');
  }

  function closeBookmarks() {
    bookmarks.classList.remove('open');
    document.querySelector('.container').classList.remove('blurred');
    document.querySelector('.background').classList.remove('blurred');
  }

  function resetAnimation() {
    this.classList.remove('animated', 'jello');
  }

  function tick() {
    let now = new Date();
    let hour = now.getHours();
    let greeting = i18n.t("greeting_morning");

    if (hour >= 12 && hour < 18) {
      greeting = i18n.t("greeting_afternoon");
    } else if (hour >= 18 && hour < 22) {
      greeting = i18n.t("greeting_evening");
    } else if (hour >= 22 || hour < 5) {
      greeting = i18n.t("greeting_night");
    }

    // Localized Time
    let timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    let t = new Intl.DateTimeFormat(i18n.currentLanguage, timeOptions).format(now);

    // Localized Date (e.g., "Tuesday, January 20, 2026")
    let dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    let d = new Intl.DateTimeFormat(i18n.currentLanguage, dateOptions).format(now);

    timeDisplay.textContent = t;
    dateDisplay.textContent = d;
    greetingDisplay.textContent = greeting;
    document.title = greeting;
  }
})();