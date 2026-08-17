import type { TarifText } from "@/lib/tarifTexte";

interface TarifCardTextProps {
  tarif: TarifText;
  amountClassName?: string;
  unitClassName?: string;
  detailClassName?: string;
}

/**
 * Einheitliche Darstellung eines Preisschilds / einer Tarifkarte.
 * Texte kommen ausschließlich aus src/lib/tarifTexte.ts.
 */
const TarifCardText = ({
  tarif,
  amountClassName = "text-4xl font-bold text-foreground",
  unitClassName = "text-sm font-medium text-foreground",
  detailClassName = "text-xs text-muted-foreground",
}: TarifCardTextProps) => (
  <>
    <div className={amountClassName}>{tarif.amount}</div>
    <p className={unitClassName}>{tarif.unit}</p>
    {tarif.details.map((d) => (
      <p key={d} className={detailClassName}>{d}</p>
    ))}
  </>
);

export default TarifCardText;
