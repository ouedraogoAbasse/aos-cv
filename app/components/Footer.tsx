"use client";

import { CheckCircle2 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-base-300 bg-base-200/70">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-base-content/70 sm:px-6 md:flex-row lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-black text-primary-content">
            A
          </div>
          <span className="font-semibold text-base-content">AOSCV</span>
        </div>
        <p>Créez un CV professionnel, clair et impactant.</p>
        <div className="flex items-center gap-2 text-primary">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          <span>Prêt à exporter</span>
        </div>
      </div>
    </footer>
  );
}
