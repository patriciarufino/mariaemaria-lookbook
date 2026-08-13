import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { PhotoSlot } from "@/components/photo-slot";
import { ACCEPT_ATTR, isAcceptedImage, pairSelection, uploadPhoto } from "@/lib/image-upload";
import { Card, buttonClass, ghostButtonClass, inputClass, labelClass } from "@/components/admin-ui";

type Draft = { key: string; reference: string; full: File | null; detail: File | null };

let seq = 0;
const nextKey = () => `draft-${Date.now()}-${seq++}`;

function refFor(order: number) {
  return `REF ${String(order).padStart(3, "0")}`;
}

async function saveDraft(draft: Draft, order: number) {
  if (!draft.full || !draft.detail) {
    throw new Error(`${draft.reference}: envie a foto principal e a foto de detalhe.`);
  }
  const [fullUrl, detailUrl] = await Promise.all([
    uploadPhoto(draft.full),
    uploadPhoto(draft.detail),
  ]);
  const { error } = await supabase.from("looks").insert({
    reference: draft.reference.trim() || refFor(order),
    full_look_image: fullUrl,
    detail_image: detailUrl,
    display_order: order,
    status: "draft",
  });
  if (error) throw new Error(error.message);
}

/** Cadastro de um look: duas fotos obrigatórias, com preview antes de salvar. */
export function NewLookForm({ nextOrder, onSaved }: { nextOrder: number; onSaved: () => void }) {
  const [reference, setReference] = useState(refFor(nextOrder));
  const [full, setFull] = useState<File | null>(null);
  const [detail, setDetail] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const ready = Boolean(full && detail);

  /** Seleção múltipla: preenche os dois espaços de uma vez. */
  function acceptMany(files: File[]) {
    const valid = files.filter(isAcceptedImage);
    if (valid.length !== files.length) toast.error("Alguns arquivos não são JPG, PNG ou WEBP.");
    if (!valid.length) return;
    const [pair] = pairSelection(valid);
    if (pair?.full) setFull(pair.full);
    if (pair?.detail) setDetail(pair.detail);
    if (valid.length === 1 && !pair?.full) setDetail(valid[0]!);
  }

  async function save() {
    setSaving(true);
    try {
      await saveDraft({ key: "new", reference, full, detail }, nextOrder);
      toast.success("Look criado com as duas fotos.");
      setFull(null);
      setDetail(null);
      setReference(refFor(nextOrder + 1));
      onSaved();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <h2 className="font-serif text-xl text-brand">Adicionar look</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Selecione as duas fotos ao mesmo tempo ou arraste cada uma para o seu espaço.
      </p>

      <label className="mt-4 inline-flex cursor-pointer items-center">
        <span className={ghostButtonClass}>Selecionar as 2 fotos</span>
        <input
          type="file"
          multiple
          accept={ACCEPT_ATTR}
          className="hidden"
          onChange={(e) => {
            acceptMany(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />
      </label>

      <div className="mt-5 grid gap-4 sm:grid-cols-[repeat(2,180px)_1fr]">
        <PhotoSlot
          label="Foto principal — look completo"
          file={full}
          onSelect={setFull}
          onClear={() => setFull(null)}
          onError={toast.error}
        />
        <PhotoSlot
          label="Foto detalhe — tecido / acabamento"
          file={detail}
          onSelect={setDetail}
          onClear={() => setDetail(null)}
          onError={toast.error}
        />
        <div className="space-y-4">
          <label className="block">
            <span className={labelClass}>Referência</span>
            <input
              className={`${inputClass} mt-2`}
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </label>
          <button className={buttonClass} disabled={!ready || saving} onClick={() => void save()}>
            {saving ? "Enviando..." : "Salvar look"}
          </button>
          {!ready && (
            <p className="text-xs text-muted-foreground">
              É preciso ter a foto principal e a foto de detalhe para salvar.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

/** Envio em lote com pareamento automático e tela de conferência. */
export function BulkLookForm({ nextOrder, onSaved }: { nextOrder: number; onSaved: () => void }) {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState("");

  function load(files: File[]) {
    const valid = files.filter(isAcceptedImage);
    if (valid.length !== files.length) toast.error("Alguns arquivos não são JPG, PNG ou WEBP.");
    if (!valid.length) return;
    const pairs = autoPair(valid);
    setDrafts(
      pairs.map((pair, i) => ({
        key: nextKey(),
        reference: refFor(nextOrder + i),
        full: pair.full,
        detail: pair.detail,
      })),
    );
  }

  function patch(key: string, changes: Partial<Draft>) {
    setDrafts((list) => list.map((d) => (d.key === key ? { ...d, ...changes } : d)));
  }

  const incomplete = drafts.filter((d) => !d.full || !d.detail).length;

  async function saveAll() {
    setSaving(true);
    let done = 0;
    try {
      for (const [index, draft] of drafts.entries()) {
        setProgress(`Enviando ${done + 1} de ${drafts.length}...`);
        await saveDraft(draft, nextOrder + index);
        done += 1;
      }
      toast.success(`${done} look(s) criados.`);
      setDrafts([]);
      onSaved();
    } catch (error) {
      toast.error(`${(error as Error).message} — ${done} look(s) já foram salvos.`);
      onSaved();
    } finally {
      setProgress("");
      setSaving(false);
    }
  }

  return (
    <Card>
      <h2 className="font-serif text-xl text-brand">Adicionar vários looks</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Selecione todas as fotos de uma vez. Pares como REF001.jpg + REF001-detalhe.jpg são
        agrupados automaticamente e podem ser corrigidos antes de salvar.
      </p>

      <label className="mt-4 inline-flex cursor-pointer items-center">
        <span className={ghostButtonClass}>Selecionar fotos</span>
        <input
          type="file"
          multiple
          accept={ACCEPT_ATTR}
          className="hidden"
          onChange={(e) => {
            load(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />
      </label>

      {drafts.length > 0 && (
        <div className="mt-6 space-y-5">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Conferência — {drafts.length} look(s){incomplete ? `, ${incomplete} incompleto(s)` : ""}
          </p>

          {drafts.map((draft) => (
            <div key={draft.key} className="border border-border p-4">
              <div className="grid gap-4 sm:grid-cols-[repeat(2,150px)_1fr]">
                <PhotoSlot
                  label="Foto principal"
                  file={draft.full}
                  onSelect={(file) => patch(draft.key, { full: file })}
                  onClear={() => patch(draft.key, { full: null })}
                  onError={toast.error}
                />
                <PhotoSlot
                  label="Foto detalhe"
                  file={draft.detail}
                  onSelect={(file) => patch(draft.key, { detail: file })}
                  onClear={() => patch(draft.key, { detail: null })}
                  onError={toast.error}
                />
                <div className="space-y-3">
                  <label className="block">
                    <span className={labelClass}>Referência</span>
                    <input
                      className={`${inputClass} mt-2`}
                      value={draft.reference}
                      onChange={(e) => patch(draft.key, { reference: e.target.value })}
                    />
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      className={ghostButtonClass}
                      onClick={() =>
                        patch(draft.key, { full: draft.detail, detail: draft.full })
                      }
                    >
                      Trocar principal / detalhe
                    </button>
                    <button
                      className={ghostButtonClass}
                      onClick={() => setDrafts((l) => l.filter((d) => d.key !== draft.key))}
                    >
                      <Trash2 className="mr-2 h-3 w-3" /> Descartar
                    </button>
                  </div>
                  {(!draft.full || !draft.detail) && (
                    <p className="text-xs text-muted-foreground">
                      Faltam fotos: este look não será salvo assim.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div className="flex items-center gap-4">
            <button
              className={buttonClass}
              disabled={saving || incomplete > 0}
              onClick={() => void saveAll()}
            >
              {saving ? "Enviando..." : `Salvar ${drafts.length} look(s)`}
            </button>
            {progress && <span className="text-xs text-muted-foreground">{progress}</span>}
            {incomplete > 0 && (
              <span className="text-xs text-muted-foreground">
                Complete todos os pares para salvar.
              </span>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
