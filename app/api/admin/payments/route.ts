import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { listRecords } from "@/lib/paymentStore";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ ok: false, error: "Authentification requise." }, { status: 401 });
  }

  const records = await listRecords();
  return NextResponse.json(
    { ok: true, payments: records },
    { headers: { "cache-control": "no-store" } },
  );
}
