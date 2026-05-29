let quickLinks = document.querySelector('.quick-links');
const MAX_VISIBLE = 5;

loadQuickLinks();

function loadQuickLinks() {
  chrome.storage.sync.get({
    selectedSites: []
  }, function (items) {
    fetch('data/sites.json')
      .then(response => response.json())
      .then(siteInfo => {
        quickLinks.innerHTML = '';

        const selected = items.selectedSites
          .filter(function (site) { return site.selected; })
          .map(function (site) { return find(site.name, siteInfo); })
          .filter(Boolean);

        if (!selected.length) return;

        const visible = selected.slice(0, MAX_VISIBLE);
        const hidden = selected.slice(MAX_VISIBLE);

        visible.forEach(function (info) {
          quickLinks.appendChild(makeLink(info));
        });

        if (hidden.length > 0) {
          const moreBtn = document.createElement('span');
          moreBtn.className = 'more-btn';
          moreBtn.textContent = '···';
          moreBtn.title = 'More links';
          moreBtn.addEventListener('click', function (e) {
            e.preventDefault();
            toggleMore(moreBtn, hidden);
          });
          quickLinks.appendChild(moreBtn);
        }
      });
  });
}

function toggleMore(btn, hiddenLinks) {
  let dropdown = btn.nextElementSibling;
  if (dropdown && dropdown.classList.contains('more-dropdown')) {
    dropdown.remove();
    return;
  }

  dropdown = document.createElement('div');
  dropdown.className = 'more-dropdown';

  hiddenLinks.forEach(function (info) {
    const a = document.createElement('a');
    a.href = info.url;

    const icon = document.createElement('span');
    icon.classList.add('lni', info.icon);

    const label = document.createElement('span');
    label.textContent = info.name;

    a.appendChild(icon);
    a.appendChild(label);
    dropdown.appendChild(a);
  });

  btn.parentNode.style.position = 'relative';
  btn.parentNode.appendChild(dropdown);

  setTimeout(function () {
    document.addEventListener('click', function closeDropdown(e) {
      if (!dropdown.contains(e.target) && e.target !== btn) {
        dropdown.remove();
        document.removeEventListener('click', closeDropdown);
      }
    });
  }, 0);
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
