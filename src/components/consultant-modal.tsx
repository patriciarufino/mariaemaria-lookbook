import { useEffect } from "react";
import { X } from "lucide-react";

import type { PublicConsultant, PublicLook } from "@/lib/public-content.functions";
import { consultantMessage, trackContactEvent, waHref } from "@/lib/consultant-contact";

type Props = {
  look: PublicLook;
  consultants: PublicConsultant[];
  onClose: () => void;
};

/** Seleção de consultora antes de abrir a conversa no WhatsApp. */
export function ConsultantModal({ look, consultants, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  function choose(consultant: PublicConsultant) {
    trackContactEvent({
      event_type: "contact",
      look_id: look.id,
      look_reference: look.reference,
      consultant_id: consultant.id,
      consultant_name: consultant.name,
    });
    window.open(
      waHref(consultant.whatsapp, consultantMessage(consultant, look)),
      "_blank",
      "noopener,noreferrer",
    );
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Escolha sua consultora"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-border bg-background px-6 py-10 sm:px-10"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-4 top-4 p-2 text-muted-foreground transition-opacity hover:opacity-60"
        >
          <X className="h-4 w-4" />
        </button>

        <p className="eyebrow text-center">{look.reference}</p>
        <h2 className="mt-4 text-center font-serif text-2xl leading-snug text-brand md:text-[1.9rem]">
          Com quem você deseja falar?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-center text-sm leading-relaxed text-muted-foreground">
          {consultants.length
            ? "Escolha sua consultora para continuar o atendimento."
            : "Nossas consultoras estarão disponíveis em instantes. Tente novamente em breve."}
        </p>

        <div className="mt-9 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {consultants.map((consultant) => (
            <button
              key={consultant.id}
              type="button"
              onClick={() => choose(consultant)}
              className="group flex items-center gap-4 border border-border p-4 text-left transition-colors hover:bg-secondary sm:flex-col sm:items-stretch sm:gap-0 sm:p-0"
            >
              <div className="h-20 w-20 shrink-0 overflow-hidden bg-surface-alt sm:aspect-[3/4] sm:h-auto sm:w-full">
                {consultant.photo ? (
                  <img
                    src={consultant.photo}
                    alt={consultant.name}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-serif text-2xl text-muted-foreground">
                    {consultant.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="sm:px-4 sm:py-5">
                <p className="font-serif text-lg text-brand">{consultant.name}</p>
                <span className="mt-1 block text-[0.62rem] uppercase tracking-[0.24em] text-muted-foreground">
                  Falar com {consultant.name.split(" ")[0]}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
