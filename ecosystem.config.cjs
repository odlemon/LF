/** PM2 config — Lysp frontend on dedicated port (does not touch other apps). */
module.exports = {
  apps: [
    {
      name: "lysp-frontend",
      cwd: "/var/www/lysp-frontend",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3010 -H 0.0.0.0",
      instances: 1,
      autorestart: true,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: "3010",
      },
    },
  ],
};
