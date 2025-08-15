// serve.js
let http = require('http');
let url = require('url');
let fs = require('fs');
let path = require('path');
// you can pass the parameter in the command line. e.g. node serve.js 3000
let port = process.argv[2] || 9000;

// maps file extension to MIME types
let mime_type = {
  '.ico': 'image/x-icon',
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

let output_dir = path.join(__dirname, 'output');

let server = http.createServer(function (req, res) {
  // CORS for the upload endpoint (adjust origins as needed)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Handle JSON upload: POST /upload
  let parsed_url = url.parse(req.url);
  if (req.method === 'POST' && parsed_url.pathname === '/upload') {
    let body_chunks = [];
    req.on('data', function (chunk) {
      body_chunks.push(chunk);
      // basic guard: ~5MB limit
      if (Buffer.concat(body_chunks).length > 5 * 1024 * 1024) {
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'Payload too large' }));
        req.destroy();
      }
    });

    req.on('end', function () {
      let raw = Buffer.concat(body_chunks).toString('utf8');
      let data;
      try {
        data = JSON.parse(raw);
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'Invalid JSON body' }));
        return;
      }

      let file_name = typeof data.fileName === 'string' ? data.fileName : '';
      let contents = typeof data.contents === 'string' ? data.contents : null;

      if (!file_name || contents === null) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'Missing fileName or contents' }));
        return;
      }

      // sanitize filename: remove path separators and unsafe chars
      let safe_name = file_name.replace(/[/\\]/g, '').replace(/[^a-z0-9._-]/gi, '_');
      if (!safe_name) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'Invalid fileName' }));
        return;
      }

      let out_path = path.join(output_dir, safe_name);
      fs.writeFile(out_path, contents, 'utf8', function (err) {
        if (err) {
          console.error('Write failed:', err);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, error: 'Failed to write file' }));
          return;
        }
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      });
    });

    req.on('error', function (err) {
      console.error('Request error:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'Request error' }));
    });

    return;
  }
  if (req.method === 'GET' && parsed_url.pathname === '/output_dir_empty') {
    // ensure output dir exists
    try {
      fs.mkdirSync(output_dir, { recursive: true });
    } catch (e) {
      console.error('Failed to create output dir:', e);
    }
    fs.readdir(output_dir, function (err, files) {
      if (err) {
        // directory missing or inaccessible → treat as false
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(true));
        return;
      }
      let has_files = files.filter(f => f !== '.' && f !== '..').length > 0;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(!has_files));
    });
    return;
  }

  // Static file server (original behavior)
  let sanitize_path = path.normalize(parsed_url.pathname).replace(/^(\.\.[\/\\])+/, '');
  let pathname = path.join(__dirname, sanitize_path);

  fs.exists(pathname, function (exist) {
    if (!exist) {
      res.statusCode = 404;
      res.end(`File ${pathname} not found!`);
      return;
    }

    if (fs.statSync(pathname).isDirectory()) {
      pathname += '/index.html';
    }

    fs.readFile(pathname, function (err, data) {
      if (err) {
        res.statusCode = 500;
        res.end(`Error getting the file: ${err}.`);
      } else {
        let ext = path.parse(pathname).ext;
        res.setHeader('Content-type', mime_type[ext] || 'text/plain');
        res.end(data);
      }
    });
  });
});

server.listen(parseInt(port));
console.log(`Live at http://127.0.0.1:${port}/`);

