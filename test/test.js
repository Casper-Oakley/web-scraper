var assert = require('assert'),
    should = require('should'),
    parseTests = require('./parsehtmltests.json'),
    scraper = require('../scraper');

//Meta testing unit tests for the parseHtml function in scraper.js
describe('parseTests (meta tests)', function() {
  it('should be an array', function() {
    (parseTests).should.be.a.Array();
  });
  for(x in parseTests) {
    it('parseTests entry ' + x, function() {
      var entry = parseTests[x];
      (entry.urls).should.be.a.Array();
      (entry.calledUrl).should.be.a.String();
      (entry.targetDomain).should.be.a.String();
      (entry.results).should.be.a.Array();
      (entry.comment).should.be.a.String();
    });
  }
});

//Various System tests for a couple of small sites written and hosted by myself
describe('All smaller tests for casperoakley/tests/test1/index.html should pass.', function() {
  var response;
  before(function(done) {
    scraper.scrape('http://casperoakley.com/tests/test1/index.html', 'casperoakley.com', -1, function(err, res) {
      response = res;
      done();
    });
  });
 
  it('Top object for test site should be html and have children', function() {
    (response).should.be.an.instanceOf(Object).and.have.property('mimetype', 'text/html');
    (response).should.have.property('children');
  });
  it('Children of top object should be an array of size 5', function() {
    (response.children).should.be.a.Array().and.have.size(5);
  });
  it('There should be a child of url pic.jpg with a mimetype of image/jpeg', function() {
    (response.children.find(function(e) {
      return e.url === 'http://casperoakley.com/pic.jpg';
    })).should.be.a.Object().and.have.property('mimetype', 'image/jpeg');
  });
  it('There should be a child with url page3.html with a set of children of length 2', function() {
    (response.children.find(function(e) {
      return e.url === 'http://casperoakley.com/tests/test1/directory/page3.html';
    })).should.be.a.Object().and.have.property('children').and.have.size(2);
  });
});

describe('All smaller tests for baetica-seguros.com should pass.', function() {
  var response;
  before(function(done) {
    scraper.scrape('http://baetica-seguros.com/uk/index.html', 'baetica-seguros.com', -1, function(err, res) {
      response = res;
      done();
    });
  });
 
  it('Top object for test site should be html and have children', function() {
    (response).should.be.an.instanceOf(Object).and.have.property('mimetype', 'text/html');
    (response).should.have.property('children');
  });
  it('Children of top object should be an array of size 12', function() {
    (response.children).should.be.a.Array().and.have.size(12);
  });
  it('There should be a child of url logo-small.ico with a mimetype of image/vnd.microsoft.icon', function() {
    (response.children.find(function(e) {
      return e.url === 'http://baetica-seguros.com/assets/logo-small.ico';
    })).should.be.a.Object().and.have.property('mimetype', 'image/vnd.microsoft.icon');
  });
  it('There should be a child with url uk/projects.html with a set of children of length 4', function() {
    (response.children.find(function(e) {
      return e.url === 'http://baetica-seguros.com/uk/projects.html';
    })).should.be.a.Object().and.have.property('children').and.have.size(4);
  });
});

//Unit tests for the bulk of the program; the set of regex instructions which decide what is a URL and what is not
describe('All unit tests for parseHtml() should pass.', function() {
  for(x in parseTests) {
    it('parseTests entry ' + x + ': ' + parseTests[x].comment, function() {
      entry = parseTests[x];
      (scraper.testParseHtml(entry.urls, entry.calledUrl, entry.targetDomain)).should.be.eql(entry.results);
    });
  }
});

