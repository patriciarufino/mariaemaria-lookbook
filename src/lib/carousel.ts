import { useEffect, useRef, useState } from "react";

export function useSwipe(onPrev: () => void, onNext: () => void) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let startX = 0;
    let active = false;
    const down = (e: TouchEvent) => {
      startX = e.touches[0]!.clientX;
      active = true;
    };
    const up = (e: TouchEvent) => {
      if (!active) return;
      active = false;
      const dx = e.changedTouches[0]!.clientX - startX;
      if (Math.abs(dx) > 40) (dx < 0 ? onNext : onPrev)();
    };
    el.addEventListener("touchstart", down, { passive: true });
    el.addEventListener("touchend", up, { passive: true });
    return () => {
      el.removeEventListener("touchstart", down);
      el.removeEventListener("touchend", up);
    };
  }, [onPrev, onNext]);

  return ref;
}

export function useKeyboardNav(onPrev: () => void, onNext: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onPrev, onNext, enabled]);
}

export function useIndex(length: number) {
  const [index, setIndex] = useState(0);
  const prev = () => setIndex((i) => (i - 1 + length) % Math.max(length, 1));
  const next = () => setIndex((i) => (i + 1) % Math.max(length, 1));
  return { index, setIndex, prev, next };
}
