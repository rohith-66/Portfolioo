// assets/js/main.js
// Robust skill-meter animator with debug logging
document.addEventListener("DOMContentLoaded", () => {
  const meters = Array.from(document.querySelectorAll(".meter"));

  if (!meters.length) {
    console.log("[meters] no .meter elements found.");
    return;
  }

  console.group("[meters] animating", meters.length, "bars");

  meters.forEach((meter, idx) => {
    const bar = meter.querySelector("i");
    if (!bar) {
      console.warn(`[meters:${idx}] .meter has no <i> child — skipping`);
      return;
    }

    // 1) try dataset.width
    let target = bar.dataset && bar.dataset.width ? bar.dataset.width.trim() : null;

    // 2) try inline style attribute
    if (!target) {
      const styleAttr = bar.getAttribute("style") || "";
      const m = styleAttr.match(/width\s*:\s*([^;]+)/i);
      if (m && m[1]) {
        target = m[1].trim();
      }
    }

    // 3) try data-target-width attribute (older naming)
    if (!target && bar.hasAttribute("data-target-width")) {
      target = bar.getAttribute("data-target-width").trim();
    }

    // 4) if still not found, try computed pixel width -> convert to percent of meter
    if (!target) {
      try {
        const computedBar = window.getComputedStyle(bar);
        const computedMeter = window.getComputedStyle(meter);
        const meterW = meter.getBoundingClientRect().width || parseFloat(computedMeter.width) || null;
        const barW = bar.getBoundingClientRect().width || parseFloat(computedBar.width) || null;

        if (meterW && barW) {
          const pct = Math.round((barW / meterW) * 100);
          target = pct + "%";
          console.log(`[meters:${idx}] derived target from computed px -> ${target}`);
        }
      } catch (e) {
        /* ignore */
      }
    }

    // 5) normalize numeric-only (e.g., "92" -> "92%")
    if (target && /^[0-9.]+$/.test(target)) target = target + "%";

    // 6) final fallback
    if (!target) {
      target = "75%";
      console.warn(`[meters:${idx}] no width found; falling back to ${target}`);
    }

    // Validate final target (must be percent)
    const pctMatch = target.match(/^([0-9.]+)\s*%$/);
    if (!pctMatch) {
      console.warn(`[meters:${idx}] target "${target}" not a percent — forcing fallback 75%`);
      target = "75%";
    }

    // Force start state
    bar.style.width = "0%";
    // Ensure transition exists (in case CSS missing)
    if (!bar.style.transition) bar.style.transition = "width 0.9s cubic-bezier(.2,.9,.2,1)";

    // Stagger and animate
    const delay = idx * 110 + 120;
    setTimeout(() => {
      requestAnimationFrame(() => {
        bar.style.width = target;
        console.log(`[meters:${idx}] animated -> ${target}`);
      });
    }, delay);
  });

  console.groupEnd();
});
