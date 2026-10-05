/**
 * Règles de paiement partagées entre le navigateur et l'API.
 * Attention : côté serveur, ces fonctions font foi — jamais celles du client.
 */

export type PaymentMethod = "orange" | "moov";

export const PAYMENT_AMOUNT = 1000;
export const PAYMENT_CURRENCY = "FCFA";

export const PAYMENT_NUMBERS: Record<PaymentMethod, string> = {
  orange: "+226 65 45 38 70",
  moov: "+226 62 13 49 70",
};

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  orange: "Orange Money",
  moov: "Telmob",
};

/** Les 8 chiffres attendus du compte qui reçoit l'argent. */
export const EXPECTED_PAYMENT_DIGITS: Record<PaymentMethod, string> = {
  orange: "65453870",
  moov: "62134970",
};

export const PAYMENT_TOKEN_STORAGE_KEY = "aosc.payment.token";
export const PAYMENT_TOKEN_TTL_DAYS = 90;

export const normalizePhone = (value: string) => value.replace(/\D/g, "");

export function isPaymentMethod(value: unknown): value is PaymentMethod {
  return value === "orange" || value === "moov";
}

export type PaymentStatus = "pending" | "approved" | "rejected";

export type PaymentInput = {
  method: PaymentMethod;
  name: string;
  phone: string;
  reference: string;
  proofType: string | null;
};

/** Validation commune. Renvoie un message d'erreur lisible, ou null si tout va bien. */
export function validatePaymentInput(input: PaymentInput): string | null {
  const { method, name, phone, reference, proofType } = input;
  const label = PAYMENT_LABELS[method];
  const enteredDigits = normalizePhone(phone);

  if (!name.trim()) {
    return "Veuillez renseigner votre nom complet avant de continuer.";
  }

  if (!enteredDigits) {
    return "Veuillez renseigner le numéro de téléphone utilisé pour le paiement.";
  }

  if (!enteredDigits.includes(EXPECTED_PAYMENT_DIGITS[method])) {
    return `Le numéro saisi ne correspond pas au compte ${label} attendu.`;
  }

  if (!reference.trim()) {
    return `Veuillez renseigner la référence de transaction ${label}.`;
  }

  if (!proofType) {
    return "Veuillez joindre une preuve de paiement avant de valider votre achat.";
  }

  if (!proofType.startsWith("image/")) {
    return "La preuve de paiement doit être une image (photo ou capture d'écran).";
  }

  return null;
}

/* ------------------------------------------------------------------ */
/* Jeton d'autorisation : stocké côté navigateur, validé par le serveur */
/* ------------------------------------------------------------------ */

export function readPaymentToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(PAYMENT_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function savePaymentToken(token: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PAYMENT_TOKEN_STORAGE_KEY, token);
  } catch {
    // stockage indisponible : le téléchargement devra être re-payé dans la session
  }
}

export function clearPaymentToken(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(PAYMENT_TOKEN_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export type TokenStatus =
  | "valid" // paiement approuvé → téléchargement autorisé
  | "pending" // preuve reçue, en attente de validation manuelle
  | "rejected" // paiement refusé par l'administrateur
  | "expired" // autorisation ancienne (> 90 jours)
  | "invalid" // jeton inconnu ou absent
  | "offline"; // serveur injoignable

/** Messages destinés à l'utilisateur pour chaque état bloquant. */
export const TOKEN_STATUS_MESSAGES: Partial<Record<TokenStatus, string>> = {
  pending:
    "Votre paiement a bien été reçu et est en cours de vérification. Le téléchargement s’activera automatiquement dès validation (généralement en moins d’une heure).",
  rejected:
    "Votre paiement a été refusé. Vérifiez la capture envoyée ou contactez-nous pour corriger le problème.",
  expired:
    "Votre autorisation de téléchargement a expiré. Reprenez le paiement pour retélécharger votre CV.",
  offline:
    "Impossible de vérifier votre paiement (connexion au serveur). Vérifiez votre connexion puis réessayez.",
  invalid: "Aucun paiement enregistré pour cette session.",
};

/**
 * Vérifie le jeton auprès du serveur.
 * Tant que l'administrateur n'a pas validé le paiement, le statut est `pending`.
 */
export async function verifyPaymentToken(token: string | null): Promise<TokenStatus> {
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return "invalid";

  try {
    const res = await fetch(`/api/payments/verify?token=${encodeURIComponent(token)}`, {
      cache: "no-store",
    });
    const data = (await res.json().catch(() => null)) as
      | { valid?: boolean; reason?: string }
      | null;

    if (res.ok && data?.valid) return "valid";

    switch (data?.reason) {
      case "pending":
      case "rejected":
      case "expired":
        return data.reason;
      default:
        return "invalid";
    }
  } catch {
    return "offline";
  }
}

/* ------------------------------- Envoi ---------------------------- */

export type SubmitPaymentResult =
  | { ok: true; token: string }
  | { ok: false; error: string };

export async function submitPayment(params: {
  method: PaymentMethod;
  name: string;
  phone: string;
  reference: string;
  proof: File;
}): Promise<SubmitPaymentResult> {
  const form = new FormData();
  form.append("method", params.method);
  form.append("name", params.name);
  form.append("phone", params.phone);
  form.append("reference", params.reference);
  form.append("proof", params.proof);

  try {
    const res = await fetch("/api/payments", { method: "POST", body: form });
    const data = (await res.json().catch(() => null)) as
      | { ok?: boolean; token?: string; error?: string }
      | null;

    if (res.ok && data?.ok && typeof data.token === "string") {
      return { ok: true, token: data.token };
    }

    return {
      ok: false,
      error: data?.error ?? "Le paiement n'a pas pu être enregistré. Réessayez dans un instant.",
    };
  } catch {
    return {
      ok: false,
      error: "Impossible de contacter le serveur. Vérifiez votre connexion puis réessayez.",
    };
  }
}
