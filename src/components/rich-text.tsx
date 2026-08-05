import type { ReactNode } from "react";

/** Renderiza trechos entre asteriscos em itálico serifado. */
export function RichText({ value }: { value: string }) {
  const parts = value.split(/(\*[^*]+\*)/g).filter(Boolean);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("*") && part.endsWith("*") ? (
          <em key={i} className="italic">
            {part.slice(1, -1)}
          </em>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

export function Brand({ className }: { className?: string }): ReactNode {
  return (
    <span className={className}>
      MARIA <em className="italic">e</em> MARIA
    </span>
  );
}
