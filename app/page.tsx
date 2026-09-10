"use client"
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Eye,
  LayoutTemplate,
  RotateCw,
  Save,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import PersonalDetailsForm from "./components/PersonalDetailsForm";
import { useEffect, useRef, useState } from "react";
import { Education, Experience, Hobby, Language, PersonalDetails, Skill } from "@/type";
import { educationsPreset, experiencesPreset, hobbiesPreset, languagesPreset, personalDetailsPreset, skillsPreset } from "@/presets";
import CVPreview from "./components/CVPreview";
import ExperienceForm from "./components/ExperienceForm";
import EducationForm from "./components/EducationForm";
import LanguageForm from "./components/LanguageForm";
import SkillForm from "./components/SkillForm";
import HobbyForm from "./components/HobbyForm";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import confetti from "canvas-confetti";

export default function Home() {
  const [personalDetails, setPersonalDetails] = useState<PersonalDetails>(personalDetailsPreset);
  const [file, setFile] = useState<File | null>(null);
  const [theme, setTheme] = useState<string>("sunset");
  const [zoom, setZoom] = useState<number>(163);
  const [experiences, setExperience] = useState<Experience[]>(experiencesPreset);
  const [educations, setEducations] = useState<Education[]>(educationsPreset);
  const [languages, setLanguages] = useState<Language[]>(languagesPreset);
  const [skills, setSkills] = useState<Skill[]>(skillsPreset);
  const [hobbies, setHobbies] = useState<Hobby[]>(hobbiesPreset);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    personal: true,
    experience: true,
    education: true,
    language: true,
    skills: true,
    hobbies: true,
  });
  const [paymentMethod, setPaymentMethod] = useState<"orange" | "moov">("orange");
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [paymentName, setPaymentName] = useState("");
  const [paymentPhone, setPaymentPhone] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentProof, setPaymentProof] = useState<File | null>(null);

  useEffect(() => {
    const defaultImageUrl = "/profile.jpg";
    fetch(defaultImageUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const defaultFile = new File([blob], "profile.jpg", { type: blob.type });
        setFile(defaultFile);
      });
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const themes = [
    "light",
    "dark",
    "cupcake",
    "bumblebee",
    "emerald",
    "corporate",
    "synthwave",
    "retro",
    "cyberpunk",
    "valentine",
    "halloween",
    "garden",
    "forest",
    "aqua",
    "lofi",
    "pastel",
    "fantasy",
    "wireframe",
    "black",
    "luxury",
    "dracula",
    "cmyk",
    "autumn",
    "business",
    "acid",
    "lemonade",
    "night",
    "coffee",
    "winter",
    "dim",
    "nord",
    "sunset",
  ];

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

  const handleResetPersonalDetails = () =>
    setPersonalDetails({
      fullName: "",
      email: "",
      phone: "",
      address: "",
      photoUrl: "",
      postSeeking: "",
      description: "",
    });

  const handleResetExperiences = () => setExperience([]);
  const handleResetEducations = () => setEducations([]);
  const handleResetLanguages = () => setLanguages([]);
  const handleResetSkills = () => setSkills([]);
  const handleResetHobbies = () => setHobbies([]);

  const toggleSection = (section: string) => {
    setOpenSections((current) => ({
      ...current,
      [section]: !current[section],
    }));
  };

  const paymentNumbers = {
    orange: "+226 65 45 38 70",
    moov: "+226 62 13 49 70",
  };

  const normalizePhone = (value: string) => value.replace(/\D/g, "");

  const validatePaymentProof = () => {
    const expectedDigits = paymentMethod === "orange" ? "65453870" : "62134970";
    const enteredDigits = normalizePhone(paymentPhone);

    if (!paymentName.trim()) {
      return "Veuillez renseigner votre nom complet avant de continuer.";
    }

    if (!enteredDigits) {
      return "Veuillez renseigner le numéro de téléphone utilisé pour le paiement.";
    }

    if (!enteredDigits.includes(expectedDigits)) {
      return `Le numéro saisi ne correspond pas au compte ${paymentMethod === "orange" ? "Orange Money" : "Telmob"} attendu.`;
    }

    if (!paymentReference.trim()) {
      return `Veuillez renseigner la référence de transaction ${paymentMethod === "orange" ? "Orange Money" : "Telmob"}.`;
    }

    if (!paymentProof) {
      return "Veuillez joindre une preuve de paiement avant de valider votre achat.";
    }

    if (!paymentProof.type.startsWith("image/")) {
      return "La preuve de paiement doit être une image (photo ou capture d’écran).";
    }

    return "";
  };

  const openPaymentModal = () => {
    (document.getElementById("payment_modal") as HTMLDialogElement)?.showModal();
  };

  const cvPreviewRef = useRef(null);

  const handleDownloadPdf = async (skipPaymentCheck = false) => {
    if (!skipPaymentCheck && !paymentConfirmed) {
      openPaymentModal();
      return;
    }

    const element = cvPreviewRef.current;
    if (!element) {
      console.error("Prévisualisation introuvable pour l’export PDF.");
      return;
    }

    try {
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
      });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "A4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("cv.pdf");

      const modal = document.getElementById("my_modal_3") as HTMLDialogElement;
      if (modal) {
        modal.close();
      }

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        zIndex: 9999,
      });
    } catch (error) {
      console.error("Erreur lors de la génération du PDF :", error);
    }
  };

  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <header className="sticky top-0 z-40 border-b border-base-300 bg-white/80 backdrop-blur-xl">
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

          <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
            <a href="#features" className="transition hover:text-primary">Fonctionnalités</a>
            <a href="#process" className="transition hover:text-primary">Processus</a>
            <a href="#builder" className="transition hover:text-primary">Builder</a>
          </nav>

          <button
            onClick={() => document.getElementById("builder")?.scrollIntoView({ behavior: "smooth" })}
            className="btn btn-primary btn-sm sm:btn-md"
          >
            Créer mon CV
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main>
        <section className="aoscv-hero relative overflow-hidden">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-24">
            <div className="flex flex-col justify-center">
              <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" />
                Créez un CV qui fait la différence
              </div>

              <h1 className="max-w-xl text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Votre avenir professionnel commence par un <span className="text-primary">CV remarquable</span>.
              </h1>

              <p className="mt-6 max-w-xl text-lg text-base-content/70">
                AOSCV vous aide à concevoir un curriculum vitae élégant, clair et immédiatement exportable en PDF.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  onClick={() => document.getElementById("builder")?.scrollIntoView({ behavior: "smooth" })}
                  className="btn btn-primary"
                >
                  Commencer maintenant
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => (document.getElementById("my_modal_3") as HTMLDialogElement)?.showModal()}
                  className="btn btn-outline"
                >
                  Prévisualiser
                  <Eye className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-base-content/60">
                <span className="inline-flex items-center gap-2 rounded-full border border-base-300 bg-white/80 px-3 py-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  CV prêt à l’emploi
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-base-300 bg-white/80 px-3 py-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Personnalisation instantanée
                </span>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-primary/20 bg-white p-4 shadow-sm ring-1 ring-primary/10">
                    <div className="text-2xl font-black text-primary">{stat.value}</div>
                    <div className="text-sm font-medium text-slate-700">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="absolute -left-10 top-10 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
              <div className="absolute -right-8 bottom-16 h-32 w-32 rounded-full bg-secondary/20 blur-3xl" />

              <div className="relative w-full max-w-lg rounded-[2rem] border border-base-300 bg-white/85 p-5 shadow-[0_30px_80px_rgba(15,23,42,0.15)] backdrop-blur-xl">
                <div className="rounded-[1.5rem] bg-base-200 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-secondary object-cover shadow-md" />
                      <div>
                        <p className="font-bold">{personalDetails.fullName || "John Doe"}</p>
                        <p className="text-xs text-base-content/60">{personalDetails.postSeeking || "Chargé de Communication"}</p>
                      </div>
                    </div>
                    <span className="badge badge-primary">Disponible</span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl bg-base-100 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-base-content/50">Contact</p>
                      <p className="mt-2 text-sm font-medium">{personalDetails.email || "johndoe@example.com"}</p>
                      <p className="text-sm text-base-content/70">{personalDetails.phone || "+33 6 12 34 56 78"}</p>
                    </div>
                    <div className="rounded-xl bg-base-100 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-base-content/50">Compétences</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {skills.slice(0, 3).map((skill) => (
                          <span key={skill.id} className="badge badge-outline badge-primary text-[10px] uppercase">
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl bg-base-100 p-4">
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
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Pourquoi AOSCV</p>
            <h2 className="mt-4 text-3xl font-black sm:text-4xl">Tout ce qu’il faut pour créer un CV professionnel.</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {features.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-3xl border border-base-300 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="mb-4 inline-flex rounded-2xl bg-primary/10 p-3 text-primary">
                  <Icon className="h-6 w-6" />
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
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Processus</p>
              <h2 className="mt-4 text-3xl font-black sm:text-4xl">Un parcours simple, en 3 étapes.</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {steps.map((step, index) => (
                <div key={step} className="rounded-3xl border border-base-300 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-lg font-black text-primary-content">
                    {index + 1}
                  </div>
                  <p className="text-base-content/80">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="builder" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Builder</p>
              <h2 className="mt-2 text-3xl font-black sm:text-4xl">Construisez votre CV en direct.</h2>
            </div>
            <button className="btn btn-primary" onClick={() => (document.getElementById("my_modal_3") as HTMLDialogElement)?.showModal()}>
              Prévisualiser et exporter
              <Eye className="h-4 w-4" />
            </button>
          </div>

          <div className="block">
            <section className="flex flex-col gap-6 lg:flex-row lg:h-[calc(100vh-12rem)] lg:min-h-[900px] overflow-hidden rounded-[2rem] border border-base-300 bg-base-100 shadow-2xl">
              <div className="w-full overflow-y-auto max-h-[75vh] bg-base-200 p-5 pr-2 border-b border-base-300 lg:w-1/3 lg:h-full lg:max-h-[calc(100vh-12rem)] lg:p-10 lg:border-b-0 lg:border-r">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h1 className="text-2xl font-black italic">
                      CV
                      <span className="text-primary"> Create</span>
                    </h1>
                  </div>

                  <button className="btn btn-primary btn-sm sm:btn-md" onClick={() => (document.getElementById("my_modal_3") as HTMLDialogElement).showModal()}>
                    Prévisualiser
                    <Eye className="w-4" />
                  </button>
                </div>

                <div className="flex flex-col gap-4 rounded-lg">
                  <div className="rounded-2xl border border-base-300 bg-base-100">
                    <button
                      type="button"
                      onClick={() => toggleSection("personal")}
                      className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left"
                    >
                      <span className="badge badge-primary badge-outline">Qui êtes-vous ?</span>
                      <div className="flex items-center gap-2">
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(event) => {
                            event.stopPropagation();
                            handleResetPersonalDetails();
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              event.stopPropagation();
                              handleResetPersonalDetails();
                            }
                          }}
                          className="btn btn-primary btn-sm"
                        >
                          <RotateCw className="w-4" />
                        </span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${openSections.personal ? "rotate-180" : ""}`} />
                      </div>
                    </button>

                    {openSections.personal && (
                      <div className="px-3 pb-3">
                        <PersonalDetailsForm
                          personalDetails={personalDetails}
                          setPersonalDetails={setPersonalDetails}
                          setFile={setFile}
                        />
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-base-300 bg-base-100">
                    <button
                      type="button"
                      onClick={() => toggleSection("experience")}
                      className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left"
                    >
                      <span className="badge badge-primary badge-outline">Expériences</span>
                      <div className="flex items-center gap-2">
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(event) => {
                            event.stopPropagation();
                            handleResetExperiences();
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              event.stopPropagation();
                              handleResetExperiences();
                            }
                          }}
                          className="btn btn-primary btn-sm"
                        >
                          <RotateCw className="w-4" />
                        </span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${openSections.experience ? "rotate-180" : ""}`} />
                      </div>
                    </button>

                    {openSections.experience && (
                      <div className="px-3 pb-3">
                        <ExperienceForm experience={experiences} setExperiences={setExperience} />
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-base-300 bg-base-100">
                    <button
                      type="button"
                      onClick={() => toggleSection("education")}
                      className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left"
                    >
                      <span className="badge badge-primary badge-outline">Éducations</span>
                      <div className="flex items-center gap-2">
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(event) => {
                            event.stopPropagation();
                            handleResetEducations();
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              event.stopPropagation();
                              handleResetEducations();
                            }
                          }}
                          className="btn btn-primary btn-sm"
                        >
                          <RotateCw className="w-4" />
                        </span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${openSections.education ? "rotate-180" : ""}`} />
                      </div>
                    </button>

                    {openSections.education && (
                      <div className="px-3 pb-3">
                        <EducationForm educations={educations} setEducations={setEducations} />
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-base-300 bg-base-100">
                    <button
                      type="button"
                      onClick={() => toggleSection("language")}
                      className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left"
                    >
                      <span className="badge badge-primary badge-outline">Langues</span>
                      <div className="flex items-center gap-2">
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(event) => {
                            event.stopPropagation();
                            handleResetLanguages();
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              event.stopPropagation();
                              handleResetLanguages();
                            }
                          }}
                          className="btn btn-primary btn-sm"
                        >
                          <RotateCw className="w-4" />
                        </span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${openSections.language ? "rotate-180" : ""}`} />
                      </div>
                    </button>

                    {openSections.language && (
                      <div className="px-3 pb-3">
                        <LanguageForm languages={languages} setLanguages={setLanguages} />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                    <div className="rounded-2xl border border-base-300 bg-base-100 sm:w-1/2">
                      <button
                        type="button"
                        onClick={() => toggleSection("skills")}
                        className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left"
                      >
                        <span className="badge badge-primary badge-outline">Compétences</span>
                        <div className="flex items-center gap-2">
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(event) => {
                              event.stopPropagation();
                              handleResetSkills();
                            }}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                event.stopPropagation();
                                handleResetSkills();
                              }
                            }}
                            className="btn btn-primary btn-sm"
                          >
                            <RotateCw className="w-4" />
                          </span>
                          <ChevronDown className={`h-4 w-4 transition-transform ${openSections.skills ? "rotate-180" : ""}`} />
                        </div>
                      </button>

                      {openSections.skills && (
                        <div className="px-3 pb-3">
                          <SkillForm skills={skills} setSkills={setSkills} />
                        </div>
                      )}
                    </div>

                    <div className="rounded-2xl border border-base-300 bg-base-100 sm:ml-4 sm:w-1/2">
                      <button
                        type="button"
                        onClick={() => toggleSection("hobbies")}
                        className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left"
                      >
                        <span className="badge badge-primary badge-outline">Loisirs</span>
                        <div className="flex items-center gap-2">
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(event) => {
                              event.stopPropagation();
                              handleResetHobbies();
                            }}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                event.stopPropagation();
                                handleResetHobbies();
                              }
                            }}
                            className="btn btn-primary btn-sm"
                          >
                            <RotateCw className="w-4" />
                          </span>
                          <ChevronDown className={`h-4 w-4 transition-transform ${openSections.hobbies ? "rotate-180" : ""}`} />
                        </div>
                      </button>

                      {openSections.hobbies && (
                        <div className="px-3 pb-3">
                          <HobbyForm hobbies={hobbies} setHobbies={setHobbies} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full min-h-0 overflow-y-auto overflow-x-auto bg-base-100 bg-[url('/file.svg')] bg-cover bg-center scrollable-preview relative lg:w-2/3 lg:h-full">
                <div className="flex items-center justify-center fixed z-[9999] top-20 right-3 gap-3 sm:right-5">
                  <input
                    type="range"
                    min={50}
                    max={200}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="range range-xs range-primary"
                  />
                  <p className="ml-2 text-sm font-medium text-primary">{zoom}%</p>
                </div>

                <div className="flex items-center justify-center fixed z-[9999] top-20 right-28 sm:right-40">
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="select select-bordered select-sm"
                  >
                    {themes.map((themeName) => (
                      <option key={themeName} value={themeName}>
                        {themeName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex min-h-full items-center justify-center p-4 sm:p-8">
                  <div
                    className="transition-transform duration-300"
                    style={{ transform: `scale(${zoom / 200})` }}
                  >
                    <CVPreview
                      personalDetails={personalDetails}
                      file={file}
                      theme={theme}
                      experiences={experiences}
                      educations={educations}
                      languages={languages}
                      hobbies={hobbies}
                      skills={skills}
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>
        </section>
      </main>

      <dialog id="payment_modal" className="modal">
        <div className="modal-box max-w-2xl rounded-[2rem] border border-primary/20 bg-white p-0 overflow-hidden">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>

          <div className="bg-gradient-to-r from-primary to-secondary p-6 text-primary-content">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] opacity-90">Paiement requis</p>
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
                <span className="text-xl font-black text-primary">1 000 FCFA</span>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-base-300 p-3 transition hover:border-primary/40 hover:bg-primary/5">
                <input
                  type="radio"
                  name="paymentMethod"
                  className="radio radio-primary"
                  checked={paymentMethod === "orange"}
                  onChange={() => setPaymentMethod("orange")}
                />
                <div>
                  <div className="font-semibold">Orange Money</div>
                  <div className="text-sm text-base-content/70">{paymentNumbers.orange}</div>
                </div>
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-base-300 p-3 transition hover:border-primary/40 hover:bg-primary/5">
                <input
                  type="radio"
                  name="paymentMethod"
                  className="radio radio-primary"
                  checked={paymentMethod === "moov"}
                  onChange={() => setPaymentMethod("moov")}
                />
                <div>
                  <div className="font-semibold">Telmob</div>
                  <div className="text-sm text-base-content/70">{paymentNumbers.moov}</div>
                </div>
              </label>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <input
                type="text"
                value={paymentName}
                onChange={(e) => setPaymentName(e.target.value)}
                placeholder="Nom complet"
                className="input input-bordered w-full"
              />
              <input
                type="tel"
                value={paymentPhone}
                onChange={(e) => setPaymentPhone(e.target.value)}
                placeholder="Numéro de téléphone"
                className="input input-bordered w-full"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-base-content/70 mb-2">
                Référence de transaction {paymentMethod === "orange" ? "Orange Money" : "Telmob"}
                <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder={paymentMethod === "orange" ? "Ex: OM-2458" : "Ex: TM-2458"}
                className="input input-bordered w-full"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-base-content/70 mb-2">Preuve de paiement <span className="text-error">*</span></label>
              <input
                type="file"
                accept="image/*"
                required
                onChange={(event) => setPaymentProof(event.target.files?.[0] || null)}
                className="file-input file-input-bordered file-input-primary w-full"
              />
              <p className="mt-2 text-xs text-base-content/60">
                La preuve doit être une capture d’écran du reçu {paymentMethod === "orange" ? "Orange Money" : "Telmob"} montrant le numéro {paymentMethod === "orange" ? paymentNumbers.orange : paymentNumbers.moov} et la référence de transaction.
              </p>
            </div>

            <div className="mt-5 rounded-2xl bg-base-200 p-4 text-sm text-base-content/80">
              <p>Montant à payer : <span className="font-black text-primary">1 000 FCFA</span></p>
              <p className="mt-1">Recevez le paiement sur : <span className="font-semibold">{paymentMethod === "orange" ? "Orange Money" : "Telmob"}</span></p>
              <p className="mt-1">Numéro : <span className="font-semibold">{paymentMethod === "orange" ? paymentNumbers.orange : paymentNumbers.moov}</span></p>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  const validationMessage = validatePaymentProof();
                  if (validationMessage) {
                    alert(validationMessage);
                    return;
                  }

                  setPaymentConfirmed(true);

                  const paymentModal = document.getElementById("payment_modal") as HTMLDialogElement | null;
                  if (paymentModal) paymentModal.close();

                  const successModal = document.getElementById("payment_success_modal") as HTMLDialogElement | null;
                  if (successModal) successModal.showModal();

                  handleDownloadPdf(true);
                }}
                className="btn btn-primary btn-lg flex-1"
              >
                J’ai envoyé le paiement et je veux télécharger
              </button>
            </div>
          </div>
        </div>
      </dialog>

      <dialog id="payment_success_modal" className="modal">
        <div className="modal-box max-w-lg rounded-[2rem] border border-success/20 bg-white p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-success to-primary p-6 text-success-content">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] opacity-90">Confirmation</p>
            <h3 className="mt-3 text-2xl font-black">Paiement reçu</h3>
          </div>

          <div className="p-6">
            <div className="rounded-2xl bg-success/10 p-4 text-sm text-base-content/80">
              <p>Votre paiement de <span className="font-black text-success">1 000 FCFA</span> a bien été enregistré.</p>
              <p className="mt-2">Le téléchargement de votre CV est maintenant autorisé.</p>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                type="button"
                className="btn btn-success btn-lg"
                onClick={() => {
                  (document.getElementById("payment_success_modal") as HTMLDialogElement)?.close();
                }}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </dialog>

      <dialog id="my_modal_3" className="modal">
        <div className="modal-box w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>

          <div className="mt-5">
            <div className="flex justify-end mb-5">
              <button onClick={() => {
                if (!paymentConfirmed) {
                  openPaymentModal();
                  return;
                }
                handleDownloadPdf(true);
              }} className="btn btn-primary btn-lg gap-2">
                Télécharger mon PDF
                <Save className="w-4" />
              </button>
            </div>

            <div className="w-full max-w-full overflow-auto">
              <div className="w-full max-w-full flex justify-center items-center">
                <CVPreview
                  personalDetails={personalDetails}
                  file={file}
                  theme={theme}
                  experiences={experiences}
                  educations={educations}
                  languages={languages}
                  hobbies={hobbies}
                  skills={skills}
                  download={true}
                  ref={cvPreviewRef}
                />
              </div>
            </div>
          </div>
        </div>
      </dialog>

      <footer className="border-t border-base-300 bg-base-200/70">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-base-content/70 sm:px-6 md:flex-row lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-black text-primary-content">A</div>
            <span className="font-semibold text-base-content">AOSCV</span>
          </div>
          <p>Créez un CV professionnel, clair et impactant.</p>
          <div className="flex items-center gap-2 text-primary">
            <CheckCircle2 className="h-4 w-4" />
            <span>Prêt à exporter</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
