/* Bao Teck Tea House — optional Node.js server.
   You do NOT need this. The website is plain files and runs on any host.
   Use this only if your host runs Node and you want security headers applied.

   Run:  node server/node/server.js     then open http://localhost:8080
*/
const http = require('http');
const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const PORT = process.env.PORT || 8080;

const TYPES = {
  '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8',
  '.js':'application/javascript; charset=utf-8', '.json':'application/json; charset=utf-8',
  '.webmanifest':'application/manifest+json; charset=utf-8',
  '.jpg':'image/jpeg', '.png':'image/png', '.svg':'image/svg+xml',
  '.webp':'image/webp', '.ico':'image/x-icon', '.txt':'text/plain; charset=utf-8',
  '.xml':'application/xml; charset=utf-8'
};

const HEADERS = {
  'X-Content-Type-Options':'nosniff',
  'X-Frame-Options':'SAMEORIGIN',
  'Referrer-Policy':'strict-origin-when-cross-origin',
  'Permissions-Policy':'geolocation=(), microphone=(), camera=(), payment=()',
  'Content-Security-Policy':
    "default-src 'self'; img-src 'self' data: https:; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; script-src 'self'; " +
    "frame-src https://www.google.com https://maps.google.com; " +
    "object-src 'none'; base-uri 'self'; form-action 'self'"
};

http.createServer((req, res) => {
  let urlPath;
  try { urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname); }
  catch { res.writeHead(400); return res.end('Bad request'); }

  if (urlPath.endsWith('/')) urlPath += 'index.html';

  // Resolve, then verify the result is still inside ROOT (blocks ../ traversal)
  const filePath = path.resolve(ROOT, '.' + urlPath);
  if (!filePath.startsWith(path.resolve(ROOT))) {
    res.writeHead(403, HEADERS); return res.end('Forbidden');
  }
  if (/[\\/]admin[\\/]/.test(filePath)) {
    res.writeHead(403, HEADERS); return res.end('The editor is not served publicly.');
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { ...HEADERS, 'Content-Type':'text/html; charset=utf-8' });
      return fs.createReadStream(path.join(ROOT, 'index.html')).pipe(res);
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      ...HEADERS,
      'Content-Type': TYPES[ext] || 'application/octet-stream',
      'Cache-Control': ext === '.json' || ext === '.html' ? 'no-cache' : 'public, max-age=604800'
    });
    res.end(data);
  });
}).listen(PORT, () => console.log('Bao Teck Tea House running at http://localhost:' + PORT));
