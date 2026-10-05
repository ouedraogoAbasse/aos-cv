"use client";

import { ChevronDown, RotateCw } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  label: string;
  open: boolean;
  onToggle: () => void;
  onReset: () => void;
  /** Message de confirmation avant d'effacer la section. */
  resetConfirm: string;
  children: ReactNode;
  className?: string;
};

/**
 * Bloc repliable du formulaire : bouton d'ouverture + bouton de réinitialisation.
 * Les deux sont des <button> frères (plus de bouton imbriqué dans un bouton).
 */
export default function AccordionSection({
  label,
  open,
  onToggle,
  onReset,
  resetConfirm,
  children,
  className = "",
}: Props) {
  const handleReset = () => {
    if (window.confirm(resetConfirm)) onReset();
  };

  return (
    <div className={`rounded-2xl border border-base-300 bg-base-100 ${className}`}>
      <div className="flex items-center justify-between gap-3 px-3 py-3">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="flex flex-1 items-center justify-between gap-3 text-left"
        >
          <span className="badge badge-primary badge-outline">{label}</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </button>

        <button
          type="button"
          onClick={handleReset}
          aria-label={`Réinitialiser la section ${label}`}
          title={`Réinitialiser ${label}`}
          className="btn btn-primary btn-sm"
        >
          <RotateCw className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {open && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}
