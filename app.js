var scraper = require('./scraper');

scraper('http://gocardless.com', 'gocardless.com', function(err, res) {
  if(err) {
    console.log('FFUCKED IT' + err);
  } else {
    console.log(res);
  }
});
