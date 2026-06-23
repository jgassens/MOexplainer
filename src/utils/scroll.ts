export function scrollToPageTop() {
  if (typeof window.scrollTo !== "function") return;

  try {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  } catch {
    try {
      window.scrollTo(0, 0);
    } catch {
      // Some test DOMs expose scrollTo without implementing it.
    }
  }
}
