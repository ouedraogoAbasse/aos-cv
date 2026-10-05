"use client";

import confetti from "canvas-confetti";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { usePersistentState } from "@/hooks/usePersistentState";
import { compressImage, dataUrlToFile, fileToDataUrl } from "@/lib/image";
import { exportElementToPdf } from "@/lib/pdf";
import {
  type PaymentMethod,
  type TokenStatus,
  TOKEN_STATUS_MESSAGES,
  clearPaymentToken,
  readPaymentToken,
  savePaymentToken,
  submitPayment,
  validatePaymentInput,
  verifyPaymentToken,
} from "@/lib/payment";
import {
  educationsPreset,
  experiencesPreset,
  hobbiesPreset,
  languagesPreset,
  personalDetailsPreset,
  skillsPreset,
} from "@/presets";
import type { Education, Experience, Hobby, Language, PersonalDetails, Skill } from "@/type";

const STORAGE_PREFIX = "aosc.";
const PHOTO_STORAGE_KEY = `${STORAGE_PREFIX}photo`;

export type PaymentDraft = {
  method: PaymentMethod;
  name: string;
  phone: string;
  reference: string;
  proof: File | null;
};

const EMPTY_PAYMENT_DRAFT: PaymentDraft = {
  method: "orange",
  name: "",
  phone: "",
  reference: "",
  proof: null,
};

type CVContextValue = {
  // Contenu du CV
  personalDetails: PersonalDetails;
  setPersonalDetails: React.Dispatch<React.SetStateAction<PersonalDetails>>;
  experiences: Experience[];
  setExperiences: React.Dispatch<React.SetStateAction<Experience[]>>;
  educations: Education[];
  setEducations: React.Dispatch<React.SetStateAction<Education[]>>;
  languages: Language[];
  setLanguages: React.Dispatch<React.SetStateAction<Language[]>>;
  skills: Skill[];
  setSkills: React.Dispatch<React.SetStateAction<Skill[]>>;
  hobbies: Hobby[];
  setHobbies: React.Dispatch<React.SetStateAction<Hobby[]>>;

  // Apparence
  photo: File | null;
  setPhoto: (file: File | null) => void;
  theme: string;
  setTheme: (theme: string) => void;
  zoom: number;
  setZoom: (zoom: number) => void;

  // Réinitialisations de section
  resetPersonalDetails: () => void;
  resetExperiences: () => void;
  resetEducations: () => void;
  resetLanguages: () => void;
  resetSkills: () => void;
  resetHobbies: () => void;

  // Paiement
  payment: PaymentDraft;
  setPayment: React.Dispatch<React.SetStateAction<PaymentDraft>>;
  /** État du paiement vis-à-vis du serveur (aucun jeton → "none"). */
  paymentStatus: TokenStatus | "none";
  paymentConfirmed: boolean;
  paymentError: string | null;
  isSubmittingPayment: boolean;
  confirmPayment: () => Promise<boolean>;

  // Export PDF
  previewRef: RefObject<HTMLDivElement | null>;
  downloadPdf: () => Promise<void>;
  isDownloading: boolean;
  downloadError: string | null;

  // Modales
  openPaymentModal: () => void;
  openPreviewModal: () => void;
  closePreviewModal: () => void;
};

const CVContext = createContext<CVContextValue | null>(null);

function openDialog(id: string) {
  const dialog = document.getElementById(id) as HTMLDialogElement | null;
  dialog?.showModal();
}

function closeDialog(id: string) {
  const dialog = document.getElementById(id) as HTMLDialogElement | null;
  if (dialog?.open) dialog.close();
}

