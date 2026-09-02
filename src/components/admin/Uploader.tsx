/**
 * Upload panel for the Photos and Guides screens.
 *
 * Two things matter here beyond "it uploads":
 *
 * 1. Drag-and-drop AND a plain button. Thushara will often be on a
 *    phone, where dragging doesn't exist. The whole panel is tappable.
 *
 * 2. Photos are resized in the browser before they leave it. A photo
 *    straight off a phone is 4-6MB; the site never needs more than
 *    1600px. Resizing here turns a slow, failure-prone upload on Sri
 *    Lankan mobile data into a fast one, and produces the thumbnail at
 *    the same time. The server never has to process an image.
 */

import { useRef, useState } from "react";

interface Props {
  kind: "photo" | "guide";
  categories?: { id: string; label: string }[];
  lifeStages?: { id: string; label: string }[];
}

const FULL_MAX = 1600;
const THUMB_MAX = 600;

/** Longest edge down to `max`, re-encoded as WebP. */
async function resize(file: File, max: number): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" } as any);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();

  return new Promise((res, rej) =>
    canvas.toBlob(
      (b) => (b ? res(b) : rej(new Error("Could not process that image."))),
      "image/webp",
      0.82,
    ),
  );
}

async function dimensions(file: File) {
  const bitmap = await createImageBitmap(file);
  const d = { width: bitmap.width, height: bitmap.height };
  bitmap.close?.();
  return d;
}

