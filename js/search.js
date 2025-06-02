let SEARCH_BASE = 'https://encrypted.google.com/search?q=';
let searchInput = document.querySelector('.search__input');

searchInput.addEventListener('keydown', handleKeyDown);

function handleKeyDown(event) {
  if (event.key === 'Enter') {
    google();
  }
}

function google() {
  let query = searchInput.value;
  window.location.href = SEARCH_BASE + query;
}