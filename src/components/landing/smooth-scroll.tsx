"use client";

import { useEffect } from "react";

// Easing function: easeInOutCubic for a smooth, premium feel that is still fast
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function SmoothScroll() {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      
      if (!anchor) return;
      
      const href = anchor.getAttribute("href");
      if (!href?.startsWith("#") || href === "#") return;
      
      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (!targetElement) return;
      
      e.preventDefault();
      
      const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY;
      const startPosition = window.scrollY;
      const distance = targetPosition - startPosition;
      
      // Fixed duration of 800ms for a fast but noticeable smooth scroll
      const duration = 800;
      let start: number | null = null;
      
      const step = (timestamp: number) => {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        const percentage = Math.min(progress / duration, 1);
        const easedPercentage = easeInOutCubic(percentage);
        
        window.scrollTo(0, startPosition + distance * easedPercentage);
        
        if (progress < duration) {
          window.requestAnimationFrame(step);
        }
      };
      
      window.requestAnimationFrame(step);
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}
