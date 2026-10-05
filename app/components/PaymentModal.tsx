"use client";

import { PAYMENT_AMOUNT, PAYMENT_CURRENCY, PAYMENT_LABELS, PAYMENT_NUMBERS, type PaymentMethod } from "@/lib/payment";
import { useCV } from "@/state/CVContext";

function dialogClose(id: string) {
  const dialog = document.getElementById(id) as HTMLDialogElement | null;
  if (dialog?.open) dialog.close();
}

function dialogOpen(id: string) {
  const dialog = document.getElementById(id) as HTMLDialogElement | null;
  dialog?.showModal();
}

export default function PaymentModal() {
  const { payment, setPayment, paymentError, isSubmittingPayment, confirmPayment } = useCV();

  const label = PAYMENT_LABELS[payment.method];

  const handleSubmit = async () => {
    const confirmed = await confirmPayment();
    if (!confirmed) return;

    // Le paiement est enregistré côté serveur : il reste à le valider
    // manuellement depuis /admin/paiements (le PDF ne s'ouvre pas encore).
    dialogClose("payment_modal");
    dialogOpen("payment_success_modal");
  };

  return (
    <>
      <dialog id="payment_modal" className="modal">
        <div className="modal-box max-h-[90vh] max-w-2xl overflow-x-auto overflow-y-auto rounded-[2rem] border border-primary/20 bg-base-100 p-0">
          <form method="dialog">
            <button className="btn btn-circle btn-ghost btn-sm absolute right-2 top-2" aria-label="Fermer">
              ✕
            </button>
          </form>

          <div className="bg-gradient-to-r from-primary to-secondary p-6 text-primary-content">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] opacity-90">
              Paiement requis
            </p>
            <h3 className="mt-3 text-2xl font-black">Facture AOSCV</h3>
          </div>

          <div className="p-6">
            <div className="rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5 p-4">
              <div className="flex items-center justify-between gap-3 text-sm text-base-content/70">
                <span>Produit</span>
                <span className="font-semibold text-base-content">Téléchargement PDF CV</span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 text-sm text-base-content/70">
                <span>Montant</span>
                <span className="text-xl font-black text-primary">
                  {PAYMENT_AMOUNT.toLocaleString("fr-FR")} {PAYMENT_CURRENCY}
                </span>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {(Object.keys(PAYMENT_NUMBERS) as PaymentMethod[]).map((method) => (
                <label
                  key={method}
                  className="flex cursor-pointer items-center gap-3 rounded-2xl border border-base-300 p-3 transition hover:border-primary/40 hover:bg-primary/5"
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    className="radio radio-primary"
                    checked={payment.method === method}
                    onChange={() => setPayment((current) => ({ ...current, method }))}
                  />
                  <div>
                    <div className="font-semibold">{PAYMENT_LABELS[method]}</div>
                    <div className="text-sm text-base-content/70">{PAYMENT_NUMBERS[method]}</div>
                  </div>
                </label>
              ))}
            </div>

            <div className="mt-5 grid min-w-[22rem] gap-3 md:grid-cols-2">
              <label className="form-control w-full">
                <span className="mb-2 text-sm font-medium text-base-content/70">
                  Nom complet <span className="text-error">*</span>
                </span>
                <input
                  type="text"
                  value={payment.name}
                  onChange={(e) => setPayment((c) => ({ ...c, name: e.target.value }))}
                  placeholder="Nom complet"
                  autoComplete="name"
                  className="input input-bordered w-full"
                />
              </label>

              <label className="form-control w-full">
                <span className="mb-2 text-sm font-medium text-base-content/70">
                  Numéro utilisé pour le dépôt <span className="text-error">*</span>
                </span>
                <input
                  type="tel"
                  value={payment.phone}
                  onChange={(e) => setPayment((c) => ({ ...c, phone: e.target.value }))}
                  placeholder="Ex : 65 45 38 70"
                  autoComplete="tel"
                  className="input input-bordered w-full"
                />
              </label>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-base-content/70">
                Référence de transaction {label} <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={payment.reference}
                onChange={(e) => setPayment((c) => ({ ...c, reference: e.target.value }))}
                placeholder={payment.method === "orange" ? "Ex : OM-2458" : "Ex : TM-2458"}
                className="input input-bordered w-full"
              />
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-base-content/70">
                Preuve de paiement <span className="text-error">*</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(event) =>
                  setPayment((c) => ({ ...c, proof: event.target.files?.[0] ?? null }))
                }
                className="file-input file-input-bordered file-input-primary w-full"
              />
              {payment.proof && (
                <p className="mt-2 text-xs text-base-content/60">
                  Fichier sélectionné : {payment.proof.name}
                </p>
              )}
              <p className="mt-2 text-xs text-base-content/60">
                Capture d’écran du reçu {label} montrant le numéro {PAYMENT_NUMBERS[payment.method]}{" "}
                et la référence de transaction.
              </p>
            </div>

            <div className="mt-5 rounded-2xl bg-base-200 p-4 text-sm text-base-content/80">
              <p>
                Montant à payer :{" "}
                <span className="font-black text-primary">
                  {PAYMENT_AMOUNT.toLocaleString("fr-FR")} {PAYMENT_CURRENCY}
                </span>
              </p>
              <p className="mt-1">
                Recevez le paiement sur : <span className="font-semibold">{label}</span>
              </p>
              <p className="mt-1">
                Numéro : <span className="font-semibold">{PAYMENT_NUMBERS[payment.method]}</span>
              </p>
            </div>

            {paymentError && (
              <div role="alert" className="mt-4 rounded-2xl bg-error/10 p-4 text-sm text-error">
                {paymentError}
              </div>
            )}

            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmittingPayment}
                className="btn btn-primary btn-lg flex-1"
              >
                {isSubmittingPayment ? (
                  <>
                    <span className="loading loading-spinner loading-sm" aria-hidden="true" />
                    Vérification…
                  </>
                ) : (
                  "J’ai envoyé le paiement et je veux télécharger"
                )}
              </button>
            </div>
          </div>
        </div>
      </dialog>

      <dialog id="payment_success_modal" className="modal">
        <div className="modal-box max-w-lg overflow-hidden rounded-[2rem] border border-success/20 bg-base-100 p-0">
          <div className="bg-gradient-to-r from-success to-primary p-6 text-success-content">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] opacity-90">
              Confirmation
            </p>
            <h3 className="mt-3 text-2xl font-black">Paiement reçu</h3>
          </div>

          <div className="p-6">
            <div className="rounded-2xl bg-success/10 p-4 text-sm text-base-content/80">
              <p>
                Votre paiement de{" "}
                <span className="font-black text-success">
                  {PAYMENT_AMOUNT.toLocaleString("fr-FR")} {PAYMENT_CURRENCY}
                </span>{" "}
                a bien été transmis.
              </p>
              <p className="mt-2">
                Il est <span className="font-semibold">en cours de vérification</span> : le
                téléchargement s’activera automatiquement dès sa validation (généralement en moins
                d’une heure). Vous pouvez fermer cette fenêtre.
              </p>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                type="button"
                className="btn btn-success btn-lg"
                onClick={() => dialogClose("payment_success_modal")}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
