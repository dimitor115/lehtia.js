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

http.createServer(handleRequest).listen(parseInt(port));
console.log(`Server listening on port ${port}`);

function handleRequest(req, res) {
  console.log(`${req.method} ${req.url}`);
  const pathname = `.${url.parse(req.url).pathname}`;

  if (isClientRequestingForFile(pathname)) {
    sendFile(res, pathname)
      .catch(() => sendError(res, pathname))
  } else {
    isDirectory(pathname)
      .then(() => sendFile(res, pathname + '/index.html'))
      .catch(() => sendError(res, pathname + '/index.html'))
  }
}

function isDirectory(pathname) {
  return new Promise((resolve, reject) => {
    fs.stat(pathname, (err, stats) => {
      if (err) {
        reject(err)
      } else {
        if (stats.isDirectory()) {
          resolve()
        } else {
          reject()
        }
      }
    })
  })
}

function sendError(res, pathname) {
  res.statusCode = 404;
  res.end(`File ${pathname} not found!`);
}

function sendFile(res, pathname) {
  return new Promise((resolve, reject) => {
    fs.readFile(pathname, (err, data) => {
      if (err) {
        reject(err)
      } else {
        res.setHeader('Content-type', map[path.parse(pathname).ext] || 'text/plain');
        setCors(res);
        res.end(data);
        resolve()
      }
    });
  })
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

