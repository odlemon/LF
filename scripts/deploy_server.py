#!/usr/bin/env python3
"""Deploy Lysp frontend to isolated path/port without touching other projects.

Credentials come from the environment only. Never hardcode passwords here.

  set LYSP_DEPLOY_HOST=...
  set LYSP_DEPLOY_USER=root
  set LYSP_DEPLOY_PASSWORD=...
  python scripts/deploy_server.py
"""

from __future__ import annotations

import os
import paramiko
import sys
import textwrap

HOST = os.environ.get("LYSP_DEPLOY_HOST", "").strip()
USER = os.environ.get("LYSP_DEPLOY_USER", "root").strip()
PASSWORD = os.environ.get("LYSP_DEPLOY_PASSWORD", "").strip()
APP_DIR = os.environ.get("LYSP_DEPLOY_APP_DIR", "/var/www/lysp-frontend").strip()
REPO = os.environ.get("LYSP_DEPLOY_REPO", "https://github.com/odlemon/LF.git").strip()
PORT = int(os.environ.get("LYSP_DEPLOY_PORT", "3010"))


def run(client: paramiko.SSHClient, cmd: str, timeout: int = 600) -> tuple[int, str, str]:
    print(f"\n$ {cmd}")
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    exit_code = stdout.channel.recv_exit_status()
    out = stdout.read().decode("utf-8", errors="replace")
    err = stderr.read().decode("utf-8", errors="replace")
    if out.strip():
        print(out.rstrip())
    if err.strip():
        print(err.rstrip(), file=sys.stderr)
    return exit_code, out, err


def main() -> int:
    if not HOST or not PASSWORD:
        print(
            "Missing LYSP_DEPLOY_HOST or LYSP_DEPLOY_PASSWORD in the environment.",
            file=sys.stderr,
        )
        return 2

    action = sys.argv[1] if len(sys.argv) > 1 else "deploy"

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, username=USER, password=PASSWORD, timeout=30)

    if action == "inspect":
        for cmd in [
            "node -v || echo node-missing",
            "npm -v || echo npm-missing",
            "pm2 -v || echo pm2-missing",
            "ss -tlnp | head -40",
            "pm2 list || true",
            "ls -la /var/www || true",
        ]:
            run(client, cmd)
        client.close()
        return 0

    deploy_script = textwrap.dedent(
        f"""
        set -e
        export DEBIAN_FRONTEND=noninteractive

        if ! command -v node >/dev/null 2>&1; then
          curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
          apt-get install -y nodejs
        fi

        if ! command -v pm2 >/dev/null 2>&1; then
          npm install -g pm2
        fi

        mkdir -p {APP_DIR}

        if [ -d "{APP_DIR}/.git" ]; then
          cd {APP_DIR}
          git fetch origin
          git reset --hard origin/main
        else
          rm -rf {APP_DIR}
          git clone {REPO} {APP_DIR}
          cd {APP_DIR}
        fi

        npm ci
        npm run build

        if pm2 describe lysp-frontend >/dev/null 2>&1; then
          pm2 delete lysp-frontend || true
        fi

        pm2 start ecosystem.config.cjs
        pm2 save

        echo DEPLOY_OK
        curl -s -o /dev/null -w "HTTP_%{{http_code}}" http://127.0.0.1:{PORT}/ || true
        """
    ).strip()

    code, out, err = run(client, deploy_script, timeout=1800)
    client.close()

    if code != 0 or "DEPLOY_OK" not in out:
        print(f"Deploy failed with exit code {code}", file=sys.stderr)
        return 1

    print(f"\nDeployed at http://{HOST}:{PORT}/")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
