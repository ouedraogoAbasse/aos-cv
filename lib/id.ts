/**
 * Génère un identifiant unique.
 * `crypto.randomUUID()` n'existe que dans les contextes sécurisés (https / localhost),
 * or l'app est aussi consultée via l'adresse LAN en HTTP → on prévoit un repli.
 */
export function createId(): string {
  const cryptoObj = globalThis.crypto as Crypto | undefined;

  if (cryptoObj && typeof cryptoObj.randomUUID === "function") {
    return cryptoObj.randomUUID();
  }

  if (cryptoObj && typeof cryptoObj.getRandomValues === "function") {
    const bytes = cryptoObj.getRandomValues(new Uint8Array(16));
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  }

  return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 10)}`;
}
