# Regarding Manifest V3
Unfortunately due to the huge amount of effort required, I won't be moving this extension to the MV3 service worker model (would it even be possible?). Contributions as always are welcome.

# ZenPage+
Chrome (or any Chromium based browser and Firefox but untested) extension that replaces the New Tab page with a personalised homepage, featuring beautiful photography, bookmark management and weather information.

Forked from the original [ZenPage](https://github.com/jack-doyle/zenpage) to fix most issues and refactor the old broken code.

## Features
* High-resolution photography from [Unsplash](https://unsplash.com)
* Quick links to popular sites
* Categorizable bookmarks
* Weather widget displaying information from [OpenWeatherMap](https://openweathermap.org/)

## Installing
1. First click in Code > Download Zip > Extract zip  
2. Then in your browser go to Extensions > Enable Developer Mode > Load Unpacked > Select the directory where you extracted the zip  
3. You WILL NEED an API key (easy to get) from the services used to have full functionality (Unsplash, positionstack and OpenWeatherMap), put them in the `config-example.js` file and rename it to `config.js`.  
4. Done!  
  
ProTip: The OpenWeatherMap API Key takes a while to activate, usually up to an hour.  

## Updating

Same process as installing, just remember to not lose your `config.js` file! (If you know how to git, you can just do a `git clone` when installing and `git pull` every time you want to update!)

## Screenshots
![Home-one](/screenshots/valley.png?raw=true)
![Home-two](/screenshots/strawberries.png?raw=true)
![Bookmarks](/screenshots/bmarks.png?raw=true)

## License
Same as the old ZenPage. Which is, who knows. My changes are under the ISC license.

## Contributing
Just open a PR, if I agree with your changes I'll merge.

## TODO:
- Change the FontAwesome library to something better and opensource
- Add more popular sites to the Quick Links
- Add parsing to use new weather icons from OpenWeatherMap
- Cleanup the code even more
