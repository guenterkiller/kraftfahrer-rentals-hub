import { TARIF_TEXTE, type TarifText } from '../tarif-texte.ts';

/** Verbindliche Tariftexte anhand des Tarif-Keys (siehe tarif-zuordnung.ts). */
export const tarifTextByKey = (key?: string): TarifText | undefined => {
  switch (key) {
    case 'lkw_ce':
      return TARIF_TEXTE.lkw_ce;
    case 'lkw_ce_woche':
      return TARIF_TEXTE.lkw_ce_woche;
    case 'fernfahrer':
      return TARIF_TEXTE.fernfahrer;
    case 'baumaschine':
      return TARIF_TEXTE.baumaschine;
    default:
      return undefined;
  }
};

export { TARIF_TEXTE };
