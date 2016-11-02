var scraper  = require('./scraper'),
    debug    = require('debug')('app'),
    jsonfile = require('jsonfile'),
    path     = require('path'),
    readline = require('readline'),
    util     = require('util');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

//App.js itself simply asks for input and passes it to the scraper
console.log('Please enter the URL you wish to scan:');
rl.on('line', function(line) {
  startingUrl = line;
  //Domain is domain name + TLD. startingUrl is entire URL
  domainParts = startingUrl.replace(/^[^/]*\/\/([^/]*)\/?.*$/, '$1').split('.');
  if(domainParts.length < 2 || domainParts[domainParts.length-2] + '.' + domainParts[domainParts.length-1] === startingUrl) {
    console.log('Invalid URL: ' + startingUrl + '. Exiting...');
    process.exit(1);
  } else {
    domain = domainParts[domainParts.length-2] + '.' + domainParts[domainParts.length-1];
    scraper.scrape(startingUrl, domain, -1, function(err, res) {
      if(err) {
        debug('Unexpected Error: ' + err);
      } else {
        jsonfile.writeFile(path.resolve(__dirname, 'sitemaps/' + domain + '.json'), res, {spaces: 2}, function(err) {
          console.log('Sitemap successfully written to ' + path.resolve(__dirname, domain + '.json'));
          process.exit(0);
        });
      }
    });
  }
});


