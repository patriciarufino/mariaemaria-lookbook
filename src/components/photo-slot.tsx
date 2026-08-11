import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

import { ACCEPT_ATTR, isAcceptedImage } from "@/lib/image-upload";
import { labelClass } from "@/components/admin-ui";

type Props = {
  label: string;
  /** URL já salva (edição) */
  url?: string | null;
  /** Arquivo escolhido e ainda não enviado */
  file?: File | null;
  busy?: boolean;
  onSelect: (file: File) => void;
  onClear?: () => void;
  onError?: (message: string) => void;
};

/** Área de upload com preview, arrastar-e-soltar, troca e remoção da foto. */
export function PhotoSlot({ label, url, file, busy, onSelect, onClear, onError }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const src = preview ?? url ?? null;

  function accept(list: FileList | null) {
    const picked = list?.[0];
    if (!picked) return;
    if (!isAcceptedImage(picked)) {
      onError?.(`"${picked.name}": use arquivos JPG, PNG ou WEBP.`);
      return;
    }
    onSelect(picked);
  }

  return (
    <div>
      <span className={labelClass}>{label}</span>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          accept(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`relative mt-2 flex aspect-[3/4] cursor-pointer items-center justify-center overflow-hidden border border-dashed bg-surface-alt px-2 text-center text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground transition-colors ${
          over ? "border-ring bg-secondary" : "border-border"
        }`}
      >
        {src ? (
          <img src={src} alt={label} className="h-full w-full object-cover" />
        ) : busy ? (
          "Enviando..."
        ) : (
          "Clique ou arraste a foto"
        )}

        {busy && src && (
          <span className="absolute inset-0 flex items-center justify-center bg-background/70">
            Enviando...
          </span>
        )}

        {src && onClear && !busy && (
          <button
            type="button"
            aria-label={`Remover ${label}`}
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="absolute right-1 top-1 border border-border bg-background/90 p-1 text-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTR}
        className="hidden"
        onChange={(e) => {
          accept(e.target.files);
          e.target.value = "";
        }}
      />
      <p className="mt-1 text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
        {src ? "Clique para trocar" : "JPG, PNG ou WEBP"}
      </p>
    </div>
  );
}
