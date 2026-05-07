// src/components/ScrollToTop.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Try smooth scroll first, fallback to instant for mobile reliability
    const scrollToTop = () => {
      // Method 1: Standard window.scrollTo
      window.scrollTo({ top: 0, left: 0, behavior: "auto" }); // ← "auto" not "smooth"

      // Method 2: Fallback for iOS Safari and stubborn mobile browsers
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      // Method 3: Force scroll on any scrollable container
      const scrollableContainers = document.querySelectorAll(
        '[style*="overflow"], .overflow-auto, .overflow-y-auto, .scrollable',
      );
      scrollableContainers.forEach((el) => {
        el.scrollTop = 0;
      });
    };

    // Small delay to ensure DOM has updated after route change
    const timeoutId = setTimeout(scrollToTop, 0);

    return () => clearTimeout(timeoutId);
  }, [pathname]);

  return null;
}
