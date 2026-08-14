import { useEffect, useMemo, useState } from "react";

import type { PublicLook } from "@/lib/public-content.functions";

type Slide = { src: string; reference: string; isNew: boolean };

function shuffle<T>(list: T[]) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

/**
 * Vitrine rotativa: mostra os looks em ordem aleatória, trocando sozinha com
 * transição suave. Os looks mais recentes ganham o selo "Novo".
 */
export function LookRotator({ looks, label }: { looks: PublicLook[]; label?: string }) {
  const base = useMemo<Slide[]>(
    () =>
      looks.flatMap((look, i) =>
        [look.full_look_image, look.detail_image]
          .filter(Boolean)
          .map((src) => ({ src: src as string, reference: look.reference, isNew: i < 3 })),
      ),
    [looks],
  );

  const [slides, setSlides] = useState<Slide[]>(base);
  const [index, setIndex] = useState(0);

  // Aleatoriza só no cliente para não quebrar a renderização do servidor.
  useEffect(() => {
    setSlides(shuffle(base));
    setIndex(0);
  }, [base]);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 3500);
    return () => window.clearInterval(id);
  }, [slides.length]);

  if (!slides.length) return null;

  const visible = [0, 1, 2].map((offset) => slides[(index + offset) % slides.length]!);

  return (
    <div>
      {label && <p className="eyebrow">{label}</p>}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {visible.map((slide, i) => (
          <figure
            key={`${slide.src}-${i}`}
            className="relative aspect-[3/4] overflow-hidden bg-surface-alt"
          >
            <img
              key={slide.src}
              src={slide.src}
              alt={`${slide.reference} — Maria e Maria`}
              loading="lazy"
              className="h-full w-full animate-[rotator-in_900ms_ease-out] object-cover"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/45 to-transparent" />
            <figcaption className="absolute bottom-4 left-4 flex items-center gap-3 text-[0.7rem] uppercase tracking-[0.32em] text-white/90">
              {slide.reference}
              {slide.isNew && (
                <span className="border border-white/60 px-2 py-[2px] text-[0.55rem] tracking-[0.24em]">
                  Novo
                </span>
              )}
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="mt-5 flex justify-center gap-1.5">
        {slides.map((slide, i) => (
          <span
            key={`${slide.src}-dot-${i}`}
            className={`h-[2px] w-5 transition-colors duration-500 ${
              i === index ? "bg-foreground" : "bg-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
