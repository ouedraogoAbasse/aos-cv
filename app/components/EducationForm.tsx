"use client";

import { Education } from "@/type";
import { createId } from "@/lib/id";
import { Pencil, Plus, X } from "lucide-react";
import React, { useState } from "react";

type Props = {
  educations: Education[];
  setEducations: (educations: Education[]) => void;
};

const EMPTY_EDUCATION: Education = {
  school: "",
  degree: "",
  startDate: "",
  endDate: "",
  description: "",
};

const EducationForm: React.FC<Props> = ({ educations, setEducations }) => {
  const [draft, setDraft] = useState<Education>(EMPTY_EDUCATION);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: keyof Education) => {
    setDraft({ ...draft, [field]: e.target.value });
  };

  const isValid = draft.school.trim() !== "" && draft.degree.trim() !== "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    if (editingId) {
      setEducations(educations.map((item) => (item.id === editingId ? { ...draft, id: editingId } : item)));
    } else {
      setEducations([...educations, { ...draft, id: createId() }]);
    }

    setDraft(EMPTY_EDUCATION);
    setEditingId(null);
  };

  const startEdit = (item: Education) => {
    setDraft(item);
    setEditingId(item.id ?? null);
  };

  const cancelEdit = () => {
    setDraft(EMPTY_EDUCATION);
    setEditingId(null);
  };

  const remove = (id: string) => {
    setEducations(educations.filter((item) => item.id !== id));
    if (editingId === id) cancelEdit();
  };

  return (
    <div>
      {educations.length === 0 ? (
        <p className="mb-4 rounded-xl bg-base-200 p-3 text-sm text-base-content/60">
          Aucune formation pour le moment.
        </p>
      ) : (
        <ul className="mb-4 space-y-2">
          {educations.map((item) => (
            <li
              key={item.id}
              className={`flex items-start justify-between gap-2 rounded-xl border p-3 ${
                editingId === item.id ? "border-primary bg-primary/5" : "border-base-300 bg-base-200"
              }`}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{item.degree || "Sans diplôme"}</p>
                <p className="truncate text-xs text-base-content/60">{item.school}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => startEdit(item)}
                  className="btn btn-ghost btn-xs"
                  aria-label={`Modifier la formation ${item.degree}`}
                >
                  <Pencil className="h-3 w-3" aria-hidden="true" />
                  Modifier
                </button>
                <button
                  type="button"
                  onClick={() => item.id && remove(item.id)}
                  className="btn btn-ghost btn-xs text-error"
                  aria-label={`Supprimer la formation ${item.degree}`}
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
            placeholder="Nom de l'école *"
            value={draft.school}
            onChange={(e) => handleChange(e, "school")}
            className="input input-bordered w-full"
            required
          />
          <input
            type="text"
            placeholder="Diplôme *"
            value={draft.degree}
            onChange={(e) => handleChange(e, "degree")}
            className="input input-bordered w-full"
            required
          />
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <input
            type="date"
            value={draft.startDate}
            onChange={(e) => handleChange(e, "startDate")}
            className="input input-bordered w-full"
            aria-label="Date de début"
          />
          <input
            type="date"
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
            L’école et le diplôme sont requis pour ajouter une formation.
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

export default EducationForm;
