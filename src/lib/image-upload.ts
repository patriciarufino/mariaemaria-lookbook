import { uploadImage } from "@/lib/upload.functions";

export const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
export const ACCEPT_ATTR = ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp";

/** Tamanho máximo do maior lado depois da otimização (mantém nitidez editorial). */
const MAX_EDGE = 2400;
/** Qualidade alta: otimiza peso sem compressão agressiva. */
const QUALITY = 0.92;

export function isAcceptedImage(file: File) {
  const type = (file.type || "").toLowerCase();
  if (ACCEPTED_TYPES.includes(type)) return true;
  return /\.(jpe?g|png|webp)$/i.test(file.name);
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

/**
 * Redimensiona apenas quando a foto é maior que o necessário e recomprime
 * em alta qualidade. Devolve os bytes prontos para envio.
 */
async function optimize(file: File): Promise<{ blob: Blob; contentType: string; ext: string }> {
  const isPng = /png$/i.test(file.type) || /\.png$/i.test(file.name);
  const smallEnough = file.size <= 900 * 1024;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && smallEnough) {
      bitmap.close?.();
      return {
        blob: file,
        contentType: file.type || (isPng ? "image/png" : "image/jpeg"),
        ext: isPng ? "png" : "jpg",
      };
    }

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas indisponível");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", QUALITY),
    );
    if (!blob) throw new Error("falha ao otimizar");
    return { blob, contentType: "image/jpeg", ext: "jpg" };
  } catch {
    // Se algo falhar na otimização, envia o arquivo original.
    return {
      blob: file,
      contentType: file.type || "image/jpeg",
      ext: isPng ? "png" : "jpg",
    };
  }
}

/** Otimiza e envia a foto para o acervo. Devolve a URL persistida. */
export async function uploadPhoto(file: File): Promise<string> {
  if (!isAcceptedImage(file)) {
    throw new Error(`"${file.name}": use arquivos JPG, PNG ou WEBP.`);
  }
  if (file.size > 25 * 1024 * 1024) {
    throw new Error(`"${file.name}" é maior que 25MB.`);
  }

  const { blob, contentType, ext } = await optimize(file);
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const baseName = file.name.replace(/\.[^.]+$/, "").slice(0, 60) || "foto";

  const { url } = await uploadImage({
    data: {
      fileName: `${baseName}.${ext}`,
      contentType,
      base64: bytesToBase64(bytes),
    },
  });

  if (!url) throw new Error("O envio não retornou o endereço da imagem.");
  return url;
}

const DETAIL_HINT = /[-_ ](detalhe|detalhes|detail|details|det|zoom|closeup|close-up|b|2)$/i;

/** true quando o nome do arquivo indica que é a foto de detalhe. */
export function looksLikeDetail(fileName: string) {
  const base = fileName.replace(/\.[^.]+$/, "").trim();
  return DETAIL_HINT.test(base);
}

/** Chave usada para parear "REF001.jpg" com "REF001-detalhe.jpg". */
export function pairKey(fileName: string) {
  const base = fileName.replace(/\.[^.]+$/, "").trim();
  return base.replace(DETAIL_HINT, "").replace(/[-_ .]+$/, "").toLowerCase() || base.toLowerCase();
}

export type FilePair = { key: string; full: File | null; detail: File | null };

/** Agrupa uma seleção de arquivos em pares (principal + detalhe). */
export function autoPair(files: File[]): FilePair[] {
  const groups = new Map<string, FilePair>();
  const order: string[] = [];

  for (const file of files) {
    const key = pairKey(file.name);
    if (!groups.has(key)) {
      groups.set(key, { key, full: null, detail: null });
      order.push(key);
    }
    const group = groups.get(key)!;
    const wantsDetail = looksLikeDetail(file.name);
    if (wantsDetail && !group.detail) group.detail = file;
    else if (!wantsDetail && !group.full) group.full = file;
    else if (!group.detail) group.detail = file;
    else if (!group.full) group.full = file;
    else {
      // Grupo cheio: cria um novo par com chave derivada.
      const extraKey = `${key}-${order.length}`;
      groups.set(extraKey, { key: extraKey, full: file, detail: null });
      order.push(extraKey);
    }
  }

  return order.map((key) => groups.get(key)!);
}

/**
 * Pareamento tolerante: usa os nomes dos arquivos quando eles indicam o par e,
 * quando não indicam, junta as fotos duas a duas na ordem em que foram enviadas.
 */
export function pairSelection(files: File[]): FilePair[] {
  const pairs = autoPair(files);
  const result: FilePair[] = [];

  for (const pair of pairs) {
    const last = result[result.length - 1];
    const lonely = (p: FilePair) => Boolean(p.full) !== Boolean(p.detail);
    if (last && lonely(last) && lonely(pair)) {
      const photos = [last.full, last.detail, pair.full, pair.detail].filter(Boolean) as File[];
      last.full = photos[0]!;
      last.detail = photos[1]!;
      continue;
    }
    result.push({ ...pair });
  }

  return result;
}
