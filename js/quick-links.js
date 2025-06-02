let quickLinks = document.querySelector('.quick-links');

loadQuickLinks();

function loadQuickLinks() {
  chrome.storage.sync.get({
    selectedSites: []
  }, function (items) {
    items.selectedSites
      .filter(function (site) {
        return site.selected;
      })
      .forEach(function (site) {
        let link = makeLink(site);
        quickLinks.appendChild(link);
      });
  });
}

function makeLink(site) {
  let siteInfo = find(site.name);

  let a = document.createElement('a');
  a.href = siteInfo.url;

  let icon = document.createElement('span');
  icon.classList.add('fa', siteInfo.icon);

  a.appendChild(icon);
  return a;
}

function find(siteName) {
  return siteInfo.filter(function (site) {
    return site.name === siteName;
  })[0];
}