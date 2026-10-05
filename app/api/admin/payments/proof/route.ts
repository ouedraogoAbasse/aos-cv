import { readFile, stat } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { isValidToken, paymentPath, readRecord } from "@/lib/paymentStore";

export const runtime = "nodejs";

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

/** Sert l'image d'une preuve de paiement (réservé à l'administrateur). */
export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ ok: false, error: "Authentification requise." }, { status: 401 });
  }

  const token = request.nextUrl.searchParams.get("token") ?? "";
  if (!isValidToken(token)) {
    return NextResponse.json({ ok: false, error: "Jeton invalide." }, { status: 400 });
  }

  const record = await readRecord(token);
  if (!record?.proofFile) {
    return NextResponse.json({ ok: false, error: "Preuve introuvable." }, { status: 404 });
  }

  try {
    const filePath = paymentPath(record.proofFile);
    await stat(filePath);
    const buffer = await readFile(filePath);
    const contentType =
      CONTENT_TYPES[path.extname(filePath).toLowerCase()] ?? "application/octet-stream";

    return new NextResponse(new Uint8Array(buffer), {
      headers: { "content-type": contentType, "cache-control": "no-store" },
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Preuve introuvable." }, { status: 404 });
  }
}
