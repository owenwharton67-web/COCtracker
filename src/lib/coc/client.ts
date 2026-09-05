// Thin client for the official Clash of Clans API
// (https://developer.clashofclans.com). See README.md for the full picture
// of what this API does and does not expose - in short: army/hero/spell/
// equipment levels and account stats, yes; building levels, resources on
// hand, magic items, and Gold Pass status, no.

export class CocApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = "CocApiError";
  }
}

function baseUrl(): string {
  // Override with the RoyaleAPI proxy (https://cocproxy.royaleapi.dev/v1)
  // if you're running the sync job somewhere without a fixed IP - see
  // README.md "Deployment and the IP whitelist problem".
  return process.env.COC_API_BASE_URL?.trim() || "https://api.clashofclans.com/v1";
}

function authToken(): string {
  const token = process.env.COC_API_TOKEN?.trim();
  if (!token) {
    throw new Error(
      "COC_API_TOKEN is not set. Create one at https://developer.clashofclans.com and add it to .env",
    );
  }
  return token;
}

// Player/clan tags start with '#' and must be percent-encoded in the URL.
export function encodeTag(tag: string): string {
  const withHash = tag.startsWith("#") ? tag : `#${tag}`;
  return encodeURIComponent(withHash.toUpperCase());
}

async function cocFetch<T>(path: string): Promise<T> {
  const url = `${baseUrl()}${path}`;
  let res: Response;
  try {
    res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${authToken()}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });
  } catch (err) {
    throw new CocApiError(
      `Network error contacting Clash of Clans API: ${(err as Error).message}`,
      0,
    );
  }

  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = await res.text().catch(() => undefined);
    }

    const hint =
      res.status === 403
        ? " (most likely cause: this request's IP address isn't in the token's allowed IP list - see README.md)"
        : res.status === 429
          ? " (rate limited - the sync interval may be too aggressive, or another process is sharing this token)"
          : res.status === 503
            ? " (Clash of Clans API is in scheduled maintenance)"
            : "";

    throw new CocApiError(`Clash of Clans API request failed: ${res.status} ${res.statusText}${hint}`, res.status, body);
  }

  return res.json() as Promise<T>;
}

export interface CocUnitRef {
  name: string;
  level: number;
  maxLevel: number;
  village: "home" | "builderBase";
  equipment?: CocUnitRef[];
}

export interface CocPlayer {
  tag: string;
  name: string;
  townHallLevel: number;
  townHallWeaponLevel?: number;
  expLevel: number;
  trophies: number;
  bestTrophies: number;
  warStars: number;
  attackWins: number;
  defenseWins: number;
  builderHallLevel?: number;
  builderBaseTrophies?: number;
  bestBuilderBaseTrophies?: number;
  donations: number;
  donationsReceived: number;
  clanCapitalContributions: number;
  role?: string;
  warPreference?: string;
  league?: { name: string };
  builderBaseLeague?: { name: string };
  legendStatistics?: { legendTrophies: number; currentSeason?: { rank?: number } };
  clan?: { tag: string; name: string };
  heroes: CocUnitRef[];
  heroEquipment: CocUnitRef[];
  troops: CocUnitRef[];
  spells: CocUnitRef[];
  achievements?: unknown[];
}

export interface CocClan {
  tag: string;
  name: string;
  clanLevel: number;
  members: number;
  warLeague?: { name: string };
  warWins?: number;
  warWinStreak?: number;
  clanCapital?: { capitalHallLevel: number };
}

export async function getPlayer(tag: string): Promise<CocPlayer> {
  return cocFetch<CocPlayer>(`/players/${encodeTag(tag)}`);
}

export async function getClan(tag: string): Promise<CocClan> {
  return cocFetch<CocClan>(`/clans/${encodeTag(tag)}`);
}
