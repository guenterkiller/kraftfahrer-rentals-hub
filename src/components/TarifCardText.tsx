import type { TarifText } from "@/lib/tarifTexte";
import { PREISKARTEN_HINWEIS, PREISKARTEN_LINK_TEXT } from "@/lib/tarifTexte";
import { Link } from "react-router-dom";

interface TarifCardTextProps {
  tarif: TarifText;
  amountClassName?: string;
  unitClassName?: string;
  detailClassName?: string;
}

/**
 * Einheitliche, kompakte Darstellung eines Preisschilds / einer Tarifkarte.
 * Texte kommen ausschließlich aus src/lib/tarifTexte.ts.
 * Keine Wiederholungen, keine Ausschlüsse, keine Zusatzkonditionen.
 */
const TarifCardText = ({
  tarif,
  amountClassName = "text-4xl font-bold text-foreground",
  unitClassName = "text-sm font-medium text-foreground",
  detailClassName = "text-xs text-muted-foreground",
}: TarifCardTextProps) => (
  <>
    <div className={amountClassName}>{tarif.amount}</div>
    <p className={unitClassName}>{tarif.cardUnit}</p>
    {tarif.cardLines.map((d) => (
      <p key={d} className={detailClassName}>{d}</p>
    ))}
  </>
);

/** Einmaliger Hinweis oberhalb aller Preiskarten. */
export const PreiskartenHinweis = ({ className = "" }: { className?: string }) => (
  <p className={`text-sm text-muted-foreground text-center ${className}`}>{PREISKARTEN_HINWEIS}</p>
);

/** Gemeinsamer Link unterhalb der Preiskarten. */
export const PreiskartenDetailsLink = ({ className = "" }: { className?: string }) => (
  <div className={`text-center ${className}`}>
    <Link
      to="/preise-und-ablauf"
      className="text-primary underline decoration-primary/50 hover:decoration-primary font-medium"
    >
      {PREISKARTEN_LINK_TEXT}
    </Link>
  </div>
);

export default TarifCardText;
