"use client";

import { Experience } from "@/type";
import { createId } from "@/lib/id";
import { Pencil, Plus, X } from "lucide-react";
import React, { useState } from "react";

type Props = {
  experiences: Experience[];
  setExperiences: (experiences: Experience[]) => void;
};

const EMPTY_EXPERIENCE: Experience = {
  jobTitle: "",
  companyName: "",
  startDate: "",
  endDate: "",
  description: "",
};

const ExperienceForm: React.FC<Props> = ({ experiences, setExperiences }) => {
  const [draft, setDraft] = useState<Experience>(EMPTY_EXPERIENCE);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: keyof Experience) => {
    setDraft({ ...draft, [field]: e.target.value });
  };

  const isValid = draft.jobTitle.trim() !== "" && draft.companyName.trim() !== "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    if (editingId) {
      setExperiences(experiences.map((item) => (item.id === editingId ? { ...draft, id: editingId } : item)));
    } else {
      setExperiences([...experiences, { ...draft, id: createId() }]);
    }

    setDraft(EMPTY_EXPERIENCE);
    setEditingId(null);
  };

  const startEdit = (item: Experience) => {
    setDraft(item);
    setEditingId(item.id ?? null);
  };

  const cancelEdit = () => {
    setDraft(EMPTY_EXPERIENCE);
    setEditingId(null);
  };

  const remove = (id: string) => {
    setExperiences(experiences.filter((item) => item.id !== id));
    if (editingId === id) cancelEdit();
  };

  return (
    <div>
      {experiences.length === 0 ? (
        <p className="mb-4 rounded-xl bg-base-200 p-3 text-sm text-base-content/60">
          Aucune expérience pour le moment.
        </p>
      ) : (
        <ul className="mb-4 space-y-2">
          {experiences.map((item) => (
            <li
              key={item.id}
              className={`flex items-start justify-between gap-2 rounded-xl border p-3 ${
                editingId === item.id ? "border-primary bg-primary/5" : "border-base-300 bg-base-200"
              }`}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{item.jobTitle || "Sans intitulé"}</p>
                <p className="truncate text-xs text-base-content/60">
                  {[item.companyName, item.startDate && `de ${item.startDate}`, item.endDate && `à ${item.endDate}`]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => startEdit(item)}
                  className="btn btn-ghost btn-xs"
                  aria-label={`Modifier l’expérience ${item.jobTitle}`}
                >
                  <Pencil className="h-3 w-3" aria-hidden="true" />
                  Modifier
                </button>
                <button
                  type="button"
                  onClick={() => item.id && remove(item.id)}
                  className="btn btn-ghost btn-xs text-error"
                  aria-label={`Supprimer l’expérience ${item.jobTitle}`}
                >
                  <X className="h-3 w-3" aria-hidden="true" />
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <input
            type="text"
            placeholder="Poste occupé *"
            value={draft.jobTitle}
            onChange={(e) => handleChange(e, "jobTitle")}
            className="input input-bordered w-full"
            required
          />
          <input
            type="text"
            placeholder="Nom de l'entreprise *"
            value={draft.companyName}
            onChange={(e) => handleChange(e, "companyName")}
            className="input input-bordered w-full"
            required
          />
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <input
            type="date"
            placeholder="Date de début"
            value={draft.startDate}
            onChange={(e) => handleChange(e, "startDate")}
            className="input input-bordered w-full"
            aria-label="Date de début"
          />
          <input
            type="date"
            placeholder="Date de fin"
            value={draft.endDate}
            onChange={(e) => handleChange(e, "endDate")}
            className="input input-bordered w-full"
            aria-label="Date de fin"
          />
        </div>

        <textarea
          placeholder="Description"
          value={draft.description}
          onChange={(e) => handleChange(e, "description")}
          className="textarea textarea-bordered w-full"
          rows={3}
        />

        {!isValid && (
          <p className="text-xs text-base-content/60">
            Le poste et l’entreprise sont requis pour ajouter une expérience.
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <button type="submit" disabled={!isValid} className="btn btn-primary">
            {editingId ? "Enregistrer" : "Ajouter"}
            <Plus className="h-4 w-4" aria-hidden="true" />
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} className="btn btn-ghost">
              Annuler
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ExperienceForm;
