// supabase/functions/send-driver-confirmation/pdf.ts
// Minimaler Text-PDF-Generator (fallback). Wenn ihr bereits HTML→PDF habt, könnt ihr das hier ersetzen.

import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";

export async function htmlToSimplePdf(html: string, plain: string): Promise<Uint8Array> {
  // Wir nehmen die Plaintext-Version für die PDF, damit es überall sicher funktioniert.
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 11;
  const margin = 40;
  const maxWidth = page.getWidth() - margin * 2;

  const text = plain.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n");

  // einfache Zeilenumbruch-Logik
  const lines: string[] = [];
  text.split("\n").forEach((line) => {
    let current = line;
    while (font.widthOfTextAtSize(current, fontSize) > maxWidth) {
      let cut = current.length;
      while (cut > 0 && font.widthOfTextAtSize(current.slice(0, cut), fontSize) > maxWidth) cut--;
      // rückwärts bis Space
      while (cut > 0 && current[cut] !== " ") cut--;
      if (cut <= 0) break;
      lines.push(current.slice(0, cut));
      current = current.slice(cut + 1);
    }
    lines.push(current);
  });

  let y = page.getHeight() - margin;
  page.drawText("Einsatzbestätigung – Fahrerexpress", { x: margin, y, size: 16, font, color: rgb(0, 0, 0) });
  y -= 22;

  for (const ln of lines) {
    if (y < margin + 20) {
      // neue Seite
      const p = pdfDoc.addPage([595.28, 841.89]);
      y = p.getHeight() - margin;
      p.drawText(ln, { x: margin, y, size: fontSize, font });
      page.setSize(p.getSize()); // keep reference
    } else {
      page.drawText(ln, { x: margin, y, size: fontSize, font });
    }
    y -= 14;
  }

  return new Uint8Array(await pdfDoc.save());
}