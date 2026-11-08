import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { sceneProgress } from "./motion";

export function useMediaQuery(media) {
  const [matches, setMatches] = useState(
    () => window.matchMedia(media).matches,
  );
  useEffect(() => {
    const query = window.matchMedia(media);
    const update = () => setMatches(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [media]);
  return matches;
}

export const useReducedMotion = () =>
  useMediaQuery("(prefers-reduced-motion: reduce)");

export function useElementSize() {
  const ref = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const measure = () => {
      const next = { width: node.clientWidth, height: node.clientHeight };
      setSize((previous) =>
        previous.width === next.width && previous.height === next.height
          ? previous
          : next,
      );
    };
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    measure();
    return () => observer.disconnect();
  }, []);
  return [ref, size];
}

export function useScene() {
  const ref = useRef(null);
  const [progress, setProgress] = useState(0);
  const reducedMotion = useReducedMotion();
  const shortViewport = useMediaQuery("(max-height: 600px)");
  const reduced = reducedMotion || shortViewport;
  useEffect(() => {
    const node = ref.current;
    if (!node || reduced) return;
    let frame = 0;
    let active = true;
    const update = () => {
      frame = 0;
      if (!active) return;
      const rect = node.getBoundingClientRect();
      const sticky = node.querySelector(".scene-sticky");
      const p = sceneProgress(
        rect.top,
        rect.height,
        sticky?.getBoundingClientRect().height || window.innerHeight,
      );
      setProgress((previous) =>
        Math.abs(previous - p) > 0.0003 ? p : previous,
      );
    };
    const onScroll = () => {
      if (active && !frame) frame = requestAnimationFrame(update);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        active = entry.isIntersecting;
        if (active) onScroll();
        else {
          const rect = node.getBoundingClientRect();
          setProgress(rect.top < 0 ? 1 : 0);
        }
      },
      { rootMargin: "100px" },
    );
    observer.observe(node);
    const resize = new ResizeObserver(onScroll);
    resize.observe(node);
    if (node.querySelector(".scene-sticky"))
      resize.observe(node.querySelector(".scene-sticky"));
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.visualViewport?.addEventListener("resize", onScroll);
    update();
    return () => {
      observer.disconnect();
      resize.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.visualViewport?.removeEventListener("resize", onScroll);
    };
  }, [reduced]);
  return { ref, progress: reduced ? 1 : progress, reduced };
}

export function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    document
      .querySelectorAll("[data-reveal]")
      .forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);
}

export function useResponsiveScrollAnchor() {
  useEffect(() => {
    let viewport = { width: innerWidth, height: innerHeight };
    let anchor = null,
      restoring = false,
      scrollFrame = 0,
      resizeFrame = 0,
      settleFrame = 0;
    const remembered = new Map();
    const capture = () => {
      scrollFrame = 0;
      if (
        restoring ||
        innerWidth !== viewport.width ||
        innerHeight !== viewport.height ||
        document.querySelector("dialog[open]")
      )
        return;
      const hit = document.elementFromPoint(
        innerWidth / 2,
        Math.min(180, innerHeight * 0.38),
      );
      const section = hit?.closest("section[id]");
      if (!section) return;
      const r = section.getBoundingClientRect(),
        sticky = section.querySelector(".scene-sticky");
      const scene = section.classList.contains("scroll-scene");
      const pinned = scene && !section.classList.contains("reduced-scene");
      let progress = pinned
        ? sceneProgress(r.top, r.height, sticky.getBoundingClientRect().height)
        : remembered.get(section.id) || 1;
      if (pinned) remembered.set(section.id, progress);
      else if (scene && section.id === "destino") {
        const panel = hit.closest(".map-panel");
        if (panel?.classList.contains("vienna-static")) progress = 0.98;
        if (panel?.classList.contains("europe-static")) progress = 0.56;
      } else if (scene) progress = 1;
      anchor = {
        id: section.id,
        scene,
        pinned,
        progress,
        fraction: -r.top / Math.max(1, r.height),
      };
    };
    const onScroll = () => {
      if (!scrollFrame && !restoring)
        scrollFrame = requestAnimationFrame(capture);
    };
    const onResize = (force = false) => {
      const next = { width: innerWidth, height: innerHeight };
      const substantial =
        force === true ||
        next.width !== viewport.width ||
        Math.abs(next.height - viewport.height) > 80 ||
        next.height <= 600 !== viewport.height <= 600;
      viewport = next;
      if (!substantial || !anchor || document.querySelector("dialog[open]")) {
        onScroll();
        return;
      }
      const saved = anchor;
      restoring = true;
      cancelAnimationFrame(resizeFrame);
      cancelAnimationFrame(settleFrame);
      resizeFrame = requestAnimationFrame(() => {
        resizeFrame = requestAnimationFrame(() => {
          const section = document.getElementById(saved.id);
          if (section) {
            const r = section.getBoundingClientRect(),
              top = r.top + scrollY;
            const staticNow = section.classList.contains("reduced-scene");
            let target = top + saved.fraction * r.height;
            if (saved.scene && !staticNow) {
              target =
                top +
                saved.progress *
                  (r.height -
                    section
                      .querySelector(".scene-sticky")
                      .getBoundingClientRect().height);
            } else if (saved.scene && staticNow) {
              const panel =
                saved.id === "destino"
                  ? section.querySelector(
                      saved.progress >= 0.65
                        ? ".vienna-static"
                        : ".europe-static",
                    )
                  : null;
              target = panel
                ? panel.getBoundingClientRect().top + scrollY - 85
                : top;
            }
            window.scrollTo({ top: Math.max(0, target), behavior: "instant" });
          }
          settleFrame = requestAnimationFrame(() => {
            restoring = false;
            capture();
          });
        });
      });
    };
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotionChange = () => onResize(true);
    capture();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    motion.addEventListener("change", onMotionChange);
    return () => {
      cancelAnimationFrame(scrollFrame);
      cancelAnimationFrame(resizeFrame);
      cancelAnimationFrame(settleFrame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      motion.removeEventListener("change", onMotionChange);
    };
  }, []);
}
