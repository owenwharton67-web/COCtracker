import { NextResponse } from "next/server";
import { exportSnapshot } from "@/lib/data-transfer";

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = await exportSnapshot();
  return new NextResponse(JSON.stringify(snapshot, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="coc-tracker-data.json"',
    },
  });
}
