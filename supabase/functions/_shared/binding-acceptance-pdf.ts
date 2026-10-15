// Erzeugt die PDF-Annahmebestätigung (pdf-lib, Standardschrift WinAnsi: Umlaute, €, „“ unterstützt).
import { PDFDocument, StandardFonts, rgb } from "npm:pdf-lib@1.17.1";

export type PdfInput = {
  acceptedAtLocal: string;
  driverName: string;
  driverId: string;
  jobId: string;
  assignmentId: string;
  contractVersion: string;
  commissionPct: number;
  jobLines: [string, string][];
  contractText: string;
  consentText: string;
  contentHash: string;
};

function sanitize(s: string): string {
  // Zeichen außerhalb WinAnsi ersetzen, damit pdf-lib nicht abbricht
  return s
    .replace(/[\u2010-\u2012]/g, "-")
    .replace(/[^\x09\x0A\x0D\x20-\x7E\u00A0-\u00FF\u20AC\u201E\u201C\u201D\u2013\u2014\u2018\u2019\u201A\u2022\u2026]/g, "?");
}

export async function buildBindingAcceptancePdf(input: PdfInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle("Annahmebestätigung Fahrerauftrag");
  doc.setAuthor("Fahrerexpress | kraftfahrer-mieten.com");
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const W = 595.28, H = 841.89, M = 50, maxW = W - 2 * M;
  let page = doc.addPage([W, H]);
  let y = H - M;

  const newPageIfNeeded = (h: number) => {
    if (y - h < M) { page = doc.addPage([W, H]); y = H - M; }
  };
  const wrap = (text: string, f: typeof font, size: number): string[] => {
    const out: string[] = [];
    for (const para of sanitize(text).split("\n")) {
      let line = "";
      for (const word of para.split(/\s+/)) {
        const t = line ? `${line} ${word}` : word;
        if (f.widthOfTextAtSize(t, size) > maxW && line) { out.push(line); line = word; } else line = t;
      }
      out.push(line);
    }
    return out;
  };
  const write = (text: string, opts: { size?: number; f?: typeof font; gap?: number; color?: [number, number, number] } = {}) => {
    const size = opts.size ?? 10, f = opts.f ?? font;
    for (const l of wrap(text, f, size)) {
      newPageIfNeeded(size + 4);
      page.drawText(l, { x: M, y: y - size, size, font: f, color: rgb(...(opts.color ?? [0.13, 0.15, 0.2])) });
      y -= size + 4;
    }
    y -= opts.gap ?? 4;
  };

  write("ANNAHMEBESTÄTIGUNG – VERBINDLICHE AUFTRAGSANNAHME", { size: 15, f: bold, gap: 2 });
  write("Fahrerexpress | kraftfahrer-mieten.com", { size: 9, color: [0.4, 0.4, 0.45], gap: 12 });

  write("Annahme", { size: 12, f: bold });
  write(`Angenommen am: ${input.acceptedAtLocal}`);
  write(`Fahrer: ${input.driverName} (Fahrer-ID ${input.driverId})`);
  write(`Auftragsnummer: ${input.jobId}`);
  write(`Zuteilungsnummer: ${input.assignmentId}`);
  write(`Vertragsversion: ${input.contractVersion} · Provisionssatz: ${input.commissionPct} %`, { gap: 10 });

  write("Auftragsdaten", { size: 12, f: bold });
  for (const [k, v] of input.jobLines) write(`${k}: ${v}`, { gap: 1 });
  y -= 8;

  write("Vertragsbedingungen", { size: 12, f: bold });
  for (const block of input.contractText.split("\n\n")) {
    const [title, ...rest] = block.split("\n");
    write(title, { f: bold, gap: 1 });
    write(rest.join("\n"), { gap: 6 });
  }

  write("Zustimmungserklärung", { size: 12, f: bold });
  write(`[x] ${input.consentText}`, { gap: 10 });

  write(`Digitaler Fingerabdruck (SHA-256): ${input.contentHash}`, { size: 8, color: [0.4, 0.4, 0.45] });
  write("Dieses Dokument wurde automatisch erstellt und dokumentiert die elektronische Annahme über den persönlichen Bestätigungslink.", { size: 8, color: [0.4, 0.4, 0.45] });

  return await doc.save();
}
