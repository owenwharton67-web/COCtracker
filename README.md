# CoC Base Tracker

A personal Clash of Clans dashboard: syncs your account from the official
Clash of Clans API on a ~3 minute cadence, tracks everything the API
*doesn't* expose (building levels, resources on hand, magic items, Gold
Pass), and turns all of it into a ranked "what to upgrade next" plan aimed
at maxing your current Town Hall (and whichever one you push to next) as
efficiently as possible.

## What the Clash of Clans API actually gives you

Read this before expecting more than it can deliver - it shaped every
design decision in this app.

The official API (`developer.clashofclans.com`) exposes a **snapshot of
your public profile**, not a live feed of your game state. Concretely:

**Available, and synced automatically every ~3 minutes:**
- Town Hall level (+ weapon level), experience level
- Trophies, best trophies, league, Legend League rank
- War stars, attack/defense wins, war preference
- Builder Base Town Hall level and trophies
- Clan Capital contribution total
- Clan membership/role
- The level and API-computed cap (`maxLevel`, already Town-Hall-gated) of
  every hero, hero equipment piece, troop, siege machine, spell, and pet
  you've unlocked

**Not available from any public API, at all:**
- Resources currently sitting in Gold/Elixir/Dark Elixir storage
- Magic item inventory (Books, Runes, Hammers, potions, Ore)
- Gold Pass status/tier
- The level of any building except the Town Hall itself - no defenses, no
  resource buildings, no army buildings, no traps, no walls
- Active upgrade timers, builder availability, shield status

That second list is most of what you'd need to compute an exact rush-order
plan. So this app tracks it the only way it can: **you enter it**, on the
Resources & items and Buildings pages, whenever it drifts from reality.
It's not real-time for that half of the picture, but it doesn't need to be
- building levels change on the order of hours to days, not minutes.

## The upgrade plan's honesty policy

Exact per-level upgrade costs for every troop/spell/hero/building at every
Town Hall would be thousands of numbers, they drift with balance patches,
and this app doesn't have a verified, current source for all of them.
Rather than presenting fabricated numbers as fact, the plan (`/plan`) does
two things:

1. **Currency and relative priority are real, tracked knowledge** - which
   resource type an item costs, and whether heroes/resource buildings/lab
   research matter more than walls, is stable game design, not a number
   that drifts (`src/data/currency.ts`, `src/data/building-catalog.ts`).
2. **Exact costs come from your own logged history.** The Upgrade Log
   (`/log`) lets you record the real cost/time the game showed you for a
   specific level jump. Once logged, that exact number is used for that
   item from then on (`src/lib/optimizer/cost.ts`). Until you've logged an
   item, the plan uses a generic smooth cost curve
   (`src/data/cost-model.ts`) clearly marked "approx." - good enough to
   rank "is this currently cheap and fast relative to my other options,"
   not to reserve exact resources against.

The more you use `/log`, the more of the plan becomes exact instead of
approximate.

## Stack

Next.js 16 (App Router) + TypeScript + Tailwind CSS, SQLite via Prisma 7
(driver adapter: `@prisma/adapter-better-sqlite3`) - a single file-based
database, no external DB service needed for a single-player app like this.

## Local development

```bash
npm install                  # also runs `prisma generate` (postinstall)
cp .env.example .env         # fill in COC_API_TOKEN, COC_PLAYER_TAG
npx prisma migrate dev       # create the local dev.db and apply migrations
npm run dev                  # http://localhost:3000
```

Then, in another terminal, either trigger a sync from the Sync status page
in the browser, or run the standalone loop:

```bash
npm run poll                 # syncs every 3 minutes, Ctrl+C to stop
```

### Getting a CoC API token

1. Create a (free) account at <https://developer.clashofclans.com>.
2. Create a key, and enter the **IP address that will actually make the
   requests** - see "Deployment and the IP allowlist problem" below before
   picking one.
3. Find your player tag in-game (Settings, top-left under your name) - it
   looks like `#ABC123XYZ`. Put it in `COC_PLAYER_TAG` in `.env`.

Treat the token like a password: it's a bearer credential with no
per-request scoping beyond the IP allowlist. Don't paste it into chat
tools, commit it, or share screenshots that include it. If it's ever been
exposed, regenerate it from the developer portal.

## Deployment and the IP allowlist problem

CoC API tokens are locked to specific IP addresses at creation time - a
request from any other IP gets a `403`. This is the single biggest
constraint on how you can run the 3-minute sync job. Three real options:

