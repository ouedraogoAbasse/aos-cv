"use client";

import EducationForm from "./EducationForm";
import ExperienceForm from "./ExperienceForm";
import HobbyForm from "./HobbyForm";
import LanguageForm from "./LanguageForm";
import PersonalDetailsForm from "./PersonalDetailsForm";
import SkillForm from "./SkillForm";
import AccordionSection from "./AccordionSection";
import CVPreview from "./CVPreview";
import { Eye } from "lucide-react";
import { useState } from "react";
import { CV_THEMES } from "@/lib/themes";
import { useCV } from "@/state/CVContext";

const INITIAL_SECTIONS = {
  personal: true,
  experience: true,
  education: true,
  language: true,
  skills: true,
  hobbies: true,
};

export default function Builder() {
  const {
    personalDetails,
    setPersonalDetails,
    setPhoto,
    experiences,
    setExperiences,
    educations,
    setEducations,
    languages,
    setLanguages,
    skills,
    setSkills,
    hobbies,
    setHobbies,
    resetPersonalDetails,
    resetExperiences,
    resetEducations,
    resetLanguages,
    resetSkills,
    resetHobbies,
    photo,
    theme,
    setTheme,
    zoom,
    setZoom,
    openPreviewModal,
  } = useCV();

  const [openSections, setOpenSections] = useState<Record<string, boolean>>(INITIAL_SECTIONS);

  const toggleSection = (section: keyof typeof INITIAL_SECTIONS) => {
    setOpenSections((current) => ({ ...current, [section]: !current[section] }));
  };

  return (
    <section id="builder" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Builder</p>
          <h2 className="mt-2 text-3xl font-black sm:text-4xl">Construisez votre CV en direct.</h2>
        </div>
        <button className="btn btn-primary" onClick={openPreviewModal}>
          Prévisualiser et exporter
          <Eye className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <section className="flex flex-col gap-6 overflow-hidden rounded-[2rem] border border-base-300 bg-base-100 shadow-2xl lg:h-[calc(100vh-12rem)] lg:min-h-[900px] lg:flex-row">
        {/* ---------------------------- Formulaire ---------------------------- */}
        <div className="max-h-[75vh] w-full overflow-y-auto border-b border-base-300 bg-base-200 p-5 lg:h-full lg:w-1/3 lg:max-h-none lg:border-b-0 lg:border-r lg:p-10">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-black italic">
              CV<span className="text-primary"> Create</span>
            </h1>
            <button className="btn btn-primary btn-sm sm:btn-md" onClick={openPreviewModal}>
              Prévisualiser
              <Eye className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <AccordionSection
              label="Qui êtes-vous ?"
              open={openSections.personal}
              onToggle={() => toggleSection("personal")}
              onReset={resetPersonalDetails}
              resetConfirm="Effacer toutes les informations personnelles ?"
            >
              <PersonalDetailsForm
                personalDetails={personalDetails}
                setPersonalDetails={setPersonalDetails}
                setFile={setPhoto}
              />
            </AccordionSection>

            <AccordionSection
              label="Expériences"
              open={openSections.experience}
              onToggle={() => toggleSection("experience")}
              onReset={resetExperiences}
              resetConfirm="Supprimer toutes les expériences ?"
            >
              <ExperienceForm experiences={experiences} setExperiences={setExperiences} />
            </AccordionSection>

            <AccordionSection
              label="Éducations"
              open={openSections.education}
              onToggle={() => toggleSection("education")}
              onReset={resetEducations}
              resetConfirm="Supprimer toutes les formations ?"
            >
              <EducationForm educations={educations} setEducations={setEducations} />
            </AccordionSection>

            <AccordionSection
              label="Langues"
              open={openSections.language}
              onToggle={() => toggleSection("language")}
              onReset={resetLanguages}
              resetConfirm="Supprimer toutes les langues ?"
            >
              <LanguageForm languages={languages} setLanguages={setLanguages} />
            </AccordionSection>

            <div className="flex flex-col gap-4 sm:flex-row">
              <AccordionSection
                label="Compétences"
                open={openSections.skills}
                onToggle={() => toggleSection("skills")}
                onReset={resetSkills}
                resetConfirm="Supprimer toutes les compétences ?"
                className="sm:w-1/2"
              >
                <SkillForm skills={skills} setSkills={setSkills} />
              </AccordionSection>

              <AccordionSection
                label="Loisirs"
                open={openSections.hobbies}
                onToggle={() => toggleSection("hobbies")}
                onReset={resetHobbies}
                resetConfirm="Supprimer tous les loisirs ?"
                className="sm:ml-4 sm:w-1/2"
              >
                <HobbyForm hobbies={hobbies} setHobbies={setHobbies} />
              </AccordionSection>
            </div>
          </div>
        </div>

        {/* ------------------------- Prévisualisation ------------------------- */}
        <div className="relative max-h-[75vh] w-full min-h-0 overflow-y-auto overflow-x-auto bg-base-100 bg-[url('/file.svg')] bg-cover bg-center lg:max-h-none lg:h-full lg:w-2/3">
          {/* Barre épinglée en haut du panneau (elle ne « fugue » plus dans la page). */}
          <div className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-base-300 bg-base-100/95 px-4 py-3 backdrop-blur">
            <label className="flex items-center gap-2 text-sm font-medium">
              <span className="text-base-content/60">Thème</span>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="select select-bordered select-sm"
                aria-label="Thème du CV"
              >
                {CV_THEMES.map((themeName) => (
                  <option key={themeName} value={themeName}>
                    {themeName}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-1 items-center gap-3 sm:max-w-xs">
              <span className="whitespace-nowrap text-sm font-medium text-base-content/60">
                Zoom
              </span>
              <input
                type="range"
                min={40}
                max={150}
                step={5}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="range range-xs range-primary flex-1"
                aria-label="Zoom de la prévisualisation"
              />
              <span className="w-12 text-right text-sm font-semibold text-primary">{zoom}%</span>
            </label>
          </div>

          <div className="flex min-h-full items-start justify-center p-4 sm:p-8">
            <div
              className="origin-top transition-transform duration-200"
              style={{ transform: `scale(${zoom / 100})` }}
            >
              <CVPreview
                personalDetails={personalDetails}
                file={photo}
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
    </section>
  );
}