export default function Uploader({ kind, categories = [], lifeStages = [] }: Props) {
  const isPhoto = kind === "photo";
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const accept = isPhoto ? "image/*" : "application/pdf";

  const choose = (f: File | undefined) => {
    if (!f) return;
    setError(null);
    if (isPhoto && !f.type.startsWith("image/")) return setError("That isn't an image file.");
    if (!isPhoto && f.type !== "application/pdf") return setError("Guides need to be PDF files.");
    setFile(f);
    setPreview(isPhoto ? URL.createObjectURL(f) : null);
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setPct(0);
    if (input.current) input.current.value = "";
  };

  const submit = async (e: Event) => {
    e.preventDefault();
    if (!file || busy) return;
    setBusy(true);
    setError(null);
    setPct(1);

    const form = new FormData(e.target as HTMLFormElement);
    form.set("kind", kind);

    try {
      if (isPhoto) {
        const [full, thumb, dim] = await Promise.all([
          resize(file, FULL_MAX),
          resize(file, THUMB_MAX),
          dimensions(file),
        ]);
        form.set("file", new File([full], "photo.webp", { type: "image/webp" }));
        form.set("thumb", new File([thumb], "thumb.webp", { type: "image/webp" }));
        form.set("width", String(Math.min(dim.width, FULL_MAX)));
        form.set("height", String(Math.round(dim.height * Math.min(1, FULL_MAX / Math.max(dim.width, dim.height)))));
      } else {
        form.set("file", file);
      }
    } catch {
      setBusy(false);
      setPct(0);
      return setError("That image could not be read. Try a different one.");
    }

    // XHR rather than fetch, purely because it reports upload progress —
    // on a slow connection a silent 30-second wait looks broken.
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/upload");
    xhr.upload.onprogress = (ev) => ev.lengthComputable && setPct(Math.round((ev.loaded / ev.total) * 100));
    xhr.onload = () => {
      setBusy(false);
      let body: any = {};
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        /* fall through to the generic message */
      }
      if (xhr.status === 200 && body.ok) {
        window.location.href = isPhoto ? "/admin/gallery?saved=1" : "/admin/resources?saved=1";
      } else {
        setPct(0);
        setError(body.message ?? "The upload failed. Please try again.");
      }
    };
    xhr.onerror = () => {
      setBusy(false);
      setPct(0);
      setError("The connection dropped. Please try again.");
    };
    xhr.send(form);
  };

  const field = "h-13 w-full rounded-md border border-warm-200 bg-white px-4 text-body text-ink-900 focus:border-navy-400";
  const label = "text-small font-bold text-warm-800";

  return (
    <form onSubmit={submit} class="rounded-[18px] border border-warm-200 bg-white p-6 md:p-7">
      <input
        ref={input}
        type="file"
        accept={accept}
        class="sr-only"
        onChange={(e: any) => choose(e.currentTarget.files?.[0])}
      />

      {!file ? (
        <button
          type="button"
          onClick={() => input.current?.click()}
          onDragOver={(e: any) => {
            e.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(e: any) => {
            e.preventDefault();
            setOver(false);
            choose(e.dataTransfer?.files?.[0]);
          }}
          class={`flex w-full flex-col items-center justify-center rounded-[14px] border-2 border-dashed px-6 py-12 text-center transition-colors ${
            over ? "border-navy-500 bg-navy-50" : "border-warm-300 bg-cream-100 hover:border-navy-400"
          }`}
        >
          <span class="text-h4 font-bold text-ink-900">
            {isPhoto ? "Drag a photo here" : "Drag a PDF here"}
          </span>
          <span class="mt-1.5 text-body text-warm-600">or tap to choose one from your device</span>
          <span class="mt-4 font-mono text-caption text-warm-400">
            {isPhoto ? "JPG, PNG or WebP — any size, it gets resized here" : "PDF, up to 20 MB"}
          </span>
        </button>
      ) : (
        <div class="flex flex-col gap-5">
          <div class="flex items-start gap-4">
            {preview ? (
              <img src={preview} alt="" class="size-24 shrink-0 rounded-lg object-cover" />
            ) : (
              <span aria-hidden="true" class="flex h-24 w-18 shrink-0 items-center justify-center rounded-md bg-cream-100 text-caption font-bold text-warm-500">
                PDF
              </span>
            )}
            <div class="min-w-0 flex-1">
              <p class="truncate text-body font-bold text-ink-900">{file.name}</p>
              <p class="mt-1 text-small text-warm-500">
                {(file.size / 1024 / 1024).toFixed(1)} MB
                {isPhoto && " — will be made smaller before uploading"}
              </p>
              <button type="button" onClick={reset} class="mt-2 text-small font-bold text-navy-600 underline">
                Choose a different file
              </button>
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            {isPhoto ? (
              <>
                <div class="sm:col-span-2">
                  <label class={label} for="caption">Caption <span class="font-normal text-warm-500">— shown under the photo</span></label>
                  <input id="caption" name="caption" class={`${field} mt-2`} placeholder="MDRT Annual Meeting, 2024" />
                </div>
                <div class="sm:col-span-2">
                  <label class={label} for="alt_text">
                    Description for screen readers <span class="font-normal text-warm-500">— what is in the photo</span>
                  </label>
                  <input id="alt_text" name="alt_text" class={`${field} mt-2`} placeholder="Thushara receiving the MDRT award on stage" />
                </div>
                <div>
                  <label class={label} for="category">Which section</label>
                  <select id="category" name="category" class={`${field} mt-2`}>
                    {categories.map((c) => (
                      <option value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <>
                <div class="sm:col-span-2">
                  <label class={label} for="title">Title</label>
                  <input id="title" name="title" required class={`${field} mt-2`} placeholder="How Much Life Cover Does Your Family Need?" />
                </div>
                <div class="sm:col-span-2">
                  <label class={label} for="description">One-line description</label>
                  <input id="description" name="description" class={`${field} mt-2`} placeholder="Work out your number in about ten minutes." />
                </div>
                <div>
                  <label class={label} for="life_stage">Which group</label>
                  <select id="life_stage" name="life_stage" class={`${field} mt-2`}>
                    {lifeStages.map((s) => (
                      <option value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label class={label} for="page_count">Pages <span class="font-normal text-warm-500">— optional</span></label>
                  <input id="page_count" name="page_count" type="number" min="1" class={`${field} mt-2`} />
                </div>
                <label class="flex items-start gap-3 sm:col-span-2">
                  <input type="checkbox" name="gated" value="1" checked class="mt-1 size-6 shrink-0 accent-navy-600" />
                  <span class="text-body leading-relaxed text-warm-700">
                    <strong class="font-bold text-ink-900">Ask for a name and WhatsApp number first.</strong>{" "}
                    Every download then becomes an enquiry. Untick to let people read it without giving
                    any details.
                  </span>
                </label>
              </>
            )}
          </div>

          {busy && (
            <div>
              <div class="h-2 overflow-hidden rounded-full bg-cream-100">
                <div class="h-full rounded-full bg-navy-600 transition-[width]" style={`width:${pct}%`} />
              </div>
              <p class="mt-2 text-small text-warm-600" role="status">
                {pct < 100 ? `Uploading — ${pct}%` : "Almost done…"}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            class="flex min-h-14 items-center justify-center rounded-full bg-navy-600 px-10 text-h4 font-bold text-cream-50 hover:bg-navy-500 disabled:opacity-60 sm:self-start"
          >
            {busy ? "Uploading…" : isPhoto ? "Add this photo" : "Add this guide"}
          </button>
        </div>
      )}

      {error && (
        <p class="mt-4 rounded-md border border-error/30 bg-error/8 px-4 py-3 text-body text-error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