1. **Self-host somewhere with a static IP** (a home server, Raspberry Pi,
   or small VPS). Whitelist that IP on the token, then either run
   `npm run poll` as a long-lived process (systemd, pm2, a tmux session)
   or point an external scheduler at `/api/cron/sync`. Simplest to reason
   about; the app's default SQLite setup is built for exactly this.
2. **Use a static-IP outbound proxy in front of the CoC API** - the
   community-run RoyaleAPI proxy, which exists specifically to solve this
   problem for dynamic-IP hosts like Vercel/Railway. Whitelist its published
   IP (`45.79.218.79` as of writing - reconfirm at
   [docs.royaleapi.com](https://docs.royaleapi.com), since it can change) on
   your CoC API token instead of your own, and set in `.env`:
   ```
   COC_API_BASE_URL="https://proxy.royaleapi.dev/v1"
   ```
   Requests then go to `proxy.royaleapi.dev`, which forwards them to
   Supercell's real API from that whitelisted IP. Check the proxy's current
   terms/rate limits before relying on it for anything beyond personal use.
3. **Deploy to a platform with a fixed outbound IP add-on** (several
   serverless hosts sell this) and whitelist that.

Whichever you choose, `/api/cron/sync` still needs *something* to call it
every 3 minutes from that IP - Vercel Cron's minimum interval on the free
tier is daily, so a 3-minute cadence needs `scripts/poll.ts` running
continuously, or an external scheduler (cron-job.org, a GitHub Actions
scheduled workflow running on a self-hosted runner at the right IP, a
systemd timer) hitting the route. Protect the route with `CRON_SECRET` in
`.env` either way (sent as `Authorization: Bearer <secret>` or `?secret=`).

### Deploying to Railway

Railway (combined with the RoyaleAPI proxy above) is the easiest "deploy
and forget" option, since it can run `scripts/poll.ts` as an always-on
background process - no external scheduler needed.

1. New Project → Deploy from GitHub repo → this repo.
2. **Add a volume**: Settings → Volumes → new volume, mount path `/data`.
   SQLite's file needs to live outside the container's own filesystem or
   it's wiped on every redeploy.
3. **Set variables** (Variables tab): `COC_API_TOKEN`, `COC_PLAYER_TAG`,
   `COC_API_BASE_URL` (the proxy URL above, if using it),
   `DATABASE_URL=file:/data/dev.db` (note the volume path, not `./dev.db`),
   `CRON_SECRET` (any random string).
4. Once it deploys successfully: Settings → Networking → **Generate
   Domain**. That's your app's URL.
5. **Add a second service** in the same project, same repo, but override
   its start command to `npm run poll` - this is the 3-minute sync loop.
   Give it the same variables (Railway can share/reference variables
   across services in a project).

The Sync status page (`/sync`) logs every attempt, success or failure,
specifically so a `403` from a wrong IP shows up immediately instead of
failing silently in a cron log somewhere.

## Data model

- `PlayerSnapshot` - one row per sync, full history of everything the API
  returns
- `UnitLevel` - latest known level/cap of every hero/troop/spell/equipment/
  pet, upserted on every sync (what the plan reads - no need to replay
  snapshot history for "current state")
- `BuildingInstance` - manually entered building levels, grouped by
  (type, level) rather than one row per building; `capLevel` is filled in
  from what the game shows on the upgrade button
- `ResourceState`, `MagicItem`, `GoldPassState` - manually entered, singleton
  (or catalog-keyed) rows for everything else the API can't see
- `UpgradeLog` - your own record of real costs/times, overriding the
  approximate model per item (see above)
- `SyncLog` - every sync attempt, for the Sync status page

## Testing what you've built

```bash
npx tsc --noEmit             # type check
npx eslint .                 # lint
npm run build                # prisma generate + migrate deploy + next build
```

## Known limitations

- Builder Base tracking is synced (levels are stored) but not yet fed into
  the optimizer - the plan only covers the home village.
- The Laboratory/Pet House are modeled as a single shared "one non-builder
  queue" concurrency slot for simplicity; in-game they can run in parallel.
  This only affects the "Do now" vs. "Queued next" split, not the ranking.
- Hero equipment ore costs are tracked as a single pooled `ORE` currency
  rather than separate Shiny/Glowy/Starry balances, since the exact
  tier-crossing rules are one more thing prone to going stale - the
  Upgrade Log still records which ore type you actually spent.
