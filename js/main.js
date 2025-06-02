(function () {
  let timeDisplay = document.querySelector('.time');
  let dateDisplay = document.querySelector('.date');
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
      document.querySelector('.hint.right').classList.add('animated', 'jello');
      document.querySelector('.hint.right').classList.remove('animated', 'jello');
      loadImage();
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'b' && event.ctrlKey && !bookmarks.classList.contains('open')) {
      openBookmarks();
    } else if (event.key === 'c' && event.ctrlKey) {
      document.querySelector('.hint.right').classList.add('animated', 'jello');
      loadImage();
    } else if (event.key === 'Escape' && bookmarks.classList.contains('open')) {
      closeBookmarks();
    }
  });

  hintRight.addEventListener('animationend', resetAnimation);

  // Schedule ticks, then tick for the first time.
  setInterval(tick, 1000);
  tick();

  function openBookmarks() {
    bookmarks.classList.add('open');
    document.querySelector('.container').style.filter = 'blur(2px)';
    document.querySelector('.background').style.filter = 'blur(2px)';
  }

  function closeBookmarks() {
    bookmarks.classList.remove('open');
    document.querySelector('.container').style.filter = 'none';
    document.querySelector('.background').style.filter = 'brightness(50%) contrast(80%)';
  }

  function resetAnimation() {
    this.classList.remove('animated', 'jello');
  }

  function tick() {
    let t = moment().format("HH:mm:ss");
    let d = moment().format("dddd, MMMM Do YYYY");
    timeDisplay.innerHTML = Sanitizer.escapeHTML(t);
    dateDisplay.innerHTML = Sanitizer.escapeHTML(d);
  }
})();