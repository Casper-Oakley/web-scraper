var scraper  = require('./scraper'),
    debug    = require('debug')('app'),
    jsonfile = require('jsonfile'),
    path     = require('path'),
    util     = require('util');

var domain = 'baetica-seguros.com';
var startingUrl = 'http://baetica-seguros.com/uk/index.html';
//var domain = 'casperoakley.com';
//var startingUrl = 'http://casperoakley.com/tests/test1/index.html';
//var domain = 'gocardless.com';
//var startingUrl = 'http://gocardless.com';

//scraper.scrape('http://casperoakley.com/tests/test1/index.html', 'casperoakley.com', -1, function(err, res) {
//scraper.scrape('https://stallman.org', 'stallman.org', -1, function(err, res) {
scraper.scrape(startingUrl, domain, -1, function(err, res) {
//scraper.scrape('https://w3schools.com', 'w3schools.com', -1, function(err, res) {
  if(err) {
    debug('Unexpected Error: ' + err);
  } else {
    jsonfile.writeFile(path.resolve(__dirname, 'sitemaps/' + domain + '.json'), res, {spaces: 2}, function(err) {
      console.log('Sitemap successfully written to ' + path.resolve(__dirname, domain + '.json'));
    });
  }
});

