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

const LEGAL_FORM_PATTERN =
  /(\beG\b|\bgmbh\b|\bug\b|\bag\b|\bkg\b|\bohg\b|\bgbr\b|\bmbh\b|\bse\b|\bltd\b|\bkgaa\b|\be\.?\s?k\.?(\s|$)|\be\.?\s?v\.?(\s|$)|\bstiftung\b|\bgenossenschaft\b|\bgesellschaft\b|\bco\.?\s?kg\b|\binh\.?\b|\bspedition\b|\blogistik\b|\btransporte?\b)/i;
const FREEMAIL_PATTERN = /@(gmail|googlemail|web|gmx|t-online|hotmail|outlook|yahoo|icloud|freenet|aol|mail)\./i;

function norm(v?: string | null) {
  return (v || "").toLowerCase().replace(/[^a-z0-9äöüß]/g, "");
}

function splitStreet(street: string): { street: string; house: string } | null {
  const m = street.trim().match(/^(.*?[^\d\s].*?)\s+(\d+\s*[a-zA-Z]?(?:\s*[-/]\s*\d+\s*[a-zA-Z]?)?)$/);
  if (!m) return null;
  return { street: m[1].trim(), house: m[2].replace(/\s+/g, "") };
}

function Field({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  const missing = !value;
  return (
    <div className={className}>
      <dt className="text-xs font-semibold uppercase tracking-wide text-gray-600">{label}</dt>
      <dd
        className={
          missing
            ? "text-base font-semibold text-orange-700"
            : "text-base sm:text-lg font-semibold text-black break-words"
        }
      >
        {missing ? "Fehlt" : value}
      </dd>
    </div>
  );
}

export function BillingDataBlock({ job }: { job: BillingJob }) {
  const company = job.company?.trim() || "";
  const contact = job.customer_name?.trim() || "";
  const rawStreet = job.customer_street?.trim() || "";
  const rawHouse = job.customer_house_number?.trim() || "";
  const postal = job.customer_postal_code?.trim() || "";
  const city = job.customer_city?.trim() || "";
  const email = job.customer_email?.trim() || "";
  const phone = job.customer_phone?.trim() || "";
  const einsatzort = job.einsatzort?.trim() || "";

  // Straße/Hausnummer trennen, wenn nur gemeinsam gespeichert
  let street = rawStreet;
  let house = rawHouse;
  let combinedOnly = false;
  if (!house && rawStreet) {
    const parts = splitStreet(rawStreet);
    if (parts) {
      street = parts.street;
      house = parts.house;
    } else {
      combinedOnly = true;
    }
  }

  const hasAddress = !!(street && house && postal && city);
  const recipient = company || contact;
  const companyIsOnlyPersonName = !company || norm(company) === norm(contact);
  const hasLegalForm = LEGAL_FORM_PATTERN.test(recipient);
  const emailLooksBusiness = !!email && !FREEMAIL_PATTERN.test(email);
  const emailDomain = email.includes("@") ? email.split("@")[1]?.trim().toLowerCase() || "" : "";

  // Abweichung Rechnungsanschrift vs. Einsatzort
  let deviation: "Ja" | "Nein" | "Unklar" = "Unklar";
  if (hasAddress && einsatzort) {
    const eo = norm(einsatzort);
    deviation = eo.includes(norm(city)) && (!postal || eo.includes(postal)) ? "Nein" : "Ja";
  }

  const missing: string[] = [];
  if (!recipient) missing.push("Rechnungsempfänger");
  if (!street && !combinedOnly) missing.push("Straße");
  if (!house && !combinedOnly) missing.push("Hausnummer");
  if (!postal || !/^\d{5}$/.test(postal)) missing.push("PLZ (5-stellig)");
  if (!city) missing.push("Ort");

  // Warnung nur, wenn nur Personenname hinterlegt ist UND die E-Mail-Domain auf eine Firma deutet
  const showLegalFormWarning = !hasLegalForm && companyIsOnlyPersonName && emailLooksBusiness;

  return (
    <div className="bg-white p-3 rounded border border-amber-200">
      <span className="text-base font-bold text-black block mb-3">🧾 Rechnungsdaten</span>

      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
        <Field label="Rechnungsempfänger" value={recipient} className="sm:col-span-2" />

        {combinedOnly ? (
          <Field label="Straße / Hausnummer" value={rawStreet} className="sm:col-span-2" />
        ) : (
          <>
            <Field label="Straße" value={street} />
            <Field label="Hausnummer" value={house} />
          </>
        )}

        <Field label="Postleitzahl" value={postal} />
        <Field label="Ort" value={city} />

        <Field label="E-Mail für Rechnung" value={email} className="break-all" />
        <Field label="Besteller / Ansprechpartner" value={contact} />
        <Field label="Telefon" value={phone} />
        <Field label="Einsatzort" value={einsatzort} />

        <div className="sm:col-span-2">
          <dt className="text-xs font-semibold uppercase tracking-wide text-gray-600">
            Rechnungsanschrift abweichend vom Einsatzort
          </dt>
          <dd className="text-base font-semibold text-black">{deviation}</dd>
        </div>
      </dl>

      {showLegalFormWarning && (
        <div className="mt-3 text-sm text-amber-900 bg-amber-50 border border-amber-300 rounded p-2">
          <p className="font-bold text-orange-800">
            Firma fehlt – vor Rechnungserstellung beim Kunden bestätigen.
          </p>
          <p className="mt-1">
            Es ist nur ein Personenname hinterlegt, die E-Mail-Domain deutet jedoch auf ein
            Unternehmen hin. Offizieller Firmenname/Rechtsform vor Rechnungsstellung prüfen.
          </p>
          {emailDomain && (
            <p className="mt-1 font-semibold text-black">E-Mail-Domain: {emailDomain}</p>
          )}
        </div>
      )}

      {missing.length > 0 && (
        <p className="mt-2 text-sm font-semibold text-orange-700">
          Rechnungsdaten unvollständig – vor Rechnungsstellung prüfen: {missing.join(", ")}
        </p>
      )}
    </div>
  );
}