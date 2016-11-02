var request = require('request'),
    debug   = require('debug')('scraper'),
    async   = require('async');


var previousUrls;
var count = 0;
var completion = 0;

/** Module contains a function to be called to scrape,
 * passing in inputs
 * @param {string} currentUrl The URL in which to scrape
 * @param {string} targetDomain The domain to scrape (ensures scraper does not leave domain)
 * @param {Object} previousUrls A list of all previous Urls
 * @param {Function} callback a callback procedure to be called once finished. Takes in two arguments,
 *                   (err, res)
 */
module.exports = function(currentUrl, targetDomain, depthLimit, callback) {
  previousUrls = [];
  setInterval(function() {
    process.stdout.write('Currently ' + (completion*100) + '% complete (done ' + count + ' sites).\r');
  }, 1000);
  scrape(currentUrl, targetDomain, depthLimit, 1.0, function(err, res) {
    process.stdout.write('Currently ' + (1.0*100) + '% complete (done ' + count + ' sites).\r');
    callback(err, res);
  });
};




/** Scrape function scrapes a given URL **/
var scrape = function(currentUrl, targetDomain, depthLimit, percentAllowance, callback) {
  count++;
  if(depthLimit > 0) {
    previousUrls.push(currentUrl);
    //Request ONLY the headers. We want to check the content type is html before actually getting it!
    request.head(currentUrl, function(err, res) {
      if(err || !res.headers || !res.headers['content-type']) {
        debug('Error retrieving url: ' + currentUrl + '. ' + err);
        completion += percentAllowance;
        return callback(null, {url: currentUrl, mimetype: 'N/A', children: null});
      } else {
        //If successfully recieved, match on content type (without additional parameters):
        var mimetype = res.headers['content-type'].split(';')[0];
        switch(res.headers['content-type'].split(';')[0]) {
          //If target is html, download the html, then scrape and recurse
          case 'text/html':
            debug(currentUrl);
            request(currentUrl, function(err, res, body) {
              if(err) {
                debug('Error retrieving body for url: ' + currentUrl + '. ' + err);
                completion += percentAllowance;
                return callback(null, {url: currentUrl, mimetype: 'N/A', children: null});
              } else {
                var urlList = parseHtml(body, currentUrl, targetDomain);
                //Remove any previously visited URLs
                urlList = urlList.filter(function(e) {
                  return previousUrls.indexOf(e) == -1;
                });
                //If there are no URLs to process, need to update the percent value
                if(urlList.length == 0) {
                  completion += percentAllowance;
                }
                //For each URL, recurse, then compile into JSON and return
                //Using async as request NPM is IO non blocking - can download in parallel
                async.map(urlList, function(e, cb) {
                  process.nextTick(function() {
                    scrape(e, targetDomain, depthLimit-1, percentAllowance/urlList.length, cb)
                  });
                }, function(err, results) {
                  if(err) {
                    debug('Unexpected error: ' + err);
                    return callback(err, null);
                  } else {
                    return callback(null, {
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
            debug(currentUrl + ' ' + count);
            debug(mimetype);
            completion += percentAllowance;
            return callback(null, {url: currentUrl, mimetype: mimetype, children: null});
        }
      }
    });
  } else {
    debug('Depth limit reached at: ' + currentUrl);
    completion += percentAllowance;
    return callback(null, null);
  }
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
  var listOfUrls = html.match(/(href|src)="[^> #"]+/g);
  //If there exists any urls
  if(listOfUrls) {
    listOfUrls = listOfUrls.map(function(e) {
      //On absolute link, get the entire absolute link
      if(e.match(/https?:\/\/[^/]*/)) {
        return e.replace(/(href|src)="/, '');
      //A slash at the start of a path always dictates 'relative to the root'
      } else if(e.match(/^(href|src)="\//)) {
        return 'http://' + targetDomain + e.replace(/(href|src)="/, '');
      } else {
        //On relative link starting without a /, it is assumed that it is relative to the current location, and so is added to the current location
        return calledUrl + '/' + e.replace(/(href|src)="/, '');
      }
    });
    //Remove any non target domain entries
    var targetRegex = new RegExp('^https?://[a-zA-Z0-9.]*'+targetDomain);
    listOfUrls = listOfUrls.filter(function(e) {
      return e.match(targetRegex);
    });
    listOfUrls = listOfUrls.filter(function(e) {
      return !e.match(/(mailto:|tel:)/);
    });
    //add any missing trailing slashes and set all to http (?)
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
