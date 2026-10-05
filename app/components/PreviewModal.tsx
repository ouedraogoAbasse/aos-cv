"use client";

import CVPreview from "./CVPreview";
import { Clock, Save, XCircle } from "lucide-react";
import { TOKEN_STATUS_MESSAGES } from "@/lib/payment";
import { useCV } from "@/state/CVContext";

export default function PreviewModal() {
  const {
    personalDetails,
    photo,
    theme,
    experiences,
    educations,
    languages,
    skills,
    hobbies,
    previewRef,
    downloadPdf,
    isDownloading,
    downloadError,
    paymentStatus,
  } = useCV();

  const isApproved = paymentStatus === "valid";
  const statusMessage =
    paymentStatus !== "none" && paymentStatus !== "valid"
      ? TOKEN_STATUS_MESSAGES[paymentStatus]
      : undefined;

  return (
    <dialog id="preview_modal" className="modal">
      <div className="modal-box mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <form method="dialog">
          <button className="btn btn-circle btn-ghost btn-sm absolute right-2 top-2" aria-label="Fermer">
            ✕
          </button>
        </form>

        <div className="mt-5">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-base-content/60">
              {isApproved
                ? "Paiement validé : votre PDF est prêt."
                : "Votre CV est prêt. Le téléchargement PDF est inclus (1 000 FCFA)."}
            </p>
            <button
              type="button"
              onClick={() => void downloadPdf()}
              disabled={isDownloading}
              className="btn btn-primary btn-lg gap-2"
            >
              {isDownloading ? (
                <>
                  <span className="loading loading-spinner loading-sm" aria-hidden="true" />
                  Génération…
                </>
              ) : (
                <>
                  Télécharger mon PDF
                  <Save className="h-4 w-4" aria-hidden="true" />
                </>
              )}
            </button>
          </div>

          {statusMessage && (
            <div
              role="status"
              className={`mb-4 flex items-start gap-3 rounded-2xl p-4 text-sm ${
                paymentStatus === "rejected"
                  ? "bg-error/10 text-error"
                  : paymentStatus === "pending"
                    ? "bg-info/10 text-info"
                    : "bg-warning/10 text-warning"
              }`}
            >
              {paymentStatus === "rejected" ? (
                <XCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              ) : (
                <Clock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              )}
              <span>{statusMessage}</span>
            </div>
          )}

          {downloadError && (
            <div role="alert" className="mb-4 rounded-2xl bg-error/10 p-4 text-sm text-error">
              {downloadError}
            </div>
          )}

          <div className="flex w-full max-w-full items-center justify-center overflow-auto">
            <CVPreview
              ref={previewRef}
              personalDetails={personalDetails}
              file={photo}
              theme={theme}
              experiences={experiences}
              educations={educations}
              languages={languages}
              hobbies={hobbies}
              skills={skills}
              download
            />
          </div>
        </div>

        <form method="dialog" className="mt-4 flex justify-end">
          <button className="btn btn-ghost">Fermer</button>
        </form>
      </div>
    </dialog>
  );
}
