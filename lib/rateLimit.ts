/** Limitation de débit basique, en mémoire (par instance du serveur). */

type Window = { hits: number[] };

const store = new Map<string, Window>();

export function isRateLimited(
  key: string,
  { max = 10, windowMs = 60_000 }: { max?: number; windowMs?: number } = {},
): boolean {
  const now = Date.now();
  const entry = store.get(key);
  const hits = (entry?.hits ?? []).filter((t) => now - t < windowMs);

  if (hits.length >= max) {
    store.set(key, { hits });
    return true;
  }

  hits.push(now);
  store.set(key, { hits });

  // Purge périodique pour ne pas grossir indéfiniment.
  if (store.size > 2000) {
    for (const [k, v] of store) {
      if (v.hits.every((t) => now - t >= windowMs)) store.delete(k);
    }
  }

  return false;
}

/** Adresse IP du client (derrière un proxy, ou locale en dev). */
export function clientKey(request: { headers: Headers }, prefix = ""): string {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local";
  return `${prefix}${ip}`;
}
