import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { BOOKING_ANCHOR_ID, scrollToBookingForm } from "@/lib/bookingNavigation";

const ScrollToTop = () => {
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace("#", "");
      if (id === BOOKING_ANCHOR_ID) {
        scrollToBookingForm();
        return;
      }
      // Generischer Hash-Scroll (wartet auf Rendering)
      let attempts = 0;
      const tryScroll = () => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        } else if (attempts++ < 40) {
          window.setTimeout(tryScroll, 50);
        }
      };
      tryScroll();
      return;
    }

    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname, hash, key]);

  return null;
};

export default ScrollToTop;
