import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { type PaymentStatus, isValidToken, updateStatus } from "@/lib/paymentStore";

export const runtime = "nodejs";

const ALLOWED: PaymentStatus[] = ["pending", "approved", "rejected"];

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ ok: false, error: "Authentification requise." }, { status: 401 });
  }

  let body: { token?: unknown; status?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide." }, { status: 400 });
  }

  const token = typeof body.token === "string" ? body.token : "";
  const status = typeof body.status === "string" ? (body.status as PaymentStatus) : null;

  if (!isValidToken(token) || !status || !ALLOWED.includes(status)) {
    return NextResponse.json({ ok: false, error: "Paramètres invalides." }, { status: 400 });
  }

  const record = await updateStatus(token, status);
  if (!record) {
    return NextResponse.json({ ok: false, error: "Paiement introuvable." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, payment: record }, { headers: { "cache-control": "no-store" } });
}
