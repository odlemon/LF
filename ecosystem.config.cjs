// Lysp — three Next.js surfaces from one build.
//
// Each surface is the same application in a different mode. APP_MODE is what the middleware
// reads to decide which routes it owns and where to redirect everything else. Running them as
// separate processes on separate ports is what gives each domain its own browser origin, and
// that is what keeps a firm session and a client session from ever colliding in localStorage —
// they are different origins, so they cannot see each other's storage at all.
//
// Named with a lysp- prefix and fixed ports so they can never be confused with, or collide
// with, the other eight applications already under pm2 on this host. 3001 — the obvious choice
// — is taken by job-ad-realtime; using it would have taken that service down.
//
// cwd is __dirname rather than a hardcoded path, so this works from whatever directory the
// repository is checked out into. The deploy script builds in place and reloads this file.
const path = require("path");

const surface = (name, port, mode, memory) => ({
  name,
  cwd: __dirname,
  script: path.join(__dirname, "node_modules/next/dist/bin/next"),
  args: `start -p ${port}`,
  instances: 1,
  autorestart: true,
  max_memory_restart: memory,
  env: { NODE_ENV: "production", APP_MODE: mode, PORT: String(port) },
});

module.exports = {
  apps: [
    surface("lysp-landing", 3020, "landing", "600M"),
    // The firm application carries the analytics and pricing screens, which hold the most in
    // memory, so it gets the larger ceiling.
    surface("lysp-app", 3021, "firm", "800M"),
    surface("lysp-portal", 3022, "portal", "600M"),
  ],
};
