"""Start the Career Assistant (Northstar Career Studio) web application.

Run this file to serve the local workspace:

    python app.py

The HTTP handler and REST API live in ``server.py``. This module is the
friendly entry point: it keeps paths stable, accepts host/port options, and
opens the app in the default browser once the server is listening.
"""

from __future__ import annotations

import argparse
import os
import sys
import threading
import webbrowser
from http.server import ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent


class LocalHTTPServer(ThreadingHTTPServer):
    """Threading server that refuses to share a port with another instance.

    Windows interprets ``SO_REUSEADDR`` as permission to bind an address that
    is already in use, so the standard ``allow_reuse_address = 1`` can let a
    second copy start silently. Turning it off keeps port conflicts visible.
    """

    if os.name == "nt":
        allow_reuse_address = False


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    """Read command-line options, falling back to environment variables."""
    parser = argparse.ArgumentParser(
        prog="app.py",
        description="Run Career Assistant locally and open it in your browser.",
    )
    parser.add_argument(
        "--host",
        default=os.getenv("CAREER_HOST", "127.0.0.1"),
        help="Network interface to bind (default: %(default)s; env: CAREER_HOST).",
    )
    parser.add_argument(
        "--port",
        type=int,
        default=int(os.getenv("CAREER_PORT", "8000")),
        help="Port to listen on (default: %(default)s; env: CAREER_PORT).",
    )
    parser.add_argument(
        "--no-browser",
        action="store_true",
        help="Start the server without opening a browser tab.",
    )
    args = parser.parse_args(argv)
    if not 0 <= args.port <= 65535:
        parser.error("--port must be between 0 and 65535.")
    return args


def browser_url(host: str, port: int) -> str:
    """Return a URL that works even when binding to every interface."""
    display_host = "127.0.0.1" if host in {"", "0.0.0.0", "::"} else host
    if ":" in display_host and not display_host.startswith("["):
        display_host = f"[{display_host}]"
    return f"http://{display_host}:{port}"


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)

    # Keep .env, the SQLite database, and web assets anchored to the project
    # folder even when the app is launched from somewhere else.
    os.chdir(ROOT)
    if str(ROOT) not in sys.path:
        sys.path.insert(0, str(ROOT))

    try:
        from server import Handler
    except ModuleNotFoundError as exc:
        print(
            f"Career Assistant is missing the '{exc.name}' package. "
            "Install dependencies with: pip install -r requirements.txt",
            file=sys.stderr,
        )
        return 1

    try:
        httpd = LocalHTTPServer((args.host, args.port), Handler)
    except OSError as exc:
        print(
            f"Could not start Career Assistant on {args.host}:{args.port} ({exc}).",
            file=sys.stderr,
        )
        print("Try another port, for example: python app.py --port 8080", file=sys.stderr)
        return 1

    port = httpd.server_address[1]
    url = browser_url(args.host, port)
    print(f"Career Assistant running at {url}", flush=True)
    print("Press Ctrl+C to stop the server.", flush=True)

    if not args.no_browser:
        timer = threading.Timer(0.75, webbrowser.open, args=(url,))
        timer.daemon = True
        timer.start()

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping Career Assistant...")
    finally:
        httpd.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
