import React from "react";

interface DriverLocationBlockProps {
  adresse?: string | null;
  plz?: string | null;
  ort?: string | null;
  email?: string | null;
  telefon?: string | null;
  fuehrerscheinklassen?: string[] | null;
  compact?: boolean;
}

/**
 * Zeigt den gespeicherten Fahrerstandort eindeutig an.
 * Es werden ausschließlich gespeicherte Daten angezeigt – keine Ableitungen.
 * Fehlt der Standort, wird explizit darauf hingewiesen, dass Anfahrtskosten
 * nicht berechenbar sind.
 */
export const isDriverLocationComplete = (
  adresse?: string | null,
  plz?: string | null,
  ort?: string | null
) => Boolean(adresse?.trim() && plz?.trim() && ort?.trim());

export const DriverLocationBlock: React.FC<DriverLocationBlockProps> = ({
  adresse,
  plz,
  ort,
  email,
  telefon,
  fuehrerscheinklassen,
  compact = false,
}) => {
  const complete = isDriverLocationComplete(adresse, plz, ort);
  const hasAny = Boolean(adresse?.trim() || plz?.trim() || ort?.trim());

  return (
    <div
      className={`rounded border p-2 text-xs space-y-1 ${
        complete ? "border-border bg-muted/40" : "border-destructive/40 bg-destructive/5"
      }`}
    >
      <div className="font-semibold uppercase tracking-wide text-[10px] text-muted-foreground">
        Standort Fahrer (An-/Abfahrt)
      </div>

      {hasAny ? (
        <div className="space-y-0.5">
          <div>
            <span className="text-muted-foreground">Straße/Hausnr.: </span>
            {adresse?.trim() ? adresse : <span className="text-destructive">fehlt</span>}
          </div>
          <div>
            <span className="text-muted-foreground">PLZ / Ort: </span>
            {plz?.trim() || ort?.trim() ? (
              `${plz ?? ""} ${ort ?? ""}`.trim()
            ) : (
              <span className="text-destructive">fehlt</span>
            )}
          </div>
          <div>
            <span className="text-muted-foreground">Land: </span>
            <span className="text-muted-foreground">nicht erfasst</span>
          </div>
        </div>
      ) : (
        <div className="text-destructive font-medium">
          Keine Adresse gespeichert – Anfahrtskosten noch nicht berechenbar – Fahrerstandort fehlt.
        </div>
      )}

      {!compact && (
        <div className="pt-1 space-y-0.5 border-t border-dashed border-border/60">
          <div>
            <span className="text-muted-foreground">E-Mail: </span>
            {email || "-"}
          </div>
          <div>
            <span className="text-muted-foreground">Telefon: </span>
            {telefon || "-"}
          </div>
          <div>
            <span className="text-muted-foreground">Führerscheinklassen: </span>
            {fuehrerscheinklassen?.join(", ") || "-"}
          </div>
        </div>
      )}

      {hasAny && !complete && (
        <div className="text-destructive font-medium">
          Anfahrtskosten noch nicht berechenbar – Fahrerstandort fehlt.
        </div>
      )}
    </div>
  );
};

export default DriverLocationBlock;
