/**
 * "Read more" on long reviews. The paragraph carries `data-clamp`, which
 * the global stylesheet cuts to five lines; the button beside it lifts
 * the clamp. One delegated listener, so it also covers the duplicated
 * half of the carousel and needs no per-card wiring.
 */
export function bindReadMore() {
  const w = window as unknown as { __readMore?: boolean };
  if (w.__readMore) return;
  w.__readMore = true;
  document.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-read-more]");
    if (!btn) return;
    const text = btn.parentElement?.querySelector<HTMLElement>("[data-clamp]");
    if (!text) return;
    const open = btn.getAttribute("aria-expanded") === "true";
    text.toggleAttribute("data-open", !open);
    btn.setAttribute("aria-expanded", String(!open));
    btn.textContent = open ? "Read more" : "Show less";
  });
}
