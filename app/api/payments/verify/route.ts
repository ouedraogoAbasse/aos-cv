import { stat } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { paymentPath, isValidToken, readRecord } from "@/lib/paymentStore";

export const runtime = "nodejs";

const NO_STORE = { "cache-control": "no-store" };

/**
 * Vérifie qu'un jeton de paiement est autorisé à télécharger le PDF.
 *
 * Un jeton n'est `valid` que si :
 * - le paiement existe,
 * - il a été **approuvé manuellement** par l'administrateur,
 * - il n'est pas expiré,
 * - la preuve image est toujours présente sur le disque.
 *
 * Les autres cas renvoient `reason` (`pending`, `rejected`, `expired`, `unknown`)
 * pour que le navigateur puisse afficher un message précis.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";

  if (!isValidToken(token)) {
    return NextResponse.json(
      { valid: false, reason: "malformed" },
      { status: 400, headers: NO_STORE },
    );
  }

  const record = await readRecord(token);
  if (!record) {
    return NextResponse.json({ valid: false, reason: "unknown" }, { headers: NO_STORE });
  }

  if (Date.parse(record.validUntil) < Date.now()) {
    return NextResponse.json({ valid: false, reason: "expired" }, { headers: NO_STORE });
  }

  if (record.status !== "approved") {
    return NextResponse.json({ valid: false, reason: record.status }, { headers: NO_STORE });
  }

  try {
    // La preuve doit toujours être là (sinon, paiement non vérifiable).
    await stat(paymentPath(record.proofFile));
  } catch {
    return NextResponse.json({ valid: false, reason: "missing-proof" }, { headers: NO_STORE });
  }

  return NextResponse.json({ valid: true }, { headers: NO_STORE });
}
