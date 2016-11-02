var scraper = require('./scraper'),
    debug   = require('debug')('app'),
    util    = require('util');

scraper('http://gocardless.com', 'gocardless.com', 60, function(err, res) {
//scraper('https://stallman.org', 'stallman.org', function(err, res) {
  if(err) {
    debug('FFUCKED IT' + err);
  } else {
    console.log(util.inspect(res, {showHidden: false, depth: null}))
  }
});

process.on('uncaughtException', function (exception) {
  console.log(exception); // to see your exception details in the console
  // if you are on production, maybe you can send the exception details to your
  // email as well ?
});
