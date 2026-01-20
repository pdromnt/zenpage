let quickLinks = document.querySelector('.quick-links');

loadQuickLinks();

function loadQuickLinks() {
  chrome.storage.sync.get({
    selectedSites: []
  }, function (items) {
    // Fetch site data
    fetch('data/sites.json')
      .then(response => response.json())
      .then(siteInfo => {
        items.selectedSites
          .filter(function (site) {
            return site.selected;
          })
          .forEach(function (site) {
            let info = find(site.name, siteInfo);
            if (info) {
              let link = makeLink(info);
              quickLinks.appendChild(link);
            }
          });
      });
  });
}

function makeLink(siteInfo) {
  let a = document.createElement('a');
  a.href = siteInfo.url;

  let icon = document.createElement('span');
  icon.classList.add('lni', siteInfo.icon);

  a.appendChild(icon);
  return a;
}

function find(siteId, siteInfo) {
  return siteInfo.find(site => site.id === siteId);
}