var scraper = require('./scraper'),
    util    = require('util');

var http = require('http')
http.globalAgent.maxSockets = Infinity;

scraper('http://gocardless.com', 'gocardless.com', function(err, res) {
//scraper('https://stallman.org', 'stallman.org', function(err, res) {
  if(err) {
    console.log('FFUCKED IT' + err);
  } else {
    console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
    console.log(res);
    console.log(util.inspect(res, {showHidden: false, depth: null}))
  }
});
