import { useEffect } from "react";

import { supabase } from "@/integrations/supabase/client";

function visitorKey() {
  const stored = localStorage.getItem("mm-visitor");
  if (stored) return stored;
  const key = crypto.randomUUID();
  localStorage.setItem("mm-visitor", key);
  return key;
}

function deviceKind() {
  const ua = navigator.userAgent;
  if (/iPad|Tablet/i.test(ua)) return "Tablet";
  if (/Mobi|Android|iPhone/i.test(ua)) return "Celular";
  return "Computador";
}

/** Registra de forma anônima a visita de um cliente a uma página pública. */
export function useTrackVisit(path: string) {
  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (cancelled) return;
      void supabase
        .from("site_visits")
        .insert({
          path,
          referrer: document.referrer || "Direto",
          device: deviceKind(),
          language: navigator.language || "",
          country: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
          visitor_key: visitorKey(),
        })
        .then(() => undefined);
    }, 800);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [path]);
}
