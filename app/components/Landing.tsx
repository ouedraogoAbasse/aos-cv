"use client";

import { CheckCircle2, Eye, ArrowRight, LayoutTemplate, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { useCV } from "@/state/CVContext";

const features = [
  {
    icon: LayoutTemplate,
    title: "Modèles premium",
    text: "Des mises en page modernes, lisibles et pensées pour mettre en valeur votre profil professionnel.",
  },
  {
    icon: Zap,
    title: "Création rapide",
    text: "Rédigez votre CV sans friction et obtenez un résultat visuel immédiat, prêt à convaincre.",
  },
  {
    icon: ShieldCheck,
    title: "Contrôle total",
    text: "Personnalisez les sections, le thème, la mise en page et les détails selon votre parcours.",
  },
];

const steps = [
  "Sélectionnez une direction visuelle qui reflète votre image professionnelle.",
  "Renseignez vos expériences, formations, compétences et loisirs avec précision.",
  "Prévisualisez et exportez un CV premium en PDF en un clic.",
];

const stats = [
  { value: "3x", label: "plus rapide" },
  { value: "32", label: "thèmes disponibles" },
  { value: "PDF", label: "export prêt à l’emploi" },
];

export default function Landing() {
  const { personalDetails, skills, openPreviewModal } = useCV();

  const scrollToBuilder = () => {
    document.getElementById("builder")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <section className="aoscv-hero relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-24">
          <div className="flex flex-col justify-center">
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Créez un CV qui fait la différence
            </div>

            <h1 className="max-w-xl text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Votre avenir professionnel commence par un{" "}
              <span className="text-primary">CV remarquable</span>.
            </h1>

            <p className="mt-6 max-w-xl text-lg text-base-content/70">
              AOSCV vous aide à concevoir un curriculum vitae élégant, clair et immédiatement
              exportable en PDF.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button onClick={scrollToBuilder} className="btn btn-primary">
                Commencer maintenant
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <button onClick={openPreviewModal} className="btn btn-outline">
                Prévisualiser
                <Eye className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-base-content/60">
              <span className="inline-flex items-center gap-2 rounded-full border border-base-300 bg-base-200/80 px-3 py-2">
                <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
                CV prêt à l’emploi
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-base-300 bg-base-200/80 px-3 py-2">
                <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
                Personnalisation instantanée
              </span>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-primary/20 bg-base-200 p-4 shadow-sm ring-1 ring-primary/10"
                >
                  <div className="text-2xl font-black text-primary">{stat.value}</div>
                  <div className="text-sm font-medium text-base-content/70">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="absolute -left-10 top-10 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute -right-8 bottom-16 h-32 w-32 rounded-full bg-secondary/20 blur-3xl" />

            <div className="relative w-full max-w-lg rounded-[2rem] border border-base-300 bg-base-200/80 p-5 shadow-[0_30px_80px_rgba(15,23,42,0.15)] backdrop-blur-xl">
              <div className="rounded-[1.5rem] bg-base-100 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-secondary object-cover shadow-md" />
                    <div>
                      <p className="font-bold">{personalDetails.fullName || "John Doe"}</p>
                      <p className="text-xs text-base-content/60">
                        {personalDetails.postSeeking || "Chargé de Communication"}
                      </p>
                    </div>
                  </div>
                  <span className="badge badge-primary">Disponible</span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-base-200 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-base-content/50">Contact</p>
                    <p className="mt-2 text-sm font-medium">
                      {personalDetails.email || "johndoe@example.com"}
                    </p>
                    <p className="text-sm text-base-content/70">
                      {personalDetails.phone || "+33 6 12 34 56 78"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-base-200 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-base-content/50">
                      Compétences
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {skills.slice(0, 3).map((skill, index) => (
                        <span
                          key={skill.id ?? index}
                          className="badge badge-outline badge-primary text-[10px] uppercase"
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-xl bg-base-200 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-base-content/50">Résumé</p>
                  <p className="mt-2 line-clamp-4 text-sm text-base-content/70">
                    {personalDetails.description ||
                      "Professionnel orienté résultats avec une forte capacité à concevoir, organiser et piloter des projets à fort impact digital."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
            Pourquoi AOSCV
          </p>
          <h2 className="mt-4 text-3xl font-black sm:text-4xl">
            Tout ce qu’il faut pour créer un CV professionnel.
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-3xl border border-base-300 bg-base-200 p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="mb-4 inline-flex rounded-2xl bg-primary/10 p-3 text-primary">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="mb-3 text-xl font-bold">{title}</h3>
              <p className="text-base-content/70">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="process" className="bg-base-200/60 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
              Processus
            </p>
            <h2 className="mt-4 text-3xl font-black sm:text-4xl">
              Un parcours simple, en 3 étapes.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step} className="rounded-3xl border border-base-300 bg-base-200 p-6 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-lg font-black text-primary-content">
                  {index + 1}
                </div>
                <p className="text-base-content/80">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
