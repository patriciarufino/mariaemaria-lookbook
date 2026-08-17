import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PublicConsultant, PublicLook } from "@/lib/public-content.functions";
import { useIndex, useSwipe } from "@/lib/carousel";
import { ConsultantModal } from "@/components/consultant-modal";
import { trackContactEvent } from "@/lib/consultant-contact";

type Props = {
  look: PublicLook;
  buttonLabel: string;
  /** WhatsApp geral da loja: usado só quando não há consultora ativa. */
  whatsappHref: string;
  consultants?: PublicConsultant[];
};

export function LookCard({ look, buttonLabel, whatsappHref, consultants = [] }: Props) {
  const images = [look.full_look_image, look.detail_image].filter(Boolean) as string[];
  const { index, prev, next, setIndex } = useIndex(images.length);
  const swipeRef = useSwipe(prev, next);
  const [open, setOpen] = useState(false);

  const hasConsultants = consultants.length > 0;

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    trackContactEvent({
      event_type: "click",
      look_id: look.id,
      look_reference: look.reference,
    });
    if (hasConsultants) {
      e.preventDefault();
      setOpen(true);
    }
  }

  return (
    <figure className="group flex flex-col">
      <div
        ref={swipeRef}
        className="relative aspect-[3/4] w-full overflow-hidden bg-surface-alt select-none"
      >
        {images.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={`${look.reference} — Maria e Maria`}
            loading="lazy"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/45 to-transparent" />

        <figcaption className="absolute bottom-4 left-4 text-[0.72rem] uppercase tracking-[0.32em] text-white/90">
          {look.reference}
        </figcaption>

        {images.length > 1 && (
          <>
            <div className="absolute bottom-5 right-4 flex gap-1.5">
              {images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  aria-label={`Imagem ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={`h-[2px] w-6 transition-colors ${
                    i === index ? "bg-white" : "bg-white/40"
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              aria-label="Anterior"
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 text-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100 focus-visible:opacity-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Próxima"
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 text-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100 focus-visible:opacity-100"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="mx-auto mt-6 inline-flex items-center justify-center border border-border px-8 py-3 text-[0.72rem] uppercase tracking-[0.32em] text-muted-foreground transition-colors hover:bg-secondary"
      >
        {buttonLabel}
      </a>

      {open && (
        <ConsultantModal look={look} consultants={consultants} onClose={() => setOpen(false)} />
      )}
    </figure>
  );
}
