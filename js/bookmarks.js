let bookmarks = document.querySelector('.bookmarks-wrap');

loadBookmarks();

function loadBookmarks() {
  chrome.storage.sync.get({
    bookmarks: []
  }, function (items) {
    if (items.bookmarks.length === 0) {
      let bookmarksInfo = document.createElement('div');
      bookmarksInfo.classList.add('bookmarks-info');

      let title = document.createElement('span');
      title.textContent = 'No bookmarks yet.';
      title.classList.add('title');

      let subtitle = document.createElement('p');
      subtitle.innerHTML = 'Add bookmarks on the <a href="options.html">options page</a>.';
      subtitle.classList.add('subtitle');

      bookmarksInfo.appendChild(title);
      bookmarksInfo.appendChild(subtitle);

      bookmarks.appendChild(bookmarksInfo);
    } else {
      items.bookmarks.forEach(function (bookmark) {
        let newCategory = document.createElement('div');
        newCategory.classList.add('category');

        let categoryNameDiv = document.createElement('div');
        categoryNameDiv.classList.add('category__name');
        categoryNameDiv.textContent = bookmark.category;

        let categoryLinksDiv = buildLinks(bookmark.links);

        newCategory.appendChild(categoryNameDiv);
        newCategory.appendChild(categoryLinksDiv);
        bookmarks.appendChild(newCategory);
      });
    }
  });
}

function buildLinks(links) {
  let div = document.createElement('div');
  div.classList.add('category__links');

  let ul = document.createElement('ul');

  links.forEach(function (link) {
    let a = document.createElement('a');
    a.href = link.url;

    let li = document.createElement('li');
    li.textContent = link.title;

    a.appendChild(li);
    ul.appendChild(a);
  });

  div.appendChild(ul);
  return div;
}
