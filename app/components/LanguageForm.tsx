"use client";

import { Language } from "@/type";
import { createId } from "@/lib/id";
import { Pencil, Plus, X } from "lucide-react";
import React, { useState } from "react";

type Props = {
  languages: Language[];
  setLanguages: (languages: Language[]) => void;
};

const EMPTY_LANGUAGE: Language = { language: "", proficiency: "" };

const LanguageForm: React.FC<Props> = ({ languages, setLanguages }) => {
  const [draft, setDraft] = useState<Language>(EMPTY_LANGUAGE);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, field: keyof Language) => {
    setDraft({ ...draft, [field]: e.target.value });
  };

  const isValid = draft.language.trim() !== "" && draft.proficiency !== "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    if (editingId) {
      setLanguages(languages.map((item) => (item.id === editingId ? { ...draft, id: editingId } : item)));
    } else {
      setLanguages([...languages, { ...draft, id: createId() }]);
    }

    setDraft(EMPTY_LANGUAGE);
    setEditingId(null);
  };

  const startEdit = (item: Language) => {
    setDraft(item);
    setEditingId(item.id ?? null);
  };

  const cancelEdit = () => {
    setDraft(EMPTY_LANGUAGE);
    setEditingId(null);
  };

  const remove = (id: string) => {
    setLanguages(languages.filter((item) => item.id !== id));
    if (editingId === id) cancelEdit();
  };

  return (
    <div className="space-y-4">
      {languages.length > 0 && (
        <ul className="space-y-2">
          {languages.map((item) => (
            <li
              key={item.id}
              className={`flex items-center justify-between gap-2 rounded-xl border p-3 ${
                editingId === item.id ? "border-primary bg-primary/5" : "border-base-300 bg-base-200"
              }`}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{item.language}</p>
                <p className="truncate text-xs text-base-content/60">{item.proficiency}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => startEdit(item)}
                  className="btn btn-ghost btn-xs"
                  aria-label={`Modifier la langue ${item.language}`}
                >
                  <Pencil className="h-3 w-3" aria-hidden="true" />
                  Modifier
                </button>
                <button
                  type="button"
                  onClick={() => item.id && remove(item.id)}
                  className="btn btn-ghost btn-xs text-error"
                  aria-label={`Supprimer la langue ${item.language}`}
                >
                  <X className="h-3 w-3" aria-hidden="true" />
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Langue *"
          value={draft.language}
          onChange={(e) => handleChange(e, "language")}
          className="input input-bordered w-full"
          required
        />
        <select
          value={draft.proficiency}
          onChange={(e) => handleChange(e, "proficiency")}
          className="select select-bordered w-full"
          aria-label="Niveau de maîtrise"
          required
        >
          <option value="">Sélectionner la maîtrise</option>
          <option value="Débutant">Débutant</option>
          <option value="Intermédiaire">Intermédiaire</option>
          <option value="Avancé">Avancé</option>
        </select>

        {!isValid && (
          <p className="text-xs text-base-content/60">
            La langue et le niveau sont requis pour ajouter une langue.
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

export default LanguageForm;
