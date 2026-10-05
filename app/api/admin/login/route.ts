import { NextRequest, NextResponse } from "next/server";
import { checkPassword, isAuthConfigured, setSessionCookie } from "@/lib/adminAuth";
import { clientKey, isRateLimited } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (isRateLimited(clientKey(request, "admin-login:"), { max: 5, windowMs: 60_000 })) {
    return NextResponse.json(
      { ok: false, error: "Trop de tentatives. Patientez une minute." },
      { status: 429 },
    );
  }

  if (!isAuthConfigured()) {
    return NextResponse.json(
      { ok: false, error: "ADMIN_PASSWORD n'est pas configuré sur le serveur." },
      { status: 503 },
    );
  }

  let body: { password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide." }, { status: 400 });
  }

  const password = typeof body.password === "string" ? body.password : "";
  if (!password || !checkPassword(password)) {
    return NextResponse.json({ ok: false, error: "Mot de passe incorrect." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  setSessionCookie(response, request);
  return response;
}
