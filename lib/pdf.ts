import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

type ExportOptions = {
  filename?: string;
  /** Qualité de rendu du canvas. 2 = bon compromis qualité/poids/mémoire. */
  scale?: number;
};

/**
 * Exporte un élément DOM en PDF A4 **multi-pages**.
 *
 * L'ancienne version faisait un unique `addImage` sur toute la hauteur :
 * tout ce qui dépassait d'une page A4 était rogné ou étiré.
 * Ici on découpe le canvas en tranches de la hauteur d'une page.
 */
export async function exportElementToPdf(
  element: HTMLElement,
  { filename = "cv.pdf", scale = 2 }: ExportOptions = {},
): Promise<number> {
  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
  });

  if (canvas.width === 0 || canvas.height === 0) {
    throw new Error("La prévisualisation est vide, export impossible.");
  }

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "A4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Combien de millimètres représentent 1 pixel du canvas.
  const mmPerPixel = pageWidth / canvas.width;
  // Hauteur (en pixels du canvas) correspondant à une page A4.
  const pageHeightPx = Math.ceil(pageHeight / mmPerPixel);

  let offset = 0;
  let pageNumber = 0;

  while (offset < canvas.height) {
    const sliceHeight = Math.min(pageHeightPx, canvas.height - offset);

    const slice = document.createElement("canvas");
    slice.width = canvas.width;
    slice.height = sliceHeight;

    const ctx = slice.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D indisponible pour l'export PDF.");

    // Fond blanc : les JPEG ne gèrent pas la transparence.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, slice.width, slice.height);
    ctx.drawImage(
      canvas,
      0,
      offset,
      canvas.width,
      sliceHeight,
      0,
      0,
      canvas.width,
      sliceHeight,
    );

    if (pageNumber > 0) pdf.addPage();

    pdf.addImage(
      slice.toDataURL("image/jpeg", 0.92),
      "JPEG",
      0,
      0,
      pageWidth,
      sliceHeight * mmPerPixel,
    );

    offset += sliceHeight;
    pageNumber += 1;
  }

  pdf.save(filename);
  return pageNumber;
}
