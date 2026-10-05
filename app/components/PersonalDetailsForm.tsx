"use client";

import { PersonalDetails } from "@/type";
import React from "react";

type Props = {
  personalDetails: PersonalDetails;
  setPersonalDetails: (pd: PersonalDetails) => void;
  setFile: (file: File | null) => void;
};

const PersonalDetailsForm: React.FC<Props> = ({ personalDetails, setPersonalDetails, setFile }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: keyof PersonalDetails) => {
    setPersonalDetails({ ...personalDetails, [field]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) setFile(selectedFile);
  };

  return (
    <div className="flex flex-col gap-4">
      <input
        type="text"
        placeholder="Nom complet"
        value={personalDetails.fullName}
        onChange={(e) => handleChange(e, "fullName")}
        autoComplete="name"
        className="input input-bordered w-full"
      />

      <div className="flex flex-col gap-4 sm:flex-row">
        <input
          type="email"
          placeholder="Email"
          value={personalDetails.email}
          onChange={(e) => handleChange(e, "email")}
          autoComplete="email"
          className="input input-bordered w-full"
        />
        <input
          type="tel"
          placeholder="Numéro de téléphone"
          value={personalDetails.phone}
          onChange={(e) => handleChange(e, "phone")}
          autoComplete="tel"
          className="input input-bordered w-full"
        />
      </div>

      <input
        type="text"
        placeholder="Adresse"
        value={personalDetails.address}
        onChange={(e) => handleChange(e, "address")}
        autoComplete="street-address"
        className="input input-bordered w-full"
      />

      <div>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="file-input file-input-bordered w-full file-input-primary"
          aria-label="Photo du CV"
        />
        <p className="mt-2 text-xs text-base-content/60">
          Photo carrée de préférence, 1 Mo maximum (elle est automatiquement réduite).
        </p>
      </div>

      <input
        type="text"
        placeholder="Poste recherché"
        value={personalDetails.postSeeking}
        onChange={(e) => handleChange(e, "postSeeking")}
        className="input input-bordered w-full"
      />

      <textarea
        placeholder="Description de la personne"
        value={personalDetails.description}
        onChange={(e) => handleChange(e, "description")}
        className="textarea textarea-bordered w-full"
        rows={4}
      />
    </div>
  );
};

export default PersonalDetailsForm;
