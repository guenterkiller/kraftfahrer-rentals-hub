import React from "react";

interface DriverLocationBlockProps {
  strasse?: string | null;
  hausnummer?: string | null;
  adresse?: string | null;
  plz?: string | null;
  ort?: string | null;
  land?: string | null;
  email?: string | null;
  telefon?: string | null;
  fuehrerscheinklassen?: string[] | null;
  compact?: boolean;
}

const NOT_SET = "nicht erfasst";

/**
 * Zeigt den gespeicherten Fahrerstandort eindeutig an.
 * Es werden ausschließlich gespeicherte Daten angezeigt – keine Ableitungen.
 * Fehlt der Standort, wird explizit darauf hingewiesen, dass Anfahrtskosten
 * nicht berechenbar sind.
 */
export const isDriverLocationComplete = (
  strasse?: string | null,
  hausnummer?: string | null,
  plz?: string | null,
  ort?: string | null,
  land?: string | null
) =>
  Boolean(
    strasse?.trim() && hausnummer?.trim() && plz?.trim() && ort?.trim() && land?.trim()
  );

export const DriverLocationBlock: React.FC<DriverLocationBlockProps> = ({
  strasse,
  hausnummer,
  adresse,
  plz,
  ort,
  land,
  email,
  telefon,
  fuehrerscheinklassen,
  compact = false,
}) => {
  const complete = isDriverLocationComplete(strasse, hausnummer, plz, ort, land);
  const hasAny = Boolean(
    strasse?.trim() || hausnummer?.trim() || adresse?.trim() || plz?.trim() || ort?.trim() || land?.trim()
  );

  const Value = ({ value }: { value?: string | null }) =>
    value?.trim() ? <>{value}</> : <span className="text-destructive">{NOT_SET}</span>;

  return (
    <div
      className={`rounded border p-2 text-xs space-y-1 ${
        complete ? "border-border bg-muted/40" : "border-destructive/40 bg-destructive/5"
      }`}
    >
      <div className="font-semibold uppercase tracking-wide text-[10px] text-muted-foreground">
        Standort Fahrer (An-/Abfahrt)
      </div>

      <div className="space-y-0.5">
        <div>
          <span className="text-muted-foreground">Straße: </span>
          <Value value={strasse} />
        </div>
        <div>
          <span className="text-muted-foreground">Hausnummer: </span>
          <Value value={hausnummer} />
        </div>
        <div>
          <span className="text-muted-foreground">PLZ: </span>
          <Value value={plz} />
        </div>
        <div>
          <span className="text-muted-foreground">Ort: </span>
          <Value value={ort} />
        </div>
        <div>
          <span className="text-muted-foreground">Land: </span>
          <Value value={land} />
        </div>
        {adresse?.trim() && !strasse?.trim() && (
          <div>
            <span className="text-muted-foreground">Altdaten-Adresse: </span>
            {adresse}
          </div>
        )}
      </div>

      {!compact && (
        <div className="pt-1 space-y-0.5 border-t border-dashed border-border/60">
          <div>
            <span className="text-muted-foreground">E-Mail: </span>
            <Value value={email} />
          </div>
          <div>
            <span className="text-muted-foreground">Telefon: </span>
            <Value value={telefon} />
          </div>
          <div>
            <span className="text-muted-foreground">Führerscheinklassen: </span>
            {fuehrerscheinklassen?.length ? (
              fuehrerscheinklassen.join(", ")
            ) : (
              <span className="text-destructive">{NOT_SET}</span>
            )}
          </div>
        </div>
      )}

      {!complete && (
        <div className="text-destructive font-medium">
          {hasAny
            ? "Keine vollständige Fahreradresse gespeichert – Anfahrtskosten noch nicht berechenbar."
            : "Keine Fahreradresse gespeichert – Anfahrtskosten noch nicht berechenbar."}
        </div>
      )}
    </div>
  );
};

export default DriverLocationBlock;
