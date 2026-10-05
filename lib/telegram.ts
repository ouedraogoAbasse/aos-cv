import { readFile } from "fs/promises";
import { PAYMENT_AMOUNT, PAYMENT_CURRENCY, PAYMENT_LABELS, type PaymentMethod } from "@/lib/payment";
import { paymentPath } from "@/lib/paymentStore";

const API_BASE = "https://api.telegram.org";

type PaymentRecord = {
  token: string;
  method: PaymentMethod;
  name: string;
  phone: string;
  reference: string;
  createdAt: string;
  proofFile?: string;
};

function isConfigured(): boolean {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
}

function buildCaption(record: PaymentRecord): string {
  return [
    "💰 *Nouveau paiement AOSCV*",
    "",
    `Nom : ${record.name}`,
    `Numéro : ${record.phone}`,
    `Opérateur : ${PAYMENT_LABELS[record.method]}`,
    `Référence : ${record.reference}`,
    `Montant : ${PAYMENT_AMOUNT.toLocaleString("fr-FR")} ${PAYMENT_CURRENCY}`,
    `Heure : ${new Date(record.createdAt).toLocaleString("fr-FR")}`,
    "",
    "Valider sur : /admin/paiements",
  ].join("\n");
}

/**
 * Envoie la preuve de paiement sur Telegram (photo + récapitulatif).
 * Fire-and-forget : une panne de Telegram ne doit jamais faire échouer le paiement.
 */
export async function notifyPaymentToTelegram(record: PaymentRecord): Promise<void> {
  if (!isConfigured()) return;

  const token = process.env.TELEGRAM_BOT_TOKEN!;
  const chatId = process.env.TELEGRAM_CHAT_ID!;
  const caption = buildCaption(record);
  const baseUrl = `${API_BASE}/bot${token}`;

  try {
    if (record.proofFile) {
      const buffer = await readFile(paymentPath(record.proofFile));

      const form = new FormData();
      form.append("chat_id", chatId);
      form.append("caption", caption);
      form.append("parse_mode", "Markdown");
      form.append("photo", new Blob([buffer], { type: "image/jpeg" }), "preuve.jpg");

      const res = await fetch(`${baseUrl}/sendPhoto`, { method: "POST", body: form });
      if (res.ok) return;
      console.warn("[telegram] sendPhoto a échoué :", res.status, await res.text());
    }

    await fetch(`${baseUrl}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: caption, parse_mode: "Markdown" }),
    });
  } catch (error) {
    console.warn("[telegram] notification impossible :", error);
  }
}
