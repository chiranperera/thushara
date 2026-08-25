/**
 * File storage — photos and PDF guides.
 *
 * Files live in the R2 bucket bound as MEDIA; the database only records
 * the key and what the file is. Nothing is written to the repo, and
 * there is no shared hosting folder — this project has no filesystem
 * to upload into.
 *
 * Uploads pass through the Worker rather than going direct to R2. Going
 * direct needs S3 credentials generated and stored by hand, which is a
 * setup step Thushara would have to do himself. A few megabytes through
 * a Worker costs nothing and needs no configuration at all.
 */

/** Photos are resized in the browser first, so this is generous. */
export const MAX_IMAGE_BYTES = 6 * 1024 * 1024;
/** A long illustrated guide, with room to spare. */
export const MAX_PDF_BYTES = 20 * 1024 * 1024;

export const IMAGE_TYPES = ["image/webp", "image/jpeg", "image/png"];
export const PDF_TYPES = ["application/pdf"];

export const GALLERY_CATEGORIES = [
  { id: "mdrt_awards", label: "MDRT & Awards" },
  { id: "client_events", label: "Client events" },
  { id: "milestones", label: "Professional milestones" },
  { id: "community", label: "Community" },
];

/**
 * Keys are prefixed by kind so the bucket stays legible if anyone ever
 * opens it in the Cloudflare dashboard, and suffixed with a random
 * chunk so re-uploading a file called "photo.jpg" never overwrites the
 * previous one.
 */
export function mediaKey(kind: "gallery" | "guides", name: string, ext: string): string {
  const stamp = new Date().toISOString().slice(0, 10);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${kind}/${stamp}-${slugify(name).slice(0, 48) || kind}-${rand}.${ext}`;
}

export function slugify(s: string): string {
  return String(s)
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function extFor(type: string): string {
  if (type === "image/webp") return "webp";
  if (type === "image/png") return "png";
  if (type === "image/jpeg") return "jpg";
  if (type === "application/pdf") return "pdf";
  return "bin";
}

/** "2.4 MB" — what he expects to see next to a download. */
export function humanSize(bytes: number | null | undefined): string {
  const n = Number(bytes);
  if (!n || Number.isNaN(n)) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export const CONTENT_TYPE: Record<string, string> = {
  webp: "image/webp",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  pdf: "application/pdf",
};

export function contentTypeForKey(key: string): string {
  const ext = key.split(".").pop()?.toLowerCase() ?? "";
  return CONTENT_TYPE[ext] ?? "application/octet-stream";
}
