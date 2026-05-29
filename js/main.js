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

  let dateFormat = 'locale'; // Default: locale-based

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

  checkApiKeys();

  function checkApiKeys() {
    chrome.storage.sync.get({ apiKeys: {} }, function (result) {
      let keys = result.apiKeys;
      if (!keys.unsplash || !keys.unsplashSecret || !keys.openWeather) {
        document.querySelector('.missing-keys-hint').classList.add('show');
      }
    });
  }

  // Load date format preference, then init i18n and start
  chrome.storage.sync.get({ dateFormat: 'locale' }, function (result) {
    dateFormat = result.dateFormat;
  });

  // Initialize i18n first, then start clock
  i18n.init().then(() => {
    tick();
    setInterval(tick, 1000);
  });

  // Listen for date format changes
  chrome.storage.onChanged.addListener(function (changes, namespace) {
    if (namespace === 'sync' && changes.dateFormat) {
      dateFormat = changes.dateFormat.newValue;
      tick();
    }
  });

  function handleImageReload() {
    chrome.storage.sync.get({ imageReloads: [] }, function (result) {
      let reloads = result.imageReloads;
      let now = Date.now();
      reloads = reloads.filter(timestamp => now - timestamp < 300000);

      if (reloads.length >= 3) {
        let hintRight = document.querySelector('.hint.right');
        let originalText = hintRight.innerHTML;
        hintRight.innerHTML = `<span>${i18n.t('rate_limit_msg')}</span>`;
        hintRight.classList.add('animated', 'jello');

        setTimeout(() => {
          hintRight.innerHTML = originalText;
        }, 3000);
      } else {
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

  function formatDate(now, format, lang) {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');

    if (format === 'DD/MM/YYYY') return `${d}/${m}/${y}`;
    if (format === 'MM/DD/YYYY') return `${m}/${d}/${y}`;
    if (format === 'YYYY-MM-DD') return `${y}-${m}-${d}`;

    // locale — use Intl
    return new Intl.DateTimeFormat(lang, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(now);
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

    // Time
    let timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    let t = new Intl.DateTimeFormat(i18n.currentLanguage, timeOptions).format(now);

    // Date — respects dateFormat preference
    let d = formatDate(now, dateFormat, i18n.currentLanguage);

    timeDisplay.textContent = t;
    dateDisplay.textContent = d;
    greetingDisplay.textContent = greeting;
    document.title = greeting;
  }
})();
