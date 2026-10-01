#!/usr/bin/env python3
"""Loopback-only development server. Production uses the hardened static container."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import argparse
import sys
import time
ROOT = Path(__file__).resolve().parents[1] / 'dist'
CSP = "default-src 'none'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' data:; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'"
class Handler(SimpleHTTPRequestHandler):
    def __init__(self,*a,**kw): super().__init__(*a,directory=str(ROOT),**kw)
    def end_headers(self):
        for k,v in {'Content-Security-Policy':CSP,'X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Referrer-Policy':'no-referrer','Permissions-Policy':'camera=(), microphone=(), geolocation=(), payment=()','Cache-Control':'no-store'}.items(): self.send_header(k,v)
        super().end_headers()
    def list_directory(self,path): self.send_error(404);return None
    def log_request(self, code='-', size='-'): self.response_status=code
    def do_GET(self):
        started = time.monotonic()
        try: super().do_GET()
        finally:
            if self.server.diagnostics:
                # Resource path only: never log query strings, headers or bodies.
                print(f"GET {self.path.split('?', 1)[0]!r} status={getattr(self, 'response_status', '-')} elapsed_ms={(time.monotonic()-started)*1000:.1f}", file=sys.stderr, flush=True)
    def log_message(self,*a): pass
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--port',type=int,default=8080);p.add_argument('--diagnostics',action='store_true');a=p.parse_args()
    print(f'StemTape: http://127.0.0.1:{a.port}',flush=True)
    server=ThreadingHTTPServer(('127.0.0.1',a.port),Handler)
    server.diagnostics=a.diagnostics
    server.serve_forever()
