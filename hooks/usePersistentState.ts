"use client";

import { useCallback, useRef, useSyncExternalStore, type Dispatch, type SetStateAction } from "react";

/**
 * État React persisté dans localStorage.
 *
 * Implémenté avec `useSyncExternalStore` (et non un useEffect de lecture) :
 * - le serveur rend la valeur par défaut (`getServerSnapshot`) → pas de
 *   désynchronisation d'hydratation ;
 * - le client bascule sur la valeur stockée après le rendu, sans cascade de
 *   renders et sans `setState` dans un effet.
 */

/** Cache : `JSON.parse` doit renvoyer une référence stable, sinon React boucle. */
const cache = new Map<string, { raw: string | null; value: unknown }>();

const EVENT_NAME = "aosc:storage-change";

function readCached<T>(key: string, fallback: T): T {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(key);
  } catch {
    return fallback;
  }

  const entry = cache.get(key);
  if (entry && entry.raw === raw) return entry.value as T;

  let value: T = fallback;
  if (raw !== null) {
    try {
      value = JSON.parse(raw) as T;
    } catch {
      value = fallback;
    }
  }
  cache.set(key, { raw, value });
  return value;
}

function notify(key: string) {
  try {
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { key } }));
  } catch {
    // environment sans CustomEvent : la prochaine lecture rattrapera la valeur
  }
}

export function usePersistentState<T>(key: string, initialValue: T) {
  // Gelé au premier rendu, comme le ferait useState : valeur stable pour React.
  const fallbackRef = useRef(initialValue);

  const subscribe = useCallback(
    (onChange: () => void) => {
      const handle = (event: Event) => {
        const detail = (event as CustomEvent<{ key?: string }>).detail;
        if (!detail || detail.key === key) onChange();
      };
      window.addEventListener(EVENT_NAME, handle);
      window.addEventListener("storage", handle as EventListener);
      return () => {
        window.removeEventListener(EVENT_NAME, handle);
        window.removeEventListener("storage", handle as EventListener);
      };
    },
    [key],
  );

  const getSnapshot = useCallback(() => readCached(key, fallbackRef.current), [key]);
  const getServerSnapshot = useCallback(() => fallbackRef.current, []);

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setValue: Dispatch<SetStateAction<T>> = useCallback(
    (next) => {
      const current = readCached(key, fallbackRef.current);
      const resolved =
        typeof next === "function" ? (next as (previous: T) => T)(current) : next;

      try {
        window.localStorage.setItem(key, JSON.stringify(resolved));
      } catch {
        // quota dépassé : on garde la valeur en mémoire seulement
      }
      // Invalider le cache puis prévenir les abonnés de cette même page
      // (l'événement natif `storage` ne se déclenche que dans les autres onglets).
      cache.delete(key);
      notify(key);
    },
    [key],
  );

  return [value, setValue] as const;
}
