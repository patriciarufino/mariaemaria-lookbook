import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { getSiteContent } from "@/lib/public-content.functions";
import { Brand } from "@/components/rich-text";
import { useIndex, useKeyboardNav, useSwipe } from "@/lib/carousel";
import { useTrackVisit } from "@/lib/track-visit";

const contentQuery = queryOptions({
  queryKey: ["site-content"],
  queryFn: () => getSiteContent(),
});

export const Route = createFileRoute("/lookbook")({
  loader: ({ context }) => context.queryClient.ensureQueryData(contentQuery),
  head: () => ({
    meta: [
      { title: "Lookbook completo — Maria e Maria" },
      {
        name: "description",
        content:
          "Toda a coleção Maria e Maria em uma só tela. Percorra as peças com setas, teclado ou swipe.",
      },
      { property: "og:title", content: "Lookbook completo — Maria e Maria" },
      {
        property: "og:description",
        content: "Percorra toda a coleção Maria e Maria com setas, teclado ou swipe.",
      },
    ],
  }),
  errorComponent: () => (
    <div className="flex min-h-screen items-center justify-center px-6 text-center text-muted-foreground">
      Não foi possível carregar o lookbook agora.
    </div>
  ),
  component: LookbookPage,
});

function LookbookPage() {
  const { data } = useSuspenseQuery(contentQuery);
  useTrackVisit("/lookbook");

  const slides = data.looks.flatMap((look) =>
    [look.full_look_image, look.detail_image]
      .filter(Boolean)
      .map((src) => ({ src: src as string, reference: look.reference })),
  );

  const { index, prev, next, setIndex } = useIndex(slides.length);
  useKeyboardNav(prev, next);
  const swipeRef = useSwipe(prev, next);

  const current = slides[index];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border px-6 py-5">
        <Brand className="font-serif text-[0.7rem] tracking-[0.18em] text-brand" />
        <Link
          to="/"
          className="flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.28em] text-muted-foreground transition-opacity hover:opacity-60"
        >
          Fechar <X className="h-4 w-4" />
        </Link>
      </header>

      <main ref={swipeRef} className="flex flex-1 flex-col items-center justify-center px-4 py-8">
        {current ? (
          <>
            <div className="relative flex w-full max-w-[520px] items-center justify-center">
              <button
                type="button"
                aria-label="Anterior"
                onClick={prev}
                className="absolute -left-2 z-10 rounded-full bg-background/85 p-3 text-foreground shadow-sm md:-left-16"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <img
                src={current.src}
                alt={`${current.reference} — Maria e Maria`}
                className="max-h-[70vh] w-full object-contain"
              />

              <button
                type="button"
                aria-label="Próxima"
                onClick={next}
                className="absolute -right-2 z-10 rounded-full bg-background/85 p-3 text-foreground shadow-sm md:-right-16"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-6 text-[0.72rem] uppercase tracking-[0.32em] text-muted-foreground">
              {current.reference} — {index + 1}/{slides.length}
            </p>

            <div className="mt-6 flex max-w-full flex-wrap justify-center gap-2 overflow-x-auto">
              {slides.map((slide, i) => (
                <button
                  key={slide.src}
                  type="button"
                  aria-label={`Ir para imagem ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={`h-[2px] w-8 transition-colors ${
                    i === index ? "bg-foreground" : "bg-border"
                  }`}
                />
              ))}
            </div>
          </>
        ) : (
          <p className="text-muted-foreground">Nenhuma peça publicada ainda.</p>
        )}
      </main>
    </div>
  );
}
