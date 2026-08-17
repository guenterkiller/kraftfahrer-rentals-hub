import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

export const BOOKING_PATH = "/fahrer-buchen";
export const BOOKING_ANCHOR_ID = "buchungsformular";
export const BOOKING_LINK = `${BOOKING_PATH}#${BOOKING_ANCHOR_ID}`;

/**
 * Scrollt sanft zum Beginn des Buchungsformulars.
 * Wartet (max. ~2s), bis das Formular gerendert ist (z. B. nach Routenwechsel/Lazy-Load).
 */
export function scrollToBookingForm(attempt = 0): void {
  const element =
    document.getElementById(BOOKING_ANCHOR_ID) ||
    document.getElementById("fahreranfrage") ||
    document.getElementById("booking-form");

  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  if (attempt < 40) {
    window.requestAnimationFrame(() => {
      window.setTimeout(() => scrollToBookingForm(attempt + 1), 50);
    });
  }
}

/** True, wenn auf der aktuellen Seite ein Buchungsformular vorhanden ist. */
export function hasBookingFormOnPage(): boolean {
  return Boolean(
    document.getElementById(BOOKING_ANCHOR_ID) ||
      document.getElementById("fahreranfrage") ||
      document.getElementById("booking-form")
  );
}

/**
 * Klick-Handler für alle „Fahrer buchen“-Buttons/Links.
 * Bereits auf einer Seite mit Formular: direkt scrollen.
 * Sonst: Buchungsseite öffnen, Hash-Scroll übernimmt danach.
 */
export function useGoToBooking() {
  const navigate = useNavigate();

  return useCallback(
    (e?: React.MouseEvent | React.SyntheticEvent) => {
      e?.preventDefault();
      if (hasBookingFormOnPage()) {
        scrollToBookingForm();
      } else {
        navigate(BOOKING_LINK);
      }
    },
    [navigate]
  );
}
