import { supabase } from "@/integrations/supabase/client";
import type { PublicConsultant, PublicLook } from "@/lib/public-content.functions";

/** Monta o link do WhatsApp (abre o app no celular e o WhatsApp Web no computador). */
export function waHref(number: string, message: string) {
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}

/**
 * Mensagem enviada quando a cliente escolhe uma consultora.
 * A referência é sempre a do look que ela estava vendo.
 */
export function consultantMessage(consultant: PublicConsultant, look: PublicLook) {
  const template = (consultant.custom_message ?? "").trim();
  if (template) {
    return template
      .replaceAll("[NOME]", consultant.name)
      .replaceAll("[REFERENCIA]", look.reference)
      .replaceAll("[REFERÊNCIA]", look.reference);
  }
  return `Olá, ${consultant.name}! Tenho interesse neste look. ✨ Poderia me passar mais detalhes, por favor?\n\nLook: ${look.reference}`;
}

type Event = {
  event_type: "click" | "contact";
  look_id: string;
  look_reference: string;
  consultant_id?: string | null;
  consultant_name?: string | null;
};

/** Registra de forma anônima o interesse por um look e o encaminhamento à consultora. */
export function trackContactEvent(event: Event) {
  void supabase
    .from("look_contacts")
    .insert({
      event_type: event.event_type,
      look_id: event.look_id,
      look_reference: event.look_reference,
      consultant_id: event.consultant_id ?? null,
      consultant_name: event.consultant_name ?? "",
    })
    .then(() => undefined);
}
