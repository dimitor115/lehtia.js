/*
The core of this simple node.js static server is fork of : https://developer.mozilla.org/en-US/docs/Learn/Server-side/Node_server_without_framework
 */

const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const port = process.argv[2] || 9000;
const map = {
  '.ico': 'image/x-icon',
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.doc': 'application/msword'
};

http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  const pathname = `.${url.parse(req.url).pathname}`;

  if (isClientRequestingForFile(pathname)) {
    fs.access(pathname, err => {
      if (err) {
        res.statusCode = 404;
        res.end(`File ${pathname} not found!`);
      } else {
        sendFile(res, pathname, ext);
      }
    });
  } else {
    fs.stat(pathname, (err, stats) => {
      if (err) {
        res.statusCode = 500;
        res.end(`Error during processing ${pathname}`)
      } else {
        if (stats.isDirectory()) {
          sendFile(res, pathname + '/index.html', '.html'); //TODO: checking if index.html exist 
        }
      }
    })
  }
}).listen(parseInt(port));
console.log(`Server listening on port ${port}`);

function sendFile(res, pathname, ext) {
  fs.readFile(pathname, (err, data) => {
    if (err) {
      res.statusCode = 500;
      res.end(`Error getting the file: ${err}.`);
    } else {
      res.setHeader('Content-type', map[ext] || 'text/plain');
      setCors(res);
      res.end(data);
    }
  });
}

function setCors(res) {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);
}

function isClientRequestingForFile(pathname) {
  return path.parse(pathname).ext
}

