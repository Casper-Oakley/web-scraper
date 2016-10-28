var request = require('request'),
    async   = require('async');


var previousUrls;
var count = 0;

/** Module contains a function to be called to scrape,
 * passing in inputs
 */
module.exports = function(currentUrl, targetDomain, callback) {
  previousUrls = [];
  return scrape(currentUrl, targetDomain, callback);
};

/** Module contains a function to be called to scrape
 * all elements inside that url
 *
 * @param {string} currentUrl The URL in which to scrape
 * @param {string} targetDomain The domain to scrape (ensures scraper does not leave domain)
 * @param {Object} previousUrls A list of all previous Urls
 * @param {Function} callback a callback procedure to be called once finished. Takes in two arguments,
 *                   (err, res)
 *
 */
var scrape = function(currentUrl, targetDomain, callback) {
  console.log(currentUrl + ' ' + (++count));
  previousUrls.push(currentUrl);
  //Request ONLY the headers. We want to check the content type is html before actually getting it!
  request.head(currentUrl, function(err, res) {
    if(err || !res.headers || !res.headers['content-type']) {
      console.log('Error retrieving url: ' + currentUrl + '. ' + err);
      return callback(null, {url: currentUrl, mimetype: 'N/A', children: null});
    } else {
      //If successfully recieved, match on content type (without additional parameters):
      var mimetype = res.headers['content-type'].split(';')[0];
      switch(res.headers['content-type'].split(';')[0]) {
        //If target is html, download the html, then scrape and recurse
        case 'text/html':
          request(currentUrl, function(err, res, body) {
            if(err) {
              console.log('Error retrieving body for url: ' + currentUrl + '. ' + err);
              return null;
            } else {
              var urlList = parseHtml(body, currentUrl, targetDomain);
              //Remove any previously visited URLs
              urlList = urlList.filter(function(e) {
                return previousUrls.indexOf(e) == -1;
              });
              //For each URL, recurse, then compile into JSON and return
              //Using async as request NPM is IO non blocking - can download in parallel
              async.map(urlList, function(e, cb) {
                scrape(e, targetDomain, cb);
              }, function(err, results) {
                if(err) {
                  console.log('Unexpected error: ' + err);
                  callback(err, null);
                } else {
                  callback(null, {
                    url: currentUrl,
                    mimetype: mimetype,
                    children: results
                  });
                }
              });
            }
          });
          break;
        //If mime type is not html, return just the url, mime type and children
        default:
          return callback(null, {url: currentUrl, mimetype: mimetype, children: null});
      }
    }
  });
};

/**
 * Function which extracts any links from given html
 * 
 * @param {string} html A full body of html
 * @param {string} calledUrl the URL of the function which called it
 * @param {string} targetDomain The domain to scrape
 * 
 */
var parseHtml = function(html, calledUrl, targetDomain) {
  //Long regex which filters URLs according to https://www.w3.org/Addressing/URL/url-spec.txt
  //var listOfUrls = html.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
  var listOfUrls = html.match(/href="[^> #"]+/g);
  //If there exists any urls
  if(listOfUrls) {
    listOfUrls = listOfUrls.map(function(e) {
      return calledUrl + e.replace(/href="/, '').replace(/https?:\/\/[^/]*/,'');
    });
    //Remove any non target domain entries
    var targetRegex = new RegExp(targetDomain);
    listOfUrls = listOfUrls.filter(function(e) {
      return e.match(targetRegex);
    });
    //Remove any trailing slashes and set all to http (?)
    listOfUrls = listOfUrls.map(function(e) {
      return e.replace(/\/$/,'');//.replace(/https?/,'http');
    });
    //Filter out unnecessary terms
    listOfUrls = listOfUrls.filter(function(e, i) {
      return listOfUrls.indexOf(e) == i;
    });
  } else {
    listOfUrls = [];
  }
  return listOfUrls;
};