export function CVProvider({ children }: { children: ReactNode }) {
  const [personalDetails, setPersonalDetails] = usePersistentState<PersonalDetails>(
    `${STORAGE_PREFIX}personalDetails`,
    personalDetailsPreset,
  );
  const [experiences, setExperiences] = usePersistentState<Experience[]>(
    `${STORAGE_PREFIX}experiences`,
    experiencesPreset,
  );
  const [educations, setEducations] = usePersistentState<Education[]>(
    `${STORAGE_PREFIX}educations`,
    educationsPreset,
  );
  const [languages, setLanguages] = usePersistentState<Language[]>(
    `${STORAGE_PREFIX}languages`,
    languagesPreset,
  );
  const [skills, setSkills] = usePersistentState<Skill[]>(
    `${STORAGE_PREFIX}skills`,
    skillsPreset,
  );
  const [hobbies, setHobbies] = usePersistentState<Hobby[]>(
    `${STORAGE_PREFIX}hobbies`,
    hobbiesPreset,
  );
  const [theme, setTheme] = usePersistentState<string>(`${STORAGE_PREFIX}theme`, "sunset");
  const [zoom, setZoom] = usePersistentState<number>(`${STORAGE_PREFIX}zoom`, 80);

  const [photo, setPhotoState] = useState<File | null>(null);
  const [photoReady, setPhotoReady] = useState(false);

  const [payment, setPayment] = useState<PaymentDraft>(EMPTY_PAYMENT_DRAFT);
  const [paymentStatus, setPaymentStatus] = useState<TokenStatus | "none">("none");
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);

  /* ------------------------------- Thème ------------------------------- */
  // Pas de synchronisation sur <html> : CVPreview porte déjà son propre
  // data-theme. On évite ainsi de re-styler tout le site quand l'utilisateur
  // choisit un thème pour son CV.

  /* --------------------------- Photo du CV ----------------------------- */

  useEffect(() => {
    let cancelled = false;

    const restore = async () => {
      try {
        const stored = window.localStorage.getItem(PHOTO_STORAGE_KEY);
        if (stored) {
          const file = dataUrlToFile(stored, "photo.jpg");
          if (!cancelled) setPhotoState(file);
          return;
        }
      } catch {
        // stockage illisible : on retombe sur la photo par défaut
      }

      try {
        const res = await fetch("/profile.jpg");
        if (!res.ok) throw new Error("Photo par défaut introuvable.");
        const blob = await res.blob();
        if (!cancelled) {
          setPhotoState(new File([blob], "profile.jpg", { type: blob.type || "image/jpeg" }));
        }
      } catch (error) {
        console.warn("[aosc] Photo par défaut indisponible :", error);
      }
    };

    void restore().finally(() => {
      if (!cancelled) setPhotoReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!photoReady || !photo) return;
    let cancelled = false;

    void (async () => {
      try {
        const dataUrl = await fileToDataUrl(photo);
        if (cancelled) return;
        window.localStorage.setItem(PHOTO_STORAGE_KEY, dataUrl);
      } catch {
        // Quota dépaséé : on retire la clé plutôt que de laisser des données corrompues.
        try {
          window.localStorage.removeItem(PHOTO_STORAGE_KEY);
        } catch {
          // ignore
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [photo, photoReady]);

  const setPhoto = useCallback((file: File | null) => {
    if (!file) {
      setPhotoState(null);
      try {
        window.localStorage.removeItem(PHOTO_STORAGE_KEY);
      } catch {
        // ignore
      }
      return;
    }
    // Compression avant stockage : localStorage fait ~5 Mo au total.
    void compressImage(file).then((compressed) => setPhotoState(compressed));
  }, []);

  /* --------------------------- Session payée --------------------------- */

  /** Applique un statut retourné par le serveur aux états locaux. */
  const applyStatus = useCallback((status: TokenStatus) => {
    setPaymentStatus(status);
    setPaymentConfirmed(status === "valid");

    if (status === "invalid") {
      // Jeton inconnu / expiré côté navigateur : on purge pour éviter une boucle.
      clearPaymentToken();
    }
  }, []);

  useEffect(() => {
    const token = readPaymentToken();
    if (!token) return;
    void verifyPaymentToken(token).then(applyStatus);
  }, [applyStatus]);

  /** Re-vérifie le jeton auprès du serveur. Renvoie le statut courant. */
  const ensureAuthorized = useCallback(async (): Promise<TokenStatus> => {
    const token = readPaymentToken();
    if (!token) {
      applyStatus("invalid");
      return "invalid";
    }

    const status = await verifyPaymentToken(token);
    applyStatus(status);
    return status;
  }, [applyStatus]);

  /* ---------------------------- Réinitialisations ---------------------- */

  const resetPersonalDetails = useCallback(() => {
    setPersonalDetails({
      fullName: "",
      email: "",
      phone: "",
      address: "",
      photoUrl: "",
      postSeeking: "",
      description: "",
    });
  }, [setPersonalDetails]);

  const resetExperiences = useCallback(() => setExperiences([]), [setExperiences]);
  const resetEducations = useCallback(() => setEducations([]), [setEducations]);
  const resetLanguages = useCallback(() => setLanguages([]), [setLanguages]);
  const resetSkills = useCallback(() => setSkills([]), [setSkills]);
  const resetHobbies = useCallback(() => setHobbies([]), [setHobbies]);

  /* ------------------------------ Paiement ----------------------------- */

  const confirmPayment = useCallback(async (): Promise<boolean> => {
    setPaymentError(null);

    const validationError = validatePaymentInput({
      method: payment.method,
      name: payment.name,
      phone: payment.phone,
      reference: payment.reference,
      proofType: payment.proof?.type ?? null,
    });

    if (validationError) {
      setPaymentError(validationError);
      return false;
    }
    if (!payment.proof) {
      setPaymentError("Veuillez joindre une preuve de paiement avant de valider votre achat.");
      return false;
    }

    setIsSubmittingPayment(true);
    try {
      const proof = await compressImage(payment.proof, 1600, 0.85);
      const result = await submitPayment({
        method: payment.method,
        name: payment.name.trim(),
        phone: payment.phone.trim(),
        reference: payment.reference.trim(),
        proof,
      });

      if (!result.ok) {
        setPaymentError(result.error);
        return false;
      }

      savePaymentToken(result.token);
      // Le paiement est transmis : il doit être validé manuellement par l'admin.
      setPaymentStatus("pending");
      setPaymentConfirmed(false);
      setPayment((current) => ({ ...EMPTY_PAYMENT_DRAFT, method: current.method }));
      return true;
    } finally {
      setIsSubmittingPayment(false);
    }
  }, [payment]);

  /* ------------------------------- Export ------------------------------ */

  const getPreviewElement = useCallback(async (): Promise<HTMLDivElement | null> => {
    if (previewRef.current) return previewRef.current;
    // La modale de prévisualisation n'est pas encore montée : on l'ouvre et on laisse React la rendre.
    openDialog("preview_modal");
    await new Promise((resolve) => setTimeout(resolve, 350));
    return previewRef.current;
  }, []);

  const downloadPdf = useCallback(async () => {
    if (isDownloading) return;
    setDownloadError(null);

    const status = await ensureAuthorized();

    if (status !== "valid") {
      // `pending` / `rejected` : la bannière de la modale d'aperçu explique
      // déjà la situation — inutile de redemander un paiement déjà effectué.
      if (status === "pending" || status === "rejected") return;

      if (status === "offline") {
        setDownloadError(TOKEN_STATUS_MESSAGES.offline ?? "Téléchargement indisponible.");
        return;
      }

      // Aucun paiement (ou jeton inconnu / expiré) → on propose de payer.
      openDialog("payment_modal");
      return;
    }

    setIsDownloading(true);
    try {
      const element = await getPreviewElement();
      if (!element) throw new Error("Prévisualisation introuvable pour l'export PDF.");

      await exportElementToPdf(element, { filename: "cv.pdf", scale: 2 });

      void confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, zIndex: 9999 });
    } catch (error) {
      console.error("[aosc] Export PDF impossible :", error);
      setDownloadError(
        error instanceof Error
          ? `Export impossible : ${error.message}`
          : "Export impossible. Réessayez ou rafraîchissez la page.",
      );
    } finally {
      setIsDownloading(false);
    }
  }, [ensureAuthorized, getPreviewElement, isDownloading]);

  /* ------------------------------ Modales ------------------------------ */

  const openPaymentModal = useCallback(() => {
    setPaymentError(null);
    openDialog("payment_modal");
  }, []);

  const openPreviewModal = useCallback(() => openDialog("preview_modal"), []);
  const closePreviewModal = useCallback(() => closeDialog("preview_modal"), []);

  const value: CVContextValue = {
    personalDetails,
    setPersonalDetails,
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
    photo,
    setPhoto,
    theme,
    setTheme,
    zoom,
    setZoom,
    resetPersonalDetails,
    resetExperiences,
    resetEducations,
    resetLanguages,
    resetSkills,
    resetHobbies,
    payment,
    setPayment,
    paymentStatus,
    paymentConfirmed,
    paymentError,
    isSubmittingPayment,
    confirmPayment,
    previewRef,
    downloadPdf,
    isDownloading,
    downloadError,
    openPaymentModal,
    openPreviewModal,
    closePreviewModal,
  };

  return <CVContext.Provider value={value}>{children}</CVContext.Provider>;
}

export function useCV(): CVContextValue {
  const context = useContext(CVContext);
  if (!context) {
    throw new Error("useCV doit être utilisé à l'intérieur de <CVProvider>.");
  }
  return context;
}
