var request = require('request'),
    async   = require('async');

/** Module contains a function to be called to scrape
 * all elements inside that url
 *
 * @param {string} currentUrl The URL in which to scrape
 * @param {string} targetDomain The domain to scrape (ensures scraper does not leave domain)
 * @param {Object} previousUrls A list of all previous Urls
 *
 */
module.exports = function(currentUrl, targetDomain, previousUrls) {
  request(currentUrl, function(err, res, body) {
    if(err || !res.headers || !res.headers['content-type']) {
      console.log('Error retrieving url: ' + url + '. ' + err);
      return null;
    } else {
      //If successfully recieved, match on content type (without additional parameters):
      switch(res.headers['content-type'].split(';')[0]) {
        //On html, scrape for URLs, then recurse
        case 'text/html':
          var urlList = parseHtml(body, targetDomain, previousUrls);
          
        default:
          return 1;
      }
    }
  });
};

/**
 * Function which extracts any links from given html
 * 
 * @param {string} html A full body of html
 * @param {string} targetDomain The domain to scrape
 * 
 */
var parseHtml = function(html, targetDomain) {
  //Long regex which filters URLs according to https://www.w3.org/Addressing/URL/url-spec.txt
  var listOfUrls = html.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
  //Remove any non target domain entries
  var targetRegex = new RegExp(targetDomain);
  listOfUrls = listOfUrls.filter(function(e) {
    return e.match(targetRegex);
  });
  //Remove any trailing slashes and set all to http (?)
  listOfUrls = listOfUrls.map(function(e) {
    return e.replace(/\/$/,'');
  });
  //Filter out unnecessary terms
  listOfUrls = listOfUrls.filter(function(e, i) {
    return listOfUrls.indexOf(e) == i;
  });
  return listOfUrls;
};
