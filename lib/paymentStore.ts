import { mkdir, readFile, readdir, writeFile } from "fs/promises";
import path from "path";
import type { PaymentStatus } from "@/lib/payment";

export type { PaymentStatus };

/** Stockage des preuves de paiement (dossier local, ignoré par Git). */
export type PaymentRecord = {
  token: string;
  method: string;
  name: string;
  phone: string;
  reference: string;
  amount: number;
  currency: string;
  proofFile: string;
  createdAt: string;
  validUntil: string;
  status: PaymentStatus;
  validatedAt?: string;
};

const TOKEN_PATTERN = /^[a-f0-9]{64}$/;

export function isValidToken(token: string): boolean {
  return TOKEN_PATTERN.test(token);
}

/**
 * Dossier des paiements.
 * Le sous-dossier est écrit en littéral pour que Turbopack puisse statiquement
 * délimiter le périmètre tracé (sinon, tout le projet est inclus dans le build).
 */
export function paymentsDirPath(): string {
  return path.join(process.cwd(), "payments");
}

/** Chemin d'un fichier dans `payments/` (jamais de traversée de chemin). */
export function paymentPath(name: string): string {
  return path.join(process.cwd(), "payments", path.basename(name));
}

function recordPath(token: string): string {
  // `token` est validé en hexadécimal : aucun risque de traversée de chemin.
  return paymentPath(`${token}.json`);
}

export async function readRecord(token: string): Promise<PaymentRecord | null> {
  if (!isValidToken(token)) return null;
  try {
    const raw = await readFile(recordPath(token), "utf8");
    return JSON.parse(raw) as PaymentRecord;
  } catch {
    return null;
  }
}

export async function writeRecord(record: PaymentRecord): Promise<void> {
  await mkdir(paymentsDirPath(), { recursive: true });
  await writeFile(recordPath(record.token), JSON.stringify(record, null, 2));
}

/** Liste tous les paiements, du plus récent au plus ancien. */
export async function listRecords(): Promise<PaymentRecord[]> {
  try {
    const files = await readdir(paymentsDirPath());
    const records = await Promise.all(
      files
        .filter((file) => file.endsWith(".json"))
        .map(async (file) => {
          try {
            const raw = await readFile(paymentPath(file), "utf8");
            return JSON.parse(raw) as PaymentRecord;
          } catch {
            return null;
          }
        }),
    );

    return records
      .filter((record): record is PaymentRecord => record !== null && isValidToken(record.token))
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  } catch {
    return []; // dossier inexistant : aucun paiement
  }
}

export async function updateStatus(
  token: string,
  status: PaymentStatus,
): Promise<PaymentRecord | null> {
  const record = await readRecord(token);
  if (!record) return null;

  const updated: PaymentRecord = {
    ...record,
    status,
    validatedAt: new Date().toISOString(),
  };
  await writeRecord(updated);
  return updated;
}
