import { createHmac, createHash, timingSafeEqual } from "crypto";
import type { NextRequest, NextResponse } from "next/server";

/**
 * Authentification de l'espace administration.
 *
 * - `ADMIN_PASSWORD` : mot de passe de l'admin (obligatoire).
 * - `ADMIN_SECRET`   : secret de signature des sessions (fortement recommandé ;
 *                      à défaut, on signe avec le mot de passe).
 *
 * Le jeton de session est un HMAC signé côté serveur, stocké en cookie
 * httpOnly : aucune base de données nécessaire.
 */

export const SESSION_COOKIE = "aosc_admin";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 jours

export function isAuthConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

function getSecret(): string | null {
  return process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || null;
}

function sha256(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

/** Comparaison en temps constant (longueur indifférente). */
export function safeEquals(a: string, b: string): boolean {
  return timingSafeEqual(sha256(a), sha256(b));
}

export function checkPassword(input: string): boolean {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  return safeEquals(input, password);
}

export function createSessionToken(): string {
  const secret = getSecret();
  if (!secret) throw new Error("ADMIN_PASSWORD (ou ADMIN_SECRET) non configuré.");

  const payload = String(Date.now() + SESSION_TTL_MS);
  const signature = createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string | null | undefined): boolean {
  if (!token) return false;
  const secret = getSecret();
  if (!secret) return false;

  const [payload, signature] = token.split(".");
  if (!payload || !signature || !/^\d+$/.test(payload)) return false;

  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  if (!safeEquals(signature, expected)) return false;

  return Number(payload) > Date.now();
}

export function isAdmin(request: NextRequest): boolean {
  return verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
}

export function setSessionCookie(response: NextResponse, request: NextRequest): void {
  response.cookies.set(SESSION_COOKIE, createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: request.nextUrl.protocol === "https:",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
