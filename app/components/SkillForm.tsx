"use client";

import { Skill } from "@/type";
import { createId } from "@/lib/id";
import { Pencil, Plus, X } from "lucide-react";
import React, { useState } from "react";

type Props = {
  skills: Skill[];
  setSkills: (skills: Skill[]) => void;
};

const EMPTY_SKILL: Skill = { name: "" };

const SkillForm: React.FC<Props> = ({ skills, setSkills }) => {
  const [draft, setDraft] = useState<Skill>(EMPTY_SKILL);
  const [editingId, setEditingId] = useState<string | null>(null);

  const isValid = draft.name.trim() !== "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    if (editingId) {
      setSkills(skills.map((item) => (item.id === editingId ? { ...draft, id: editingId } : item)));
    } else {
      setSkills([...skills, { ...draft, id: createId() }]);
    }

    setDraft(EMPTY_SKILL);
    setEditingId(null);
  };

  const startEdit = (item: Skill) => {
    setDraft(item);
    setEditingId(item.id ?? null);
  };

  const cancelEdit = () => {
    setDraft(EMPTY_SKILL);
    setEditingId(null);
  };

  const remove = (id: string) => {
    setSkills(skills.filter((item) => item.id !== id));
    if (editingId === id) cancelEdit();
  };

  return (
    <div>
      {skills.length > 0 && (
        <ul className="mb-4 flex flex-wrap gap-2">
          {skills.map((item) => (
            <li
              key={item.id}
              className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-sm ${
                editingId === item.id ? "border-primary bg-primary/10" : "border-base-300 bg-base-200"
              }`}
            >
              <span className="max-w-[10rem] truncate">{item.name}</span>
              <button
                type="button"
                onClick={() => startEdit(item)}
                className="btn btn-ghost btn-xs"
                aria-label={`Modifier la compétence ${item.name}`}
              >
                <Pencil className="h-3 w-3" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => item.id && remove(item.id)}
                className="btn btn-ghost btn-xs text-error"
                aria-label={`Supprimer la compétence ${item.name}`}
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Compétence *"
          value={draft.name}
          onChange={(e) => setDraft({ name: e.target.value })}
          className="input input-bordered w-full"
          required
        />

        {!isValid && (
          <p className="mt-2 text-xs text-base-content/60">
            Renseignez une compétence pour l’ajouter.
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
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

export default SkillForm;
