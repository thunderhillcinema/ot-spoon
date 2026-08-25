import { useEffect, useRef } from "react";
import videojs from "video.js";
import type Player from "video.js/dist/types/player";
import "video.js/dist/video-js.css";

// Make the preview cover the hero box (video.js defaults to letterboxed contain).
if (typeof document !== "undefined" && !document.getElementById("thc-hero-preview-css")) {
  const s = document.createElement("style");
  s.id = "thc-hero-preview-css";
  s.textContent = `.vjs-hero-preview, .vjs-hero-preview video { width:100%!important; height:100%!important; object-fit:cover!important; }`;
  document.head.appendChild(s);
}

// Web-only muted autoplay HLS preview for the hero backdrop (Netflix-style). Mirrors
// the app's working web player (VideoView.web): video.js owns a dynamically-created
// <video-js> element inside a container div — mounting a static React <video> and
// calling videojs() on it fails to initialize reliably. No controls, looped, muted.
export const HeroPreviewPlayer = ({ src }: { src: string }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<Player | null>(null);

  useEffect(() => {
    if (playerRef.current || !containerRef.current) return;

    const el = document.createElement("video-js");
    el.classList.add("vjs-hero-preview");
    containerRef.current.appendChild(el);

    const player = (playerRef.current = videojs(
      el,
      {
        autoplay: "muted",
        muted: true,
        controls: false,
        loop: true,
        preload: "auto",
        fill: true,
        sources: [{ src, type: "application/x-mpegURL" }],
      },
      () => {
        // Force play — browsers allow muted autoplay, but be explicit.
        const p = player.play();
        if (p && typeof p.catch === "function") p.catch(() => {});
      },
    ));

    return () => {
      if (player && !player.isDisposed()) player.dispose();
      playerRef.current = null;
    };
  }, []);

  // Update the source when it changes without recreating the player.
  useEffect(() => {
    if (playerRef.current && src) {
      playerRef.current.src({ src, type: "application/x-mpegURL" });
      const p = playerRef.current.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    }
  }, [src]);

  return <div ref={containerRef} style={{ position: "absolute", inset: 0, overflow: "hidden" }} />;
};
