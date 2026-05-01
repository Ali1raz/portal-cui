/**
 * save-as-pdf.ts
 * Reusable utility for converting a DOM element to a PDF and downloading it.
 * Uses html2canvas-pro (oklch-safe) + jsPDF.
 *
 * Install deps:
 *   npm install html2canvas-pro jspdf
 */

export interface SaveAsPdfOptions {
  /** The filename (without .pdf extension) */
  filename?: string;
  /** Page format (default: "a4") */
  format?: "a4" | "letter";
  /** Orientation (default: "portrait") */
  orientation?: "portrait" | "landscape";
  /** Scale factor for canvas resolution (default: 2) */
  scale?: number;
  /** Extra padding in px on each side (default: 0) */
  padding?: number;
}

/**
 * Saves the contents of a DOM element as a PDF file.
 *
 * @param elementOrId  A direct HTMLElement or the string `id` of the element.
 * @param options      Customisation options.
 *
 * @example
 * // By ref:
 * await saveAsPdf(divRef.current, { filename: "fee-voucher" });
 *
 * @example
 * // By id:
 * await saveAsPdf("voucher-001", { filename: "installment-1" });
 */
export async function saveAsPdf(
  elementOrId: HTMLElement | string,
  options: SaveAsPdfOptions = {}
): Promise<void> {
  const {
    filename = "document",
    format = "a4",
    orientation = "portrait",
    scale = 2,
    padding = 0,
  } = options;

  // Dynamically import to avoid SSR issues (Next.js)
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import("html2canvas-pro"),
    import("jspdf"),
  ]);

  const element =
    typeof elementOrId === "string"
      ? document.getElementById(elementOrId)
      : elementOrId;

  if (!element) {
    throw new Error(
      `saveAsPdf: element "${elementOrId}" not found in the DOM.`
    );
  }

  // Page dimensions in mm
  const PAGE = {
    a4: { w: 210, h: 297 },
    letter: { w: 215.9, h: 279.4 },
  };

  const { w: pageW, h: pageH } =
    orientation === "landscape"
      ? { w: PAGE[format].h, h: PAGE[format].w }
      : PAGE[format];

  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    logging: false,
    backgroundColor: null, // preserves transparency / themed bg
  });

  const pdf = new jsPDF({
    orientation,
    unit: "mm",
    format,
  });

  const usableW = pageW - padding * 2;
  const usableH = pageH - padding * 2;

  const canvasW = canvas.width;
  const canvasH = canvas.height;

  const ratio = Math.min(usableW / canvasW, usableH / canvasH);

  const imgW = canvasW * ratio;
  const imgH = canvasH * ratio;

  const x = (pageW - imgW) / 2;
  const y = padding;

  // If content is taller than one page, split across pages
  const pageCount = Math.ceil(imgH / usableH);

  for (let page = 0; page < pageCount; page++) {
    if (page > 0) pdf.addPage();

    const srcY = (page * usableH) / ratio;
    const srcH = Math.min(usableH / ratio, canvasH - srcY);

    // Crop canvas for this page
    const pageCanvas = document.createElement("canvas");
    pageCanvas.width = canvasW;
    pageCanvas.height = srcH;
    const ctx = pageCanvas.getContext("2d");

    if (!ctx) {
      throw new Error("saveAsPdf: Failed to initialize canvas context.");
    }

    ctx.drawImage(canvas, 0, -srcY);

    const pageImgData = pageCanvas.toDataURL("image/png");
    const pageImgH = srcH * ratio;

    pdf.addImage(pageImgData, "PNG", x, y, imgW, pageImgH);
  }

  pdf.save(`${filename}.pdf`);
}
