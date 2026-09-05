import { NextRequest, NextResponse } from "next/server";
import { runSync } from "@/lib/sync";

export const dynamic = "force-dynamic";

// Trigger this every ~3 minutes from wherever your CoC API token's
// whitelisted IP actually lives - see README.md "Deployment and the IP
// whitelist problem". Vercel Cron's minimum interval on the Hobby plan is
// daily, so a 3-minute cadence needs an external scheduler (cron-job.org,
// GitHub Actions, a systemd timer, ...) hitting this URL with the secret, or
// scripts/poll.ts running as a long-lived process instead.
export async function GET(request: NextRequest) {
  const expected = process.env.CRON_SECRET?.trim();
  if (expected) {
    const provided =
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
      request.nextUrl.searchParams.get("secret");
    if (provided !== expected) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const result = await runSync();
  return NextResponse.json(result, { status: result.success ? 200 : 502 });
}
