"use client";

import { ArrowRight } from "lucide-react";

export default function Header() {
  const scrollToBuilder = () => {
    document.getElementById("builder")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-base-300 bg-base-100/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-lg font-black text-primary-content">
            A
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-primary">AOSCV</p>
            <p className="text-sm font-medium text-base-content/70">CV Create</p>
          </div>
        </div>

        <nav
          aria-label="Navigation principale"
          className="hidden items-center gap-8 text-sm font-medium md:flex"
        >
          <a href="#features" className="transition hover:text-primary">Fonctionnalités</a>
          <a href="#process" className="transition hover:text-primary">Processus</a>
          <a href="#builder" className="transition hover:text-primary">Builder</a>
        </nav>

        <button onClick={scrollToBuilder} className="btn btn-primary btn-sm sm:btn-md">
          Créer mon CV
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
