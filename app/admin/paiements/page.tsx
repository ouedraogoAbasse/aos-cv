"use client";

/* La preuve est servie par une API authentifiée (cookie httpOnly) avec des
   dimensions fixes : `next/image` ne saurait pas la traiter sans surcoût. */
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, LogOut, RefreshCw, ShieldAlert, XCircle } from "lucide-react";
import { PAYMENT_AMOUNT, PAYMENT_CURRENCY, PAYMENT_LABELS, isPaymentMethod, type PaymentStatus } from "@/lib/payment";

type Payment = {
  token: string;
  method: string;
  name: string;
  phone: string;
  reference: string;
  amount: number;
  currency: string;
  createdAt: string;
  validatedAt?: string;
  status: PaymentStatus;
};

type Filter = "all" | PaymentStatus;

const STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "En attente",
  approved: "Validé",
  rejected: "Refusé",
};

const STATUS_CLASSES: Record<PaymentStatus, string> = {
  pending: "badge-warning",
  approved: "badge-success",
  rejected: "badge-error",
};

export default function AdminPaymentsPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [configMissing, setConfigMissing] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filter, setFilter] = useState<Filter>("pending");
  const [busy, setBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/payments", { cache: "no-store" });
      if (res.status === 401) {
        setAuthed(false);
        setPayments([]);
        return;
      }
      const data = (await res.json().catch(() => null)) as { payments?: Payment[] } | null;
      if (!res.ok || !data) {
        setActionError("Impossible de charger les paiements.");
        return;
      }
      setAuthed(true);
      setPayments(data.payments ?? []);
    } catch {
      setActionError("Serveur injoignable. Réessayez.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Chargement initial : le fetch est asynchrone, aucun `setState` ne
    // s'exécute pendant le rendu de l'effet (seulement après la réponse).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const refresh = () => {
    setLoading(true);
    void load();
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoginError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        if (res.status === 503) setConfigMissing(true);
        setLoginError(data?.error ?? "Connexion refusée.");
        return;
      }
      setPassword("");
      await load();
    } catch {
      setLoginError("Serveur injoignable.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => undefined);
    setAuthed(false);
    setPayments([]);
  };

  const setStatus = async (token: string, status: PaymentStatus) => {
    setBusy(token);
    setActionError(null);
    try {
      const res = await fetch("/api/admin/payments/status", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, status }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setActionError(data?.error ?? "Mise à jour impossible.");
        return;
      }
      const data = (await res.json()) as { payment?: Payment };
      if (data.payment) {
        setPayments((current) =>
          current.map((item) => (item.token === token ? data.payment! : item)),
        );
      }
    } catch {
      setActionError("Serveur injoignable.");
    } finally {
      setBusy(null);
    }
  };

  /* ------------------------------ Connexion ----------------------------- */

  if (authed === null) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-base-100 p-6 text-base-content">
        <span className="loading loading-spinner loading-lg text-primary" />
      </main>
    );
  }

  if (authed === false) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-base-100 p-6 text-base-content">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm rounded-3xl border border-base-300 bg-base-200 p-8 shadow-xl"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-content">
              <ShieldAlert className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-lg font-black">Administration</h1>
              <p className="text-sm text-base-content/60">Validation des paiements AOSCV</p>
            </div>
          </div>

          <label className="form-control w-full">
            <span className="mb-2 text-sm font-medium text-base-content/70">
              Mot de passe <span className="text-base-content/40">(saisie affichée)</span>
            </span>
            <input
              // Champ volontairement en clair : le mot de passe généré est long
              // et l'utilisateur doit pouvoir vérifier ce qu'il tape.
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input input-bordered w-full font-mono"
              autoComplete="off"
              spellCheck={false}
              autoFocus
              required
            />
          </label>

          {loginError && (
            <p role="alert" className="mt-3 text-sm text-error">
              {loginError}
            </p>
          )}

          {configMissing && (
            <div className="mt-4 rounded-2xl bg-warning/15 p-4 text-sm text-warning">
              <p className="font-black">Variable manquante sur le serveur</p>
              <ol className="mt-2 list-decimal space-y-1 pl-4">
                <li>
                  Ouvrez votre service sur <span className="font-semibold">Render</span> → onglet{" "}
                  <span className="font-semibold">Environment</span>.
                </li>
                <li>
                  Ajoutez une variable{" "}
                  <code className="rounded bg-warning/20 px-1 font-mono">ADMIN_PASSWORD</code> avec
                  le mot de passe de votre choix.
                </li>
                <li>
                  Cliquez <span className="font-semibold">Save</span> (Render redéploie), puis
                  rechargez cette page.
                </li>
              </ol>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary mt-5 w-full">
            {loading ? <span className="loading loading-spinner loading-sm" /> : "Se connecter"}
          </button>
        </form>
      </main>
    );
  }

  /* ------------------------------ Tableau de bord ----------------------- */

  const counts: Record<Filter, number> = {
    all: payments.length,
    pending: payments.filter((p) => p.status === "pending").length,
    approved: payments.filter((p) => p.status === "approved").length,
    rejected: payments.filter((p) => p.status === "rejected").length,
  };

  const visible = filter === "all" ? payments : payments.filter((p) => p.status === filter);

  const tabs: { key: Filter; label: string }[] = [
    { key: "pending", label: "En attente" },
    { key: "approved", label: "Validés" },
    { key: "rejected", label: "Refusés" },
    { key: "all", label: "Tous" },
  ];

  return (
    <main className="min-h-screen bg-base-100 p-4 text-base-content sm:p-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black">Paiements</h1>
            <p className="text-sm text-base-content/60">
              Validez une preuve pour activer le téléchargement du client.
            </p>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-ghost btn-sm" onClick={refresh}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Actualiser
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => void handleLogout()}>
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Déconnexion
            </button>
          </div>
        </header>

        <div className="mb-6 flex flex-wrap gap-2" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={filter === tab.key}
              onClick={() => setFilter(tab.key)}
              className={`btn btn-sm ${filter === tab.key ? "btn-primary" : "btn-ghost border border-base-300"}`}
            >
              {tab.label}
              <span className="badge badge-sm">{counts[tab.key]}</span>
            </button>
          ))}
        </div>

        {actionError && (
          <div role="alert" className="mb-4 rounded-2xl bg-error/10 p-4 text-sm text-error">
            {actionError}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-base-300 p-12 text-center text-base-content/60">
            Aucun paiement dans cette catégorie.
          </div>
        ) : (
          <ul className="space-y-4">
            {visible.map((payment) => (
              <li
                key={payment.token}
                className="rounded-3xl border border-base-300 bg-base-200 p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`badge ${STATUS_CLASSES[payment.status]}`}>
                        {STATUS_LABELS[payment.status]}
                      </span>
                      <span className="font-bold">{payment.name}</span>
                      <span className="text-sm text-base-content/60">{payment.phone}</span>
                    </div>
                    <p className="text-sm text-base-content/70">
                      {isPaymentMethod(payment.method)
                        ? PAYMENT_LABELS[payment.method]
                        : payment.method}{" "}
                      · Réf. <span className="font-mono">{payment.reference}</span>
                    </p>
                    <p className="text-xs text-base-content/50">
                      Reçu le {new Date(payment.createdAt).toLocaleString("fr-FR")}
                      {payment.validatedAt
                        ? ` · traité le ${new Date(payment.validatedAt).toLocaleString("fr-FR")}`
                        : ""}
                    </p>
                    <p className="text-xl font-black text-primary">
                      {(payment.amount || PAYMENT_AMOUNT).toLocaleString("fr-FR")}{" "}
                      {payment.currency || PAYMENT_CURRENCY}
                    </p>
                  </div>

                  <a
                    href={`/api/admin/payments/proof?token=${payment.token}`}
                    target="_blank"
                    rel="noreferrer"
                    title="Voir la preuve en grand"
                    className="shrink-0"
                  >
                    <img
                      src={`/api/admin/payments/proof?token=${payment.token}`}
                      alt={`Preuve de paiement de ${payment.name}`}
                      className="h-28 w-28 rounded-2xl border border-base-300 object-cover"
                      loading="lazy"
                    />
                  </a>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn btn-success btn-sm"
                    disabled={busy === payment.token || payment.status === "approved"}
                    onClick={() => void setStatus(payment.token, "approved")}
                  >
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    Valider
                  </button>
                  <button
                    type="button"
                    className="btn btn-error btn-outline btn-sm"
                    disabled={busy === payment.token || payment.status === "rejected"}
                    onClick={() => void setStatus(payment.token, "rejected")}
                  >
                    <XCircle className="h-4 w-4" aria-hidden="true" />
                    Refuser
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
