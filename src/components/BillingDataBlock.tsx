interface BillingJob {
  customer_name?: string | null;
  company?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
  customer_street?: string | null;
  customer_house_number?: string | null;
  customer_postal_code?: string | null;
  customer_city?: string | null;
  einsatzort?: string | null;
}

const LEGAL_FORM_PATTERN = /\b(gmbh|ug|ag|kg|ohg|gbr|e\.?\s?k\.?|e\.?\s?v\.?|mbh|se|ltd|co\.?\s?kg|inh\.?|spedition|logistik|transporte?|bau|gesellschaft)\b/i;
const FREEMAIL_PATTERN = /@(gmail|googlemail|web|gmx|t-online|hotmail|outlook|yahoo|icloud|freenet|aol|mail)\./i;

function norm(v?: string | null) {
  return (v || "").toLowerCase().replace(/[^a-z0-9äöüß]/g, "");
}

export function BillingDataBlock({ job }: { job: BillingJob }) {
  const company = job.company?.trim() || "";
  const contact = job.customer_name?.trim() || "";
  const street = job.customer_street?.trim() || "";
  const house = job.customer_house_number?.trim() || "";
  const postal = job.customer_postal_code?.trim() || "";
  const city = job.customer_city?.trim() || "";
  const email = job.customer_email?.trim() || "";
  const phone = job.customer_phone?.trim() || "";
  const einsatzort = job.einsatzort?.trim() || "";

  const hasAddress = !!(street && house && postal && city);
  const recipient = company || contact;
  const companyIsOnlyPersonName = !company || norm(company) === norm(contact);
  const hasLegalForm = LEGAL_FORM_PATTERN.test(company);
  const emailLooksBusiness = !!email && !FREEMAIL_PATTERN.test(email);

  // Abweichung Rechnungsanschrift vs. Einsatzort
  let deviation: "Ja" | "Nein" | "Unklar" = "Unklar";
  if (hasAddress && einsatzort) {
    const eo = norm(einsatzort);
    deviation = eo.includes(norm(city)) && (!postal || eo.includes(postal)) ? "Nein" : "Ja";
  }

  const missing: string[] = [];
  if (!company && !contact) missing.push("Rechnungsempfänger");
  if (!contact) missing.push("Ansprechpartner");
  if (!street) missing.push("Straße");
  if (!house) missing.push("Hausnummer");
  if (!postal || !/^\d{5}$/.test(postal)) missing.push("PLZ (5-stellig)");
  if (!city) missing.push("Ort");
  if (!email) missing.push("E-Mail für Rechnung");
  if (!phone) missing.push("Telefon");

  const showLegalFormWarning = companyIsOnlyPersonName || !hasLegalForm;

  return (
    <div className="bg-white p-3 rounded border border-amber-200">
      <span className="text-sm font-semibold text-gray-700 block mb-2">🧾 Rechnungsdaten</span>

      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
        <div>
          <dt className="text-xs uppercase tracking-wide text-gray-500">Rechnungsempfänger</dt>
          <dd className="text-gray-900">
            {recipient
              ? companyIsOnlyPersonName
                ? `Rechnungsempfänger laut Datensatz: ${recipient}`
                : recipient
              : "Nicht hinterlegt"}
          </dd>
          {companyIsOnlyPersonName && (
            <dd className="text-xs text-amber-700">Firma/Rechtsform nicht hinterlegt</dd>
          )}
        </div>

        <div>
          <dt className="text-xs uppercase tracking-wide text-gray-500">Besteller / Ansprechpartner</dt>
          <dd className="text-gray-900">{contact || "Nicht hinterlegt"}</dd>
        </div>

        <div>
          <dt className="text-xs uppercase tracking-wide text-gray-500">Rechnungsanschrift</dt>
          <dd className="text-gray-900">
            {street || house ? (
              <>
                <span className="block">{[street, house].filter(Boolean).join(" ")}</span>
                <span className="block">{[postal, city].filter(Boolean).join(" ") || "PLZ/Ort fehlt"}</span>
              </>
            ) : (
              "Nicht hinterlegt"
            )}
          </dd>
        </div>

        <div>
          <dt className="text-xs uppercase tracking-wide text-gray-500">Einsatzort</dt>
          <dd className="text-gray-900">{einsatzort || "Nicht hinterlegt"}</dd>
        </div>

        <div>
          <dt className="text-xs uppercase tracking-wide text-gray-500">E-Mail für Rechnung</dt>
          <dd className="text-gray-900 break-all">{email || "Nicht hinterlegt"}</dd>
        </div>

        <div>
          <dt className="text-xs uppercase tracking-wide text-gray-500">Telefon</dt>
          <dd className="text-gray-900">{phone || "Nicht hinterlegt"}</dd>
        </div>

        <div className="sm:col-span-2">
          <dt className="text-xs uppercase tracking-wide text-gray-500">
            Rechnungsanschrift abweichend vom Einsatzort
          </dt>
          <dd className="text-gray-900 font-medium">{deviation}</dd>
        </div>
      </dl>

      {showLegalFormWarning && (
        <p className="mt-3 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded p-2">
          Rechnungsdaten prüfen: Firmenname/Rechtsform fehlt oder ist unklar.
          {emailLooksBusiness && (
            <>
              {" "}
              Hinweis: E-Mail-Domain deutet auf Unternehmen hin. Offizieller Firmenname/Rechtsform ist
              nicht hinterlegt. Vor Rechnungsstellung prüfen.
            </>
          )}
        </p>
      )}

      {missing.length > 0 && (
        <p className="mt-2 text-sm text-orange-700">
          Fehlende oder unklare Angaben: {missing.join(", ")}
        </p>
      )}
    </div>
  );
}