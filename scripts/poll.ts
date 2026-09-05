// Standalone sync loop for self-hosting (e.g. on a home server, Raspberry
// Pi, or small VPS whose IP you've whitelisted for your CoC API token).
// Run with: npm run poll
//
// This does the same work as /api/cron/sync but doesn't need a web server
// or an external scheduler hitting it - just `node`/`tsx` kept running
// (e.g. under systemd, pm2, or a screen/tmux session).
import "dotenv/config";
import { runSync } from "../src/lib/sync";

const INTERVAL_MS = 3 * 60 * 1000;

async function tick() {
  const result = await runSync();
  const timestamp = new Date().toISOString();
  if (result.success) {
    console.log(`[${timestamp}] ${result.message}`);
  } else {
    console.error(`[${timestamp}] sync failed (${result.statusCode ?? "no status"}): ${result.message}`);
  }
}

console.log(`Starting CoC sync loop, every ${INTERVAL_MS / 1000}s. Ctrl+C to stop.`);
void tick();
setInterval(() => {
  void tick();
}, INTERVAL_MS);
