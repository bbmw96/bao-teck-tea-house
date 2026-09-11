#!/usr/bin/env python3
"""Bao Teck Tea House — optional Python preview server.

You do NOT need this to run the website. It is here so you can preview the
site on your own computer with the correct security headers applied.

    python3 server/python/serve.py
    then open  http://localhost:8080
"""
import http.server, socketserver, os, sys, functools

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PORT = int(os.environ.get('PORT', 8080))

CSP = ("default-src 'self'; img-src 'self' data: https:; "
       "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
       "font-src 'self' https://fonts.gstatic.com; script-src 'self'; "
       "frame-src https://www.google.com https://maps.google.com; "
       "object-src 'none'; base-uri 'self'; form-action 'self'")

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Frame-Options', 'SAMEORIGIN')
        self.send_header('Referrer-Policy', 'strict-origin-when-cross-origin')
        self.send_header('Content-Security-Policy', CSP)
        if self.path.endswith(('.json', '.html', '/')):
            self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

    def do_GET(self):
        if '/admin/' in self.path:
            self.send_error(403, 'The editor is not served publicly.')
            return
        super().do_GET()

    def log_message(self, fmt, *args):
        sys.stdout.write("  %s\n" % (fmt % args))

if __name__ == '__main__':
    os.chdir(ROOT)
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('', PORT), Handler) as httpd:
        print(f"Bao Teck Tea House running at http://localhost:{PORT}")
        print("Press Ctrl+C to stop.")
        try: httpd.serve_forever()
        except KeyboardInterrupt: print("\nStopped.")
