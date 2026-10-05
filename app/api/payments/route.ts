import { randomBytes } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import {
  EXPECTED_PAYMENT_DIGITS,
  PAYMENT_TOKEN_TTL_DAYS,
  isPaymentMethod,
  normalizePhone,
  validatePaymentInput,
} from "@/lib/payment";
import { paymentPath, paymentsDirPath, writeRecord } from "@/lib/paymentStore";
import { clientKey, isRateLimited } from "@/lib/rateLimit";
import { notifyPaymentToTelegram } from "@/lib/telegram";

export const runtime = "nodejs";

const MAX_PROOF_BYTES = 8 * 1024 * 1024;
const ALLOWED_PROOF_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/jpg": ".jpg",
};

function fail(message: string, status: number) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function POST(request: NextRequest) {
  if (isRateLimited(clientKey(request, "payment:"), { max: 10, windowMs: 60_000 })) {
    return fail("Trop de tentatives. Patientez une minute puis réessayez.", 429);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail("Requête invalide (formulaire illisible).", 400);
  }

  const methodRaw = form.get("method");
  if (!isPaymentMethod(methodRaw)) {
    return fail("Moyen de paiement inconnu.", 400);
  }

  const name = String(form.get("name") ?? "").trim();
  const phone = String(form.get("phone") ?? "");
  const reference = String(form.get("reference") ?? "").trim();
  const proof = form.get("proof");
  const proofType = proof instanceof File ? proof.type : null;

  // Mêmes règles que le client, mais appliquées ici — c'est ce qui fait foi.
  const validationError = validatePaymentInput({
    method: methodRaw,
    name,
    phone,
    reference,
    proofType,
  });
  if (validationError) return fail(validationError, 400);

  if (!normalizePhone(phone).includes(EXPECTED_PAYMENT_DIGITS[methodRaw])) {
    return fail("Numéro de paiement invalide.", 400);
  }

  if (!(proof instanceof File)) {
    return fail("Preuve de paiement manquante.", 400);
  }

  const extension = ALLOWED_PROOF_TYPES[proof.type];
  if (!extension) {
    return fail("Format de preuve non accepté (JPEG, PNG, WebP ou GIF uniquement).", 400);
  }

  if (proof.size > MAX_PROOF_BYTES) {
    return fail("La preuve de paiement dépasse 8 Mo. Envoyez une image plus légère.", 413);
  }

  const token = randomBytes(32).toString("hex"); // 64 caractères hexadécimaux
  const now = Date.now();
  const proofFile = `${token}${extension}`;

  try {
    await mkdir(paymentsDirPath(), { recursive: true });
    const buffer = Buffer.from(await proof.arrayBuffer());
    await writeFile(paymentPath(proofFile), buffer);

    const record = {
      token,
      method: methodRaw,
      name,
      phone,
      reference,
      amount: 1000,
      currency: "FCFA",
      proofFile,
      createdAt: new Date(now).toISOString(),
      validUntil: new Date(now + PAYMENT_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString(),
      // Le téléchargement n'est autorisé qu'après validation manuelle.
      status: "pending" as const,
    };
    await writeRecord(record);

    // Notification Telegram (fire-and-forget) : photo + récapitulatif.
    void notifyPaymentToTelegram({ ...record, method: methodRaw });

    return NextResponse.json({ ok: true, token });
  } catch (error) {
    console.error("[payments] écriture impossible :", error);
    return fail("Enregistrement impossible pour le moment. Réessayez plus tard.", 500);
  }
}

/** Cette API n'existe qu'en POST. */
export async function GET() {
  return fail("Méthode non autorisée.", 405);
}
