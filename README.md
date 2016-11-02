<!---
Note: This document is meant to be viewed via a markdown syntax renderer, e.g. via github.
-->


# Web Scraper
A mini-project to write a web scraper, which generates a site map of unique pages, along with their mime-type. Developed for gocardless.
## Prerequisites
NodeJS (recommended 6+) and NPM are required.
## Installation
To install:
`npm install`
## Usage
Simply run with `nodejs app.js` and put in the URL of the website you want a site map of.
Once the program has finished execution, a JSON site map will have been generated in the sitemaps/ folder, with the name of the domain you had entered.
## Contributing
1. Fork it
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request

## TESTING
The project itself was developed using git for version control (using a private github repo) and testing was completed using Mocha + Should.JS. A mixture of unit tests for the parsing of the HTML, and system tests against a couple of websites I host where produced and can be found in the tests folder. To run the tests, simply run `npm test`.


## Design Decisions
For this project, I decided to write the web scraper on NodeJS. This was after generating a shortlist of languages I felt comfortable with/felt where at least good fits for the job. Below I have compiled a table of these shortlisted languages, along with a set of pros and cons which led to my final decision of NodeJS:

Colons can be used to align columns.

| Language      | Pros          | Cons  |
| ------------- |:-------------:| -----:|
| Python      | Both fast and a scripting language - both speed and simple to write in; Strong http request support  | Slower than Java; Multithreading in Python is not especially straight forward; I have low familiarity with the language |
| Java      | Extremely fast processing; Strong threading support; Solid http request support | High amount of code overhead before a working model can be produced; Requires being written using threads which is normally the source of a large amount of developer mistakes; Not especially expandable - one can not simply turn the program into a web server |
| NodeJS | I have the most experience with NodeJS; Event loop allows IO to proceed in a non blocking manner - very useful if one wishes to make many http requests in parallel; NodeJS has extremely strong expandability - It is trivial include this in a website or extend it onto some other program; Portable - trivial to run on other operating systems including ARM devices | Though the event loop allows for IO in parallel, it is strictly single threaded - CPU blocking processing will stop the entire program; Can require some CPU and RAM overhead to run the V8 engine |
| BASH | Extremely little overhead on code - What you write is what happens; Can be fast if implemented correctly | Would have to use process forks - process forking has a much greater memory cost versus threads; Poor testing suites for BASH; Would only work on certain systems and would require large amount of prerequisites - Would never work on windows without cygwin |



From this list, I found that either Java or NodeJS would be most suitable. The most important area which these two languages differed in, was that NodeJS was blocking on CPU, whereas Java was not. Thus, the question was whether or not this problem would be bottle-necked on CPU or on I/O. The vast majority of the CPU comes down to the text parsing of the html documents. The vast majority of the I/O comes from the downloading of headers and bodies. 

At this point, it is obvious that the text parsing would require regex-style processing. Regex can have any complexity, depending on the regex itself. However, it is unlikely that any more complex regex than O(n) would be necessary (where n is the size of the body/payload). For downloading, of course, the complexity is O(n). However, downloading will of course be factors upon factors slower than parsing text. Therefore, it made sense to me to not use the powerhouse Java in favour of NodeJS, which I was more comfortable developing in. 

The program itself was developing for the most part as a node module, which could be attached to anything. A simple wrapper was built to ask the user for input and then to pass this input into the module. The module itself is built recursively. The module begins by downloading the headers for the given URL (using the HEAD http request). It looks at the MIME type of the file to be downloaded. If it's MIME type is anything other than 'text/html', it simply returns a packaged JSON of it. If it is 'text/html', it performs a full http GET request. From there, it takes the body, and scans through the body for any 'href=xxxxx' or 'src=xxxxx'. From there, it extracts the 'xxxxx', decides whether or not it is an absolute link. If it is a relative link, it adds the domain to the start. It then performs some other checks, including checks like checking if it is a 'mailto:' href or a 'tel:' href and removing relative pathing for folders e.g. 'uk/../fr/hello.html' should actually just be 'fr/hello.html'. Once it has a full list of links, it checks each link to ensure it has not explored it before. This is to prevent it from getting stuck in a loop. It then, in parallel, recursively runs itself for each of these links and, once each of those links are done it compiles them together into a JSON.


## Interesting/Challenging Areas

I found one of the more interesting areas which I worked through was surrounding loop detection. The issue being that it is possible in modern web servers for a loop to be created, where for example, /foo links to /bar, which in turn links to /foo. This can build up an extremely long URL, looking something like /foo/bar/foo/bar/foo...
After thinking about methods to prevent I realised a critical mistake I had made in this problem. It is extremely similar to the Halting problem, wherein it is impossible to know for certain that every level deeper you go will definitely have content that you have already explored. For example, it is possible in modern web server programs to produce a completely different website at /foo/bar/foo/bar/foo/bar/foo/bar, however any loop detection would be unable to gather the assets on that page, as it would be assumed it would be the same as the previous four 'bar' pages. In an effort to combat it, the module has been implemented with an additional parameter, a depth limiter, which will seize to explore if it has recursed far enough.

Another interesting area of the project was that I was able to explore some of the slightly less used features of an HTTP request. For example, I rarely have the opportunity to use the HEAD request, or explore the 'content-type' header.
